<?php

namespace App\Controller\Student;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\DocumentRepository;
use App\Entity\Reservation;

/**
 * @Route("/api/student/documents", name="api_student_documents_")
 */
class DocumentStudentController extends AbstractController
{
    private $security;
    private $documentRepository;

    public function __construct(
        Security $security,
        DocumentRepository $documentRepository
    ) {
        $this->security = $security;
        $this->documentRepository = $documentRepository;
    }

    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Paramètres de filtrage
        $source = $request->query->get('source'); // 'formation' ou 'session'
        $formationId = $request->query->get('formationId');
        $sessionId = $request->query->get('sessionId');

        // Récupérer les réservations confirmées de l'utilisateur pour obtenir ses formations/sessions
        $reservations = $this->getDoctrine()->getRepository(Reservation::class)
            ->findBy(['user' => $user, 'status' => 'confirmed']);

        $formationIds = [];
        $sessionIds = [];
        
        foreach ($reservations as $reservation) {
            $session = $reservation->getSession();
            if ($session) {
                $sessionIds[] = $session->getId();
                $formationIds[] = $session->getFormation()->getId();
            }
        }

        // Supprimer les doublons
        $formationIds = array_unique($formationIds);
        $sessionIds = array_unique($sessionIds);

        $documents = [];

        // Documents de formations si pas de filtre spécifique aux sessions
        if (!$source || $source === 'formation') {
            $formationDocuments = $this->documentRepository->findByFormations($formationIds, $formationId);
            
            foreach ($formationDocuments as $document) {
                $formation = $document->getFormation();
                $documents[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'source' => 'formation',
                    'sourceTitle' => $formation ? $formation->getTitle() : 'Formation inconnue',
                    'sourceId' => $formation ? $formation->getId() : null,
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'fileName' => $document->getFileName(),
                    'downloadUrl' => '/api/student/documents/' . $document->getId() . '/download'
                ];
            }
        }

        // Documents de sessions si pas de filtre spécifique aux formations
        if (!$source || $source === 'session') {
            $sessionDocuments = $this->documentRepository->findBySessions($sessionIds, $sessionId);
            
            foreach ($sessionDocuments as $document) {
                $session = $document->getSession();
                $formation = $session ? $session->getFormation() : null;
                $documents[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'source' => 'session',
                    'sourceTitle' => $session ? 
                        ($formation->getTitle() . ' - Session du ' . $session->getStartDate()->format('d/m/Y')) : 
                        'Session inconnue',
                    'sourceId' => $session ? $session->getId() : null,
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'fileName' => $document->getFileName(),
                    'downloadUrl' => '/api/student/documents/' . $document->getId() . '/download'
                ];
            }
        }

        // Trier par date de téléchargement (plus récent en premier)
        usort($documents, function($a, $b) {
            return strtotime($b['uploadedAt']) - strtotime($a['uploadedAt']);
        });

        return $this->json($documents);
    }

    /**
     * @Route("/{id}", name="get", methods={"GET"})
     */
    public function get(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer le document
        $document = $this->documentRepository->find($id);
        
        if (!$document) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }

        // Vérifier que l'utilisateur a accès à ce document
        if (!$this->userHasAccessToDocument($user, $document)) {
            return $this->json(['message' => 'Vous n\'avez pas accès à ce document'], 403);
        }

        $source = 'unknown';
        $sourceTitle = 'Source inconnue';
        $sourceId = null;

        if ($document->getFormation()) {
            $source = 'formation';
            $sourceTitle = $document->getFormation()->getTitle();
            $sourceId = $document->getFormation()->getId();
        } elseif ($document->getSession()) {
            $source = 'session';
            $session = $document->getSession();
            $formation = $session->getFormation();
            $sourceTitle = $formation->getTitle() . ' - Session du ' . $session->getStartDate()->format('d/m/Y');
            $sourceId = $session->getId();
        }
        
        // Formater les données pour le frontend
        $formattedDocument = [
            'id' => $document->getId(),
            'title' => $document->getTitle(),
            'type' => $document->getType(),
            'category' => $document->getCategory(),
            'source' => $source,
            'sourceTitle' => $sourceTitle,
            'sourceId' => $sourceId,
            'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
            'fileName' => $document->getFileName(),
            'downloadUrl' => '/api/student/documents/' . $document->getId() . '/download'
        ];

        return $this->json($formattedDocument);
    }

    /**
     * @Route("/{id}/download", name="download", methods={"GET"})
     */
    public function download(int $id): Response
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer le document
        $document = $this->documentRepository->find($id);
        
        if (!$document) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }

        // Vérifier que l'utilisateur a accès à ce document
        if (!$this->userHasAccessToDocument($user, $document)) {
            return $this->json(['message' => 'Vous n\'avez pas accès à ce document'], 403);
        }

        // Récupérer le fichier
        $filePath = $this->getParameter('documents_directory') . '/' . $document->getFileName();
        
        // Vérifier que le fichier existe
        if (!file_exists($filePath)) {
            return $this->json(['message' => 'Fichier non trouvé'], 404);
        }

        // Retourner le fichier
        return $this->file($filePath, $document->getTitle(), ResponseHeaderBag::DISPOSITION_ATTACHMENT);
    }

    /**
     * Vérifier si l'utilisateur a accès au document
     */
    private function userHasAccessToDocument($user, $document): bool
    {
        // Récupérer les réservations confirmées de l'utilisateur
        $reservations = $this->getDoctrine()->getRepository(Reservation::class)
            ->findBy(['user' => $user, 'status' => 'confirmed']);

        $userFormationIds = [];
        $userSessionIds = [];
        
        foreach ($reservations as $reservation) {
            $session = $reservation->getSession();
            if ($session) {
                $userSessionIds[] = $session->getId();
                $userFormationIds[] = $session->getFormation()->getId();
            }
        }

        // Vérifier l'accès selon le type de document
        if ($document->getFormation()) {
            return in_array($document->getFormation()->getId(), $userFormationIds);
        }
        
        if ($document->getSession()) {
            return in_array($document->getSession()->getId(), $userSessionIds);
        }

        return false;
    }

    /**
     * Formate la taille du fichier en unités lisibles
     */
    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 1) . ' ' . $units[$pow];
    }
}