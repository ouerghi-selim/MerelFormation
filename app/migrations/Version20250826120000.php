<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les nouveaux identifiants CMS de la page d'accueil
 */
final class Version20250826120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter les nouveaux identifiants CMS pour la page d\'accueil (fonctionnalités services, liens d\'action, images)';
    }

    public function up(Schema $schema): void
    {
        // Ajout des identifiants CMS pour les images
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('home_hero_image_url', 'Image Principale - URL', '/assets/images/hero/classroom.jpg', 'home_hero', 'image_url', 1, 6, NOW(), NOW()),
            ('home_hero_image_alt', 'Image Principale - Alt', 'Formation taxi professionnelle - Salle de classe avec étudiants', 'home_hero', 'image_alt', 1, 7, NOW(), NOW())
        ");

        // Ajout des identifiants CMS pour les fonctionnalités des services
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('service_formation_feature_1', 'Formation - Caractéristique 1', 'Formation initiale de 140h', 'home_services', 'text', 1, 9, NOW(), NOW()),
            ('service_formation_feature_2', 'Formation - Caractéristique 2', 'Formation continue', 'home_services', 'text', 1, 10, NOW(), NOW()),
            ('service_formation_feature_3', 'Formation - Caractéristique 3', 'Certification officielle', 'home_services', 'text', 1, 11, NOW(), NOW()),
            ('service_location_feature_1', 'Location - Caractéristique 1', 'Entretien inclus', 'home_services', 'text', 1, 12, NOW(), NOW()),
            ('service_location_feature_2', 'Location - Caractéristique 2', 'Assurance professionnelle', 'home_services', 'text', 1, 13, NOW(), NOW()),
            ('service_planning_feature_1', 'Planning - Caractéristique 1', 'Horaires adaptés', 'home_services', 'text', 1, 14, NOW(), NOW()),
            ('service_planning_feature_2', 'Planning - Caractéristique 2', 'Support personnalisé', 'home_services', 'text', 1, 15, NOW(), NOW())
        ");

        // Ajout des identifiants CMS pour les liens d'action des services
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('service_formation_link_text', 'Formation - Texte du lien', 'En savoir plus', 'home_services', 'button_text', 1, 16, NOW(), NOW()),
            ('service_location_link_text', 'Location - Texte du lien', 'Découvrir les véhicules', 'home_services', 'button_text', 1, 17, NOW(), NOW()),
            ('service_planning_link_text', 'Planning - Texte du lien', 'Voir le planning', 'home_services', 'button_text', 1, 18, NOW(), NOW())
        ");
    }

    public function down(Schema $schema): void
    {
        // Suppression des identifiants ajoutés
        $this->addSql("DELETE FROM content_text WHERE identifier IN (
            'home_hero_image_url', 'home_hero_image_alt',
            'service_formation_feature_1', 'service_formation_feature_2', 'service_formation_feature_3',
            'service_location_feature_1', 'service_location_feature_2',
            'service_planning_feature_1', 'service_planning_feature_2',
            'service_formation_link_text', 'service_location_link_text', 'service_planning_link_text'
        )");
    }
}