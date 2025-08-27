<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\Document;
use App\Entity\Reservation;
use App\Entity\Company;
use App\Repository\UserRepository;
use App\Repository\ReservationRepository;
use App\Repository\CompanyRepository;
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
    private $companyRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        LoggerInterface $logger,
        UserRepository $userRepository,
        ReservationRepository $reservationRepository,
        CompanyRepository $companyRepository
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
        $this->reservationRepository = $reservationRepository;
        $this->companyRepository = $companyRepository;
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
     * Vérifie si une entreprise existe déjà avec ce SIRET
     */
    #[Route('/check-company-siret', name: 'api_check_company_siret', methods: ['POST'])]
    public function checkCompanySiret(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $siret = $data['siret'] ?? null;

        if (!$siret) {
            return new JsonResponse(['error' => 'SIRET manquant'], 400);
        }

        // Vérifier que le SIRET a exactement 14 chiffres
        if (!preg_match('/^[0-9]{14}$/', $siret)) {
            return new JsonResponse(['error' => 'SIRET invalide'], 400);
        }

        try {
            // Chercher l'entreprise par SIRET
            $company = $this->companyRepository->findBySiret($siret);
            
            if ($company) {
                return new JsonResponse([
                    'exists' => true,
                    'company' => [
                        'name' => $company->getName(),
                        'address' => $company->getAddress(),
                        'postalCode' => $company->getPostalCode(),
                        'city' => $company->getCity(),
                        'responsableName' => $company->getResponsableName(),
                        'email' => $company->getEmail(),
                        'phone' => $company->getPhone(),
                    ]
                ]);
            }
            
            return new JsonResponse(['exists' => false]);

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la vérification du SIRET: ' . $e->getMessage());
            return new JsonResponse(['error' => 'Erreur serveur'], 500);
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
        
        // Données entreprise (optionnelles)
        $hasEmployer = $request->request->get('hasEmployer') === 'true';
        $companyName = $request->request->get('companyName');
        $companyAddress = $request->request->get('companyAddress');
        $companyPostalCode = $request->request->get('companyPostalCode');
        $companyCity = $request->request->get('companyCity');
        $companySiret = $request->request->get('companySiret');
        $companyResponsableName = $request->request->get('companyResponsableName');
        $companyEmail = $request->request->get('companyEmail');
        $companyPhone = $request->request->get('companyPhone');

        if (!$token || !$email || !$password || !$birthDate || !$birthPlace || !$address || !$postalCode || !$city) {
            return new JsonResponse(['message' => 'Données manquantes'], 400);
        }
        
        // Validation des données entreprise si activées
        if ($hasEmployer) {
            if (!$companyName || !$companyAddress || !$companyPostalCode || !$companyCity || 
                !$companySiret || !$companyResponsableName || !$companyEmail || !$companyPhone) {
                return new JsonResponse(['message' => 'Données entreprise manquantes'], 400);
            }
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

            // Gérer l'entreprise si activée
            if ($hasEmployer) {
                // Vérifier si l'entreprise existe déjà par SIRET
                $existingCompany = $this->companyRepository->findBySiret($companySiret);
                
                if ($existingCompany) {
                    // Utiliser l'entreprise existante
                    $user->setCompany($existingCompany);
                    $this->logger->info("Utilisateur associé à l'entreprise existante: {$existingCompany->getName()}");
                } else {
                    // Créer une nouvelle entreprise
                    $company = new Company();
                    $company->setName($companyName);
                    $company->setAddress($companyAddress);
                    $company->setPostalCode($companyPostalCode);
                    $company->setCity($companyCity);
                    $company->setSiret($companySiret);
                    $company->setResponsableName($companyResponsableName);
                    $company->setEmail($companyEmail);
                    $company->setPhone($companyPhone);
                    
                    // Valider l'entreprise
                    $companyErrors = $this->validator->validate($company);
                    if (count($companyErrors) > 0) {
                        $errorMessages = [];
                        foreach ($companyErrors as $error) {
                            $errorMessages[] = $error->getMessage();
                        }
                        return new JsonResponse(['message' => 'Erreurs de validation entreprise', 'errors' => $errorMessages], 400);
                    }
                    
                    // Persister l'entreprise
                    $this->entityManager->persist($company);
                    $user->setCompany($company);
                    
                    $this->logger->info("Nouvelle entreprise créée: {$companyName} (SIRET: {$companySiret})");
                }
            }

            // Gérer les fichiers uploadés comme entités Document (optionnels)
            $documentTitles = [
                'driverLicenseRecto' => 'Permis de conduire (recto)',
                'driverLicenseVerso' => 'Permis de conduire (verso)',
                'professionalCard' => 'Carte professionnelle',
                'convocation' => 'Convocation'
            ];

            foreach ($documentTitles as $requestKey => $title) {
                $file = $request->files->get($requestKey);
                if ($file) {
                    // Créer une entité Document
                    $document = new Document();
                    $document->setTitle($title);
                    $document->setCategory('attestation');   // Utilisation de la catégorie existante
                    $document->setUser($user);              // Propriétaire du document
                    $document->setUploadedBy($user);        // Uploadé par lui-même
                    $document->setPrivate(true);            // Document privé d'inscription
                    $document->setFile($file);              // VichUploader gérera l'upload
                    
                    // Déterminer le type basé sur l'extension
                    $extension = $file->guessExtension();
                    $typeMapping = [
                        'pdf' => 'pdf',
                        'doc' => 'doc',
                        'docx' => 'docx',
                        'jpg' => 'pdf', // On force pdf pour les images pour cohérence
                        'jpeg' => 'pdf',
                        'png' => 'pdf'
                    ];
                    $document->setType($typeMapping[$extension] ?? 'pdf');
                    
                    // Persister le document
                    $this->entityManager->persist($document);
                    
                    $this->logger->info("Document d'inscription créé: {$title} pour l'utilisateur: " . $user->getEmail());
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