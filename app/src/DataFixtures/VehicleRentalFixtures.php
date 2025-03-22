<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Vehicle;
use App\Entity\VehicleRental;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class VehicleRentalFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Réservations pour examen uniquement
        $examRentals = [
            [
                'startDate' => new \DateTimeImmutable('+2 weeks'),
                'endDate' => new \DateTimeImmutable('+2 weeks'),
                'totalPrice' => 240.00,
                'status' => 'pending',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_1_REFERENCE, Vehicle::class),
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE, User::class),
                'pickupLocation' => '35 Rennes (Bruz)',
                'returnLocation' => '35 Rennes (Bruz)',
                'examCenter' => '35 Rennes (Bruz)',
                'formula' => 'Centre examen Rennes: Formule intégrale (240€ TTC)',
                'examTime' => '09:00',
                'birthPlace' => 'Rennes',
                'birthDate' => new \DateTime('1990-05-15'),
                'address' => '123 Rue des Examens',
                'postalCode' => '35000',
                'city' => 'Rennes',
                'facturation' => 'Jean Dupont',
                'financing' => 'Personnel',
                'paymentMethod' => 'Virement bancaire',
                'notes' => 'Besoin d\'un certificat de présence'
            ],
            [
                'startDate' => new \DateTimeImmutable('+1 month'),
                'endDate' => new \DateTimeImmutable('+1 month'),
                'totalPrice' => 120.00,
                'status' => 'confirmed',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_2_REFERENCE, Vehicle::class),
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE, User::class),
                'pickupLocation' => '22 Saint Brieuc',
                'returnLocation' => '22 Saint Brieuc',
                'examCenter' => '22 Saint Brieuc',
                'formula' => 'Centre examen Autres: Formule simple (nous consulter)',
                'examTime' => '14:30',
                'birthPlace' => 'Saint Brieuc',
                'birthDate' => new \DateTime('1988-11-23'),
                'address' => '45 Boulevard des Tests',
                'postalCode' => '22000',
                'city' => 'Saint Brieuc',
                'facturation' => 'Marie Martin',
                'financing' => 'Personnel',
                'paymentMethod' => 'Carte bancaire',
                'notes' => 'Arrivera 15 minutes en avance'
            ],
            [
                'startDate' => new \DateTimeImmutable('+3 weeks'),
                'endDate' => new \DateTimeImmutable('+3 weeks'),
                'totalPrice' => 120.00,
                'status' => 'pending',
                'vehicle' => null, // Pas encore assigné
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE, User::class),
                'pickupLocation' => '35 Rennes (Bruz)',
                'returnLocation' => '35 Rennes (Bruz)',
                'examCenter' => '35 Rennes (Bruz)',
                'formula' => 'Centre examen Rennes: Formule simple (120€ TTC)',
                'examTime' => '10:15',
                'birthPlace' => 'Nantes',
                'birthDate' => new \DateTime('1995-08-27'),
                'address' => '78 Avenue de la Liberté',
                'postalCode' => '35700',
                'city' => 'Rennes',
                'facturation' => 'Thomas Petit',
                'financing' => 'Personnel',
                'paymentMethod' => 'Virement bancaire',
                'notes' => 'Premier passage d\'examen'
            ],
        ];

        foreach ($examRentals as $rentalData) {
            $rental = new VehicleRental();
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
            $rental->setBirthPlace($rentalData['birthPlace']);
            $rental->setBirthDate($rentalData['birthDate']);
            $rental->setAddress($rentalData['address']);
            $rental->setPostalCode($rentalData['postalCode']);
            $rental->setCity($rentalData['city']);
            $rental->setFacturation($rentalData['facturation']);
            $rental->setFinancing($rentalData['financing']);
            $rental->setPaymentMethod($rentalData['paymentMethod']);
            $rental->setNotes($rentalData['notes']);

            $manager->persist($rental);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            VehicleFixtures::class,
        ];
    }
}