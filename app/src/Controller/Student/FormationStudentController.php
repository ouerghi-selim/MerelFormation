<?php

namespace App\Controller\Student;

use App\Repository\FormationRepository;
use App\Repository\UserFormationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @Route("/api/student/formations", name="api_student_formations_")
 */
class FormationStudentController extends AbstractController
{
    private $security;
    private $formationRepository;
    private $userFormationRepository;

    public function __construct(
        Security $security,
        FormationRepository $formationRepository,
        UserFormationRepository $userFormationRepository
    ) {
        $this->security = $security;
        $this->formationRepository = $formationRepository;
        $this->userFormationRepository = $userFormationRepository;
    }

    /**
     * @Route("", name="list", methods={"GET"})
     */
    public function list(): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer les formations de l'étudiant
        $userFormations = $this->userFormationRepository->findByUser($user->getId());
        
        // Formater les données pour le frontend
        $formattedFormations = [];
        foreach ($userFormations as $userFormation) {
            $formation = $userFormation->getFormation();
            $formattedFormations[] = [
                'id' => $formation->getId(),
                'title' => $formation->getTitle(),
                'type' => $formation->getType(),
                'progress' => $userFormation->getProgress(),
                'startDate' => $userFormation->getStartDate()->format('d/m/Y'),
                'endDate' => $userFormation->getEndDate()->format('d/m/Y'),
                'instructor' => $userFormation->getInstructor()->getFirstName() . ' ' . $userFormation->getInstructor()->getLastName(),
                'nextSession' => $this->getNextSessionDate($formation->getId(), $user->getId()),
                'status' => $this->getFormationStatus($userFormation)
            ];
        }

        return $this->json($formattedFormations);
    }

    /**
     * @Route("/{id}", name="get", methods={"GET"})
     */
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

        // Vérifier que l'utilisateur est inscrit à cette formation
        $userFormation = $this->userFormationRepository->findOneBy([
            'user' => $user->getId(),
            'formation' => $id
        ]);
        
        if (!$userFormation) {
            return $this->json(['message' => 'Vous n\'êtes pas inscrit à cette formation'], 403);
        }

        // Récupérer les modules de la formation
        $modules = $formation->getModules();
        $formattedModules = [];
        foreach ($modules as $module) {
            $moduleProgress = $this->getModuleProgress($module->getId(), $user->getId());
            $moduleStatus = $this->getModuleStatus($moduleProgress);
            
            $formattedModules[] = [
                'id' => $module->getId(),
                'title' => $module->getTitle(),
                'description' => $module->getDescription(),
                'status' => $moduleStatus,
                'progress' => $moduleProgress
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
                'date' => $document->getCreatedAt()->format('d/m/Y'),
                'downloadUrl' => '/documents/' . $document->getId()
            ];
        }

        // Récupérer les prochaines sessions
        $upcomingSessions = $this->sessionRepository->findUpcomingSessionsForFormationAndStudent(
            $id,
            $user->getId()
        );
        
        $formattedSessions = [];
        foreach ($upcomingSessions as $session) {
            $formattedSessions[] = [
                'id' => $session->getId(),
                'date' => $session->getDate()->format('d/m/Y'),
                'time' => $session->getStartTime()->format('H:i'),
                'location' => $session->getLocation(),
                'topic' => $session->getTopic()
            ];
        }

        // Formater les données pour le frontend
        $formattedFormation = [
            'id' => $formation->getId(),
            'title' => $formation->getTitle(),
            'description' => $formation->getDescription(),
            'type' => $formation->getType(),
            'instructor' => $userFormation->getInstructor()->getFirstName() . ' ' . $userFormation->getInstructor()->getLastName(),
            'startDate' => $userFormation->getStartDate()->format('d/m/Y'),
            'endDate' => $userFormation->getEndDate()->format('d/m/Y'),
            'progress' => $userFormation->getProgress(),
            'modules' => $formattedModules,
            'documents' => $formattedDocuments,
            'upcomingSessions' => $formattedSessions
        ];

        return $this->json($formattedFormation);
    }

    /**
     * Récupère la date de la prochaine session pour une formation et un utilisateur
     */
    private function getNextSessionDate(int $formationId, int $userId): ?string
    {
        $nextSession = $this->sessionRepository->findNextSessionForFormationAndStudent(
            $formationId,
            $userId
        );
        
        if ($nextSession) {
            return $nextSession->getDate()->format('d/m/Y');
        }
        
        return null;
    }

    /**
     * Détermine le statut d'une formation pour un utilisateur
     */
    private function getFormationStatus($userFormation): string
    {
        $now = new \DateTime();
        
        if ($userFormation->getProgress() >= 100) {
            return 'completed';
        }
        
        if ($userFormation->getStartDate() > $now) {
            return 'pending';
        }
        
        return 'active';
    }

    /**
     * Récupère la progression d'un module pour un utilisateur
     */
    private function getModuleProgress(int $moduleId, int $userId): int
    {
        // À implémenter selon votre structure de données
        // Exemple fictif
        $progressValues = [
            1 => 100, // Module 1: 100% complété
            2 => 100, // Module 2: 100% complété
            3 => 60,  // Module 3: 60% complété
            4 => 0    // Module 4: 0% complété
        ];
        
        return $progressValues[$moduleId] ?? 0;
    }

    /**
     * Détermine le statut d'un module en fonction de sa progression
     */
    private function getModuleStatus(int $progress): string
    {
        if ($progress >= 100) {
            return 'completed';
        }
        
        if ($progress > 0) {
            return 'in_progress';
        }
        
        return 'pending';
    }
}
