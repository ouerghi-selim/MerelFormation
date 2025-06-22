<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\PracticalInfo;
use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/admin/practical-infos', name: 'api_admin_practical_infos_')]
class PracticalInfoController extends AbstractController
{
    private $security;
    private $entityManager;

    public function __construct(
        Security $security,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->entityManager = $entityManager;
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['formation'])) {
            return $this->json(['message' => 'Formation ID is required'], 400);
        }

        $formation = $this->entityManager->getRepository(Formation::class)->find($data['formation']);
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        $practicalInfo = new PracticalInfo();
        $practicalInfo->setTitle($data['title']);
        $practicalInfo->setDescription($data['description']);
        $practicalInfo->setImage($data['image'] ?? null);
        $practicalInfo->setFormation($formation);

        $this->entityManager->persist($practicalInfo);
        $this->entityManager->flush();

        return $this->json([
            'id' => $practicalInfo->getId(),
            'title' => $practicalInfo->getTitle(),
            'description' => $practicalInfo->getDescription(),
            'image' => $practicalInfo->getImage()
        ], 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $practicalInfo = $this->entityManager->getRepository(PracticalInfo::class)->find($id);
        if (!$practicalInfo) {
            return $this->json(['message' => 'Partie pratique non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $practicalInfo->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $practicalInfo->setDescription($data['description']);
        }
        if (isset($data['image'])) {
            $practicalInfo->setImage($data['image']);
        }

        $this->entityManager->flush();

        return $this->json([
            'id' => $practicalInfo->getId(),
            'title' => $practicalInfo->getTitle(),
            'description' => $practicalInfo->getDescription(),
            'image' => $practicalInfo->getImage()
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $practicalInfo = $this->entityManager->getRepository(PracticalInfo::class)->find($id);
        if (!$practicalInfo) {
            return $this->json(['message' => 'Partie pratique non trouvée'], 404);
        }

        $this->entityManager->remove($practicalInfo);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Partie pratique supprimée avec succès'
        ]);
    }
}