<?php

namespace App\Controller\Api;

use App\Entity\Reservation;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/reservations')]
class ReservationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ReservationRepository $reservationRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'app_reservations_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $status = $request->query->get('status');

        $criteria = [];
        if ($status) {
            $criteria['status'] = $status;
        }

        if (!$this->isGranted('ROLE_ADMIN')) {
            $criteria['user'] = $this->getUser();
        }

        $reservations = $this->reservationRepository->findBy(
            $criteria,
            ['createdAt' => 'DESC'],
            $limit,
            ($page - 1) * $limit
        );

        $totalReservations = $this->reservationRepository->count($criteria);

        return $this->json([
            'data' => $reservations,
            'total' => $totalReservations,
            'page' => $page,
            'limit' => $limit,
        ], Response::HTTP_OK, [], ['groups' => ['reservation:read']]);
    }

    #[Route('/{id}', name: 'app_reservations_show', methods: ['GET'])]
    public function show(Reservation $reservation): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN') && $reservation->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        return $this->json($reservation, Response::HTTP_OK, [], ['groups' => ['reservation:read', 'reservation:item:read']]);
    }

    #[Route('', name: 'app_reservations_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $reservation = $this->serializer->deserialize(
            $request->getContent(),
            Reservation::class,
            'json',
            ['groups' => ['reservation:write']]
        );

        $errors = $this->validator->validate($reservation);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        if (!$this->isGranted('ROLE_ADMIN')) {
            $reservation->setUser($this->getUser());
        }

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        return $this->json($reservation, Response::HTTP_CREATED, [], ['groups' => ['reservation:read']]);
    }

    #[Route('/{id}', name: 'app_reservations_update', methods: ['PUT'])]
    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN') && $reservation->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $this->serializer->deserialize(
            $request->getContent(),
            Reservation::class,
            'json',
            ['object_to_populate' => $reservation, 'groups' => ['reservation:write']]
        );

        $errors = $this->validator->validate($reservation);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json($reservation, Response::HTTP_OK, [], ['groups' => ['reservation:read']]);
    }

    #[Route('/{id}/cancel', name: 'app_reservations_cancel', methods: ['PUT'])]
    public function cancel(Reservation $reservation): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN') && $reservation->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $reservation->setStatus('cancelled');
        $this->entityManager->flush();

        return $this->json($reservation, Response::HTTP_OK, [], ['groups' => ['reservation:read']]);
    }

    #[Route('/statistics', name: 'app_reservations_statistics', methods: ['GET'])]
    public function getStatistics(): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $statistics = $this->reservationRepository->getStatistics();

        return $this->json($statistics);
    }

    #[Route('/search', name: 'app_reservations_search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $criteria = [
            'status' => $request->query->get('status'),
            'formation' => $request->query->get('formation'),
            'dateRange' => [
                'start' => $request->query->get('startDate'),
                'end' => $request->query->get('endDate')
            ],
            'paymentStatus' => $request->query->get('paymentStatus'),
            'search' => $request->query->get('search'),
        ];

        $reservations = $this->reservationRepository->searchByCriteria(array_filter($criteria));

        return $this->json($reservations, Response::HTTP_OK, [], ['groups' => ['reservation:read']]);
    }

    #[Route('/overdue', name: 'app_reservations_overdue', methods: ['GET'])]
    public function overdue(): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $overduePayments = $this->reservationRepository->findOverduePayments();

        return $this->json($overduePayments, Response::HTTP_OK, [], ['groups' => ['reservation:read']]);
    }
}