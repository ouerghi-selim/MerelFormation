<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration simple pour ajouter le suivi des réservations de véhicules
 */
final class Version20250526193000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add tracking token and notes fields to vehicle_rental table';
    }

    public function up(Schema $schema): void
    {
        // Ajout des nouvelles colonnes seulement
        $this->addSql('ALTER TABLE vehicle_rental ADD tracking_token VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD admin_notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD updated_at DATETIME DEFAULT NULL');
        
        // Index unique sur le token de suivi après génération manuelle
        $this->addSql('CREATE UNIQUE INDEX UNIQ_vehicle_rental_tracking_token ON vehicle_rental (tracking_token)');
    }

    public function down(Schema $schema): void
    {
        // Suppression des colonnes ajoutées
        $this->addSql('DROP INDEX UNIQ_vehicle_rental_tracking_token ON vehicle_rental');
        $this->addSql('ALTER TABLE vehicle_rental DROP tracking_token');
        $this->addSql('ALTER TABLE vehicle_rental DROP notes');
        $this->addSql('ALTER TABLE vehicle_rental DROP admin_notes');
        $this->addSql('ALTER TABLE vehicle_rental DROP updated_at');
    }
}