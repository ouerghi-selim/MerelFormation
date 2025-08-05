<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer les 6 derniers templates email des réservations de véhicules
 * Partie 2/2 - Templates confirmed, in_progress, completed, cancelled, refunded
 */
final class Version20250729231000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Créer les 6 derniers templates email pour les réservations de véhicules (partie 2/2)';
    }

    public function up(Schema $schema): void
    {
        // ===== PHASE 4: CONFIRMATION =====

        // CONFIRMED - Réservation confirmée (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Réservation confirmée (Client)',
            'vehicle_rental_status_confirmed_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '✅ Réservation véhicule confirmée !',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #38a169;\">✅ Réservation confirmée !</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Excellente nouvelle ! Votre réservation véhicule est maintenant <strong>confirmée</strong>.</p>
                <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                    <p><strong>🚗 Détails de votre réservation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Véhicule : {{vehicleModel}}</li>
                        <li>Immatriculation : {{vehiclePlate}}</li>
                        <li>Centre d\\'examen : {{examCenter}}</li>
                        <li>Date d\\'examen : {{examDate}}</li>
                        <li>Lieu de prise en charge : {{pickupLocation}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>⚠️ Informations importantes :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Présentez-vous 30 minutes avant l\\'heure d\\'examen</li>
                        <li>Apportez : pièce d\\'identité + convocation + permis</li>
                        <li>Le véhicule sera nettoyé et vérifié avant remise</li>
                        <li>Respectez les consignes de conduite et de stationnement</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>📞 Contact d\\'urgence :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Numéro d\\'urgence : {{emergencyPhone}}</li>
                        <li>Email : {{contactEmail}}</li>
                        <li>Vous serez contacté(e) 24h avant par notre équipe</li>
                    </ul>
                </div>
                <p>Nous vous souhaitons bonne chance pour votre examen !</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'vehiclePlate', 'examCenter', 'examDate', 'pickupLocation', 'emergencyPhone', 'contactEmail'),
            NOW(),
            NOW()
        )");

        // ===== PHASE 5: LOCATION EN COURS =====

        // IN_PROGRESS - Location en cours (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Location en cours (Client)',
            'vehicle_rental_status_in_progress_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '🚗 Votre location véhicule est active',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #6b46c1;\">🚗 Location active</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre location véhicule est maintenant <strong>active</strong>. Bon examen !</p>
                <div style=\"background-color: #f3e8ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #6b46c1;\">
                    <p><strong>🚗 Véhicule en cours d\\'utilisation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Véhicule : {{vehicleModel}} ({{vehiclePlate}})</li>
                        <li>Pris en charge le : {{pickupDate}}</li>
                        <li>Lieu : {{pickupLocation}}</li>
                        <li>Retour prévu : {{returnDate}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>⚠️ Rappels importants :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Conduisez prudemment et respectez le code de la route</li>
                        <li>En cas de problème technique, contactez-nous immédiatement</li>
                        <li>Respectez l\\'heure de retour convenue</li>
                        <li>Rendez le véhicule dans l\\'état où vous l\\'avez reçu</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>📞 En cas d\\'urgence :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Numéro d\\'urgence : {{emergencyPhone}}</li>
                        <li>Disponible 24h/24 pour les urgences</li>
                    </ul>
                </div>
                <p>Nous vous souhaitons un excellent examen et une conduite en toute sécurité !</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'vehiclePlate', 'pickupDate', 'pickupLocation', 'returnDate', 'emergencyPhone'),
            NOW(),
            NOW()
        )");

        // ===== PHASE 6: FINALISATION =====

        // COMPLETED - Location terminée (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Location terminée (Client)',
            'vehicle_rental_status_completed_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '🎉 Location terminée - Merci pour votre confiance',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #38a169;\">🎉 Location terminée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre location véhicule s\\'est terminée avec succès. Merci pour votre confiance !</p>
                <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;\">
                    <p><strong>📋 Récapitulatif de votre location :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Véhicule : {{vehicleModel}} ({{vehiclePlate}})</li>
                        <li>Période : {{rentalPeriod}}</li>
                        <li>Centre d\\'examen : {{examCenter}}</li>
                        <li>Date de retour : {{returnDate}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>💰 Facturation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Votre facture définitive vous sera envoyée sous 48h</li>
                        <li>Aucun frais supplémentaire constaté</li>
                        <li>Mode de paiement : {{paymentMethod}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>⭐ Votre avis nous intéresse :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Comment s\\'est passée votre expérience ?</li>
                        <li>Avez-vous des suggestions d\\'amélioration ?</li>
                        <li>Recommanderiez-vous nos services ?</li>
                    </ul>
                </div>
                <p style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{{feedbackUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                        Laisser un avis
                    </a>
                </p>
                <p>Nous espérons que votre examen s\\'est bien déroulé et vous souhaitons une excellente route !</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'vehiclePlate', 'rentalPeriod', 'examCenter', 'returnDate', 'paymentMethod', 'feedbackUrl'),
            NOW(),
            NOW()
        )");

        // CANCELLED - Réservation annulée (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Réservation annulée (Client)',
            'vehicle_rental_status_cancelled_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '❌ Réservation véhicule annulée',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #e53e3e;\">❌ Réservation annulée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous informons que votre réservation véhicule a été annulée.</p>
                <div style=\"background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;\">
                    <p><strong>📋 Détails de l\\'annulation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Réservation : {{vehicleModel}} pour {{examCenter}}</li>
                        <li>Date d\\'annulation : {{cancellationDate}}</li>
                        <li>Raison : {{cancellationReason}}</li>
                        <li>Annulée par : {{cancelledBy}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>💰 Remboursement :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Si un paiement a été effectué, le remboursement sera traité</li>
                        <li>Délai de remboursement : 3 à 5 jours ouvrés</li>
                        <li>Mode de remboursement : même moyen de paiement</li>
                    </ul>
                </div>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>🔄 Nouvelle réservation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Vous pouvez effectuer une nouvelle réservation à tout moment</li>
                        <li>{{alternativeVehicles}}</li>
                        <li>Notre équipe peut vous aider à trouver une solution</li>
                    </ul>
                </div>
                <p>Nous nous excusons pour la gêne occasionnée et restons à votre disposition pour toute question.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'vehicleModel', 'examCenter', 'cancellationDate', 'cancellationReason', 'cancelledBy', 'alternativeVehicles'),
            NOW(),
            NOW()
        )");

        // REFUNDED - Remboursement effectué (Client)
        $this->addSql("INSERT INTO email_template (name, identifier, event_type, target_role, is_system, type, subject, content, variables, created_at, updated_at) VALUES (
            'Véhicule - Remboursement effectué (Client)',
            'vehicle_rental_status_refunded_student',
            'vehicle_rental_status_updated',
            'ROLE_STUDENT',
            1,
            'notification',
            '💸 Remboursement effectué',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;\">
                <h2 style=\"color: #6b7280;\">💸 Remboursement traité</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Le remboursement de votre réservation véhicule annulée a été traité avec succès.</p>
                <div style=\"background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #6b7280;\">
                    <p><strong>💰 Détails du remboursement :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Montant remboursé : {{refundAmount}} €</li>
                        <li>Date de traitement : {{refundDate}}</li>
                        <li>Mode de remboursement : {{refundMethod}}</li>
                        <li>Référence : {{refundReference}}</li>
                    </ul>
                </div>
                <div style=\"background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;\">
                    <p><strong>⏱️ Délais de réception :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Carte bancaire : 3 à 5 jours ouvrés</li>
                        <li>Virement : 1 à 3 jours ouvrés</li>
                        <li>Le remboursement apparaîtra sur votre relevé de compte</li>
                    </ul>
                </div>
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;\">
                    <p><strong>🔄 Nouvelle réservation :</strong></p>
                    <ul style=\"padding-left: 20px;\">
                        <li>Vous pouvez effectuer une nouvelle réservation</li>
                        <li>Profitez de votre expérience pour choisir au mieux</li>
                        <li>Notre équipe reste disponible pour vous conseiller</li>
                    </ul>
                </div>
                <p style=\"text-align: center; margin: 20px 0;\">
                    <a href=\"{{newReservationUrl}}\" style=\"background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">
                        Nouvelle réservation
                    </a>
                </p>
                <p>Nous espérons avoir l\\'occasion de vous servir à nouveau prochainement.</p>
                <p>Cordialement,<br>L\\'équipe MerelFormation</p>
            </div>',
            JSON_ARRAY('studentName', 'refundAmount', 'refundDate', 'refundMethod', 'refundReference', 'newReservationUrl'),
            NOW(),
            NOW()
        )");
    }

    public function down(Schema $schema): void
    {
        // Supprimer les 6 derniers templates créés par cette migration
        $templatesIdentifiers = [
            'vehicle_rental_status_confirmed_student',
            'vehicle_rental_status_in_progress_student',
            'vehicle_rental_status_completed_student',
            'vehicle_rental_status_cancelled_student',
            'vehicle_rental_status_refunded_student'
        ];
        
        foreach ($templatesIdentifiers as $identifier) {
            $this->addSql("DELETE FROM email_template WHERE identifier = ?", [$identifier]);
        }
    }
}