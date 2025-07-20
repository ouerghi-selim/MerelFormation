<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Admin\SessionReservationController;

#[ApiResource(
    shortName: 'reservation_statuses',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/reservation-statuses',
            controller: SessionReservationController::class . '::getStatuses',
        ),
    ]
)]
class ReservationStatuses
{
    // Cette classe sert uniquement à définir l'endpoint API
}