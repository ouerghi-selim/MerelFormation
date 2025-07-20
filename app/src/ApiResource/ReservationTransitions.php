<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Admin\SessionReservationController;

#[ApiResource(
    shortName: 'reservation_transitions',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/reservation-transitions',
            controller: SessionReservationController::class . '::getTransitions',
        ),
    ]
)]
class ReservationTransitions
{
    // Cette classe sert uniquement à définir l'endpoint API
}