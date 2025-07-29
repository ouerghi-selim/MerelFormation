<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Enum\ReservationStatus;

#[ApiResource(
    uriTemplate: '/admin/vehicle-rental-statuses',
    operations: [
        new GetCollection(
            provider: \App\State\VehicleRentalStatusesProvider::class
        )
    ],
    security: "is_granted('ROLE_ADMIN')"
)]
class VehicleRentalStatuses
{
    public function __construct(
        public readonly string $status,
        public readonly string $label,
        public readonly string $color,
        public readonly string $phase
    ) {}

    public static function getCollection(): array
    {
        $statuses = [];
        $phases = ReservationStatus::getStatusesByPhaseForType('vehicle');
        
        foreach ($phases as $phaseName => $phaseStatuses) {
            foreach ($phaseStatuses as $status => $label) {
                $statuses[] = new self(
                    status: $status,
                    label: $label,
                    color: ReservationStatus::getStatusColor($status),
                    phase: $phaseName
                );
            }
        }
        
        return $statuses;
    }
}