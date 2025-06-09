<?php

namespace App\Controller\Admin;

use App\Repository\SessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\UserRepository;
use App\Entity\User;
use App\Entity\Session;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\NotificationService;

/**
 * @Route("/api/admin/users", name="api_admin_users_")
 */
class UserAdminController extends AbstractController
{
    private $security;
    private $userRepository;
    private $entityManager;
    private $passwordHasher;
    private $sessionRepository;
    private $notificationService;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        SessionRepository $sessionRepository,
        NotificationService $notificationService

    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->sessionRepository = $sessionRepository;
        $this->notificationService = $notificationService;
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
        $criteria = [];

        // Filtre par recherche (nom, prénom, email)
        if ($search = $request->query->get('search')) {
            $criteria['name'] = $search;
        }

        // Filtre par rôle
        if ($role = $request->query->get('role')) {
            $criteria['role'] = $role;
        }

        // Filtre par statut (actif/inactif)
        if ($status = $request->query->get('status')) {
            $criteria['active'] = $status === 'active' ? true : false;
        }

        // Utiliser la méthode searchByCriteria du repository
        $users = $this->userRepository->searchByCriteria($criteria);

        // Formater les données pour le frontend
        $formattedUsers = [];
        foreach ($users as $user) {
            $formattedUsers[] = [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'role' => $user->getRoles()[0] ?? 'ROLE_STUDENT', // Prendre le premier rôle
                'isActive' => $user->isIsActive(),  // Utiliser isIsActive() au lieu de isActive()
                'phone' => $user->getPhone(),
                // Ajouter la date de création au format français
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('d/m/Y') : null
            ];
        }

        return $this->json($formattedUsers);
    }
    /**
     * @Route("/{id}/sessions", name="get_user_sessions", methods={"GET"})
     */
    public function getUserSessions(int $id): JsonResponse
    {
        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $formattedSessions = [];
        $sessions = [];

        // Vérifier le rôle de l'utilisateur pour déterminer la méthode de recherche
        if (in_array('ROLE_INSTRUCTOR', $user->getRoles())) {
            // Pour un formateur, récupérer les sessions où il est instructeur
            $sessions = $this->sessionRepository->findByInstructor($id);
        } else if (in_array('ROLE_STUDENT', $user->getRoles())) {
            // Pour un élève, récupérer les sessions où il est participant
            $sessions = $this->sessionRepository->findByParticipant($id);
        } else {
            // Pour les autres rôles, retourner un tableau vide
            return $this->json([]);
        }

        // Formater les données
        foreach ($sessions as $session) {
            $formattedSessions[] = [
                'id' => $session->getId(),
                'title' => $session->getFormation()->getTitle(),
                'startDate' => $session->getStartDate()->format('Y-m-d'),
                'endDate' => $session->getEndDate()->format('Y-m-d'),
                'location' => $session->getLocation(),
                'type' => $session->getFormation()->getType(),
                'status' => $session->getStatus()
            ];
        }

        return $this->json($formattedSessions);
    }

    /**
     * @Route("/students", name="list_students", methods={"GET"})
     */
    public function listStudents(Request $request): JsonResponse
    {

        // Récupérer les paramètres de filtrage
        $criteria = [];

        // Filtre par recherche (nom, prénom, email)
        if ($search = $request->query->get('search')) {
            $criteria['name'] = $search;
        }

        // Filtre par rôle ROLE_STUDENT - utiliser LIKE au lieu de JSON_CONTAINS
        $criteria['role'] = 'ROLE_STUDENT';

        // Filtre par statut (actif/inactif)
        if ($status = $request->query->get('status')) {
            $criteria['active'] = $status === 'active' ? true : false;
        }

        // Récupérer les étudiants
        $students = $this->userRepository->searchByCriteria($criteria);

        // Formater les données pour le frontend
        $formattedStudents = [];
        foreach ($students as $student) {
            $formattedStudents[] = [
                'id' => $student->getId(),
                'firstName' => $student->getFirstName(),
                'lastName' => $student->getLastName(),
                'email' => $student->getEmail(),
                'role' => 'ROLE_STUDENT',
                'isActive' => $student->isIsActive(),  // Utiliser isIsActive() au lieu de isActive()
                'phone' => $student->getPhone(),
                'createdAt' => $student->getCreatedAt() ? $student->getCreatedAt()->format('d/m/Y') : null,
                // Utiliser une date de dernière connexion fictive pour le moment
                'lastLogin' => null
            ];
        }

        return $this->json($formattedStudents);
    }

    /**
     * @Route("/{id}", name="get", methods={"GET"}, requirements={"id"="\d+"})
     */
    public function get( $id): JsonResponse
    {

        $id = (int) $id;
        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Formater les données pour le frontend
        $formattedUser = [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'role' => $user->getRoles()[0] ?? 'ROLE_STUDENT',
            'isActive' => $user->isIsActive(),  // Utiliser isIsActive() au lieu de isActive()
            'phone' => $user->getPhone(),
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('d/m/Y') : null,
            'lastLogin' => null  // À implémenter si vous ajoutez ce champ à l'entité
        ];

        return $this->json($formattedUser);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Valider les données
//        if (!isset($data['email']) || !isset($data['password']) || !isset($data['firstName']) || !isset($data['lastName'])) {
//            return $this->json(['message' => 'Données invalides'], 400);
//        }

        // Vérifier si l'email existe déjà
        $existingUser = $this->userRepository->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['message' => 'Cet email est déjà utilisé'], 400);
        }

        // Créer un nouvel utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);

        // Définir le rôle (par défaut ROLE_STUDENT si non spécifié)
        $role = $data['role'] ?? 'ROLE_STUDENT';
        $user->setRoles([$role]);

        // Générer un mot de passe temporaire
        $temporaryPassword = "passtest"; // En production, générer un mot de passe aléatoire
        $hashedPassword = $this->passwordHasher->hashPassword($user, $temporaryPassword);
        $user->setPassword($hashedPassword);

        // Définir les autres champs
        $user->setIsActive($data['isActive'] ?? true);
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        // Persister l'utilisateur
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Notification email - Bienvenue utilisateur avec mot de passe temporaire
        $this->notificationService->notifyUserWelcome($user, $temporaryPassword);

        return $this->json([
            'message' => 'Utilisateur créé avec succès',
            'id' => $user->getId()
        ], 201);
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Construire la description des changements pour la notification
        $changes = [];
        if (isset($data['firstName']) && $data['firstName'] !== $user->getFirstName()) {
            $changes[] = 'Prénom modifié: ' . $data['firstName'];
        }
        if (isset($data['lastName']) && $data['lastName'] !== $user->getLastName()) {
            $changes[] = 'Nom modifié: ' . $data['lastName'];
        }
        if (isset($data['email']) && $data['email'] !== $user->getEmail()) {
            $changes[] = 'Email modifié: ' . $data['email'];
        }
        if (isset($data['role']) && !in_array($data['role'], $user->getRoles())) {
            $changes[] = 'Rôle modifié: ' . $data['role'];
        }
        if (isset($data['isActive']) && $data['isActive'] !== $user->isIsActive()) {
            $changes[] = 'Statut modifié: ' . ($data['isActive'] ? 'Activé' : 'Désactivé');
        }

        // Mettre à jour l'utilisateur
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        if (isset($data['email'])) {
            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            $existingUser = $this->userRepository->findOneBy(['email' => $data['email']]);
            if ($existingUser && $existingUser->getId() !== $id) {
                return $this->json(['message' => 'Cet email est déjà utilisé'], 400);
            }
            $user->setEmail($data['email']);
        }
        if (isset($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }
        if (isset($data['role'])) {
            $user->setRoles([$data['role']]);
        }
        if (isset($data['isActive'])) {
            $user->setIsActive($data['isActive']);
        }
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        // Persister les modifications
        $this->entityManager->flush();

        // Notification email - Utilisateur modifié (si des changements significatifs)
        if (!empty($changes)) {
            $changesDescription = implode(', ', $changes);
            $this->notificationService->notifyUserUpdated($user, $changesDescription, $this->getUser());
        }

        return $this->json([
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Notification email - Utilisateur désactivé (avant suppression)
        $reason = 'Suppression du compte par l\'administrateur';
        $this->notificationService->notifyUserDeactivated($user, $reason);

        // Supprimer l'utilisateur
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * @Route("/{id}/formations", name="get_user_formations", methods={"GET"})
     */
    public function getUserFormations(int $id): JsonResponse
    {
        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Récupérer les réservations (inscriptions) de l'utilisateur
        $reservations = $user->getReservations();

        // Formater les données pour le frontend
        $formattedFormations = [];
        foreach ($reservations as $reservation) {
            // Récupérer la session liée à la réservation
            $session = $reservation->getSession();
            if (!$session) continue;

            // Récupérer la formation liée à la session
            $formation = $session->getFormation();
            if (!$formation) continue;

            $formattedFormations[] = [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'type' => $formation->getType(),
                'status' => $reservation->getStatus(),
                'startDate' => $session->getStartDate() ? $session->getStartDate()->format('Y-m-d') : null,
                'endDate' => $session->getEndDate() ? $session->getEndDate()->format('Y-m-d') : null
            ];
        }

        return $this->json($formattedFormations);
    }
}