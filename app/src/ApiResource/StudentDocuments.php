<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Student\DocumentStudentController;

#[ApiResource(
    shortName: 'student_documents',
    operations: [
        new GetCollection(
            uriTemplate: '/student/documents',
            controller: DocumentStudentController::class . '::list',
        ),
        new Get(
            uriTemplate: '/student/documents/{id}',
            controller: DocumentStudentController::class . '::get',
        ),
        new Get(
            uriTemplate: '/student/documents/{id}/download',
            controller: DocumentStudentController::class . '::download',
        ),
    ]
)]
class StudentDocuments
{
    // Propriétés si nécessaire...
}
