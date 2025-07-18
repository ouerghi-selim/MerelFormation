<?php

namespace App\Controller\Student;

use App\Repository\ReservationRepository;
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
    private $reservationRepository;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        FormationRepository $formationRepository,
        SessionRepository $sessionRepository,
        DocumentRepository $documentRepository,
        ReservationRepository $reservationRepository
    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->formationRepository = $formationRepository;
        $this->sessionRepository = $sessionRepository;
        $this->documentRepository = $documentRepository;
        $this->reservationRepository = $reservationRepository;
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

        try {
            // Récupérer les données du dashboard
            // TODO: Vérifier que cette méthode existe dans FormationRepository ou la créer
            $activeFormations = 0; // Temporairement en dur jusqu'à correction du FormationRepository
            // $activeFormations = $this->formationRepository->countActiveFormationsForStudent($user->getId());

            $documentsCount = count($this->getStudentDocuments($user->getId()));
            // $documentsCount = $this->documentRepository->countDocumentsForStudent($user->getId());

            $pendingPayments = 0; // À implémenter selon votre logique métier

            // Récupérer les prochaines sessions
            $upcomingSessions = $this->sessionRepository->findUpcomingSessionsForStudent($user->getId(), 3);
            $formattedSessions = [];
            foreach ($upcomingSessions as $session) {
                $formattedSessions[] = [
                    'id' => $session->getId(),
                    'formationTitle' => $session->getFormation()->getTitle(),
                    'startDate' => $session->getStartDate()->format('d/m/Y'),
                    'startTime' => $session->getStartDate()->format('H:i'),
                    'location' => $session->getLocation()
                ];
            }

            // Récupérer les documents récents
            $recentDocuments = array_slice($this->getStudentDocuments($user->getId()), 0, 3);
            // $recentDocuments = $this->documentRepository->findRecentDocumentsForStudent($user->getId(), 3);
            $formattedDocuments = [];
            foreach ($recentDocuments as $document) {
                $formattedDocuments[] = [
                    'id' => $document->getId(),
                    'title' => $document->getTitle(),
                    'type' => $document->getType(),
                    'date' => $document->getUploadedAt()->format('d/m/Y'),
                    'downloadUrl' => '/uploads/documents/' . $document->getFileName()
                ];
            }

            // Récupérer les informations de l'utilisateur avec l'entreprise
            $companyData = null;
            if ($user->getCompany()) {
                $company = $user->getCompany();
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

            $userData = [
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'company' => $companyData
            ];

            return $this->json([
                'activeFormations' => $activeFormations,
                'documentsCount' => $documentsCount,
                'pendingPayments' => $pendingPayments,
                'upcomingSessions' => $formattedSessions,
                'recentDocuments' => $formattedDocuments,
                'user' => $userData
            ]);
        } catch (\Exception $e) {
            // Log l'erreur pour debug
            error_log('Dashboard Student Error: ' . $e->getMessage());

            return $this->json([
                'message' => 'Erreur lors de la récupération des données du dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getStudentDocuments(int $userId): array
    {
        $sessions = $this->sessionRepository->findByParticipant($userId);
        $documents = [];
        foreach ($sessions as $session) {
            if ($session) {
                // Documents de session
                $sessionDocs = $this->documentRepository->findBy(['session' => $session->getId()]);
                $documents = array_merge($documents, $sessionDocs);

                // Documents de formation
                $formationDocs = $this->documentRepository->findBy(['formation' => $session->getFormation()->getId()]);
                $documents = array_merge($documents, $formationDocs);
            }
        }

        return array_unique($documents, SORT_REGULAR);
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
            'phone' => $user->getPhone() ?? null,
            'address' => $user->getAddress() ?? null,
            'city' => $user->getCity() ?? null,
            'postalCode' => $user->getPostalCode() ?? null
        ];

        return $this->json($profile);
    }
}