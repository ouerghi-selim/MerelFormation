<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les éléments copyright footer
 */
final class Version20250828160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter les éléments copyright et mentions légales du footer';
    }

    public function up(Schema $schema): void
    {
        // Ajout des éléments copyright footer
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('footer_copyright_text', 'Texte copyright', 'MerelFormation. Tous droits réservés.', 'footer', 'text', 1, 51, NOW(), NOW()),
            ('footer_legal_siret', 'SIRET footer', 'SIRET : 800484222', 'footer', 'text', 1, 52, NOW(), NOW()),
            ('footer_legal_agreement', 'Agrément footer', 'N° Agrément préfectorale 35: 23-002 23-003', 'footer', 'text', 1, 53, NOW(), NOW())
        ");
    }

    public function down(Schema $schema): void
    {
        // Suppression des identifiants ajoutés
        $this->addSql("DELETE FROM content_text WHERE identifier IN (
            'footer_copyright_text', 'footer_legal_siret', 'footer_legal_agreement'
        )");
    }
}