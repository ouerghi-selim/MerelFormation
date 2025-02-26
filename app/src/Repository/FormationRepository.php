<?php

namespace App\Repository;

use App\Entity\Formation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\QueryBuilder;

/**
 * @extends ServiceEntityRepository<Formation>
 *
 * @method Formation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Formation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Formation[]    findAll()
 * @method Formation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FormationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Formation::class);
    }

    /**
     * Find active formations with available sessions
     *
     * @return Formation[]
     */
    public function findActiveFormationsWithSessions(): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.isActive = :active')
            ->leftJoin('f.sessions', 's')
            ->andWhere('s.startDate > :now')
            ->andWhere('s.status = :status')
            ->setParameter('active', true)
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'scheduled')
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find formations by type with upcoming sessions
     *
     * @param string $type
     * @return Formation[]
     */
    public function findByTypeWithUpcomingSessions(string $type): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.type = :type')
            ->andWhere('f.isActive = :active')
            ->leftJoin('f.sessions', 's')
            ->andWhere('s.startDate > :now')
            ->setParameter('type', $type)
            ->setParameter('active', true)
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find formations by category
     *
     * @param int $categoryId
     * @return Formation[]
     */
    public function findByCategory(int $categoryId): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.category = :categoryId')
            ->andWhere('f.isActive = :active')
            ->setParameter('categoryId', $categoryId)
            ->setParameter('active', true)
            ->orderBy('f.title', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find formations with available places
     *
     * @return Formation[]
     */
    public function findWithAvailablePlaces(): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.isActive = :active')
            ->leftJoin('f.sessions', 's')
            ->leftJoin('s.reservations', 'r')
            ->andWhere('s.startDate > :now')
            ->andWhere('s.status = :status')
            ->having('COUNT(r.id) < s.maxParticipants')
            ->groupBy('f.id')
            ->setParameter('active', true)
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('status', 'scheduled')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search formations by criteria
     *
     * @param array $criteria
     * @return Formation[]
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('f')
            ->andWhere('f.isActive = :active')
            ->setParameter('active', true);

        if (isset($criteria['title'])) {
            $qb->andWhere('f.title LIKE :title')
               ->setParameter('title', '%' . $criteria['title'] . '%');
        }

        if (isset($criteria['type'])) {
            $qb->andWhere('f.type = :type')
               ->setParameter('type', $criteria['type']);
        }

        if (isset($criteria['priceMin'])) {
            $qb->andWhere('f.price >= :priceMin')
               ->setParameter('priceMin', $criteria['priceMin']);
        }

        if (isset($criteria['priceMax'])) {
            $qb->andWhere('f.price <= :priceMax')
               ->setParameter('priceMax', $criteria['priceMax']);
        }

        if (isset($criteria['categoryId'])) {
            $qb->andWhere('f.category = :categoryId')
               ->setParameter('categoryId', $criteria['categoryId']);
        }

        if (isset($criteria['hasAvailableSessions']) && $criteria['hasAvailableSessions']) {
            $qb->leftJoin('f.sessions', 's')
               ->andWhere('s.startDate > :now')
               ->andWhere('s.status = :status')
               ->setParameter('now', new \DateTimeImmutable())
               ->setParameter('status', 'scheduled');
        }

        return $qb->orderBy('f.title', 'ASC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Get formations statistics
     *
     * @return array
     */
    public function getStatistics(): array
    {

        return [
            'totalFormations' => $this->createQueryBuilder('f')->select('COUNT(f.id)')
                ->where('f.isActive = :active')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult(),
                
            'totalSessions' => $this->createQueryBuilder('f')->select('COUNT(s.id)')
                ->leftJoin('f.sessions', 's')
                ->where('f.isActive = :active')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult(),
                
            'upcomingSessions' => $this->createQueryBuilder('f')->select('COUNT(s.id)')
                ->leftJoin('f.sessions', 's')
                ->where('f.isActive = :active')
                ->andWhere('s.startDate > :now')
                ->setParameter('active', true)
                ->setParameter('now', new \DateTimeImmutable())
                ->getQuery()
                ->getSingleScalarResult(),
        ];
    }
}