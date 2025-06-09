<?php

namespace App\Repository;

use App\Entity\TempDocument;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TempDocument>
 */
class TempDocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TempDocument::class);
    }

    /**
     * Supprimer les documents temporaires anciens (plus de 24h)
     */
    public function cleanupOldTempDocuments(): int
    {
        $cutoffDate = new \DateTime('-24 hours');
        
        $qb = $this->createQueryBuilder('td')
            ->delete()
            ->where('td.uploadedAt < :cutoffDate')
            ->setParameter('cutoffDate', $cutoffDate);

        return $qb->getQuery()->execute();
    }

    /**
     * Récupérer les documents temporaires par IDs
     */
    public function findByTempIds(array $tempIds): array
    {
        return $this->createQueryBuilder('td')
            ->where('td.tempId IN (:tempIds)')
            ->setParameter('tempIds', $tempIds)
            ->getQuery()
            ->getResult();
    }

    /**
     * Supprimer les documents temporaires par IDs
     */
    public function deleteByTempIds(array $tempIds): int
    {
        return $this->createQueryBuilder('td')
            ->delete()
            ->where('td.tempId IN (:tempIds)')
            ->setParameter('tempIds', $tempIds)
            ->getQuery()
            ->execute();
    }
}