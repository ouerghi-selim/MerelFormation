<?php

namespace App\Repository;

use App\Entity\User;
use App\Enum\ReservationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Find active users
     *
     * @return User[]
     */
    public function findActiveUsers(): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.isActive = :active')
            ->andWhere('u.deletedAt IS NULL')  // ✅ Exclure les utilisateurs supprimés
            ->setParameter('active', true)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find users by role
     *
     * @param string $role
     * @return User[]
     */
    public function findByRole(string $role): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.roles LIKE :role')
            ->setParameter('role', '%"' . $role . '"%')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find users with pending reservations
     *
     * @return User[]
     */
    public function findUsersWithPendingReservations(): array
    {
        return $this->createQueryBuilder('u')
            ->leftJoin('u.reservations', 'r')
            ->andWhere('r.status IN (:statuses)')
            ->setParameter('statuses', ['pending', ReservationStatus::SUBMITTED])
            ->distinct()
            ->getQuery()
            ->getResult();
    }

    /**
     * Find users with overdue invoices
     *
     * @return User[]
     */
    public function findUsersWithOverdueInvoices(): array
    {
        return $this->createQueryBuilder('u')
            ->leftJoin('u.invoices', 'i')
            ->andWhere('i.status = :status')
            ->andWhere('i.dueDate < :now')
            ->setParameter('status', 'pending')
            ->setParameter('now', new \DateTimeImmutable())
            ->distinct()
            ->getQuery()
            ->getResult();
    }

    /**
     * Search users by criteria
     *
     * @param array $criteria
     * @return User[]
     */
    public function searchByCriteria(array $criteria): array
    {
        $qb = $this->createQueryBuilder('u');

        // ✅ SOFT DELETE : Exclure automatiquement les utilisateurs supprimés
        $qb->andWhere('u.deletedAt IS NULL');

        // Recherche par email
        if (isset($criteria['email'])) {
            $qb->andWhere('u.email LIKE :email')
                ->setParameter('email', '%' . $criteria['email'] . '%');
        }

        // Recherche par nom ou prénom
        if (isset($criteria['name'])) {
            $qb->andWhere('u.firstName LIKE :name OR u.lastName LIKE :name OR u.email LIKE :name')
                ->setParameter('name', '%' . $criteria['name'] . '%');
        }

        // Filtre par rôle - utiliser LIKE au lieu de JSON_CONTAINS pour compatibilité
        if (isset($criteria['role'])) {
            $qb->andWhere('u.roles LIKE :role')
                ->setParameter('role', '%' . $criteria['role'] . '%');
        }

        // Filtre par statut actif/inactif
        if (isset($criteria['active'])) {
            $qb->andWhere('u.isActive = :active')
                ->setParameter('active', $criteria['active']);
        }

        // Ordre de tri par défaut
        $qb->orderBy('u.lastName', 'ASC')
            ->addOrderBy('u.firstName', 'ASC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Count the number of active students
     *
     * @return int
     */
    public function countActiveStudents(): int
    {
        // Solution 1: Utiliser LIKE pour rechercher le rôle dans le JSON
        return $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->andWhere('u.isActive = :active')
            ->andWhere('u.deletedAt IS NULL')  // ✅ Exclure les utilisateurs supprimés
            ->andWhere('u.roles LIKE :role')
            ->setParameter('active', true)
            ->setParameter('role', '%"ROLE_STUDENT"%')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find recent inscriptions (users who have recent reservations)
     *
     * @param int $limit
     * @return array
     */
    public function findRecentInscriptions(int $limit = 5): array
    {
        // Modifier aussi ici pour éviter JSON_CONTAINS
        return $this->createQueryBuilder('u')
            ->leftJoin('u.reservations', 'r')
            ->leftJoin('r.session', 's')
            ->leftJoin('s.formation', 'f')
            ->addSelect('r', 's', 'f')
            ->andWhere('r.id IS NOT NULL')
            ->andWhere('r.status != :cancelledStatus')
            ->andWhere('u.roles LIKE :role')  // Utiliser LIKE au lieu de JSON_CONTAINS
            ->setParameter('cancelledStatus', 'cancelled')
            ->setParameter('role', '%"ROLE_STUDENT"%')
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find archived (soft deleted) users for audit purposes
     *
     * @return User[]
     */
    public function findArchivedUsers(): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.deletedAt IS NOT NULL')
            ->orderBy('u.deletedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}