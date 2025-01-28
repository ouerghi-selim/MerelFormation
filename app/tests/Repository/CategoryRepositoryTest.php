<?php

namespace App\Tests\Repository;

use App\Entity\Category;
use App\Entity\Formation;
use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class CategoryRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?CategoryRepository $categoryRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->categoryRepository = $this->entityManager->getRepository(Category::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->categoryRepository = null;
    }

    public function testFindActiveWithFormationsCount(): void
    {
        // Create parent category
        $parent = new Category();
        $parent->setName('Parent Category')
            ->setIsActive(true);

        $this->entityManager->persist($parent);

        // Create child category
        $child = new Category();
        $child->setName('Child Category')
            ->setIsActive(true)
            ->setParent($parent);

        $this->entityManager->persist($child);

        // Create formation for child category
        $formation = new Formation();
        $formation->setTitle('Test Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($child);

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        $categories = $this->categoryRepository->findActiveWithFormationsCount();

        $this->assertGreaterThanOrEqual(1, count($categories));
        foreach ($categories as $category) {
            $this->assertTrue($category->getIsActive());
            if ($category->getId() === $child->getId()) {
                $this->assertEquals(1, $category['formationsCount']);
            }
        }
    }

    public function testFindByParent(): void
    {
        // Create parent category
        $parent = new Category();
        $parent->setName('Parent Category')
            ->setIsActive(true);

        $this->entityManager->persist($parent);

        // Create child categories
        $child1 = new Category();
        $child1->setName('Child Category 1')
            ->setIsActive(true)
            ->setParent($parent);

        $child2 = new Category();
        $child2->setName('Child Category 2')
            ->setIsActive(true)
            ->setParent($parent);

        $this->entityManager->persist($child1);
        $this->entityManager->persist($child2);
        $this->entityManager->flush();

        // Test root categories
        $rootCategories = $this->categoryRepository->findByParent(null);
        $this->assertGreaterThanOrEqual(1, count($rootCategories));
        $this->assertEquals('Parent Category', $rootCategories[0]->getName());

        // Test child categories
        $childCategories = $this->categoryRepository->findByParent($parent->getId());
        $this->assertCount(2, $childCategories);
    }

    public function testFindByLevel(): void
    {
        // Create hierarchy of categories
        $level0 = new Category();
        $level0->setName('Level 0 Category')
            ->setIsActive(true);

        $this->entityManager->persist($level0);

        $level1 = new Category();
        $level1->setName('Level 1 Category')
            ->setIsActive(true)
            ->setParent($level0);

        $this->entityManager->persist($level1);
        $this->entityManager->flush();

        // Test levels
        $level0Categories = $this->categoryRepository->findByLevel(0);
        $level1Categories = $this->categoryRepository->findByLevel(1);

        $this->assertGreaterThanOrEqual(1, count($level0Categories));
        $this->assertGreaterThanOrEqual(1, count($level1Categories));
    }

    public function testFindWithActiveFormations(): void
    {
        // Create category
        $category = new Category();
        $category->setName('Test Category')
            ->setIsActive(true);

        $this->entityManager->persist($category);

        // Create active formation
        $activeFormation = new Formation();
        $activeFormation->setTitle('Active Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category);

        // Create inactive formation
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

        $categories = $this->categoryRepository->findWithActiveFormations();

        $this->assertGreaterThanOrEqual(1, count($categories));
        foreach ($categories as $cat) {
            foreach ($cat->getFormations() as $formation) {
                $this->assertTrue($formation->isIsActive());
            }
        }
    }

    public function testGetStatistics(): void
    {
        // Create test categories and formations
        $category = new Category();
        $category->setName('Test Category')
            ->setIsActive(true);

        $this->entityManager->persist($category);

        $formation = new Formation();
        $formation->setTitle('Test Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true)
            ->setCategory($category);

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        $stats = $this->categoryRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalCategories', $stats);
        $this->assertArrayHasKey('topLevelCategories', $stats);
        $this->assertArrayHasKey('categoriesWithFormations', $stats);
        $this->assertArrayHasKey('maxDepth', $stats);
        $this->assertGreaterThanOrEqual(1, $stats['totalCategories']);
    }

    public function testSearchCategories(): void
    {
        // Create test categories
        $category1 = new Category();
        $category1->setName('Special Category')
            ->setIsActive(true);

        $category2 = new Category();
        $category2->setName('Regular Category')
            ->setIsActive(true);

        $this->entityManager->persist($category1);
        $this->entityManager->persist($category2);
        $this->entityManager->flush();

        $searchResults = $this->categoryRepository->searchCategories('Special');

        $this->assertGreaterThanOrEqual(1, count($searchResults));
        $this->assertEquals('Special Category', $searchResults[0]->getName());
    }
}