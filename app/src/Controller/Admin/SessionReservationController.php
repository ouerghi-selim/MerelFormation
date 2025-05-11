<?php

namespace App\Controller\Admin;

use App\Entity\Reservation;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;

class SessionReservationController extends AbstractController
{
    private $entityManager;
    private $reservationRepository;
    private $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        ReservationRepository $reservationRepository,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->reservationRepository = $reservationRepository;
        $this->serializer = $serializer;
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

        if (!$status) {
            return $this->json(['message' => 'Le statut est requis'], Response::HTTP_BAD_REQUEST);
        }

        $reservation = $this->reservationRepository->find($id);

        if (!$reservation) {
            return $this->json(['message' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Mettre à jour le statut
        $reservation->setStatus($status);

        // Si la réservation est confirmée, on peut ajouter l'utilisateur comme participant à la session
        if ($status === 'confirmed') {
            $session = $reservation->getSession();
            $user = $reservation->getUser();

            if ($session && $user && !$session->getParticipants()->contains($user)) {
                $session->addParticipant($user);
            }
        }

        $this->entityManager->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès']);
    }
}