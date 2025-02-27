<?php

namespace App\Controller\Api;

use App\Entity\Formation;
use App\Repository\FormationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/formations')]
class FormationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormationRepository $formationRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'app_formations_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $type = $request->query->get('type');
        $title = $request->query->get('title');
        $category = $request->query->get('category');

        $criteria = [];
        if ($title) {
            $criteria['title'] = $title;
        }
        if ($type) {
            $criteria['type'] = $type;
        }
        if ($category) {
            $criteria['category'] = $category;
        }

        // Si nous avons des critères de recherche, utilisons la méthode searchByCriteria
        if (!empty($criteria)) {
            $formations = $this->formationRepository->searchByCriteria($criteria);

            // Appliquer manuellement la pagination
            $totalFormations = count($formations);
            $offset = ($page - 1) * $limit;
            $formations = array_slice($formations, $offset, $limit);
        } else {
            // Sans critères, on utilise la méthode findBy standard
            $formations = $this->formationRepository->findBy(
                ['isActive' => true],
                ['createdAt' => 'DESC'],
                $limit,
                ($page - 1) * $limit
            );
            $totalFormations = $this->formationRepository->count(['isActive' => true]);
        }

        return $this->json([
            'data' => $formations,
            'total' => $totalFormations,
            'page' => $page,
            'limit' => $limit,
        ], Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('/{id}', name: 'app_formations_show', methods: ['GET'])]
    public function show(Formation $formation): JsonResponse
    {
        return $this->json($formation, Response::HTTP_OK, [], ['groups' => ['formation:read', 'formation:item:read']]);
    }

    #[Route('', name: 'app_formations_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $formation = $this->serializer->deserialize(
            $request->getContent(),
            Formation::class,
            'json',
            ['groups' => ['formation:write']]
        );

        $errors = $this->validator->validate($formation);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        return $this->json($formation, Response::HTTP_CREATED, [], ['groups' => ['formation:read']]);
    }

    #[Route('/{id}', name: 'app_formations_update', methods: ['PUT'])]
    public function update(Request $request, Formation $formation): JsonResponse
    {
        $this->serializer->deserialize(
            $request->getContent(),
            Formation::class,
            'json',
            ['object_to_populate' => $formation, 'groups' => ['formation:write']]
        );

        $errors = $this->validator->validate($formation);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json($formation, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('/{id}', name: 'app_formations_delete', methods: ['DELETE'])]
    public function delete(Formation $formation): JsonResponse
    {
        $this->entityManager->remove($formation);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/statistics', name: 'app_formations_statistics', methods: ['GET'])]
    public function getStatistics(): JsonResponse
    {
        $statistics = $this->formationRepository->getStatistics();

        return $this->json($statistics);
    }

    #[Route('/search', name: 'app_formations_search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $criteria = [
            'title' => $request->query->get('title'),
            'type' => $request->query->get('type'),
            'priceMin' => $request->query->get('priceMin'),
            'priceMax' => $request->query->get('priceMax'),
            'categoryId' => $request->query->get('categoryId'),
            'hasAvailableSessions' => $request->query->getBoolean('hasAvailableSessions'),
        ];

        $formations = $this->formationRepository->searchByCriteria(array_filter($criteria));

        return $this->json($formations, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }
}
