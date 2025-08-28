<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour convertir l'image hero en type image_upload pour permettre l'upload direct
 */
final class Version20250826140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convertir home_hero_image_url vers le type image_upload pour permettre l\'upload direct';
    }

    public function up(Schema $schema): void
    {
        // Modifier le type de l'identifiant home_hero_image_url vers image_upload
        $this->addSql("UPDATE content_text SET type = 'image_upload', title = 'Image Principale (Upload)' WHERE identifier = 'home_hero_image_url'");
    }

    public function down(Schema $schema): void
    {
        // Rétablir le type original
        $this->addSql("UPDATE content_text SET type = 'image_url', title = 'Image Principale - URL' WHERE identifier = 'home_hero_image_url'");
    }
}