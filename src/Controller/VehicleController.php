<?php

namespace App\Controller;

use App\Entity\Vehicle;
use App\Entity\VehicleRental;
use App\Repository\VehicleRepository;
use App\Repository\VehicleRentalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class VehicleController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private VehicleRepository $vehicleRepository,
        private VehicleRentalRepository $rentalRepository
    ) {
    }

    #[Route('/vehicles', name: 'vehicle_list', methods: ['GET'])]
    public function index(): Response
    {
        $vehicles = $this->vehicleRepository->findAll();
        return $this->render('vehicle/index.html.twig', [
            'vehicles' => $vehicles,
        ]);
    }

    #[Route('/admin/vehicles/new', name: 'vehicle_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $vehicle = new Vehicle();
            $vehicle->setModel($request->request->get('model'));
            $vehicle->setPlate($request->request->get('plate'));
            $vehicle->setYear((int)$request->request->get('year'));
            $vehicle->setStatus($request->request->get('status', 'available'));
            $vehicle->setDailyRate((float)$request->request->get('dailyRate'));
            $vehicle->setCategory($request->request->get('category'));

            $this->entityManager->persist($vehicle);
            $this->entityManager->flush();

            return $this->redirectToRoute('vehicle_list');
        }

        return $this->render('admin/vehicle/new.html.twig');
    }

    #[Route('/admin/vehicles/{id}', name: 'vehicle_edit', methods: ['GET', 'POST'])]
    public function edit(Vehicle $vehicle, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $vehicle->setModel($request->request->get('model'));
            $vehicle->setPlate($request->request->get('plate'));
            $vehicle->setYear((int)$request->request->get('year'));
            $vehicle->setStatus($request->request->get('status'));
            $vehicle->setDailyRate((float)$request->request->get('dailyRate'));
            $vehicle->setCategory($request->request->get('category'));

            $this->entityManager->flush();
            return $this->redirectToRoute('vehicle_list');
        }

        return $this->render('admin/vehicle/edit.html.twig', [
            'vehicle' => $vehicle,
        ]);
    }

    #[Route('/admin/vehicles/{id}/delete', name: 'vehicle_delete', methods: ['POST'])]
    public function delete(Vehicle $vehicle): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $this->entityManager->remove($vehicle);
        $this->entityManager->flush();

        return $this->redirectToRoute('vehicle_list');
    }

    #[Route('/admin/vehicles/{id}/toggle', name: 'vehicle_toggle', methods: ['POST'])]
    public function toggleActive(Vehicle $vehicle): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $vehicle->setIsActive(!$vehicle->isIsActive());
        $this->entityManager->flush();

        return $this->redirectToRoute('vehicle_list');
    }

    #[Route('/vehicles/{id}/rent', name: 'vehicle_rent', methods: ['GET', 'POST'])]
    public function rent(Vehicle $vehicle, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($request->isMethod('POST')) {
            $rental = new VehicleRental();
            $rental->setVehicle($vehicle);
            $rental->setUser($this->getUser());
            $rental->setStartDate(new \DateTimeImmutable($request->request->get('startDate')));
            $rental->setEndDate(new \DateTimeImmutable($request->request->get('endDate')));
            $rental->setPickupLocation($request->request->get('pickupLocation'));
            $rental->setReturnLocation($request->request->get('returnLocation'));

            // Calculer le prix total
            $totalPrice = $vehicle->getDailyRate() * $rental->getTotalDays();
            $rental->setTotalPrice($totalPrice);

            $this->entityManager->persist($rental);
            $this->entityManager->flush();

            return $this->redirectToRoute('rental_confirmation', ['id' => $rental->getId()]);
        }

        return $this->render('vehicle/rent.html.twig', [
            'vehicle' => $vehicle,
        ]);
    }

    #[Route('/vehicles/available', name: 'vehicle_available', methods: ['GET'])]
    public function available(Request $request): Response
    {
        $startDate = new \DateTimeImmutable($request->query->get('startDate', 'now'));
        $endDate = new \DateTimeImmutable($request->query->get('endDate', '+7 days'));

        $vehicles = $this->vehicleRepository->findAvailableVehicles($startDate, $endDate);

        return $this->render('vehicle/available.html.twig', [
            'vehicles' => $vehicles,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}