<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Enum\ReservationStatus;

#[ApiResource(
    uriTemplate: '/admin/vehicle-rental-transitions',
    operations: [
        new GetCollection(
            provider: \App\State\VehicleRentalTransitionsProvider::class
        )
    ],
    security: "is_granted('ROLE_ADMIN')"
)]
class VehicleRentalTransitions
{
    public function __construct(
        public readonly string $fromStatus,
        public readonly array $toStatuses
    ) {}

    public static function getCollection(): array
    {
        $transitions = [];
        $statuses = ReservationStatus::getStatusesForType('vehicle');
        
        foreach ($statuses as $status) {
            $allowedTransitions = ReservationStatus::getAllowedTransitionsForType($status, 'vehicle');
            $transitions[] = new self(
                fromStatus: $status,
                toStatuses: array_map(function($toStatus) {
                    return [
                        'status' => $toStatus,
                        'label' => ReservationStatus::getStatusLabel($toStatus),
                        'color' => ReservationStatus::getStatusColor($toStatus)
                    ];
                }, $allowedTransitions)
            );
        }
        
        return $transitions;
    }
}