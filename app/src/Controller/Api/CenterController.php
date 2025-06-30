<?php

namespace App\Controller\Api;

use App\Entity\Center;
use App\Repository\CenterRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/centers', name: 'api_centers_')]
class CenterController extends AbstractController
{
    public function __construct(
        private CenterRepository $centerRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $type = $request->query->get('type');
        
        if ($type === 'formation') {
            $centers = $this->centerRepository->findForFormations();
        } elseif ($type === 'exam') {
            $centers = $this->centerRepository->findForExams();
        } else {
            $centers = $this->centerRepository->findActive();
        }

        return $this->json($centers, 200, [], [
            'groups' => ['center:read']
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Center $center): JsonResponse
    {
        return $this->json($center, 200, [], [
            'groups' => ['center:read']
        ]);
    }

    #[Route('/by-city/{city}', name: 'by_city', methods: ['GET'])]
    public function byCity(string $city): JsonResponse
    {
        $centers = $this->centerRepository->findByCity($city);

        return $this->json($centers, 200, [], [
            'groups' => ['center:read']
        ]);
    }

    #[Route('/by-type/{type}', name: 'by_type', methods: ['GET'])]
    public function byType(string $type): JsonResponse
    {
        if ($type === 'formation') {
            $centers = $this->centerRepository->findForFormations();
        } elseif ($type === 'exam') {
            $centers = $this->centerRepository->findForExams();
        } else {
            return $this->json(['error' => 'Invalid type. Use "formation" or "exam"'], 400);
        }

        return $this->json($centers, 200, [], [
            'groups' => ['center:read']
        ]);
    }
}