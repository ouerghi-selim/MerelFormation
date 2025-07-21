<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250721214357 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Migrer les statuts "pending" vers "submitted" pour les nouvelles inscriptions';
    }

    public function up(Schema $schema): void
    {
        // Migrer toutes les réservations avec le statut 'pending' vers 'submitted'
        // Cela assure la cohérence avec le nouveau système de statuts
        $this->addSql("UPDATE reservation SET status = 'submitted' WHERE status = 'pending'");
    }

    public function down(Schema $schema): void
    {
        // Revenir au statut 'pending' si nécessaire
        $this->addSql("UPDATE reservation SET status = 'pending' WHERE status = 'submitted'");
    }
}
