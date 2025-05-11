<?php

namespace App\Controller\Student;

use App\Entity\Reservation;
use App\Entity\Session;
use App\Entity\User;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SessionStudentController extends AbstractController
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
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->sessionRepository = $sessionRepository;
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
    }

    /**
     * @Route("/api/registration", name="api_student_registration", methods={"POST"})
     */
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation des données
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['sessionId'])) {
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
            $nameParts = explode(' ', $data['name'], 2);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? $nameParts[1] : '';

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
        $reservation->setStatus('pending');
        $reservation->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        // Envoi d'email de confirmation et/ou notification (à implémenter)
        // ...

        return $this->json([
            'message' => 'Inscription réussie! Vous recevrez un email de confirmation.',
            'reservationId' => $reservation->getId()
        ], Response::HTTP_CREATED);
    }
}