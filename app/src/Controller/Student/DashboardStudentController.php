<?php

namespace App\Controller\Student;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use App\Repository\FormationRepository;
use App\Repository\SessionRepository;
use App\Repository\DocumentRepository;

/**
 * @Route("/api/student/dashboard", name="api_student_dashboard_")
 */
class DashboardStudentController extends AbstractController
{
    private $security;
    private $userRepository;
    private $formationRepository;
    private $sessionRepository;
    private $documentRepository;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        FormationRepository $formationRepository,
        SessionRepository $sessionRepository,
        DocumentRepository $documentRepository
    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->formationRepository = $formationRepository;
        $this->sessionRepository = $sessionRepository;
        $this->documentRepository = $documentRepository;
    }

    /**
     * @Route("", name="index", methods={"GET"})
     */
    public function index(): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer les données du dashboard
        $activeFormations = $this->formationRepository->countActiveFormationsForStudent($user->getId());
        $documentsCount = $this->documentRepository->countDocumentsForStudent($user->getId());
        $pendingPayments = 0; // À implémenter selon votre logique métier
        
        // Récupérer les prochaines sessions
        $upcomingSessions = $this->sessionRepository->findUpcomingSessionsForStudent($user->getId(), 3);
        $formattedSessions = [];
        foreach ($upcomingSessions as $session) {
            $formattedSessions[] = [
                'id' => $session->getId(),
                'formationTitle' => $session->getFormation()->getTitle(),
                'date' => $session->getDate()->format('d/m/Y'),
                'time' => $session->getStartTime()->format('H:i'),
                'location' => $session->getLocation()
            ];
        }
        
        // Récupérer les documents récents
        $recentDocuments = $this->documentRepository->findRecentDocumentsForStudent($user->getId(), 3);
        $formattedDocuments = [];
        foreach ($recentDocuments as $document) {
            $formattedDocuments[] = [
                'id' => $document->getId(),
                'title' => $document->getTitle(),
                'type' => $document->getType(),
                'date' => $document->getCreatedAt()->format('d/m/Y'),
                'downloadUrl' => '/documents/' . $document->getId()
            ];
        }

        return $this->json([
            'activeFormations' => $activeFormations,
            'documentsCount' => $documentsCount,
            'pendingPayments' => $pendingPayments,
            'upcomingSessions' => $formattedSessions,
            'recentDocuments' => $formattedDocuments
        ]);
    }

    /**
     * @Route("/profile", name="profile", methods={"GET"})
     */
    public function getProfile(): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Formater les données pour le frontend
        $profile = [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'phone' => $user->getPhone(),
            'address' => $user->getAddress(),
            'city' => $user->getCity(),
            'postalCode' => $user->getPostalCode()
        ];

        return $this->json($profile);
    }
}
