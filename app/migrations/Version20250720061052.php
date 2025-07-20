<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250720061052 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Insert reservation status email templates from fixtures into production database';
    }

    public function up(Schema $schema): void
    {
        // Insert email templates only if they don't exist
        
        // PHASE 1: DEMANDE INITIALE
        
        // SUBMITTED - Demande soumise (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_submitted_student',
                'Demande d\\'inscription soumise (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '✅ Votre demande d\\'inscription a été soumise',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #3182ce;\">✅ Demande soumise avec succès</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Votre demande d\\'inscription a été soumise avec succès !</p>
                    <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                        <p><strong>Détails de votre demande :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation : {{formationTitle}}</li>
                            <li>Date de session : {{sessionDate}}</li>
                            <li>Numéro de demande : {{reservationId}}</li>
                            <li>Date de soumission : {{submissionDate}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                        <p><strong>📋 Prochaines étapes :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Votre demande va être examinée par notre équipe</li>
                            <li>Vous recevrez une notification à chaque étape</li>
                            <li>Délai de traitement initial : 24-48h ouvrées</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Merci pour votre confiance. Nous reviendrons vers vous très prochainement.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"sessionDate\", \"reservationId\", \"submissionDate\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_submitted_student'
            )
        ");

        // UNDER_REVIEW - Demande en cours d'examen (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_under_review_student',
                'Demande en cours d\\'examen (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '🔍 Votre demande est en cours d\\'examen',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #3182ce;\">🔍 Examen en cours</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Votre demande d\\'inscription à la formation <strong>{{formationTitle}}</strong> est actuellement en cours d\\'examen par notre équipe pédagogique.</p>
                    <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                        <p><strong>📋 Étape actuelle :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>✅ Demande reçue et enregistrée</li>
                            <li>🔍 <strong>Examen du dossier en cours</strong></li>
                            <li>⏳ Vérification des prérequis</li>
                            <li>⏳ Validation finale</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Nous vous tiendrons informé(e) de l\\'avancement de votre dossier.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"sessionDate\", \"reservationId\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_under_review_student'
            )
        ");

        // AWAITING_DOCUMENTS - En attente de documents (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_awaiting_documents_student',
                'En attente de documents (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '📄 Documents requis pour votre inscription',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
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
                '[\"studentName\", \"formationTitle\", \"studentPortalUrl\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_awaiting_documents_student'
            )
        ");

        // CANCELLED - Inscription annulée (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_cancelled_student',
                'Inscription annulée (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '❌ Annulation de votre inscription',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #e53e3e;\">❌ Inscription annulée</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous vous informons que votre inscription à la formation <strong>{{formationTitle}}</strong> a été annulée.</p>
                    <div style=\"background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;\">
                        <p><strong>📋 Détails de l\\'annulation :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation : {{formationTitle}}</li>
                            <li>Date d\\'annulation : {{statusChangeDate}}</li>
                            <li>Numéro de demande : {{reservationId}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Si cette annulation ne vous convient pas ou si vous souhaitez vous réinscrire, n\\'hésitez pas à nous contacter.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"statusChangeDate\", \"reservationId\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_cancelled_student'
            )
        ");

        // CONFIRMED - Inscription confirmée (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_confirmed_student',
                'Inscription confirmée (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '🎉 Inscription confirmée - {{formationTitle}}',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38a169;\">🎉 Inscription confirmée !</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Félicitations ! Votre inscription à la formation <strong>{{formationTitle}}</strong> est désormais <strong>confirmée</strong>.</p>
                    <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                        <p><strong>✅ Détails de votre formation :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation : {{formationTitle}}</li>
                            <li>Date de début : {{sessionStartDate}}</li>
                            <li>Durée : {{duration}} heures</li>
                            <li>Lieu : {{location}}</li>
                            <li>Formateur : {{instructorName}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>📋 Informations importantes :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Votre convocation sera envoyée 7 jours avant le début</li>
                            <li>Consultez vos documents de formation dans votre espace personnel</li>
                            <li>En cas d\\'empêchement, prévenez-nous au moins 48h à l\\'avance</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p style=\"text-align: center; margin: 20px 0;\">
                        <a href=\"{{studentPortalUrl}}\" style=\"background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                            Accéder à mon espace formation
                        </a>
                    </p>
                    <p>Nous avons hâte de vous accueillir et de vous accompagner dans votre parcours de formation !</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"sessionStartDate\", \"duration\", \"location\", \"instructorName\", \"studentPortalUrl\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_confirmed_student'
            )
        ");

        // COMPLETED - Formation terminée (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_completed_student',
                'Formation terminée (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '🎓 Félicitations ! Formation terminée avec succès',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38a169;\">🎓 Félicitations !</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous avons le plaisir de vous informer que vous avez terminé avec succès la formation <strong>{{formationTitle}}</strong>.</p>
                    <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                        <p><strong>🎉 Votre réussite :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Formation : {{formationTitle}}</li>
                            <li>Durée : {{duration}} heures</li>
                            <li>Date de fin : {{completionDate}}</li>
                            <li>Statut : <strong>Terminée avec succès</strong></li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p style=\"text-align: center; margin: 20px 0;\">
                        <a href=\"{{certificateUrl}}\" style=\"background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                            Télécharger mon certificat
                        </a>
                    </p>
                    <p>Bravo pour votre persévérance et votre engagement. Nous vous souhaitons une excellente continuation dans votre parcours professionnel.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"duration\", \"completionDate\", \"certificateUrl\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_completed_student'
            )
        ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer les templates email créés par cette migration
        $this->addSql("
            DELETE FROM email_template 
            WHERE identifier IN (
                'reservation_status_submitted_student',
                'reservation_status_under_review_student',
                'reservation_status_awaiting_documents_student',
                'reservation_status_cancelled_student',
                'reservation_status_confirmed_student',
                'reservation_status_completed_student'
            )
        ");
    }
}
