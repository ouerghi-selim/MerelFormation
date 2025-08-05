<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajouter le template email pour notification admin sur ajout de documents véhicule
 */
final class Version20250805120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter template email pour notification admin - documents véhicule ajoutés';
    }

    public function up(Schema $schema): void
    {
        // Insérer le template email pour les admins
        $this->addSql("
            INSERT INTO email_template (
                identifier, 
                is_system, 
                target_role, 
                event_type, 
                name, 
                subject, 
                content, 
                variables, 
                type, 
                created_at, 
                updated_at
            ) VALUES (
                'document_added_admin_vehicle', 
                1, 
                'ROLE_ADMIN', 
                'document_added', 
                'Nouveaux documents réservation véhicule', 
                'Nouveaux documents pour réservation véhicule #{{rentalId}}',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #2c5282;\">Nouveaux documents pour réservation de véhicule</h2>
                    <p>Bonjour {{adminName}},</p>
                    <p>Le client <strong>{{customerName}}</strong> a ajouté <strong>{{documentCount}}</strong> document(s) à sa réservation de véhicule.</p>
                    
                    <div style=\"background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;\">
                        <p><strong>Détails de la réservation:</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Réservation: #{{rentalId}}</li>
                            <li>Client: {{customerName}}</li>
                            <li>Date d''examen: {{examDate}}</li>
                            <li>Heure d''examen: {{examTime}}</li>
                            <li>Centre d''examen: {{examCenter}}</li>
                            <li>Nombre de documents: {{documentCount}}</li>
                            <li>Documents: {{documentTitles}}</li>
                        </ul>
                    </div>
                    
                    <p>Vous pouvez consulter et valider ces documents dans l''interface d''administration.</p>
                    <p><a href=\"{{adminUrl}}\" style=\"background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Voir la réservation</a></p>
                    
                    <p>Cordialement,<br>Le système MerelFormation</p>
                </div>',
                '[\"adminName\", \"customerName\", \"rentalId\", \"examDate\", \"examTime\", \"examCenter\", \"documentCount\", \"documentTitles\", \"adminUrl\"]',
                'notification',
                NOW(),
                NOW()
            )
        ");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("DELETE FROM email_template WHERE identifier = 'document_added_admin_vehicle'");
    }
}