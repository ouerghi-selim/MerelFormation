<?php

namespace App\Tests\Repository;

use App\Entity\Vehicle;
use App\Repository\VehicleRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class VehicleRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?VehicleRepository $vehicleRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->vehicleRepository = $this->entityManager->getRepository(Vehicle::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->vehicleRepository = null;
    }

    public function testFindAvailableVehicles(): void
    {
        // Create test vehicles
        $availableVehicle = new Vehicle();
        $availableVehicle->setModel('Toyota Camry')
            ->setPlate('AB-123-CD')
            ->setYear(2023)
            ->setDailyRate(100.0)
            ->setStatus('available')
            ->setCategory('berline')
            ->setIsActive(true);

        $rentedVehicle = new Vehicle();
        $rentedVehicle->setModel('Peugeot 508')
            ->setPlate('EF-456-GH')
            ->setYear(2023)
            ->setDailyRate(120.0)
            ->setStatus('rented')
            ->setCategory('berline')
            ->setIsActive(true);

        $this->entityManager->persist($availableVehicle);
        $this->entityManager->persist($rentedVehicle);
        $this->entityManager->flush();

        $startDate = new \DateTimeImmutable('+1 day');
        $endDate = new \DateTimeImmutable('+3 days');

        $availableVehicles = $this->vehicleRepository->findAvailableVehicles($startDate, $endDate);

        $this->assertGreaterThanOrEqual(1, count($availableVehicles));
        $this->assertEquals('Toyota Camry', $availableVehicles[0]->getModel());
    }

    public function testFindByCategory(): void
    {
        // Create test vehicles with different categories
        $berlineVehicle = new Vehicle();
        $berlineVehicle->setModel('Toyota Camry')
            ->setPlate('AB-123-CD')
            ->setYear(2023)
            ->setDailyRate(100.0)
            ->setStatus('available')
            ->setCategory('berline')
            ->setIsActive(true);

        $suvVehicle = new Vehicle();
        $suvVehicle->setModel('Toyota RAV4')
            ->setPlate('EF-456-GH')
            ->setYear(2023)
            ->setDailyRate(150.0)
            ->setStatus('available')
            ->setCategory('suv')
            ->setIsActive(true);

        $this->entityManager->persist($berlineVehicle);
        $this->entityManager->persist($suvVehicle);
        $this->entityManager->flush();

        $berlines = $this->vehicleRepository->findByCategory('berline');
        $suvs = $this->vehicleRepository->findByCategory('suv');

        $this->assertGreaterThanOrEqual(1, count($berlines));
        $this->assertGreaterThanOrEqual(1, count($suvs));
        $this->assertEquals('Toyota Camry', $berlines[0]->getModel());
        $this->assertEquals('Toyota RAV4', $suvs[0]->getModel());
    }

    public function testFindVehiclesNeedingMaintenance(): void
    {
        // Create test vehicles
        $maintenanceVehicle = new Vehicle();
        $maintenanceVehicle->setModel('Toyota Camry')
            ->setPlate('AB-123-CD')
            ->setYear(2023)
            ->setDailyRate(100.0)
            ->setStatus('maintenance')
            ->setCategory('berline')
            ->setIsActive(true);

        $availableVehicle = new Vehicle();
        $availableVehicle->setModel('Peugeot 508')
            ->setPlate('EF-456-GH')
            ->setYear(2023)
            ->setDailyRate(120.0)
            ->setStatus('available')
            ->setCategory('berline')
            ->setIsActive(true);

        $this->entityManager->persist($maintenanceVehicle);
        $this->entityManager->persist($availableVehicle);
        $this->entityManager->flush();

        $maintenanceVehicles = $this->vehicleRepository->findVehiclesNeedingMaintenance();

        $this->assertGreaterThanOrEqual(1, count($maintenanceVehicles));
        $this->assertEquals('Toyota Camry', $maintenanceVehicles[0]->getModel());
        $this->assertEquals('maintenance', $maintenanceVehicles[0]->getStatus());
    }

    public function testSearchByCriteria(): void
    {
        // Create test vehicles
        $vehicle1 = new Vehicle();
        $vehicle1->setModel('Toyota Camry Hybrid')
            ->setPlate('AB-123-CD')
            ->setYear(2023)
            ->setDailyRate(100.0)
            ->setStatus('available')
            ->setCategory('berline')
            ->setIsActive(true);

        $vehicle2 = new Vehicle();
        $vehicle2->setModel('Toyota RAV4')
            ->setPlate('EF-456-GH')
            ->setYear(2023)
            ->setDailyRate(150.0)
            ->setStatus('available')
            ->setCategory('suv')
            ->setIsActive(true);

        $this->entityManager->persist($vehicle1);
        $this->entityManager->persist($vehicle2);
        $this->entityManager->flush();

        // Test different search criteria
        $modelResults = $this->vehicleRepository->searchByCriteria(['model' => 'Hybrid']);
        $this->assertCount(1, $modelResults);
        $this->assertEquals('Toyota Camry Hybrid', $modelResults[0]->getModel());

        $categoryResults = $this->vehicleRepository->searchByCriteria(['category' => 'suv']);
        $this->assertGreaterThanOrEqual(1, count($categoryResults));

        $priceResults = $this->vehicleRepository->searchByCriteria(['maxDailyRate' => 120.0]);
        $this->assertGreaterThanOrEqual(1, count($priceResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->vehicleRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['model' => '']],
            [['category' => 'INVALID_CATEGORY']],
            [['maxDailyRate' => 'invalid']],
        ];
    }

    public function testGetStatistics(): void
    {
        // Create test vehicles
        $vehicle1 = new Vehicle();
        $vehicle1->setModel('Toyota Camry')
            ->setPlate('AB-123-CD')
            ->setYear(2023)
            ->setDailyRate(100.0)
            ->setStatus('available')
            ->setCategory('berline')
            ->setIsActive(true);

        $vehicle2 = new Vehicle();
        $vehicle2->setModel('Toyota RAV4')
            ->setPlate('EF-456-GH')
            ->setYear(2023)
            ->setDailyRate(150.0)
            ->setStatus('maintenance')
            ->setCategory('suv')
            ->setIsActive(true);

        $this->entityManager->persist($vehicle1);
        $this->entityManager->persist($vehicle2);
        $this->entityManager->flush();

        $stats = $this->vehicleRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalVehicles', $stats);
        $this->assertArrayHasKey('availableVehicles', $stats);
        $this->assertArrayHasKey('maintenanceVehicles', $stats);
        $this->assertArrayHasKey('averageDailyRate', $stats);
        $this->assertGreaterThanOrEqual(2, $stats['totalVehicles']);
    }
}