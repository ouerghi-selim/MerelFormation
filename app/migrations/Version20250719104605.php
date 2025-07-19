<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250719104605 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE document ADD validated_by INT DEFAULT NULL, ADD validation_status VARCHAR(20) NOT NULL, ADD validated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', ADD rejection_reason LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76F54EF1C FOREIGN KEY (validated_by) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_D8698A76F54EF1C ON document (validated_by)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76F54EF1C');
        $this->addSql('DROP INDEX IDX_D8698A76F54EF1C ON document');
        $this->addSql('ALTER TABLE document DROP validated_by, DROP validation_status, DROP validated_at, DROP rejection_reason');
    }
}
