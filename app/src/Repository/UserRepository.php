<?php

namespace App\Repository;

use App\Entity\User;
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
            ->andWhere('JSON_CONTAINS(u.roles, :role) = 1')
            ->setParameter('role', json_encode($role))
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
            ->andWhere('r.status = :status')
            ->setParameter('status', 'pending')
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

        if (isset($criteria['email'])) {
            $qb->andWhere('u.email LIKE :email')
               ->setParameter('email', '%' . $criteria['email'] . '%');
        }

        if (isset($criteria['name'])) {
            $qb->andWhere('u.firstName LIKE :name OR u.lastName LIKE :name')
               ->setParameter('name', '%' . $criteria['name'] . '%');
        }

        if (isset($criteria['role'])) {
            $qb->andWhere('JSON_CONTAINS(u.roles, :role) = 1')
               ->setParameter('role', json_encode($criteria['role']));
        }

        if (isset($criteria['active'])) {
            $qb->andWhere('u.isActive = :active')
               ->setParameter('active', $criteria['active']);
        }

        return $qb->getQuery()->getResult();
    }
}