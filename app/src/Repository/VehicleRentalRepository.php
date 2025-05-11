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
     * Get rental statistics with dashboard data
     */
    public function getStatistics(\DateTimeInterface $startDate = null, \DateTimeInterface $endDate = null): array
    {
        // Nombre total de locations
        $totalRentals = $this->count([]);

        // Revenus totaux des locations complétées
        $totalRevenue = $this->createQueryBuilder('vr')
            ->select('SUM(vr.totalPrice)')
            ->where('vr.status = :completedStatus')
            ->setParameter('completedStatus', 'completed')
            ->getQuery()
            ->getSingleScalarResult() ?? 0;

        // Répartition par statut
        $rentalsByStatus = [];
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        foreach ($statuses as $status) {
            $count = $this->count(['status' => $status]);

            $rentalsByStatus[] = [
                'status' => $status,
                'count' => $count
            ];
        }

        // Pour la durée moyenne, on récupère les données brutes et on calcule manuellement
        $rentals = $this->createQueryBuilder('vr')
            ->select('vr.startDate', 'vr.endDate')
            ->getQuery()
            ->getResult();

        $totalDays = 0;
        $count = count($rentals);

        foreach ($rentals as $rental) {
            if ($rental['startDate'] instanceof \DateTimeInterface && $rental['endDate'] instanceof \DateTimeInterface) {
                $interval = $rental['startDate']->diff($rental['endDate']);
                $totalDays += $interval->days;
            }
        }

        $avgDuration = $count > 0 ? $totalDays / $count : 0;

        $stats = [
            'totalRentals' => $totalRentals,
            'totalRevenue' => $totalRevenue,
            'rentalsByStatus' => $rentalsByStatus,
            'averageRentalDuration' => $avgDuration
        ];

        // Calculer le taux de confirmation
        $confirmedCount = $this->count(['status' => 'confirmed']);
        $stats['confirmationRate'] = $totalRentals > 0 ? round(($confirmedCount / $totalRentals) * 100) : 0;

        return $stats;
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

    /**
     * Find vehicle rentals by filters for admin interface
     */
    public function findByFilters(
        ?string $search = null,
        ?string $status = null,
        ?string $date = null,
        ?int $limit = null,
        ?string $sort = null
    ): array {
        $qb = $this->createQueryBuilder('vr')
            ->leftJoin('vr.user', 'u')
            ->leftJoin('vr.vehicle', 'v')
            ->addSelect('u', 'v');


        // Filtre de recherche
        if ($search) {
            $qb->andWhere('u.firstName LIKE :search OR u.lastName LIKE :search OR u.email LIKE :search OR vr.notes LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        // Filtre de statut
        if ($status) {
            $qb->andWhere('vr.status = :status')
                ->setParameter('status', $status);
        }

        // Filtre de date
        if ($date) {
            try {
                $dateObj = new \DateTime($date);
                $dateStart = (clone $dateObj)->setTime(0, 0, 0);
                $dateEnd = (clone $dateObj)->setTime(23, 59, 59);

                $qb->andWhere('(vr.startDate <= :dateEnd AND vr.endDate >= :dateStart)')
                    ->setParameter('dateStart', $dateStart)
                    ->setParameter('dateEnd', $dateEnd);
            } catch (\Exception $e) {
                // Ignorer si le format de date est invalide
            }
        }

        // Appliquer le tri
        if ($sort) {
            $sortParts = explode(',', $sort);
            $sortField = $sortParts[0];
            $sortDirection = isset($sortParts[1]) ? $sortParts[1] : 'ASC';

            // Mapper les champs de tri à leurs chemins réels
            $sortFieldMap = [
                'date' => 'vr.startDate',
                'createdAt' => 'vr.createdAt',
                'status' => 'vr.status',
                // Ajouter d'autres mappings si nécessaire
            ];

            if (isset($sortFieldMap[$sortField])) {
                $qb->orderBy($sortFieldMap[$sortField], $sortDirection);
            } else {
                // Tri par défaut
                $qb->orderBy('vr.createdAt', 'DESC');
            }
        } else {
            // Tri par défaut
            $qb->orderBy('vr.createdAt', 'DESC');
        }

        // Appliquer la limite
        if ($limit !== null) {
            $qb->setMaxResults((int) $limit);
        }

        return $qb->getQuery()->getResult();
    }
}