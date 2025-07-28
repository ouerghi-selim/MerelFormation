<?php

namespace App\Controller\Api;

use App\Repository\CenterRepository;
use App\Repository\FormulaRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api', name: 'api_public_')]
class PublicExamCenterController extends AbstractController
{
    public function __construct(
        private CenterRepository $centerRepository,
        private FormulaRepository $formulaRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('/exam-centers', name: 'exam_centers_list', methods: ['GET'])]
    public function getExamCenters(): JsonResponse
    {
        try {
            $examCenters = $this->centerRepository->findActiveExamCenters();

            return new JsonResponse(
                $this->serializer->serialize($examCenters, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'GET',
                    'Access-Control-Allow-Headers' => 'Content-Type'
                ],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres d\'examen',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/exam-centers/with-formulas', name: 'exam_centers_with_formulas', methods: ['GET'])]
    public function getExamCentersWithFormulas(): JsonResponse
    {
        try {
            $examCenters = $this->centerRepository->findExamCentersWithFormulas();

            return new JsonResponse(
                $this->serializer->serialize($examCenters, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'GET',
                    'Access-Control-Allow-Headers' => 'Content-Type'
                ],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres d\'examen avec formules',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/formulas', name: 'formulas_list', methods: ['GET'])]
    public function getFormulas(): JsonResponse
    {
        try {
            $formulas = $this->formulaRepository->findActive();

            return new JsonResponse(
                $this->serializer->serialize($formulas, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'GET',
                    'Access-Control-Allow-Headers' => 'Content-Type'
                ],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/formulas/grouped-by-center', name: 'formulas_grouped_by_center', methods: ['GET'])]
    public function getFormulasGroupedByCenter(): JsonResponse
    {
        try {
            $groupedFormulas = $this->formulaRepository->getFormulasGroupedByCenter();

            return new JsonResponse(
                $groupedFormulas,
                Response::HTTP_OK,
                [
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'GET',
                    'Access-Control-Allow-Headers' => 'Content-Type'
                ]
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules groupées',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/exam-centers/{id}/formulas', name: 'exam_center_formulas', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getExamCenterFormulas(int $id): JsonResponse
    {
        try {
            $center = $this->centerRepository->find($id);
            
            if (!$center || !$center->isActive()) {
                return new JsonResponse([
                    'error' => 'Centre d\'examen non trouvé ou inactif'
                ], Response::HTTP_NOT_FOUND);
            }

            $formulas = $this->formulaRepository->findByExamCenter($center);

            return new JsonResponse(
                $this->serializer->serialize($formulas, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [
                    'Access-Control-Allow-Origin' => '*',
                    'Access-Control-Allow-Methods' => 'GET',
                    'Access-Control-Allow-Headers' => 'Content-Type'
                ],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules du centre',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}