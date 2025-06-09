<?php

namespace App\Controller\Api;

use App\Service\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api/contact", name="api_contact_")
 */
class ContactController extends AbstractController
{
    private $notificationService;
    private $validator;

    public function __construct(
        NotificationService $notificationService,
        ValidatorInterface $validator
    ) {
        $this->notificationService = $notificationService;
        $this->validator = $validator;
    }

    /**
     * @Route("", name="submit", methods={"POST"})
     */
    public function submitContact(Request $request): JsonResponse
    {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);

        // Validation des données
        $errors = $this->validateContactData($data);
        if (!empty($errors)) {
            return $this->json(['errors' => $errors], 400);
        }

        // Préparer les données pour la notification
        $contactData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message']
        ];

        try {
            // Envoyer les notifications d'emails
            $this->notificationService->notifyContactRequest($contactData);

            return $this->json([
                'message' => 'Votre demande de contact a été envoyée avec succès. Nous vous répondrons dans les plus brefs délais.'
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer plus tard.'
            ], 500);
        }
    }

    /**
     * Valider les données de contact
     */
    private function validateContactData(array $data): array
    {
        $errors = [];

        // Validation du nom
        if (!isset($data['name']) || empty(trim($data['name']))) {
            $errors['name'] = 'Le nom est requis';
        } elseif (strlen(trim($data['name'])) < 2) {
            $errors['name'] = 'Le nom doit contenir au moins 2 caractères';
        } elseif (strlen(trim($data['name'])) > 100) {
            $errors['name'] = 'Le nom ne peut pas dépasser 100 caractères';
        }

        // Validation de l'email
        if (!isset($data['email']) || empty(trim($data['email']))) {
            $errors['email'] = 'L\'email est requis';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Format d\'email invalide';
        }

        // Validation du téléphone (optionnel)
        if (isset($data['phone']) && !empty($data['phone'])) {
            if (!preg_match('/^[0-9+\-\s().]{8,20}$/', $data['phone'])) {
                $errors['phone'] = 'Format de téléphone invalide';
            }
        }

        // Validation du sujet
        if (!isset($data['subject']) || empty(trim($data['subject']))) {
            $errors['subject'] = 'Le sujet est requis';
        } elseif (strlen(trim($data['subject'])) < 5) {
            $errors['subject'] = 'Le sujet doit contenir au moins 5 caractères';
        } elseif (strlen(trim($data['subject'])) > 200) {
            $errors['subject'] = 'Le sujet ne peut pas dépasser 200 caractères';
        }

        // Validation du message
        if (!isset($data['message']) || empty(trim($data['message']))) {
            $errors['message'] = 'Le message est requis';
        } elseif (strlen(trim($data['message'])) < 10) {
            $errors['message'] = 'Le message doit contenir au moins 10 caractères';
        } elseif (strlen(trim($data['message'])) > 2000) {
            $errors['message'] = 'Le message ne peut pas dépasser 2000 caractères';
        }

        return $errors;
    }
}