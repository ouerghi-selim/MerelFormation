<?php

namespace App\Repository;

use App\Entity\Document;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Document>
 *
 * @method Document|null find($id, $lockMode = null, $lockVersion = null)
 * @method Document|null findOneBy(array $criteria, array $orderBy = null)
 * @method Document[]    findAll()
 * @method Document[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Document::class);
    }

    /**
     * Find documents by category and type
     */
    public function findByCategoryAndType(string $category, string $type): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.category = :category')
            ->andWhere('d.type = :type')
            ->setParameter('category', $category)
            ->setParameter('type', $type)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find documents by user
     */
    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.uploadedBy = :userId')
            ->leftJoin('d.formation', 'f')
            ->addSelect('f')
            ->setParameter('userId', $userId)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find documents by formation
     */
    public function findByFormation(int $formationId): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.formation = :formationId')
            ->setParameter('formationId', $formationId)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find public documents
     */
    public function findPublicDocuments(): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.private = :private')
            ->setParameter('private', false)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find documents by date range
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.uploadedAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get document statistics
     */
    public function getStatistics(): array
    {
        $qb = $this->createQueryBuilder('d');

        return [
            'totalDocuments' => $this->count([]),
            
            'publicDocuments' => $qb->select('COUNT(d.id)')
                ->where('d.private = :private')
                ->setParameter('private', false)
                ->getQuery()
                ->getSingleScalarResult(),

            'documentsByCategory' => $qb->select('d.category, COUNT(d.id) as count')
                ->groupBy('d.category')
                ->getQuery()
                ->getResult(),

            'documentsByType' => $qb->select('d.type, COUNT(d.id) as count')
                ->groupBy('d.type')
                ->getQuery()
                ->getResult()
        ];
    }

    /**
     * Search documents by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('d')
            ->leftJoin('d.formation', 'f')
            ->leftJoin('d.uploadedBy', 'u')
            ->addSelect('f', 'u');

        if (isset($criteria['title'])) {
            $qb->andWhere('d.title LIKE :title')
               ->setParameter('title', '%' . $criteria['title'] . '%');
        }

        if (isset($criteria['category'])) {
            $qb->andWhere('d.category = :category')
               ->setParameter('category', $criteria['category']);
        }

        if (isset($criteria['type'])) {
            $qb->andWhere('d.type = :type')
               ->setParameter('type', $criteria['type']);
        }

        if (isset($criteria['formation'])) {
            $qb->andWhere('d.formation = :formation')
               ->setParameter('formation', $criteria['formation']);
        }

        if (isset($criteria['private'])) {
            $qb->andWhere('d.private = :private')
               ->setParameter('private', $criteria['private']);
        }

        if (isset($criteria['dateRange'])) {
            $qb->andWhere('d.uploadedAt BETWEEN :startDate AND :endDate')
               ->setParameter('startDate', $criteria['dateRange']['start'])
               ->setParameter('endDate', $criteria['dateRange']['end']);
        }

        return $qb->orderBy('d.uploadedAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }
}