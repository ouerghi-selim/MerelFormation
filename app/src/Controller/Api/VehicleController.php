<?php

namespace App\Controller\Api;

use App\Entity\Vehicle;
use App\Repository\VehicleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/vehicles')]
class VehicleController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private VehicleRepository $vehicleRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'app_vehicles_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $category = $request->query->get('category');
        $status = $request->query->get('status');

        $criteria = ['isActive' => true];
        if ($category) {
            $criteria['category'] = $category;
        }
        if ($status) {
            $criteria['status'] = $status;
        }

        $vehicles = $this->vehicleRepository->findBy(
            $criteria,
            ['model' => 'ASC'],
            $limit,
            ($page - 1) * $limit
        );

        $totalVehicles = $this->vehicleRepository->count($criteria);

        return $this->json([
            'data' => $vehicles,
            'total' => $totalVehicles,
            'page' => $page,
            'limit' => $limit,
        ], Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('/{id}', name: 'app_vehicles_show', methods: ['GET'])]
    public function show(Vehicle $vehicle): JsonResponse
    {
        return $this->json($vehicle, Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('', name: 'app_vehicles_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $vehicle = $this->serializer->deserialize(
            $request->getContent(),
            Vehicle::class,
            'json',
            ['groups' => ['vehicle:write']]
        );

        $errors = $this->validator->validate($vehicle);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($vehicle);
        $this->entityManager->flush();

        return $this->json($vehicle, Response::HTTP_CREATED, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('/{id}', name: 'app_vehicles_update', methods: ['PUT'])]
    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $this->serializer->deserialize(
            $request->getContent(),
            Vehicle::class,
            'json',
            ['object_to_populate' => $vehicle, 'groups' => ['vehicle:write']]
        );

        $errors = $this->validator->validate($vehicle);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json($vehicle, Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('/{id}', name: 'app_vehicles_delete', methods: ['DELETE'])]
    public function delete(Vehicle $vehicle): JsonResponse
    {
        $vehicle->setIsActive(false);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/statistics', name: 'app_vehicles_statistics', methods: ['GET'])]
    public function getStatistics(): JsonResponse
    {
        $statistics = $this->vehicleRepository->getStatistics();

        return $this->json($statistics);
    }

    #[Route('/search', name: 'app_vehicles_search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $criteria = [
            'model' => $request->query->get('model'),
            'category' => $request->query->get('category'),
            'status' => $request->query->get('status'),
            'maxDailyRate' => $request->query->get('maxDailyRate'),
            'year' => $request->query->get('year'),
        ];

        $vehicles = $this->vehicleRepository->searchByCriteria(array_filter($criteria));

        return $this->json($vehicles, Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('/available', name: 'app_vehicles_available', methods: ['GET'])]
    public function available(Request $request): JsonResponse
    {
        $startDate = new \DateTimeImmutable($request->query->get('startDate'));
        $endDate = new \DateTimeImmutable($request->query->get('endDate'));

        $availableVehicles = $this->vehicleRepository->findAvailableVehicles($startDate, $endDate);

        return $this->json($availableVehicles, Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('/maintenance', name: 'app_vehicles_maintenance', methods: ['GET'])]
    public function maintenance(): JsonResponse
    {
        $vehiclesInMaintenance = $this->vehicleRepository->findVehiclesNeedingMaintenance();

        return $this->json($vehiclesInMaintenance, Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }

    #[Route('/most-rented', name: 'app_vehicles_most_rented', methods: ['GET'])]
    public function mostRented(Request $request): JsonResponse
    {
        $limit = $request->query->getInt('limit', 5);
        $mostRentedVehicles = $this->vehicleRepository->findMostRentedVehicles($limit);

        return $this->json($mostRentedVehicles, Response::HTTP_OK, [], ['groups' => ['vehicle:read']]);
    }
}