<?php

namespace App\Repository;

use App\Entity\Invoice;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Invoice>
 *
 * @method Invoice|null find($id, $lockMode = null, $lockVersion = null)
 * @method Invoice|null findOneBy(array $criteria, array $orderBy = null)
 * @method Invoice[]    findAll()
 * @method Invoice[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class InvoiceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Invoice::class);
    }

    /**
     * Find user's invoices
     */
    public function findUserInvoices(int $userId): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.user = :userId')
            ->leftJoin('i.payment', 'p')
            ->leftJoin('i.reservation', 'r')
            ->addSelect('p', 'r')
            ->setParameter('userId', $userId)
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find overdue invoices
     */
    public function findOverdueInvoices(): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.dueDate < :now')
            ->andWhere('i.status = :status')
            ->leftJoin('i.user', 'u')
            ->addSelect('u')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'pending')
            ->orderBy('i.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find invoices by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.createdAt BETWEEN :startDate AND :endDate')
            ->leftJoin('i.user', 'u')
            ->leftJoin('i.payment', 'p')
            ->addSelect('u', 'p')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find unpaid invoices
     */
    public function findUnpaidInvoices(): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.status = :status')
            ->leftJoin('i.user', 'u')
            ->addSelect('u')
            ->setParameter('status', 'pending')
            ->orderBy('i.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get invoice statistics
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        $qb = $this->createQueryBuilder('i');
        
        $conditions = [];
        $parameters = [];
        
        if ($startDate && $endDate) {
            $conditions[] = 'i.createdAt BETWEEN :startDate AND :endDate';
            $parameters['startDate'] = $startDate;
            $parameters['endDate'] = $endDate;
        }

        return [
            'totalAmount' => $qb->select('SUM(i.amount)')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0,

            'countByStatus' => $qb->select('i.status, COUNT(i.id) as count, SUM(i.amount) as total')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('i.status')
                ->getQuery()
                ->getResult(),

            'overdueAmount' => $qb->select('SUM(i.amount)')
                ->where('i.dueDate < :now')
                ->andWhere('i.status = :status')
                ->setParameter('now', new \DateTimeImmutable())
                ->setParameter('status', 'pending')
                ->getQuery()
                ->getSingleScalarResult() ?? 0,

            'paymentRate' => $qb->select('(COUNT(CASE WHEN i.status = :paid THEN 1 END) * 100.0 / COUNT(i.id)) as rate')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameter('paid', 'paid')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0
        ];
    }

    /**
     * Search invoices by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('i')
            ->leftJoin('i.user', 'u')
            ->leftJoin('i.payment', 'p')
            ->addSelect('u', 'p');

        if (isset($criteria['status'])) {
            $qb->andWhere('i.status = :status')
               ->setParameter('status', $criteria['status']);
        }

        if (isset($criteria['minAmount'])) {
            $qb->andWhere('i.amount >= :minAmount')
               ->setParameter('minAmount', $criteria['minAmount']);
        }

        if (isset($criteria['maxAmount'])) {
            $qb->andWhere('i.amount <= :maxAmount')
               ->setParameter('maxAmount', $criteria['maxAmount']);
        }

        if (isset($criteria['userId'])) {
            $qb->andWhere('i.user = :userId')
               ->setParameter('userId', $criteria['userId']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('i.createdAt BETWEEN :startDate AND :endDate')
               ->setParameter('startDate', $criteria['dateRange']['start'])
               ->setParameter('endDate', $criteria['dateRange']['end']);
        }

        if (isset($criteria['overdue'])) {
            $qb->andWhere('i.dueDate < :now')
               ->andWhere('i.status = :pendingStatus')
               ->setParameter('now', new \DateTimeImmutable())
               ->setParameter('pendingStatus', 'pending');
        }

        if (isset($criteria['invoiceNumber'])) {
            $qb->andWhere('i.invoiceNumber LIKE :invoiceNumber')
               ->setParameter('invoiceNumber', '%' . $criteria['invoiceNumber'] . '%');
        }

        return $qb->orderBy('i.createdAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get monthly invoice summary
     */
    public function getMonthlyInvoiceSummary(int $year): array
    {
        return $this->createQueryBuilder('i')
            ->select(
                'MONTH(i.createdAt) as month',
                'COUNT(i.id) as count',
                'SUM(i.amount) as total',
                'SUM(CASE WHEN i.status = :paid THEN i.amount ELSE 0 END) as paid',
                'SUM(CASE WHEN i.status = :pending THEN i.amount ELSE 0 END) as pending'
            )
            ->where('YEAR(i.createdAt) = :year')
            ->setParameter('year', $year)
            ->setParameter('paid', 'paid')
            ->setParameter('pending', 'pending')
            ->groupBy('month')
            ->orderBy('month', 'ASC')
            ->getQuery()
            ->getResult();
    }
}