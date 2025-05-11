<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Get;
use App\Controller\Api\VehicleController;
use App\Controller\Api\VehicleRentalController;

#[ApiResource(
    shortName: 'vehicle_rentals',
    operations: [
        new Post(
            uriTemplate: '/vehicle-rentals',
            controller: VehicleRentalController::class . '::create',
            deserialize: false,
        ),
        new Get(
            uriTemplate: '/vehicles/available',
            controller: VehicleController::class . '::available',
        ),
    ]
)]
class VehicleRental
{
    // Cette classe est vide car elle sert uniquement à définir les routes API
}