<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\VehicleRental;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/vehicle-rentals')]
class VehicleRentalController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    #[Route('', name: 'api_vehicle_rental_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // Récupérer les données du formulaire pour l'utilisateur
        $firstName = $request->request->get('firstName');
        $lastName = $request->request->get('lastName');
        $email = $request->request->get('email');
        $phone = $request->request->get('phone');
        $birthDate = $request->request->get('birthDate');
        $birthPlace = $request->request->get('birthPlace');
        $address = $request->request->get('address');
        $postalCode = $request->request->get('postalCode');
        $city = $request->request->get('city');

        // Vérifier les données essentielles
        if (!$firstName || !$lastName || !$email) {
            return $this->json([
                'success' => false,
                'message' => 'Les informations personnelles sont incomplètes'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer ou créer l'utilisateur
        $user = null;

        // Si l'utilisateur est connecté
        if ($this->getUser()) {
            $user = $this->getUser();
        } else {
            // Sinon, chercher un utilisateur avec cet email
            $user = $this->userRepository->findOneBy(['email' => $email]);

            // Si aucun utilisateur trouvé, en créer un nouveau
            if (!$user) {
                $user = new User();
                $user->setEmail($email);
                $user->setRoles(['ROLE_STUDENT']);

                // Générer un mot de passe aléatoire
                $randomPassword = bin2hex(random_bytes(8));
                $hashedPassword = $this->passwordHasher->hashPassword($user, $randomPassword);
                $user->setPassword($hashedPassword);

                // Enregistrer le mot de passe pour un éventuel envoi par email (à implémenter plus tard)
                // $this->sendWelcomeEmail($email, $randomPassword);
            }
        }

        // Mettre à jour les informations de l'utilisateur
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        if ($phone) $user->setPhone($phone);
        if ($birthPlace) $user->setBirthPlace($birthPlace);
        if ($address) $user->setAddress($address);
        if ($postalCode) $user->setPostalCode($postalCode);
        if ($city) $user->setCity($city);

        // Traiter la date de naissance
        if ($birthDate) {
            try {
                $birthDateObj = new \DateTime($birthDate);
                $user->setBirthDate($birthDateObj);
            } catch (\Exception $e) {
                // Logguer l'erreur mais continuer
                error_log('Erreur lors de la conversion de la date de naissance: ' . $e->getMessage());
            }
        }

        // Traiter les fichiers de permis de conduire
        if ($request->files->has('driverLicenseFront')) {
            $file = $request->files->get('driverLicenseFront');
            $fileName = uniqid() . '_front_' . $file->getClientOriginalName();

            // S'assurer que le répertoire existe
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/licenses';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // Déplacer le fichier
            $file->move($uploadDir, $fileName);
            $user->setDriverLicenseFrontFile($fileName);
        }

        if ($request->files->has('driverLicenseBack')) {
            $file = $request->files->get('driverLicenseBack');
            $fileName = uniqid() . '_back_' . $file->getClientOriginalName();

            // S'assurer que le répertoire existe
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/licenses';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // Déplacer le fichier
            $file->move($uploadDir, $fileName);
            $user->setDriverLicenseBackFile($fileName);
        }

        // Persister l'utilisateur
        $this->entityManager->persist($user);

        // Créer la réservation de véhicule
        $rental = new VehicleRental();
        $rental->setUser($user);
        //$rental->setRentalType($request->request->get('rentalType', 'exam'));
        $rental->setStatus($request->request->get('status', 'pending'));

        // Ajouter les notes si présentes
        if ($notes = $request->request->get('notes')) {
            $rental->setNotes($notes);
        }

        // Traiter les dates
        try {
            if ($startDate = $request->request->get('startDate')) {
                $rental->setStartDate(new \DateTimeImmutable($startDate));
            }

            if ($endDate = $request->request->get('endDate')) {
                $rental->setEndDate(new \DateTimeImmutable($endDate));
            }
        } catch (\Exception $e) {
            // Logguer l'erreur mais continuer
            error_log('Erreur lors de la conversion des dates: ' . $e->getMessage());
        }

        // Ajouter les informations de location/examen
        $rental->setPickupLocation($request->request->get('pickupLocation'));
        $rental->setReturnLocation($request->request->get('returnLocation'));
        $rental->setExamCenter($request->request->get('examCenter'));
        $rental->setFormula($request->request->get('formula'));

        // Ajouter les champs financiers et horaires
        if ($examTime = $request->request->get('examTime')) {
            $rental->setExamTime($examTime);
        }

        if ($facturation = $request->request->get('facturation')) {
            $rental->setFacturation($facturation);
        }

        if ($financing = $request->request->get('financing')) {
            $rental->setFinancing($financing);
        }

        if ($paymentMethod = $request->request->get('paymentMethod')) {
            $rental->setPaymentMethod($paymentMethod);
        }

        // Persister la réservation
        $this->entityManager->persist($rental);
        $this->entityManager->flush();

        // Logs pour le débogage
        error_log('Réservation créée: ID=' . $rental->getId() . ', Utilisateur=' . $user->getEmail());

        // Réponse réussie
        return $this->json([
            'success' => true,
            'message' => 'Votre demande de réservation a été enregistrée avec succès.',
            'id' => $rental->getId(),
            'status' => 'pending',
            'next_steps' => 'Un de nos conseillers vous contactera prochainement avec un devis personnalisé.'
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_vehicle_rental_get', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        // Récupérer la réservation depuis la base de données
        $rental = $this->entityManager->getRepository(VehicleRental::class)->find($id);

        if (!$rental) {
            return $this->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier les droits d'accès (seul le propriétaire ou un admin peut voir)
        if (!$this->isGranted('ROLE_ADMIN') && $this->getUser() !== $rental->getUser()) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }

        // Formater les données pour l'API
        $user = $rental->getUser();

        $response = [
            'id' => $rental->getId(),
            'status' => $rental->getStatus(),
            'rentalType' => $rental->getRentalType(),
            'dates' => [
                'start' => $rental->getStartDate() ? $rental->getStartDate()->format('Y-m-d H:i:s') : null,
                'end' => $rental->getEndDate() ? $rental->getEndDate()->format('Y-m-d H:i:s') : null,
                'examTime' => $rental->getExamTime()
            ],
            'locations' => [
                'pickup' => $rental->getPickupLocation(),
                'return' => $rental->getReturnLocation(),
                'examCenter' => $rental->getExamCenter()
            ],
            'formula' => $rental->getFormula(),
            'financial' => [
                'facturation' => $rental->getFacturation(),
                'financing' => $rental->getFinancing(),
                'paymentMethod' => $rental->getPaymentMethod()
            ],
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhone()
            ],
            'notes' => $rental->getNotes(),
            'createdAt' => $rental->getCreatedAt() ? $rental->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updatedAt' => $rental->getUpdatedAt() ? $rental->getUpdatedAt()->format('Y-m-d H:i:s') : null
        ];

        return $this->json([
            'success' => true,
            'data' => $response
        ]);
    }

    #[Route('/{id}/status', name: 'api_vehicle_rental_update_status', methods: ['PUT'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }

        // Récupérer la réservation
        $rental = $this->entityManager->getRepository(VehicleRental::class)->find($id);

        if (!$rental) {
            return $this->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Récupérer le nouveau statut
        $data = json_decode($request->getContent(), true);

        if (!isset($data['status'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le statut est requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Valider le statut
        $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        if (!in_array($data['status'], $validStatuses)) {
            return $this->json([
                'success' => false,
                'message' => 'Statut invalide. Valeurs possibles: ' . implode(', ', $validStatuses)
            ], Response::HTTP_BAD_REQUEST);
        }

        // Mettre à jour le statut
        $rental->setStatus($data['status']);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'status' => $data['status']
        ]);
    }

    #[Route('/user/current', name: 'api_vehicle_rental_user_rentals', methods: ['GET'])]
    public function getUserRentals(): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        if (!$this->getUser()) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer les réservations de l'utilisateur
        $rentals = $this->entityManager->getRepository(VehicleRental::class)
            ->findBy(['user' => $this->getUser()], ['createdAt' => 'DESC']);

        $formattedRentals = [];

        foreach ($rentals as $rental) {
            $formattedRentals[] = [
                'id' => $rental->getId(),
                'status' => $rental->getStatus(),
                'formula' => $rental->getFormula(),
                'examCenter' => $rental->getExamCenter(),
                'examDate' => $rental->getStartDate() ? $rental->getStartDate()->format('Y-m-d') : null,
                'examTime' => $rental->getExamTime(),
                'createdAt' => $rental->getCreatedAt() ? $rental->getCreatedAt()->format('Y-m-d') : null
            ];
        }

        return $this->json([
            'success' => true,
            'data' => $formattedRentals
        ]);
    }
}