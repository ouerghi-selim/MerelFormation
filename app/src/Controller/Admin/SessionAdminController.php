<?php

namespace App\Controller\Admin;

use App\Entity\Formation;
use App\Entity\Session;
use App\Entity\User;
use App\Repository\FormationRepository;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api/admin/sessions", name="api_admin_sessions_")
 */
class SessionAdminController extends AbstractController
{
    private $security;
    private $sessionRepository;
    private $formationRepository;
    private $userRepository;
    private $entityManager;
    private $serializer;
    private $validator;

    public function __construct(
        Security $security,
        SessionRepository $sessionRepository,
        FormationRepository $formationRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->security = $security;
        $this->sessionRepository = $sessionRepository;
        $this->formationRepository = $formationRepository;
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->validator = $validator;
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
        $search = $request->query->get('search');
        $formationId = $request->query->get('formation');
        $status = $request->query->get('status');
        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        // Créer un tableau de critères pour la recherche
        $criteria = [];
        if ($search) $criteria['search'] = $search;
        if ($formationId) $criteria['formation'] = $formationId;
        if ($status) $criteria['status'] = $status;

        // Ajouter une plage de date si les deux paramètres sont présents
        if ($startDate && $endDate) {
            $criteria['dateRange'] = [
                'start' => new \DateTimeImmutable($startDate),
                'end' => new \DateTimeImmutable($endDate)
            ];
        }

        // Récupérer les sessions avec les critères de recherche
        $sessions = $this->sessionRepository->searchByCriteria($criteria);

        // Formater les données pour la réponse
        $formattedSessions = [];
        foreach ($sessions as $session) {
            $formattedSessions[] = $this->formatSessionData($session);
        }

        return $this->json($formattedSessions);
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

        // Récupérer la session
        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Formater les données pour la réponse
        $formattedSession = $this->formatSessionData($session, true); // true = avec détails

        return $this->json($formattedSession);
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

        // Valider les données d'entrée
        $errors = $this->validateSessionData($data);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], 400);
        }

        // Récupérer la formation associée
        $formation = $this->formationRepository->find($data['formation']['id']);
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        // Créer une nouvelle session
        $session = new Session();
        $session->setFormation($formation);
        $session->setStartDate(new \DateTimeImmutable($data['startDate']));
        $session->setEndDate(new \DateTimeImmutable($data['endDate']));
        $session->setMaxParticipants($data['maxParticipants']);
        $session->setLocation($data['location']);
        $session->setStatus($data['status'] ?? 'scheduled');

        if (isset($data['notes'])) {
            $session->setNotes($data['notes']);
        }

        // Persister la session
        $this->entityManager->persist($session);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Session créée avec succès',
            'id' => $session->getId()
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

        // Récupérer la session
        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Valider les données d'entrée
        $errors = $this->validateSessionData($data);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], 400);
        }

        // Mettre à jour la formation si elle a changé
        if (isset($data['formation']['id'])) {
            $formation = $this->formationRepository->find($data['formation']['id']);
            if (!$formation) {
                return $this->json(['message' => 'Formation non trouvée'], 404);
            }
            $session->setFormation($formation);
        }

        // Mettre à jour l'instructeur si spécifié
        if (isset($data['instructor']['id'])) {
            $instructor = $this->userRepository->find($data['instructor']['id']);
            if (!$instructor) {
                return $this->json(['message' => 'Formateur non trouvé'], 404);
            }
            $session->setInstructor($instructor);
        }

        // Mettre à jour les autres champs
        if (isset($data['startDate'])) {
            $session->setStartDate(new \DateTimeImmutable($data['startDate']));
        }

        if (isset($data['endDate'])) {
            $session->setEndDate(new \DateTimeImmutable($data['endDate']));
        }

        if (isset($data['maxParticipants'])) {
            $session->setMaxParticipants($data['maxParticipants']);
        }

        if (isset($data['location'])) {
            $session->setLocation($data['location']);
        }

        if (isset($data['status'])) {
            $session->setStatus($data['status']);
        }

        if (isset($data['notes'])) {
            $session->setNotes($data['notes']);
        }

        // Persister les modifications
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Session mise à jour avec succès',
            'data' => $this->formatSessionData($session)
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

        // Récupérer la session
        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Vérifier s'il existe des réservations pour cette session
        if (count($session->getReservations()) > 0) {
            // Option 1: Empêcher la suppression
            // return $this->json(['message' => 'Cette session a des réservations associées et ne peut pas être supprimée'], 400);

            // Option 2: Annuler toutes les réservations associées
            foreach ($session->getReservations() as $reservation) {
                $reservation->setStatus('cancelled');
            }
        }

        // Supprimer la session (ou la marquer comme annulée)
        $this->entityManager->remove($session);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Session supprimée avec succès'
        ]);
    }

    /**
     * @Route("/{id}/participants", name="participants", methods={"GET"})
     */
    public function getParticipants(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la session
        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Récupérer les participants
        $participants = $session->getParticipants();

        // Formater les données pour la réponse
        $formattedParticipants = [];
        foreach ($participants as $participant) {
            $formattedParticipants[] = [
                'id' => $participant->getId(),
                'firstName' => $participant->getFirstName(),
                'lastName' => $participant->getLastName(),
                'email' => $participant->getEmail(),
                'phone' => $participant->getPhone(),
            ];
        }

        return $this->json($formattedParticipants);
    }

    /**
     * @Route("/{id}/add-participant", name="add_participant", methods={"POST"})
     */
    public function addParticipant(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la session
        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        if (!isset($data['userId'])) {
            return $this->json(['message' => 'ID de l\'utilisateur requis'], 400);
        }

        // Récupérer l'utilisateur
        $user = $this->userRepository->find($data['userId']);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est déjà inscrit
        if ($session->getParticipants()->contains($user)) {
            return $this->json(['message' => 'Cet utilisateur est déjà inscrit à cette session'], 400);
        }

        // Vérifier si la session n'est pas pleine
        if ($session->getParticipants()->count() >= $session->getMaxParticipants()) {
            return $this->json(['message' => 'Cette session est complète'], 400);
        }

        // Ajouter l'utilisateur aux participants
        $session->addParticipant($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Participant ajouté avec succès'
        ]);
    }

    /**
     * @Route("/{id}/remove-participant/{userId}", name="remove_participant", methods={"DELETE"})
     */
    public function removeParticipant(int $id, int $userId): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer la session
        $session = $this->sessionRepository->find($id);

        if (!$session) {
            return $this->json(['message' => 'Session non trouvée'], 404);
        }

        // Récupérer l'utilisateur
        $user = $this->userRepository->find($userId);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est inscrit
        if (!$session->getParticipants()->contains($user)) {
            return $this->json(['message' => 'Cet utilisateur n\'est pas inscrit à cette session'], 400);
        }

        // Retirer l'utilisateur des participants
        $session->removeParticipant($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Participant retiré avec succès'
        ]);
    }

    /**
     * @Route("/stats", name="stats", methods={"GET"})
     */
    public function getStats(): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Obtenir les statistiques depuis le repository
        $stats = $this->sessionRepository->getStatistics();

        return $this->json($stats);
    }

    /**
     * Fonction utilitaire pour formater les données d'une session
     */
    private function formatSessionData(Session $session, bool $detailed = false): array
    {
        $formattedSession = [
            'id' => $session->getId(),
            'formation' => [
                'id' => $session->getFormation()->getId(),
                'title' => $session->getFormation()->getTitle()
            ],
            'startDate' => $session->getStartDate()->format('Y-m-d\TH:i:s.v\Z'),
            'endDate' => $session->getEndDate()->format('Y-m-d\TH:i:s.v\Z'),
            'maxParticipants' => $session->getMaxParticipants(),
            'location' => $session->getLocation(),
            'status' => $session->getStatus(),
            'notes' => $session->getNotes(),
            'participants' => array_map(function($participant) {
                return [
                    'id' => $participant->getId(),
                    'firstName' => $participant->getFirstName(),
                    'lastName' => $participant->getLastName(),
                    'email' => $participant->getEmail()
                ];
            }, $session->getParticipants()->toArray())
        ];
        // Ajouter l'instructeur aux données formatées
        if ($session->getInstructor()) {
            $formattedSession['instructor'] = [
                'id' => $session->getInstructor()->getId(),
                'firstName' => $session->getInstructor()->getFirstName(),
                'lastName' => $session->getInstructor()->getLastName()
            ];
        }
        // Ajouter des détails supplémentaires si demandés
        if ($detailed) {
            $participants = [];
            foreach ($session->getParticipants() as $participant) {
                $participants[] = [
                    'id' => $participant->getId(),
                    'firstName' => $participant->getFirstName(),
                    'lastName' => $participant->getLastName(),
                    'email' => $participant->getEmail()
                ];
            }

            $formattedSession['detailedParticipants'] = $participants;

            // Ajouter les détails des réservations si nécessaire
            $reservations = [];
            foreach ($session->getReservations() as $reservation) {
                $reservations[] = [
                    'id' => $reservation->getId(),
                    'status' => $reservation->getStatus(),
                    'user' => [
                        'id' => $reservation->getUser()->getId(),
                        'firstName' => $reservation->getUser()->getFirstName(),
                        'lastName' => $reservation->getUser()->getLastName()
                    ],
                    'createdAt' => $reservation->getCreatedAt()->format('Y-m-d\TH:i:s.v\Z')
                ];
            }

            $formattedSession['reservations'] = $reservations;
        }

        return $formattedSession;
    }

    /**
     * Fonction utilitaire pour valider les données d'une session
     */
    private function validateSessionData(array $data): array
    {
        $errors = [];

        // Vérifier que les champs obligatoires sont présents
        if (!isset($data['formation']['id'])) {
            $errors['formationId'] = 'La formation est requise';
        }

        if (!isset($data['startDate'])) {
            $errors['startDate'] = 'La date de début est requise';
        }

        if (!isset($data['endDate'])) {
            $errors['endDate'] = 'La date de fin est requise';
        }

        if (!isset($data['maxParticipants'])) {
            $errors['maxParticipants'] = 'Le nombre maximum de participants est requis';
        }

        if (!isset($data['location'])) {
            $errors['location'] = 'Le lieu est requis';
        }

        // Valider les formats et contraintes des champs
        if (isset($data['startDate']) && isset($data['endDate'])) {
            $startDate = new \DateTimeImmutable($data['startDate']);
            $endDate = new \DateTimeImmutable($data['endDate']);

            if ($startDate >= $endDate) {
                $errors['endDate'] = 'La date de fin doit être postérieure à la date de début';
            }
        }

        if (isset($data['maxParticipants']) && ($data['maxParticipants'] <= 0 || !is_numeric($data['maxParticipants']))) {
            $errors['maxParticipants'] = 'Le nombre maximum de participants doit être un nombre positif';
        }

        if (isset($data['status']) && !in_array($data['status'], ['scheduled', 'ongoing', 'completed', 'cancelled'])) {
            $errors['status'] = 'Le statut doit être scheduled, ongoing, completed ou cancelled';
        }

        return $errors;
    }
}