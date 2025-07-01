<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\DirectDocumentController;

#[ApiResource(
    shortName: 'admin_direct_documents',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/direct-documents/students',
            controller: DirectDocumentController::class . '::getStudents',
            description: 'Get list of active students for document sending'
        ),
        new Post(
            uriTemplate: '/admin/direct-documents/send',
            controller: DirectDocumentController::class . '::sendDocument',
            description: 'Send a document directly to a student'
        ),
        new GetCollection(
            uriTemplate: '/admin/direct-documents/sent',
            controller: DirectDocumentController::class . '::getSentDocuments',
            description: 'Get list of sent documents with history'
        ),
        new Delete(
            uriTemplate: '/admin/direct-documents/{id}',
            controller: DirectDocumentController::class . '::deleteDocument',
            requirements: ['id' => '\d+'],
            description: 'Delete a direct document'
        ),
    ]
)]
class AdminDirectDocuments
{
    // Cette classe sert uniquement à définir les routes API
    // Les données sont gérées par l'entité Document existante
}