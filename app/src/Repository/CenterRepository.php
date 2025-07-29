<?php

namespace App\Repository;

use App\Entity\Center;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Center>
 */
class CenterRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Center::class);
    }

    /**
     * Find centers that can be used for formations
     *
     * @return Center[]
     */
    public function findForFormations(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->andWhere('c.type IN (:types)')
            ->setParameter('active', true)
            ->setParameter('types', [Center::TYPE_FORMATION, Center::TYPE_BOTH])
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find centers that can be used for exams
     *
     * @return Center[]
     */
    public function findForExams(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->andWhere('c.type IN (:types)')
            ->setParameter('active', true)
            ->setParameter('types', [Center::TYPE_EXAM, Center::TYPE_BOTH])
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all active centers
     *
     * @return Center[]
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find centers by city
     *
     * @param string $city
     * @return Center[]
     */
    public function findByCity(string $city): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->andWhere('LOWER(c.city) LIKE LOWER(:city)')
            ->setParameter('active', true)
            ->setParameter('city', '%' . $city . '%')
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find centers by type and department
     *
     * @param string $type
     * @param string $departmentCode
     * @return Center[]
     */
    public function findByTypeAndDepartment(string $type, string $departmentCode): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->andWhere('c.type = :type OR c.type = :both')
            ->andWhere('c.departmentCode = :dept')
            ->setParameter('active', true)
            ->setParameter('type', $type)
            ->setParameter('both', Center::TYPE_BOTH)
            ->setParameter('dept', $departmentCode)
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find ALL centers that can be used for formations (active and inactive)
     * For admin interface
     *
     * @return Center[]
     */
    public function findAllForFormations(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.type IN (:types)')
            ->setParameter('types', [Center::TYPE_FORMATION, Center::TYPE_BOTH])
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find ALL centers that can be used for exams (active and inactive)
     * For admin interface
     *
     * @return Center[]
     */
    public function findAllForExams(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.type IN (:types)')
            ->setParameter('types', [Center::TYPE_EXAM, Center::TYPE_BOTH])
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find active exam centers (for public API)
     *
     * @return Center[]
     */
    public function findActiveExamCenters(): array
    {
        return $this->findForExams();
    }

    /**
     * Find active exam centers with their formulas
     * Equivalent to old ExamCenterRepository::findWithFormulas()
     *
     * @return Center[]
     */
    public function findExamCentersWithFormulas(): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.formulas', 'f')
            ->addSelect('f')
            ->where('c.isActive = :active')
            ->andWhere('c.type IN (:types)')
            ->andWhere('f.isActive = :formulaActive OR f.id IS NULL')
            ->setParameter('active', true)
            ->setParameter('formulaActive', true)
            ->setParameter('types', [Center::TYPE_EXAM, Center::TYPE_BOTH])
            ->orderBy('c.name', 'ASC')
            ->addOrderBy('f.type', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find centers for admin listing with optional search
     * Equivalent to old ExamCenterRepository::findForAdmin()
     *
     * @return Center[]
     */
    public function findForAdmin(?string $search = null, ?string $type = null): array
    {
        $qb = $this->createQueryBuilder('c')
            ->leftJoin('c.formulas', 'f')
            ->addSelect('f')
            ->orderBy('c.createdAt', 'DESC');

        if ($search) {
            $qb->andWhere('c.name LIKE :search OR c.city LIKE :search OR c.code LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        if ($type) {
            $qb->andWhere('c.type = :type OR c.type = :both')
               ->setParameter('type', $type)
               ->setParameter('both', Center::TYPE_BOTH);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find one center by code
     * Equivalent to old ExamCenterRepository::findOneByCode()
     */
    public function findOneByCode(string $code): ?Center
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.code = :code')
            ->andWhere('c.isActive = :active')
            ->setParameter('code', $code)
            ->setParameter('active', true)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Count total centers
     * Equivalent to old ExamCenterRepository::countTotal()
     */
    public function countTotal(?string $type = null): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)');

        if ($type) {
            $qb->andWhere('c.type = :type OR c.type = :both')
               ->setParameter('type', $type)
               ->setParameter('both', Center::TYPE_BOTH);
        }

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Count active centers
     * Equivalent to old ExamCenterRepository::countActive()
     */
    public function countActive(?string $type = null): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.isActive = :active')
            ->setParameter('active', true);

        if ($type) {
            $qb->andWhere('c.type = :type OR c.type = :both')
               ->setParameter('type', $type)
               ->setParameter('both', Center::TYPE_BOTH);
        }

        return $qb->getQuery()->getSingleScalarResult();
    }
}