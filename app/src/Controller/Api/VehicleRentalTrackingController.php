<?php

namespace App\Controller\Api;

use App\Entity\VehicleRental;
use App\Repository\VehicleRentalRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/vehicle-rental-tracking')]
class VehicleRentalTrackingController extends AbstractController
{
    public function __construct(
        private VehicleRentalRepository $vehicleRentalRepository
    ) {}

    /**
     * Récupérer une réservation via son token unique (accès public)
     */
    #[Route('/{trackingToken}', name: 'api_vehicle_rental_tracking', methods: ['GET'])]
    public function trackRental(string $trackingToken): JsonResponse
    {
        $rental = $this->vehicleRentalRepository->findOneBy([
            'trackingToken' => $trackingToken
        ]);

        if (!$rental) {
            return $this->json([
                'error' => 'Réservation non trouvée',
                'message' => 'Le lien de suivi est invalide ou a expiré.'
            ], 404);
        }

        return $this->json([
            'id' => $rental->getId(),
            'trackingToken' => $rental->getTrackingToken(),
            'vehicle' => [
                'model' => $rental->getVehicle()?->getModel(),
                'plate' => $rental->getVehicle()?->getPlate(),
                'category' => $rental->getVehicle()?->getCategory()
            ],
            'startDate' => $rental->getStartDate()?->format('Y-m-d H:i'),
            'endDate' => $rental->getEndDate()?->format('Y-m-d H:i'),
            'status' => $rental->getStatus(),
            'totalPrice' => $rental->getTotalPrice(),
            'createdAt' => $rental->getCreatedAt()?->format('Y-m-d H:i'),
            'customerName' => $rental->getCustomerName(),
            'customerEmail' => $rental->getCustomerEmail(),
            'customerPhone' => $rental->getCustomerPhone(),
            'examTime' => $rental->getExamTime()?->format('Y-m-d H:i'),
            'notes' => $rental->getNotes(),
            'adminNotes' => $rental->getAdminNotes(),
            'statusHistory' => $this->getStatusHistory($rental)
        ]);
    }

    /**
     * Historique des statuts (simulation pour l'instant)
     */
    private function getStatusHistory(VehicleRental $rental): array
    {
        $history = [];
        
        // Toujours créé
        $history[] = [
            'status' => 'pending',
            'label' => 'Demande reçue',
            'date' => $rental->getCreatedAt()?->format('Y-m-d H:i'),
            'description' => 'Votre demande de réservation a été reçue et est en cours de traitement.'
        ];

        // Si confirmé ou terminé
        if (in_array($rental->getStatus(), ['confirmed', 'completed'])) {
            $history[] = [
                'status' => 'confirmed',
                'label' => 'Réservation confirmée',
                'date' => $rental->getUpdatedAt()?->format('Y-m-d H:i') ?? $rental->getCreatedAt()?->format('Y-m-d H:i'),
                'description' => 'Votre réservation a été confirmée. Le véhicule vous est assigné.'
            ];
        }

        // Si terminé
        if ($rental->getStatus() === 'completed') {
            $history[] = [
                'status' => 'completed',
                'label' => 'Location terminée',
                'date' => $rental->getEndDate()?->format('Y-m-d H:i'),
                'description' => 'La location s\'est terminée avec succès.'
            ];
        }

        // Si annulé
        if ($rental->getStatus() === 'cancelled') {
            $history[] = [
                'status' => 'cancelled',
                'label' => 'Réservation annulée',
                'date' => $rental->getUpdatedAt()?->format('Y-m-d H:i') ?? $rental->getCreatedAt()?->format('Y-m-d H:i'),
                'description' => 'Votre réservation a été annulée.'
            ];
        }

        return $history;
    }
}