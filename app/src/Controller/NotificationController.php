<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/notifications")
 */
class NotificationController extends AbstractController
{
    private $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * @Route("/send", methods={"POST"})
     */
    public function sendNotification(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $result = $this->notificationService->sendNotification($data);

        return new JsonResponse(['status' => 'Notification sent', 'result' => $result]);
    }

    /**
     * @Route("/list", methods={"GET"})
     */
    public function listNotifications(EntityManagerInterface $em): JsonResponse
    {
        $notifications = $em->getRepository(Notification::class)->findAll();

        return new JsonResponse($notifications);
    }
}
