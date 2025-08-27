<?php

namespace App\EventListener;

use App\Entity\User;
use App\Entity\Reservation;
use App\Entity\Document;
use App\Entity\VehicleRental;
use App\Entity\Notification;
use App\Entity\Invoice;
use App\Enum\ReservationStatus;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Psr\Log\LoggerInterface;

/**
 * 🚀 EventListener robuste pour l'archivage en cascade avec Gedmo SoftDelete
 * 
 * ✅ Avantages:
 * - Automatique: Pas besoin de code manuel dans les contrôleurs
 * - Consistant: Impossible d'oublier l'archivage d'une relation
 * - Centralisé: Une seule classe gère toutes les cascades
 * - Réversible: Gère aussi la restauration automatique
 * 
 * 📝 Maintenabilité:
 * - Configuration centralisée des entités à archiver
 * - Logs détaillés pour debugging
 * - Gestion d'erreurs robuste
 */
#[AsEntityListener(event: Events::preUpdate, entity: User::class)]
#[AsEntityListener(event: Events::postUpdate, entity: User::class)]
class SoftDeleteCascadeListener
{
    /**
     * ✅ CONFIGURATION CENTRALISÉE
     * Pour ajouter une nouvelle entité: ajouter la classe dans ce tableau
     * Format: entityClass => userField(s) - peut être string ou array pour plusieurs champs
     */
    private const RELATED_ENTITIES = [
        Reservation::class => 'user',
        Document::class => ['user', 'uploadedBy'], // ✅ Gestion des deux relations User
        Notification::class => 'user',
        VehicleRental::class => 'user',  // ✅ Activé
        Invoice::class => 'user',        // ✅ Activé
    ];

    private array $scheduledOperations = [];

    public function __construct(
        private LoggerInterface $logger
    ) {}

    /**
     * Détecter les changements de statut soft-delete
     */
    public function preUpdate(User $user, PreUpdateEventArgs $args): void
    {
        if (!$args->hasChangedField('deletedAt')) {
            return;
        }

        $oldDeletedAt = $args->getOldValue('deletedAt');
        $newDeletedAt = $args->getNewValue('deletedAt');
        
        // User supprimé (null → DateTime)
        if ($oldDeletedAt === null && $newDeletedAt !== null) {
            $this->scheduleOperation($user, 'cascade_delete', $newDeletedAt);
            
            $this->logger->info('🗑️ User soft-deleted, scheduling cascade deletion', [
                'userId' => $user->getId(),
                'userEmail' => $user->getEmail(),
                'deletedAt' => $newDeletedAt->format('Y-m-d H:i:s')
            ]);
        }
        
        // User restauré (DateTime → null)
        if ($oldDeletedAt !== null && $newDeletedAt === null) {
            $this->scheduleOperation($user, 'cascade_restore', null);
            
            $this->logger->info('🔄 User restored, scheduling cascade restoration', [
                'userId' => $user->getId(),
                'userEmail' => $user->getEmail()
            ]);
        }
    }

    /**
     * Exécuter les opérations programmées
     */
    public function postUpdate(User $user, PostUpdateEventArgs $args): void
    {
        $userId = $user->getId();
        
        if (!isset($this->scheduledOperations[$userId])) {
            return;
        }

        $operation = $this->scheduledOperations[$userId];
        
        try {
            if ($operation['type'] === 'cascade_delete') {
                $this->executeCascadeDelete($user, $operation['deletedAt'], $args->getObjectManager());
            } elseif ($operation['type'] === 'cascade_restore') {
                $this->executeCascadeRestore($user, $args->getObjectManager());
            }
        } catch (\Exception $e) {
            $this->logger->error('❌ Cascade operation failed', [
                'userId' => $userId,
                'operation' => $operation['type'],
                'error' => $e->getMessage()
            ]);
            throw $e;
        } finally {
            // Nettoyer l'opération programmée
            unset($this->scheduledOperations[$userId]);
        }
    }

    /**
     * Programmer une opération
     */
    private function scheduleOperation(User $user, string $type, ?\DateTimeInterface $deletedAt): void
    {
        $this->scheduledOperations[$user->getId()] = [
            'type' => $type,
            'deletedAt' => $deletedAt,
            'user' => $user
        ];
    }

    /**
     * ✅ Exécuter l'archivage en cascade
     */
    private function executeCascadeDelete(User $user, \DateTimeInterface $deletedAt, $entityManager): void
    {
        $this->withoutSoftDeleteFilter($entityManager, function() use ($user, $deletedAt, $entityManager) {
            $totalArchived = 0;
            
            foreach (self::RELATED_ENTITIES as $entityClass => $userFields) {
                $archived = $this->archiveRelatedEntities($entityClass, $userFields, $user, $deletedAt, $entityManager);
                $totalArchived += $archived;
                
                $this->logger->debug("📦 Archived {$archived} {$entityClass} entities");
            }
            
            if ($totalArchived > 0) {
                $entityManager->flush();
            }
            
            $this->logger->info('✅ Cascade deletion completed', [
                'userId' => $user->getId(),
                'totalArchived' => $totalArchived,
                'entitiesTypes' => array_keys(self::RELATED_ENTITIES)
            ]);
        });
    }

    /**
     * ✅ Exécuter la restauration en cascade
     */
    private function executeCascadeRestore(User $user, $entityManager): void
    {
        $this->withoutSoftDeleteFilter($entityManager, function() use ($user, $entityManager) {
            $totalRestored = 0;
            
            foreach (self::RELATED_ENTITIES as $entityClass => $userFields) {
                $restored = $this->restoreRelatedEntities($entityClass, $userFields, $user, $entityManager);
                $totalRestored += $restored;
                
                $this->logger->debug("🔄 Restored {$restored} {$entityClass} entities");
            }
            
            if ($totalRestored > 0) {
                $entityManager->flush();
            }
            
            $this->logger->info('✅ Cascade restoration completed', [
                'userId' => $user->getId(),
                'totalRestored' => $totalRestored,
                'entitiesTypes' => array_keys(self::RELATED_ENTITIES)
            ]);
        });
    }

    /**
     * Archiver les entités liées d'un type donné
     * @param string|array $userFields Un champ ou un tableau de champs pointant vers User
     */
    private function archiveRelatedEntities(string $entityClass, $userFields, User $user, \DateTimeInterface $deletedAt, $entityManager): int
    {
        // Normaliser en tableau
        $fields = is_array($userFields) ? $userFields : [$userFields];
        $allEntities = [];
        
        // Pour chaque champ User, récupérer les entités liées
        foreach ($fields as $userField) {
            $entities = $entityManager->getRepository($entityClass)
                ->createQueryBuilder('e')
                ->where("e.{$userField} = :user")
                ->andWhere('e.deletedAt IS NULL') // Seulement les actives
                ->setParameter('user', $user)
                ->getQuery()
                ->getResult();
            
            $allEntities = array_merge($allEntities, $entities);
        }
        
        // Supprimer les doublons (si une entité a plusieurs relations vers le même user)
        $uniqueEntities = [];
        foreach ($allEntities as $entity) {
            $key = $entityClass . '_' . $entity->getId();
            $uniqueEntities[$key] = $entity;
        }

        foreach ($uniqueEntities as $entity) {
            // ✅ SOFT DELETE
            $entity->setDeletedAt($deletedAt);
            
            // ✅ CHANGEMENT DE STATUT SPÉCIFIQUE POUR LES RÉSERVATIONS
            if ($entity instanceof Reservation) {
                $this->updateReservationStatus($entity);
            }
            
            $entityManager->persist($entity);
        }

        return count($uniqueEntities);
    }

    /**
     * Restaurer les entités liées d'un type donné
     * @param string|array $userFields Un champ ou un tableau de champs pointant vers User
     */
    private function restoreRelatedEntities(string $entityClass, $userFields, User $user, $entityManager): int
    {
        // Normaliser en tableau
        $fields = is_array($userFields) ? $userFields : [$userFields];
        $allEntities = [];
        
        // Pour chaque champ User, récupérer les entités liées
        foreach ($fields as $userField) {
            $entities = $entityManager->getRepository($entityClass)
                ->createQueryBuilder('e')
                ->where("e.{$userField} = :user")
                ->andWhere('e.deletedAt IS NOT NULL') // Seulement les supprimées
                ->setParameter('user', $user)
                ->getQuery()
                ->getResult();
            
            $allEntities = array_merge($allEntities, $entities);
        }
        
        // Supprimer les doublons (si une entité a plusieurs relations vers le même user)
        $uniqueEntities = [];
        foreach ($allEntities as $entity) {
            $key = $entityClass . '_' . $entity->getId();
            $uniqueEntities[$key] = $entity;
        }

        foreach ($uniqueEntities as $entity) {
            // ✅ SOFT DELETE RESTORE
            $entity->setDeletedAt(null);
            
            // ✅ RESTAURER LE STATUT POUR LES RÉSERVATIONS
            if ($entity instanceof Reservation) {
                $this->restoreReservationStatus($entity);
            }
            
            $entityManager->persist($entity);
        }

        return count($uniqueEntities);
    }

    /**
     * Exécuter une fonction avec le filtre Gedmo désactivé
     */
    private function withoutSoftDeleteFilter($entityManager, callable $callback): void
    {
        $filters = $entityManager->getFilters();
        $wasEnabled = $filters->isEnabled('softdeleteable');
        
        if ($wasEnabled) {
            $filters->disable('softdeleteable');
        }

        try {
            $callback();
        } finally {
            if ($wasEnabled) {
                $filters->enable('softdeleteable');
            }
        }
    }

    /**
     * ✅ Changer le statut d'une réservation quand l'utilisateur est archivé
     */
    private function updateReservationStatus(Reservation $reservation): void
    {
        $currentStatus = $reservation->getStatus();
        
        // Sauvegarder le statut original pour restauration
        if (!$reservation->getOriginalStatus()) {
            $reservation->setOriginalStatus($currentStatus);
        }
        
        // Changer vers un statut suspendu/annulé selon le statut actuel
        $newStatus = match($currentStatus) {
            'pending', ReservationStatus::SUBMITTED => ReservationStatus::SUSPENDED,
            'confirmed', ReservationStatus::CONFIRMED => ReservationStatus::SUSPENDED,
            'completed', ReservationStatus::COMPLETED => ReservationStatus::USER_ARCHIVED, // Nouveau statut spécial
            default => ReservationStatus::CANCELLED,
        };
        
        $reservation->setStatus($newStatus);
        
        $this->logger->info('📝 Reservation status updated due to user archiving', [
            'reservationId' => $reservation->getId(),
            'oldStatus' => $currentStatus,
            'newStatus' => $newStatus
        ]);
    }

    /**
     * ✅ Restaurer le statut d'une réservation quand l'utilisateur est restauré
     */
    private function restoreReservationStatus(Reservation $reservation): void
    {
        $originalStatus = $reservation->getOriginalStatus();
        
        if ($originalStatus) {
            $currentStatus = $reservation->getStatus();
            $reservation->setStatus($originalStatus);
            $reservation->setOriginalStatus(null); // Nettoyer le statut sauvegardé
            
            $this->logger->info('🔄 Reservation status restored after user restoration', [
                'reservationId' => $reservation->getId(),
                'restoredStatus' => $originalStatus,
                'previousStatus' => $currentStatus
            ]);
        }
    }
}