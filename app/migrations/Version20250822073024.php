<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250822073024 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE document ADD deleted_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE formation ADD deleted_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE notification ADD deleted_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE reservation DROP archive_reason, CHANGE archived_at deleted_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE document DROP deleted_at');
        $this->addSql('ALTER TABLE formation DROP deleted_at');
        $this->addSql('ALTER TABLE notification DROP deleted_at');
        $this->addSql('ALTER TABLE reservation ADD archive_reason VARCHAR(50) DEFAULT NULL, CHANGE deleted_at archived_at DATETIME DEFAULT NULL');
    }
}
