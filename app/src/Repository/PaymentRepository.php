<?php

namespace App\Repository;

use App\Entity\Payment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Payment>
 *
 * @method Payment|null find($id, $lockMode = null, $lockVersion = null)
 * @method Payment|null findOneBy(array $criteria, array $orderBy = null)
 * @method Payment[]    findAll()
 * @method Payment[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PaymentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Payment::class);
    }

    /**
     * Find user's payments
     */
    public function findUserPayments(int $userId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.user = :userId')
            ->leftJoin('p.invoice', 'i')
            ->addSelect('i')
            ->setParameter('userId', $userId)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find payments by status
     */
    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.status = :status')
            ->leftJoin('p.user', 'u')
            ->leftJoin('p.invoice', 'i')
            ->addSelect('u', 'i')
            ->setParameter('status', $status)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find payments by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.createdAt BETWEEN :startDate AND :endDate')
            ->leftJoin('p.user', 'u')
            ->leftJoin('p.invoice', 'i')
            ->addSelect('u', 'i')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find payments by method
     */
    public function findByMethod(string $method): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.method = :method')
            ->leftJoin('p.user', 'u')
            ->leftJoin('p.invoice', 'i')
            ->addSelect('u', 'i')
            ->setParameter('method', $method)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get payments statistics
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        $qb = $this->createQueryBuilder('p');
        
        $conditions = [];
        $parameters = [];
        
        if ($startDate && $endDate) {
            $conditions[] = 'p.createdAt BETWEEN :startDate AND :endDate';
            $parameters['startDate'] = $startDate;
            $parameters['endDate'] = $endDate;
        }

        return [
            'totalAmount' => $qb->select('SUM(p.amount)')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0,

            'countByStatus' => $qb->select('p.status, COUNT(p.id) as count, SUM(p.amount) as total')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('p.status')
                ->getQuery()
                ->getResult(),

            'countByMethod' => $qb->select('p.method, COUNT(p.id) as count, SUM(p.amount) as total')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('p.method')
                ->getQuery()
                ->getResult(),

            'successRate' => $qb->select('(COUNT(CASE WHEN p.status = :completed THEN 1 END) * 100.0 / COUNT(p.id)) as rate')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameter('completed', 'completed')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0
        ];
    }

    /**
     * Search payments by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.user', 'u')
            ->leftJoin('p.invoice', 'i')
            ->addSelect('u', 'i');

        if (isset($criteria['status'])) {
            $qb->andWhere('p.status = :status')
               ->setParameter('status', $criteria['status']);
        }

        if (isset($criteria['method'])) {
            $qb->andWhere('p.method = :method')
               ->setParameter('method', $criteria['method']);
        }

        if (isset($criteria['minAmount'])) {
            $qb->andWhere('p.amount >= :minAmount')
               ->setParameter('minAmount', $criteria['minAmount']);
        }

        if (isset($criteria['maxAmount'])) {
            $qb->andWhere('p.amount <= :maxAmount')
               ->setParameter('maxAmount', $criteria['maxAmount']);
        }

        if (isset($criteria['userId'])) {
            $qb->andWhere('u.id = :userId')
               ->setParameter('userId', $criteria['userId']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('p.createdAt BETWEEN :startDate AND :endDate')
               ->setParameter('startDate', $criteria['dateRange']['start'])
               ->setParameter('endDate', $criteria['dateRange']['end']);
        }

        return $qb->orderBy('p.createdAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }
}