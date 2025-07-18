<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250714151818 extends AbstractMigration
{ public function getDescription(): string
{
    return 'Ajoute les champs created_at et updated_at à la table email_template';
}

    public function up(Schema $schema): void
    {
        // Ajouter les champs created_at et updated_at avec valeurs par défaut pour les enregistrements existants
        $this->addSql('ALTER TABLE email_template ADD created_at DATETIME NOT NULL DEFAULT NOW(), ADD updated_at DATETIME NOT NULL DEFAULT NOW()');

        // Retirer les valeurs par défaut pour les futurs enregistrements
        $this->addSql('ALTER TABLE email_template ALTER created_at DROP DEFAULT, ALTER updated_at DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE email_template DROP created_at, DROP updated_at');
    }

}
