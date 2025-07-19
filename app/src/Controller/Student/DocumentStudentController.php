<?php

namespace App\Controller\Student;

use App\Entity\Document;
use App\Repository\ReservationRepository;
use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
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
    private $entityManager;

    public function __construct(
        Security $security,
        DocumentRepository $documentRepository,
        ReservationRepository $reservationRepository,
        SessionRepository $sessionRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->documentRepository = $documentRepository;
        $this->reservationRepository = $reservationRepository;
        $this->sessionRepository = $sessionRepository;
        $this->entityManager = $entityManager;
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
                        'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                        'validationStatus' => $document->getValidationStatus(),
                        'validatedAt' => $document->getValidatedAt()?->format('Y-m-d H:i:s'),
                        'validatedBy' => $document->getValidatedBy() ? [
                            'firstName' => $document->getValidatedBy()->getFirstName(),
                            'lastName' => $document->getValidatedBy()->getLastName()
                        ] : null,
                        'rejectionReason' => $document->getRejectionReason()
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
                        'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                        'validationStatus' => $document->getValidationStatus(),
                        'validatedAt' => $document->getValidatedAt()?->format('Y-m-d H:i:s'),
                        'validatedBy' => $document->getValidatedBy() ? [
                            'firstName' => $document->getValidatedBy()->getFirstName(),
                            'lastName' => $document->getValidatedBy()->getLastName()
                        ] : null,
                        'rejectionReason' => $document->getRejectionReason()
                    ];
                }
            }
        }

        // 🆕 Documents d'inscription uploadés par l'utilisateur
        if (!$source || $source === 'inscription') {
            $inscriptionDocuments = $this->documentRepository->findBy([
                'user' => $user,
                'category' => 'attestation',
                'uploadedBy' => $user // Documents uploadés par l'utilisateur lui-même
            ]);

            foreach ($inscriptionDocuments as $document) {
                $documents[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'source' => 'inscription',
                    'sourceTitle' => 'Document d\'inscription',
                    'sourceId' => null,
                    'date' => $document->getUploadedAt()->format('d/m/Y'),
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'fileName' => $document->getFileName(),
                    //'fileSize' => $this->formatFileSize($document->getFileSize() ?? 0),
                    'fileType' => $document->getType(),
                    'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                    'validationStatus' => $document->getValidationStatus(),
                    'validatedAt' => $document->getValidatedAt()?->format('Y-m-d H:i:s'),
                    'validatedBy' => $document->getValidatedBy() ? [
                        'firstName' => $document->getValidatedBy()->getFirstName(),
                        'lastName' => $document->getValidatedBy()->getLastName()
                    ] : null,
                    'rejectionReason' => $document->getRejectionReason(),
                    'senderRole' => 'Moi-même'
                ];
            }
        }

        // 🆕 Documents directs envoyés spécifiquement à cet étudiant
        if (!$source || $source === 'direct') {
            $directDocuments = $this->documentRepository->findBy([
                'user' => $user,
                'category' => 'direct'
            ]);

            foreach ($directDocuments as $document) {
                $sender = $document->getUploadedBy();
                $documents[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'source' => 'direct',
                    'sourceTitle' => $sender ? 
                        'Envoyé par ' . $sender->getFirstName() . ' ' . $sender->getLastName() :
                        'Expéditeur inconnu',
                    'sourceId' => null,
                    'date' => $document->getUploadedAt()->format('d/m/Y'),
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'fileName' => $document->getFileName(),
                    //'fileSize' => $this->formatFileSize($document->getFileSize() ?? 0),
                    'fileType' => $document->getType(),
                    'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                    'validationStatus' => $document->getValidationStatus(),
                    'validatedAt' => $document->getValidatedAt()?->format('Y-m-d H:i:s'),
                    'validatedBy' => $document->getValidatedBy() ? [
                        'firstName' => $document->getValidatedBy()->getFirstName(),
                        'lastName' => $document->getValidatedBy()->getLastName()
                    ] : null,
                    'rejectionReason' => $document->getRejectionReason(),
                    'senderRole' => $sender ? $this->getHighestRole($sender) : 'Inconnu'
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
            'downloadUrl' => '/uploads/documents/' . $document->getFileName()
        ];

        return $this->json($formattedDocument);
    }

    /**
     * Upload d'un document d'inscription par l'étudiant
     * @Route("/upload", name="upload", methods={"POST"})
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');
        $title = $request->request->get('title');
        $documentType = $request->request->get('documentType', 'other'); // Type de document

        // Validation du fichier
        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier téléchargé'], 400);
        }

        if (!$uploadedFile->isValid()) {
            return $this->json(['message' => 'Fichier invalide ou corrompu'], 400);
        }

        // Validation du titre
        if (empty($title)) {
            return $this->json(['message' => 'Le titre du document est requis'], 400);
        }

        // Stocker les informations du fichier
        $originalName = $uploadedFile->getClientOriginalName();
        $fileSize = $uploadedFile->getSize();
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        
        // Types de fichiers autorisés
        $allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'];
        if (!in_array($extension, $allowedExtensions)) {
            return $this->json(['message' => 'Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX'], 400);
        }

        // Taille maximale (10MB pour les étudiants)
        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($fileSize > $maxSize) {
            return $this->json(['message' => 'Fichier trop volumineux (maximum 10MB)'], 400);
        }

        try {
            // Créer l'entité Document directement (sans système temporaire pour les étudiants)
            $document = new Document();
            $document->setTitle($title);
            $document->setType($extension);
            $document->setCategory('attestation'); // Catégorie pour documents d'inscription
            $document->setUser($user);             // Propriétaire
            $document->setUploadedBy($user);       // Uploadé par lui-même
            $document->setPrivate(true);           // Document privé
            $document->setFile($uploadedFile);     // VichUploader gérera l'upload

            // Sauvegarder en base
            $this->entityManager->persist($document);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Document uploadé avec succès',
                'document' => [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'fileName' => $document->getFileName(),
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'downloadUrl' => '/uploads/documents/' . $document->getFileName()
                ]
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de l\'upload du document',
                'error' => $e->getMessage()
            ], 500);
        }
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
        
        // Vérifier que l'utilisateur a accès à ce document
        if (!$this->userHasAccessToDocument($user, $document)) {
            return $this->json(['message' => 'Vous n\'avez pas accès à ce document'], 403);
        }

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

        // 🆕 Vérifier l'accès aux documents directs
        if ($document->getCategory() === 'direct') {
            return $document->getUser() === $user;
        }

        // 🆕 Vérifier l'accès aux documents d'inscription
        if ($document->getCategory() === 'attestation' && $document->getUploadedBy() === $user) {
            return $document->getUser() === $user;
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

    /**
     * Get the highest role for display purposes
     */
    private function getHighestRole($user): string
    {
        $roles = $user->getRoles();
        
        if (in_array('ROLE_ADMIN', $roles)) {
            return 'Administrateur';
        } elseif (in_array('ROLE_INSTRUCTOR', $roles)) {
            return 'Formateur';
        } elseif (in_array('ROLE_STUDENT', $roles)) {
            return 'Étudiant';
        }
        
        return 'Utilisateur';
    }
}