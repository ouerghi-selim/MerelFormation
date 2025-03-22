<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250321191251 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE document ADD reservation_id INT DEFAULT NULL, ADD vehicle_rental_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A765070667B FOREIGN KEY (vehicle_rental_id) REFERENCES vehicle_rental (id)');
        $this->addSql('CREATE INDEX IDX_D8698A76B83297E7 ON document (reservation_id)');
        $this->addSql('CREATE INDEX IDX_D8698A765070667B ON document (vehicle_rental_id)');
        $this->addSql('ALTER TABLE vehicle_rental ADD exam_center VARCHAR(255) DEFAULT NULL, ADD formula VARCHAR(255) DEFAULT NULL, ADD exam_time VARCHAR(50) DEFAULT NULL, ADD birth_place VARCHAR(255) DEFAULT NULL, ADD birth_date DATE DEFAULT NULL, ADD address VARCHAR(255) DEFAULT NULL, ADD postal_code VARCHAR(20) DEFAULT NULL, ADD city VARCHAR(100) DEFAULT NULL, ADD facturation VARCHAR(255) DEFAULT NULL, ADD financing VARCHAR(100) DEFAULT NULL, ADD payment_method VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76B83297E7');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A765070667B');
        $this->addSql('DROP INDEX IDX_D8698A76B83297E7 ON document');
        $this->addSql('DROP INDEX IDX_D8698A765070667B ON document');
        $this->addSql('ALTER TABLE document DROP reservation_id, DROP vehicle_rental_id');
        $this->addSql('ALTER TABLE vehicle_rental DROP exam_center, DROP formula, DROP exam_time, DROP birth_place, DROP birth_date, DROP address, DROP postal_code, DROP city, DROP facturation, DROP financing, DROP payment_method');
    }
}
