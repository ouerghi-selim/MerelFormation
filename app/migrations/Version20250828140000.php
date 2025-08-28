<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les informations légales contact et les éléments footer CMS
 */
final class Version20250828140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter les informations légales contact et les éléments footer CMS';
    }

    public function up(Schema $schema): void
    {
        // Ajout des informations légales détaillées pour la page contact
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('contact_legal_company_name', 'Nom de l\'entreprise', 'MEREL TAXI', 'contact_legal', 'text', 1, 20, NOW(), NOW()),
            ('contact_legal_siret', 'Numéro SIRET', 'Siret : 800484222', 'contact_legal', 'text', 1, 21, NOW(), NOW()),
            ('contact_legal_agreement_35', 'Agrément préfectorale 35', 'N° Agrément préfectorale 35: 23-002 23-003', 'contact_legal', 'text', 1, 22, NOW(), NOW()),
            ('contact_legal_agreement_22', 'Agrément préfectorale 22', 'N° Agrément préfectorale 22: 22-2023-04-21-00002', 'contact_legal', 'text', 1, 23, NOW(), NOW()),
            ('contact_legal_agreement_56', 'Agrément préfectorale 56', 'N° Agrément préfectorale 56: 2023/56/02', 'contact_legal', 'text', 1, 24, NOW(), NOW()),
            ('contact_legal_agreement_44', 'Agrément préfectorale 44', 'N° Agrément préfectorale 44: 44/23/002', 'contact_legal', 'text', 1, 25, NOW(), NOW())
        ");

        // Ajout des informations de médiation
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('contact_mediation_center_name', 'Nom du centre de médiation', 'Centre de la Médiation et de la Consommation des Conciliateurs de Justice (CM2C)', 'contact_legal', 'text', 1, 26, NOW(), NOW()),
            ('contact_mediation_address', 'Adresse médiation', '14 rue Saint Jean – 75017 Paris', 'contact_legal', 'text', 1, 27, NOW(), NOW()),
            ('contact_mediation_email', 'Email médiation', 'cm2c@cm2c.net', 'contact_legal', 'text', 1, 28, NOW(), NOW()),
            ('contact_mediation_website', 'Site web médiation', 'https://cm2c.net', 'contact_legal', 'text', 1, 29, NOW(), NOW())
        ");

        // Ajout des éléments footer
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('footer_newsletter_title', 'Titre newsletter', 'Restez informé', 'footer', 'title', 1, 30, NOW(), NOW()),
            ('footer_newsletter_description', 'Description newsletter', 'Recevez nos actualités et dates de sessions.', 'footer', 'text', 1, 31, NOW(), NOW()),
            ('footer_newsletter_placeholder', 'Placeholder email', 'Votre adresse email', 'footer', 'text', 1, 32, NOW(), NOW()),
            ('footer_agreements', 'Agréments footer', 'Agréments préfectoraux: 35, 22, 56, 44', 'footer', 'text', 1, 33, NOW(), NOW())
        ");

        // Ajout des coordonnées footer
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('footer_contact_title', 'Titre contact footer', 'Contactez-nous', 'footer', 'title', 1, 34, NOW(), NOW()),
            ('footer_contact_email', 'Email footer', 'contact@merelformation.fr', 'footer', 'text', 1, 35, NOW(), NOW()),
            ('footer_contact_phone', 'Téléphone footer', '07 60 86 11 09', 'footer', 'text', 1, 36, NOW(), NOW()),
            ('footer_contact_address', 'Adresse footer', '7 RUE Georges Maillols, 35000 RENNES', 'footer', 'text', 1, 37, NOW(), NOW()),
            ('footer_hours_title', 'Titre horaires footer', 'Horaires', 'footer', 'title', 1, 38, NOW(), NOW()),
            ('footer_hours_days', 'Jours ouverture', 'Lundi - Vendredi', 'footer', 'text', 1, 39, NOW(), NOW()),
            ('footer_hours_time', 'Heures ouverture', '8h30 - 12h00 | 13h00 - 16h30', 'footer', 'text', 1, 40, NOW(), NOW()),
            ('footer_social_title', 'Titre réseaux sociaux', 'Suivez-nous', 'footer', 'title', 1, 41, NOW(), NOW())
        ");
    }

    public function down(Schema $schema): void
    {
        // Suppression des identifiants ajoutés
        $this->addSql("DELETE FROM content_text WHERE identifier IN (
            'contact_legal_company_name', 'contact_legal_siret', 
            'contact_legal_agreement_35', 'contact_legal_agreement_22', 'contact_legal_agreement_56', 'contact_legal_agreement_44',
            'contact_mediation_center_name', 'contact_mediation_address', 'contact_mediation_email', 'contact_mediation_website',
            'footer_newsletter_title', 'footer_newsletter_description', 'footer_newsletter_placeholder', 'footer_agreements',
            'footer_contact_title', 'footer_contact_email', 'footer_contact_phone', 'footer_contact_address',
            'footer_hours_title', 'footer_hours_days', 'footer_hours_time', 'footer_social_title'
        )");
    }
}