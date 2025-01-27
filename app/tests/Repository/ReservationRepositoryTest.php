<?php

namespace App\Tests\Repository;

use App\Entity\Reservation;
use App\Entity\User;
use App\Entity\Session;
use App\Entity\Formation;
use App\Repository\ReservationRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class ReservationRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?ReservationRepository $reservationRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->reservationRepository = $this->entityManager->getRepository(Reservation::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->reservationRepository = null;
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

    private function createTestSession(): Session
    {
        $formation = new Formation();
        $formation->setTitle('Test Formation')
            ->setDescription('Test Description')
            ->setPrice(100.0)
            ->setDuration(140)
            ->setType('initial')
            ->setIsActive(true);

        $this->entityManager->persist($formation);

        $session = new Session();
        $session->setStartDate(new \DateTimeImmutable('+1 week'))
            ->setEndDate(new \DateTimeImmutable('+2 weeks'))
            ->setMaxParticipants(10)
            ->setStatus('scheduled')
            ->setFormation($formation);

        $this->entityManager->persist($session);
        return $session;
    }

    public function testFindUserReservations(): void
    {
        $user = $this->createTestUser();
        $session = $this->createTestSession();

        $reservation = new Reservation();
        $reservation->setUser($user)
            ->setSession($session)
            ->setStatus('pending')
            ->setNotes('Test reservation');

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        $userReservations = $this->reservationRepository->findUserReservations($user->getId());

        $this->assertGreaterThanOrEqual(1, count($userReservations));
        $this->assertEquals($user->getId(), $userReservations[0]->getUser()->getId());
    }

    public function testFindSessionReservations(): void
    {
        $user = $this->createTestUser();
        $session = $this->createTestSession();

        $reservation = new Reservation();
        $reservation->setUser($user)
            ->setSession($session)
            ->setStatus('pending')
            ->setNotes('Test reservation');

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        $sessionReservations = $this->reservationRepository->findSessionReservations($session->getId());

        $this->assertGreaterThanOrEqual(1, count($sessionReservations));
        $this->assertEquals($session->getId(), $sessionReservations[0]->getSession()->getId());
    }

    public function testFindPendingReservations(): void
    {
        $user = $this->createTestUser();
        $session = $this->createTestSession();

        $pendingReservation = new Reservation();
        $pendingReservation->setUser($user)
            ->setSession($session)
            ->setStatus('pending')
            ->setNotes('Pending reservation');

        $confirmedReservation = new Reservation();
        $confirmedReservation->setUser($user)
            ->setSession($session)
            ->setStatus('confirmed')
            ->setNotes('Confirmed reservation');

        $this->entityManager->persist($pendingReservation);
        $this->entityManager->persist($confirmedReservation);
        $this->entityManager->flush();

        $pendingReservations = $this->reservationRepository->findPendingReservations();

        $this->assertGreaterThanOrEqual(1, count($pendingReservations));
        $this->assertEquals('pending', $pendingReservations[0]->getStatus());
    }

    public function testFindByDateRange(): void
    {
        $user = $this->createTestUser();
        $session = $this->createTestSession();

        $reservation = new Reservation();
        $reservation->setUser($user)
            ->setSession($session)
            ->setStatus('pending')
            ->setNotes('Test reservation');

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        $startDate = new \DateTimeImmutable('-1 week');
        $endDate = new \DateTimeImmutable('+3 weeks');

        $rangeReservations = $this->reservationRepository->findByDateRange($startDate, $endDate);

        $this->assertGreaterThanOrEqual(1, count($rangeReservations));
    }

    public function testSearchByCriteria(): void
    {
        $user = $this->createTestUser();
        $session = $this->createTestSession();

        $reservation = new Reservation();
        $reservation->setUser($user)
            ->setSession($session)
            ->setStatus('pending')
            ->setNotes('Test reservation');

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        // Test different search criteria
        $statusResults = $this->reservationRepository->searchByCriteria(['status' => 'pending']);
        $this->assertGreaterThanOrEqual(1, count($statusResults));

        $userResults = $this->reservationRepository->searchByCriteria(['userId' => $user->getId()]);
        $this->assertGreaterThanOrEqual(1, count($userResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->reservationRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['status' => 'INVALID_STATUS']],
            [['userId' => 'invalid']],
        ];
    }

    public function testGetStatistics(): void
    {
        $user = $this->createTestUser();
        $session = $this->createTestSession();

        $reservation = new Reservation();
        $reservation->setUser($user)
            ->setSession($session)
            ->setStatus('pending')
            ->setNotes('Test reservation');

        $this->entityManager->persist($reservation);
        $this->entityManager->flush();

        $stats = $this->reservationRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalReservations', $stats);
        $this->assertArrayHasKey('pendingReservations', $stats);
        $this->assertArrayHasKey('confirmedReservations', $stats);
        $this->assertArrayHasKey('cancelledReservations', $stats);
        $this->assertGreaterThanOrEqual(1, $stats['totalReservations']);
    }
}