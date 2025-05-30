<?php

namespace App\Controller\Admin;

use App\Entity\ExamCenter;
use App\Repository\ExamCenterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/admin/exam-centers', name: 'admin_exam_centers_')]
class ExamCenterAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ExamCenterRepository $examCenterRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query->get('search');
            $page = max(1, (int) $request->query->get('page', 1));
            $limit = max(1, min(100, (int) $request->query->get('limit', 20)));

            $examCenters = $this->examCenterRepository->findForAdmin($search);

            // Pagination simple
            $total = count($examCenters);
            $offset = ($page - 1) * $limit;
            $paginatedCenters = array_slice($examCenters, $offset, $limit);

            $data = [
                'data' => $paginatedCenters,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ];

            return new JsonResponse(
                $this->serializer->serialize($data, 'json', ['groups' => ['exam_center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres d\'examen',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(ExamCenter $examCenter): JsonResponse
    {
        try {
            return new JsonResponse(
                $this->serializer->serialize($examCenter, 'json', ['groups' => ['exam_center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération du centre d\'examen',
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

            $examCenter = new ExamCenter();
            $examCenter->setName($data['name'] ?? '')
                      ->setCode($data['code'] ?? '')
                      ->setCity($data['city'] ?? '')
                      ->setDepartmentCode($data['departmentCode'] ?? '')
                      ->setAddress($data['address'] ?? null)
                      ->setIsActive($data['isActive'] ?? true);

            $errors = $this->validator->validate($examCenter);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($examCenter);
            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($examCenter, 'json', ['groups' => ['exam_center:read']]),
                Response::HTTP_CREATED,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la création du centre d\'examen',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(Request $request, ExamCenter $examCenter): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'error' => 'Données JSON invalides'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (isset($data['name'])) $examCenter->setName($data['name']);
            if (isset($data['code'])) $examCenter->setCode($data['code']);
            if (isset($data['city'])) $examCenter->setCity($data['city']);
            if (isset($data['departmentCode'])) $examCenter->setDepartmentCode($data['departmentCode']);
            if (isset($data['address'])) $examCenter->setAddress($data['address']);
            if (isset($data['isActive'])) $examCenter->setIsActive($data['isActive']);

            $errors = $this->validator->validate($examCenter);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($examCenter, 'json', ['groups' => ['exam_center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la mise à jour du centre d\'examen',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(ExamCenter $examCenter): JsonResponse
    {
        try {
            // Vérifier s'il y a des formules associées
            if (!$examCenter->getFormulas()->isEmpty()) {
                return new JsonResponse([
                    'error' => 'Impossible de supprimer ce centre d\'examen car il contient des formules'
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->remove($examCenter);
            $this->entityManager->flush();

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la suppression du centre d\'examen',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/active', name: 'active', methods: ['GET'])]
    public function getActive(): JsonResponse
    {
        dd('test');
        try {
            $examCenters = $this->examCenterRepository->findAll();

            return new JsonResponse(
                $this->serializer->serialize($examCenters, 'json', ['groups' => ['exam_center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres d\'examen',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/with-formulas', name: 'with_formulas', methods: ['GET'])]
    public function getWithFormulas(): JsonResponse
    {
        try {
            $examCenters = $this->examCenterRepository->findWithFormulas();

            return new JsonResponse(
                $this->serializer->serialize($examCenters, 'json', ['groups' => ['exam_center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres d\'examen avec formules',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'total' => $this->examCenterRepository->countTotal(),
                'active' => $this->examCenterRepository->countActive(),
                'inactive' => $this->examCenterRepository->countTotal() - $this->examCenterRepository->countActive()
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