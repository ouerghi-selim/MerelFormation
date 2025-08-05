<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use App\Controller\Api\VehicleRentalDocumentController;

#[ApiResource(
    shortName: 'vehicle_rental_documents',
    operations: [
        new Post(
            uriTemplate: '/vehicle-rental-documents/temp-upload',
            controller: VehicleRentalDocumentController::class . '::tempUpload',
            deserialize: false,
        ),
        new Post(
            uriTemplate: '/vehicle-rental-documents/finalize',
            controller: VehicleRentalDocumentController::class . '::finalizeDocuments',
            deserialize: false,
        ),
        new Get(
            uriTemplate: '/vehicle-rental-documents/{vehicleRentalId}',
            controller: VehicleRentalDocumentController::class . '::getDocumentsByRental',
        ),
        new Delete(
            uriTemplate: '/vehicle-rental-documents/{id}',
            controller: VehicleRentalDocumentController::class . '::deleteDocument',
        ),
        new Get(
            uriTemplate: '/vehicle-rental-documents/download/{id}',
            controller: VehicleRentalDocumentController::class . '::downloadDocument',
        ),
    ]
)]
class VehicleRentalDocuments
{
    // Cette classe est vide car elle sert uniquement à définir les routes API
}