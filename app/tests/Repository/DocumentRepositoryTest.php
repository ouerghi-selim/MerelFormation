<?php

namespace App\Tests\Repository;

use App\Entity\Document;
use App\Entity\User;
use App\Entity\Formation;
use App\Repository\DocumentRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class DocumentRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?DocumentRepository $documentRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->documentRepository = $this->entityManager->getRepository(Document::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->documentRepository = null;
    }

    private function createTestUser(): User
    {
        $user = new User();
        $user->setEmail('test@example.com')
            ->setFirstName('Test')
            ->setLastName('User')
            ->setPassword('password')
            ->setIsActive(true);
        
        $this->entityManager->persist($user);
        return $user;
    }

    private function createTestFormation(): Formation
    {
        $formation = new Formation();
        $formation->setTitle('Test Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true);

        $this->entityManager->persist($formation);
        return $formation;
    }

    public function testFindByCategoryAndType(): void
    {
        $user = $this->createTestUser();

        $document = new Document();
        $document->setTitle('Test Document')
            ->setFileName('test.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setPrivate(false);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        $documents = $this->documentRepository->findByCategoryAndType('support', 'pdf');

        $this->assertGreaterThanOrEqual(1, count($documents));
        $this->assertEquals('support', $documents[0]->getCategory());
        $this->assertEquals('pdf', $documents[0]->getType());
    }

    public function testFindByUser(): void
    {
        $user = $this->createTestUser();

        $document = new Document();
        $document->setTitle('User Document')
            ->setFileName('user_doc.pdf')
            ->setType('pdf')
            ->setCategory('attestation')
            ->setUploadedBy($user)
            ->setPrivate(true);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        $userDocuments = $this->documentRepository->findByUser($user->getId());

        $this->assertGreaterThanOrEqual(1, count($userDocuments));
        $this->assertEquals($user->getId(), $userDocuments[0]->getUploadedBy()->getId());
    }

    public function testFindByFormation(): void
    {
        $user = $this->createTestUser();
        $formation = $this->createTestFormation();

        $document = new Document();
        $document->setTitle('Formation Document')
            ->setFileName('formation_doc.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setFormation($formation)
            ->setPrivate(false);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        $formationDocuments = $this->documentRepository->findByFormation($formation->getId());

        $this->assertGreaterThanOrEqual(1, count($formationDocuments));
        $this->assertEquals($formation->getId(), $formationDocuments[0]->getFormation()->getId());
    }

    public function testFindPublicDocuments(): void
    {
        $user = $this->createTestUser();

        $publicDoc = new Document();
        $publicDoc->setTitle('Public Document')
            ->setFileName('public_doc.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setPrivate(false);

        $privateDoc = new Document();
        $privateDoc->setTitle('Private Document')
            ->setFileName('private_doc.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setPrivate(true);

        $this->entityManager->persist($publicDoc);
        $this->entityManager->persist($privateDoc);
        $this->entityManager->flush();

        $publicDocuments = $this->documentRepository->findPublicDocuments();

        $this->assertGreaterThanOrEqual(1, count($publicDocuments));
        foreach ($publicDocuments as $doc) {
            $this->assertFalse($doc->isPrivate());
        }
    }

    public function testFindByDateRange(): void
    {
        $user = $this->createTestUser();

        $document = new Document();
        $document->setTitle('Date Range Document')
            ->setFileName('date_doc.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setPrivate(false);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        $startDate = new \DateTimeImmutable('-1 day');
        $endDate = new \DateTimeImmutable('+1 day');

        $documents = $this->documentRepository->findByDateRange($startDate, $endDate);

        $this->assertGreaterThanOrEqual(1, count($documents));
    }

    public function testGetStatistics(): void
    {
        $user = $this->createTestUser();

        $document = new Document();
        $document->setTitle('Stats Document')
            ->setFileName('stats_doc.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setPrivate(false);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        $stats = $this->documentRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalDocuments', $stats);
        $this->assertArrayHasKey('publicDocuments', $stats);
        $this->assertArrayHasKey('documentsByCategory', $stats);
        $this->assertArrayHasKey('documentsByType', $stats);
        $this->assertGreaterThanOrEqual(1, $stats['totalDocuments']);
    }

    public function testSearchByCriteria(): void
    {
        $user = $this->createTestUser();

        $document = new Document();
        $document->setTitle('Searchable Document')
            ->setFileName('search_doc.pdf')
            ->setType('pdf')
            ->setCategory('support')
            ->setUploadedBy($user)
            ->setPrivate(false);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        // Test different search criteria
        $titleResults = $this->documentRepository->searchByCriteria(['title' => 'Searchable']);
        $this->assertCount(1, $titleResults);

        $categoryResults = $this->documentRepository->searchByCriteria(['category' => 'support']);
        $this->assertGreaterThanOrEqual(1, count($categoryResults));

        $typeResults = $this->documentRepository->searchByCriteria(['type' => 'pdf']);
        $this->assertGreaterThanOrEqual(1, count($typeResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->documentRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['type' => 'INVALID_TYPE']],
            [['category' => 'INVALID_CATEGORY']],
        ];
    }
}