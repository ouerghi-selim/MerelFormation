<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250902204822 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vehicle_rental ADD company_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle_rental ADD CONSTRAINT FK_BFC7C3AE979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id)');
        $this->addSql('CREATE INDEX IDX_BFC7C3AE979B1AD6 ON vehicle_rental (company_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vehicle_rental DROP FOREIGN KEY FK_BFC7C3AE979B1AD6');
        $this->addSql('DROP INDEX IDX_BFC7C3AE979B1AD6 ON vehicle_rental');
        $this->addSql('ALTER TABLE vehicle_rental DROP company_id');
    }
}
