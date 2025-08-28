<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les caractéristiques véhicule CMS dans LocationPage
 */
final class Version20250828120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter les caractéristiques véhicule et image CMS pour la page location';
    }

    public function up(Schema $schema): void
    {
        // Ajout des caractéristiques du véhicule
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('location_vehicle_feature_1', 'Caractéristique véhicule 1', 'Boîte automatique', 'location_vehicles', 'text', 1, 10, NOW(), NOW()),
            ('location_vehicle_feature_2', 'Caractéristique véhicule 2', 'Équipements taxi obligatoires', 'location_vehicles', 'text', 1, 11, NOW(), NOW()),
            ('location_vehicle_feature_3', 'Caractéristique véhicule 3', 'Système auto-école (double commande)', 'location_vehicles', 'text', 1, 12, NOW(), NOW()),
            ('location_vehicle_feature_4', 'Caractéristique véhicule 4', '3 rétroviseurs supplémentaires', 'location_vehicles', 'text', 1, 13, NOW(), NOW()),
            ('location_vehicle_feature_5', 'Caractéristique véhicule 5', 'Module électrique', 'location_vehicles', 'text', 1, 14, NOW(), NOW())
        ");

        // Ajout de l'image véhicule et son alt text
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, is_active, sort_order, created_at, updated_at) VALUES 
            ('location_vehicle_image_alt', 'Image véhicule - Alt text', 'Volkswagen Touran équipé taxi', 'location_vehicles', 'image_alt', 1, 15, NOW(), NOW()),
            ('location_vehicle_image', 'Image véhicule (Upload)', '/assets/images/pages/taxi-car.png', 'location_vehicles', 'image_upload', 1, 16, NOW(), NOW())
        ");
    }

    public function down(Schema $schema): void
    {
        // Suppression des identifiants ajoutés
        $this->addSql("DELETE FROM content_text WHERE identifier IN (
            'location_vehicle_feature_1', 'location_vehicle_feature_2', 'location_vehicle_feature_3',
            'location_vehicle_feature_4', 'location_vehicle_feature_5',
            'location_vehicle_image_alt', 'location_vehicle_image'
        )");
    }
}