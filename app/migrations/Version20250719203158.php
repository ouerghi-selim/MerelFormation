<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250719203158 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add email templates for document validation and rejection';
    }

    public function up(Schema $schema): void
    {
        // Template pour validation de document
        $this->addSql("
            INSERT INTO email_template (identifier, event_type, target_role, is_system, name, subject, content, variables, type, created_at, updated_at) 
            VALUES (
                'document_validated_student', 
                'document_validated', 
                'ROLE_STUDENT', 
                1, 
                'Document validé - Étudiant',
                'Votre document d\'inscription a été validé', 
                '<!DOCTYPE html>
<html lang=\"fr\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Document validé</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .success-box { background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .document-info { background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class=\"container\">
        <div class=\"header\">
            <h1>🎉 Document Validé</h1>
        </div>
        <div class=\"content\">
            <p>Bonjour <strong>{{studentName}}</strong>,</p>
            
            <div class=\"success-box\">
                <h3 style=\"color: #16a34a; margin-top: 0;\">✅ Validation confirmée</h3>
                <p style=\"margin-bottom: 0;\">Votre document d\'inscription a été validé avec succès par notre équipe.</p>
            </div>
            
            <div class=\"document-info\">
                <h4>Informations du document :</h4>
                <ul>
                    <li><strong>Document :</strong> {{documentTitle}}</li>
                    <li><strong>Validé par :</strong> {{validatedBy}}</li>
                    <li><strong>Date de validation :</strong> {{validatedDate}}</li>
                </ul>
            </div>
            
            <p>Votre document d\'inscription est maintenant officiellement approuvé. Vous pouvez continuer votre processus d\'inscription en toute sérénité.</p>
            
            <a href=\"{{loginUrl}}\" class=\"button\">Accéder à mon espace</a>
            
            <p style=\"margin-top: 30px;\">
                Si vous avez des questions, n\'hésitez pas à nous contacter.<br>
                <strong>Équipe MerelFormation</strong>
            </p>
        </div>
        <div class=\"footer\">
            <p>&copy; 2025 MerelFormation - Centre de formation taxi professionnel</p>
        </div>
    </div>
</body>
</html>', 
                '[\"studentName\", \"documentTitle\", \"validatedBy\", \"validatedDate\", \"loginUrl\"]',
                'document',
                NOW(), 
                NOW()
            )
        ");

        // Template pour rejet de document
        $this->addSql("
            INSERT INTO email_template (identifier, event_type, target_role, is_system, name, subject, content, variables, type, created_at, updated_at) 
            VALUES (
                'document_rejected_student', 
                'document_rejected', 
                'ROLE_STUDENT', 
                1, 
                'Document rejeté - Étudiant',
                'Votre document d\'inscription nécessite des corrections', 
                '<!DOCTYPE html>
<html lang=\"fr\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Document à corriger</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .warning-box { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .document-info { background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .reason-box { background-color: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class=\"container\">
        <div class=\"header\">
            <h1>📋 Document à Corriger</h1>
        </div>
        <div class=\"content\">
            <p>Bonjour <strong>{{studentName}}</strong>,</p>
            
            <div class=\"warning-box\">
                <h3 style=\"color: #f59e0b; margin-top: 0;\">⚠️ Correction nécessaire</h3>
                <p style=\"margin-bottom: 0;\">Votre document d\'inscription nécessite des corrections avant validation.</p>
            </div>
            
            <div class=\"document-info\">
                <h4>Informations du document :</h4>
                <ul>
                    <li><strong>Document :</strong> {{documentTitle}}</li>
                    <li><strong>Examiné par :</strong> {{rejectedBy}}</li>
                    <li><strong>Date d\'examen :</strong> {{rejectedDate}}</li>
                </ul>
            </div>
            
            <div class=\"reason-box\">
                <h4 style=\"color: #dc2626; margin-top: 0;\">Raison du rejet :</h4>
                <p style=\"margin-bottom: 0;\">{{rejectionReason}}</p>
            </div>
            
            <p>Pour poursuivre votre inscription, veuillez corriger votre document selon les indications ci-dessus et le soumettre à nouveau.</p>
            
            <a href=\"{{loginUrl}}\" class=\"button\">Corriger mon document</a>
            
            <p style=\"margin-top: 30px;\">
                Notre équipe reste à votre disposition pour vous accompagner.<br>
                <strong>Équipe MerelFormation</strong>
            </p>
        </div>
        <div class=\"footer\">
            <p>&copy; 2025 MerelFormation - Centre de formation taxi professionnel</p>
        </div>
    </div>
</body>
</html>', 
                '[\"studentName\", \"documentTitle\", \"rejectedBy\", \"rejectedDate\", \"rejectionReason\", \"loginUrl\"]',
                'document',
                NOW(), 
                NOW()
            )
        ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer les templates ajoutés
        $this->addSql("DELETE FROM email_template WHERE event_type IN ('document_validated', 'document_rejected')");
    }
}
