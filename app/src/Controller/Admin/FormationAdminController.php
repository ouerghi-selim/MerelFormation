<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\FormationRepository;
use App\Entity\Formation;
use App\Entity\Module;
use App\Entity\ModulePoint;
use App\Entity\Prerequisite;
use App\Entity\Document;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

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
        // Build criteria array from GET parameters
        $criteria = [];

        // Filter by title (string contains)
        if (null !== $title = $request->query->get('title')) {
            $criteria['title'] = trim($title);
        }

        // Filter by exact type
        if (null !== $type = $request->query->get('type')) {
            $criteria['type'] = $type;
        }

        // Optionally filter by minimum price
        if (null !== $min = $request->query->get('priceMin')) {
            $criteria['priceMin'] = (float) $min;
        }

        // Optionally filter by maximum price
        if (null !== $max = $request->query->get('priceMax')) {
            $criteria['priceMax'] = (float) $max;
        }

        // Optionally filter by category
        if (null !== $cat = $request->query->get('categoryId')) {
            $criteria['categoryId'] = (int) $cat;
        }

        // Optionally require available future sessions
        if ($request->query->getBoolean('hasAvailableSessions')) {
            $criteria['hasAvailableSessions'] = true;
        }

        // Fetch with dynamic criteria
        $formations = $this->formationRepository->searchByCriteria($criteria);

        // Formater les données pour le frontend
        $formattedFormations = [];
        foreach ($formations as $formation) {
            $formattedFormations[] = [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'type' => $formation->getType(),
                'duration' => $formation->getDuration(),
                'price' => $formation->getPrice(),
                'isActive' => $formation->isIsActive()
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

        // Formater les modules
        $modules = [];
        foreach ($formation->getModules() as $module) {
            $modulePoints = [];
            foreach ($module->getPoints() as $point) {
                $modulePoints[] = [
                    'id' => $point->getId(),
                    'content' => $point->getContent()
                ];
            }

            $modules[] = [
                'id' => $module->getId(),
                'title' => $module->getTitle(),
                'duration' => $module->getDuration(),
                'order' => $module->getPosition(),
                'points' => $modulePoints
            ];
        }

        // Formater les prérequis
        $prerequisites = [];
        foreach ($formation->getPrerequisites() as $prerequisite) {
            $prerequisites[] = [
                'id' => $prerequisite->getId(),
                'description' => $prerequisite->getContent()
            ];
        }

        // Formater les sessions
        $sessions = [];
        foreach ($formation->getSessions() as $session) {
            $sessions[] = [
                'id' => $session->getId(),
                'startDate' => $session->getStartDate()->format('Y-m-d H:i:s'),
                'endDate' => $session->getEndDate()->format('Y-m-d H:i:s'),
                'maxParticipants' => $session->getMaxParticipants(),
                'status' => $session->getStatus()
            ];
        }

        // Formater les documents
        $documents = [];
        foreach ($formation->getDocuments() as $document) {
            $filePath = '/path/to/uploads/' . $document->getFileName();
            $fileSize = file_exists($filePath) ? filesize($filePath) : null;
            $documents[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'uploadedAt' => $document->getUploadedAt()->format('Y-m-d\TH:i:s.v\Z'), // Format ISO
                'uploadedBy' => $document->getUploadedBy() ? $document->getUploadedBy()->getEmail() : null,
                'fileSize' => $fileSize ? $this->formatFileSize($fileSize) : 'N/A',
                'downloadUrl' => '/uploads/documents/' . $document->getFileName() // AJOUTER cette ligne
            ];
        }

        // Formater les données pour le frontend
        $formattedFormation = [
            'id' => $formation->getId(),
            'title' => $formation->getTitle(),
            'description' => $formation->getDescription(),
            'type' => $formation->getType(),
            'duration' => $formation->getDuration(),
            'price' => $formation->getPrice(),
            'isActive' => $formation->isIsActive(),
            'modules' => $modules,
            'prerequisites' => $prerequisites,
            'sessions' => $sessions,
            'documents' => $documents
        ];

        return $this->json($formattedFormation);
    }

    /**
     * @Route("/{id}/documents", name="get_documents", methods={"GET"})
     */
    public function getDocuments(int $id): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $formation = $this->formationRepository->find($id);
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        $documents = [];

        foreach ($formation->getDocuments() as $document) {
            $filePath = '/path/to/uploads/' . $document->getFileName();
            $fileSize = file_exists($filePath) ? filesize($filePath) : null;
            $documents[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'uploadedAt' => $document->getUploadedAt()->format('Y-m-d\TH:i:s.v\Z'), // Format ISO
                'uploadedBy' => $document->getUploadedBy() ? $document->getUploadedBy()->getEmail() : null,
                'fileSize' => $fileSize ? $this->formatFileSize($fileSize) : 'N/A',
                'downloadUrl' => '/uploads/documents/' . $document->getFileName() // AJOUTER cette ligne
            ];
        }

        return $this->json($documents);
    }

    /**
     * @Route("/{id}/documents", name="upload_document", methods={"POST"})
     */
    public function uploadDocument(int $id, Request $request): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $formation = $this->formationRepository->find($id);
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');
        $title = $uploadedFile->getClientOriginalName();
        $category = $request->request->get('category', 'support');

        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier fourni'], 400);
        }

        if (!$title) {
            return $this->json(['message' => 'Titre requis'], 400);
        }

        // Valider le type de fichier
        $allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
            return $this->json(['message' => 'Type de fichier non autorisé'], 400);
        }

        // Créer le document
        $document = new Document();
        $document->setTitle($title);
        $document->setType($uploadedFile->getClientOriginalExtension());
        $document->setCategory($category);
        $document->setFormation($formation);
        $document->setUploadedBy($this->getUser());
        $document->setFile($uploadedFile);

        $this->entityManager->persist($document);
        $this->entityManager->flush();
        $filePath = '/path/to/uploads/' . $document->getFileName();
        $fileSize = file_exists($filePath) ? filesize($filePath) : null;
        return $this->json([
            'message' => 'Document ajouté avec succès',
            'document' => [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'uploadedAt' => $document->getUploadedAt()->format('Y-m-d\TH:i:s.v\Z'), // Format ISO
                'uploadedBy' => $document->getUploadedBy() ? $document->getUploadedBy()->getEmail() : null,
                'fileSize' => $fileSize ? $this->formatFileSize($fileSize) : 'N/A',
                'downloadUrl' => '/uploads/documents/' . $document->getFileName() // AJOUTER cette ligne
            ]
        ], 201);
    }

    /**
     * @Route("/{id}/documents/{documentId}", name="delete_document", methods={"DELETE"})
     */
    public function deleteDocument(int $id, int $documentId): JsonResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $formation = $this->formationRepository->find($id);
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        $document = $this->entityManager->getRepository(Document::class)->find($documentId);
        if (!$document || $document->getFormation() !== $formation) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }
        try {

        $this->entityManager->remove($document);
        $this->entityManager->flush();
        $this->entityManager->clear(); // AJOUTER CETTE LIGNE


        return $this->json(['message' => 'Document supprimé avec succès']);
        } catch (\Exception $e) {
            // Log l'erreur mais retourner un succès si le document n'existe plus
        $documentStillExists = $this->entityManager->getRepository(Document::class)->find($documentId);

        if (!$documentStillExists) {
            // Le document a été supprimé malgré l'erreur
        return $this->json(['message' => 'Document supprimé avec succès']);
        }

        // Si le document existe encore, il y a eu un vrai problème
        return $this->json(['message' => 'Erreur lors de la suppression du document'], 500);
        }
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

        // Ajouter les modules
        if (isset($data['modules']) && is_array($data['modules'])) {
            foreach ($data['modules'] as $moduleData) {
                $module = new Module();
                $module->setTitle($moduleData['title']);
                $module->setDuration($moduleData['duration']);
                $module->setFormation($formation);

                // Ajouter les points du module
                if (isset($moduleData['points']) && is_array($moduleData['points'])) {
                    foreach ($moduleData['points'] as $pointData) {
                        $point = new ModulePoint();
                        $point->setContent($pointData['content']);
                        $point->setModule($module);
                        $this->entityManager->persist($point);
                        $module->addPoint($point);
                    }
                }

                $this->entityManager->persist($module);
                $formation->addModule($module);
            }
        }

        // Ajouter les prérequis
        if (isset($data['prerequisites']) && is_array($data['prerequisites'])) {
            foreach ($data['prerequisites'] as $prerequisiteData) {
                $prerequisite = new Prerequisite();
                $prerequisite->setContent($prerequisiteData['description']);
                $prerequisite->setFormation($formation);

                $this->entityManager->persist($prerequisite);
                $formation->addPrerequisite($prerequisite);
            }
        }

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

        // Mettre à jour les modules
        if (isset($data['modules']) && is_array($data['modules'])) {
            // Supprimer les modules existants et leurs points
            foreach ($formation->getModules() as $existingModule) {
                // Supprimer les points du module
                foreach ($existingModule->getPoints() as $point) {
                    $existingModule->removePoint($point);
                    $this->entityManager->remove($point);
                }

                $formation->removeModule($existingModule);
                $this->entityManager->remove($existingModule);
            }

            // Ajouter les nouveaux modules
            foreach ($data['modules'] as $index => $moduleData) {
                $module = new Module();
                $module->setTitle($moduleData['title']);
                $module->setDuration($moduleData['duration']);
                // Ajouter l'ordre si disponible ou utiliser l'index
                $module->setPosition($moduleData['order'] ?? ($index + 1));
                $module->setFormation($formation);

                // Ajouter les points du module
                if (isset($moduleData['points']) && is_array($moduleData['points'])) {
                    foreach ($moduleData['points'] as $pointData) {
                        $point = new ModulePoint();
                        $point->setContent($pointData['content']);
                        $point->setModule($module);
                        $this->entityManager->persist($point);
                        $module->addPoint($point);
                    }
                }

                $this->entityManager->persist($module);
                $formation->addModule($module);
            }
        }

        // Mettre à jour les prérequis
        if (isset($data['prerequisites']) && is_array($data['prerequisites'])) {
            // Supprimer les prérequis existants
            foreach ($formation->getPrerequisites() as $existingPrerequisite) {
                $formation->removePrerequisite($existingPrerequisite);
                $this->entityManager->remove($existingPrerequisite);
            }

            // Ajouter les nouveaux prérequis
            foreach ($data['prerequisites'] as $prerequisiteData) {
                $prerequisite = new Prerequisite();
                $prerequisite->setContent($prerequisiteData['description']);
                $prerequisite->setFormation($formation);

                $this->entityManager->persist($prerequisite);
                $formation->addPrerequisite($prerequisite);
            }
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

    /**
     * @Route("/sessions", name="get_sessions", methods={"GET"})
     */
    public function getSessions(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Cette méthode peut être implémentée pour récupérer toutes les sessions
        // pour l'affichage dans l'interface d'administration

        // Pour l'instant, retourner un message indiquant que cette fonctionnalité est à implémenter
        return $this->json([
            'message' => 'Fonctionnalité à implémenter'
        ]);
    }

    private function formatFileSize(?int $bytes): string
    {
        if (!$bytes) return 'N/A';

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}