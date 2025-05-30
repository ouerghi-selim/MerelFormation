<?php

namespace App\Repository;

use App\Entity\ExamCenter;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ExamCenter>
 */
class ExamCenterRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExamCenter::class);
    }

    /**
     * @return ExamCenter[] Returns an array of active ExamCenter objects
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('e.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return ExamCenter[] Returns an array of ExamCenter objects with their formulas
     */
    public function findWithFormulas(): array
    {
        return $this->createQueryBuilder('e')
            ->leftJoin('e.formulas', 'f')
            ->addSelect('f')
            ->andWhere('e.isActive = :active')
            ->andWhere('f.isActive = :formulaActive OR f.id IS NULL')
            ->setParameter('active', true)
            ->setParameter('formulaActive', true)
            ->orderBy('e.name', 'ASC')
            ->addOrderBy('f.type', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return ExamCenter[] Returns ExamCenter objects for admin listing
     */
    public function findForAdmin(?string $search = null): array
    {
        $qb = $this->createQueryBuilder('e')
            ->leftJoin('e.formulas', 'f')
            ->addSelect('f')
            ->orderBy('e.createdAt', 'DESC');

        if ($search) {
            $qb->andWhere('e.name LIKE :search OR e.city LIKE :search OR e.code LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        return $qb->getQuery()->getResult();
    }

    public function findOneByCode(string $code): ?ExamCenter
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.code = :code')
            ->andWhere('e.isActive = :active')
            ->setParameter('code', $code)
            ->setParameter('active', true)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Count total exam centers
     */
    public function countTotal(): int
    {
        return $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count active exam centers
     */
    public function countActive(): int
    {
        return $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->andWhere('e.isActive = :active')
            ->setParameter('active', true)
            ->getQuery()
            ->getSingleScalarResult();
    }
}