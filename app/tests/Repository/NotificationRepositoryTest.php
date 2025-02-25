<?php

namespace App\Tests\Repository;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class NotificationRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?NotificationRepository $notificationRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->notificationRepository = $this->entityManager->getRepository(Notification::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->notificationRepository = null;
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

    public function testFindUnreadNotifications(): void
    {
        $user = $this->createTestUser();

        $unreadNotification = new Notification();
        $unreadNotification->setTitle('Unread Notification')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $readNotification = new Notification();
        $readNotification->setTitle('Read Notification')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(true)
            ->setReadAt(new \DateTimeImmutable());

        $this->entityManager->persist($unreadNotification);
        $this->entityManager->persist($readNotification);
        $this->entityManager->flush();

        $unreadNotifications = $this->notificationRepository->findUnreadNotifications($user->getId());

        $this->assertGreaterThanOrEqual(1, count($unreadNotifications));
        foreach ($unreadNotifications as $notification) {
            $this->assertFalse($notification->isRead());
        }
    }

    public function testFindUserNotificationsByType(): void
    {
        $user = $this->createTestUser();

        $infoNotification = new Notification();
        $infoNotification->setTitle('Info Notification')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $warningNotification = new Notification();
        $warningNotification->setTitle('Warning Notification')
            ->setContent('Test content')
            ->setType('warning')
            ->setUser($user)
            ->setIsRead(false);

        $this->entityManager->persist($infoNotification);
        $this->entityManager->persist($warningNotification);
        $this->entityManager->flush();

        $infoNotifications = $this->notificationRepository->findUserNotificationsByType($user->getId(), 'info');
        $warningNotifications = $this->notificationRepository->findUserNotificationsByType($user->getId(), 'warning');

        $this->assertGreaterThanOrEqual(1, count($infoNotifications));
        $this->assertGreaterThanOrEqual(1, count($warningNotifications));
        $this->assertEquals('info', $infoNotifications[0]->getType());
        $this->assertEquals('warning', $warningNotifications[0]->getType());
    }

    public function testFindByDateRange(): void
    {
        $user = $this->createTestUser();

        $notification = new Notification();
        $notification->setTitle('Test Notification')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        $startDate = new \DateTimeImmutable('-1 day');
        $endDate = new \DateTimeImmutable('+1 day');

        $notifications = $this->notificationRepository->findByDateRange($startDate, $endDate);

        $this->assertGreaterThanOrEqual(1, count($notifications));
    }

    public function testFindRecentNotifications(): void
    {
        $user = $this->createTestUser();

        for ($i = 0; $i < 15; $i++) {
            $notification = new Notification();
            $notification->setTitle('Notification ' . $i)
                ->setContent('Test content')
                ->setType('info')
                ->setUser($user)
                ->setIsRead(false);

            $this->entityManager->persist($notification);
        }

        $this->entityManager->flush();

        $recentNotifications = $this->notificationRepository->findRecentNotifications($user->getId(), 10);

        $this->assertCount(10, $recentNotifications);
    }

    public function testGetStatistics(): void
    {
        $user = $this->createTestUser();

        $notification = new Notification();
        $notification->setTitle('Test Notification')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        $stats = $this->notificationRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalNotifications', $stats);
        $this->assertArrayHasKey('unreadNotifications', $stats);
        $this->assertArrayHasKey('notificationsByType', $stats);
        $this->assertArrayHasKey('readRate', $stats);
    }

    public function testMarkAsRead(): void
    {
        $user = $this->createTestUser();

        $notification1 = new Notification();
        $notification1->setTitle('Notification 1')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $notification2 = new Notification();
        $notification2->setTitle('Notification 2')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $this->entityManager->persist($notification1);
        $this->entityManager->persist($notification2);
        $this->entityManager->flush();

        $this->notificationRepository->markAsRead([$notification1->getId(), $notification2->getId()]);

        $this->entityManager->refresh($notification1);
        $this->entityManager->refresh($notification2);

        $this->assertTrue($notification1->isRead());
        $this->assertTrue($notification2->isRead());
        $this->assertNotNull($notification1->getReadAt());
        $this->assertNotNull($notification2->getReadAt());
    }

    public function testDeleteOldNotifications(): void
    {
        $user = $this->createTestUser();

        $oldNotification = new Notification();
        $oldNotification->setTitle('Old Notification')
            ->setContent('Test content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(true)
            ->setReadAt(new \DateTimeImmutable('-2 months'));

        $this->entityManager->persist($oldNotification);
        $this->entityManager->flush();

        $beforeDate = new \DateTimeImmutable('-1 month');
        $deletedCount = $this->notificationRepository->deleteOldNotifications($beforeDate);

        $this->assertGreaterThanOrEqual(1, $deletedCount);
    }

    public function testSearchByCriteria(): void
    {
        $user = $this->createTestUser();

        $notification = new Notification();
        $notification->setTitle('Test Notification')
            ->setContent('Searchable content')
            ->setType('info')
            ->setUser($user)
            ->setIsRead(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        // Test different search criteria
        $typeResults = $this->notificationRepository->searchByCriteria(['type' => 'info']);
        $this->assertGreaterThanOrEqual(1, count($typeResults));

        $contentResults = $this->notificationRepository->searchByCriteria(['content' => 'Searchable']);
        $this->assertGreaterThanOrEqual(1, count($contentResults));

        $unreadResults = $this->notificationRepository->searchByCriteria(['isRead' => false]);
        $this->assertGreaterThanOrEqual(1, count($unreadResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->notificationRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['type' => 'INVALID_TYPE']],
            [['isRead' => 'invalid']],
        ];
    }
}