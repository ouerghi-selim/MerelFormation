<?php

namespace App\Controller\Admin;

use App\Entity\Formula;
use App\Entity\ExamCenter;
use App\Repository\FormulaRepository;
use App\Repository\ExamCenterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/admin/formulas', name: 'admin_formulas_')]
class FormulaAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormulaRepository $formulaRepository,
        private ExamCenterRepository $examCenterRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query->get('search');
            $examCenterId = $request->query->get('examCenter');
            $page = max(1, (int) $request->query->get('page', 1));
            $limit = max(1, min(100, (int) $request->query->get('limit', 20)));

            $examCenter = null;
            if ($examCenterId) {
                $examCenter = $this->examCenterRepository->find($examCenterId);
            }

            $formulas = $this->formulaRepository->findForAdmin($search, $examCenter);

            // Pagination simple
            $total = count($formulas);
            $offset = ($page - 1) * $limit;
            $paginatedFormulas = array_slice($formulas, $offset, $limit);

            $data = [
                'data' => $paginatedFormulas,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ];

            return new JsonResponse(
                $this->serializer->serialize($data, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Formula $formula): JsonResponse
    {
        try {
            return new JsonResponse(
                $this->serializer->serialize($formula, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération de la formule',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'error' => 'Données JSON invalides'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Récupérer le centre d'examen
            $examCenter = null;
            if (isset($data['examCenterId'])) {
                $examCenter = $this->examCenterRepository->find($data['examCenterId']);
                if (!$examCenter) {
                    return new JsonResponse([
                        'error' => 'Centre d\'examen non trouvé'
                    ], Response::HTTP_BAD_REQUEST);
                }
            }

            $formula = new Formula();
            $formula->setName($data['name'] ?? '')
                   ->setDescription($data['description'] ?? '')
                   ->setPrice($data['price'] ?? null)
                   ->setType($data['type'] ?? 'simple')
                   ->setAdditionalInfo($data['additionalInfo'] ?? null)
                   ->setIsActive($data['isActive'] ?? true)
                   ->setExamCenter($examCenter);

            $errors = $this->validator->validate($formula);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($formula);
            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($formula, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_CREATED,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la création de la formule',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(Request $request, Formula $formula): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'error' => 'Données JSON invalides'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (isset($data['name'])) $formula->setName($data['name']);
            if (isset($data['description'])) $formula->setDescription($data['description']);
            if (isset($data['price'])) $formula->setPrice($data['price']);
            if (isset($data['type'])) $formula->setType($data['type']);
            if (isset($data['additionalInfo'])) $formula->setAdditionalInfo($data['additionalInfo']);
            if (isset($data['isActive'])) $formula->setIsActive($data['isActive']);

            // Mise à jour du centre d'examen si fourni
            if (isset($data['examCenterId'])) {
                $examCenter = $this->examCenterRepository->find($data['examCenterId']);
                if (!$examCenter) {
                    return new JsonResponse([
                        'error' => 'Centre d\'examen non trouvé'
                    ], Response::HTTP_BAD_REQUEST);
                }
                $formula->setExamCenter($examCenter);
            }

            $errors = $this->validator->validate($formula);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($formula, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la mise à jour de la formule',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(Formula $formula): JsonResponse
    {
        try {
            $this->entityManager->remove($formula);
            $this->entityManager->flush();

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la suppression de la formule',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/active', name: 'active', methods: ['GET'])]
    public function getActive(): JsonResponse
    {
        try {
            $formulas = $this->formulaRepository->findActive();

            return new JsonResponse(
                $this->serializer->serialize($formulas, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules actives',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/by-center/{id}', name: 'by_center', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getByCenter(ExamCenter $examCenter): JsonResponse
    {
        try {
            $formulas = $this->formulaRepository->findByExamCenter($examCenter);

            return new JsonResponse(
                $this->serializer->serialize($formulas, 'json', ['groups' => ['formula:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules du centre',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/grouped-by-center', name: 'grouped_by_center', methods: ['GET'])]
    public function getGroupedByCenter(): JsonResponse
    {
        try {
            $groupedFormulas = $this->formulaRepository->getFormulasGroupedByCenter();

            return new JsonResponse($groupedFormulas);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des formules groupées',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function getStats(): JsonResponse
    {
        try {
            $priceStats = $this->formulaRepository->getPriceStatistics();
            $stats = [
                'total' => $this->formulaRepository->countTotal(),
                'active' => $this->formulaRepository->countActive(),
                'inactive' => $this->formulaRepository->countTotal() - $this->formulaRepository->countActive(),
                'priceStatistics' => $priceStats
            ];

            return new JsonResponse($stats);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}