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
     * Get payments statistics with enhanced dashboard data
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        // Statistiques de base - utilisons des méthodes plus simples
        $totalAmount = $this->createQueryBuilder('p')
            ->select('SUM(p.amount)')
            ->getQuery()
            ->getSingleScalarResult() ?? 0;

        // Compter les paiements par statut
        $countByStatus = [];
        $statuses = ['pending', 'completed', 'failed', 'refunded'];

        foreach ($statuses as $status) {
            $count = $this->count(['status' => $status]);
            $amount = $this->createQueryBuilder('p')
                ->select('SUM(p.amount)')
                ->where('p.status = :status')
                ->setParameter('status', $status)
                ->getQuery()
                ->getSingleScalarResult() ?? 0;

            $countByStatus[] = [
                'status' => $status,
                'count' => $count,
                'total' => $amount
            ];
        }

        // Compter les paiements par méthode
        $countByMethod = [];
        $methods = ['card', 'transfer', 'cpf'];

        foreach ($methods as $method) {
            $count = $this->count(['method' => $method]);
            $amount = $this->createQueryBuilder('p')
                ->select('SUM(p.amount)')
                ->where('p.method = :method')
                ->setParameter('method', $method)
                ->getQuery()
                ->getSingleScalarResult() ?? 0;

            $countByMethod[] = [
                'method' => $method,
                'count' => $count,
                'total' => $amount
            ];
        }

        // Calculer le taux de réussite manuellement
        $totalPayments = $this->count([]);
        $completedPayments = $this->count(['status' => 'completed']);
        $successRate = $totalPayments > 0 ? round(($completedPayments / $totalPayments) * 100) : 0;

        $stats = [
            'totalAmount' => $totalAmount,
            'countByStatus' => $countByStatus,
            'countByMethod' => $countByMethod,
            'successRate' => $successRate
        ];

        // Ajouter les données mensuelles de revenus pour le dashboard
        // Approche simplifiée qui évite les erreurs de syntaxe
        $currentYear = (int)(new \DateTime())->format('Y');

        $monthlyData = [];
        $monthNames = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        // Pour chaque mois de l'année en cours jusqu'au mois actuel
        $currentMonth = (int)(new \DateTime())->format('m');

        for ($month = 1; $month <= $currentMonth; $month++) {
            $startDate = new \DateTime("$currentYear-$month-01");
            $endDate = clone $startDate;
            $endDate->modify('last day of this month');

            $revenue = $this->createQueryBuilder('p')
                ->select('SUM(p.amount)')
                ->where('p.createdAt BETWEEN :start AND :end')
                ->andWhere('p.status = :status')
                ->setParameter('start', $startDate)
                ->setParameter('end', $endDate)
                ->setParameter('status', 'completed')
                ->getQuery()
                ->getSingleScalarResult() ?? 0;

            $monthlyData[] = [
                'month' => $monthNames[$month],
                'revenue' => (float)$revenue
            ];
        }

        $stats['monthlyRevenue'] = $monthlyData;

        return $stats;
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