<?php

namespace App\Controller\Api;

use App\Repository\FormulaRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/formulas', name: 'api_formulas_')]
class FormulaController extends AbstractController
{
    public function __construct(
        private FormulaRepository $formulaRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
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

    #[Route('/grouped-by-center', name: 'grouped_by_center', methods: ['GET'])]
    public function groupedByCenter(): JsonResponse
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
}