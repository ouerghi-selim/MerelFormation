<?php

namespace App\Repository;

use App\Entity\Category;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Category>
 *
 * @method Category|null find($id, $lockMode = null, $lockVersion = null)
 * @method Category|null findOneBy(array $criteria, array $orderBy = null)
 * @method Category[]    findAll()
 * @method Category[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Category::class);
    }

    /**
     * Find active categories with their formations count
     */
    public function findActiveWithFormationsCount(): array
    {
        return $this->createQueryBuilder('c')
            ->select('c', 'COUNT(f.id) as formationsCount')
            ->leftJoin('c.formations', 'f')
            ->where('c.isActive = :active')
            ->andWhere('f.isActive = :formationActive')
            ->setParameter('active', true)
            ->setParameter('formationActive', true)
            ->groupBy('c.id')
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find categories by parent
     */
    public function findByParent(?int $parentId): array
    {
        $qb = $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->setParameter('active', true);

        if ($parentId === null) {
            $qb->andWhere('c.parent IS NULL');
        } else {
            $qb->andWhere('c.parent = :parentId')
               ->setParameter('parentId', $parentId);
        }

        return $qb->orderBy('c.lft', 'ASC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Find categories by level
     */
    public function findByLevel(int $level): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.level = :level')
            ->andWhere('c.isActive = :active')
            ->setParameter('level', $level)
            ->setParameter('active', true)
            ->orderBy('c.lft', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get category hierarchy
     */
    public function getHierarchy(): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isActive = :active')
            ->orderBy('c.lft', 'ASC')
            ->setParameter('active', true)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find categories with active formations
     */
    public function findWithActiveFormations(): array
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.formations', 'f')
            ->where('c.isActive = :active')
            ->andWhere('f.isActive = :formationActive')
            ->addSelect('f')
            ->setParameter('active', true)
            ->setParameter('formationActive', true)
            ->orderBy('c.lft', 'ASC')
            ->addOrderBy('f.title', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get categories statistics
     */
    public function getStatistics(): array
    {
        $qb = $this->createQueryBuilder('c');

        return [
            'totalCategories' => $this->count(['isActive' => true]),

            'topLevelCategories' => $qb->select('COUNT(c.id)')
                ->where('c.parent IS NULL')
                ->andWhere('c.isActive = :active')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult(),

            'categoriesWithFormations' => $qb->select('COUNT(DISTINCT c.id)')
                ->leftJoin('c.formations', 'f')
                ->where('c.isActive = :active')
                ->andWhere('f.id IS NOT NULL')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult(),

            'maxDepth' => $qb->select('MAX(c.level)')
                ->where('c.isActive = :active')
                ->setParameter('active', true)
                ->getQuery()
                ->getSingleScalarResult()
        ];
    }

    /**
     * Search categories
     */
    public function searchCategories(string $query): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.name LIKE :query OR c.description LIKE :query')
            ->andWhere('c.isActive = :active')
            ->setParameter('query', '%' . $query . '%')
            ->setParameter('active', true)
            ->orderBy('c.lft', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get categories with formation count by type
     */
    public function getCategoriesWithFormationCountByType(): array
    {
        return $this->createQueryBuilder('c')
            ->select('c.name', 'f.type', 'COUNT(f.id) as count')
            ->leftJoin('c.formations', 'f')
            ->where('c.isActive = :active')
            ->andWhere('f.isActive = :formationActive')
            ->groupBy('c.id', 'f.type')
            ->setParameter('active', true)
            ->setParameter('formationActive', true)
            ->getQuery()
            ->getResult();
    }
}