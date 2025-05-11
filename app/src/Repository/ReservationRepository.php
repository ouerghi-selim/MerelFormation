<?php

namespace App\Repository;

use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 *
 * @method Reservation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Reservation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Reservation[]    findAll()
 * @method Reservation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    /**
     * Find user's reservations with all related details
     */
    public function findUserReservations(int $userId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.user = :userId')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->leftJoin('r.payment', 'p')
            ->leftJoin('r.invoice', 'i')
            ->addSelect('s', 'f', 'p', 'i')
            ->setParameter('userId', $userId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all reservations for a specific session
     */
    public function findBySession(int $sessionId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.session = :sessionId')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.payment', 'p')
            ->leftJoin('r.invoice', 'i')
            ->addSelect('u', 'p', 'i')
            ->setParameter('sessionId', $sessionId)
            ->orderBy('r.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all pending reservations
     */
    public function findPendingReservations(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.status = :status')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->addSelect('u', 's', 'f')
            ->setParameter('status', 'pending')
            ->orderBy('r.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reservations with overdue payments
     */
    public function findOverduePayments(): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.invoice', 'i')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.session', 's')
            ->andWhere('i.status = :status')
            ->andWhere('i.dueDate < :now')
            ->addSelect('i', 'u', 's')
            ->setParameter('status', 'pending')
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('i.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reservations within a date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->andWhere('s.startDate >= :startDate')
            ->andWhere('s.startDate <= :endDate')
            ->leftJoin('r.user', 'u')
            ->addSelect('s', 'f', 'u')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get comprehensive reservation statistics with dashboard data
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        $now = new \DateTimeImmutable();

        // Statistiques de base
        $stats = [
            'totalReservations' => $this->count([]),
            'pendingReservations' => $this->count(['status' => 'pending']),
            'confirmedReservations' => $this->count(['status' => 'confirmed']),
            'cancelledReservations' => $this->count(['status' => 'cancelled']),
        ];

        // Ajouter d'autres statistiques existantes
        $qb = $this->createQueryBuilder('r')
            ->leftJoin('r.invoice', 'i');

        $stats['unpaidReservations'] = $qb
            ->select('COUNT(r.id)')
            ->where('i.status = :status')
            ->setParameter('status', 'pending')
            ->getQuery()
            ->getSingleScalarResult();

        $qb = $this->createQueryBuilder('r')
            ->leftJoin('r.session', 's');

        $stats['upcomingReservations'] = $qb
            ->select('COUNT(r.id)')
            ->where('s.startDate > :now')
            ->andWhere('r.status = :status')
            ->setParameter('now', $now)
            ->setParameter('status', 'confirmed')
            ->getQuery()
            ->getSingleScalarResult();

        // Calculer le taux de réservations confirmées pour le graphique du dashboard
        $stats['confirmationRate'] = $stats['totalReservations'] > 0
            ? round(($stats['confirmedReservations'] / $stats['totalReservations']) * 100)
            : 0;

        return $stats;
    }

    /**
     * Search reservations by various criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->leftJoin('r.invoice', 'i')
            ->addSelect('u', 's', 'f', 'i');

        if (isset($criteria['status'])) {
            $qb->andWhere('r.status = :status')
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

        if (isset($criteria['paymentStatus'])) {
            $qb->andWhere('i.status = :paymentStatus')
               ->setParameter('paymentStatus', $criteria['paymentStatus']);
        }

        if (isset($criteria['search'])) {
            $qb->andWhere('u.firstName LIKE :search OR u.lastName LIKE :search OR f.title LIKE :search')
               ->setParameter('search', '%' . $criteria['search'] . '%');
        }

        return $qb->orderBy('r.createdAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get formation popularity statistics
     */
    public function getFormationPopularityStats(): array
    {
        return $this->createQueryBuilder('r')
            ->select('f.id, f.title, COUNT(r.id) as reservationCount')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->where('r.status != :status')
            ->setParameter('status', 'cancelled')
            ->groupBy('f.id')
            ->orderBy('reservationCount', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count pending reservations
     *
     * @return int
     */
    public function countPendingReservations(): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere('r.status = :status')
            ->setParameter('status', 'pending')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find recent reservations
     *
     * @param int $limit
     * @return array
     */
    public function findRecentReservations(int $limit = 5): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->addSelect('u', 's', 'f')
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all session reservations with optional filtering
     *
     * @param string|null $search Search term to filter by user name or email
     * @param string|null $status Status to filter by
     * @param int|null $limit Limit the number of results
     * @param string|null $sort Sort field and direction (e.g. 'createdAt,DESC')
     * @return array Array of session reservations
     */
    public function findSessionReservations(?string $search = null, ?string $status = null, ?int $limit = null, ?string $sort = null): array
    {
        $qb = $this->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->addSelect('u', 's', 'f')
            ->andWhere('s.id IS NOT NULL'); // Assurez-vous qu'il s'agit d'une réservation de session

        // Filtrage par recherche (nom ou email)
        if ($search) {
            $qb->andWhere('u.firstName LIKE :search OR u.lastName LIKE :search OR u.email LIKE :search OR CONCAT(u.firstName, \' \', u.lastName) LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        // Filtrage par statut
        if ($status) {
            $qb->andWhere('r.status = :status')
                ->setParameter('status', $status);
        }

        // Appliquer le tri
        if ($sort) {
            $sortParts = explode(',', $sort);
            $sortField = $sortParts[0];
            $sortDirection = isset($sortParts[1]) ? $sortParts[1] : 'ASC';

            // Mapper les champs de tri à leurs chemins réels
            $sortFieldMap = [
                'createdAt' => 'r.createdAt',
                'status' => 'r.status',
                'startDate' => 's.startDate',
                // Ajouter d'autres mappings si nécessaire
            ];

            if (isset($sortFieldMap[$sortField])) {
                $qb->orderBy($sortFieldMap[$sortField], $sortDirection);
            }
        } else {
            // Tri par défaut
            $qb->orderBy('r.createdAt', 'DESC');
        }

        // Appliquer la limite
        if ($limit !== null) {
            $qb->setMaxResults((int) $limit);
        }

        // Retirer le orderBy redondant et retourner simplement le résultat
        return $qb->getQuery()->getResult();
    }
}