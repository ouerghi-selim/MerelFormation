<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use Symfony\Component\HttpFoundation\Response;

#[ApiResource(
    uriTemplate: '/admin/centers',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/centers',
            controller: 'App\Controller\Api\CenterController::list',
            name: 'get_centers_collection'
        ),
        new GetCollection(
            uriTemplate: '/admin/centers/formation',
            controller: 'App\Controller\Api\CenterController::byType',
            defaults: ['type' => 'formation'],
            name: 'get_formation_centers'
        ),
        new GetCollection(
            uriTemplate: '/admin/centers/exam',
            controller: 'App\Controller\Api\CenterController::byType', 
            defaults: ['type' => 'exam'],
            name: 'get_exam_centers'
        ),
        new Get(
            uriTemplate: '/admin/centers/{id}',
            controller: 'App\Controller\Api\CenterController::show',
            name: 'get_center'
        )
    ],
    security: "is_granted('ROLE_ADMIN')",
    normalizationContext: ['groups' => ['center:read']]
)]
final class AdminCenters
{
    public function __construct(
        public ?int $id = null,
        public ?string $name = null,
        public ?string $code = null,
        public ?string $type = null,
        public ?string $city = null,
        public ?string $departmentCode = null,
        public ?string $address = null,
        public ?string $phone = null,
        public ?string $email = null,
        public ?bool $isActive = null,
        public ?\DateTimeImmutable $createdAt = null,
        public ?\DateTimeImmutable $updatedAt = null
    ) {}
}