<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250729073248 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Migration complète de ExamCenter vers Center unifiée - Suppression définitive de la table exam_center';
    }

    public function up(Schema $schema): void
    {
        // Les centres d'examen sont déjà dans la table center avec type='exam'
        // Il faut juste supprimer l'ancienne table exam_center
        // Les formules pointent déjà vers les bons IDs car ils sont identiques
        
        // Vérification que les formules sont bien liées (les IDs sont identiques entre center et exam_center)
        $this->addSql('-- Suppression de la table exam_center devenue obsolète');
        $this->addSql('DROP TABLE exam_center');
    }

    public function down(Schema $schema): void
    {
        // Recréer la table exam_center en cas de rollback
        $this->addSql('CREATE TABLE exam_center (
            id INT AUTO_INCREMENT NOT NULL, 
            name VARCHAR(255) NOT NULL, 
            code VARCHAR(100) NOT NULL, 
            city VARCHAR(255) NOT NULL, 
            department_code VARCHAR(10) NOT NULL, 
            address LONGTEXT DEFAULT NULL, 
            is_active TINYINT(1) NOT NULL, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Réinsérer les données depuis center
        $this->addSql('INSERT INTO exam_center (id, name, code, city, department_code, address, is_active, created_at, updated_at)
            SELECT id, name, code, city, department_code, address, is_active, created_at, updated_at 
            FROM center WHERE type = \'exam\' OR type = \'both\'');
    }
}
