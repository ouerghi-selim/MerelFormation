<?php

namespace App\Controller\Api;

use App\Entity\Formation;
use App\Repository\FormationRepository;
use App\Repository\DocumentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/formations', priority: 10)]
class FormationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormationRepository $formationRepository,
        private DocumentRepository $documentRepository,
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
        // Formater manuellement pour éviter les problèmes de sérialisation
        $formationData = [
            'id' => $formation->getId(),
            'title' => $formation->getTitle(),
            'description' => $formation->getDescription(),
            'price' => $formation->getPrice(),
            'duration' => $formation->getDuration(),
            'type' => $formation->getType(),
            'createdAt' => $formation->getCreatedAt()->format('c'),
            'updatedAt' => $formation->getUpdatedAt()->format('c'),
            'isActive' => $formation->isIsActive(),
            'successRate' => $formation->getSuccessRate(),
            'minStudents' => $formation->getMinStudents(),
            'maxStudents' => $formation->getMaxStudents(),
            'badges' => $formation->getBadges(),
            'taxInfo' => $formation->getTaxInfo(),
        ];

        // Ajouter les sessions avec toutes les informations
        $sessions = [];
        foreach ($formation->getSessions() as $session) {
            $sessionData = [
                'id' => $session->getId(),
                'startDate' => $session->getStartDate()->format('c'),
                'endDate' => $session->getEndDate()->format('c'),
                'maxParticipants' => $session->getMaxParticipants(),
                'status' => $session->getStatus(),
                'location' => $session->getLocation(),
                'participantsCount' => count($session->getParticipants())
            ];

            // Ajouter les informations du centre si disponible
            if ($session->getCenter()) {
                $center = $session->getCenter();
                $sessionData['center'] = [
                    'id' => $center->getId(),
                    'name' => $center->getName(),
                    'address' => $center->getAddress(),
                    'city' => $center->getCity(),
                    'type' => $center->getType()
                ];
            }

            // Ajouter les informations des instructeurs multiples
            $instructors = [];
            foreach ($session->getInstructors() as $instructor) {
                $instructors[] = [
                    'id' => $instructor->getId(),
                    'firstName' => $instructor->getFirstName(),
                    'lastName' => $instructor->getLastName(),
                    'specialization' => $instructor->getSpecialization()
                ];
            }
            $sessionData['instructors'] = $instructors;

            // Ajouter l'instructeur principal pour compatibilité
            if ($session->getInstructor()) {
                $instructor = $session->getInstructor();
                $sessionData['instructor'] = [
                    'id' => $instructor->getId(),
                    'firstName' => $instructor->getFirstName(),
                    'lastName' => $instructor->getLastName(),
                    'specialization' => $instructor->getSpecialization()
                ];
            }

            $sessions[] = $sessionData;
        }
        $formationData['sessions'] = $sessions;

        // Ajouter les modules avec leurs points
        $modules = [];
        foreach ($formation->getModules() as $module) {
            $points = [];
            foreach ($module->getPoints() as $point) {
                $points[] = [
                    'id' => $point->getId(),
                    'content' => $point->getContent()
                ];
            }
            $modules[] = [
                'id' => $module->getId(),
                'title' => $module->getTitle(),
                'duration' => $module->getDuration(),
                'position' => $module->getPosition(),
                'points' => $points
            ];
        }
        $formationData['modules'] = $modules;

        // Ajouter les prérequis
        $prerequisites = [];
        foreach ($formation->getPrerequisites() as $prerequisite) {
            $prerequisites[] = [
                'id' => $prerequisite->getId(),
                'content' => $prerequisite->getContent()
            ];
        }
        $formationData['prerequisites'] = $prerequisites;

        // Ajouter toutes les parties pratiques
        $practicalInfos = [];
        foreach ($formation->getPracticalInfos() as $practicalInfo) {
            $practicalInfos[] = [
                'id' => $practicalInfo->getId(),
                'title' => $practicalInfo->getTitle(),
                'description' => $practicalInfo->getDescription(),
                'image' => $practicalInfo->getImage()
            ];
        }
        $formationData['practicalInfos'] = $practicalInfos;
        
        // Garder la compatibilité avec practicalInfo (première partie pratique)
        $firstPracticalInfo = $formation->getPracticalInfo();
        if ($firstPracticalInfo) {
            $formationData['practicalInfo'] = [
                'id' => $firstPracticalInfo->getId(),
                'title' => $firstPracticalInfo->getTitle(),
                'description' => $firstPracticalInfo->getDescription(),
                'image' => $firstPracticalInfo->getImage()
            ];
        } else {
            $formationData['practicalInfo'] = null;
        }

        return $this->json($formationData);
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

    #[Route('/{id}/documents', name: 'app_formations_documents', methods: ['GET'])]
    public function getDocuments(Formation $formation): JsonResponse
    {
        // Récupérer tous les documents publics de la formation
        $documents = $this->documentRepository->findBy([
            'formation' => $formation,
            'private' => false
        ]);

        $documentsData = [];
        foreach ($documents as $document) {
            $documentsData[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'uploadedAt' => $document->getUploadedAt()->format('c'),
                'downloadUrl' => '/api/formations/' . $formation->getId() . '/documents/' . $document->getId() . '/download'
            ];
        }

        return $this->json($documentsData);
    }

    #[Route('/{id}/documents/{documentId}/download', name: 'app_formations_documents_download', methods: ['GET'])]
    public function downloadDocument(Formation $formation, int $documentId): Response
    {
        $document = $this->documentRepository->findOneBy([
            'id' => $documentId,
            'formation' => $formation,
            'private' => false
        ]);

        if (!$document) {
            return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
        }

        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/documents/' . $document->getFileName();
        
        if (!file_exists($filePath)) {
            return $this->json(['error' => 'File not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->file($filePath, $document->getTitle() ?: $document->getFileName());
    }
}
