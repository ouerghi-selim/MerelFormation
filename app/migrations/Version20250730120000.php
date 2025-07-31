<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour corriger les anciens statuts 'pending' vers 'submitted'
 */
final class Version20250730120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Migrer les anciens statuts "pending" vers "submitted" pour les réservations véhicules';
    }

    public function up(Schema $schema): void
    {
        // Migrer les réservations véhicules avec statut 'pending' vers 'submitted'
        $this->addSql("UPDATE vehicle_rental SET status = 'submitted' WHERE status = 'pending'");
        
        // Note: Les réservations de formations utilisent déjà les bons statuts
    }

    public function down(Schema $schema): void
    {
        // Rollback: remettre les statuts 'submitted' vers 'pending'
        // Attention: seulement pour les réservations qui étaient 'pending' avant
        $this->addSql("UPDATE vehicle_rental SET status = 'pending' WHERE status = 'submitted' AND created_at < NOW() - INTERVAL 1 DAY");
    }
}