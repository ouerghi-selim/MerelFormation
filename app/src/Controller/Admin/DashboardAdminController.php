<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use App\Repository\FormationRepository;
use App\Repository\SessionRepository;
use App\Repository\ReservationRepository;

/**
 * @Route("/api/admin/dashboard", name="api_admin_dashboard_")
 */
class DashboardAdminController extends AbstractController
{
    private $security;
    private $userRepository;
    private $formationRepository;
    private $sessionRepository;
    private $reservationRepository;

    public function __construct(
        Security $security,
        UserRepository $userRepository,
        FormationRepository $formationRepository,
        SessionRepository $sessionRepository,
        ReservationRepository $reservationRepository
    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->formationRepository = $formationRepository;
        $this->sessionRepository = $sessionRepository;
        $this->reservationRepository = $reservationRepository;
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

        // Récupérer les statistiques
        $activeStudents = $this->userRepository->countActiveStudents();
        $activeFormations = $this->formationRepository->countActiveFormations();
        $upcomingSessions = $this->sessionRepository->countUpcomingSessions();
        $pendingReservations = $this->reservationRepository->countPendingReservations();
        
        // Calculer les revenus totaux (à implémenter selon votre logique métier)
        $totalRevenue = 0; // À remplacer par la vraie logique
        
        // Calculer le taux de conversion (à implémenter selon votre logique métier)
        $conversionRate = 0; // À remplacer par la vraie logique

        return $this->json([
            'activeStudents' => $activeStudents,
            'activeFormations' => $activeFormations,
            'upcomingSessions' => $upcomingSessions,
            'pendingReservations' => $pendingReservations,
            'totalRevenue' => $totalRevenue,
            'conversionRate' => $conversionRate
        ]);
    }

    /**
     * @Route("/recent-inscriptions", name="recent_inscriptions", methods={"GET"})
     */
    public function getRecentInscriptions(): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les inscriptions récentes
        $inscriptions = $this->userRepository->findRecentInscriptions(5);
        
        // Formater les données pour le frontend
        $formattedInscriptions = [];
        foreach ($inscriptions as $inscription) {
            $formattedInscriptions[] = [
                'id' => $inscription->getId(),
                'studentName' => $inscription->getFirstName() . ' ' . $inscription->getLastName(),
                'formationName' => $inscription->getFormation()->getTitle(),
                'date' => $inscription->getCreatedAt()->format('d/m/Y')
            ];
        }

        return $this->json($formattedInscriptions);
    }

    /**
     * @Route("/recent-reservations", name="recent_reservations", methods={"GET"})
     */
    public function getRecentReservations(): JsonResponse
    {
        // Vérifier que l'utilisateur est un admin
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Récupérer les réservations récentes
        $reservations = $this->reservationRepository->findRecentReservations(5);
        
        // Formater les données pour le frontend
        $formattedReservations = [];
        foreach ($reservations as $reservation) {
            $formattedReservations[] = [
                'id' => $reservation->getId(),
                'vehicleModel' => $reservation->getVehicle() ? $reservation->getVehicle()->getModel() : null,
                'clientName' => $reservation->getClient()->getFirstName() . ' ' . $reservation->getClient()->getLastName(),
                'date' => $reservation->getDate()->format('d/m/Y'),
                'status' => $reservation->getStatus()
            ];
        }

        return $this->json($formattedReservations);
    }
}
