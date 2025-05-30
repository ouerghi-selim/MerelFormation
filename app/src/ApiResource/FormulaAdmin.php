<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\FormulaAdminController;

#[ApiResource(
    shortName: 'admin_formula',
    operations: [
        new Get(
            uriTemplate: '/admin/formulas',
            controller: FormulaAdminController::class . '::index',
            description: 'Récupère la liste des formules avec pagination, recherche et filtrage par centre'
        ),
        new Get(
            uriTemplate: '/admin/formulas/{id}',
            controller: FormulaAdminController::class . '::show',
            description: 'Récupère les détails d\'une formule'
        ),
        new Post(
            uriTemplate: '/admin/formulas',
            controller: FormulaAdminController::class . '::create',
            description: 'Crée une nouvelle formule'
        ),
        new Put(
            uriTemplate: '/admin/formulas/{id}',
            controller: FormulaAdminController::class . '::update',
            description: 'Met à jour une formule'
        ),
        new Delete(
            uriTemplate: '/admin/formulas/{id}',
            controller: FormulaAdminController::class . '::delete',
            description: 'Supprime une formule'
        ),
        new Get(
            uriTemplate: '/admin/formulas/active',
            controller: FormulaAdminController::class . '::getActive',
            description: 'Récupère la liste des formules actives'
        ),
        new Get(
            uriTemplate: '/admin/formulas/by-center/{id}',
            controller: FormulaAdminController::class . '::getByCenter',
            description: 'Récupère les formules d\'un centre d\'examen spécifique'
        ),
        new Get(
            uriTemplate: '/admin/formulas/grouped-by-center',
            controller: FormulaAdminController::class . '::getGroupedByCenter',
            description: 'Récupère les formules groupées par centre d\'examen'
        ),
        new Get(
            uriTemplate: '/admin/formulas/stats',
            controller: FormulaAdminController::class . '::getStats',
            description: 'Récupère les statistiques des formules'
        ),
    ]
)]
class FormulaAdmin
{
    // Propriétés pour la documentation API si nécessaire
    public ?int $id = null;
    public ?string $name = null;
    public ?string $description = null;
    public ?float $price = null;
    public ?string $type = null;
    public ?bool $isActive = null;
    public ?string $additionalInfo = null;
    public ?string $createdAt = null;
    public ?string $updatedAt = null;
    public ?array $examCenter = null;
    public ?string $fullText = null;
    public ?string $formattedPrice = null;
}