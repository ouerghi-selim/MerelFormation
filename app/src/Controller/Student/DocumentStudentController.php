<?php

namespace App\Controller\Student;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\DocumentRepository;

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
    public function list(): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer les documents de l'étudiant
        $documents = $this->documentRepository->findByUser($user->getId());
        
        // Formater les données pour le frontend
        $formattedDocuments = [];
        foreach ($documents as $document) {
            $formation = $document->getFormation();
            $formattedDocuments[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'type' => $document->getType(),
                'formationTitle' => $formation ? $formation->getTitle() : null,
                'date' => $document->getCreatedAt()->format('d/m/Y'),
                'downloadUrl' => '/documents/' . $document->getId(),
                'fileSize' => $this->formatFileSize($document->getSize()),
                'fileType' => $document->getFileType()
            ];
        }

        return $this->json($formattedDocuments);
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
        if (!$this->documentRepository->userHasAccess($user->getId(), $id)) {
            return $this->json(['message' => 'Vous n\'avez pas accès à ce document'], 403);
        }

        $formation = $document->getFormation();
        
        // Formater les données pour le frontend
        $formattedDocument = [
            'id' => $document->getId(),
            'title' => $document->getTitle(),
            'type' => $document->getType(),
            'formationTitle' => $formation ? $formation->getTitle() : null,
            'date' => $document->getCreatedAt()->format('d/m/Y'),
            'downloadUrl' => '/documents/' . $document->getId(),
            'fileSize' => $this->formatFileSize($document->getSize()),
            'fileType' => $document->getFileType(),
            'content' => $document->getContent()
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
        if (!$this->documentRepository->userHasAccess($user->getId(), $id)) {
            return $this->json(['message' => 'Vous n\'avez pas accès à ce document'], 403);
        }

        // Récupérer le fichier
        $filePath = $this->getParameter('documents_directory') . '/' . $document->getFilename();
        
        // Vérifier que le fichier existe
        if (!file_exists($filePath)) {
            return $this->json(['message' => 'Fichier non trouvé'], 404);
        }

        // Retourner le fichier
        return $this->file($filePath, $document->getTitle(), ResponseHeaderBag::DISPOSITION_ATTACHMENT);
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
