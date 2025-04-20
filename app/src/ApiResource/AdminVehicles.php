<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\VehicleAdminController;

#[ApiResource(
    shortName: 'admin_vehicles',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/vehicles',
            controller: VehicleAdminController::class . '::list',
        ),
        new Get(
            uriTemplate: '/admin/vehicles/{id}',
            controller: VehicleAdminController::class . '::get',
        ),
        new Post(
            uriTemplate: '/admin/vehicles',
            controller: VehicleAdminController::class . '::create',
        ),
        new Put(
            uriTemplate: '/admin/vehicles/{id}',
            controller: VehicleAdminController::class . '::update',
        ),
        new Delete(
            uriTemplate: '/admin/vehicles/{id}',
            controller: VehicleAdminController::class . '::delete',
        ),
        new GetCollection(
            uriTemplate: '/admin/vehicles/stats',
            controller: VehicleAdminController::class . '::getStats',
        ),
        new GetCollection(
            uriTemplate: '/admin/vehicles/category/{category}',
            controller: VehicleAdminController::class . '::getByCategory',
        ),
        new GetCollection(
            uriTemplate: '/admin/vehicles/maintenance',
            controller: VehicleAdminController::class . '::getMaintenance',
        ),
        new GetCollection(
            uriTemplate: '/admin/vehicles/most-rented',
            controller: VehicleAdminController::class . '::getMostRented',
        ),
    ]
)]
class AdminVehicles
{
    // Cette classe est vide car elle sert uniquement à définir les routes API
}