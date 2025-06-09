<?php

namespace App\Controller\Admin;

use App\Entity\Document;
use App\Entity\Formation;
use App\Entity\Session;
use App\Repository\DocumentRepository;
use App\Repository\FormationRepository;
use App\Repository\SessionRepository;
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
    private $entityManager;
    private $notificationService;

    public function __construct(
        Security $security,
        DocumentRepository $documentRepository,
        FormationRepository $formationRepository,
        SessionRepository $sessionRepository,
        EntityManagerInterface $entityManager,
        NotificationService $notificationService
    ) {
        $this->security = $security;
        $this->documentRepository = $documentRepository;
        $this->formationRepository = $formationRepository;
        $this->sessionRepository = $sessionRepository;
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

        $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        $extension = strtolower($uploadedFile->getClientOriginalExtension());
        
        if (!in_array($extension, $allowedExtensions)) {
            return $this->json(['message' => 'Type de fichier non autorisé'], 400);
        }

        $maxSize = 4 * 1024 * 1024; // 4MB
        if ($uploadedFile->getSize() > $maxSize) {
            return $this->json(['message' => 'Fichier trop volumineux (max 4MB)'], 400);
        }

        // Créer le document temporaire (pas encore persisté en BDD)
        $document = new Document();
        $document->setTitle($title ?: $uploadedFile->getClientOriginalName());
        $document->setType($extension);
        $document->setCategory($category);
        $document->setUploadedBy($this->getUser());

        // Générer un nom unique pour le fichier temporaire
        $tempFileName = uniqid() . '_' . $uploadedFile->getClientOriginalName();
        
        // Stocker dans un dossier temporaire
        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $uploadedFile->move($tempDir, $tempFileName);

        // Stocker les informations dans la session pour récupération ultérieure
        $tempId = uniqid();
        $session = $request->getSession();
        $tempDocuments = $session->get('temp_documents', []);
        $tempDocuments[$tempId] = [
            'title' => $document->getTitle(),
            'type' => $document->getType(),
            'category' => $document->getCategory(),
            'fileName' => $tempFileName,
            'originalName' => $uploadedFile->getClientOriginalName(),
            'uploadedBy' => $this->getUser()->getId(),
            'uploadedAt' => new \DateTime()
        ];
        $session->set('temp_documents', $tempDocuments);

        return $this->json([
            'tempId' => $tempId,
            'document' => [
                'title' => $document->getTitle(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'fileName' => $tempFileName,
                'originalName' => $uploadedFile->getClientOriginalName(),
                'size' => $uploadedFile->getSize()
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

        $session = $request->getSession();
        $tempDocuments = $session->get('temp_documents', []);

        if (!isset($tempDocuments[$tempId])) {
            return $this->json(['message' => 'Document temporaire non trouvé'], 404);
        }

        // Supprimer le fichier physique
        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';
        $filePath = $tempDir . $tempDocuments[$tempId]['fileName'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Supprimer de la session
        unset($tempDocuments[$tempId]);
        $session->set('temp_documents', $tempDocuments);

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

        $session = $request->getSession();
        $tempDocuments = $session->get('temp_documents', []);

        $finalizedDocuments = [];
        $entity = null;

        // Récupérer l'entité parent
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

        foreach ($tempIds as $tempId) {
            if (!isset($tempDocuments[$tempId])) {
                continue;
            }

            $tempDoc = $tempDocuments[$tempId];
            
            // Créer l'entité Document en BDD
            $document = new Document();
            $document->setTitle($tempDoc['title']);
            $document->setType($tempDoc['type']);
            $document->setCategory($tempDoc['category']);
            $document->setUploadedBy($this->getUser());

            // Générer un nom final unique
            $finalFileName = uniqid() . '_' . $tempDoc['originalName'];
            
            // Déplacer le fichier du dossier temp vers le dossier final
            $tempPath = $tempDir . $tempDoc['fileName'];
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

                // Notification email - Document ajouté
                if ($entityType === 'formation') {
                    $this->notificationService->notifyDocumentAdded($document, $entity);
                } elseif ($entityType === 'session') {
                    $this->notificationService->notifyDocumentAdded($document, $entity->getFormation(), $entity);
                }
            }

            // Supprimer de la session
            unset($tempDocuments[$tempId]);
        }

        $this->entityManager->flush();
        $session->set('temp_documents', $tempDocuments);

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

        $tempDir = $this->getParameter('kernel.project_dir') . '/public/uploads/temp/';
        $cleanedCount = 0;

        if (is_dir($tempDir)) {
            $files = glob($tempDir . '*');
            $maxAge = 24 * 60 * 60; // 24 heures

            foreach ($files as $file) {
                if (is_file($file) && (time() - filemtime($file)) > $maxAge) {
                    unlink($file);
                    $cleanedCount++;
                }
            }
        }

        return $this->json([
            'message' => "Nettoyage terminé. {$cleanedCount} fichiers supprimés."
        ]);
    }
}