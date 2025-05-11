<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Controller\Admin\SessionReservationController;

#[ApiResource(
    shortName: 'admin_session_reservations',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/session-reservations',
            controller: SessionReservationController::class . '::index',
        ),
        new Get(
            uriTemplate: '/admin/session-reservations/{id}',
            controller: SessionReservationController::class . '::show',
        ),
        new Put(
            uriTemplate: '/admin/session-reservations/{id}/status',
            controller: SessionReservationController::class . '::updateStatus',
        ),
    ]
)]
class SessionReservationAdmin
{
    // Propriétés si nécessaire...
}