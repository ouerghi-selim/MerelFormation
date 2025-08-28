<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les éléments contact manquants (boutons, infos entreprise, carte)
 */
final class Version20250828150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter les éléments contact manquants (boutons, infos entreprise, carte)';
    }

    public function up(Schema $schema): void
    {
        // Ajout des éléments d'information entreprise manquants
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('contact_hero_company_info', 'Infos entreprise hero', '<strong>MerelFormation</strong> - 7 RUE Georges Maillols, 35000 RENNES', 'contact_hero', 'text', 1, 42, NOW(), NOW()),
            ('contact_hero_phone_button', 'Bouton téléphone hero', '07 60 86 11 09', 'contact_hero', 'button_text', 1, 43, NOW(), NOW()),
            ('contact_hero_email_button', 'Bouton email hero', 'contact@merelformation.fr', 'contact_hero', 'button_text', 1, 44, NOW(), NOW())
        ");

        // Ajout des éléments d'information contact détaillées
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('contact_info_phone_number', 'Numéro de téléphone (affiché)', '07 60 86 11 09', 'contact_info', 'text', 1, 45, NOW(), NOW())
        ");

        // Ajout des éléments d'information pour la carte
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('contact_map_company_name', 'Nom entreprise carte', 'MerelFormation', 'contact_map', 'text', 1, 46, NOW(), NOW()),
            ('contact_map_company_type', 'Type entreprise carte', 'Centre de formation Taxi', 'contact_map', 'text', 1, 47, NOW(), NOW()),
            ('contact_map_address_street', 'Adresse rue carte', '7 RUE Georges Maillols', 'contact_map', 'text', 1, 48, NOW(), NOW()),
            ('contact_map_address_city', 'Ville carte', '35000 RENNES', 'contact_map', 'text', 1, 49, NOW(), NOW()),
            ('contact_map_phone_link', 'Téléphone lien carte', '07 60 86 11 09', 'contact_map', 'text', 1, 50, NOW(), NOW())
        ");
    }

    public function down(Schema $schema): void
    {
        // Suppression des identifiants ajoutés
        $this->addSql("DELETE FROM content_text WHERE identifier IN (
            'contact_hero_company_info', 'contact_hero_phone_button', 'contact_hero_email_button',
            'contact_info_phone_number',
            'contact_map_company_name', 'contact_map_company_type', 'contact_map_address_street', 
            'contact_map_address_city', 'contact_map_phone_link'
        )");
    }
}