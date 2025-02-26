<?php
namespace App\Controller\Api;

use App\Repository\FormationRepository;
use App\Repository\VehicleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

class StatisticsController extends AbstractController
{
    public function __construct(
        private FormationRepository $formationRepository,
        private VehicleRepository $vehicleRepository
    ) {}

    public function getFormationStats(): JsonResponse
    {
        $statistics = $this->formationRepository->getStatistics();
        return $this->json($statistics);
    }

    public function getVehicleStats(): JsonResponse
    {
        $statistics = $this->vehicleRepository->getStatistics();
        return $this->json($statistics);
    }
}