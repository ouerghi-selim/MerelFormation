<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\Api\PublicExamCenterController;

#[ApiResource(
    shortName: 'public_exam_center',
    operations: [
        new Get(
            uriTemplate: '/api/exam-centers',
            controller: PublicExamCenterController::class . '::getExamCenters',
            description: 'Récupère la liste des centres d\'examen actifs (API publique)'
        ),
        new Get(
            uriTemplate: '/api/exam-centers/with-formulas',
            controller: PublicExamCenterController::class . '::getExamCentersWithFormulas',
            description: 'Récupère les centres d\'examen actifs avec leurs formules (API publique)'
        ),
        new Get(
            uriTemplate: '/api/formulas',
            controller: PublicExamCenterController::class . '::getFormulas',
            description: 'Récupère la liste des formules actives (API publique)'
        ),
        new Get(
            uriTemplate: '/api/formulas/grouped-by-center',
            controller: PublicExamCenterController::class . '::getFormulasGroupedByCenter',
            description: 'Récupère les formules groupées par centre (API publique)'
        ),
        new Get(
            uriTemplate: '/api/exam-centers/{id}/formulas',
            controller: PublicExamCenterController::class . '::getExamCenterFormulas',
            description: 'Récupère les formules d\'un centre d\'examen spécifique (API publique)'
        ),
    ]
)]
class PublicExamCenter
{
    // Propriétés pour la documentation API si nécessaire
    public ?int $id = null;
    public ?string $name = null;
    public ?string $code = null;
    public ?string $city = null;
    public ?string $departmentCode = null;
    public ?string $address = null;
    public ?bool $isActive = null;
    public ?array $formulas = null;
}