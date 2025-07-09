<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250706204534 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les champs pastilles personnalisables aux formations (taux de réussite, nombre d\'élèves min/max)';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE formation ADD success_rate INT DEFAULT NULL, ADD min_students INT DEFAULT NULL, ADD max_students INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE formation DROP success_rate, DROP min_students, DROP max_students');
    }
}
