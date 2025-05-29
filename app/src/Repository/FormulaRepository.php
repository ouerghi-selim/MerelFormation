<?php

namespace App\Repository;

use App\Entity\Formula;
use App\Entity\ExamCenter;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Formula>
 */
class FormulaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Formula::class);
    }

    /**
     * @return Formula[] Returns an array of active Formula objects
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('f')
            ->leftJoin('f.examCenter', 'e')
            ->addSelect('e')
            ->andWhere('f.isActive = :active')
            ->andWhere('e.isActive = :centerActive')
            ->setParameter('active', true)
            ->setParameter('centerActive', true)
            ->orderBy('e.name', 'ASC')
            ->addOrderBy('f.type', 'ASC')
            ->addOrderBy('f.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Formula[] Returns formulas for a specific exam center
     */
    public function findByExamCenter(ExamCenter $examCenter): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.examCenter = :examCenter')
            ->andWhere('f.isActive = :active')
            ->setParameter('examCenter', $examCenter)
            ->setParameter('active', true)
            ->orderBy('f.type', 'ASC')
            ->addOrderBy('f.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Formula[] Returns formulas for admin listing
     */
    public function findForAdmin(?string $search = null, ?ExamCenter $examCenter = null): array
    {
        $qb = $this->createQueryBuilder('f')
            ->leftJoin('f.examCenter', 'e')
            ->addSelect('e')
            ->orderBy('f.createdAt', 'DESC');

        if ($search) {
            $qb->andWhere('f.name LIKE :search OR f.description LIKE :search OR e.name LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        if ($examCenter) {
            $qb->andWhere('f.examCenter = :examCenter')
               ->setParameter('examCenter', $examCenter);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return Formula[] Returns formulas by type
     */
    public function findByType(string $type): array
    {
        return $this->createQueryBuilder('f')
            ->leftJoin('f.examCenter', 'e')
            ->addSelect('e')
            ->andWhere('f.type = :type')
            ->andWhere('f.isActive = :active')
            ->andWhere('e.isActive = :centerActive')
            ->setParameter('type', $type)
            ->setParameter('active', true)
            ->setParameter('centerActive', true)
            ->orderBy('e.name', 'ASC')
            ->addOrderBy('f.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get formulas grouped by exam center for frontend
     */
    public function getFormulasGroupedByCenter(): array
    {
        $formulas = $this->findActive();
        $grouped = [];

        foreach ($formulas as $formula) {
            $centerName = $formula->getExamCenter()->getName();
            if (!isset($grouped[$centerName])) {
                $grouped[$centerName] = [
                    'center' => $formula->getExamCenter(),
                    'formulas' => []
                ];
            }
            $grouped[$centerName]['formulas'][] = $formula;
        }

        return $grouped;
    }

    /**
     * Count total formulas
     */
    public function countTotal(): int
    {
        return $this->createQueryBuilder('f')
            ->select('COUNT(f.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count active formulas
     */
    public function countActive(): int
    {
        return $this->createQueryBuilder('f')
            ->select('COUNT(f.id)')
            ->leftJoin('f.examCenter', 'e')
            ->andWhere('f.isActive = :active')
            ->andWhere('e.isActive = :centerActive')
            ->setParameter('active', true)
            ->setParameter('centerActive', true)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get price statistics
     */
    public function getPriceStatistics(): array
    {
        $result = $this->createQueryBuilder('f')
            ->select('
                MIN(f.price) as minPrice,
                MAX(f.price) as maxPrice,
                AVG(f.price) as avgPrice,
                COUNT(f.id) as totalWithPrice
            ')
            ->andWhere('f.price IS NOT NULL')
            ->andWhere('f.isActive = :active')
            ->setParameter('active', true)
            ->getQuery()
            ->getSingleResult();

        return [
            'minPrice' => $result['minPrice'] ? (float)$result['minPrice'] : 0,
            'maxPrice' => $result['maxPrice'] ? (float)$result['maxPrice'] : 0,
            'avgPrice' => $result['avgPrice'] ? (float)$result['avgPrice'] : 0,
            'totalWithPrice' => $result['totalWithPrice'] ?? 0
        ];
    }
}