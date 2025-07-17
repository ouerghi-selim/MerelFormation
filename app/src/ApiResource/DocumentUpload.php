<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\DocumentController;

#[ApiResource(
    shortName: 'document_upload',
    operations: [
        new Post(
            uriTemplate: '/admin/documents/temp-upload',
            controller: DocumentController::class . '::tempUpload',
            deserialize: false,
        ),
        new Delete(
            uriTemplate: '/admin/documents/temp/{tempId}',
            controller: DocumentController::class . '::deleteTempDocument',
            deserialize: false,
        ),
        new Post(
            uriTemplate: '/admin/documents/finalize',
            controller: DocumentController::class . '::finalizeDocuments',
            deserialize: false,
        ),
        new Post(
            uriTemplate: '/admin/documents/cleanup-temp',
            controller: DocumentController::class . '::cleanupTempFiles',
            deserialize: false,
        ),
        new Get(
            uriTemplate: '/admin/documents/{id}/download',
            controller: DocumentController::class . '::download',
            deserialize: false,
        ),
    ]
)]
class DocumentUpload
{
    // Cette classe est vide car elle sert uniquement à définir les routes API
}