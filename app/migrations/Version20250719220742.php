<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250719220742 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update reservation status system with new professional workflow statuses';
    }

    public function up(Schema $schema): void
    {
        // Mettre à jour les anciens statuts vers les nouveaux
        $this->addSql("UPDATE reservation SET status = 'submitted' WHERE status = 'pending'");
        $this->addSql("UPDATE reservation SET status = 'confirmed' WHERE status = 'confirmed'");
        $this->addSql("UPDATE reservation SET status = 'cancelled' WHERE status = 'cancelled'");
        $this->addSql("UPDATE reservation SET status = 'completed' WHERE status = 'completed'");
        
        // Note: Les nouveaux statuts seront disponibles pour les futures inscriptions
    }

    public function down(Schema $schema): void
    {
        // Remettre vers les anciens statuts simples
        $this->addSql("UPDATE reservation SET status = 'pending' WHERE status IN ('submitted', 'under_review', 'awaiting_documents', 'documents_pending', 'documents_rejected', 'awaiting_prerequisites', 'awaiting_funding', 'funding_approved', 'awaiting_payment', 'payment_pending', 'awaiting_start')");
        $this->addSql("UPDATE reservation SET status = 'confirmed' WHERE status = 'confirmed'");
        $this->addSql("UPDATE reservation SET status = 'cancelled' WHERE status IN ('cancelled', 'suspended', 'failed')");
        $this->addSql("UPDATE reservation SET status = 'completed' WHERE status IN ('completed', 'refunded', 'in_progress', 'attendance_issues')");
    }
}
