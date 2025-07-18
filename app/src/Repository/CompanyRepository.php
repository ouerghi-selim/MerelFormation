<?php

namespace App\Repository;

use App\Entity\Company;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Company>
 */
class CompanyRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Company::class);
    }

    /**
     * Trouve une entreprise par son numéro SIRET
     */
    public function findBySiret(string $siret): ?Company
    {
        return $this->findOneBy(['siret' => $siret]);
    }

    /**
     * Trouve les entreprises actives
     */
    public function findActiveCompanies(): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Recherche d'entreprises par nom
     */
    public function findByNameLike(string $name): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.name LIKE :name')
            ->setParameter('name', '%' . $name . '%')
            ->andWhere('c.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les entreprises avec le nombre d'employés
     */
    public function findCompaniesWithEmployeeCount(): array
    {
        return $this->createQueryBuilder('c')
            ->select('c', 'COUNT(u.id) as employeeCount')
            ->leftJoin('c.users', 'u')
            ->groupBy('c.id')
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les entreprises par ville
     */
    public function findByCity(string $city): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.city = :city')
            ->setParameter('city', $city)
            ->andWhere('c.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}