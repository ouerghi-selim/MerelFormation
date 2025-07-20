<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250720062617 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Insert FINAL 8 remaining email templates to complete all fixtures (awaiting_payment, payment_pending, awaiting_start, in_progress, attendance_issues, suspended, failed, refunded)';
    }

    public function up(Schema $schema): void
    {
        // AWAITING_PAYMENT - En attente de paiement (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_awaiting_payment_student',
                'En attente de paiement (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '💳 Paiement requis pour finaliser votre inscription',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #d69e2e;\">💳 Paiement en attente</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Pour finaliser votre inscription à la formation <strong>{{formationTitle}}</strong>, nous avons besoin de votre paiement.</p>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                        <p><strong>💰 Détails du paiement :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Montant total : {{totalAmount}}€</li>
                            <li>Montant déjà payé : {{paidAmount}}€</li>
                            <li>Montant restant dû : {{remainingAmount}}€</li>
                            <li>Échéance : {{paymentDeadline}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p style=\"text-align: center; margin: 20px 0;\">
                        <a href=\"{{paymentUrl}}\" style=\"background-color: #d69e2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                            Procéder au paiement
                        </a>
                    </p>
                    <p>Une fois le paiement effectué, votre inscription sera automatiquement confirmée.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"totalAmount\", \"paidAmount\", \"remainingAmount\", \"paymentDeadline\", \"paymentUrl\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_awaiting_payment_student'
            )
        ");

        // PAYMENT_PENDING - Paiement en cours de traitement (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_payment_pending_student',
                'Paiement en cours de traitement (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '⏳ Paiement reçu - Traitement en cours',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38b2ac;\">⏳ Paiement en cours de traitement</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous avons bien reçu votre paiement pour la formation <strong>{{formationTitle}}</strong>. Il est actuellement en cours de traitement.</p>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>💳 Informations sur votre paiement :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Montant reçu : {{paymentAmount}}€</li>
                            <li>Mode de paiement : {{paymentMethod}}</li>
                            <li>Date de réception : {{paymentDate}}</li>
                            <li>Référence : {{paymentReference}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Votre inscription sera confirmée dès validation du paiement (délai habituel : 24-48h ouvrées).</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"paymentAmount\", \"paymentMethod\", \"paymentDate\", \"paymentReference\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_payment_pending_student'
            )
        ");

        // AWAITING_START - En attente du début (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_awaiting_start_student',
                'En attente du début (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '📅 Votre formation débute bientôt !',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38a169;\">📅 Formation imminente</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Votre formation <strong>{{formationTitle}}</strong> débute dans quelques jours ! Tout est prêt pour votre arrivée.</p>
                    <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                        <p><strong>📋 Rappel des informations pratiques :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Date de début : {{sessionStartDate}}</li>
                            <li>Horaires : {{sessionTimes}}</li>
                            <li>Lieu : {{location}}</li>
                            <li>Formateur : {{instructorName}}</li>
                            <li>Durée totale : {{duration}} heures</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Nous avons hâte de vous accueillir et de commencer cette aventure formatrice ensemble !</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"sessionStartDate\", \"sessionTimes\", \"location\", \"instructorName\", \"duration\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_awaiting_start_student'
            )
        ");

        // IN_PROGRESS - Formation en cours (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_in_progress_student',
                'Formation en cours (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '📚 Votre formation est maintenant en cours',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #3182ce;\">📚 Formation démarrée</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Votre formation <strong>{{formationTitle}}</strong> est maintenant officiellement en cours. Félicitations pour ce premier pas !</p>
                    <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                        <p><strong>📈 Votre progression :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Progression actuelle : {{completionPercentage}}%</li>
                            <li>Modules complétés : {{completedModules}}/{{totalModules}}</li>
                            <li>Prochaine session : {{nextSessionDate}}</li>
                            <li>Date de fin prévue : {{expectedEndDate}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p style=\"text-align: center; margin: 20px 0;\">
                        <a href=\"{{studentPortalUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                            Accéder à mon espace formation
                        </a>
                    </p>
                    <p>Continuez sur cette lancée ! Nous sommes là pour vous accompagner tout au long de votre parcours.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"completionPercentage\", \"completedModules\", \"totalModules\", \"nextSessionDate\", \"expectedEndDate\", \"studentPortalUrl\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_in_progress_student'
            )
        ");

        // ATTENDANCE_ISSUES - Problèmes d'assiduité (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_attendance_issues_student',
                'Problèmes d\\'assiduité (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '⚠️ Problème d\\'assiduité détecté',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #ed8936;\">⚠️ Attention requise</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous avons remarqué des problèmes d\\'assiduité concernant votre formation <strong>{{formationTitle}}</strong>.</p>
                    <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;\">
                        <p><strong>📊 Votre assiduité :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Taux de présence : {{attendanceRate}}%</li>
                            <li>Sessions manquées : {{missedSessions}}</li>
                            <li>Taux minimum requis : {{minimumAttendanceRate}}%</li>
                            <li>Prochaine échéance : {{nextDeadline}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p><strong>Action requise :</strong> Merci de nous contacter rapidement pour régulariser votre situation et éviter une éventuelle suspension.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"attendanceRate\", \"missedSessions\", \"minimumAttendanceRate\", \"nextDeadline\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_attendance_issues_student'
            )
        ");

        // SUSPENDED - Formation suspendue (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_suspended_student',
                'Formation suspendue (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '⏸️ Suspension temporaire de votre formation',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #e53e3e;\">⏸️ Formation suspendue</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous vous informons que votre formation <strong>{{formationTitle}}</strong> est temporairement suspendue.</p>
                    <div style=\"background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;\">
                        <p><strong>📋 Informations sur la suspension :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Motif : {{suspensionReason}}</li>
                            <li>Date de suspension : {{suspensionDate}}</li>
                            <li>Durée estimée : {{estimatedDuration}}</li>
                            <li>Révision prévue : {{reviewDate}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Notre équipe reste à votre disposition pour vous accompagner dans la résolution de cette situation.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"suspensionReason\", \"suspensionDate\", \"estimatedDuration\", \"reviewDate\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_suspended_student'
            )
        ");

        // FAILED - Formation échouée (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_failed_student',
                'Formation échouée (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '📝 Résultats de votre formation - Rattrapage possible',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #e53e3e;\">📝 Résultats de formation</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous vous informons que les objectifs de la formation <strong>{{formationTitle}}</strong> n\\'ont pas été atteints selon les critères requis.</p>
                    <div style=\"background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;\">
                        <p><strong>📊 Vos résultats :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Score obtenu : {{finalScore}}</li>
                            <li>Score requis : {{requiredScore}}</li>
                            <li>Modules validés : {{passedModules}}/{{totalModules}}</li>
                            <li>Taux d\\'assiduité : {{attendanceRate}}%</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                        <p><strong>🔄 Possibilités de rattrapage :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Session de rattrapage disponible le {{retakeDate}}</li>
                            <li>Modules de soutien personnalisés</li>
                            <li>Accompagnement pédagogique renforcé</li>
                            <li>Tarif préférentiel pour la reprise</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Ne vous découragez pas ! Notre équipe pédagogique est là pour vous aider à réussir lors de votre prochaine tentative.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"finalScore\", \"requiredScore\", \"passedModules\", \"totalModules\", \"attendanceRate\", \"retakeDate\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_failed_student'
            )
        ");

        // REFUNDED - Remboursement effectué (Étudiant)
        $this->addSql("
            INSERT INTO email_template (identifier, name, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at)
            SELECT 
                'reservation_status_refunded_student',
                'Remboursement effectué (Étudiant)',
                'reservation_status_change',
                'ROLE_STUDENT',
                1,
                'notification',
                '💰 Remboursement effectué',
                '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                    <h2 style=\"color: #38a169;\">💰 Remboursement traité</h2>
                    <p>Bonjour {{studentName}},</p>
                    <p>Nous vous confirmons que le remboursement concernant la formation <strong>{{formationTitle}}</strong> a été effectué.</p>
                    <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                        <p><strong>💳 Détails du remboursement :</strong></p>
                        <ul style=\"padding-left: 20px;\">
                            <li>Montant remboursé : {{refundAmount}}€</li>
                            <li>Mode de remboursement : {{refundMethod}}</li>
                            <li>Date de traitement : {{refundDate}}</li>
                            <li>Référence : {{refundReference}}</li>
                            <li>Délai de réception : {{expectedDelay}}</li>
                        </ul>
                    </div>
                    <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                        <p style=\"font-style: italic;\">{{customMessage}}</p>
                    </div>
                    <p>Nous espérons avoir l\\'occasion de vous accompagner dans de futurs projets de formation.</p>
                    <p>Cordialement,<br>L\\'équipe MerelFormation</p>
                </div>',
                '[\"studentName\", \"formationTitle\", \"refundAmount\", \"refundMethod\", \"refundDate\", \"refundReference\", \"expectedDelay\", \"customMessage\"]',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1 FROM email_template WHERE identifier = 'reservation_status_refunded_student'
            )
        ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer tous les templates ajoutés par cette migration
        $this->addSql("
            DELETE FROM email_template 
            WHERE identifier IN (
                'reservation_status_awaiting_payment_student',
                'reservation_status_payment_pending_student',
                'reservation_status_awaiting_start_student',
                'reservation_status_in_progress_student',
                'reservation_status_attendance_issues_student',
                'reservation_status_suspended_student',
                'reservation_status_failed_student',
                'reservation_status_refunded_student'
            )
        ");
    }
}
