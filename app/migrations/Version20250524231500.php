<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Add CMS content management tables
 */
final class Version20250524231500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ContentText, Testimonial and FAQ tables for CMS content management';
    }

    public function up(Schema $schema): void
    {
        // ContentText table
        $this->addSql('CREATE TABLE content_text (
            id INT AUTO_INCREMENT NOT NULL, 
            identifier VARCHAR(255) NOT NULL UNIQUE, 
            title VARCHAR(255) NOT NULL, 
            content LONGTEXT NOT NULL, 
            section VARCHAR(100) NOT NULL, 
            type VARCHAR(50) NOT NULL, 
            is_active TINYINT(1) NOT NULL DEFAULT 1, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            PRIMARY KEY(id),
            INDEX IDX_content_text_section (section),
            INDEX IDX_content_text_type (type),
            INDEX IDX_content_text_active (is_active)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Testimonial table
        $this->addSql('CREATE TABLE testimonial (
            id INT AUTO_INCREMENT NOT NULL, 
            client_name VARCHAR(255) NOT NULL, 
            client_job VARCHAR(255) DEFAULT NULL, 
            client_company VARCHAR(255) DEFAULT NULL, 
            content LONGTEXT NOT NULL, 
            rating INT DEFAULT NULL, 
            formation VARCHAR(255) DEFAULT NULL, 
            client_image VARCHAR(255) DEFAULT NULL, 
            is_active TINYINT(1) NOT NULL DEFAULT 1, 
            is_featured TINYINT(1) NOT NULL DEFAULT 0, 
            testimonial_date DATE DEFAULT NULL, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            PRIMARY KEY(id),
            INDEX IDX_testimonial_active (is_active),
            INDEX IDX_testimonial_featured (is_featured),
            INDEX IDX_testimonial_formation (formation),
            INDEX IDX_testimonial_rating (rating)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // FAQ table
        $this->addSql('CREATE TABLE faq (
            id INT AUTO_INCREMENT NOT NULL, 
            question VARCHAR(500) NOT NULL, 
            answer LONGTEXT NOT NULL, 
            category VARCHAR(100) NOT NULL, 
            sort_order INT NOT NULL DEFAULT 0, 
            is_active TINYINT(1) NOT NULL DEFAULT 1, 
            is_featured TINYINT(1) NOT NULL DEFAULT 0, 
            tags JSON DEFAULT NULL, 
            view_count INT NOT NULL DEFAULT 0, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            PRIMARY KEY(id),
            INDEX IDX_faq_category (category),
            INDEX IDX_faq_active (is_active),
            INDEX IDX_faq_featured (is_featured),
            INDEX IDX_faq_sort_order (sort_order)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        // Drop tables in reverse order
        $this->addSql('DROP TABLE faq');
        $this->addSql('DROP TABLE testimonial');
        $this->addSql('DROP TABLE content_text');
    }
}
