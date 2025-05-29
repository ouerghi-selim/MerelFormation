<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table exam_center
 */
final class Version20250130120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create exam_center table';
    }

    public function up(Schema $schema): void
    {
        // Créer la table exam_center
        $this->addSql('CREATE TABLE exam_center (
            id INT AUTO_INCREMENT NOT NULL, 
            name VARCHAR(255) NOT NULL, 
            code VARCHAR(100) NOT NULL, 
            city VARCHAR(255) NOT NULL, 
            department_code VARCHAR(10) NOT NULL, 
            address LONGTEXT DEFAULT NULL, 
            is_active TINYINT(1) NOT NULL DEFAULT 1, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            PRIMARY KEY(id),
            UNIQUE INDEX UNIQ_exam_center_code (code),
            INDEX IDX_exam_center_active (is_active),
            INDEX IDX_exam_center_city (city)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE exam_center');
    }
}