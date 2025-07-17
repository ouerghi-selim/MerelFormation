<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\Reservation;
use App\Repository\UserRepository;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Psr\Log\LoggerInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    private $entityManager;
    private $passwordHasher;
    private $validator;
    private $logger;
    private $userRepository;
    private $reservationRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        LoggerInterface $logger,
        UserRepository $userRepository,
        ReservationRepository $reservationRepository
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
        $this->reservationRepository = $reservationRepository;
    }

    /**
     * Valide un token de finalisation d'inscription
     */
    #[Route('/validate-setup-token', name: 'api_validate_setup_token', methods: ['POST'])]
    public function validateSetupToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $email = $data['email'] ?? null;

        if (!$token || !$email) {
            return new JsonResponse(['valid' => false, 'message' => 'Token ou email manquant'], 400);
        }

        try {
            // Chercher l'utilisateur par email
            $user = $this->userRepository->findOneBy(['email' => $email]);
            
            if (!$user) {
                return new JsonResponse(['valid' => false, 'message' => 'Utilisateur non trouvé'], 404);
            }

            // Vérifier si l'utilisateur a déjà finalisé son inscription
            if ($user->getPassword() && !empty($user->getBirthDate())) {
                return new JsonResponse(['valid' => false, 'message' => 'Inscription déjà finalisée'], 400);
            }

            // Vérifier la validité du token stocké en base
            if ($user->getSetupToken() !== $token) {
                return new JsonResponse(['valid' => false, 'message' => 'Token invalide'], 400);
            }

            if (!$user->isSetupTokenValid()) {
                return new JsonResponse(['valid' => false, 'message' => 'Token expiré'], 400);
            }

            // Déterminer le type de formation basé sur les réservations de l'utilisateur
            $reservations = $this->reservationRepository->findBy(['user' => $user]);
            $formationType = 'initiale'; // Par défaut

            if (!empty($reservations)) {
                $latestReservation = $reservations[0];
                $formation = $latestReservation->getSession()->getFormation();
                $formationTitle = strtolower($formation->getTitle());
                
                if (strpos($formationTitle, 'mobilité') !== false) {
                    $formationType = 'mobilite';
                } elseif (strpos($formationTitle, 'continue') !== false || strpos($formationTitle, 'recyclage') !== false) {
                    $formationType = 'continue';
                }
            }

            return new JsonResponse([
                'valid' => true,
                'formationType' => $formationType,
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
     * Finalise l'inscription d'un utilisateur
     */
    #[Route('/complete-registration', name: 'api_complete_registration', methods: ['POST'])]
    public function completeRegistration(Request $request): JsonResponse
    {
        $token = $request->request->get('token');
        $email = $request->request->get('email');
        $password = $request->request->get('password');
        $birthDate = $request->request->get('birthDate');
        $birthPlace = $request->request->get('birthPlace');
        $address = $request->request->get('address');
        $postalCode = $request->request->get('postalCode');
        $city = $request->request->get('city');

        if (!$token || !$email || !$password || !$birthDate || !$birthPlace || !$address || !$postalCode || !$city) {
            return new JsonResponse(['message' => 'Données manquantes'], 400);
        }

        try {
            // Chercher l'utilisateur
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

            // Vérifier si l'inscription n'est pas déjà finalisée
            if ($user->getPassword() && !empty($user->getBirthDate())) {
                return new JsonResponse(['message' => 'Inscription déjà finalisée'], 400);
            }

            // Hasher le mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
            $user->setPassword($hashedPassword);

            // Mettre à jour les informations personnelles
            $user->setBirthDate(new \DateTime($birthDate));
            $user->setBirthPlace($birthPlace);
            $user->setAddress($address);
            $user->setPostalCode($postalCode);
            $user->setCity($city);

            // Supprimer le token d'inscription (utilisé une seule fois)
            $user->setSetupToken(null);
            $user->setSetupTokenExpiresAt(null);

            // Gérer les fichiers uploadés (optionnels)
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/user-documents/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $files = [
                'driverLicense' => 'driverLicenseFrontFile', // On utilise le champ front pour le permis unique
                'professionalCard' => 'professionalCardFile',
                'registrationFile' => 'registrationFile',
                'attestationInscription' => 'attestationInscriptionFile',
                'convocation' => 'convocationFile'
            ];

            foreach ($files as $requestKey => $entityField) {
                $file = $request->files->get($requestKey);
                if ($file) {
                    $filename = uniqid() . '.' . $file->guessExtension();
                    $file->move($uploadDir, $filename);
                    
                    // Pour l'instant, on stocke juste le nom du fichier
                    // Dans un vrai système, on aurait des entités séparées pour les documents
                    if ($requestKey === 'driverLicense') {
                        $user->setDriverLicenseFrontFile($filename);
                    }
                    // TODO: Ajouter les autres champs ou créer des entités Document
                }
            }

            // Valider l'entité
            $errors = $this->validator->validate($user);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return new JsonResponse(['message' => 'Erreurs de validation', 'errors' => $errorMessages], 400);
            }

            // Sauvegarder
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $this->logger->info("Inscription finalisée pour l'utilisateur: " . $user->getEmail());

            return new JsonResponse([
                'message' => 'Inscription finalisée avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la finalisation d\'inscription: ' . $e->getMessage());
            return new JsonResponse(['message' => 'Erreur serveur lors de la finalisation'], 500);
        }
    }
}