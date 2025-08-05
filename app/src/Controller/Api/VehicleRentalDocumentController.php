<?php

namespace App\Controller\Api;

use App\Entity\Document;
use App\Entity\VehicleRental;
use App\Entity\TempDocument;
use App\Repository\DocumentRepository;
use App\Repository\VehicleRentalRepository;
use App\Repository\TempDocumentRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class VehicleRentalDocumentController extends AbstractController
{
    private $documentRepository;
    private $vehicleRentalRepository;
    private $tempDocumentRepository;
    private $entityManager;
    private $notificationService;

    public function __construct(
        DocumentRepository $documentRepository,
        VehicleRentalRepository $vehicleRentalRepository,
        TempDocumentRepository $tempDocumentRepository,
        EntityManagerInterface $entityManager,
        NotificationService $notificationService
    ) {
        $this->documentRepository = $documentRepository;
        $this->vehicleRentalRepository = $vehicleRentalRepository;
        $this->tempDocumentRepository = $tempDocumentRepository;
        $this->entityManager = $entityManager;
        $this->notificationService = $notificationService;
    }

    /**
     * Upload temporaire de document pour réservation de véhicule
     */
    public function tempUpload(Request $request): JsonResponse
    {
        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');
        $title = $request->request->get('title');
        $vehicleRentalId = $request->request->get('vehicleRentalId');

        // Validation du fichier
        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier téléchargé'], 400);
        }

        // Vérifier si le fichier est valide avant toute manipulation
        if (!$uploadedFile->isValid()) {
            return $this->json(['message' => 'Fichier invalide ou corrompu'], 400);
        }

        // Vérifier que la réservation existe
        $vehicleRental = $this->vehicleRentalRepository->find($vehicleRentalId);
        if (!$vehicleRental) {
            return $this->json(['message' => 'Réservation de véhicule non trouvée'], 404);
        }

        // Stocker les informations avant que le fichier temporaire soit déplacé
        $originalName = $uploadedFile->getClientOriginalName();
        $fileSize = $uploadedFile->getSize();
        $mimeType = $uploadedFile->getMimeType();
        
        // Détecter l'extension depuis le nom du fichier original
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        
        $allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'];
        if (!in_array($extension, $allowedExtensions)) {
            return $this->json(['message' => 'Type de fichier non autorisé'], 400);
        }

        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($fileSize > $maxSize) {
            return $this->json(['message' => 'Fichier trop volumineux (max 10MB)'], 400);
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
        $tempDocument->setCategory('vehicle_rental'); // Catégorie spécifique aux réservations véhicules
        $tempDocument->setFileName($tempFileName);
        $tempDocument->setOriginalName($originalName);
        $tempDocument->setUploadedBy($vehicleRental->getId()); // Utiliser l'ID de la réservation temporairement
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
     * Finaliser l'upload des documents pour une réservation de véhicule
     */
    public function finalizeDocuments(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $tempIds = $data['tempIds'] ?? [];
        $vehicleRentalId = $data['vehicleRentalId'];

        if (empty($tempIds)) {
            return $this->json(['message' => 'Aucun document temporaire fourni'], 400);
        }

        // Récupérer les documents temporaires
        $tempDocuments = $this->tempDocumentRepository->findByTempIds($tempIds);

        if (empty($tempDocuments)) {
            return $this->json(['message' => 'Aucun document temporaire trouvé'], 404);
        }

        // Récupérer la réservation de véhicule
        $vehicleRental = $this->vehicleRentalRepository->find($vehicleRentalId);
        if (!$vehicleRental) {
            return $this->json(['message' => 'Réservation de véhicule non trouvée'], 404);
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
            $document->setCategory('vehicle_rental');
            $document->setUploadedBy(null); // Pas d'utilisateur connecté pour le tracking public

            // Générer un nom final unique
            $finalFileName = uniqid() . '_' . $tempDoc->getOriginalName();
            
            // Déplacer le fichier du dossier temp vers le dossier final
            $tempPath = $tempDir . $tempDoc->getFileName();
            $finalPath = $finalDir . $finalFileName;
            
            if (file_exists($tempPath)) {
                rename($tempPath, $finalPath);
                $document->setFileName($finalFileName);

                // Associer à la réservation de véhicule
                $document->setVehicleRental($vehicleRental);

                $this->entityManager->persist($document);
                $finalizedDocuments[] = $document;
            }
        }

        // Sauvegarder les nouveaux documents
        $this->entityManager->flush();

        // Notification email - document ajouté à la réservation
        if (!empty($finalizedDocuments)) {
            try {
                $this->notificationService->notifyVehicleRentalDocumentsAdded($vehicleRental, $finalizedDocuments);
            } catch (\Exception $e) {
                // Log l'erreur mais ne pas faire échouer l'upload
                error_log('Erreur envoi email documents véhicule: ' . $e->getMessage());
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
     * Récupérer les documents d'une réservation de véhicule
     */
    public function getDocumentsByRental(int $vehicleRentalId): JsonResponse
    {
        $vehicleRental = $this->vehicleRentalRepository->find($vehicleRentalId);
        if (!$vehicleRental) {
            return $this->json(['message' => 'Réservation de véhicule non trouvée'], 404);
        }

        $documents = $this->documentRepository->findBy(['vehicleRental' => $vehicleRental]);

        $documentsData = array_map(function($doc) {
            return [
                'id' => $doc->getId(),
                'title' => $doc->getTitle(),
                'fileName' => $doc->getFileName(),
                'fileType' => $doc->getType(),
                'fileSize' => $this->formatFileSize($doc->getFile() ? $doc->getFile()->getSize() : 0),
                'uploadedAt' => $doc->getUploadedAt()->format('Y-m-d H:i:s'),
                'downloadUrl' => '/api/vehicle-rental-documents/download/' . $doc->getId()
            ];
        }, $documents);

        return $this->json($documentsData);
    }

    /**
     * Supprimer un document de réservation de véhicule
     */
    public function deleteDocument(int $id): JsonResponse
    {
        $document = $this->documentRepository->find($id);
        if (!$document) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }

        // Vérifier que c'est bien un document de réservation de véhicule
        if (!$document->getVehicleRental()) {
            return $this->json(['message' => 'Ce document n\'est pas associé à une réservation de véhicule'], 400);
        }

        // Supprimer le fichier physique
        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/documents/' . $document->getFileName();
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Supprimer l'entité de la BDD
        $this->entityManager->remove($document);
        $this->entityManager->flush();

        return $this->json(['message' => 'Document supprimé avec succès']);
    }

    /**
     * Télécharger un document
     */
    public function downloadDocument(int $id): Response
    {
        $document = $this->documentRepository->find($id);
        if (!$document) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }

        // Vérifier que c'est bien un document de réservation de véhicule
        if (!$document->getVehicleRental()) {
            return $this->json(['message' => 'Ce document n\'est pas associé à une réservation de véhicule'], 400);
        }

        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/documents/' . $document->getFileName();
        
        if (!file_exists($filePath)) {
            return $this->json(['message' => 'Fichier non trouvé'], 404);
        }

        return $this->file($filePath, $document->getTitle() . '.' . $document->getType());
    }

    /**
     * Formater la taille de fichier
     */
    private function formatFileSize(int $size): string
    {
        if ($size === 0) return '0 B';
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = floor(log($size, 1024));
        return round($size / pow(1024, $power), 2) . ' ' . $units[$power];
    }
}