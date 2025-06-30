<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250629171444 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create Center table, migrate ExamCenter data, and add default formation centers';
    }

    public function up(Schema $schema): void
    {
        // Create new center table
        $this->addSql('CREATE TABLE center (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL, type VARCHAR(50) NOT NULL, city VARCHAR(255) NOT NULL, department_code VARCHAR(10) NOT NULL, address LONGTEXT DEFAULT NULL, phone VARCHAR(15) DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, is_active TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Migrate data from exam_center to center (if exam_center exists)
        $this->addSql('INSERT INTO center (id, name, code, type, city, department_code, address, phone, email, is_active, created_at, updated_at)
                      SELECT id, name, code, \'exam\' as type, city, department_code, address, NULL as phone, NULL as email, is_active, created_at, updated_at 
                      FROM exam_center 
                      WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = \'exam_center\')');
        
        // Update formula table to reference center instead of exam_center
        $this->addSql('ALTER TABLE formula DROP FOREIGN KEY FK_67315881E6A1F62E');
        $this->addSql('ALTER TABLE formula ADD CONSTRAINT FK_67315881E6A1F62E FOREIGN KEY (exam_center_id) REFERENCES center (id)');
        
        // Add center_id column to session table
        $this->addSql('ALTER TABLE session ADD center_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D45932F377 FOREIGN KEY (center_id) REFERENCES center (id)');
        $this->addSql('CREATE INDEX IDX_D044D5D45932F377 ON session (center_id)');
        
        // Add default formation centers
        $this->addSql("INSERT INTO center (name, code, type, city, department_code, address, is_active, created_at, updated_at) VALUES 
            ('Centre de Formation Merel - Rennes', 'CF-REN-01', 'formation', 'RENNES', '35', '7 RUE Georges Maillols, 35000 RENNES', 1, NOW(), NOW()),
            ('Salle de Formation A', 'CF-REN-02', 'formation', 'RENNES', '35', 'Centre de formation - Salle A', 1, NOW(), NOW()),
            ('Salle de Formation B', 'CF-REN-03', 'formation', 'RENNES', '35', 'Centre de formation - Salle B', 1, NOW(), NOW()),
            ('Parking Examen Rennes', 'PE-REN-01', 'both', 'RENNES', '35', 'Parking d\'examen - Rennes', 1, NOW(), NOW())");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE formula DROP FOREIGN KEY FK_67315881E6A1F62E');
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D45932F377');
        $this->addSql('DROP TABLE center');
        $this->addSql('ALTER TABLE formula DROP FOREIGN KEY FK_67315881E6A1F62E');
        $this->addSql('ALTER TABLE formula ADD CONSTRAINT FK_67315881E6A1F62E FOREIGN KEY (exam_center_id) REFERENCES exam_center (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('DROP INDEX IDX_D044D5D45932F377 ON session');
        $this->addSql('ALTER TABLE session DROP center_id');
    }
}
