<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les fonctionnalités de suivi des réservations de véhicules
 */
final class Version20250526190400 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add tracking token and exam-related fields to vehicle_rental table';
    }

    public function up(Schema $schema): void
    {
        // Ajout des nouvelles colonnes pour le suivi
        $this->addSql('ALTER TABLE vehicle_rental ADD tracking_token VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD is_exam_rental TINYINT(1) DEFAULT 0');
        $this->addSql('ALTER TABLE vehicle_rental ADD exam_date DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD admin_notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD updated_at DATETIME DEFAULT NULL');
        
        // Index unique sur le token de suivi
        $this->addSql('CREATE UNIQUE INDEX UNIQ_vehicle_rental_tracking_token ON vehicle_rental (tracking_token)');
        
        // Génération de tokens pour les réservations existantes
        $this->addSql("UPDATE vehicle_rental SET tracking_token = CONCAT('track_', id, '_', SUBSTRING(MD5(CONCAT(id, customer_email, created_at)), 1, 8)) WHERE tracking_token IS NULL");
        
        // Rendre le tracking_token obligatoire après avoir généré les tokens
        $this->addSql('ALTER TABLE vehicle_rental MODIFY tracking_token VARCHAR(64) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // Suppression des colonnes ajoutées
        $this->addSql('DROP INDEX UNIQ_vehicle_rental_tracking_token ON vehicle_rental');
        $this->addSql('ALTER TABLE vehicle_rental DROP tracking_token');
        $this->addSql('ALTER TABLE vehicle_rental DROP is_exam_rental');
        $this->addSql('ALTER TABLE vehicle_rental DROP exam_date');
        $this->addSql('ALTER TABLE vehicle_rental DROP notes');
        $this->addSql('ALTER TABLE vehicle_rental DROP admin_notes');
        $this->addSql('ALTER TABLE vehicle_rental DROP updated_at');
    }
}