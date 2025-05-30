<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Vehicle;
use App\Entity\VehicleRental;
use App\Service\VehicleRentalTrackingService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class VehicleRentalFixtures extends Fixture implements DependentFixtureInterface
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
        private VehicleRentalTrackingService $trackingService
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Créer des utilisateurs pour les réservations
        $users = $this->createTestUsers($manager);

        // Réservations pour examen avec système de tracking
        $examRentals = [
            [
                'startDate' => new \DateTimeImmutable('+2 weeks'),
                'endDate' => new \DateTimeImmutable('+2 weeks'),
                'totalPrice' => '240.00',
                'status' => 'pending',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_1_REFERENCE, Vehicle::class),
                'user' => $users[0], // Jean Dupont
                'pickupLocation' => '35 Rennes (Bruz)',
                'returnLocation' => '35 Rennes (Bruz)',
                'examCenter' => '35 Rennes (Bruz)',
                'formula' => 'Centre examen Rennes: Formule intégrale (240€ TTC)',
                'examTime' => '09:00',
                'facturation' => 'Jean Dupont',
                'financing' => 'Personnel',
                'paymentMethod' => 'Virement bancaire',
                'notes' => 'Besoin d\'un certificat de présence',
                'adminNotes' => null,
                'updatedAt' => null
            ],
            [
                'startDate' => new \DateTimeImmutable('+1 month'),
                'endDate' => new \DateTimeImmutable('+1 month'),
                'totalPrice' => '120.00',
                'status' => 'confirmed',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_2_REFERENCE, Vehicle::class),
                'user' => $users[1], // Marie Martin
                'pickupLocation' => '22 Saint Brieuc',
                'returnLocation' => '22 Saint Brieuc',
                'examCenter' => '22 Saint Brieuc',
                'formula' => 'Centre examen Autres: Formule simple (nous consulter)',
                'examTime' => '14:30',
                'facturation' => 'Marie Martin',
                'financing' => 'Personnel',
                'paymentMethod' => 'Carte bancaire',
                'notes' => 'Arrivera 15 minutes en avance',
                'adminNotes' => 'Réservation confirmée. Véhicule préparé et disponible.',
                'updatedAt' => new \DateTimeImmutable('-2 days')
            ],
            [
                'startDate' => new \DateTimeImmutable('+3 weeks'),
                'endDate' => new \DateTimeImmutable('+3 weeks'),
                'totalPrice' => '120.00',
                'status' => 'pending',
                'vehicle' => null, // Pas encore assigné
                'user' => $users[2], // Thomas Petit
                'pickupLocation' => '35 Rennes (Bruz)',
                'returnLocation' => '35 Rennes (Bruz)',
                'examCenter' => '35 Rennes (Bruz)',
                'formula' => 'Centre examen Rennes: Formule simple (120€ TTC)',
                'examTime' => '10:15',
                'facturation' => 'Thomas Petit',
                'financing' => 'Personnel',
                'paymentMethod' => 'Virement bancaire',
                'notes' => 'Premier passage d\'examen',
                'adminNotes' => null,
                'updatedAt' => null
            ],
            [
                'startDate' => new \DateTimeImmutable('+4 weeks'),
                'endDate' => new \DateTimeImmutable('+4 weeks'),
                'totalPrice' => '180.00',
                'status' => 'cancelled',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_1_REFERENCE, Vehicle::class),
                'user' => $users[3], // Sophie Moreau
                'pickupLocation' => '29 Brest',
                'returnLocation' => '29 Brest',
                'examCenter' => '29 Brest',
                'formula' => 'Centre examen Brest: Formule standard (180€ TTC)',
                'examTime' => '16:45',
                'facturation' => 'Sophie Moreau',
                'financing' => 'Personnel',
                'paymentMethod' => 'Carte bancaire',
                'notes' => 'Demande de remboursement suite à annulation',
                'adminNotes' => 'Annulation suite à report d\'examen. Remboursement en cours.',
                'updatedAt' => new \DateTimeImmutable('-1 day')
            ],
            [
                'startDate' => new \DateTimeImmutable('-1 week'),
                'endDate' => new \DateTimeImmutable('-1 week'),
                'totalPrice' => '240.00',
                'status' => 'completed',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_2_REFERENCE, Vehicle::class),
                'user' => $users[4], // Laurent Dubois
                'pickupLocation' => '56 Vannes',
                'returnLocation' => '56 Vannes',
                'examCenter' => '56 Vannes',
                'formula' => 'Centre examen Vannes: Formule complète (240€ TTC)',
                'examTime' => '11:30',
                'facturation' => 'Laurent Dubois',
                'financing' => 'Personnel',
                'paymentMethod' => 'Virement bancaire',
                'notes' => 'Examen réussi avec succès !',
                'adminNotes' => 'Examen réussi ! Félicitations au client. Véhicule rendu en parfait état.',
                'updatedAt' => new \DateTimeImmutable('-1 week')
            ]
        ];

        foreach ($examRentals as $index => $rentalData) {
            $rental = new VehicleRental();

            // Champs de base
            $rental->setStartDate($rentalData['startDate']);
            $rental->setEndDate($rentalData['endDate']);
            $rental->setTotalPrice($rentalData['totalPrice']);
            $rental->setStatus($rentalData['status']);
            $rental->setVehicle($rentalData['vehicle']);
            $rental->setUser($rentalData['user']);
            $rental->setPickupLocation($rentalData['pickupLocation']);
            $rental->setReturnLocation($rentalData['returnLocation']);

            // Champs spécifiques aux examens
            $rental->setExamCenter($rentalData['examCenter']);
            $rental->setFormula($rentalData['formula']);
            $rental->setExamTime($rentalData['examTime']);
            $rental->setFacturation($rentalData['facturation']);
            $rental->setFinancing($rentalData['financing']);
            $rental->setPaymentMethod($rentalData['paymentMethod']);
            $rental->setNotes($rentalData['notes']);

            // CHAMPS TRACKING
            if ($rentalData['adminNotes']) {
                $rental->setAdminNotes($rentalData['adminNotes']);
            }

            if ($rentalData['updatedAt']) {
                $rental->setUpdatedAt($rentalData['updatedAt']);
            }

            // Date de création réaliste
            $createdDaysAgo = match($rentalData['status']) {
                'pending' => rand(1, 3),
                'confirmed' => rand(3, 7),
                'cancelled' => rand(2, 5),
                'completed' => rand(7, 14),
                default => 1
            };

            $manager->persist($rental);

            // Générer et assigner le token de suivi APRÈS la persistance
            $manager->flush(); // Flush pour avoir l'ID

            $trackingToken = $this->trackingService->generateTrackingToken($rental);
            $rental->setTrackingToken($trackingToken);

            // Créer une référence pour les tests
            $this->addReference("rental_$index", $rental);
        }

        $manager->flush();
    }

    private function createTestUsers(ObjectManager $manager): array
    {
        $usersData = [
            [
                'firstName' => 'Jean',
                'lastName' => 'Dupont',
                'email' => 'jean.dupont@email.com',
                'phone' => '06 12 34 56 78',
                'address' => '123 Rue des Examens',
                'postalCode' => '35000',
                'city' => 'Rennes'
            ],
            [
                'firstName' => 'Marie',
                'lastName' => 'Martin',
                'email' => 'marie.martin@email.com',
                'phone' => '06 87 65 43 21',
                'address' => '45 Boulevard des Tests',
                'postalCode' => '22000',
                'city' => 'Saint Brieuc'
            ],
            [
                'firstName' => 'Thomas',
                'lastName' => 'Petit',
                'email' => 'thomas.petit@email.com',
                'phone' => '06 55 44 33 22',
                'address' => '78 Avenue de la Liberté',
                'postalCode' => '35700',
                'city' => 'Rennes'
            ],
            [
                'firstName' => 'Sophie',
                'lastName' => 'Moreau',
                'email' => 'sophie.moreau@email.com',
                'phone' => '06 98 76 54 32',
                'address' => '12 Quai des Navigateurs',
                'postalCode' => '29200',
                'city' => 'Brest'
            ],
            [
                'firstName' => 'Laurent',
                'lastName' => 'Dubois',
                'email' => 'laurent.dubois@email.com',
                'phone' => '06 11 22 33 44',
                'address' => '89 Rue du Port',
                'postalCode' => '56000',
                'city' => 'Vannes'
            ]
        ];

        $users = [];
        foreach ($usersData as $userData) {
            $user = new User();
            $user->setFirstName($userData['firstName']);
            $user->setLastName($userData['lastName']);
            $user->setEmail($userData['email']);
            $user->setPhone($userData['phone']);
            $user->setAddress($userData['address']);
            $user->setPostalCode($userData['postalCode']);
            $user->setCity($userData['city']);
            $user->setRoles(['ROLE_STUDENT']);

            // Mot de passe par défaut
            $hashedPassword = $this->passwordHasher->hashPassword($user, 'password123');
            $user->setPassword($hashedPassword);

            $manager->persist($user);
            $users[] = $user;
        }

        $manager->flush(); // Flush pour avoir les IDs des users

        return $users;
    }

    public function getDependencies(): array
    {
        return [
            VehicleFixtures::class,
        ];
    }
}