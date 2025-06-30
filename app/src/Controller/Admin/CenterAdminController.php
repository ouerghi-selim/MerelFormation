<?php

namespace App\Controller\Admin;

use App\Entity\Center;
use App\Repository\CenterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/admin/centers', name: 'admin_centers_')]
class CenterAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CenterRepository $centerRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query->get('search');
            $type = $request->query->get('type'); // formation, exam, both
            $page = max(1, (int) $request->query->get('page', 1));
            $limit = max(1, min(100, (int) $request->query->get('limit', 20)));

            // Récupérer les centres selon le type demandé
            // Pour l'interface admin, on veut voir TOUS les centres (actifs et inactifs)
            if ($type === 'formation') {
                $centers = $this->centerRepository->findAllForFormations();
            } elseif ($type === 'exam') {
                $centers = $this->centerRepository->findAllForExams();
            } else {
                $centers = $this->centerRepository->findAll();
            }

            // Filtrage par recherche si fourni
            if ($search) {
                $centers = array_filter($centers, function($center) use ($search) {
                    $searchLower = strtolower($search);
                    return strpos(strtolower($center->getName()), $searchLower) !== false ||
                           strpos(strtolower($center->getCity()), $searchLower) !== false ||
                           strpos(strtolower($center->getCode()), $searchLower) !== false;
                });
            }

            // Pagination simple
            $total = count($centers);
            $offset = ($page - 1) * $limit;
            $paginatedCenters = array_slice($centers, $offset, $limit);

            // Pour compatibilité avec le frontend, on retourne directement le tableau
            // comme le fait le CenterController API
            return new JsonResponse(
                $this->serializer->serialize($paginatedCenters, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Center $center): JsonResponse
    {
        try {
            return new JsonResponse(
                $this->serializer->serialize($center, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération du centre',
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

            // Validation des champs requis
            $requiredFields = ['name', 'code', 'city', 'departmentCode', 'type'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return new JsonResponse(['error' => "Le champ '$field' est requis"], Response::HTTP_BAD_REQUEST);
                }
            }

            // Vérifier que le type est valide
            $validTypes = [Center::TYPE_FORMATION, Center::TYPE_EXAM, Center::TYPE_BOTH];
            if (!in_array($data['type'], $validTypes)) {
                return new JsonResponse(['error' => 'Type de centre invalide'], Response::HTTP_BAD_REQUEST);
            }

            $center = new Center();
            $center->setName($data['name'])
                   ->setCode($data['code'])
                   ->setType($data['type'])
                   ->setCity($data['city'])
                   ->setDepartmentCode($data['departmentCode'])
                   ->setAddress($data['address'] ?? null)
                   ->setPhone($data['phone'] ?? null)
                   ->setEmail($data['email'] ?? null)
                   ->setIsActive($data['isActive'] ?? true);

            $errors = $this->validator->validate($center);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($center);
            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($center, 'json', ['groups' => ['center:read']]),
                Response::HTTP_CREATED,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la création du centre',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(Request $request, Center $center): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'error' => 'Données JSON invalides'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (isset($data['name'])) $center->setName($data['name']);
            if (isset($data['code'])) $center->setCode($data['code']);
            if (isset($data['type'])) {
                $validTypes = [Center::TYPE_FORMATION, Center::TYPE_EXAM, Center::TYPE_BOTH];
                if (!in_array($data['type'], $validTypes)) {
                    return new JsonResponse(['error' => 'Type de centre invalide'], Response::HTTP_BAD_REQUEST);
                }
                $center->setType($data['type']);
            }
            if (isset($data['city'])) $center->setCity($data['city']);
            if (isset($data['departmentCode'])) $center->setDepartmentCode($data['departmentCode']);
            if (isset($data['address'])) $center->setAddress($data['address']);
            if (isset($data['phone'])) $center->setPhone($data['phone']);
            if (isset($data['email'])) $center->setEmail($data['email']);
            if (isset($data['isActive'])) $center->setIsActive($data['isActive']);

            $errors = $this->validator->validate($center);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($center, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la mise à jour du centre',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(Center $center): JsonResponse
    {
        try {
            // Vérifier s'il y a des formules associées
            if (!$center->getFormulas()->isEmpty()) {
                return new JsonResponse([
                    'error' => 'Impossible de supprimer ce centre car il contient des formules'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier s'il y a des sessions associées
            if (!$center->getSessions()->isEmpty()) {
                return new JsonResponse([
                    'error' => 'Impossible de supprimer ce centre car il est utilisé dans des sessions'
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->remove($center);
            $this->entityManager->flush();

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la suppression du centre',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/active', name: 'active', methods: ['GET'])]
    public function getActive(): JsonResponse
    {
        try {
            $centers = $this->centerRepository->findActive();

            return new JsonResponse(
                $this->serializer->serialize($centers, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres actifs',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/with-formulas', name: 'with_formulas', methods: ['GET'])]
    public function getWithFormulas(): JsonResponse
    {
        try {
            $centers = $this->centerRepository->findForExams();

            return new JsonResponse(
                $this->serializer->serialize($centers, 'json', ['groups' => ['center:read']]),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des centres avec formules',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function getStats(): JsonResponse
    {
        try {
            $totalCenters = $this->centerRepository->count([]);
            $activeCenters = $this->centerRepository->count(['isActive' => true]);
            $formationCenters = $this->centerRepository->count(['type' => Center::TYPE_FORMATION]);
            $examCenters = $this->centerRepository->count(['type' => Center::TYPE_EXAM]);
            $bothCenters = $this->centerRepository->count(['type' => Center::TYPE_BOTH]);

            $stats = [
                'total' => $totalCenters,
                'active' => $activeCenters,
                'inactive' => $totalCenters - $activeCenters,
                'formation' => $formationCenters,
                'exam' => $examCenters,
                'both' => $bothCenters,
                'byType' => [
                    'formation' => $formationCenters,
                    'exam' => $examCenters,
                    'both' => $bothCenters
                ]
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