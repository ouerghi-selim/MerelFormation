<?php

namespace App\Controller\Admin;

use App\Entity\Document;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\DocumentRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class DirectDocumentController extends AbstractController
{
    private $security;
    private $userRepository;
    private $documentRepository;
    private $entityManager;
    private $notificationService;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        DocumentRepository $documentRepository,
        EntityManagerInterface $entityManager,
        NotificationService $notificationService
    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->documentRepository = $documentRepository;
        $this->entityManager = $entityManager;
        $this->notificationService = $notificationService;
    }

    #[Route('/students', name: 'get_students', methods: ['GET'])]
    public function getStudents(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin ou formateur
        if (!$this->security->isGranted('ROLE_ADMIN') && !$this->security->isGranted('ROLE_INSTRUCTOR')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les étudiants actifs
        $students = $this->userRepository->searchByCriteria([
            'role' => 'ROLE_STUDENT',
            'active' => true
        ]);

        $formattedStudents = [];
        foreach ($students as $student) {
            $formattedStudents[] = [
                'id' => $student->getId(),
                'firstName' => $student->getFirstName(),
                'lastName' => $student->getLastName(),
                'email' => $student->getEmail(),
                'fullName' => $student->getFirstName() . ' ' . $student->getLastName()
            ];
        }

        // Trier par nom de famille
        usort($formattedStudents, function($a, $b) {
            return strcmp($a['lastName'], $b['lastName']);
        });

        return $this->json($formattedStudents);
    }

    /**
     * @Route("/send", name="send_document", methods={"POST"})
     */
    public function sendDocument(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin ou formateur
        if (!$this->security->isGranted('ROLE_ADMIN') && !$this->security->isGranted('ROLE_INSTRUCTOR')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');
        $title = $request->request->get('title');
        $studentId = $request->request->get('studentId');
        $message = $request->request->get('message', '');

        // Validation des données
        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier fourni'], 400);
        }

        if (!$title) {
            return $this->json(['message' => 'Titre requis'], 400);
        }

        if (!$studentId) {
            return $this->json(['message' => 'Étudiant requis'], 400);
        }

        // Récupérer l'étudiant
        $student = $this->userRepository->find($studentId);
        if (!$student) {
            return $this->json(['message' => 'Étudiant non trouvé'], 404);
        }

        // Vérifier que c'est bien un étudiant
        if (!in_array('ROLE_STUDENT', $student->getRoles())) {
            return $this->json(['message' => 'L\'utilisateur sélectionné n\'est pas un étudiant'], 400);
        }

        // Types de fichiers autorisés (étendus par rapport aux sessions)
        $allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        if (!in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
            return $this->json([
                'message' => 'Type de fichier non autorisé. Types acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF',
                'receivedType' => $uploadedFile->getMimeType()
            ], 400);
        }

        // Validation de la taille (10MB max)
        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($uploadedFile->getSize() > $maxSize) {
            return $this->json([
                'message' => 'Fichier trop volumineux. Taille maximum : 10MB',
                'receivedSize' => round($uploadedFile->getSize() / 1024 / 1024, 2) . 'MB'
            ], 400);
        }

        // Validation du titre
        if (strlen($title) < 3 || strlen($title) > 255) {
            return $this->json(['message' => 'Le titre doit contenir entre 3 et 255 caractères'], 400);
        }

        try {
            // Créer le document
            $document = new Document();
            $document->setTitle($title);
            $document->setType($uploadedFile->getClientOriginalExtension());
            $document->setCategory('direct'); // 🆕 Nouvelle catégorie pour documents directs
            $document->setUser($student); // 🆕 Associer à l'étudiant destinataire
            $document->setUploadedBy($this->getUser()); // Qui a envoyé le document
            $document->setFile($uploadedFile); // VichUploader gère tout !

            $this->entityManager->persist($document);
            $this->entityManager->flush();

            // 🆕 Notification par email
            try {
                $this->notificationService->notifyAboutDirectDocumentSent($document, $message);
            } catch (\Exception $emailError) {
                // Log l'erreur mais ne pas bloquer la création du document
                error_log('Erreur envoi email notification document direct: ' . $emailError->getMessage());
            }

            return $this->json([
                'message' => 'Document envoyé avec succès à ' . $student->getFirstName() . ' ' . $student->getLastName(),
                'document' => [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'fileName' => $document->getFileName(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'student' => [
                        'id' => $student->getId(),
                        'firstName' => $student->getFirstName(),
                        'lastName' => $student->getLastName(),
                        'email' => $student->getEmail()
                    ],
                    'uploadedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
                    'uploadedBy' => [
                        'firstName' => $this->getUser()->getFirstName(),
                        'lastName' => $this->getUser()->getLastName()
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de l\'envoi du document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/sent", name="get_sent_documents", methods={"GET"})
     */
    public function getSentDocuments(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin ou formateur
        if (!$this->security->isGranted('ROLE_ADMIN') && !$this->security->isGranted('ROLE_INSTRUCTOR')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer tous les documents directs envoyés
        $documents = $this->documentRepository->findBy(
            ['category' => 'direct'], 
            ['uploadedAt' => 'DESC']
        );

        $formattedDocuments = [];
        foreach ($documents as $document) {
            $student = $document->getUser();
            $sender = $document->getUploadedBy();
            
            $formattedDocuments[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                'uploadedAtFormatted' => $document->getUploadedAt()->format('d/m/Y H:i'),
                'student' => $student ? [
                    'id' => $student->getId(),
                    'firstName' => $student->getFirstName(),
                    'lastName' => $student->getLastName(),
                    'email' => $student->getEmail(),
                    'fullName' => $student->getFirstName() . ' ' . $student->getLastName()
                ] : null,
                'uploadedBy' => $sender ? [
                    'firstName' => $sender->getFirstName(),
                    'lastName' => $sender->getLastName(),
                    'fullName' => $sender->getFirstName() . ' ' . $sender->getLastName()
                ] : null
            ];
        }

        return $this->json($formattedDocuments);
    }

    /**
     * @Route("/{id}", name="delete_document", methods={"DELETE"})
     */
    public function deleteDocument(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin ou formateur
        if (!$this->security->isGranted('ROLE_ADMIN') && !$this->security->isGranted('ROLE_INSTRUCTOR')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $document = $this->documentRepository->find($id);
        if (!$document) {
            return $this->json(['message' => 'Document non trouvé'], 404);
        }

        // Vérifier que c'est bien un document direct
        if ($document->getCategory() !== 'direct') {
            return $this->json(['message' => 'Seuls les documents directs peuvent être supprimés ici'], 400);
        }

        // Les formateurs ne peuvent supprimer que leurs propres documents
        if ($this->security->isGranted('ROLE_INSTRUCTOR') && !$this->security->isGranted('ROLE_ADMIN')) {
            if ($document->getUploadedBy() !== $this->getUser()) {
                return $this->json(['message' => 'Vous ne pouvez supprimer que vos propres documents'], 403);
            }
        }

        try {
            $this->entityManager->remove($document);
            $this->entityManager->flush();

            return $this->json(['message' => 'Document supprimé avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression du document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}