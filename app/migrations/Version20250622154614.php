<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250622154614 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE practical_info (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, image VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_C8C258775200282E (formation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE practical_item (id INT AUTO_INCREMENT NOT NULL, practical_info_id INT NOT NULL, content LONGTEXT NOT NULL, icon VARCHAR(100) NOT NULL, `order` INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_1C504C3E30F7CFED (practical_info_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE practical_info ADD CONSTRAINT FK_C8C258775200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE practical_item ADD CONSTRAINT FK_1C504C3E30F7CFED FOREIGN KEY (practical_info_id) REFERENCES practical_info (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE practical_info DROP FOREIGN KEY FK_C8C258775200282E');
        $this->addSql('ALTER TABLE practical_item DROP FOREIGN KEY FK_1C504C3E30F7CFED');
        $this->addSql('DROP TABLE practical_info');
        $this->addSql('DROP TABLE practical_item');
    }
}
