<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table formula
 */
final class Version20250130120001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create formula table';
    }

    public function up(Schema $schema): void
    {
        // Créer la table formula
        $this->addSql('CREATE TABLE formula (
            id INT AUTO_INCREMENT NOT NULL, 
            exam_center_id INT NOT NULL, 
            name VARCHAR(255) NOT NULL, 
            description LONGTEXT NOT NULL, 
            price NUMERIC(10, 2) DEFAULT NULL, 
            type VARCHAR(20) NOT NULL, 
            is_active TINYINT(1) NOT NULL DEFAULT 1, 
            additional_info LONGTEXT DEFAULT NULL, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            PRIMARY KEY(id),
            INDEX IDX_formula_exam_center (exam_center_id),
            INDEX IDX_formula_type (type),
            INDEX IDX_formula_active (is_active),
            INDEX IDX_formula_price (price),
            CONSTRAINT FK_formula_exam_center FOREIGN KEY (exam_center_id) REFERENCES exam_center (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE formula DROP FOREIGN KEY FK_formula_exam_center');
        $this->addSql('DROP TABLE formula');
    }
}