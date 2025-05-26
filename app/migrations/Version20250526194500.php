<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration simplifiée pour le suivi des réservations de véhicules
 */
final class Version20250526194500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add tracking token and notes fields to vehicle_rental table (simplified)';
    }

    public function up(Schema $schema): void
    {
        // Ajout simple des nouvelles colonnes
        $this->addSql('ALTER TABLE vehicle_rental ADD tracking_token VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD admin_notes LONGTEXT DEFAULT NULL'); 
        $this->addSql('ALTER TABLE vehicle_rental ADD updated_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE vehicle_rental DROP tracking_token');
        $this->addSql('ALTER TABLE vehicle_rental DROP notes');
        $this->addSql('ALTER TABLE vehicle_rental DROP admin_notes');
        $this->addSql('ALTER TABLE vehicle_rental DROP updated_at');
    }
}