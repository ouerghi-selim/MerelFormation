<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;

#[ApiResource(
    uriTemplate: '/centers',
    operations: [
        new GetCollection(
            uriTemplate: '/centers/formation',
            controller: 'App\Controller\Api\CenterController::byType',
            defaults: ['type' => 'formation'],
            name: 'get_public_formation_centers'
        ),
        new GetCollection(
            uriTemplate: '/centers/exam',
            controller: 'App\Controller\Api\CenterController::byType',
            defaults: ['type' => 'exam'], 
            name: 'get_public_exam_centers'
        )
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
        public ?string $address = null,
        public ?bool $isActive = null
    ) {}
}