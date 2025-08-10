<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250810164029 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout des contenus CMS pour la page de tracking des réservations de véhicules';
    }

    public function up(Schema $schema): void
    {
        // Ajout des contenus CMS pour la page de tracking
        
        // Header de la page de tracking
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_header_title', 'Titre Header Tracking', 'Suivi de réservation', 'tracking_header', 'title', 1, 1, NOW(), NOW()),
            ('tracking_header_description', 'Description Header Tracking', 'Suivez l\\'évolution de votre demande de réservation en temps réel', 'tracking_header', 'description', 2, 1, NOW(), NOW())
        ");
        
        // Section progression
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_progress_title', 'Titre Progression', 'Progression de votre réservation', 'tracking_progress', 'title', 1, 1, NOW(), NOW()),
            ('tracking_progress_description', 'Description Progression', 'Votre réservation passe par plusieurs étapes pour assurer la meilleure qualité de service', 'tracking_progress', 'description', 2, 1, NOW(), NOW())
        ");
        
        // Section historique
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_history_title', 'Titre Historique', 'Historique détaillé', 'tracking_history', 'title', 1, 1, NOW(), NOW()),
            ('tracking_history_description', 'Description Historique', 'Toutes les étapes importantes de votre réservation sont enregistrées ici', 'tracking_history', 'description', 2, 1, NOW(), NOW())
        ");
        
        // Section documents
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_documents_title', 'Titre Documents', 'Documents de votre réservation', 'tracking_documents', 'title', 1, 1, NOW(), NOW()),
            ('tracking_documents_description', 'Description Documents', 'Tous les documents liés à votre réservation sont accessibles ici en téléchargement sécurisé', 'tracking_documents', 'description', 2, 1, NOW(), NOW())
        ");
        
        // Section facture
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_invoice_title', 'Titre Facture', 'Facture disponible', 'tracking_invoice', 'title', 1, 1, NOW(), NOW()),
            ('tracking_invoice_description', 'Description Facture', 'Votre facture est prête et peut être téléchargée', 'tracking_invoice', 'description', 2, 1, NOW(), NOW()),
            ('tracking_invoice_download_button', 'Bouton Télécharger Facture', 'Télécharger la facture', 'tracking_invoice', 'button_text', 3, 1, NOW(), NOW())
        ");
        
        // Messages d'état
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_status_awaiting_docs', 'Message Attente Documents', 'Veuillez fournir les documents demandés pour continuer le traitement de votre réservation', 'tracking_status', 'message', 1, 1, NOW(), NOW()),
            ('tracking_status_no_docs', 'Message Aucun Document', 'Aucun document complémentaire n\\'est associé à cette réservation', 'tracking_status', 'message', 2, 1, NOW(), NOW())
        ");
        
        // Footer
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('tracking_footer_note', 'Note Footer', 'Conservez ce lien pour suivre l\\'évolution de votre demande', 'tracking_footer', 'description', 1, 1, NOW(), NOW()),
            ('tracking_footer_brand', 'Marque Footer', 'MerelFormation', 'tracking_footer', 'brand', 2, 1, NOW(), NOW())
        ");
    }

    public function down(Schema $schema): void
    {
        // Suppression des contenus CMS de tracking en cas de rollback
        $this->addSql("DELETE FROM content_text WHERE section IN ('tracking_header', 'tracking_progress', 'tracking_history', 'tracking_documents', 'tracking_invoice', 'tracking_status', 'tracking_footer')");
    }
}
