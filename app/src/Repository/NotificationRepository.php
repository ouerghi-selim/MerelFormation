<?php

namespace App\Repository;

use App\Entity\Notification;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 *
 * @method Notification|null find($id, $lockMode = null, $lockVersion = null)
 * @method Notification|null findOneBy(array $criteria, array $orderBy = null)
 * @method Notification[]    findAll()
 * @method Notification[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    /**
     * Find user's unread notifications
     */
    public function findUnreadNotifications(int $userId): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.user = :userId')
            ->andWhere('n.isRead = :isRead')
            ->setParameter('userId', $userId)
            ->setParameter('isRead', false)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find user's notifications by type
     */
    public function findUserNotificationsByType(int $userId, string $type): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.user = :userId')
            ->andWhere('n.type = :type')
            ->setParameter('userId', $userId)
            ->setParameter('type', $type)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find notifications by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.createdAt BETWEEN :startDate AND :endDate')
            ->leftJoin('n.user', 'u')
            ->addSelect('u')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recent notifications for user
     */
    public function findRecentNotifications(int $userId, int $limit = 10): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get notification statistics
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        $qb = $this->createQueryBuilder('n');
        
        $conditions = [];
        $parameters = [];
        
        if ($startDate && $endDate) {
            $conditions[] = 'n.createdAt BETWEEN :startDate AND :endDate';
            $parameters['startDate'] = $startDate;
            $parameters['endDate'] = $endDate;
        }

        return [
            'totalNotifications' => $qb->select('COUNT(n.id)')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult(),

            'unreadNotifications' => $qb->select('COUNT(n.id)')
                ->where('n.isRead = :isRead')
                ->setParameter('isRead', false)
                ->getQuery()
                ->getSingleScalarResult(),

            'notificationsByType' => $qb->select('n.type, COUNT(n.id) as count')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('n.type')
                ->getQuery()
                ->getResult(),

            'readRate' => $qb->select('(COUNT(CASE WHEN n.isRead = true THEN 1 END) * 100.0 / COUNT(n.id)) as rate')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0
        ];
    }

    /**
     * Mark notifications as read
     */
    public function markAsRead(array $notificationIds): void
    {
        $this->createQueryBuilder('n')
            ->update()
            ->set('n.isRead', ':isRead')
            ->set('n.readAt', ':readAt')
            ->where('n.id IN (:ids)')
            ->setParameter('isRead', true)
            ->setParameter('readAt', new \DateTimeImmutable())
            ->setParameter('ids', $notificationIds)
            ->getQuery()
            ->execute();
    }

    /**
     * Delete old notifications
     */
    public function deleteOldNotifications(\DateTimeInterface $beforeDate): int
    {
        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.createdAt < :beforeDate')
            ->andWhere('n.isRead = :isRead')
            ->setParameter('beforeDate', $beforeDate)
            ->setParameter('isRead', true)
            ->getQuery()
            ->execute();
    }

    /**
     * Search notifications by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('n')
            ->leftJoin('n.user', 'u')
            ->addSelect('u');

        if (isset($criteria['type'])) {
            $qb->andWhere('n.type = :type')
               ->setParameter('type', $criteria['type']);
        }

        if (isset($criteria['isRead'])) {
            $qb->andWhere('n.isRead = :isRead')
               ->setParameter('isRead', $criteria['isRead']);
        }

        if (isset($criteria['userId'])) {
            $qb->andWhere('n.user = :userId')
               ->setParameter('userId', $criteria['userId']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('n.createdAt BETWEEN :startDate AND :endDate')
               ->setParameter('startDate', $criteria['dateRange']['start'])
               ->setParameter('endDate', $criteria['dateRange']['end']);
        }

        if (isset($criteria['content'])) {
            $qb->andWhere('n.content LIKE :content')
               ->setParameter('content', '%' . $criteria['content'] . '%');
        }

        return $qb->orderBy('n.createdAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }
}