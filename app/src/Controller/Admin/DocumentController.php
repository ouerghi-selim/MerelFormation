<?php

namespace App\Controller\Admin;

use App\Entity\Document;
use App\Entity\Formation;
use App\Entity\Session;
use App\Entity\TempDocument;
use App\Repository\DocumentRepository;
use App\Repository\FormationRepository;
use App\Repository\SessionRepository;
use App\Repository\TempDocumentRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * @Route("/api/admin/documents", name="api_admin_documents_")
 */
class DocumentController extends AbstractController
{
    private $security;
    private $documentRepository;
    private $formationRepository;
    private $sessionRepository;
    private $tempDocumentRepository;
    private $entityManager;
    private $notificationService;

    public function __construct(
        Security $security,
        DocumentRepository $documentRepository,
        FormationRepository $formationRepository,
        SessionRepository $sessionRepository,
        TempDocumentRepository $tempDocumentRepository,
        EntityManagerInterface $entityManager,
        NotificationService $notificationService
    ) {
        $this->security = $security;
        $this->documentRepository = $documentRepository;
        $this->formationRepository = $formationRepository;
        $this->sessionRepository = $sessionRepository;
        $this->tempDocumentRepository = $tempDocumentRepository;
        $this->entityManager = $entityManager;
        $this->notificationService = $notificationService;
    }

    /**
     * Upload temporaire de document
     * @Route("/temp-upload", name="temp_upload", methods={"POST"})
     */
    public function tempUpload(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');
        $title = $request->request->get('title');
        $category = $request->request->get('category', 'support');

        // Validation du fichier
        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier téléchargé'], 400);
        }

        // Vérifier si le fichier est valide avant toute manipulation
        if (!$uploadedFile->isValid()) {
            return $this->json(['message' => 'Fichier invalide ou corrompu'], 400);
        }

        // Stocker les informations avant que le fichier temporaire soit déplacé
        $originalName = $uploadedFile->getClientOriginalName();
        $fileSize = $uploadedFile->getSize();
        $mimeType = $uploadedFile->getMimeType();
        
        // Détecter l'extension depuis le nom du fichier original
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        
        $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        if (!in_array($extension, $allowedExtensions)) {
            return $this->json(['message' => 'Type de fichier non autorisé'], 400);
        }

        $maxSize = 4 * 1024 * 1024; // 4MB
        if ($fileSize > $maxSize) {
            return $this->json(['message' => 'Fichier trop volumineux (max 4MB)'], 400);
        }

        // Générer un ID unique et un nom de fichier
        $tempId = uniqid();
        $tempFileName = $tempId . '_' . $originalName;

        // Stocker dans un dossier temporaire
        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';

        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        // Déplacer le fichier vers le dossier temporaire
        try {
            $uploadedFile->move($tempDir, $tempFileName);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur lors du déplacement du fichier: ' . $e->getMessage()], 500);
        }

        // Créer l'entité TempDocument en BDD
        $tempDocument = new TempDocument();
        $tempDocument->setTempId($tempId);
        $tempDocument->setTitle($title ?: $originalName);
        $tempDocument->setType($extension);
        $tempDocument->setCategory($category);
        $tempDocument->setFileName($tempFileName);
        $tempDocument->setOriginalName($originalName);
        $tempDocument->setUploadedBy($this->getUser()->getId());
        $tempDocument->setFileSize($fileSize);

        $this->entityManager->persist($tempDocument);
        $this->entityManager->flush();

        return $this->json([
            'tempId' => $tempId,
            'document' => [
                'title' => $tempDocument->getTitle(),
                'type' => $tempDocument->getType(),
                'category' => $tempDocument->getCategory(),
                'fileName' => $tempDocument->getFileName(),
                'originalName' => $tempDocument->getOriginalName(),
                'size' => $tempDocument->getFileSize()
            ]
        ], 201);
    }

    /**
     * Supprimer un document temporaire
     * @Route("/temp/{tempId}", name="temp_delete", methods={"DELETE"})
     */
    public function deleteTempDocument(string $tempId, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer le document temporaire
        $tempDocument = $this->tempDocumentRepository->findOneBy(['tempId' => $tempId]);
        
        if (!$tempDocument) {
            return $this->json(['message' => 'Document temporaire non trouvé'], 404);
        }

        // Supprimer le fichier physique
        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';
        $filePath = $tempDir . $tempDocument->getFileName();
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Supprimer l'entité de la BDD
        $this->entityManager->remove($tempDocument);
        $this->entityManager->flush();

        return $this->json(['message' => 'Document temporaire supprimé']);
    }

    /**
     * Finaliser l'upload des documents (appelé lors de la sauvegarde de formation/session)
     * @Route("/finalize", name="finalize", methods={"POST"})
     */
    public function finalizeDocuments(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $tempIds = $data['tempIds'] ?? [];
        $entityType = $data['entityType']; // 'formation' ou 'session'
        $entityId = $data['entityId'];

        if (empty($tempIds)) {
            return $this->json(['message' => 'Aucun document temporaire fourni'], 400);
        }

        // Récupérer les documents temporaires
        $tempDocuments = $this->tempDocumentRepository->findByTempIds($tempIds);

        if (empty($tempDocuments)) {
            return $this->json(['message' => 'Aucun document temporaire trouvé'], 404);
        }

        // Récupérer l'entité parent
        $entity = null;
        if ($entityType === 'formation') {
            $entity = $this->formationRepository->find($entityId);
        } elseif ($entityType === 'session') {
            $entity = $this->sessionRepository->find($entityId);
        }

        if (!$entity) {
            return $this->json(['message' => 'Entité parent non trouvée'], 404);
        }

        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';
        $finalDir = $this->getParameter('kernel.project_dir') . '/public/uploads/documents/';
        
        if (!is_dir($finalDir)) {
            mkdir($finalDir, 0755, true);
        }

        $finalizedDocuments = [];

        foreach ($tempDocuments as $tempDoc) {
            // Créer l'entité Document définitive
            $document = new Document();
            $document->setTitle($tempDoc->getTitle());
            $document->setType($tempDoc->getType());
            $document->setCategory($tempDoc->getCategory());
            $document->setUploadedBy($this->getUser());

            // Générer un nom final unique
            $finalFileName = uniqid() . '_' . $tempDoc->getOriginalName();
            
            // Déplacer le fichier du dossier temp vers le dossier final
            $tempPath = $tempDir . $tempDoc->getFileName();
            $finalPath = $finalDir . $finalFileName;
            
            if (file_exists($tempPath)) {
                rename($tempPath, $finalPath);
                $document->setFileName($finalFileName);

                // Associer à l'entité parent
                if ($entityType === 'formation') {
                    $document->setFormation($entity);
                } elseif ($entityType === 'session') {
                    $document->setSession($entity);
                }

                $this->entityManager->persist($document);
                $finalizedDocuments[] = $document;
            }
        }

        // Sauvegarder les nouveaux documents
        $this->entityManager->flush();

        // Notification email groupée pour tous les documents ajoutés
        if (!empty($finalizedDocuments)) {
            if ($entityType === 'formation') {
                $this->notificationService->notifyDocumentsAdded($finalizedDocuments, $entity, null, $this->getUser());
            } elseif ($entityType === 'session') {
                $this->notificationService->notifyDocumentsAdded($finalizedDocuments, $entity->getFormation(), $entity, $this->getUser());
            }
        }

        // Supprimer les documents temporaires
        $this->tempDocumentRepository->deleteByTempIds($tempIds);

        return $this->json([
            'message' => 'Documents finalisés avec succès',
            'documents' => array_map(function($doc) {
                return [
                    'id' => $doc->getId(),
                    'title' => $doc->getTitle(),
                    'type' => $doc->getType(),
                    'category' => $doc->getCategory(),
                    'fileName' => $doc->getFileName()
                ];
            }, $finalizedDocuments)
        ]);
    }

    /**
     * Nettoyer les fichiers temporaires anciens (à appeler périodiquement)
     * @Route("/cleanup-temp", name="cleanup_temp", methods={"POST"})
     */
    public function cleanupTempFiles(): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Supprimer les documents temporaires anciens (> 24h) de la BDD
        $deletedCount = $this->tempDocumentRepository->cleanupOldTempDocuments();

        // Nettoyer les fichiers orphelins sur le disque
        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';
        $orphanFilesCount = 0;

        if (is_dir($tempDir)) {
            $files = glob($tempDir . '*');
            $maxAge = 24 * 60 * 60; // 24 heures

            foreach ($files as $file) {
                if (is_file($file) && (time() - filemtime($file)) > $maxAge) {
                    unlink($file);
                    $orphanFilesCount++;
                }
            }
        }

        return $this->json([
            'message' => "Nettoyage terminé. {$deletedCount} documents temporaires et {$orphanFilesCount} fichiers orphelins supprimés."
        ]);
    }
}