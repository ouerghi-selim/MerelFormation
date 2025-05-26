<?php

namespace App\Controller\Student;

use App\Repository\ReservationRepository;
use App\Repository\SessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\DocumentRepository;
use App\Entity\Reservation;
use Vich\UploaderBundle\Handler\DownloadHandler;

/**
 * @Route("/api/student/documents", name="api_student_documents_")
 */
class DocumentStudentController extends AbstractController
{
    private $security;
    private $documentRepository;

    private $reservationRepository;
    private $sessionRepository;

    public function __construct(
        Security $security,
        DocumentRepository $documentRepository,
        ReservationRepository $reservationRepository,
        SessionRepository $sessionRepository
    ) {
        $this->security = $security;
        $this->documentRepository = $documentRepository;
        $this->reservationRepository = $reservationRepository;
        $this->sessionRepository = $sessionRepository;
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
        $source = $request->query->get('source'); // 'formation' | 'session'

        // Récupérer les réservations confirmées de l'utilisateur
        $sessions = $this->sessionRepository->findByParticipant($user->getId());

        $sessionIds = [];
        $formationIds = [];

        foreach ($sessions as $session) {
            if ($session) {
                $sessionIds[] = $session->getId();
                $formationIds[] = $session->getFormation()->getId();
            }
        }

        // Supprimer les doublons
        $formationIds = array_unique($formationIds);
        $sessionIds = array_unique($sessionIds);

        $documents = [];

        // Documents de formations (via les sessions auxquelles l'étudiant est inscrit)
        if (!$source || $source === 'formation') {
            foreach ($formationIds as $formationId) {
                $formationDocuments = $this->documentRepository->findBy(['formation' => $formationId]);

                foreach ($formationDocuments as $document) {
                    $formation = $document->getFormation();
                    $documents[] = [
                        'id' => $document->getId(),
                        'title' => $document->getTitle(),
                        'type' => $document->getType(),
                        'category' => $document->getCategory(),
                        'source' => 'formation',
                        'sourceTitle' => $formation ? $formation->getTitle() : 'Formation inconnue',
                        'sourceId' => $formation?->getId(),
                        'date' => $document->getUploadedAt()->format('d/m/Y'),
                        'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                        'fileName' => $document->getFileName(),
                        //'fileSize' => $this->formatFileSize($document->getFileSize() ?? 0),
                        'fileType' => $document->getType(),
                        'downloadUrl' => '/api/student/documents/' . $document->getId() . '/download'
                    ];
                }
            }
        }

        // Documents de sessions (directement des sessions auxquelles l'étudiant est inscrit)
        if (!$source || $source === 'session') {
            foreach ($sessionIds as $sessionId) {
                $sessionDocuments = $this->documentRepository->findBy(['session' => $sessionId]);

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
                        'sourceId' => $session?->getId(),
                        'date' => $document->getUploadedAt()->format('d/m/Y'),
                        'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                        'fileName' => $document->getFileName(),
                        //'fileSize' => $this->formatFileSize($document->getFileSize() ?? 0),
                        'fileType' => $document->getType(),
                        'downloadUrl' => '/api/student/documents/' . $document->getId() . '/download'
                    ];
                }
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
    public function download(int $id, DownloadHandler $downloadHandler): Response
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }
        // Récupérer le document
        $document = $this->documentRepository->find($id);
        if (!$document) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }
        // ... vérifications d'accès

        // VichUploader gère TOUT automatiquement !
        return $downloadHandler->downloadObject($document, 'file');
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