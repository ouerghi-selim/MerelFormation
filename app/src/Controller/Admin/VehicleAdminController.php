<?php

namespace App\Controller\Admin;

use App\Entity\Vehicle;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api/admin/vehicles", name="api_admin_vehicles_")
 */
class VehicleAdminController extends AbstractController
{
    private $security;
    private $vehicleRepository;
    private $entityManager;
    private $serializer;
    private $validator;

    public function __construct(
        Security $security,
        VehicleRepository $vehicleRepository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->security = $security;
        $this->vehicleRepository = $vehicleRepository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->validator = $validator;
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
        $model = $request->query->get('model');
        $category = $request->query->get('category');
        $status = $request->query->get('status');
        $maxDailyRate = $request->query->get('maxDailyRate');
        $year = $request->query->get('year');

        // Construire les critères de recherche
        $criteria = [];
        if ($model) $criteria['model'] = $model;
        if ($category) $criteria['category'] = $category;
        if ($status) $criteria['status'] = $status;
        if ($maxDailyRate) $criteria['maxDailyRate'] = (float)$maxDailyRate;
        if ($year) $criteria['year'] = (int)$year;

        // Récupérer les véhicules avec les critères de recherche
        $vehicles = $this->vehicleRepository->searchByCriteria($criteria);

        // Formater les données pour assurer un format de réponse cohérent
        $formattedVehicles = [];
        foreach ($vehicles as $vehicle) {
            $formattedVehicles[] = [
                'id' => $vehicle->getId(),
                'model' => $vehicle->getModel(),
                'plate' => $vehicle->getPlate(),
                'year' => $vehicle->getYear(),
                'status' => $vehicle->getStatus(),
                'dailyRate' => $vehicle->getDailyRate(),
                'isActive' => $vehicle->isIsActive(),
                'category' => $vehicle->getCategory()
            ];
        }

        return $this->json($formattedVehicles);
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

        // Récupérer le véhicule
        $vehicle = $this->vehicleRepository->find($id);

        if (!$vehicle) {
            return $this->json(['message' => 'Véhicule non trouvé'], 404);
        }

        return $this->json($vehicle);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Valider les données d'entrée
        $errors = $this->validateVehicleData($data);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], 400);
        }

        // Créer un nouveau véhicule
        $vehicle = new Vehicle();
        $this->updateVehicleFromData($vehicle, $data);

        // Persister le véhicule
        $this->entityManager->persist($vehicle);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Véhicule créé avec succès',
            'data' => $vehicle
        ], 201);
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer le véhicule
        $vehicle = $this->vehicleRepository->find($id);

        if (!$vehicle) {
            return $this->json(['message' => 'Véhicule non trouvé'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Valider les données d'entrée
        $errors = $this->validateVehicleData($data);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], 400);
        }

        // Mettre à jour le véhicule
        $this->updateVehicleFromData($vehicle, $data);

        // Persister les modifications
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Véhicule mis à jour avec succès',
            'data' => $vehicle
        ]);
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer le véhicule
        $vehicle = $this->vehicleRepository->find($id);

        if (!$vehicle) {
            return $this->json(['message' => 'Véhicule non trouvé'], 404);
        }

        // Vérifier si le véhicule a des locations associées
        $rentals = $vehicle->getRentals();
        if (count($rentals) > 0) {
            // Option 1: Empêcher la suppression et suggérer de désactiver le véhicule
            // return $this->json([
            //     'message' => 'Ce véhicule a des locations associées et ne peut pas être supprimé. Vous pouvez le désactiver à la place.',
            //     'hasRentals' => true
            // ], 400);

            // Option 2: Désactiver le véhicule au lieu de le supprimer
            $vehicle->setIsActive(false);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Véhicule désactivé avec succès car il possède des locations associées'
            ]);
        }

        // Supprimer le véhicule
        $this->entityManager->remove($vehicle);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Véhicule supprimé avec succès'
        ]);
    }

    /**
     * @Route("/stats", name="stats", methods={"GET"})
     */
    public function getStats(): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les statistiques
        $stats = $this->vehicleRepository->getStatistics();

        // Enrichir les statistiques avec d'autres données
        $vehicles = $this->vehicleRepository->findBy(['isActive' => true]);

        // Calculer le nombre de véhicules par statut
        $vehiclesByStatus = [
            'available' => 0,
            'rented' => 0,
            'maintenance' => 0
        ];

        foreach ($vehicles as $vehicle) {
            if (isset($vehiclesByStatus[$vehicle->getStatus()])) {
                $vehiclesByStatus[$vehicle->getStatus()]++;
            }
        }

        // Compléter les statistiques
        $stats['vehiclesByStatus'] = $vehiclesByStatus;

        return $this->json($stats);
    }

    /**
     * @Route("/category/{category}", name="by_category", methods={"GET"})
     */
    public function getByCategory(string $category): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les véhicules par catégorie
        $vehicles = $this->vehicleRepository->findByCategory($category);

        return $this->json($vehicles);
    }

    /**
     * @Route("/maintenance", name="maintenance", methods={"GET"})
     */
    public function getMaintenance(): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les véhicules en maintenance
        $vehicles = $this->vehicleRepository->findVehiclesNeedingMaintenance();

        return $this->json($vehicles);
    }

    /**
     * @Route("/most-rented", name="most_rented", methods={"GET"})
     */
    public function getMostRented(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer le paramètre de limite
        $limit = $request->query->getInt('limit', 5);

        // Récupérer les véhicules les plus loués
        $vehicles = $this->vehicleRepository->findMostRentedVehicles($limit);

        // Formater les données pour la réponse
        $formattedData = [];
        foreach ($vehicles as $item) {
            $vehicle = $item[0]; // Le véhicule est à l'index 0
            $rentalCount = $item['rentalCount']; // Le nombre de locations

            $formattedData[] = [
                'id' => $vehicle->getId(),
                'model' => $vehicle->getModel(),
                'plate' => $vehicle->getPlate(),
                'category' => $vehicle->getCategory(),
                'status' => $vehicle->getStatus(),
                'dailyRate' => $vehicle->getDailyRate(),
                'year' => $vehicle->getYear(),
                'isActive' => $vehicle->isIsActive(),
                'rentalCount' => (int)$rentalCount
            ];
        }

        return $this->json($formattedData);
    }

    /**
     * Méthode utilitaire pour valider les données d'un véhicule
     */
    private function validateVehicleData(array $data): array
    {
        $errors = [];

        // Vérifier que les champs obligatoires sont présents
        if (!isset($data['model']) || empty(trim($data['model']))) {
            $errors['model'] = 'Le modèle est requis';
        } elseif (strlen($data['model']) < 2) {
            $errors['model'] = 'Le modèle doit contenir au moins 2 caractères';
        }

        if (!isset($data['plate']) || empty(trim($data['plate']))) {
            $errors['plate'] = 'La plaque d\'immatriculation est requise';
        } elseif (!preg_match('/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/', $data['plate'])) {
            $errors['plate'] = 'Format de plaque invalide (XX-000-XX)';
        }

        if (!isset($data['year'])) {
            $errors['year'] = 'L\'année est requise';
        } elseif ($data['year'] < 2000 || $data['year'] > 2025) {
            $errors['year'] = 'L\'année doit être entre 2000 et 2025';
        }

        if (!isset($data['dailyRate']) || $data['dailyRate'] <= 0) {
            $errors['dailyRate'] = 'Le tarif journalier doit être supérieur à 0';
        }

        if (!isset($data['category']) || empty(trim($data['category']))) {
            $errors['category'] = 'La catégorie est requise';
        }

        if (isset($data['status']) && !in_array($data['status'], ['available', 'rented', 'maintenance'])) {
            $errors['status'] = 'Le statut doit être available, rented ou maintenance';
        }

        return $errors;
    }

    /**
     * Méthode utilitaire pour mettre à jour un véhicule depuis des données
     */
    private function updateVehicleFromData(Vehicle $vehicle, array $data): void
    {
        if (isset($data['model'])) {
            $vehicle->setModel($data['model']);
        }

        if (isset($data['plate'])) {
            $vehicle->setPlate($data['plate']);
        }

        if (isset($data['year'])) {
            $vehicle->setYear($data['year']);
        }

        if (isset($data['dailyRate'])) {
            $vehicle->setDailyRate($data['dailyRate']);
        }

        if (isset($data['category'])) {
            $vehicle->setCategory($data['category']);
        }

        if (isset($data['status'])) {
            $vehicle->setStatus($data['status']);
        }

        if (isset($data['isActive'])) {
            $vehicle->setIsActive($data['isActive']);
        }
    }
}