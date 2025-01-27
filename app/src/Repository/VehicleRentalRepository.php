<?php

namespace App\Repository;

use App\Entity\VehicleRental;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<VehicleRental>
 *
 * @method VehicleRental|null find($id, $lockMode = null, $lockVersion = null)
 * @method VehicleRental|null findOneBy(array $criteria, array $orderBy = null)
 * @method VehicleRental[]    findAll()
 * @method VehicleRental[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VehicleRentalRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VehicleRental::class);
    }

    /**
     * Find user's rentals
     */
    public function findUserRentals(int $userId): array
    {
        return $this->createQueryBuilder('vr')
            ->andWhere('vr.user = :userId')
            ->leftJoin('vr.vehicle', 'v')
            ->leftJoin('vr.invoice', 'i')
            ->addSelect('v', 'i')
            ->setParameter('userId', $userId)
            ->orderBy('vr.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find active rentals
     */
    public function findActiveRentals(): array
    {
        $now = new \DateTimeImmutable();
        
        return $this->createQueryBuilder('vr')
            ->andWhere('vr.startDate <= :now')
            ->andWhere('vr.endDate >= :now')
            ->andWhere('vr.status = :status')
            ->leftJoin('vr.vehicle', 'v')
            ->leftJoin('vr.user', 'u')
            ->addSelect('v', 'u')
            ->setParameter('now', $now)
            ->setParameter('status', 'confirmed')
            ->orderBy('vr.endDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find rentals by vehicle
     */
    public function findVehicleRentals(int $vehicleId): array
    {
        return $this->createQueryBuilder('vr')
            ->andWhere('vr.vehicle = :vehicleId')
            ->leftJoin('vr.user', 'u')
            ->leftJoin('vr.invoice', 'i')
            ->addSelect('u', 'i')
            ->setParameter('vehicleId', $vehicleId)
            ->orderBy('vr.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find rentals by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('vr')
            ->andWhere('vr.startDate <= :endDate')
            ->andWhere('vr.endDate >= :startDate')
            ->leftJoin('vr.vehicle', 'v')
            ->leftJoin('vr.user', 'u')
            ->addSelect('v', 'u')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('vr.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find upcoming rentals
     */
    public function findUpcomingRentals(): array
    {
        return $this->createQueryBuilder('vr')
            ->andWhere('vr.startDate > :now')
            ->andWhere('vr.status = :status')
            ->leftJoin('vr.vehicle', 'v')
            ->leftJoin('vr.user', 'u')
            ->addSelect('v', 'u')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'confirmed')
            ->orderBy('vr.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get rental statistics
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        $qb = $this->createQueryBuilder('vr');
        
        $conditions = [];
        $parameters = [];
        
        if ($startDate && $endDate) {
            $conditions[] = 'vr.startDate BETWEEN :startDate AND :endDate';
            $parameters['startDate'] = $startDate;
            $parameters['endDate'] = $endDate;
        }

        return [
            'totalRentals' => $qb->select('COUNT(vr.id)')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult(),

            'totalRevenue' => $qb->select('SUM(vr.totalPrice)')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->andWhere('vr.status = :completedStatus')
                ->setParameter('completedStatus', 'completed')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0,

            'rentalsByStatus' => $qb->select('vr.status, COUNT(vr.id) as count')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->groupBy('vr.status')
                ->getQuery()
                ->getResult(),

            'averageRentalDuration' => $qb->select('AVG(TIMESTAMPDIFF(DAY, vr.startDate, vr.endDate)) as avgDuration')
                ->where($conditions ? implode(' AND ', $conditions) : '1=1')
                ->setParameters($parameters)
                ->getQuery()
                ->getSingleScalarResult() ?? 0
        ];
    }

    /**
     * Search rentals by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('vr')
            ->leftJoin('vr.vehicle', 'v')
            ->leftJoin('vr.user', 'u')
            ->leftJoin('vr.invoice', 'i')
            ->addSelect('v', 'u', 'i');

        if (isset($criteria['status'])) {
            $qb->andWhere('vr.status = :status')
               ->setParameter('status', $criteria['status']);
        }

        if (isset($criteria['vehicle'])) {
            $qb->andWhere('v.id = :vehicleId')
               ->setParameter('vehicleId', $criteria['vehicle']);
        }

        if (isset($criteria['userId'])) {
            $qb->andWhere('u.id = :userId')
               ->setParameter('userId', $criteria['userId']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('vr.startDate <= :endDate')
               ->andWhere('vr.endDate >= :startDate')
               ->setParameter('startDate', $criteria['dateRange']['start'])
               ->setParameter('endDate', $criteria['dateRange']['end']);
        }

        if (isset($criteria['location'])) {
            $qb->andWhere('vr.pickupLocation LIKE :location OR vr.returnLocation LIKE :location')
               ->setParameter('location', '%' . $criteria['location'] . '%');
        }

        if (isset($criteria['minPrice'])) {
            $qb->andWhere('vr.totalPrice >= :minPrice')
               ->setParameter('minPrice', $criteria['minPrice']);
        }

        if (isset($criteria['maxPrice'])) {
            $qb->andWhere('vr.totalPrice <= :maxPrice')
               ->setParameter('maxPrice', $criteria['maxPrice']);
        }

        return $qb->orderBy('vr.startDate', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get popular rental locations
     */
    public function getPopularLocations(int $limit = 5): array
    {
        return $this->createQueryBuilder('vr')
            ->select('vr.pickupLocation, COUNT(vr.id) as count')
            ->where('vr.status != :cancelledStatus')
            ->setParameter('cancelledStatus', 'cancelled')
            ->groupBy('vr.pickupLocation')
            ->orderBy('count', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}