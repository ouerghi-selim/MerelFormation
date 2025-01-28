<?php

namespace App\Tests\Repository;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class UserRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?UserRepository $userRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->userRepository = $this->entityManager->getRepository(User::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->userRepository = null;
    }

    public function testFindActiveUsers(): void
    {
        // Create test users
        $activeUser = new User();
        $activeUser->setEmail('active@test.com')
            ->setFirstName('Active')
            ->setLastName('User')
            ->setPassword('password')
            ->setIsActive(true);

        $inactiveUser = new User();
        $inactiveUser->setEmail('inactive@test.com')
            ->setFirstName('Inactive')
            ->setLastName('User')
            ->setPassword('password')
            ->setIsActive(false);

        $this->entityManager->persist($activeUser);
        $this->entityManager->persist($inactiveUser);
        $this->entityManager->flush();

        // Test findActiveUsers method
        $activeUsers = $this->userRepository->findActiveUsers();

        $this->assertCount(1, $activeUsers);
        $this->assertEquals('active@test.com', $activeUsers[0]->getEmail());
    }

    public function testFindByRole(): void
    {
        // Create test users with different roles
        $adminUser = new User();
        $adminUser->setEmail('admin@test.com')
            ->setFirstName('Admin')
            ->setLastName('User')
            ->setPassword('password')
            ->setRoles(['ROLE_ADMIN']);

        $normalUser = new User();
        $normalUser->setEmail('user@test.com')
            ->setFirstName('Normal')
            ->setLastName('User')
            ->setPassword('password')
            ->setRoles(['ROLE_USER']);

        $this->entityManager->persist($adminUser);
        $this->entityManager->persist($normalUser);
        $this->entityManager->flush();

        // Test findByRole method
        $adminUsers = $this->userRepository->findByRole('ROLE_ADMIN');
        $normalUsers = $this->userRepository->findByRole('ROLE_USER');

        $this->assertCount(1, $adminUsers);
        $this->assertCount(1, $normalUsers);
        $this->assertEquals('admin@test.com', $adminUsers[0]->getEmail());
        $this->assertEquals('user@test.com', $normalUsers[0]->getEmail());
    }

    public function testFindUsersWithPendingReservations(): void
    {
        // This test requires Reservation fixtures
        // Will be implemented when Reservation fixtures are available
        $this->markTestIncomplete('This test needs Reservation fixtures.');
    }

    public function testFindUsersWithOverdueInvoices(): void
    {
        // This test requires Invoice fixtures
        // Will be implemented when Invoice fixtures are available
        $this->markTestIncomplete('This test needs Invoice fixtures.');
    }

    public function testSearchByCriteria(): void
    {
        // Create test users for search
        $user1 = new User();
        $user1->setEmail('john.doe@test.com')
            ->setFirstName('John')
            ->setLastName('Doe')
            ->setPassword('password')
            ->setRoles(['ROLE_USER'])
            ->setIsActive(true);

        $user2 = new User();
        $user2->setEmail('jane.doe@test.com')
            ->setFirstName('Jane')
            ->setLastName('Doe')
            ->setPassword('password')
            ->setRoles(['ROLE_USER'])
            ->setIsActive(true);

        $this->entityManager->persist($user1);
        $this->entityManager->persist($user2);
        $this->entityManager->flush();

        // Test different search criteria
        $emailResults = $this->userRepository->searchByCriteria(['email' => 'john']);
        $this->assertCount(1, $emailResults);
        $this->assertEquals('john.doe@test.com', $emailResults[0]->getEmail());

        $nameResults = $this->userRepository->searchByCriteria(['name' => 'Doe']);
        $this->assertCount(2, $nameResults);

        $roleResults = $this->userRepository->searchByCriteria(['role' => 'ROLE_USER']);
        $this->assertGreaterThanOrEqual(2, count($roleResults));

        $activeResults = $this->userRepository->searchByCriteria(['active' => true]);
        $this->assertGreaterThanOrEqual(2, count($activeResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->userRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['email' => '']],
            [['role' => 'INVALID_ROLE']],
        ];
    }
}