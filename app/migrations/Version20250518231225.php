<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250518231225 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE email_template ADD identifier VARCHAR(255) NOT NULL, ADD is_system TINYINT(1) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9C0600CA772E836A ON email_template (identifier)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_9C0600CA772E836A ON email_template');
        $this->addSql('ALTER TABLE email_template DROP identifier, DROP is_system');
    }
}
