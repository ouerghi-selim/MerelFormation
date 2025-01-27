<?php

namespace App\Tests\Repository;

use App\Entity\Formation;
use App\Entity\Category;
use App\Repository\FormationRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class FormationRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?FormationRepository $formationRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->formationRepository = $this->entityManager->getRepository(Formation::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->formationRepository = null;
    }

    public function testFindActiveFormationsWithSessions(): void
    {
        // Create test category
        $category = new Category();
        $category->setName('Test Category');
        $this->entityManager->persist($category);

        // Create test formations
        $activeFormation = new Formation();
        $activeFormation->setTitle('Active Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category);

        $inactiveFormation = new Formation();
        $inactiveFormation->setTitle('Inactive Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(false)
            ->setCategory($category);

        $this->entityManager->persist($activeFormation);
        $this->entityManager->persist($inactiveFormation);
        $this->entityManager->flush();

        // Test findActiveFormationsWithSessions method
        $activeFormations = $this->formationRepository->findActiveFormationsWithSessions();

        $this->assertGreaterThanOrEqual(1, count($activeFormations));
        $this->assertEquals('Active Formation', $activeFormations[0]->getTitle());
    }

    public function testFindByTypeWithUpcomingSessions(): void
    {
        // Create test formations with different types
        $category = new Category();
        $category->setName('Test Category');
        $this->entityManager->persist($category);

        $initialFormation = new Formation();
        $initialFormation->setTitle('Initial Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category);

        $continuousFormation = new Formation();
        $continuousFormation->setTitle('Continuous Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(14)
            ->setType('continuous')
            ->setIsActive(true)
            ->setCategory($category);

        $this->entityManager->persist($initialFormation);
        $this->entityManager->persist($continuousFormation);
        $this->entityManager->flush();

        // Test findByTypeWithUpcomingSessions method
        $initialFormations = $this->formationRepository->findByTypeWithUpcomingSessions('initial');
        $continuousFormations = $this->formationRepository->findByTypeWithUpcomingSessions('continuous');

        $this->assertGreaterThanOrEqual(1, count($initialFormations));
        $this->assertGreaterThanOrEqual(1, count($continuousFormations));
    }

    public function testFindByCategory(): void
    {
        // Create test categories and formations
        $category1 = new Category();
        $category1->setName('Category 1');
        $this->entityManager->persist($category1);

        $category2 = new Category();
        $category2->setName('Category 2');
        $this->entityManager->persist($category2);

        $formation1 = new Formation();
        $formation1->setTitle('Formation 1')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category1);

        $formation2 = new Formation();
        $formation2->setTitle('Formation 2')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category2);

        $this->entityManager->persist($formation1);
        $this->entityManager->persist($formation2);
        $this->entityManager->flush();

        // Test findByCategory method
        $category1Formations = $this->formationRepository->findByCategory($category1->getId());
        $category2Formations = $this->formationRepository->findByCategory($category2->getId());

        $this->assertCount(1, $category1Formations);
        $this->assertCount(1, $category2Formations);
        $this->assertEquals('Formation 1', $category1Formations[0]->getTitle());
        $this->assertEquals('Formation 2', $category2Formations[0]->getTitle());
    }

    public function testSearchByCriteria(): void
    {
        // Create test formations
        $category = new Category();
        $category->setName('Test Category');
        $this->entityManager->persist($category);

        $formation1 = new Formation();
        $formation1->setTitle('Advanced Formation')
            ->setDescription('Test Description')
            ->setPrice(200.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category);

        $formation2 = new Formation();
        $formation2->setTitle('Basic Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(14)
            ->setType('continuous')
            ->setIsActive(true)
            ->setCategory($category);

        $this->entityManager->persist($formation1);
        $this->entityManager->persist($formation2);
        $this->entityManager->flush();

        // Test different search criteria
        $titleResults = $this->formationRepository->searchByCriteria(['title' => 'Advanced']);
        $this->assertCount(1, $titleResults);
        $this->assertEquals('Advanced Formation', $titleResults[0]->getTitle());

        $typeResults = $this->formationRepository->searchByCriteria(['type' => 'continuous']);
        $this->assertGreaterThanOrEqual(1, count($typeResults));

        $priceResults = $this->formationRepository->searchByCriteria([
            'priceMin' => 150,
            'priceMax' => 250
        ]);
        $this->assertGreaterThanOrEqual(1, count($priceResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->formationRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['title' => '']],
            [['type' => 'INVALID_TYPE']],
            [['priceMin' => 'invalid']],
            [['priceMax' => 'invalid']],
        ];
    }

    public function testGetStatistics(): void
    {
        // Create test formations
        $category = new Category();
        $category->setName('Test Category');
        $this->entityManager->persist($category);

        $formation1 = new Formation();
        $formation1->setTitle('Formation 1')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category);

        $formation2 = new Formation();
        $formation2->setTitle('Formation 2')
            ->setDescription('Test Description')
            ->setPrice(200.0)
            ->setDuration(14)
            ->setType('continuous')
            ->setIsActive(true)
            ->setCategory($category);

        $this->entityManager->persist($formation1);
        $this->entityManager->persist($formation2);
        $this->entityManager->flush();

        $stats = $this->formationRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalFormations', $stats);
        $this->assertArrayHasKey('activeFormations', $stats);
        $this->assertArrayHasKey('totalSessions', $stats);
        $this->assertArrayHasKey('upcomingSessions', $stats);
        $this->assertGreaterThanOrEqual(2, $stats['totalFormations']);
    }
}