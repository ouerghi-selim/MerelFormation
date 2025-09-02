<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Controller\Admin\ReservationAdminController;

#[ApiResource(
    shortName: 'admin_reservations',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/reservations',
            controller: ReservationAdminController::class . '::list',
        ),
        new Get(
            uriTemplate: '/admin/reservations/{id}',
            controller: ReservationAdminController::class . '::get',
        ),
        new Put(
            uriTemplate: '/admin/reservations/{id}/status',
            controller: ReservationAdminController::class . '::updateStatus',
        ),
        new Put(
            uriTemplate: '/admin/reservations/{id}/assign-vehicle',
            controller: ReservationAdminController::class . '::assignVehicle',
        ),
        new GetCollection(
            uriTemplate: '/admin/vehicles/available',
            controller: ReservationAdminController::class . '::getAvailableVehicles',
        ),
        new Delete(
            uriTemplate: '/admin/reservations/{id}',
            controller: ReservationAdminController::class . '::delete',
        ),
    ]
)]
class AdminReservations
{
    // Propriétés si nécessaire...
}
