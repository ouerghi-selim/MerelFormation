<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\Api\StatisticsController;

#[ApiResource(
    shortName: 'statistics',
    operations: [
        new Get(
            uriTemplate: '/formations/statistics',
            controller: StatisticsController::class . '::getFormationStats',
        ),
        new Get(
            uriTemplate: '/vehicles/statistics',
            controller: StatisticsController::class . '::getVehicleStats',
        ),
    ]
)]
class FormationStatistics
{
// Propriétés si nécessaire...
}