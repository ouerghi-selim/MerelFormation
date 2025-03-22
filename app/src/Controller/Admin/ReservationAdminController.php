<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\VehicleRentalRepository;
use App\Repository\VehicleRepository;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;

class ReservationAdminController extends AbstractController
{
    private $security;
    private $vehicleRentalRepository;
    private $vehicleRepository;
    private $entityManager;

    public function __construct(
        Security $security,
        VehicleRentalRepository $vehicleRentalRepository,
        VehicleRepository $vehicleRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->vehicleRentalRepository = $vehicleRentalRepository;
        $this->vehicleRepository = $vehicleRepository;
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
//        if (!$this->security->isGranted('ROLE_ADMIN')) {
//            return $this->json(['message' => 'Accès refusé'], 403);
//        }

        // Récupérer les paramètres de filtrage
        $search = $request->query->get('search');
        $status = $request->query->get('status');
        $date = $request->query->get('date');

        // Récupérer les réservations avec filtres
        $reservations = $this->vehicleRentalRepository->findByFilters($search, $status, $date);
        
        // Formater les données pour le frontend
        $formattedReservations = [];
        foreach ($reservations as $reservation) {
            $client = $reservation->getUser();
            $formattedReservations[] = [
                'id' => $reservation->getId(),
                'clientName' => $client->getFirstName() . ' ' . $client->getLastName(),
                'clientEmail' => $client->getEmail(),
                'clientPhone' => $client->getPhone(),
                'date' => $reservation->getstartDate()->format('d/m/Y'),
                'examCenter' => $reservation->getExamCenter(),
                'formula' => $reservation->getFormula(),
                'status' => $reservation->getStatus(),
                'vehicleAssigned' => $reservation->getVehicle() ? $reservation->getVehicle()->getModel() : null
            ];
        }

        return $this->json($formattedReservations);
    }

    /**
     * @Route("/{id}", name="get", methods={"GET"})
     */
    public function get(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la réservation
        $reservation = $this->vehicleRentalRepository->find($id);
        
        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], 404);
        }

        $client = $reservation->getUser();
        
        // Formater les données pour le frontend
        $formattedReservation = [
            'id' => $reservation->getId(),
            'clientName' => $client->getFirstName() . ' ' . $client->getLastName(),
            'clientEmail' => $client->getEmail(),
            'clientPhone' => $client->getPhone(),
            'date' => $reservation->getstartDate()->format('d/m/Y'),
            'examCenter' => $reservation->getExamCenter(),
            'formula' => $reservation->getFormula(),
            'status' => $reservation->getStatus(),
            'vehicleAssigned' => $reservation->getVehicle() ? $reservation->getVehicle()->getModel() : null
        ];

        return $this->json($formattedReservation);
    }

    /**
     * @Route("/{id}/status", name="update_status", methods={"PUT"})
     */
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
//        if (!$this->security->isGranted('ROLE_ADMIN')) {
//            return $this->json(['message' => 'Accès refusé'], 403);
//        }

        // Récupérer la réservation
        $reservation = $this->vehicleRentalRepository->find($id);
        
        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        
        // Valider le statut
        $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!isset($data['status']) || !in_array($data['status'], $validStatuses)) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }
        
        // Mettre à jour le statut
        $reservation->setStatus($data['status']);
        
        // Persister les modifications
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Statut de la réservation mis à jour avec succès'
        ]);
    }

    /**
     * @Route("/{id}/assign-vehicle", name="assign_vehicle", methods={"PUT"})
     */
    public function assignVehicle(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
//        if (!$this->security->isGranted('ROLE_ADMIN')) {
//            return $this->json(['message' => 'Accès refusé'], 403);
//        }

        // Récupérer la réservation
        $reservation = $this->vehicleRentalRepository->find($id);
        
        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['vehicleModel'])) {
            return $this->json(['message' => 'Modèle de véhicule non spécifié'], 400);
        }
        
        // Récupérer le véhicule
        $vehicle = $this->vehicleRepository->findOneBy(['model' => $data['vehicleModel']]);
        
        if (!$vehicle) {
            return $this->json(['message' => 'Véhicule non trouvé'], 404);
        }
        
        // Assigner le véhicule à la réservation
        $reservation->setVehicle($vehicle);
        
        // Si la réservation est en attente, la confirmer
        if ($reservation->getStatus() === 'pending') {
            $reservation->setStatus('confirmed');
        }
        
        // Persister les modifications
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Véhicule assigné avec succès'
        ]);
    }

    /**
     * @Route("/vehicles/available", name="available_vehicles", methods={"GET"})
     */
    public function getAvailableVehicles(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
//        if (!$this->security->isGranted('ROLE_ADMIN')) {
//            return $this->json(['message' => 'Accès refusé'], 403);
//        }

        // Récupérer la date de la requête
        $date = $request->query->get('date');

        if (!$date) {
            return $this->json(['message' => 'Date non spécifiée'], 400);
        }
        
        // Convertir la date au format DateTime
        try {

            $dateObj = \DateTime::createFromFormat('d/m/Y', $date);

            //$dateObj = new \DateTime($dateObj);

        } catch (\Exception $e) {
           // dd($e->getMessage());
            return $this->json(['message' => 'Format de date invalide'], 400);
        }
        
        // Récupérer les véhicules disponibles pour cette date
        $availableVehicles = $this->vehicleRepository->findAvailableVehicles($dateObj);
        
        // Formater les données pour le frontend
        $formattedVehicles = [];
        foreach ($availableVehicles as $vehicle) {
            $formattedVehicles[] = [
                'id' => $vehicle->getId(),
                'model' => $vehicle->getModel(),
                //'type' => $vehicle->getType(),
                //'licensePlate' => $vehicle->getLicensePlate()
            ];
        }

        return $this->json($formattedVehicles);
    }
}
