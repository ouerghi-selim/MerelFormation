<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\Api\FormationController;

#[ApiResource(
    shortName: 'statistics',
    operations: [
        new Get(
            uriTemplate: '/formations',
            controller: FormationController::class . '::index',
        ),
    ]
)]
class SearchFormations
{
// Propriétés si nécessaire...
}