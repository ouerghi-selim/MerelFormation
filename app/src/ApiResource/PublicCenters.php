<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Api\CenterController;
use App\Controller\Api\FormulaController;

#[ApiResource(
    uriTemplate: '/centers',
    operations: [
        new GetCollection(
            uriTemplate: '/centers/formation',
            defaults: ['type' => 'formation'],
            controller: 'App\Controller\Api\CenterController::byType',
            name: 'get_public_formation_centers'
        ),
        new GetCollection(
            uriTemplate: '/centers/exam',
            defaults: ['type' => 'exam'],
            controller: 'App\Controller\Api\CenterController::byType',
            name: 'get_public_exam_centers'
        ),
        // Nouvelles opérations modernes avec endpoints centers
        new Get(
            uriTemplate: '/centers',
            controller: CenterController::class . '::list',
            description: 'Récupère la liste des centres actifs (API publique)'
        ),
        new Get(
            uriTemplate: '/centers/with-formulas',
            controller: CenterController::class . '::withFormulas',
            description: 'Récupère les centres actifs avec leurs formules (API publique)'
        ),
        new Get(
            uriTemplate: '/centers/{id}/formulas',
            controller: CenterController::class . '::centerFormulas',
            description: 'Récupère les formules d\'un centre spécifique (API publique)'
        ),
        new Get(
            uriTemplate: '/formulas',
            controller: FormulaController::class . '::list',
            description: 'Récupère la liste des formules actives (API publique)'
        ),
        new Get(
            uriTemplate: '/formulas/grouped-by-center',
            controller: FormulaController::class . '::groupedByCenter',
            description: 'Récupère les formules groupées par centre (API publique)'
        ),
    ],
    normalizationContext: ['groups' => ['center:read']]
)]
final class PublicCenters
{
    public function __construct(
        public ?int $id = null,
        public ?string $name = null,
        public ?string $code = null,
        public ?string $type = null,
        public ?string $city = null,
        public ?string $departmentCode = null,
        public ?string $address = null,
        public ?bool $isActive = null,
        public ?array $formulas = null
    ) {}
}