<?php

namespace App \Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Http\request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;

class FormationController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {         
            $this->entityManager = $entityManager;
    }

    /**
     * @Route("/formations", methods={"GET"})
     */
    public function listFormations(): JsonResponse
    {
        $formations = $this->entityManager->getRepository(Formation::class)
            ->findAll();
        return $this->json($formations);
    }

    /**
     * @Route("/formations", methods={"POST"})
     */
    public function createFormation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $formation = new Formation();
        $formation->setName($data['name']);
        $formation->setDescription($data['description']);

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        return $this->json($formation);
    }

    /**
     * @Route("/formations/{id}", methods={"PUT"})
     */
    public function updateFormation(Request $request, int $id): JsonResponse
    {
        $formation = $this->entityManager->getRepository(Formation::class)
            ->find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $formation->setName($data['name'] ?? $formation->getName());
        $formation->setDescription($data['description'] ?? $formation->getDescription());

        $this->entityManager->flush();

        return $this->json($formation);
    }

    /**
     * @Route("/formations/{id}", methods={"DELETE"})
     */
    public function deleteFormation(int $id): JsonResponse
    {
        $formation = $this->entityManager->getRepository(Formation::class)
            >find($id);

        if (!$formation) {
            return $this->json(['error' => 'Formation not found'], 404);
        }

        $this->entityManager->remove($formation);
        $this->entityManager->flush();

        return $this->json(['message' => 'Formation deleted successfully']);
    }
}