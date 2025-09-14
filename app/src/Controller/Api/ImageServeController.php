<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ImageServeController extends AbstractController
{
    public function serveImage(string $type, string $filename): Response
    {
        // Validation du type de dossier autorisé
        $allowedTypes = ['cms', 'images', 'documents', 'formations', 'sessions', 'licenses', 'user-documents'];
        if (!in_array($type, $allowedTypes)) {
            throw new NotFoundHttpException('Type de fichier non autorisé');
        }

        // Construction du chemin du fichier
        $uploadsDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $type;
        $filePath = $uploadsDirectory . '/' . $filename;

        // Validation sécurisée du nom de fichier (éviter les attaques path traversal)
        if (strpos($filename, '..') !== false || strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
            throw new NotFoundHttpException('Nom de fichier invalide');
        }

        // Vérifier que le fichier existe
        if (!file_exists($filePath) || !is_file($filePath)) {
            throw new NotFoundHttpException('Fichier non trouvé');
        }

        // Déterminer le type MIME du fichier
        $mimeType = mime_content_type($filePath);
        if ($mimeType === false) {
            $mimeType = 'application/octet-stream';
        }

        // Retourner la réponse binaire avec les bons headers
        $response = new BinaryFileResponse($filePath);
        $response->headers->set('Content-Type', $mimeType);
        $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
        $response->headers->set('Expires', gmdate('D, d M Y H:i:s T', time() + 31536000));

        return $response;
    }

    public function serveCmsImage(string $filename): Response
    {
        return $this->serveImage('cms', $filename);
    }

    public function serveGeneralImage(string $filename): Response
    {
        return $this->serveImage('images', $filename);
    }

    public function serveDocument(string $filename): Response
    {
        return $this->serveImage('documents', $filename);
    }
}