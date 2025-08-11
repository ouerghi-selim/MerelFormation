<?php

namespace App\Controller\Student;

use App\Repository\FormationRepository;
use App\Repository\SessionRepository;
use App\Repository\ReservationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/student/formations', name: 'api_student_formations_')]
class FormationStudentController extends AbstractController
{
    private Security $security;
    private FormationRepository $formationRepository;
    private ReservationRepository $reservationRepository;
    private SessionRepository $sessionRepository;

    public function __construct(
        Security $security,
        FormationRepository $formationRepository,
        ReservationRepository $reservationRepository,
        SessionRepository $sessionRepository
    ) {
        $this->security = $security;
        $this->formationRepository = $formationRepository;
        $this->reservationRepository = $reservationRepository;
        $this->sessionRepository = $sessionRepository;
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer les réservations confirmées de l'étudiant
        $reservations = $this->reservationRepository->createQueryBuilder('r')
            ->where('r.user = :user')
            ->andWhere('r.status IN (:statuses)')
            ->setParameter('user', $user)
            ->setParameter('statuses', ['confirmed', 'completed'])
            ->getQuery()
            ->getResult();

        // Grouper par formation
        $formationsData = [];
        foreach ($reservations as $reservation) {
            $session = $reservation->getSession();
            if (!$session) continue;
            
            $formation = $session->getFormation();
            if (!$formation || !$formation->isIsActive()) continue;

            $formationId = $formation->getId();
            
            if (!isset($formationsData[$formationId])) {
                $formationsData[$formationId] = [
                    'formation' => $formation,
                    'sessions' => [],
                    'reservations' => []
                ];
            }
            
            $formationsData[$formationId]['sessions'][] = $session;
            $formationsData[$formationId]['reservations'][] = $reservation;
        }

        // Formater les données pour le frontend
        $formattedFormations = [];
        foreach ($formationsData as $data) {
            $formation = $data['formation'];
            $sessions = $data['sessions'];
            $reservations = $data['reservations'];
            
            // Calculer la prochaine session
            $nextSession = $this->getNextSession($sessions);
            
            // Calculer le statut
            $status = $this->getFormationStatusFromReservations($reservations);
            
            $formattedFormations[] = [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'type' => $formation->getType(),
                'description' => $formation->getDescription(),
                'duration' => $formation->getDuration(),
                'nextSession' => $nextSession ? [
                    'id' => $nextSession->getId(),
                    'startDate' => $nextSession->getStartDate()->format('d/m/Y H:i'),
                    'endDate' => $nextSession->getEndDate()->format('d/m/Y H:i'),
                    'location' => $nextSession->getEffectiveLocation()
                ] : null,
                'status' => $status,
                'sessionsCount' => count($sessions),
                'completedSessions' => $this->countCompletedSessions($reservations)
            ];
        }

        return $this->json([
            'success' => true,
            'data' => $formattedFormations
        ]);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Vérifier que la formation existe
        $formation = $this->formationRepository->find($id);
        if (!$formation) {
            return $this->json(['message' => 'Formation non trouvée'], 404);
        }

        // Vérifier que l'utilisateur a des réservations confirmées pour cette formation
        $userReservations = $this->reservationRepository->createQueryBuilder('r')
            ->join('r.session', 's')
            ->join('s.formation', 'f')
            ->where('r.user = :user')
            ->andWhere('f.id = :formationId')
            ->andWhere('r.status IN (:statuses)')
            ->setParameter('user', $user)
            ->setParameter('formationId', $id)
            ->setParameter('statuses', ['confirmed', 'completed'])
            ->getQuery()
            ->getResult();
        
        if (empty($userReservations)) {
            return $this->json(['message' => 'Vous n\'êtes pas inscrit à cette formation'], 403);
        }

        // Récupérer les modules de la formation
        $modules = $formation->getModules();
        $formattedModules = [];
        foreach ($modules as $module) {
            $points = [];
            foreach ($module->getPoints() as $point) {
                $points[] = [
                    'id' => $point->getId(),
                    'content' => $point->getContent()
                ];
            }
            
            $formattedModules[] = [
                'id' => $module->getId(),
                'title' => $module->getTitle(),
                'duration' => $module->getDuration(),
                'position' => $module->getPosition(),
                'points' => $points
            ];
        }

        // Récupérer les documents de la formation
        $documents = $formation->getDocuments();
        $formattedDocuments = [];
        foreach ($documents as $document) {
            $formattedDocuments[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'type' => $document->getType(),
                'fileName' => $document->getFileName(),
                'updatedAt' => $document->getUpdatedAt() ? $document->getUpdatedAt()->format('d/m/Y') : null,
                'downloadUrl' => '/student/documents/' . $document->getId() . '/download'
            ];
        }

        // Récupérer les sessions de l'utilisateur pour cette formation
        $userSessions = [];
        foreach ($userReservations as $reservation) {
            $session = $reservation->getSession();
            $userSessions[] = [
                'id' => $session->getId(),
                'startDate' => $session->getStartDate()->format('d/m/Y H:i'),
                'endDate' => $session->getEndDate()->format('d/m/Y H:i'),
                'location' => $session->getEffectiveLocation(),
                'status' => $session->getStatus(),
                'reservationStatus' => $reservation->getStatus(),
                'instructors' => array_map(function($instructor) {
                    return $instructor->getFirstName() . ' ' . $instructor->getLastName();
                }, $session->getInstructors()->toArray())
            ];
        }

        // Récupérer les prérequis de la formation
        $prerequisites = $formation->getPrerequisites();
        $formattedPrerequisites = [];
        foreach ($prerequisites as $prerequisite) {
            $formattedPrerequisites[] = [
                'id' => $prerequisite->getId(),
                'content' => $prerequisite->getContent()
            ];
        }

        // Calculer la progression
        $completedSessions = $this->countCompletedSessions($userReservations);
        $totalSessions = count($userReservations);
        $progress = $totalSessions > 0 ? intval(($completedSessions / $totalSessions) * 100) : 0;

        // Formater les données pour le frontend
        $formattedFormation = [
            'id' => $formation->getId(),
            'title' => $formation->getTitle(),
            'description' => $formation->getDescription(),
            'type' => $formation->getType(),
            'duration' => $formation->getDuration(),
            'progress' => $progress,
            'prerequisites' => $formattedPrerequisites,
            'modules' => $formattedModules,
            'documents' => $formattedDocuments,
            'sessions' => $userSessions,
            'totalSessions' => $totalSessions,
            'completedSessions' => $completedSessions
        ];

        return $this->json([
            'success' => true,
            'data' => $formattedFormation
        ]);
    }

    /**
     * Trouve la prochaine session parmi une liste de sessions
     */
    private function getNextSession(array $sessions): ?object
    {
        $now = new \DateTimeImmutable();
        $upcomingSessions = array_filter($sessions, function($session) use ($now) {
            return $session->getStartDate() > $now;
        });
        
        if (empty($upcomingSessions)) {
            return null;
        }
        
        // Trier par date de début
        usort($upcomingSessions, function($a, $b) {
            return $a->getStartDate() <=> $b->getStartDate();
        });
        
        return $upcomingSessions[0];
    }

    /**
     * Détermine le statut d'une formation basé sur les réservations
     */
    private function getFormationStatusFromReservations(array $reservations): string
    {
        $now = new \DateTimeImmutable();
        $hasCompleted = false;
        $hasUpcoming = false;
        $hasActive = false;
        
        foreach ($reservations as $reservation) {
            $session = $reservation->getSession();
            
            if ($reservation->getStatus() === 'completed') {
                $hasCompleted = true;
            }
            
            if ($session->getStartDate() > $now) {
                $hasUpcoming = true;
            } elseif ($session->getStartDate() <= $now && $session->getEndDate() >= $now) {
                $hasActive = true;
            }
        }
        
        if ($hasActive) {
            return 'active';
        }
        
        if ($hasCompleted && !$hasUpcoming) {
            return 'completed';
        }
        
        if ($hasUpcoming) {
            return 'upcoming';
        }
        
        return 'pending';
    }

    /**
     * Compte les sessions complétées
     */
    private function countCompletedSessions(array $reservations): int
    {
        return count(array_filter($reservations, function($reservation) {
            return $reservation->getStatus() === 'completed';
        }));
    }
}
