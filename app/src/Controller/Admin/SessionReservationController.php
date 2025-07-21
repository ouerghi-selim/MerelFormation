<?php

namespace App\Controller\Admin;

use App\Entity\Reservation;
use App\Repository\ReservationRepository;
use App\Service\NotificationService;
use App\Enum\ReservationStatus;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Routing\Annotation\Route;

class SessionReservationController extends AbstractController
{
    private $entityManager;
    private $reservationRepository;
    private $serializer;
    private $notificationService;

    public function __construct(
        EntityManagerInterface $entityManager,
        ReservationRepository $reservationRepository,
        SerializerInterface $serializer,
        NotificationService $notificationService
    ) {
        $this->entityManager = $entityManager;
        $this->reservationRepository = $reservationRepository;
        $this->serializer = $serializer;
        $this->notificationService = $notificationService;
    }

    public function index(Request $request): JsonResponse
    {
        $search = $request->query->get('search');
        $status = $request->query->get('status');
        $limit = $request->query->get('limit', null);
        $sort = $request->query->get('sort', null);

        // Utilisation du repository pour récupérer les réservations
        $reservations = $this->reservationRepository->findSessionReservations($search, $status, $limit, $sort);

        // Format de la réponse pour correspondre à ce qu'attend le frontend
        $formattedData = array_map(function ($reservation) {
            return [
                'id' => $reservation->getId(),
                'user' => [
                    'id' => $reservation->getUser()->getId(),
                    'firstName' => $reservation->getUser()->getFirstName(),
                    'lastName' => $reservation->getUser()->getLastName(),
                    'email' => $reservation->getUser()->getEmail(),
                    'phone' => $reservation->getUser()->getPhone()
                ],
                'session' => [
                    'id' => $reservation->getSession()->getId(),
                    'startDate' => $reservation->getSession()->getStartDate()->format('Y-m-d\TH:i:s'),
                    'formation' => [
                        'id' => $reservation->getSession()->getFormation()->getId(),
                        'title' => $reservation->getSession()->getFormation()->getTitle()
                    ]
                ],
                'status' => $reservation->getStatus(),
                'createdAt' => $reservation->getCreatedAt()->format('Y-m-d\TH:i:s')
            ];
        }, $reservations);

        return $this->json($formattedData);
    }

    public function show(int $id): JsonResponse
    {
        $reservation = $this->reservationRepository->find($id);

        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Format de la réponse pour correspondre à ce qu'attend le frontend
        $formattedData = [
            'id' => $reservation->getId(),
            'user' => [
                'id' => $reservation->getUser()->getId(),
                'firstName' => $reservation->getUser()->getFirstName(),
                'lastName' => $reservation->getUser()->getLastName(),
                'email' => $reservation->getUser()->getEmail(),
                'phone' => $reservation->getUser()->getPhone()
            ],
            'session' => [
                'id' => $reservation->getSession()->getId(),
                'startDate' => $reservation->getSession()->getStartDate()->format('Y-m-d\TH:i:s'),
                'formation' => [
                    'id' => $reservation->getSession()->getFormation()->getId(),
                    'title' => $reservation->getSession()->getFormation()->getTitle()
                ]
            ],
            'status' => $reservation->getStatus(),
            'createdAt' => $reservation->getCreatedAt()->format('Y-m-d\TH:i:s')
        ];

        return $this->json($formattedData);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $status = $data['status'] ?? null;
        $customMessage = $data['customMessage'] ?? null;

        if (!$status) {
            return $this->json(['message' => 'Le statut est requis'], Response::HTTP_BAD_REQUEST);
        }

        $reservation = $this->reservationRepository->find($id);

        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $oldStatus = $reservation->getStatus();
        
        // Vérifier que le statut est valide (existe dans l'enum)
        if (!in_array($status, ReservationStatus::getAllStatuses())) {
            return $this->json([
                'message' => "Statut invalide: '{$status}'"
            ], Response::HTTP_BAD_REQUEST);
        }

        // Mettre à jour le statut
        $reservation->setStatus($status);

        // Envoyer une notification email si le statut a changé
        if ($oldStatus !== $status) {
            $this->notificationService->notifyReservationStatusChange($reservation, $oldStatus, $status, $customMessage);
        }

        // Si la réservation est confirmée, on peut ajouter l'utilisateur comme participant à la session
        if ($status === ReservationStatus::CONFIRMED) {
            $session = $reservation->getSession();
            $user = $reservation->getUser();

            if ($session && $user && !$session->getParticipants()->contains($user)) {
                $session->addParticipant($user);
            }
        }

        // Note: L'URL de création de mot de passe est maintenant intégrée directement 
        // dans le template awaiting_documents via getStatusSpecificVariables()

        $this->entityManager->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès']);
    }

    /**
     * Obtenir tous les statuts disponibles avec leurs informations
     * @Route("/api/admin/session-reservations/statuses", name="session_reservations_statuses", methods={"GET"})
     */
    public function getStatuses(): JsonResponse
    {
        $statusesByPhase = ReservationStatus::getStatusesByPhase();
        $formattedStatuses = [];

        foreach ($statusesByPhase as $phase => $statuses) {
            foreach ($statuses as $value => $label) {
                $formattedStatuses[] = [
                    'value' => $value,
                    'label' => $label,
                    'phase' => $phase,
                    'color' => ReservationStatus::getStatusColor($value),
                    'allowedTransitions' => ReservationStatus::getAllowedTransitions($value)
                ];
            }
        }

        return $this->json($formattedStatuses);
    }

    /**
     * Obtenir les transitions possibles pour un statut donné
     * @Route("/api/admin/session-reservations/transitions", name="session_reservations_transitions", methods={"GET"})
     */
    public function getTransitions(Request $request): JsonResponse
    {
        $fromStatus = $request->query->get('from');
        
        if (!$fromStatus) {
            return $this->json(['message' => 'Le paramètre "from" est requis'], Response::HTTP_BAD_REQUEST);
        }

        $allowedTransitions = ReservationStatus::getAllowedTransitions($fromStatus);
        $formattedTransitions = [];

        foreach ($allowedTransitions as $status) {
            $formattedTransitions[] = [
                'value' => $status,
                'label' => ReservationStatus::getStatusLabel($status),
                'color' => ReservationStatus::getStatusColor($status)
            ];
        }

        return $this->json($formattedTransitions);
    }
}