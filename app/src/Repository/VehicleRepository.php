<?php

namespace App\Repository;

use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\QueryBuilder;

/**
 * @extends ServiceEntityRepository<Vehicle>
 *
 * @method Vehicle|null find($id, $lockMode = null, $lockVersion = null)
 * @method Vehicle|null findOneBy(array $criteria, array $orderBy = null)
 * @method Vehicle[]    findAll()
 * @method Vehicle[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VehicleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vehicle::class);
    }

    /**
     * Find available vehicles for rental
     */
    public function findAvailableVehicles(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.isActive = :active')
            ->andWhere('v.status = :status')
            ->leftJoin('v.rentals', 'r')
            ->andWhere(
                'r.id IS NULL OR (
                    r.status != :rentalStatus AND
                    (r.endDate < :startDate OR r.startDate > :endDate)
                )'
            )
            ->setParameter('active', true)
            ->setParameter('status', 'available')
            ->setParameter('rentalStatus', 'confirmed')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('v.category', 'ASC')
            ->addOrderBy('v.model', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find vehicles by category
     */
    public function findByCategory(string $category): array
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.category = :category')
            ->andWhere('v.isActive = :active')
            ->setParameter('category', $category)
            ->setParameter('active', true)
            ->orderBy('v.model', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find vehicles with maintenance needed
     */
    public function findVehiclesNeedingMaintenance(): array
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.status = :status')
            ->setParameter('status', 'maintenance')
            ->orderBy('v.model', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search vehicles by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.isActive = :active')
            ->setParameter('active', true);

        if (isset($criteria['model'])) {
            $qb->andWhere('v.model LIKE :model')
               ->setParameter('model', '%' . $criteria['model'] . '%');
        }

        if (isset($criteria['category'])) {
            $qb->andWhere('v.category = :category')
               ->setParameter('category', $criteria['category']);
        }

        if (isset($criteria['status'])) {
            $qb->andWhere('v.status = :status')
               ->setParameter('status', $criteria['status']);
        }

        if (isset($criteria['maxDailyRate'])) {
            $qb->andWhere('v.dailyRate <= :maxRate')
               ->setParameter('maxRate', $criteria['maxDailyRate']);
        }

        if (isset($criteria['year'])) {
            $qb->andWhere('v.year = :year')
               ->setParameter('year', $criteria['year']);
        }

        return $qb->orderBy('v.model', 'ASC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get vehicle statistics
     */
    public function getStatistics(): array
    {
        $now = new \DateTimeImmutable();
        
        return [
            'totalVehicles' => $this->createQueryBuilder('v')->select('COUNT(v.id)')
                ->where('v.isActive = :active')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult(),
                
            'activeRentals' => $this->createQueryBuilder('v')->select('COUNT(r.id)')
                ->leftJoin('v.rentals', 'r')
                ->where('r.status = :status')
                ->andWhere('r.startDate <= :now')
                ->andWhere('r.endDate >= :now')
                ->setParameter('status', 'confirmed')
                ->setParameter('now', $now)
                ->getQuery()
                ->getSingleScalarResult(),
                
            'maintenanceCount' => $this->createQueryBuilder('v')->select('COUNT(v.id)')
                ->where('v.status = :status')
                ->setParameter('status', 'maintenance')
                ->getQuery()
                ->getSingleScalarResult(),
                
            'averageDailyRate' => $this->createQueryBuilder('v')->select('AVG(v.dailyRate)')
                ->where('v.isActive = :active')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult()
        ];
    }

    /**
     * Find most rented vehicles
     */
    public function findMostRentedVehicles(int $limit = 5): array
    {
        return $this->createQueryBuilder('v')
            ->select('v, COUNT(r.id) as rentalCount')
            ->leftJoin('v.rentals', 'r')
            ->where('v.isActive = :active')
            ->andWhere('r.status = :status')
            ->groupBy('v.id')
            ->setParameter('active', true)
            ->setParameter('status', 'completed')
            ->orderBy('rentalCount', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}