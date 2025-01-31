<?php

namespace App\DataFixtures;

use App\Entity\Vehicle;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class VehicleFixtures extends Fixture
{
    public const VEHICLE_1_REFERENCE = 'vehicle-1';
    public const VEHICLE_2_REFERENCE = 'vehicle-2';

    public function load(ObjectManager $manager): void
    {
        $vehicles = [
            [
                'model' => 'Toyota Camry Hybride',
                'plate' => 'AA-123-BB',
                'year' => 2023,
                'status' => 'available',
                'dailyRate' => 120.00,
                'category' => 'berline',
                'reference' => self::VEHICLE_1_REFERENCE,
            ],
            [
                'model' => 'Peugeot 508',
                'plate' => 'BB-456-CC',
                'year' => 2023,
                'status' => 'available',
                'dailyRate' => 100.00,
                'category' => 'berline',
                'reference' => self::VEHICLE_2_REFERENCE,
            ],
            [
                'model' => 'Mercedes Classe V',
                'plate' => 'CC-789-DD',
                'year' => 2023,
                'status' => 'available',
                'dailyRate' => 150.00,
                'category' => 'monospace',
            ],
        ];

        foreach ($vehicles as $vehicleData) {
            $vehicle = new Vehicle();
            $vehicle->setModel($vehicleData['model']);
            $vehicle->setPlate($vehicleData['plate']);
            $vehicle->setYear($vehicleData['year']);
            $vehicle->setStatus($vehicleData['status']);
            $vehicle->setDailyRate($vehicleData['dailyRate']);
            $vehicle->setCategory($vehicleData['category']);
            $vehicle->setIsActive(true);

            $manager->persist($vehicle);
            
            if (isset($vehicleData['reference'])) {
                $this->addReference($vehicleData['reference'], $vehicle);
            }
        }

        $manager->flush();
    }
}