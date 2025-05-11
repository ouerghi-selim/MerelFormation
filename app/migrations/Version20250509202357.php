<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250509202357 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reservation DROP INDEX IDX_42C849554C3A3BB, ADD UNIQUE INDEX UNIQ_42C849554C3A3BB (payment_id)');
        $this->addSql('ALTER TABLE reservation DROP vehicle_id, DROP discr');
        $this->addSql('ALTER TABLE user ADD birth_date DATE DEFAULT NULL, ADD birth_place VARCHAR(255) DEFAULT NULL, ADD address VARCHAR(255) DEFAULT NULL, ADD postal_code VARCHAR(20) DEFAULT NULL, ADD city VARCHAR(255) DEFAULT NULL, ADD driver_license_front_file VARCHAR(255) DEFAULT NULL, ADD driver_license_back_file VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reservation DROP INDEX UNIQ_42C849554C3A3BB, ADD INDEX IDX_42C849554C3A3BB (payment_id)');
        $this->addSql('ALTER TABLE reservation ADD vehicle_id INT DEFAULT NULL, ADD discr VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE `user` DROP birth_date, DROP birth_place, DROP address, DROP postal_code, DROP city, DROP driver_license_front_file, DROP driver_license_back_file');
    }
}
