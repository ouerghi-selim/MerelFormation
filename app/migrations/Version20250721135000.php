<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Combine awaiting_documents and registration_confirmation emails into one
 */
final class Version20250721135000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Combine awaiting_documents and registration_confirmation emails by adding passwordSetupUrl to awaiting_documents template';
    }

    public function up(Schema $schema): void
    {
        // Mettre à jour le template awaiting_documents pour inclure la section création de compte
        $this->addSql("
            UPDATE email_template 
            SET 
                content = '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #d69e2e;\">📄 Documents requis pour votre inscription</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Félicitations ! Votre inscription à la formation <strong>{{formationTitle}}</strong> a été acceptée.</p>
                    
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>🔑 Créer votre compte étudiant :</strong></p>
                        <p>Commencez par créer votre mot de passe pour accéder à votre espace personnel :</p>
                        <p style=\"text-align: center; margin: 10px 0;\">
                            <a href=\"{{passwordSetupUrl}}\" style=\"background-color: #38b2ac; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                                Créer mon mot de passe
                            </a>
                        </p>
                        <p style=\"font-size: 12px; color: #666;\">Ce lien est valide pendant 7 jours.</p>
                    </div>

                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                        <p><strong>📋 Documents à fournir :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Pièce d\\'identité (recto-verso)</li>
                            <li>Justificatif de domicile récent</li>
                            <li>CV à jour</li>
                            <li>Dernier diplôme obtenu</li>
                        </ul>
                    </div>
                    
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    
                    <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                        <p><strong>💡 Comment procéder :</strong></p>
                        <ol style=\"padding-left: 20px;\">
                            <li>Cliquez sur \"Créer mon mot de passe\" ci-dessus</li>
                            <li>Définissez votre mot de passe</li>
                            <li>Connectez-vous à votre espace personnel</li>
                            <li>Téléchargez vos documents dans la section \"Mes Documents\"</li>
                        </ol>
                    </div>
                    
                    <p>Dès réception de vos documents, nous procéderons à leur validation dans les 24-48h ouvrées.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                variables = '[\"studentName\", \"formationTitle\", \"passwordSetupUrl\", \"studentPortalUrl\", \"customMessage\"]',
                subject = '🎉 Inscription acceptée - Créez votre compte et uploadez vos documents'
            WHERE identifier = 'reservation_status_awaiting_documents_student'
        ");
    }

    public function down(Schema $schema): void
    {
        // Restaurer l'ancien template
        $this->addSql("
            UPDATE email_template 
            SET 
                content = '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #d69e2e;\">📄 Documents requis</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Pour finaliser votre inscription à la formation <strong>{{formationTitle}}</strong>, nous avons besoin des documents suivants :</p>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                        <p><strong>📋 Documents à fournir :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Pièce d\\'identité (recto-verso)</li>
                            <li>Justificatif de domicile récent</li>
                            <li>CV à jour</li>
                            <li>Dernier diplôme obtenu</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p style=\"text-align: center; margin: 20px 0;\">
                        <a href=\"{{studentPortalUrl}}\" style=\"background-color: #d69e2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                            Télécharger mes documents
                        </a>
                    </p>
                    <p>Merci de votre collaboration.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                variables = '[\"studentName\", \"formationTitle\", \"studentPortalUrl\", \"customMessage\"]',
                subject = '📄 Documents requis pour votre inscription'
            WHERE identifier = 'reservation_status_awaiting_documents_student'
        ");
    }
}