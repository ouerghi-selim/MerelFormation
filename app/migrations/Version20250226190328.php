<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250226190328 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE module (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, title VARCHAR(255) NOT NULL, duration INT NOT NULL, INDEX IDX_C2426285200282E (formation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE module_point (id INT AUTO_INCREMENT NOT NULL, module_id INT NOT NULL, content VARCHAR(255) NOT NULL, INDEX IDX_BEA9834AAFC2B591 (module_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE prerequisite (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, content VARCHAR(255) NOT NULL, INDEX IDX_4594A2385200282E (formation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE module ADD CONSTRAINT FK_C2426285200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE module_point ADD CONSTRAINT FK_BEA9834AAFC2B591 FOREIGN KEY (module_id) REFERENCES module (id)');
        $this->addSql('ALTER TABLE prerequisite ADD CONSTRAINT FK_4594A2385200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE formation DROP prerequisites');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE module DROP FOREIGN KEY FK_C2426285200282E');
        $this->addSql('ALTER TABLE module_point DROP FOREIGN KEY FK_BEA9834AAFC2B591');
        $this->addSql('ALTER TABLE prerequisite DROP FOREIGN KEY FK_4594A2385200282E');
        $this->addSql('DROP TABLE module');
        $this->addSql('DROP TABLE module_point');
        $this->addSql('DROP TABLE prerequisite');
        $this->addSql('ALTER TABLE formation ADD prerequisites LONGTEXT DEFAULT NULL');
    }
}
