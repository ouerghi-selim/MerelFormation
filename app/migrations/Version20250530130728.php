<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250530130728 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activity_log (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, action VARCHAR(50) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id INT DEFAULT NULL, details JSON DEFAULT NULL, ip_address VARCHAR(45) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_FD06F647A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE calendar_event (id INT AUTO_INCREMENT NOT NULL, formation_id INT DEFAULT NULL, vehicle_rental_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, start_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', end_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', all_day TINYINT(1) DEFAULT NULL, background_color VARCHAR(7) DEFAULT NULL, INDEX IDX_57FA09C95200282E (formation_id), INDEX IDX_57FA09C95070667B (vehicle_rental_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, parent_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, is_active TINYINT(1) NOT NULL, lft INT NOT NULL, rgt INT NOT NULL, level INT NOT NULL, UNIQUE INDEX UNIQ_64C19C1989D9B62 (slug), INDEX IDX_64C19C1727ACA70 (parent_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE content_text (id INT AUTO_INCREMENT NOT NULL, identifier VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, section VARCHAR(100) NOT NULL, type VARCHAR(50) NOT NULL, sort_order INT DEFAULT 0 NOT NULL, is_active TINYINT(1) DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_F6E94A02772E836A (identifier), INDEX IDX_content_text_section (section), INDEX IDX_content_text_type (type), INDEX IDX_content_text_sort_order (sort_order), INDEX IDX_content_text_active (is_active), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE document (id INT AUTO_INCREMENT NOT NULL, uploaded_by INT DEFAULT NULL, formation_id INT DEFAULT NULL, reservation_id INT DEFAULT NULL, vehicle_rental_id INT DEFAULT NULL, session_id INT DEFAULT NULL, user_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, file_name VARCHAR(255) NOT NULL, category VARCHAR(50) NOT NULL, private TINYINT(1) NOT NULL, uploaded_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_D8698A76E3E73126 (uploaded_by), INDEX IDX_D8698A765200282E (formation_id), INDEX IDX_D8698A76B83297E7 (reservation_id), INDEX IDX_D8698A765070667B (vehicle_rental_id), INDEX IDX_D8698A76613FECDF (session_id), INDEX IDX_D8698A76A76ED395 (user_id), INDEX document_type_category_idx (type, category), INDEX document_upload_idx (uploaded_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE email_template (id INT AUTO_INCREMENT NOT NULL, identifier VARCHAR(255) NOT NULL, is_system TINYINT(1) NOT NULL, target_role VARCHAR(50) DEFAULT NULL, event_type VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, variables JSON NOT NULL, type VARCHAR(50) NOT NULL, UNIQUE INDEX UNIQ_9C0600CA772E836A (identifier), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE exam_center (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL, city VARCHAR(255) NOT NULL, department_code VARCHAR(10) NOT NULL, address LONGTEXT DEFAULT NULL, is_active TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE faq (id INT AUTO_INCREMENT NOT NULL, question VARCHAR(500) NOT NULL, answer LONGTEXT NOT NULL, category VARCHAR(100) NOT NULL, sort_order INT DEFAULT 0 NOT NULL, is_active TINYINT(1) DEFAULT 1 NOT NULL, is_featured TINYINT(1) DEFAULT 0 NOT NULL, tags JSON DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', view_count INT DEFAULT 0 NOT NULL, INDEX IDX_faq_category (category), INDEX IDX_faq_active (is_active), INDEX IDX_faq_featured (is_featured), INDEX IDX_faq_sort_order (sort_order), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE formation (id INT AUTO_INCREMENT NOT NULL, category_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, price DOUBLE PRECISION NOT NULL, duration INT NOT NULL, type VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', is_active TINYINT(1) NOT NULL, INDEX IDX_404021BF12469DE2 (category_id), INDEX formation_title_idx (title), INDEX formation_type_idx (type), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE formula (id INT AUTO_INCREMENT NOT NULL, exam_center_id INT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, price NUMERIC(10, 2) DEFAULT NULL, type VARCHAR(20) NOT NULL, is_active TINYINT(1) NOT NULL, additional_info LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_67315881E6A1F62E (exam_center_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE invoice (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, payment_id INT DEFAULT NULL, reservation_id INT DEFAULT NULL, vehicle_rental_id INT DEFAULT NULL, invoice_number VARCHAR(255) NOT NULL, amount DOUBLE PRECISION NOT NULL, status VARCHAR(50) NOT NULL, due_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', billing_details LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_90651744A76ED395 (user_id), UNIQUE INDEX UNIQ_906517444C3A3BB (payment_id), UNIQUE INDEX UNIQ_90651744B83297E7 (reservation_id), UNIQUE INDEX UNIQ_906517445070667B (vehicle_rental_id), INDEX invoice_status_idx (status), INDEX invoice_created_idx (created_at), UNIQUE INDEX invoice_number_unique (invoice_number), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE media (id INT AUTO_INCREMENT NOT NULL, formation_id INT DEFAULT NULL, vehicle_id INT DEFAULT NULL, filename VARCHAR(255) NOT NULL, original_filename VARCHAR(255) NOT NULL, mime_type VARCHAR(50) NOT NULL, size INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_6A2CA10C5200282E (formation_id), INDEX IDX_6A2CA10C545317D1 (vehicle_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE module (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, title VARCHAR(255) NOT NULL, duration INT NOT NULL, position INT DEFAULT NULL, INDEX IDX_C2426285200282E (formation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE module_point (id INT AUTO_INCREMENT NOT NULL, module_id INT NOT NULL, content VARCHAR(255) NOT NULL, INDEX IDX_BEA9834AAFC2B591 (module_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT DEFAULT NULL, type VARCHAR(50) NOT NULL, is_read TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', read_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_BF5476CAA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE payment (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, transaction_id VARCHAR(255) NOT NULL, amount NUMERIC(10, 2) NOT NULL, method VARCHAR(50) NOT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', completed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_6D28840DA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE prerequisite (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, content VARCHAR(255) NOT NULL, INDEX IDX_4594A2385200282E (formation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE refresh_tokens (id INT AUTO_INCREMENT NOT NULL, refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid DATETIME NOT NULL, UNIQUE INDEX UNIQ_9BACE7E1C74F2195 (refresh_token), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE reservation (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, session_id INT NOT NULL, payment_id INT DEFAULT NULL, status VARCHAR(50) NOT NULL, notes LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_42C84955A76ED395 (user_id), INDEX IDX_42C84955613FECDF (session_id), UNIQUE INDEX UNIQ_42C849554C3A3BB (payment_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE session (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, instructor_id INT DEFAULT NULL, start_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', end_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', max_participants INT NOT NULL, location VARCHAR(255) DEFAULT NULL, status VARCHAR(50) NOT NULL, notes VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_D044D5D45200282E (formation_id), INDEX IDX_D044D5D48C4FC193 (instructor_id), INDEX session_start_idx (start_date), INDEX session_status_idx (status), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE setting (`key` VARCHAR(255) NOT NULL, value LONGTEXT NOT NULL, type VARCHAR(50) NOT NULL, description VARCHAR(255) NOT NULL, is_public TINYINT(1) NOT NULL, PRIMARY KEY(`key`)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE settings (`key` VARCHAR(255) NOT NULL, value LONGTEXT NOT NULL, type VARCHAR(50) NOT NULL, description VARCHAR(255) NOT NULL, is_public TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', category VARCHAR(50) NOT NULL, PRIMARY KEY(`key`)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE testimonial (id INT AUTO_INCREMENT NOT NULL, client_name VARCHAR(255) NOT NULL, client_job VARCHAR(255) DEFAULT NULL, client_company VARCHAR(255) DEFAULT NULL, content LONGTEXT NOT NULL, rating INT DEFAULT NULL, formation VARCHAR(255) DEFAULT NULL, client_image VARCHAR(255) DEFAULT NULL, is_active TINYINT(1) DEFAULT 1 NOT NULL, is_featured TINYINT(1) DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', testimonial_date DATE DEFAULT NULL, INDEX IDX_testimonial_active (is_active), INDEX IDX_testimonial_featured (is_featured), INDEX IDX_testimonial_formation (formation), INDEX IDX_testimonial_rating (rating), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, phone VARCHAR(20) DEFAULT NULL, birth_date DATE DEFAULT NULL, birth_place VARCHAR(255) DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, postal_code VARCHAR(20) DEFAULT NULL, city VARCHAR(255) DEFAULT NULL, driver_license_front_file VARCHAR(255) DEFAULT NULL, driver_license_back_file VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', is_active TINYINT(1) NOT NULL, INDEX user_email_idx (email), UNIQUE INDEX user_email_unique (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE vehicle (id INT AUTO_INCREMENT NOT NULL, model VARCHAR(255) NOT NULL, plate VARCHAR(20) NOT NULL, year INT NOT NULL, status VARCHAR(50) NOT NULL, daily_rate DOUBLE PRECISION NOT NULL, is_active TINYINT(1) NOT NULL, category VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX vehicle_status_idx (status), UNIQUE INDEX vehicle_plate_unique (plate), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE vehicle_rental (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, vehicle_id INT DEFAULT NULL, start_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', end_date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', total_price NUMERIC(10, 2) NOT NULL, status VARCHAR(50) NOT NULL, notes LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', pickup_location VARCHAR(255) NOT NULL, return_location VARCHAR(255) NOT NULL, exam_center VARCHAR(255) DEFAULT NULL, formula VARCHAR(255) DEFAULT NULL, exam_time VARCHAR(50) DEFAULT NULL, facturation VARCHAR(255) DEFAULT NULL, financing VARCHAR(100) DEFAULT NULL, payment_method VARCHAR(255) DEFAULT NULL, tracking_token VARCHAR(64) DEFAULT NULL, admin_notes LONGTEXT DEFAULT NULL, UNIQUE INDEX UNIQ_BFC7C3AEB46BB896 (tracking_token), INDEX IDX_BFC7C3AEA76ED395 (user_id), INDEX IDX_BFC7C3AE545317D1 (vehicle_id), INDEX rental_dates_idx (start_date, end_date), INDEX rental_status_idx (status), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE activity_log ADD CONSTRAINT FK_FD06F647A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_57FA09C95200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_57FA09C95070667B FOREIGN KEY (vehicle_rental_id) REFERENCES vehicle_rental (id)');
        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1727ACA70 FOREIGN KEY (parent_id) REFERENCES category (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76E3E73126 FOREIGN KEY (uploaded_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A765200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A765070667B FOREIGN KEY (vehicle_rental_id) REFERENCES vehicle_rental (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76613FECDF FOREIGN KEY (session_id) REFERENCES session (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE formation ADD CONSTRAINT FK_404021BF12469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        $this->addSql('ALTER TABLE formula ADD CONSTRAINT FK_67315881E6A1F62E FOREIGN KEY (exam_center_id) REFERENCES exam_center (id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_90651744A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_906517444C3A3BB FOREIGN KEY (payment_id) REFERENCES payment (id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_90651744B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_906517445070667B FOREIGN KEY (vehicle_rental_id) REFERENCES vehicle_rental (id)');
        $this->addSql('ALTER TABLE media ADD CONSTRAINT FK_6A2CA10C5200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE media ADD CONSTRAINT FK_6A2CA10C545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
        $this->addSql('ALTER TABLE module ADD CONSTRAINT FK_C2426285200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE module_point ADD CONSTRAINT FK_BEA9834AAFC2B591 FOREIGN KEY (module_id) REFERENCES module (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE payment ADD CONSTRAINT FK_6D28840DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE prerequisite ADD CONSTRAINT FK_4594A2385200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955613FECDF FOREIGN KEY (session_id) REFERENCES session (id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C849554C3A3BB FOREIGN KEY (payment_id) REFERENCES payment (id)');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D45200282E FOREIGN KEY (formation_id) REFERENCES formation (id)');
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D48C4FC193 FOREIGN KEY (instructor_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE vehicle_rental ADD CONSTRAINT FK_BFC7C3AEA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE vehicle_rental ADD CONSTRAINT FK_BFC7C3AE545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity_log DROP FOREIGN KEY FK_FD06F647A76ED395');
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_57FA09C95200282E');
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_57FA09C95070667B');
        $this->addSql('ALTER TABLE category DROP FOREIGN KEY FK_64C19C1727ACA70');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76E3E73126');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A765200282E');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76B83297E7');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A765070667B');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76613FECDF');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76A76ED395');
        $this->addSql('ALTER TABLE formation DROP FOREIGN KEY FK_404021BF12469DE2');
        $this->addSql('ALTER TABLE formula DROP FOREIGN KEY FK_67315881E6A1F62E');
        $this->addSql('ALTER TABLE invoice DROP FOREIGN KEY FK_90651744A76ED395');
        $this->addSql('ALTER TABLE invoice DROP FOREIGN KEY FK_906517444C3A3BB');
        $this->addSql('ALTER TABLE invoice DROP FOREIGN KEY FK_90651744B83297E7');
        $this->addSql('ALTER TABLE invoice DROP FOREIGN KEY FK_906517445070667B');
        $this->addSql('ALTER TABLE media DROP FOREIGN KEY FK_6A2CA10C5200282E');
        $this->addSql('ALTER TABLE media DROP FOREIGN KEY FK_6A2CA10C545317D1');
        $this->addSql('ALTER TABLE module DROP FOREIGN KEY FK_C2426285200282E');
        $this->addSql('ALTER TABLE module_point DROP FOREIGN KEY FK_BEA9834AAFC2B591');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAA76ED395');
        $this->addSql('ALTER TABLE payment DROP FOREIGN KEY FK_6D28840DA76ED395');
        $this->addSql('ALTER TABLE prerequisite DROP FOREIGN KEY FK_4594A2385200282E');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955A76ED395');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955613FECDF');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C849554C3A3BB');
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D45200282E');
        $this->addSql('ALTER TABLE session DROP FOREIGN KEY FK_D044D5D48C4FC193');
        $this->addSql('ALTER TABLE vehicle_rental DROP FOREIGN KEY FK_BFC7C3AEA76ED395');
        $this->addSql('ALTER TABLE vehicle_rental DROP FOREIGN KEY FK_BFC7C3AE545317D1');
        $this->addSql('DROP TABLE activity_log');
        $this->addSql('DROP TABLE calendar_event');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE content_text');
        $this->addSql('DROP TABLE document');
        $this->addSql('DROP TABLE email_template');
        $this->addSql('DROP TABLE exam_center');
        $this->addSql('DROP TABLE faq');
        $this->addSql('DROP TABLE formation');
        $this->addSql('DROP TABLE formula');
        $this->addSql('DROP TABLE invoice');
        $this->addSql('DROP TABLE media');
        $this->addSql('DROP TABLE module');
        $this->addSql('DROP TABLE module_point');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE payment');
        $this->addSql('DROP TABLE prerequisite');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE reservation');
        $this->addSql('DROP TABLE session');
        $this->addSql('DROP TABLE setting');
        $this->addSql('DROP TABLE settings');
        $this->addSql('DROP TABLE testimonial');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE vehicle');
        $this->addSql('DROP TABLE vehicle_rental');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
