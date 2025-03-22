<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use App\Controller\Admin\ReservationAdminController;
use App\Controller\Api\ReservationController;

#[ApiResource(
    shortName: 'admin_reservation',
    operations: [
        new Get(
            uriTemplate: 'admin/reservations',
            controller: ReservationAdminController::class . '::list',
        ),
        new Get(
            uriTemplate: 'admin/vehicles/available',
            controller: ReservationAdminController::class . '::getAvailableVehicles',
        ),

        new Put(
            uriTemplate: 'admin/reservations/{id}/assign-vehicle',
            controller: ReservationAdminController::class . '::assignVehicle',
        ),
        new Put(
            uriTemplate: 'admin/reservations/{id}/status',
            controller: ReservationAdminController::class . '::updateStatus',
        ),
    ]
)]
class ReservationAdmin
{
// Propriétés si nécessaire...
}