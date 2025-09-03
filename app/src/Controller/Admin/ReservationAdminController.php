<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\VehicleRentalRepository;
use App\Repository\VehicleRepository;
use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;

class ReservationAdminController extends AbstractController
{
    private $security;
    private $vehicleRentalRepository;
    private $vehicleRepository;
    private $entityManager;
    private $notificationService;

    public function __construct(
        Security $security,
        VehicleRentalRepository $vehicleRentalRepository,
        VehicleRepository $vehicleRepository,
        EntityManagerInterface $entityManager,
        NotificationService $notificationService
    ) {
        $this->security = $security;
        $this->vehicleRentalRepository = $vehicleRentalRepository;
        $this->vehicleRepository = $vehicleRepository;
        $this->entityManager = $entityManager;
        $this->notificationService = $notificationService;
    }

    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les paramètres de filtrage
        $search = $request->query->get('search');
        $status = $request->query->get('status');
        $date = $request->query->get('date');
        $limit = $request->query->get('limit');
        $sort = $request->query->get('sort');


        // Récupérer les réservations avec filtres
        $reservations = $this->vehicleRentalRepository->findByFilters($search, $status, $date, $limit, $sort);
        
        // Formater les données pour le frontend
        $formattedReservations = [];
        foreach ($reservations as $reservation) {
            $client = $reservation->getUser();
            
            // ✅ Vérifier si l'utilisateur est archivé (null à cause de Gedmo SoftDelete)
            $userData = $client ? [
                'id' => $client->getId(),
                'firstName' => $client->getFirstName(),
                'lastName' => $client->getLastName(),
                'email' => $client->getEmail(),
                'phone' => $client->getPhone(),
                'fullName' => $client->getFirstName() . ' ' . $client->getLastName()
            ] : [
                'id' => null,
                'firstName' => '[Utilisateur archivé]',
                'lastName' => '',
                'email' => '[Archivé]',
                'phone' => '[Archivé]',
                'fullName' => '[Utilisateur archivé]'
            ];

            // Récupérer les données d'entreprise si présentes
            $company = $reservation->getCompany();
            $companyData = $company ? [
                'id' => $company->getId(),
                'name' => $company->getName(),
                'siret' => $company->getSiret(),
                'address' => $company->getAddress(),
                'postalCode' => $company->getPostalCode(),
                'city' => $company->getCity(),
                'responsableName' => $company->getResponsableName(),
                'email' => $company->getEmail(),
                'phone' => $company->getPhone()
            ] : null;
            
            $formattedReservations[] = [
                'id' => $reservation->getId(),
                'date' => $reservation->getstartDate()->format('d/m/Y'),
                'examCenter' => $reservation->getExamCenter(),
                'formula' => $reservation->getFormula(),
                'status' => $reservation->getStatus(),
                'vehicleAssigned' => $reservation->getVehicle() ? $reservation->getVehicle()->getModel() : null,
                'user' => $userData,
                'company' => $companyData
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
        
        // ✅ Vérifier si l'utilisateur est archivé (null à cause de Gedmo SoftDelete)
        $userData = $client ? [
            'id' => $client->getId(),
            'firstName' => $client->getFirstName(),
            'lastName' => $client->getLastName(),
            'email' => $client->getEmail(),
            'phone' => $client->getPhone(),
            'fullName' => $client->getFirstName() . ' ' . $client->getLastName(),
            'birthDate' => $client->getBirthDate() ? $client->getBirthDate()->format('Y-m-d') : null,
            'birthPlace' => $client->getBirthPlace(),
            'address' => $client->getAddress(),
            'postalCode' => $client->getPostalCode(),
            'city' => $client->getCity(),
            'driverLicenseFrontFile' => $client->getDriverLicenseFrontFile(),
            'driverLicenseBackFile' => $client->getDriverLicenseBackFile()
        ] : [
            'id' => null,
            'firstName' => '[Utilisateur archivé]',
            'lastName' => '',
            'email' => '[Archivé]',
            'phone' => '[Archivé]',
            'fullName' => '[Utilisateur archivé]',
            'birthDate' => null,
            'birthPlace' => '[Archivé]',
            'address' => '[Archivé]',
            'postalCode' => '[Archivé]',
            'city' => '[Archivé]',
            'driverLicenseFrontFile' => null,
            'driverLicenseBackFile' => null
        ];

        // Récupérer les données d'entreprise si présentes
        $company = $reservation->getCompany();
        $companyData = $company ? [
            'id' => $company->getId(),
            'name' => $company->getName(),
            'siret' => $company->getSiret(),
            'address' => $company->getAddress(),
            'postalCode' => $company->getPostalCode(),
            'city' => $company->getCity(),
            'responsableName' => $company->getResponsableName(),
            'email' => $company->getEmail(),
            'phone' => $company->getPhone()
        ] : null;
        
        // Formater les données pour le frontend
        $formattedReservation = [
            'id' => $reservation->getId(),
            'date' => $reservation->getStartDate()->format('d/m/Y'),
            'examCenter' => $reservation->getExamCenter(),
            'formula' => $reservation->getFormula(),
            'status' => $reservation->getStatus(),
            'startDate' => $reservation->getStartDate()->format('d/m/Y'),
            'endDate' => $reservation->getEndDate()->format('d/m/Y'),
            'totalPrice' => $reservation->getTotalPrice(),
            'pickupLocation' => $reservation->getPickupLocation(),
            'returnLocation' => $reservation->getReturnLocation(),
            'examTime' => $reservation->getExamTime(),
            'financing' => $reservation->getFinancing(),
            'paymentMethod' => $reservation->getPaymentMethod(),
            'notes' => $reservation->getNotes(),
            'createdAt' => $reservation->getCreatedAt()->format('d/m/Y'),
            'updatedAt' => $reservation->getUpdatedAt() ? $reservation->getUpdatedAt()->format('d/m/Y H:i') : null,
            // Documents et facture
            'documents' => $reservation->getDocuments(),
            'invoice' => $reservation->getInvoice(),
            'vehicleAssigned' => $reservation->getVehicle() ? $reservation->getVehicle()->getModel() : null,
            'user' => $userData,
            'company' => $companyData
        ];

        return $this->json($formattedReservation);
    }

    /**
     * @Route("/{id}/status", name="update_status", methods={"PUT"})
     */
    public function updateStatus(int $id, Request $request): JsonResponse
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

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        $customMessage = $data['customMessage'] ?? null;
        
        // Valider le statut (vérifier qu'il existe dans l'enum)
        if (!isset($data['status']) || !in_array($data['status'], ReservationStatus::getAllStatuses())) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }
        
        $oldStatus = $reservation->getStatus();
        $newStatus = $data['status'];
        
        // Mettre à jour le statut
        $reservation->setStatus($newStatus);

        // Envoyer une notification email si le statut a changé
        if ($oldStatus !== $newStatus) {
            // Appeler la méthode spécifique pour les véhicules
            try {
                $this->notificationService->notifyVehicleRentalStatusChange($reservation, $oldStatus, $newStatus, $customMessage);
            } catch (\Exception $e) {
                // Log l'erreur mais continue le processus
                error_log('Erreur notification véhicule: ' . $e->getMessage());
            }
        }
        
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
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

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
        
        // Ne pas changer le statut - l'assignation de véhicule est indépendante du statut
        
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
    if (!$this->security->isGranted('ROLE_ADMIN')) {
        return $this->json(['message' => 'Accès refusé'], 403);
    }

        // Récupérer la date de la requête
        $date = $request->query->get('date');

        if (!$date) {
            return $this->json(['message' => 'Date non spécifiée'], 400);
        }

        // Convertir la date au format DateTime
        try {
            // Essayer d'abord le format d/m/Y
            $dateObj = \DateTime::createFromFormat('d/m/Y', $date);

            // Si ça échoue, essayer Y-m-d
            if (!$dateObj) {
                $dateObj = \DateTime::createFromFormat('Y-m-d', $date);
            }

            if (!$dateObj) {
                throw new \Exception('Format de date non reconnu');
            }

            // Convertir en DateTimeImmutable si nécessaire
            $dateImmutable = \DateTimeImmutable::createFromMutable($dateObj);

        } catch (\Exception $e) {
            return $this->json(['message' => 'Format de date invalide: ' . $e->getMessage()], 400);
        }

        // Récupérer les véhicules disponibles pour cette date
        $availableVehicles = $this->vehicleRepository->findAvailableVehicles($dateImmutable);

        // Formater les données pour le frontend
        $formattedVehicles = [];
        foreach ($availableVehicles as $vehicle) {
            $formattedVehicles[] = [
                'id' => $vehicle->getId(),
                'model' => $vehicle->getModel(),
                'category' => $vehicle->getCategory(),
                'plate' => $vehicle->getPlate(),
                'dailyRate' => $vehicle->getDailyRate()
            ];
        }

        return $this->json($formattedVehicles);
    }

    /**
     * Suppression soft d'une réservation véhicule (SoftDelete Gedmo)
     * @Route("/admin/reservations/{id}", name="reservation_delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $reservation = $this->vehicleRentalRepository->find($id);

        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], 404);
        }

        try {
            // ✅ SoftDelete Gedmo - La réservation sera marquée comme supprimée (deletedAt)
            // mais restera en base pour la traçabilité et pourra être restaurée
            $this->entityManager->remove($reservation);
            $this->entityManager->flush();

            // ✅ Log de la suppression pour audit
            $user = $reservation->getUser();
            $userName = $user ? $user->getFirstName() . ' ' . $user->getLastName() : '[Utilisateur archivé]';
            $examCenter = $reservation->getExamCenter() ?: '[Centre non défini]';
            
            error_log("ADMIN_ACTION: Suppression soft de réservation véhicule ID:{$id} - Utilisateur: {$userName} - Centre: {$examCenter}");

            return $this->json([
                'message' => 'Réservation supprimée avec succès',
                'info' => 'La réservation a été archivée et peut être restaurée si nécessaire'
            ], 200);

        } catch (\Exception $e) {
            error_log("ERROR: Échec suppression réservation véhicule ID:{$id} - " . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la suppression de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un fichier de permis de conduire
     * @Route("/admin/users/{userId}/license/{type}/download", name="download_user_license", methods={"GET"})
     */
    public function downloadUserLicense(int $userId, string $type): Response
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Valider le type de fichier
        if (!in_array($type, ['front', 'back'])) {
            return $this->json(['message' => 'Type de fichier invalide'], 400);
        }

        // Récupérer l'utilisateur
        $userRepository = $this->entityManager->getRepository(\App\Entity\User::class);
        $user = $userRepository->find($userId);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Récupérer le nom du fichier selon le type
        $fileName = null;
        if ($type === 'front') {
            $fileName = $user->getDriverLicenseFrontFile();
        } else {
            $fileName = $user->getDriverLicenseBackFile();
        }

        if (!$fileName) {
            return $this->json(['message' => 'Fichier non trouvé'], 404);
        }

        // Construire le chemin complet du fichier
        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/licenses/' . $fileName;

        if (!file_exists($filePath)) {
            return $this->json(['message' => 'Fichier physique non trouvé'], 404);
        }

        // Retourner le fichier
        return $this->file($filePath, $fileName);
    }
}
