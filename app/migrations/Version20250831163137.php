<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250831163137 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Location services CMS content for location page';
    }

    public function up(Schema $schema): void
    {
        // Ajouter les contenus CMS pour les sections Location et Location avec préparation à l'examen
        
        // Section Location simple
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_simple_title', 'Titre section Location simple', 'Location', 'location_services', 'title', 10, 1, NOW(), NOW()),
            ('location_simple_description', 'Description section Location simple', 'Louez un véhicule équipé pour vos besoins personnels ou professionnels.', 'location_services', 'paragraph', 11, 1, NOW(), NOW()),
            ('location_simple_feature_1', 'Caractéristique 1 Location simple', 'Véhicules récents et entretenus', 'location_services', 'feature', 12, 1, NOW(), NOW()),
            ('location_simple_feature_2', 'Caractéristique 2 Location simple', 'Assurance tous risques incluse', 'location_services', 'feature', 13, 1, NOW(), NOW()),
            ('location_simple_feature_3', 'Caractéristique 3 Location simple', 'Tarifs dégressifs selon la durée', 'location_services', 'feature', 14, 1, NOW(), NOW()),
            ('location_simple_feature_4', 'Caractéristique 4 Location simple', 'Service disponible 7j/7', 'location_services', 'feature', 15, 1, NOW(), NOW())");

        // Section Location avec préparation à l'examen
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_exam_prep_title', 'Titre section Location avec préparation', 'Location avec préparation à l\'examen', 'location_services', 'title', 20, 1, NOW(), NOW()),
            ('location_exam_prep_description', 'Description section Location avec préparation', 'Préparez-vous efficacement à l\'examen avec un véhicule et un accompagnement personnalisé.', 'location_services', 'paragraph', 21, 1, NOW(), NOW()),
            ('location_exam_prep_feature_1', 'Caractéristique 1 Location avec préparation', 'Véhicule d\'examen équipé double commande', 'location_services', 'feature', 22, 1, NOW(), NOW()),
            ('location_exam_prep_feature_2', 'Caractéristique 2 Location avec préparation', 'Accompagnement par un instructeur qualifié', 'location_services', 'feature', 23, 1, NOW(), NOW()),
            ('location_exam_prep_feature_3', 'Caractéristique 3 Location avec préparation', 'Simulation des conditions d\'examen', 'location_services', 'feature', 24, 1, NOW(), NOW()),
            ('location_exam_prep_feature_4', 'Caractéristique 4 Location avec préparation', 'Support pédagogique inclus', 'location_services', 'feature', 25, 1, NOW(), NOW())");
    }

    public function down(Schema $schema): void
    {
        // Supprimer les contenus CMS ajoutés
        $this->addSql("DELETE FROM content_text WHERE identifier IN (
            'location_simple_title', 'location_simple_description', 'location_simple_feature_1', 'location_simple_feature_2', 'location_simple_feature_3', 'location_simple_feature_4',
            'location_exam_prep_title', 'location_exam_prep_description', 'location_exam_prep_feature_1', 'location_exam_prep_feature_2', 'location_exam_prep_feature_3', 'location_exam_prep_feature_4'
        )");
    }
}
