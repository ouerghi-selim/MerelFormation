<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250714154152 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute le template email pour les demandes d\'inscription et améliore le template de confirmation';
    }

    public function up(Schema $schema): void
    {
        // Ajouter le template pour les demandes d'inscription (registration_request)
        $this->addSql("
            INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) 
            VALUES (
                'Demande d\'inscription reçue (Étudiant)',
                'registration_request_student',
                'registration_request',
                'ROLE_STUDENT',
                1,
                'notification',
                'Demande d\'inscription reçue - {{formationTitle}}',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #2c5282;\">Demande d\'inscription reçue</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous avons bien reçu votre demande d\'inscription à la formation suivante :</p>
                    <div style=\"background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;\">
                        <p><strong>Détails de votre demande:</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation: {{formationTitle}}</li>
                            <li>Date de session: {{sessionDate}}</li>
                            <li>Lieu: {{location}}</li>
                            <li>Numéro de demande: {{reservationId}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                        <p><strong>Prochaines étapes:</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Votre demande est en cours de traitement</li>
                            <li>Un administrateur ou formateur va examiner votre inscription</li>
                            <li>Vous recevrez une confirmation par email une fois validée</li>
                            <li>Délai de traitement: 24-48h ouvrées</li>
                        </ul>
                    </div>
                    <p>Si votre demande est urgente, vous pouvez nous contacter directement par téléphone au <strong>04 XX XX XX XX</strong>.</p>
                    <p>Nous vous remercions pour votre intérêt et vous répondrons dans les plus brefs délais.</p>
                    <p>Cordialement,<br>L\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"sessionDate\", \"location\", \"reservationId\"]',
                NOW(),
                NOW()
            )
        ");

        // Améliorer le template de confirmation d'inscription avec URL pour définir le mot de passe
        $this->addSql("
            UPDATE email_template 
            SET 
                content = '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38a169;\">✅ Inscription confirmée!</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Excellente nouvelle! Votre inscription à la formation suivante a été <strong>confirmée</strong> par notre équipe :</p>
                    <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                        <p><strong>Détails de votre formation:</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation: {{formationTitle}}</li>
                            <li>Date: {{sessionDate}}</li>
                            <li>Lieu: {{location}}</li>
                            <li>Prix: {{price}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>🔑 Finalisation de votre inscription:</strong></p>
                        <p>Pour compléter votre inscription, veuillez cliquer sur le lien ci-dessous pour définir votre mot de passe et compléter votre profil :</p>
                        <p style=\"text-align: center; margin: 20px 0;\">
                            <a href=\"{{passwordSetupUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                                Finaliser mon inscription
                            </a>
                        </p>
                        <p style=\"font-size: 14px; color: #666;\">Ce lien est valide pendant 7 jours.</p>
                    </div>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                        <p><strong>📋 Prochaines étapes:</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Finalisez votre inscription via le lien ci-dessus</li>
                            <li>Consultez les documents de formation dans votre espace personnel</li>
                            <li>Préparez-vous pour le début de la formation</li>
                        </ul>
                    </div>
                    <p>Nous nous réjouissons de vous accueillir prochainement dans notre formation!</p>
                    <p>Si vous avez des questions, n\'hésitez pas à nous contacter.</p>
                    <p>Cordialement,<br>L\'équipe MerelFormation</p>
                </div>',
                variables = '[\"studentName\", \"formationTitle\", \"sessionDate\", \"location\", \"price\", \"passwordSetupUrl\"]',
                updated_at = NOW()
            WHERE identifier = 'registration_confirmation_student'
        ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer le template de demande d'inscription
        $this->addSql("DELETE FROM email_template WHERE identifier = 'registration_request_student'");

        // Restaurer l'ancien template de confirmation
        $this->addSql("
            UPDATE email_template 
            SET 
                content = '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #2c5282;\">Confirmation d\'inscription</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous confirmons votre inscription à la formation suivante :</p>
                    <div style=\"background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;\">
                        <p><strong>Détails de votre formation:</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation: {{formationTitle}}</li>
                            <li>Date: {{sessionDate}}</li>
                            <li>Lieu: {{location}}</li>
                            <li>Prix: {{price}}</li>
                        </ul>
                    </div>
                    <p>Nous vous remercions pour votre confiance et nous nous réjouissons de vous accueillir prochainement.</p>
                    <p>Si vous avez des questions, n\'hésitez pas à nous contacter.</p>
                    <p>Cordialement,<br>L\'équipe MerelFormation</p>
                </div>',
                variables = '[\"studentName\", \"formationTitle\", \"sessionDate\", \"location\", \"price\"]',
                updated_at = NOW()
            WHERE identifier = 'registration_confirmation_student'
        ");
    }
}
