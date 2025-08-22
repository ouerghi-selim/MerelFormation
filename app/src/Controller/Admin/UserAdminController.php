<?php

namespace App\Controller\Admin;

use App\Repository\SessionRepository;
use App\Repository\DocumentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\UserRepository;
use App\Repository\ReservationRepository;
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
    private $documentRepository;
    private $reservationRepository;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        SessionRepository $sessionRepository,
        NotificationService $notificationService,
        DocumentRepository $documentRepository,
        ReservationRepository $reservationRepository

    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->sessionRepository = $sessionRepository;
        $this->notificationService = $notificationService;
        $this->documentRepository = $documentRepository;
        $this->reservationRepository = $reservationRepository;
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
                'role' => $this->getMainRole($user->getRoles()), // ✅ Méthode corrigée
                'isActive' => $user->isIsActive(),  // Utiliser isIsActive() au lieu de isActive()
                'phone' => $user->getPhone(),
                'specialization' => $user->getSpecialization(),
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
            $companyData = null;
            if ($student->getCompany()) {
                $company = $student->getCompany();
                $companyData = [
                    'id' => $company->getId(),
                    'name' => $company->getName(),
                    'address' => $company->getAddress(),
                    'postalCode' => $company->getPostalCode(),
                    'city' => $company->getCity(),
                    'siret' => $company->getSiret(),
                    'responsableName' => $company->getResponsableName(),
                    'email' => $company->getEmail(),
                    'phone' => $company->getPhone(),
                ];
            }
            
            $formattedStudents[] = [
                'id' => $student->getId(),
                'firstName' => $student->getFirstName(),
                'lastName' => $student->getLastName(),
                'email' => $student->getEmail(),
                'role' => 'ROLE_STUDENT',
                'isActive' => $student->isIsActive(),  // Utiliser isIsActive() au lieu de isActive()
                'phone' => $student->getPhone(),
                'specialization' => $student->getSpecialization(),
                'createdAt' => $student->getCreatedAt() ? $student->getCreatedAt()->format('d/m/Y') : null,
                // Utiliser une date de dernière connexion fictive pour le moment
                'lastLogin' => null,
                'company' => $companyData
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
            'specialization' => $user->getSpecialization(),
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
        if (isset($data['specialization'])) {
            $user->setSpecialization($data['specialization']);
        }

        // Persister l'utilisateur
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Notification email - Bienvenue utilisateur avec mot de passe temporaire
        $this->notificationService->notifyUserWelcome($user, $temporaryPassword);

        return $this->json([
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'role' => $this->getMainRole($user->getRoles()),
            'isActive' => $user->isIsActive(),
            'phone' => $user->getPhone(),
            'specialization' => $user->getSpecialization(),
            'lastLogin' => null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('d/m/Y') : null
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
        if (isset($data['specialization'])) {
            $user->setSpecialization($data['specialization']);
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
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        try {
            // ✅ NIVEAU 1 : DÉSACTIVATION (récupérable pendant 30 jours)
            
            // Notification email - Utilisateur désactivé
            $reason = 'Désactivation du compte par l\'administrateur (récupérable pendant 30 jours)';
            $this->notificationService->notifyUserDeactivated($user, $reason);

            // Sauvegarder les données originales pour restauration
            $user->setOriginalEmail($user->getEmail());
            $user->setOriginalFirstName($user->getFirstName());
            $user->setOriginalLastName($user->getLastName());

            // Désactiver l'utilisateur et marquer comme supprimé (niveau 1)
            $user->setIsActive(false);
            $user->setDeletedAt(new \DateTime());
            $user->setDeletionLevel('deactivated');

            // ✅ GARDER TOUTES LES DONNÉES INTACTES (niveau 1)
            // Pas d'anonymisation - données restaurables

            // ✅ ARCHIVER TOUTES LES RÉSERVATIONS DE L'UTILISATEUR
            $this->archiveUserReservations($user, 'user_deleted');

            // ✅ GARDER TOUTES LES RELATIONS POUR L'AUDIT ET L'HISTORIQUE
            // Les réservations sont archivées mais conservées, documents, factures, locations restent intacts

            // Sauvegarder les modifications
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Utilisateur désactivé avec succès (niveau 1 - récupérable pendant 30 jours)'
            ]);

        } catch (\Exception $e) {
            // En cas d'erreur, retourner le message d'erreur
            
            return $this->json([
                'message' => 'Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurer un utilisateur désactivé (niveau 1 uniquement)
     * @Route("/{id}/restore", name="restore", methods={"POST"})
     */
    public function restore(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer l'utilisateur (même supprimé)
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier que l'utilisateur est au niveau 1 (récupérable)
        if ($user->getDeletionLevel() !== 'deactivated') {
            return $this->json(['message' => 'Cet utilisateur ne peut pas être restauré (niveau de suppression trop avancé)'], 400);
        }

        try {
            // Restaurer l'utilisateur
            $user->setIsActive(true);
            $user->setDeletedAt(null);
            $user->setDeletionLevel(null);
            
            // ✅ RESTAURER LES RÉSERVATIONS ARCHIVÉES POUR CET UTILISATEUR
            $this->restoreUserReservations($user);
            
            // Restaurer les données originales si disponibles
            if ($user->getOriginalEmail()) {
                $user->setEmail($user->getOriginalEmail());
                $user->setOriginalEmail(null);
            }
            if ($user->getOriginalFirstName()) {
                $user->setFirstName($user->getOriginalFirstName());
                $user->setOriginalFirstName(null);
            }
            if ($user->getOriginalLastName()) {
                $user->setLastName($user->getOriginalLastName());
                $user->setOriginalLastName(null);
            }

            $this->entityManager->flush();

            // Notification de restauration
            $this->notificationService->notifyUserReactivated($user);

            return $this->json([
                'message' => 'Utilisateur restauré avec succès'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la restauration de l\'utilisateur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les utilisateurs supprimés avec informations de deadline
     * @Route("/deleted", name="get_deleted", methods={"GET"})
     */
    public function getDeletedUsers(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer tous les utilisateurs supprimés (tous niveaux)
        $deletedUsers = $this->userRepository->createQueryBuilder('u')
            ->andWhere('u.deletedAt IS NOT NULL')
            ->orderBy('u.deletedAt', 'DESC')
            ->getQuery()
            ->getResult();

        $formattedUsers = [];
        $now = new \DateTime();

        foreach ($deletedUsers as $user) {
            $deletedAt = $user->getDeletedAt();
            $anonymizedAt = $user->getAnonymizedAt();
            $level = $user->getDeletionLevel();

            // Calculer les deadlines
            $anonymizationDeadline = null;
            $deletionDeadline = null;
            $daysUntilAnonymization = null;
            $daysUntilDeletion = null;

            if ($level === 'deactivated') {
                // Niveau 1 : 30 jours jusqu'à anonymisation
                $anonymizationDeadline = (clone $deletedAt)->add(new \DateInterval('P30D'));
                $daysUntilAnonymization = $now->diff($anonymizationDeadline)->days;
                if ($anonymizationDeadline < $now) {
                    $daysUntilAnonymization = -$daysUntilAnonymization; // Négatif = en retard
                }
            } elseif ($level === 'anonymized' && $anonymizedAt) {
                // Niveau 2 : 1 an après anonymisation jusqu'à suppression
                $deletionDeadline = (clone $anonymizedAt)->add(new \DateInterval('P1Y'));
                $daysUntilDeletion = $now->diff($deletionDeadline)->days;
                if ($deletionDeadline < $now) {
                    $daysUntilDeletion = -$daysUntilDeletion; // Négatif = en retard
                }
            }

            $formattedUsers[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'originalEmail' => $user->getOriginalEmail(),
                'originalFirstName' => $user->getOriginalFirstName(),
                'originalLastName' => $user->getOriginalLastName(),
                'deletedAt' => $deletedAt->format('d/m/Y H:i'),
                'anonymizedAt' => $anonymizedAt ? $anonymizedAt->format('d/m/Y H:i') : null,
                'deletionLevel' => $level,
                'anonymizationDeadline' => $anonymizationDeadline ? $anonymizationDeadline->format('d/m/Y') : null,
                'deletionDeadline' => $deletionDeadline ? $deletionDeadline->format('d/m/Y') : null,
                'daysUntilAnonymization' => $daysUntilAnonymization,
                'daysUntilDeletion' => $daysUntilDeletion,
                'canRestore' => $level === 'deactivated' && $daysUntilAnonymization > 0,
                'isOverdue' => ($daysUntilAnonymization !== null && $daysUntilAnonymization < 0) || 
                              ($daysUntilDeletion !== null && $daysUntilDeletion < 0)
            ];
        }

        return $this->json($formattedUsers);
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

    /**
     * Récupérer les documents d'inscription d'un utilisateur
     * @Route("/{id}/documents", name="get_user_documents", methods={"GET"})
     */
    public function getUserDocuments(Request $request): JsonResponse
    {
        try {
            $id = $request->attributes->get('id');
            $user = $this->userRepository->find($id);
            if (!$user) {
                return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
            }

            // Récupérer les documents d'inscription de l'utilisateur
            // Critères : category='attestation', user=$user, uploadedBy=$user (documents uploadés par l'utilisateur lui-même)
            $documents = $this->documentRepository->findBy([
                'user' => $user,
                'category' => 'attestation',
                'uploadedBy' => $user
            ], ['uploadedAt' => 'DESC']);

            $documentsData = [];
            foreach ($documents as $document) {
                $documentsData[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'source' => 'inscription',
                    'sourceTitle' => 'Document d\'inscription',
                    'sourceId' => null,
                    'date' => $document->getUploadedAt()->format('d/m/Y'),
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'fileName' => $document->getFileName(),
                    'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                    // Ajouter les champs de validation
                    'validationStatus' => $document->getValidationStatus(),
                    'validatedAt' => $document->getValidatedAt() ? $document->getValidatedAt()->format('Y-m-d H:i:s') : null,
                    'validatedBy' => $document->getValidatedBy() ? [
                        'id' => $document->getValidatedBy()->getId(),
                        'firstName' => $document->getValidatedBy()->getFirstName(),
                        'lastName' => $document->getValidatedBy()->getLastName()
                    ] : null,
                    'rejectionReason' => $document->getRejectionReason()
                ];
            }

            return new JsonResponse($documentsData);
            
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur lors de la récupération des documents'], 500);
        }
    }

    /**
     * ✅ CORRECTION BUG FORMATEURS : Méthode utilitaire pour obtenir le rôle principal
     */
    private function getMainRole(array $roles): string
    {
        // Hiérarchie des rôles : Admin > Instructor > Student
        if (in_array('ROLE_ADMIN', $roles)) {
            return 'ROLE_ADMIN';
        }
        
        if (in_array('ROLE_INSTRUCTOR', $roles)) {
            return 'ROLE_INSTRUCTOR';
        }
        
        // Par défaut, retourner ROLE_STUDENT
        return 'ROLE_STUDENT';
    }

    /**
     * Archiver toutes les réservations d'un utilisateur
     */
    private function archiveUserReservations(User $user, string $reason): void
    {
        $reservations = $this->reservationRepository->findUserReservations($user->getId());
        
        foreach ($reservations as $reservation) {
            if (!$reservation->isArchived()) {
                $reservation->setArchivedAt(new \DateTime());
                $reservation->setArchiveReason($reason);
            }
        }
    }

    /**
     * Restaurer toutes les réservations archivées d'un utilisateur (si archivées pour raison user_deleted)
     */
    private function restoreUserReservations(User $user): void
    {
        $archivedReservations = $this->reservationRepository->createQueryBuilder('r')
            ->andWhere('r.user = :user')
            ->andWhere('r.archivedAt IS NOT NULL')
            ->andWhere('r.archiveReason = :reason')
            ->setParameter('user', $user)
            ->setParameter('reason', 'user_deleted')
            ->getQuery()
            ->getResult();
        
        foreach ($archivedReservations as $reservation) {
            $reservation->setArchivedAt(null);
            $reservation->setArchiveReason(null);
        }
    }
}