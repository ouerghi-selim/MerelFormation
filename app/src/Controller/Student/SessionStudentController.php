<?php

namespace App\Controller\Student;

use AllowDynamicProperties;
use App\Entity\Reservation;
use App\Entity\Session;
use App\Entity\User;
use App\Enum\ReservationStatus;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AllowDynamicProperties] class SessionStudentController extends AbstractController
{
    private $entityManager;
    private $sessionRepository;
    private $userRepository;
    private $passwordHasher;
    private $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        SessionRepository $sessionRepository,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        NotificationService $notificationService

    ) {
        $this->entityManager = $entityManager;
        $this->sessionRepository = $sessionRepository;
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->notificationService = $notificationService;
    }

    /**
     * @Route("/api/student/sessions", name="api_student_sessions", methods={"GET"})
     */
    public function getSessions(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer toutes les réservations confirmées de l'utilisateur
        $reservations = $this->entityManager->getRepository(Reservation::class)
            ->findBy(['user' => $user, 'status' => 'confirmed']);

        $sessions = [];
        foreach ($reservations as $reservation) {
            $session = $reservation->getSession();
            if ($session) {
                $sessions[] = [
                    'id' => $session->getId(),
                    'formation' => [
                        'id' => $session->getFormation()->getId(),
                        'title' => $session->getFormation()->getTitle(),
                        'type' => $session->getFormation()->getType()
                    ],
                    'startDate' => $session->getStartDate()->format('Y-m-d H:i:s'),
                    'endDate' => $session->getEndDate()->format('Y-m-d H:i:s'),
                    'location' => $session->getLocation(),
                    'status' => $session->getStatus(),
                    'reservationStatus' => $reservation->getStatus()
                ];
            }
        }

        return $this->json($sessions);
    }

    /**
     * @Route("/api/student/sessions/{id}", name="api_student_session_detail", methods={"GET"})
     */
    public function getSessionDetail(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        $session = $this->sessionRepository->find($id);
        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Vérifier que l'utilisateur est inscrit à cette session
        $userReservation = $session->findUserReservation($user);
        if (!$userReservation || !in_array($userReservation->getStatus(), ['confirmed', 'completed'])) {
            return $this->json(['message' => 'Accès refusé à cette session'], 403);
        }

        $formation = $session->getFormation();

        // Documents de la formation
        $formationDocuments = [];
        foreach ($formation->getDocuments() as $document) {
            $formationDocuments[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'source' => 'formation',
                'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s')
            ];
        }

        // Documents de la session
        $sessionDocuments = [];
        foreach ($session->getDocuments() as $document) {
            $sessionDocuments[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'fileName' => $document->getFileName(),
                'type' => $document->getType(),
                'category' => $document->getCategory(),
                'source' => 'session',
                'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s')
            ];
        }

        $sessionDetail = [
            'id' => $session->getId(),
            'formation' => [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'description' => $formation->getDescription(),
                'type' => $formation->getType(),
                'duration' => $formation->getDuration()
            ],
            'startDate' => $session->getStartDate()->format('Y-m-d H:i:s'),
            'endDate' => $session->getEndDate()->format('Y-m-d H:i:s'),
            'location' => $session->getLocation(),
            'status' => $session->getStatus(),
            'notes' => $session->getNotes(),
            'instructor' => $session->getInstructor() ? [
                'id' => $session->getInstructor()->getId(),
                'firstName' => $session->getInstructor()->getFirstName(),
                'lastName' => $session->getInstructor()->getLastName()
            ] : null,
            'formationDocuments' => $formationDocuments,
            'sessionDocuments' => $sessionDocuments,
            'allDocuments' => array_merge($formationDocuments, $sessionDocuments)
        ];

        return $this->json($sessionDetail);
    }

    /**
     * @Route("/api/registration", name="api_student_registration", methods={"POST"})
     */
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation des données
        if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email']) || !isset($data['sessionId'])) {
            return $this->json(['message' => 'Données incomplètes'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si la session existe
        $session = $this->sessionRepository->find($data['sessionId']);
        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si la session est disponible
        if ($session->getStatus() !== 'scheduled') {
            return $this->json(['message' => 'Cette session n\'est pas disponible pour inscription'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier s'il y a des places disponibles
        $reservationsCount = count($session->getReservations());
        if ($reservationsCount >= $session->getMaxParticipants()) {
            return $this->json(['message' => 'Plus de places disponibles pour cette session'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'utilisateur existe déjà
        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

        // Si l'utilisateur n'existe pas, le créer
        if (!$user) {
            $firstName = $data['firstName'];
            $lastName = $data['lastName'];

            $user = new User();
            $user->setEmail($data['email']);
            $user->setFirstName($firstName);
            $user->setLastName($lastName);
            $user->setRoles(['ROLE_STUDENT']);

            // Générer un mot de passe temporaire
            $tempPassword = bin2hex(random_bytes(8));
            $hashedPassword = $this->passwordHasher->hashPassword($user, $tempPassword);
            $user->setPassword($hashedPassword);

            // Valider l'utilisateur
            $errors = $this->validator->validate($user);
            if (count($errors) > 0) {
                return $this->json(['message' => (string) $errors], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($user);
        }

        // Vérifier si l'utilisateur n'est pas déjà inscrit à cette session
        foreach ($session->getReservations() as $existingReservation) {
            if ($existingReservation->getUser() === $user) {
                return $this->json(['message' => 'Vous êtes déjà inscrit à cette session'], Response::HTTP_BAD_REQUEST);
            }
        }

        // Créer la réservation
        $reservation = new Reservation();
        $reservation->setUser($user);
        $reservation->setSession($session);
        $reservation->setStatus(ReservationStatus::SUBMITTED);
        $reservation->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();


        // Envoi d'email de demande d'inscription (pas encore confirmée)
        $this->notificationService->notifyAboutRegistrationRequest($reservation);


        return $this->json([
            'message' => 'Demande d\'inscription envoyée! Vous recevrez un email de confirmation une fois validée par notre équipe.',
            'reservationId' => $reservation->getId()
        ], Response::HTTP_CREATED);
    }
}