<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajouter la section message personnalisé aux templates email véhicules
 */
final class Version20250729235000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajouter la section message personnalisé aux templates email véhicules';
    }

    public function up(Schema $schema): void
    {
        // Section message personnalisé à ajouter
        $messageSection = '{{#if message}}<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;"><p><strong>📝 Message de notre équipe :</strong></p><p style="font-style: italic; color: #856404;">{{message}}</p></div>{{/if}}';

        // Liste des templates véhicules avec leurs points d'insertion
        $templates = [
            'vehicle_rental_status_submitted_student' => [
                'search' => '<p>Merci pour votre confiance. Nous reviendrons vers vous très prochainement.</p>',
                'replace' => $messageSection . '<p>Merci pour votre confiance. Nous reviendrons vers vous très prochainement.</p>'
            ],
            'vehicle_rental_status_under_review_student' => [
                'search' => '<p>Cette étape nous permet de vous garantir le meilleur service. Vous serez informé(e) du résultat dans les plus brefs délais.</p>',
                'replace' => $messageSection . '<p>Cette étape nous permet de vous garantir le meilleur service. Vous serez informé(e) du résultat dans les plus brefs délais.</p>'
            ],
            'vehicle_rental_status_awaiting_documents_student' => [
                'search' => '<p>Dès réception de vos documents, nous procéderons à leur validation dans les 24-48h ouvrées.</p>',
                'replace' => $messageSection . '<p>Dès réception de vos documents, nous procéderons à leur validation dans les 24-48h ouvrées.</p>'
            ],
            'vehicle_rental_status_documents_pending_student' => [
                'search' => '<p>Merci pour votre patience. Nous mettons tout en œuvre pour traiter votre dossier rapidement.</p>',
                'replace' => $messageSection . '<p>Merci pour votre patience. Nous mettons tout en œuvre pour traiter votre dossier rapidement.</p>'
            ],
            'vehicle_rental_status_documents_rejected_student' => [
                'search' => '<p>N\'hésitez pas à nous contacter si vous avez besoin d\'aide pour corriger vos documents.</p>',
                'replace' => $messageSection . '<p>N\'hésitez pas à nous contacter si vous avez besoin d\'aide pour corriger vos documents.</p>'
            ],
            'vehicle_rental_status_awaiting_payment_student' => [
                'search' => '<p>Dès réception de votre paiement, votre véhicule sera définitivement réservé.</p>',
                'replace' => $messageSection . '<p>Dès réception de votre paiement, votre véhicule sera définitivement réservé.</p>'
            ],
            'vehicle_rental_status_payment_pending_student' => [
                'search' => '<p>Merci pour votre confiance. Vous recevrez une confirmation dès que le paiement sera validé.</p>',
                'replace' => $messageSection . '<p>Merci pour votre confiance. Vous recevrez une confirmation dès que le paiement sera validé.</p>'
            ],
            'vehicle_rental_status_confirmed_student' => [
                'search' => '<p>Nous vous souhaitons bonne chance pour votre examen !</p>',
                'replace' => $messageSection . '<p>Nous vous souhaitons bonne chance pour votre examen !</p>'
            ],
            'vehicle_rental_status_in_progress_student' => [
                'search' => '<p>Nous vous souhaitons un excellent examen et une conduite en toute sécurité !</p>',
                'replace' => $messageSection . '<p>Nous vous souhaitons un excellent examen et une conduite en toute sécurité !</p>'
            ],
            'vehicle_rental_status_completed_student' => [
                'search' => '<p>Nous espérons que votre examen s\'est bien déroulé et vous souhaitons une excellente route !</p>',
                'replace' => $messageSection . '<p>Nous espérons que votre examen s\'est bien déroulé et vous souhaitons une excellente route !</p>'
            ],
            'vehicle_rental_status_cancelled_student' => [
                'search' => '<p>Nous nous excusons pour la gêne occasionnée et restons à votre disposition pour toute question.</p>',
                'replace' => $messageSection . '<p>Nous nous excusons pour la gêne occasionnée et restons à votre disposition pour toute question.</p>'
            ],
            'vehicle_rental_status_refunded_student' => [
                'search' => '<p>Nous espérons avoir l\'occasion de vous servir à nouveau prochainement.</p>',
                'replace' => $messageSection . '<p>Nous espérons avoir l\'occasion de vous servir à nouveau prochainement.</p>'
            ]
        ];

        // Appliquer les modifications pour chaque template
        foreach ($templates as $identifier => $replacement) {
            $this->addSql(
                'UPDATE email_template SET content = REPLACE(content, :search, :replace) WHERE identifier = :identifier',
                [
                    'search' => $replacement['search'],
                    'replace' => $replacement['replace'],
                    'identifier' => $identifier
                ]
            );
        }

        // Ajouter 'message' dans les variables des templates véhicules
        $this->addSql("UPDATE email_template SET variables = JSON_ARRAY_APPEND(variables, '$', 'message') WHERE identifier LIKE 'vehicle_rental_status_%' AND JSON_SEARCH(variables, 'one', 'message') IS NULL");
    }

    public function down(Schema $schema): void
    {
        // Section message à supprimer lors du rollback
        $messageSection = '{{#if message}}<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;"><p><strong>📝 Message de notre équipe :</strong></p><p style="font-style: italic; color: #856404;">{{message}}</p></div>{{/if}}';

        // Supprimer la section message de tous les templates véhicules
        $this->addSql('UPDATE email_template SET content = REPLACE(content, :messageSection, \'\') WHERE identifier LIKE \'vehicle_rental_status_%\'', [
            'messageSection' => $messageSection
        ]);

        // Supprimer 'message' des variables
        $this->addSql("UPDATE email_template SET variables = JSON_REMOVE(variables, JSON_UNQUOTE(JSON_SEARCH(variables, 'one', 'message'))) WHERE identifier LIKE 'vehicle_rental_status_%'");
    }
}