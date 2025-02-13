<?php

namespace App\DataFixtures;

use App\Entity\VehicleRental;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class VehicleRentalFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $rentals = [
            [
                'startDate' => new \DateTimeImmutable('+1 week'),
                'endDate' => new \DateTimeImmutable('+2 weeks'),
                'totalPrice' => 1200.00,
                'status' => 'confirmed',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_1_REFERENCE),
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE),
                'pickupLocation' => '7 RUE Georges Maillols, 35000 RENNES',
                'returnLocation' => '7 RUE Georges Maillols, 35000 RENNES',
            ],
            [
                'startDate' => new \DateTimeImmutable('+3 weeks'),
                'endDate' => new \DateTimeImmutable('+4 weeks'),
                'totalPrice' => 1000.00,
                'status' => 'pending',
                'vehicle' => $this->getReference(VehicleFixtures::VEHICLE_2_REFERENCE),
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE),
                'pickupLocation' => '7 RUE Georges Maillols, 35000 RENNES',
                'returnLocation' => '7 RUE Georges Maillols, 35000 RENNES',
            ],
        ];

        foreach ($rentals as $rentalData) {
            $rental = new VehicleRental();
            $rental->setStartDate($rentalData['startDate']);
            $rental->setEndDate($rentalData['endDate']);
            $rental->setTotalPrice($rentalData['totalPrice']);
            $rental->setStatus($rentalData['status']);
            $rental->setVehicle($rentalData['vehicle']);
            $rental->setUser($rentalData['user']);
            $rental->setPickupLocation($rentalData['pickupLocation']);
            $rental->setReturnLocation($rentalData['returnLocation']);

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