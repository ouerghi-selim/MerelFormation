<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250525101318 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE content_text RENAME INDEX identifier TO UNIQ_F6E94A02772E836A');
        $this->addSql('ALTER TABLE content_text RENAME INDEX idx_faq_sort_order TO IDX_content_text_sort_order');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE content_text RENAME INDEX idx_content_text_sort_order TO IDX_faq_sort_order');
        $this->addSql('ALTER TABLE content_text RENAME INDEX uniq_f6e94a02772e836a TO identifier');
    }
}
