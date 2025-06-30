<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\CenterAdminController;

#[ApiResource(
    shortName: 'admin_center',
    operations: [
        new Get(
            uriTemplate: '/admin/centers',
            controller: CenterAdminController::class . '::index',
            description: 'Récupère la liste des centres avec pagination et recherche'
        ),
        new Get(
            uriTemplate: '/admin/centers/{id}',
            controller: CenterAdminController::class . '::show',
            description: 'Récupère les détails d\'un centre'
        ),
        new Post(
            uriTemplate: '/admin/centers',
            controller: CenterAdminController::class . '::create',
            description: 'Crée un nouveau centre'
        ),
        new Put(
            uriTemplate: '/admin/centers/{id}',
            controller: CenterAdminController::class . '::update',
            description: 'Met à jour un centre'
        ),
        new Delete(
            uriTemplate: '/admin/centers/{id}',
            controller: CenterAdminController::class . '::delete',
            description: 'Supprime un centre'
        ),
        new Get(
            uriTemplate: '/admin/centers/active',
            controller: CenterAdminController::class . '::getActive',
            description: 'Récupère la liste des centres actifs'
        ),
        new Get(
            uriTemplate: '/admin/centers/with-formulas',
            controller: CenterAdminController::class . '::getWithFormulas',
            description: 'Récupère les centres avec leurs formules'
        ),
        new Get(
            uriTemplate: '/admin/centers/stats',
            controller: CenterAdminController::class . '::getStats',
            description: 'Récupère les statistiques des centres'
        ),
    ]
)]
class CenterAdmin
{
    // Propriétés pour la documentation API si nécessaire
    public ?int $id = null;
    public ?string $name = null;
    public ?string $code = null;
    public ?string $type = null;
    public ?string $city = null;
    public ?string $departmentCode = null;
    public ?string $address = null;
    public ?string $phone = null;
    public ?string $email = null;
    public ?bool $isActive = null;
    public ?string $createdAt = null;
    public ?string $updatedAt = null;
    public ?array $formulas = null;
}