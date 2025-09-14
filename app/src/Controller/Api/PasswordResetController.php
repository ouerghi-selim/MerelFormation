<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\NotificationService;
use App\Enum\NotificationEventType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Psr\Log\LoggerInterface;

#[Route('/api/auth')]
class PasswordResetController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;
    private NotificationService $notificationService;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        NotificationService $notificationService,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->notificationService = $notificationService;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->logger = $logger;
    }

    /**
     * Demande de réinitialisation de mot de passe
     */
    #[Route('/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function requestPasswordReset(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        if (!$email) {
            return new JsonResponse(['message' => 'Email requis'], 400);
        }

        // Validation de l'email
        $emailConstraint = new Assert\Email();
        $violations = $this->validator->validate($email, $emailConstraint);
        if (count($violations) > 0) {
            return new JsonResponse(['message' => 'Email invalide'], 400);
        }

        try {
            // Chercher l'utilisateur par email
            $user = $this->userRepository->findOneBy(['email' => $email]);
            // Pour des raisons de sécurité, on retourne toujours une réponse positive
            // même si l'utilisateur n'existe pas (évite l'énumération d'emails)
            if (!$user) {
                $this->logger->info("Tentative de reset pour email inexistant: {$email}");
                return new JsonResponse(['message' => 'Si cet email existe, vous recevrez un lien de réinitialisation'], 200);
            }

            // Vérifier si l'utilisateur a déjà un token de reset récent (rate limiting)
            if ($user->getSetupToken() && $user->isSetupTokenValid()) {
                $this->logger->warning("Tentative de reset multiple pour: {$email}");
                return new JsonResponse(['message' => 'Un email de réinitialisation a déjà été envoyé récemment'], 429);
            }

            // Générer un token de réinitialisation (réutilise setupToken)
            $resetToken = bin2hex(random_bytes(32));
            $expiresAt = new \DateTime('+1 hour'); // Expiration courte pour sécurité

            $user->setSetupToken($resetToken);
            $user->setSetupTokenExpiresAt($expiresAt);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            // Envoyer l'email de réinitialisation
            $this->notificationService->notifyPasswordReset($user, $resetToken);

            $this->logger->info("Email de réinitialisation envoyé pour: {$email}");

            return new JsonResponse([
                'message' => 'Si cet email existe, vous recevrez un lien de réinitialisation'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la demande de reset: ' . $e->getMessage());
            return new JsonResponse(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Validation d'un token de réinitialisation
     */
    #[Route('/validate-reset-token', name: 'api_validate_reset_token', methods: ['POST'])]
    public function validateResetToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $email = $data['email'] ?? null;

        if (!$token || !$email) {
            return new JsonResponse(['valid' => false, 'message' => 'Token ou email manquant'], 400);
        }

        try {
            $user = $this->userRepository->findOneBy(['email' => $email]);
            
            if (!$user) {
                return new JsonResponse(['valid' => false, 'message' => 'Utilisateur non trouvé'], 404);
            }

            // Vérifier la validité du token
            if ($user->getSetupToken() !== $token) {
                return new JsonResponse(['valid' => false, 'message' => 'Token invalide'], 400);
            }

            if (!$user->isSetupTokenValid()) {
                return new JsonResponse(['valid' => false, 'message' => 'Token expiré'], 400);
            }

            return new JsonResponse([
                'valid' => true,
                'user' => [
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la validation du token: ' . $e->getMessage());
            return new JsonResponse(['valid' => false, 'message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Réinitialisation effective du mot de passe
     */
    #[Route('/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $confirmPassword = $data['confirmPassword'] ?? null;

        if (!$token || !$email || !$password || !$confirmPassword) {
            return new JsonResponse(['message' => 'Données manquantes'], 400);
        }

        // Vérification que les mots de passe correspondent
        if ($password !== $confirmPassword) {
            return new JsonResponse(['message' => 'Les mots de passe ne correspondent pas'], 400);
        }

        // Validation de la complexité du mot de passe
        if (strlen($password) < 8) {
            return new JsonResponse(['message' => 'Le mot de passe doit contenir au moins 8 caractères'], 400);
        }

        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $password)) {
            return new JsonResponse([
                'message' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
            ], 400);
        }

        try {
            $user = $this->userRepository->findOneBy(['email' => $email]);
            
            if (!$user) {
                return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
            }

            // Vérifier la validité du token
            if ($user->getSetupToken() !== $token) {
                return new JsonResponse(['message' => 'Token invalide'], 400);
            }

            if (!$user->isSetupTokenValid()) {
                return new JsonResponse(['message' => 'Token expiré'], 400);
            }

            // Hasher le nouveau mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
            $user->setPassword($hashedPassword);

            // Supprimer le token (usage unique)
            $user->setSetupToken(null);
            $user->setSetupTokenExpiresAt(null);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $this->logger->info("Mot de passe réinitialisé pour: {$email}");

            return new JsonResponse([
                'message' => 'Mot de passe réinitialisé avec succès'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la réinitialisation: ' . $e->getMessage());
            return new JsonResponse(['message' => 'Erreur serveur'], 500);
        }
    }
}