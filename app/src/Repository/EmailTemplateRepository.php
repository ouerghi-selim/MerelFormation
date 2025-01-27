<?php

namespace App\Repository;

use App\Entity\EmailTemplate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EmailTemplate>
 *
 * @method EmailTemplate|null find($id, $lockMode = null, $lockVersion = null)
 * @method EmailTemplate|null findOneBy(array $criteria, array $orderBy = null)
 * @method EmailTemplate[]    findAll()
 * @method EmailTemplate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmailTemplateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmailTemplate::class);
    }

    /**
     * Find template by type
     */
    public function findByType(string $type): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.type = :type')
            ->setParameter('type', $type)
            ->orderBy('e.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find template by name
     */
    public function findByName(string $name): ?EmailTemplate
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.name = :name')
            ->setParameter('name', $name)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find templates by variable usage
     */
    public function findByVariable(string $variable): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('JSON_CONTAINS(e.variables, :variable) = 1')
            ->setParameter('variable', json_encode($variable))
            ->orderBy('e.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search templates
     */
    public function searchTemplates(string $query): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.name LIKE :query OR e.subject LIKE :query OR e.content LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('e.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get templates by usage
     */
    public function getTemplatesByUsage(array $types): array
    {
        return $this->createQueryBuilder('e')
            ->select('e.type, COUNT(e.id) as count')
            ->where('e.type IN (:types)')
            ->setParameter('types', $types)
            ->groupBy('e.type')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get template statistics
     */
    public function getStatistics(): array
    {
        $qb = $this->createQueryBuilder('e');

        return [
            'totalTemplates' => $this->count([]),

            'templatesByType' => $qb->select('e.type, COUNT(e.id) as count')
                ->groupBy('e.type')
                ->getQuery()
                ->getResult(),

            'averageVariablesPerTemplate' => $qb->select('AVG(JSON_LENGTH(e.variables)) as avgVars')
                ->getQuery()
                ->getSingleScalarResult() ?? 0
        ];
    }

    /**
     * Search templates by criteria
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('e');

        if (isset($criteria['type'])) {
            $qb->andWhere('e.type = :type')
               ->setParameter('type', $criteria['type']);
        }

        if (isset($criteria['name'])) {
            $qb->andWhere('e.name LIKE :name')
               ->setParameter('name', '%' . $criteria['name'] . '%');
        }

        if (isset($criteria['subject'])) {
            $qb->andWhere('e.subject LIKE :subject')
               ->setParameter('subject', '%' . $criteria['subject'] . '%');
        }

        if (isset($criteria['content'])) {
            $qb->andWhere('e.content LIKE :content')
               ->setParameter('content', '%' . $criteria['content'] . '%');
        }

        if (isset($criteria['variable'])) {
            $qb->andWhere('JSON_CONTAINS(e.variables, :variable) = 1')
               ->setParameter('variable', json_encode($criteria['variable']));
        }

        return $qb->orderBy('e.name', 'ASC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Clone a template
     */
    public function cloneTemplate(EmailTemplate $template, string $newName): ?EmailTemplate
    {
        $clone = clone $template;
        $clone->setName($newName);

        try {
            $this->getEntityManager()->persist($clone);
            $this->getEntityManager()->flush();
            return $clone;
        } catch (\Exception $e) {
            return null;
        }
    }
}