<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer les 12 templates email des réservations de véhicules
 * Cette migration remplace VehicleRentalEmailTemplateFixtures.php
 */
final class Version20250729230000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Créer les 12 templates email pour les réservations de véhicules (remplace la fixture)';
    }

    public function up(Schema $schema): void
    {
        // ===== PHASE 1: DEMANDE INITIALE =====

        // SUBMITTED - Demande soumise (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Demande de véhicule soumise (Client)',
            'vehicle_rental_status_submitted_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '✅ Votre demande de véhicule a été soumise',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #3182ce;\">🚗 Demande de véhicule soumise</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre demande de réservation véhicule a été soumise avec succès !</p>
                <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                    <p><strong>Détails de votre demande :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Véhicule : {{vehicleModel}}</li>
                        <li>Centre d\\'examen : {{examCenter}}</li>
                        <li>Dates : {{rentalDates}}</li>
                        <li>Numéro de demande : {{rentalId}}</li>
                        <li>Date de soumission : {{submissionDate}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>📋 Prochaines étapes :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Votre demande va être examinée par notre équipe</li>
                        <li>Nous vérifierons la disponibilité du véhicule</li>
                        <li>Vous recevrez une notification à chaque étape</li>
                        <li>Délai de traitement initial : 24-48h ouvrées</li>
                    </ul>
                </div>
                <p style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{{trackingUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                        Suivre ma demande
                    </a>
                </p>
                <p>Merci pour votre confiance. Nous reviendrons vers vous très prochainement.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'examCenter', 'rentalDates', 'rentalId', 'submissionDate', 'trackingUrl'),
            NOW(),
            NOW()
        )");

        // UNDER_REVIEW - En cours d'examen (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Demande véhicule en cours d\\'examen (Client)',
            'vehicle_rental_status_under_review_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '🔍 Votre demande de véhicule est en cours d\\'examen',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #3182ce;\">🔍 Examen en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre demande de véhicule pour <strong>{{examCenter}}</strong> est maintenant <strong>en cours d\\'examen</strong> par notre équipe.</p>
                <div style=\"background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;\">
                    <p><strong>📝 Ce que nous vérifions :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Disponibilité du véhicule aux dates demandées</li>
                        <li>Compatibilité avec votre examen</li>
                        <li>Vérification de vos pièces d\\'identité</li>
                        <li>Validation de votre dossier</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>🚗 Détails de votre réservation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Véhicule demandé : {{vehicleModel}}</li>
                        <li>Centre d\\'examen : {{examCenter}}</li>
                        <li>Période : {{rentalDates}}</li>
                    </ul>
                </div>
                <p>Cette étape nous permet de vous garantir le meilleur service. Vous serez informé(e) du résultat dans les plus brefs délais.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'examCenter', 'rentalDates'),
            NOW(),
            NOW()
        )");

        // ===== PHASE 2: VÉRIFICATIONS ADMINISTRATIVES =====

        // AWAITING_DOCUMENTS - En attente de documents (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - En attente de documents (Client)',
            'vehicle_rental_status_awaiting_documents_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '📄 Documents requis pour votre réservation véhicule',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #ed8936;\">📄 Documents requis</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Pour finaliser votre réservation véhicule pour <strong>{{examCenter}}</strong>, nous avons besoin de documents complémentaires.</p>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;\">
                    <p><strong>📋 Documents obligatoires :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Permis de conduire provisoire ou définitif (recto-verso)</li>
                        <li>Pièce d\\'identité valide (recto-verso)</li>
                        <li>Convocation à l\\'examen (si disponible)</li>
                        <li>Justificatif de domicile de moins de 3 mois</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>💡 Comment procéder :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Scannez ou photographiez vos documents</li>
                        <li>Assurez-vous qu\\'ils sont lisibles et complets</li>
                        <li>Formats acceptés : PDF, JPG, PNG</li>
                        <li>Taille maximum : 5 Mo par document</li>
                    </ul>
                </div>
                <p style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{{documentUploadUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                        Télécharger mes documents
                    </a>
                </p>
                <p>Dès réception de vos documents, nous procéderons à leur validation dans les 24-48h ouvrées.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'examCenter', 'documentUploadUrl'),
            NOW(),
            NOW()
        )");

        // DOCUMENTS_PENDING - Documents en cours de validation (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Documents en cours de validation (Client)',
            'vehicle_rental_status_documents_pending_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '⏳ Vos documents sont en cours de validation',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #ed8936;\">⏳ Validation en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Merci d\\'avoir transmis vos documents ! Notre équipe procède actuellement à leur validation pour votre réservation véhicule.</p>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;\">
                    <p><strong>📋 Documents reçus :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Date de réception : {{documentsReceivedDate}}</li>
                        <li>Réservation : Véhicule pour {{examCenter}}</li>
                        <li>Statut : En cours de vérification</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>⏱️ Délais de traitement :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Validation administrative : 24-48h ouvrées</li>
                        <li>Notification du résultat par email automatique</li>
                        <li>En cas de document non conforme, nous vous le signalerons</li>
                        <li>Après validation : Passage au devis personnalisé</li>
                    </ul>
                </div>
                <p>Merci pour votre patience. Nous mettons tout en œuvre pour traiter votre dossier rapidement.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'examCenter', 'documentsReceivedDate'),
            NOW(),
            NOW()
        )");

        // DOCUMENTS_REJECTED - Documents refusés (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Documents refusés (Client)',
            'vehicle_rental_status_documents_rejected_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '❌ Action requise : Documents à corriger',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #e53e3e;\">❌ Documents à corriger</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Après examen de vos documents pour la réservation véhicule, nous devons vous demander de les corriger ou de les compléter.</p>
                <div style=\"background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;\">
                    <p><strong>❗ Problèmes identifiés :</strong></p>
                    <div style=\"padding-left: 20px; color: #744210; font-style: italic;\">
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
                <p style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{{documentUploadUrl}}\" style=\"background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                        Corriger mes documents
                    </a>
                </p>
                <p>N\\'hésitez pas à nous contacter si vous avez besoin d\\'aide pour corriger vos documents.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'rejectionReason', 'documentUploadUrl'),
            NOW(),
            NOW()
        )");

        // ===== PHASE 3: VALIDATION FINANCIÈRE =====

        // AWAITING_PAYMENT - En attente de paiement (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - En attente de paiement (Client)',
            'vehicle_rental_status_awaiting_payment_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '💳 Devis personnalisé - Paiement requis',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #d69e2e;\">💳 Devis personnalisé</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre dossier a été validé ! Voici votre devis personnalisé pour la réservation véhicule.</p>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>🚗 Détails de votre réservation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Véhicule : {{vehicleModel}}</li>
                        <li>Centre d\\'examen : {{examCenter}}</li>
                        <li>Dates : {{rentalDates}}</li>
                        <li>Lieu de prise en charge : {{pickupLocation}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                    <p><strong>💰 Tarification :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Prix de base : {{basePrice}} €</li>
                        <li>Options supplémentaires : {{optionsPrice}} €</li>
                        <li><strong>Total à régler : {{totalPrice}} €</strong></li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>💳 Moyens de paiement :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Paiement en ligne sécurisé (CB, PayPal)</li>
                        <li>Virement bancaire</li>
                        <li>Chèque (ordre : MerelFormation)</li>
                        <li>Paiement comptant à l\\'agence</li>
                    </ul>
                </div>
                <p style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{{paymentUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                        Procéder au paiement
                    </a>
                </p>
                <p>Dès réception de votre paiement, votre véhicule sera définitivement réservé.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'examCenter', 'rentalDates', 'pickupLocation', 'basePrice', 'optionsPrice', 'totalPrice', 'paymentUrl'),
            NOW(),
            NOW()
        )");

        // PAYMENT_PENDING - Paiement en cours (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Paiement en cours (Client)',
            'vehicle_rental_status_payment_pending_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '⏳ Paiement en cours de traitement',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #d69e2e;\">⏳ Paiement en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons bien reçu votre paiement pour la réservation véhicule. Il est actuellement en cours de traitement.</p>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>📋 Informations du paiement :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Montant : {{paidAmount}} €</li>
                        <li>Mode de paiement : {{paymentMethod}}</li>
                        <li>Date de réception : {{paymentDate}}</li>
                        <li>Référence : {{paymentReference}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>⏱️ Délais de traitement :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Validation du paiement : 24-48h ouvrées</li>
                        <li>Confirmation de réservation : Automatique après validation</li>
                        <li>Instructions de prise en charge : Dans les 48h</li>
                        <li>Contact véhicule : 24h avant votre examen</li>
                    </ul>
                </div>
                <p>Merci pour votre confiance. Vous recevrez une confirmation dès que le paiement sera validé.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'paidAmount', 'paymentMethod', 'paymentDate', 'paymentReference'),
            NOW(),
            NOW()
        )");
    }

    public function down(Schema $schema): void
    {
        // Supprimer tous les templates véhicules créés par cette migration
        $this->addSql("DELETE FROM email_template WHERE identifier LIKE 'vehicle_rental_status_%'");
    }
}