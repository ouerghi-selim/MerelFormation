<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add tracking token to vehicle_rental table
 */
final class Version20250526194902 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add tracking_token and admin_notes to vehicle_rental table';
    }

    public function up(Schema $schema): void
    {
        // Vérifier si les colonnes n'existent pas déjà
        $this->addSql('ALTER TABLE vehicle_rental ADD COLUMN tracking_token VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD COLUMN admin_notes LONGTEXT DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BFC7C3AEB46BB896 ON vehicle_rental (tracking_token)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_BFC7C3AEB46BB896 ON vehicle_rental');
        $this->addSql('ALTER TABLE vehicle_rental DROP COLUMN tracking_token');
        $this->addSql('ALTER TABLE vehicle_rental DROP COLUMN admin_notes');
    }
}