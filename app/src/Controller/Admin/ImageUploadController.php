<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/admin/images', name: 'api_admin_images_')]
class ImageUploadController extends AbstractController
{
    private $security;
    private $slugger;

    public function __construct(
        Security $security,
        SluggerInterface $slugger
    ) {
        $this->security = $security;
        $this->slugger = $slugger;
    }

    private function getUploadsDirectory(): string
    {
        return $this->getParameter('kernel.project_dir') . '/public/uploads/images';
    }

    private function getCmsUploadsDirectory(): string
    {
        return $this->getParameter('kernel.project_dir') . '/public/uploads/cms';
    }

    #[Route('/upload', name: 'upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('image');

        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier fourni'], 400);
        }

        // Validation du fichier uploadé
        if (!$uploadedFile->isValid()) {
            return $this->json(['message' => 'Fichier invalide ou corrompu'], 400);
        }

        // Validation du type de fichier
        try {
            $mimeType = $uploadedFile->getMimeType();
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($mimeType, $allowedMimeTypes)) {
                return $this->json(['message' => 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WebP'], 400);
            }
        } catch (\Exception $e) {
            return $this->json(['message' => 'Impossible de déterminer le type de fichier'], 400);
        }

        // Validation de la taille (5MB max)
        try {
            $fileSize = $uploadedFile->getSize();
            if ($fileSize === null || $fileSize > 5 * 1024 * 1024) {
                return $this->json(['message' => 'Fichier trop volumineux ou invalide. Taille maximale: 5MB'], 400);
            }
        } catch (\Exception $e) {
            return $this->json(['message' => 'Impossible de déterminer la taille du fichier'], 400);
        }

        try {
            $uploadsDirectory = $this->getUploadsDirectory();
            
            // Créer le répertoire s'il n'existe pas
            if (!is_dir($uploadsDirectory)) {
                mkdir($uploadsDirectory, 0755, true);
            }

            // Générer un nom de fichier unique
            $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $extension = $uploadedFile->guessExtension();
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $extension;

            // Déplacer le fichier
            $uploadedFile->move($uploadsDirectory, $newFilename);

            // Retourner l'URL de l'image
            $imageUrl = '/uploads/images/' . $newFilename;

            return $this->json([
                'url' => $imageUrl,
                'filename' => $newFilename,
                'originalName' => $uploadedFile->getClientOriginalName(),
                'size' => $fileSize,
                'mimeType' => $mimeType
            ], 201);

        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur lors de l\'upload: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{filename}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $filename): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $uploadsDirectory = $this->getUploadsDirectory();
        $filePath = $uploadsDirectory . '/' . $filename;

        if (file_exists($filePath)) {
            if (unlink($filePath)) {
                return $this->json(['message' => 'Image supprimée avec succès']);
            } else {
                return $this->json(['message' => 'Erreur lors de la suppression'], 500);
            }
        }

        return $this->json(['message' => 'Fichier non trouvé'], 404);
    }

    #[Route('/upload-cms', name: 'upload_cms', methods: ['POST'])]
    public function uploadCms(Request $request): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('image');

        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier fourni'], 400);
        }

        // Validation du fichier uploadé
        if (!$uploadedFile->isValid()) {
            return $this->json(['message' => 'Fichier invalide ou corrompu'], 400);
        }

        // Validation du type de fichier
        try {
            $mimeType = $uploadedFile->getMimeType();
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($mimeType, $allowedMimeTypes)) {
                return $this->json(['message' => 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WebP'], 400);
            }
        } catch (\Exception $e) {
            return $this->json(['message' => 'Impossible de déterminer le type de fichier'], 400);
        }

        // Validation de la taille (2MB max pour CMS)
        try {
            $fileSize = $uploadedFile->getSize();
            if ($fileSize === null || $fileSize > 2 * 1024 * 1024) {
                return $this->json(['message' => 'Fichier trop volumineux. Taille maximale pour le CMS: 2MB'], 400);
            }
        } catch (\Exception $e) {
            return $this->json(['message' => 'Impossible de déterminer la taille du fichier'], 400);
        }

        try {
            $uploadsDirectory = $this->getCmsUploadsDirectory();
            
            // Créer le répertoire s'il n'existe pas
            if (!is_dir($uploadsDirectory)) {
                mkdir($uploadsDirectory, 0755, true);
            }

            // Générer un nom de fichier unique avec préfixe CMS
            $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugger->slug($originalFilename);
            $extension = $uploadedFile->guessExtension();
            $newFilename = 'cms-' . $safeFilename . '-' . uniqid() . '.' . $extension;

            // Déplacer le fichier
            $uploadedFile->move($uploadsDirectory, $newFilename);

            // Retourner l'URL de l'image
            $imageUrl = '/uploads/cms/' . $newFilename;

            return $this->json([
                'success' => true,
                'url' => $imageUrl,
                'filename' => $newFilename,
                'originalName' => $uploadedFile->getClientOriginalName(),
                'size' => $fileSize,
                'mimeType' => $mimeType,
                'message' => 'Image uploadée avec succès'
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/cms/{filename}', name: 'delete_cms', methods: ['DELETE'])]
    public function deleteCms(string $filename): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $uploadsDirectory = $this->getCmsUploadsDirectory();
        $filePath = $uploadsDirectory . '/' . $filename;

        if (file_exists($filePath)) {
            if (unlink($filePath)) {
                return $this->json([
                    'success' => true,
                    'message' => 'Image CMS supprimée avec succès'
                ]);
            } else {
                return $this->json([
                    'success' => false,
                    'message' => 'Erreur lors de la suppression'
                ], 500);
            }
        }

        return $this->json([
            'success' => false,
            'message' => 'Fichier non trouvé'
        ], 404);
    }
}