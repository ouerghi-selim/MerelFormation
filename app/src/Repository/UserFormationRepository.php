<?php

namespace App\Repository;

use App\Entity\Formation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

class UserFormationRepository
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Find formations by user
     *
     * @param int $userId
     * @return Formation[]
     */
    public function findByUser(int $userId): array
    {
        return $this->entityManager->createQueryBuilder()
            ->select('f', 'MIN(s.startDate) as HIDDEN nextSessionDate')
            ->from('App\Entity\Formation', 'f')
            ->join('f.sessions', 's')
            ->join('s.reservations', 'r')  // Utiliser reservations au lieu de participants
            ->where('r.user = :userId')   // r.user au lieu de p.id
            ->andWhere('r.status IN (:confirmedStatuses)')  // Seulement les réservations confirmées
            ->andWhere('f.isActive = :active')
            ->setParameter('userId', $userId)
            ->setParameter('confirmedStatuses', ['confirmed', 'completed'])
            ->setParameter('active', true)
            ->groupBy('f.id')
            ->orderBy('nextSessionDate', 'ASC')
            ->getQuery()
            ->getResult();
    }
}