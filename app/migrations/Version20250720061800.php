<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Insert ALL remaining reservation status email templates - COMPLETE FIXTURES REPLACEMENT
 */
final class Version20250720061800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Insert ALL remaining reservation status email templates - COMPLETE FIXTURES REPLACEMENT (13 missing templates)';
    }

    public function up(Schema $schema): void
    {
        // DOCUMENTS_PENDING - Documents en cours de vérification (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_documents_pending_student',
                'Documents en cours de vérification (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '⏳ Documents reçus - Vérification en cours',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38b2ac;\">⏳ Vérification en cours</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous avons bien reçu vos documents le <strong>{{documentsReceivedDate}}</strong>. Notre équipe procède actuellement à leur vérification.</p>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>📋 Documents reçus :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>{{documentCount}} document(s) téléchargé(s)</li>
                            <li>Réception confirmée le {{documentsReceivedDate}}</li>
                            <li>Vérification administrative en cours</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>⏱️ Délais de traitement :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Validation administrative : 24-48h ouvrées</li>
                            <li>Vous serez informé(e) du résultat par email</li>
                            <li>En cas de document manquant, nous vous le signalerons</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Merci pour votre patience. Nous mettons tout en œuvre pour traiter votre dossier rapidement.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"documentsReceivedDate\", \"documentCount\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_documents_pending_student'
            )
        ");

        // DOCUMENTS_REJECTED - Documents refusés (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_documents_rejected_student',
                'Documents refusés (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '❌ Action requise : Documents à corriger',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #e53e3e;\">❌ Documents à corriger</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Après examen de vos documents, nous devons vous demander de les corriger ou de les compléter.</p>
                    <div style=\"background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;\">
                        <p><strong>❗ Problèmes identifiés :</strong></p>
                        <div style=\"padding-left: 20px; color: #744210;\">
                            {{rejectionReason}}
                        </div>
                    </div>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>🔧 Actions à effectuer :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Corrigez les documents selon les indications ci-dessus</li>
                            <li>Assurez-vous que les documents sont lisibles et complets</li>
                            <li>Téléchargez à nouveau vos documents corrigés</li>
                            <li>Notre équipe réexaminera votre dossier sous 24h</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p style=\"text-align: center; margin: 20px 0;\">
                        <a href=\"{{studentPortalUrl}}\" style=\"background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                            Corriger mes documents
                        </a>
                    </p>
                    <p>N\\'hésitez pas à nous contacter si vous avez besoin d\\'aide pour corriger vos documents.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"rejectionReason\", \"studentPortalUrl\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_documents_rejected_student'
            )
        ");

        // AWAITING_PREREQUISITES - En attente de prérequis (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_awaiting_prerequisites_student',
                'En attente de prérequis (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '📚 Prérequis manquants pour votre formation',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #ed8936;\">📚 Prérequis requis</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Pour accéder à la formation <strong>{{formationTitle}}</strong>, vous devez valider certains prérequis.</p>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;\">
                        <p><strong>📋 Prérequis manquants :</strong></p>
                        <div style=\"padding-left: 20px;\">
                            {{missingPrerequisites}}
                        </div>
                    </div>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>💡 Comment procéder :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Consultez les formations préalables proposées</li>
                            <li>Inscrivez-vous aux modules manquants</li>
                            <li>Fournissez des justificatifs de formations antérieures</li>
                            <li>Contactez notre équipe pour un entretien pédagogique</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Notre équipe pédagogique peut vous accompagner pour définir le parcours optimal selon votre profil.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"missingPrerequisites\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_awaiting_prerequisites_student'
            )
        ");

        // AWAITING_FUNDING - En attente de financement (Étudiant) 
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_awaiting_funding_student',
                'En attente de financement (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '💰 Financement en cours d\\'examen',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #3182ce;\">💰 Dossier de financement</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Votre demande de financement pour la formation <strong>{{formationTitle}}</strong> est actuellement en cours d\\'examen.</p>
                    <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                        <p><strong>📋 Informations sur votre financement :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Type de financement : {{fundingType}}</li>
                            <li>Organisme : {{fundingOrganization}}</li>
                            <li>Montant demandé : {{requestedAmount}}€</li>
                            <li>Date de demande : {{fundingRequestDate}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Nous vous tiendrons informé(e) dès réception de la réponse de l\\'organisme de financement.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"fundingType\", \"fundingOrganization\", \"requestedAmount\", \"fundingRequestDate\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_awaiting_funding_student'
            )
        ");

        // FUNDING_APPROVED - Financement approuvé (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_funding_approved_student',
                'Financement approuvé (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '✅ Financement approuvé !',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38a169;\">✅ Financement approuvé !</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Excellente nouvelle ! Votre demande de financement pour la formation <strong>{{formationTitle}}</strong> a été approuvée.</p>
                    <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                        <p><strong>✅ Détails du financement :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Organisme : {{fundingOrganization}}</li>
                            <li>Montant approuvé : {{approvedAmount}}€</li>
                            <li>Taux de prise en charge : {{coverageRate}}%</li>
                            <li>Date d\\'approbation : {{approvalDate}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Nous allons maintenant procéder aux dernières étapes administratives pour finaliser votre inscription.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"fundingOrganization\", \"approvedAmount\", \"coverageRate\", \"approvalDate\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_funding_approved_student'
            )
        ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer tous les templates ajoutés par cette migration
        $this->addSql("
            DELETE FROM email_template 
            WHERE identifier IN (
                'reservation_status_documents_pending_student',
                'reservation_status_documents_rejected_student',
                'reservation_status_awaiting_prerequisites_student',
                'reservation_status_awaiting_funding_student',
                'reservation_status_funding_approved_student'
            )
        ");
    }
}