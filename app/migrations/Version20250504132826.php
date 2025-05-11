<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250504132826 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session ADD instructor_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D48C4FC193 FOREIGN KEY (instructor_id) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_D044D5D48C4FC193 ON session (instructor_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D48C4FC193');
        $this->addSql('DROP INDEX IDX_D044D5D48C4FC193 ON session');
        $this->addSql('ALTER TABLE session DROP instructor_id');
    }
}
