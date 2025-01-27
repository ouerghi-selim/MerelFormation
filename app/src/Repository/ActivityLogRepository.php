<?php

namespace App\Repository;

use App\Entity\ActivityLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ActivityLog>
 *
 * @method ActivityLog|null find($id, $lockMode = null, $lockVersion = null)
 * @method ActivityLog|null findOneBy(array $criteria, array $orderBy = null)
 * @method ActivityLog[]    findAll()
 * @method ActivityLog[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ActivityLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ActivityLog::class);
    }

    /**
     * Find user activities
     */
    public function findUserActivities(int $userId): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.user = :userId')
            ->leftJoin('a.user', 'u')
            ->addSelect('u')
            ->setParameter('userId', $userId)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find activities by type
     */
    public function findByEntityType(string $entityType): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.entityType = :entityType')
            ->leftJoin('a.user', 'u')
            ->addSelect('u')
            ->setParameter('entityType', $entityType)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find activities by action
     */
    public function findByAction(string $action): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.action = :action')
            ->leftJoin('a.user', 'u')
            ->addSelect('u')
            ->setParameter('action', $action)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find activities by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.createdAt BETWEEN :startDate AND :endDate')
            ->leftJoin('a.user', 'u')
            ->addSelect('u')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find activities by IP address
     */
    public function findByIpAddress(string $ipAddress): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.ipAddress = :ipAddress')
            ->leftJoin('a.user', 'u')
            ->addSelect('u')
            ->setParameter('ipAddress', $ipAddress)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get activity statistics
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        $qb = $this->createQueryBuilder('a');
        
        $conditions = [];
        $parameters = [];
        
        if ($startDate && $endDate) {
            $conditions[] = 'a.createdAt BETWEEN :startDate AND :endDate';
            $parameters['startDate'] = $startDate;
            $parameters['endDate'] = $endDate;
        }

        return [
            'totalActivities' => $qb->select('COUNT(a.id)')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult(),

            'activitiesByType' => $qb->select('a.entityType, COUNT(a.id) as count')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('a.entityType')
                ->getQuery()
                ->getResult(),

            'activitiesByAction' => $qb->select('a.action, COUNT(a.id) as count')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('a.action')
                ->getQuery()
                ->getResult(),

            'topUsers' => $qb->select('IDENTITY(a.user) as userId, COUNT(a.id) as count')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('a.user')
                ->orderBy('count', 'DESC')
                ->setMaxResults(5)
                ->getQuery()
                ->getResult()
        ];
    }

    /**
     * Search activities by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('a')
            ->leftJoin('a.user', 'u')
            ->addSelect('u');

        if (isset($criteria['action'])) {
            $qb->andWhere('a.action = :action')
               ->setParameter('action', $criteria['action']);
        }

        if (isset($criteria['entityType'])) {
            $qb->andWhere('a.entityType = :entityType')
               ->setParameter('entityType', $criteria['entityType']);
        }

        if (isset($criteria['userId'])) {
            $qb->andWhere('a.user = :userId')
               ->setParameter('userId', $criteria['userId']);
        }

        if (isset($criteria['ipAddress'])) {
            $qb->andWhere('a.ipAddress = :ipAddress')
               ->setParameter('ipAddress', $criteria['ipAddress']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('a.createdAt BETWEEN :startDate AND :endDate')
               ->setParameter('startDate', $criteria['dateRange']['start'])
               ->setParameter('endDate', $criteria['dateRange']['end']);
        }

        if (isset($criteria['details'])) {
            $qb->andWhere('JSON_CONTAINS(a.details, :details) = 1')
               ->setParameter('details', json_encode($criteria['details']));
        }

        return $qb->orderBy('a.createdAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get recent activities
     */
    public function getRecentActivities(int $limit = 10): array
    {
        return $this->createQueryBuilder('a')
            ->leftJoin('a.user', 'u')
            ->addSelect('u')
            ->orderBy('a.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}