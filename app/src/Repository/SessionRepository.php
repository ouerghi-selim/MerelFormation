<?php

namespace App\Repository;

use App\Entity\Session;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Session>
 *
 * @method Session|null find($id, $lockMode = null, $lockVersion = null)
 * @method Session|null findOneBy(array $criteria, array $orderBy = null)
 * @method Session[]    findAll()
 * @method Session[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Session::class);
    }

    /**
     * Find upcoming sessions
     */
    public function findUpcomingSessions(): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.startDate > :now')
            ->andWhere('s.status = :status')
            ->leftJoin('s.formation', 'f')
            ->addSelect('f')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'scheduled')
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find sessions with available places
     */
    public function findSessionsWithAvailablePlaces(): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.startDate > :now')
            ->andWhere('s.status = :status')
            ->leftJoin('s.formation', 'f')
            ->leftJoin('s.reservations', 'r')
            ->addSelect('f')
            ->groupBy('s.id')
            ->having('COUNT(r.id) < s.maxParticipants')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'scheduled')
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find sessions for a specific formation
     */
    public function findFormationSessions(int $formationId): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.formation = :formationId')
            ->leftJoin('s.reservations', 'r')
            ->addSelect('COUNT(r.id) as reservationCount')
            ->setParameter('formationId', $formationId)
            ->groupBy('s.id')
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find sessions by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.startDate BETWEEN :startDate AND :endDate')
            ->leftJoin('s.formation', 'f')
            ->leftJoin('s.reservations', 'r')
            ->addSelect('f')
            ->addSelect('COUNT(r.id) as reservationCount')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->groupBy('s.id')
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find sessions at maximum capacity
     */
    public function findFullSessions(): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.reservations', 'r')
            ->leftJoin('s.formation', 'f')
            ->addSelect('f')
            ->groupBy('s.id')
            ->having('COUNT(r.id) >= s.maxParticipants')
            ->andWhere('s.startDate > :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get session statistics
     */
    public function getStatistics(): array
    {
        $qb = $this->createQueryBuilder('s');
        $now = new \DateTimeImmutable();

        return [
            'totalSessions' => $this->count([]),
            
            'upcomingSessions' => $qb->select('COUNT(s.id)')
                ->where('s.startDate > :now')
                ->andWhere('s.status = :scheduledStatus')
                ->setParameter('now', $now)
                ->setParameter('scheduledStatus', 'scheduled')
                ->getQuery()
                ->getSingleScalarResult(),

            'ongoingSessions' => $qb->select('COUNT(s.id)')
                ->where('s.startDate <= :now')
                ->andWhere('s.endDate >= :now')
                ->andWhere('s.status = :ongoingStatus')
                ->setParameter('now', $now)
                ->setParameter('ongoingStatus', 'ongoing')
                ->getQuery()
                ->getSingleScalarResult(),

            'completedSessions' => $qb->select('COUNT(s.id)')
                ->where('s.endDate < :now')
                ->andWhere('s.status = :completedStatus')
                ->setParameter('now', $now)
                ->setParameter('completedStatus', 'completed')
                ->getQuery()
                ->getSingleScalarResult(),

            'fullSessions' => $qb->select('COUNT(s.id)')
                ->leftJoin('s.reservations', 'r')
                ->groupBy('s.id')
                ->having('COUNT(r.id) >= s.maxParticipants')
                ->getQuery()
                ->getSingleScalarResult()
        ];
    }

    /**
     * Search sessions by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('s')
            ->leftJoin('s.formation', 'f')
            ->leftJoin('s.reservations', 'r')
            ->addSelect('f');

        if (isset($criteria['status'])) {
            $qb->andWhere('s.status = :status')
               ->setParameter('status', $criteria['status']);
        }

        if (isset($criteria['formation'])) {
            $qb->andWhere('f.id = :formationId')
               ->setParameter('formationId', $criteria['formation']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('s.startDate BETWEEN :start AND :end')
               ->setParameter('start', $criteria['dateRange']['start'])
               ->setParameter('end', $criteria['dateRange']['end']);
        }

        if (isset($criteria['location'])) {
            $qb->andWhere('s.location LIKE :location')
               ->setParameter('location', '%' . $criteria['location'] . '%');
        }

        if (isset($criteria['hasAvailablePlaces']) && $criteria['hasAvailablePlaces']) {
            $qb->groupBy('s.id')
               ->having('COUNT(r.id) < s.maxParticipants');
        }

        return $qb->orderBy('s.startDate', 'ASC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get session availability percentage
     */
    public function getAvailabilityPercentage(int $sessionId): float
    {
        $session = $this->find($sessionId);
        if (!$session) {
            return 0;
        }

        $reservationsCount = $this->createQueryBuilder('s')
            ->select('COUNT(r.id)')
            ->leftJoin('s.reservations', 'r')
            ->where('s.id = :sessionId')
            ->setParameter('sessionId', $sessionId)
            ->getQuery()
            ->getSingleScalarResult();

        return ($session->getMaxParticipants() - $reservationsCount) / $session->getMaxParticipants() * 100;
    }

    /**
     * Count upcoming sessions
     *
     * @return int
     */
    public function countUpcomingSessions(): int
    {
        return $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->andWhere('s.startDate > :now')
            ->andWhere('s.status = :status')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'scheduled')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find sessions by instructor (formateur)
     *
     * @param int $instructorId The ID of the instructor
     * @return array Array of sessions
     */
    public function findByInstructor(int $instructorId): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.formation', 'f')
            ->addSelect('f')
            ->where('s.instructor = :instructorId')
            ->setParameter('instructorId', $instructorId)
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find sessions by participant (élève)
     *
     * @param int $participantId The ID of the participant (student)
     * @return array Array of sessions
     */
    public function findByParticipant(int $participantId): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.participants', 'p')
            ->leftJoin('s.formation', 'f')
            ->addSelect('f')
            ->where('p.id = :participantId')
            ->setParameter('participantId', $participantId)
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find upcoming sessions for a student with limit
     *
     * @param int $userId
     * @param int $limit
     * @return array
     */
    public function findUpcomingSessionsForStudent(int $userId, int $limit): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.participants', 'p')
            ->leftJoin('s.formation', 'f')
            ->addSelect('f')
            ->where('p.id = :userId')
            ->andWhere('s.startDate > :now')
            ->andWhere('s.status = :status')
            ->setParameter('userId', $userId)
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'scheduled')
            ->orderBy('s.startDate', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

}