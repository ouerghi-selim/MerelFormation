<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\ExamCenterAdminController;

#[ApiResource(
    shortName: 'admin_exam_center',
    operations: [
        new Get(
            uriTemplate: '/admin/exam-centers',
            controller: ExamCenterAdminController::class . '::index',
            description: 'Récupère la liste des centres d\'examen avec pagination et recherche'
        ),
        new Get(
            uriTemplate: '/admin/exam-centers/{id}',
            controller: ExamCenterAdminController::class . '::show',
            description: 'Récupère les détails d\'un centre d\'examen'
        ),
        new Post(
            uriTemplate: '/admin/exam-centers',
            controller: ExamCenterAdminController::class . '::create',
            description: 'Crée un nouveau centre d\'examen'
        ),
        new Put(
            uriTemplate: '/admin/exam-centers/{id}',
            controller: ExamCenterAdminController::class . '::update',
            description: 'Met à jour un centre d\'examen'
        ),
        new Delete(
            uriTemplate: '/admin/exam-centers/{id}',
            controller: ExamCenterAdminController::class . '::delete',
            description: 'Supprime un centre d\'examen'
        ),
        new Get(
            uriTemplate: '/admin/exam-centers/active',
            controller: ExamCenterAdminController::class . '::getActive',
            description: 'Récupère la liste des centres d\'examen actifs'
        ),
        new Get(
            uriTemplate: '/admin/exam-centers/with-formulas',
            controller: ExamCenterAdminController::class . '::getWithFormulas',
            description: 'Récupère les centres d\'examen avec leurs formules'
        ),
        new Get(
            uriTemplate: '/admin/exam-centers/stats',
            controller: ExamCenterAdminController::class . '::getStats',
            description: 'Récupère les statistiques des centres d\'examen'
        ),
    ]
)]
class ExamCenterAdmin
{
    // Propriétés pour la documentation API si nécessaire
    public ?int $id = null;
    public ?string $name = null;
    public ?string $code = null;
    public ?string $city = null;
    public ?string $departmentCode = null;
    public ?string $address = null;
    public ?bool $isActive = null;
    public ?string $createdAt = null;
    public ?string $updatedAt = null;
    public ?array $formulas = null;
}