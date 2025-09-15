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
use App\Repository\CompanyRepository;
use App\Entity\User;
use App\Entity\Session;
use App\Entity\Company;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\NotificationService;

/**
 * @Route("/api/admin/users", name="api_admin_users_")
 */
class UserAdminController extends AbstractController
{
    private $security;
    private $userRepository;
    private $companyRepository;
    private $entityManager;
    private $passwordHasher;
    private $sessionRepository;
    private $notificationService;
    private $documentRepository;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        CompanyRepository $companyRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        SessionRepository $sessionRepository,
        NotificationService $notificationService,
        DocumentRepository $documentRepository

    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->companyRepository = $companyRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->sessionRepository = $sessionRepository;
        $this->notificationService = $notificationService;
        $this->documentRepository = $documentRepository;
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

        // Formater les données complètes pour le frontend
        $formattedUser = [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'role' => $user->getRoles()[0] ?? 'ROLE_STUDENT',
            'roles' => $user->getRoles(),
            'isActive' => $user->isIsActive(),  // Utiliser isIsActive() au lieu de isActive()
            'phone' => $user->getPhone(),
            'specialization' => $user->getSpecialization(),
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('d/m/Y') : null,
            'createdAtFull' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d\TH:i:s') : null,
            // 🆕 Informations personnelles complètes
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'birthPlace' => $user->getBirthPlace(),
            'address' => $user->getAddress(),
            'postalCode' => $user->getPostalCode(),
            'city' => $user->getCity(),
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
            $user->setDeletedAt(new \DateTime()); // ✅ GEDMO : Utilise maintenant le champ Gedmo
            $user->setDeletionLevel('deactivated');

            // ✅ GARDER TOUTES LES DONNÉES INTACTES (niveau 1)
            // Pas d'anonymisation - données restaurables

            // ✅ ARCHIVAGE AUTOMATIQUE EN CASCADE
            // L'EventListener SoftDeleteCascadeListener s'occupe automatiquement
            // d'archiver toutes les relations (Reservations, Documents, etc.)

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

        // ✅ DÉSACTIVER LE FILTRE GEDMO pour récupérer l'utilisateur archivé
        $filters = $this->entityManager->getFilters();
        $softDeleteableWasEnabled = $filters->isEnabled('softdeleteable');
        
        if ($softDeleteableWasEnabled) {
            $filters->disable('softdeleteable');
        }

        try {
            // Récupérer l'utilisateur (même supprimé)
            $user = $this->userRepository->find($id);
        } finally {
            // ✅ RÉACTIVER LE FILTRE GEDMO
            if ($softDeleteableWasEnabled) {
                $filters->enable('softdeleteable');
            }
        }

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
            
            // ✅ RESTAURATION AUTOMATIQUE EN CASCADE
            // L'EventListener SoftDeleteCascadeListener s'occupe automatiquement
            // de restaurer toutes les relations archivées
            
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
     * Forcer la suppression définitive d'un utilisateur (bypass délais RGPD)
     * @Route("/{id}/force-delete", name="force_delete", methods={"POST"})
     */
    public function forceDelete(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // ✅ DÉSACTIVER LE FILTRE GEDMO pour récupérer l'utilisateur même s'il est supprimé
        $filters = $this->entityManager->getFilters();
        $softDeleteableWasEnabled = $filters->isEnabled('softdeleteable');
        
        if ($softDeleteableWasEnabled) {
            $filters->disable('softdeleteable');
        }

        try {
            // Récupérer l'utilisateur (même supprimé) avec toutes ses relations
            $user = $this->userRepository->createQueryBuilder('u')
                ->leftJoin('u.reservations', 'r')
                ->leftJoin('u.documents', 'd')
                ->leftJoin('u.vehicleRentals', 'vr')
                ->leftJoin('u.invoices', 'i')
                ->leftJoin('u.notifications', 'n')
                ->addSelect('r', 'd', 'vr', 'i', 'n')
                ->where('u.id = :id')
                ->setParameter('id', $id)
                ->getQuery()
                ->getOneOrNullResult();
        } finally {
            // ✅ RÉACTIVER LE FILTRE GEDMO
            if ($softDeleteableWasEnabled) {
                $filters->enable('softdeleteable');
            }
        }

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier que l'utilisateur est bien dans un état supprimé
        if (!$user->getDeletedAt()) {
            return $this->json(['message' => 'Cet utilisateur n\'est pas supprimé'], 400);
        }

        // Vérifier que l'utilisateur n'est pas déjà définitivement supprimé
        if ($user->getDeletionLevel() === 'permanent') {
            return $this->json(['message' => 'Cet utilisateur est déjà définitivement supprimé'], 400);
        }

        try {
            // SUPPRESSION DÉFINITIVE FORCÉE
            
            // Log de sécurité pour audit
            $adminUser = $this->security->getUser();
            $adminEmail = $adminUser ? $adminUser->getUserIdentifier() : 'système';
            
            error_log(sprintf(
                '[AUDIT] SUPPRESSION FORCÉE - Admin: %s | User ID: %d | Email: %s | Niveau: %s | Date: %s',
                $adminEmail,
                $user->getId(),
                $user->getEmail(),
                $user->getDeletionLevel() ?? 'inconnu',
                (new \DateTime())->format('Y-m-d H:i:s')
            ));

            // Marquer le niveau comme permanent avant suppression
            $user->setDeletionLevel('permanent');

            // Désactiver temporairement les contraintes de clés étrangères
            $connection = $this->entityManager->getConnection();
            $connection->executeStatement('SET FOREIGN_KEY_CHECKS = 0');

            // NETTOYAGE COMPLET DE TOUTES LES RELATIONS
            
            // 0. Gérer les relations inverses où l'utilisateur peut être instructeur
            // Retirer cet utilisateur de toutes les sessions où il est instructeur
            $sessions = $this->entityManager->getRepository(\App\Entity\Session::class)
                ->createQueryBuilder('s')
                ->join('s.instructors', 'i')
                ->where('i.id = :userId')
                ->setParameter('userId', $user->getId())
                ->getQuery()
                ->getResult();
            
            foreach ($sessions as $session) {
                $session->getInstructors()->removeElement($user);
            }

            // Retirer uploadedBy des documents où cet utilisateur était l'uploader
            $uploadedDocuments = $this->documentRepository->findBy(['uploadedBy' => $user]);
            foreach ($uploadedDocuments as $document) {
                $document->setUploadedBy(null); // Anonymiser au lieu de supprimer
            }
            
            // 1. Supprimer toutes les notifications liées
            foreach ($user->getNotifications() as $notification) {
                $this->entityManager->remove($notification);
            }

            // 2. Supprimer toutes les réservations liées
            foreach ($user->getReservations() as $reservation) {
                $this->entityManager->remove($reservation);
            }

            // 3. Supprimer toutes les locations de véhicules
            foreach ($user->getVehicleRentals() as $vehicleRental) {
                $this->entityManager->remove($vehicleRental);
            }

            // 4. Supprimer tous les documents liés (ou les archiver selon la stratégie)
            foreach ($user->getDocuments() as $document) {
                // Option 1: Supprimer complètement
                $this->entityManager->remove($document);
                // Option 2: Anonymiser (décommenter si préféré)
                // $document->setUser(null);
                // $document->setTitle('Document d\'utilisateur supprimé');
            }

            // 5. Supprimer toutes les factures liées (ou les anonymiser)
            foreach ($user->getInvoices() as $invoice) {
                // Option 1: Supprimer complètement
                $this->entityManager->remove($invoice);
                // Option 2: Anonymiser (décommenter si préféré)
                // $invoice->setUser(null);
            }

            // Persister toutes ces suppressions AVANT de supprimer l'utilisateur
            $this->entityManager->flush();

            // 6. Supprimer définitivement l'utilisateur de la base de données
            $this->entityManager->remove($user);
            $this->entityManager->flush();

            // Réactiver les contraintes de clés étrangères
            $connection->executeStatement('SET FOREIGN_KEY_CHECKS = 1');

            return $this->json([
                'message' => 'Utilisateur supprimé définitivement avec succès'
            ]);

        } catch (\Exception $e) {
            // Réactiver les contraintes en cas d'erreur
            try {
                $connection = $this->entityManager->getConnection();
                $connection->executeStatement('SET FOREIGN_KEY_CHECKS = 1');
            } catch (\Exception $connectionError) {
                // Ignorer les erreurs de reconnexion
            }

            // Log de l'erreur pour debug
            error_log(sprintf(
                '[ERREUR] SUPPRESSION FORCÉE ÉCHOUÉE - User ID: %d | Erreur: %s | Date: %s',
                $user->getId(),
                $e->getMessage(),
                (new \DateTime())->format('Y-m-d H:i:s')
            ));

            return $this->json([
                'message' => 'Erreur lors de la suppression forcée: ' . $e->getMessage()
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

        // ✅ DÉSACTIVER TEMPORAIREMENT LE FILTRE GEDMO pour récupérer les utilisateurs archivés
        $filters = $this->entityManager->getFilters();
        $softDeleteableWasEnabled = $filters->isEnabled('softdeleteable');
        
        if ($softDeleteableWasEnabled) {
            $filters->disable('softdeleteable');
        }

        try {
            // Récupérer tous les utilisateurs supprimés (tous niveaux)
            $deletedUsers = $this->userRepository->createQueryBuilder('u')
                ->andWhere('u.deletedAt IS NOT NULL')
                ->orderBy('u.deletedAt', 'DESC')
                ->getQuery()
                ->getResult();
            
            
        } finally {
            // ✅ RÉACTIVER LE FILTRE GEDMO après la requête
            if ($softDeleteableWasEnabled) {
                $filters->enable('softdeleteable');
            }
        }

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
     * Récupérer tous les documents d'un utilisateur (inscription + directs)
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

            // 🔧 Désactiver temporairement le filtre Gedmo pour accéder aux documents avec uploadedBy soft-deleted
            $filters = $this->entityManager->getFilters();
            $filterWasEnabled = false;
            
            if ($filters->has('softdeleteable') && $filters->isEnabled('softdeleteable')) {
                $filters->disable('softdeleteable');
                $filterWasEnabled = true;
            }

            try {
                // 1. Récupérer les documents d'inscription de l'utilisateur
                // Critères : category='attestation', user=$user, uploadedBy=$user (documents uploadés par l'utilisateur lui-même)
                $inscriptionDocuments = $this->documentRepository->findBy([
                    'user' => $user,
                    'category' => 'attestation',
                    'uploadedBy' => $user
                ], ['uploadedAt' => 'DESC']);

                // 2. Récupérer les documents directs envoyés À cet utilisateur
                // Critères : category='direct', user=$user (peu importe qui les a uploadés)
                $directDocuments = $this->documentRepository->findBy([
                    'user' => $user,
                    'category' => 'direct'
                ], ['uploadedAt' => 'DESC']);

                // 3. Combiner tous les documents
                $allDocuments = array_merge($inscriptionDocuments, $directDocuments);
                
                // 4. Trier par date d'upload décroissante
                usort($allDocuments, function($a, $b) {
                    return $b->getUploadedAt() <=> $a->getUploadedAt();
                });

                $documentsData = [];
                foreach ($allDocuments as $document) {
                    // Déterminer la source et sourceTitle selon la catégorie
                    $source = ($document->getCategory() === 'direct') ? 'direct' : 'inscription';
                    $sourceTitle = ($document->getCategory() === 'direct') ? 'Document direct' : 'Document d\'inscription';
                    
                    // Gérer l'uploadedBy de façon sécurisée (peut être soft-deleted)
                    $uploadedBy = $document->getUploadedBy();
                    
                    $documentsData[] = [
                        'id' => $document->getId(),
                        'title' => $document->getTitle(),
                        'type' => $document->getType(),
                        'category' => $document->getCategory(),
                        'source' => $source,
                        'sourceTitle' => $sourceTitle,
                        'sourceId' => null,
                        'date' => $document->getUploadedAt()->format('d/m/Y'),
                        'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                        'fileName' => $document->getFileName(),
                        'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                        // 🆕 Ajouter info sur qui a uploadé (pour les documents directs)
                        'uploadedBy' => $uploadedBy ? [
                            'id' => $uploadedBy->getId(),
                            'firstName' => $uploadedBy->getFirstName(),
                            'lastName' => $uploadedBy->getLastName(),
                            'fullName' => $uploadedBy->getFirstName() . ' ' . $uploadedBy->getLastName()
                        ] : null,
                        // Champs de validation
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
                
            } finally {
                // 🔧 Réactiver le filtre Gedmo si il était activé
                if ($filterWasEnabled && $filters->has('softdeleteable')) {
                    $filters->enable('softdeleteable');
                }
            }
            
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur lors de la récupération des documents'], 500);
        }
    }

    /**
     * Récupérer l'entreprise d'un utilisateur
     */
    public function getCompany(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Récupérer l'entreprise
        $company = $user->getCompany();
        if (!$company) {
            return $this->json(['message' => 'Aucune entreprise associée à cet utilisateur'], 404);
        }

        // Retourner les données de l'entreprise
        return $this->json([
            'id' => $company->getId(),
            'name' => $company->getName(),
            'address' => $company->getAddress(),
            'postalCode' => $company->getPostalCode(),
            'city' => $company->getCity(),
            'siret' => $company->getSiret(),
            'responsableName' => $company->getResponsableName(),
            'email' => $company->getEmail(),
            'phone' => $company->getPhone(),
        ]);
    }

    /**
     * Créer une entreprise pour un utilisateur
     */
    public function createCompany(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier que l'utilisateur n'a pas déjà d'entreprise
        if ($user->getCompany()) {
            return $this->json(['message' => 'Cet utilisateur a déjà une entreprise'], 400);
        }

        $data = json_decode($request->getContent(), true);

        try {
            // Créer la nouvelle entreprise
            $company = new Company();
            $company->setName($data['name'] ?? '');
            $company->setAddress($data['address'] ?? '');
            $company->setPostalCode($data['postalCode'] ?? '');
            $company->setCity($data['city'] ?? '');
            $company->setSiret($data['siret'] ?? '');
            $company->setResponsableName($data['responsableName'] ?? '');
            $company->setEmail($data['email'] ?? '');
            $company->setPhone($data['phone'] ?? '');

            // Associer l'entreprise à l'utilisateur
            $user->setCompany($company);

            // Sauvegarder
            $this->entityManager->persist($company);
            $this->entityManager->flush();

            return $this->json([
                'id' => $company->getId(),
                'name' => $company->getName(),
                'address' => $company->getAddress(),
                'postalCode' => $company->getPostalCode(),
                'city' => $company->getCity(),
                'siret' => $company->getSiret(),
                'responsableName' => $company->getResponsableName(),
                'email' => $company->getEmail(),
                'phone' => $company->getPhone()
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la création de l\'entreprise',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour l'entreprise d'un utilisateur
     */
    public function updateCompany(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer l'utilisateur
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier que l'utilisateur a une entreprise
        $company = $user->getCompany();
        if (!$company) {
            return $this->json(['message' => 'Cet utilisateur n\'a pas d\'entreprise'], 404);
        }

        $data = json_decode($request->getContent(), true);

        try {
            // Mettre à jour l'entreprise
            $company->setName($data['name'] ?? $company->getName());
            $company->setAddress($data['address'] ?? $company->getAddress());
            $company->setPostalCode($data['postalCode'] ?? $company->getPostalCode());
            $company->setCity($data['city'] ?? $company->getCity());
            $company->setSiret($data['siret'] ?? $company->getSiret());
            $company->setResponsableName($data['responsableName'] ?? $company->getResponsableName());
            $company->setEmail($data['email'] ?? $company->getEmail());
            $company->setPhone($data['phone'] ?? $company->getPhone());

            // Sauvegarder
            $this->entityManager->flush();

            return $this->json([
                'id' => $company->getId(),
                'name' => $company->getName(),
                'address' => $company->getAddress(),
                'postalCode' => $company->getPostalCode(),
                'city' => $company->getCity(),
                'siret' => $company->getSiret(),
                'responsableName' => $company->getResponsableName(),
                'email' => $company->getEmail(),
                'phone' => $company->getPhone()
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la mise à jour de l\'entreprise',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les documents d'inscription pour l'admin
     */
    public function getAllInscriptionDocuments(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        try {
            // 🔧 Désactiver temporairement le filtre Gedmo SoftDelete pour accéder aux utilisateurs archivés
            $filters = $this->entityManager->getFilters();
            $filterWasEnabled = $filters->isEnabled('softdeleteable');
            if ($filterWasEnabled) {
                $filters->disable('softdeleteable');
            }

            try {
                $status = $request->query->get('status', null);
                $limit = $request->query->get('limit', null);
                $page = $request->query->get('page', 1);

                // Récupérer tous les documents d'inscription
                // Les documents d'inscription utilisent les catégories: support, contract, attestation, facture
                $queryBuilder = $this->documentRepository->createQueryBuilder('d')
                    ->leftJoin('d.user', 'u')
                    ->leftJoin('d.validatedBy', 'vb')
                    ->where('d.category IN (:categories)')
                    ->setParameter('categories', ['support', 'contract', 'attestation', 'facture'])
                    ->andWhere('d.user IS NOT NULL')
                    ->andWhere('d.formation IS NULL')
                    ->andWhere('d.session IS NULL')
                    ->orderBy('d.uploadedAt', 'DESC');

            // Filtrer par statut de validation si spécifié
            if ($status) {
                if ($status === 'pending') {
                    $queryBuilder->andWhere('d.validationStatus IS NULL OR d.validationStatus = :status')
                        ->setParameter('status', 'en_attente');
                } elseif ($status === 'approved') {
                    $queryBuilder->andWhere('d.validationStatus = :status')
                        ->setParameter('status', 'valide');
                } elseif ($status === 'rejected') {
                    $queryBuilder->andWhere('d.validationStatus = :status')
                        ->setParameter('status', 'rejete');
                }
            }

            // Pagination si spécifiée
            if ($limit) {
                $offset = ($page - 1) * $limit;
                $queryBuilder->setFirstResult($offset)->setMaxResults($limit);
            }

            $documents = $queryBuilder->getQuery()->getResult();

            $documentsData = [];
            foreach ($documents as $document) {
                $user = $document->getUser();
                $validatedBy = $document->getValidatedBy();

                $documentsData[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'category' => $document->getCategory(),
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s'),
                    'uploadedAtFormatted' => $document->getUploadedAt()->format('d/m/Y à H:i'),
                    'fileName' => $document->getFileName(),
                    'downloadUrl' => '/uploads/documents/' . $document->getFileName(),
                    'validationStatus' => $this->mapValidationStatus($document->getValidationStatus()),
                    'validatedAt' => $document->getValidatedAt() ? $document->getValidatedAt()->format('Y-m-d H:i:s') : null,
                    'validatedAtFormatted' => $document->getValidatedAt() ? $document->getValidatedAt()->format('d/m/Y à H:i') : null,
                    'rejectionReason' => $document->getRejectionReason(),
                    'user' => $user ? [
                        'id' => $user->getId(),
                        'firstName' => $user->getFirstName(),
                        'lastName' => $user->getLastName(),
                        'email' => $user->getEmail(),
                        'fullName' => $user->getFirstName() . ' ' . $user->getLastName()
                    ] : [
                        'id' => null,
                        'firstName' => '[Utilisateur archivé]',
                        'lastName' => '',
                        'email' => '[Archivé]',
                        'fullName' => '[Utilisateur archivé]'
                    ],
                    'validatedBy' => $validatedBy ? [
                        'id' => $validatedBy->getId(),
                        'firstName' => $validatedBy->getFirstName(),
                        'lastName' => $validatedBy->getLastName(),
                        'fullName' => $validatedBy->getFirstName() . ' ' . $validatedBy->getLastName()
                    ] : null
                ];
            }

                return $this->json([
                    'documents' => $documentsData,
                    'total' => count($documentsData),
                    'page' => (int)$page,
                    'limit' => $limit ? (int)$limit : null
                ]);
                
            } finally {
                // 🔧 Réactiver le filtre Gedmo si il était activé
                if ($filterWasEnabled && $filters->has('softdeleteable')) {
                    $filters->enable('softdeleteable');
                }
            }

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération des documents d\'inscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mapper les statuts de validation entre backend et frontend
     */
    private function mapValidationStatus(?string $status): string
    {
        return match($status) {
            'en_attente' => 'pending',
            'valide' => 'approved',
            'rejete' => 'rejected',
            null => 'pending',
            default => 'pending'
        };
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

    // ✅ MÉTHODES D'ARCHIVAGE MANUEL SUPPRIMÉES
    // Remplacées par l'EventListener SoftDeleteCascadeListener
    // qui gère automatiquement l'archivage/restauration en cascade
}