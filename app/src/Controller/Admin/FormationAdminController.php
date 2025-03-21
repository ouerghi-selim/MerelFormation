<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\FormationRepository;
use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @Route("/api/admin/formations", name="api_admin_formations_")
 */
class FormationAdminController extends AbstractController
{
    private $security;
    private $formationRepository;
    private $entityManager;

    public function __construct(
        Security $security,
        FormationRepository $formationRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->formationRepository = $formationRepository;
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les paramètres de filtrage
        $title = $request->query->get('title');
        $type = $request->query->get('type');

        // Récupérer les formations avec filtres
        $formations = $this->formationRepository->findByFilters($title, $type);
        
        // Formater les données pour le frontend
        $formattedFormations = [];
        foreach ($formations as $formation) {
            $formattedFormations[] = [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'type' => $formation->getType(),
                'duration' => $formation->getDuration(),
                'price' => $formation->getPrice(),
                'isActive' => $formation->isActive()
            ];
        }

        return $this->json($formattedFormations);
    }

    /**
     * @Route("/{id}", name="get", methods={"GET"})
     */
    public function get(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la formation
        $formation = $this->formationRepository->find($id);
        
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        // Formater les données pour le frontend
        $formattedFormation = [
            'id' => $formation->getId(),
            'title' => $formation->getTitle(),
            'description' => $formation->getDescription(),
            'type' => $formation->getType(),
            'duration' => $formation->getDuration(),
            'price' => $formation->getPrice(),
            'isActive' => $formation->isActive(),
            'modules' => [], // À implémenter selon votre structure de données
            'sessions' => [] // À implémenter selon votre structure de données
        ];

        return $this->json($formattedFormation);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        
        // Valider les données (à implémenter selon vos besoins)
        
        // Créer une nouvelle formation
        $formation = new Formation();
        $formation->setTitle($data['title']);
        $formation->setDescription($data['description'] ?? '');
        $formation->setType($data['type']);
        $formation->setDuration($data['duration']);
        $formation->setPrice($data['price']);
        $formation->setIsActive($data['isActive'] ?? true);
        
        // Persister la formation
        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Formation créée avec succès',
            'id' => $formation->getId()
        ], 201);
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la formation
        $formation = $this->formationRepository->find($id);
        
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        
        // Mettre à jour la formation
        if (isset($data['title'])) {
            $formation->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $formation->setDescription($data['description']);
        }
        if (isset($data['type'])) {
            $formation->setType($data['type']);
        }
        if (isset($data['duration'])) {
            $formation->setDuration($data['duration']);
        }
        if (isset($data['price'])) {
            $formation->setPrice($data['price']);
        }
        if (isset($data['isActive'])) {
            $formation->setIsActive($data['isActive']);
        }
        
        // Persister les modifications
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Formation mise à jour avec succès'
        ]);
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la formation
        $formation = $this->formationRepository->find($id);
        
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        // Supprimer la formation
        $this->entityManager->remove($formation);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Formation supprimée avec succès'
        ]);
    }
}
