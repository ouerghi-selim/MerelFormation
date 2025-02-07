<?php

namespace App\Controller;

use App\Entity\Session;
use App\Entity\Reservation;
use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class SessionController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SessionRepository $sessionRepository
    ) {
    }

    #[Route('/sessions', name: 'session_list', methods: ['GET'])]
    public function index(): Response
    {
        $sessions = $this->sessionRepository->findUpcomingSessions();
        return $this->render('session/index.html.twig', [
            'sessions' => $sessions,
        ]);
    }

    #[Route('/admin/sessions/new', name: 'session_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $session = new Session();
            $session->setFormation($request->request->get('formation'));
            $session->setStartDate(new \DateTimeImmutable($request->request->get('startDate')));
            $session->setEndDate(new \DateTimeImmutable($request->request->get('endDate')));
            $session->setMaxParticipants((int)$request->request->get('maxParticipants'));
            $session->setLocation($request->request->get('location'));
            $session->setStatus('scheduled');

            $this->entityManager->persist($session);
            $this->entityManager->flush();

            return $this->redirectToRoute('session_list');
        }

        return $this->render('admin/session/new.html.twig');
    }

    #[Route('/admin/sessions/{id}', name: 'session_edit', methods: ['GET', 'POST'])]
    public function edit(Session $session, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $session->setStartDate(new \DateTimeImmutable($request->request->get('startDate')));
            $session->setEndDate(new \DateTimeImmutable($request->request->get('endDate')));
            $session->setMaxParticipants((int)$request->request->get('maxParticipants'));
            $session->setLocation($request->request->get('location'));
            $session->setStatus($request->request->get('status'));

            $this->entityManager->flush();
            return $this->redirectToRoute('session_list');
        }

        return $this->render('admin/session/edit.html.twig', [
            'session' => $session,
        ]);
    }

    #[Route('/sessions/{id}/register', name: 'session_register', methods: ['GET', 'POST'])]
    public function register(Session $session, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($request->isMethod('POST')) {
            $reservation = new Reservation();
            $reservation->setUser($this->getUser());
            $reservation->setSession($session);
            $reservation->setStatus('pending');
            
            $this->entityManager->persist($reservation);
            $this->entityManager->flush();

            return $this->redirectToRoute('reservation_confirmation', ['id' => $reservation->getId()]);
        }

        return $this->render('session/register.html.twig', [
            'session' => $session,
        ]);
    }

    #[Route('/admin/sessions/{id}/participants', name: 'session_participants', methods: ['GET'])]
    public function participants(Session $session): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        return $this->render('admin/session/participants.html.twig', [
            'session' => $session,
            'participants' => $session->getParticipants(),
        ]);
    }

    #[Route('/admin/sessions/{id}/status', name: 'session_status', methods: ['POST'])]
    public function updateStatus(Session $session, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $status = $request->request->get('status');
        if (in_array($status, ['scheduled', 'ongoing', 'completed', 'cancelled'])) {
            $session->setStatus($status);
            $this->entityManager->flush();
        }

        return $this->redirectToRoute('session_list');
    }

    #[Route('/sessions/calendar', name: 'session_calendar', methods: ['GET'])]
    public function calendar(Request $request): Response
    {
        $startDate = new \DateTimeImmutable($request->query->get('start', 'first day of this month'));
        $endDate = new \DateTimeImmutable($request->query->get('end', 'last day of this month'));

        $sessions = $this->sessionRepository->findByDateRange($startDate, $endDate);

        return $this->render('session/calendar.html.twig', [
            'sessions' => $sessions,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}