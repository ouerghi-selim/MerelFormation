<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter le template email de réinitialisation de mot de passe
 */
final class Version20250914140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute le template email pour la réinitialisation de mot de passe';
    }

    public function up(Schema $schema): void
    {
        // Insérer le template email PASSWORD_RESET
        $this->addSql("INSERT INTO email_template (
            name, 
            identifier, 
            event_type, 
            target_role, 
            is_system, 
            type, 
            subject, 
            content, 
            variables, 
            created_at, 
            updated_at
        ) VALUES (
            'Réinitialisation de mot de passe',
            'password_reset_user',
            'password_reset',
            'ROLE_STUDENT',
            1,
            'notification',
            'Réinitialisation de votre mot de passe - MerelFormation',
            '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; background-color: #ffffff;\">
                <div style=\"text-align: center; margin-bottom: 30px;\">
                    <h2 style=\"color: #1a365d; margin-bottom: 10px;\">🔐 Réinitialisation de mot de passe</h2>
                    <div style=\"width: 50px; height: 3px; background: linear-gradient(90deg, #3182ce, #63b3ed); margin: 0 auto;\"></div>
                </div>
                
                <p style=\"font-size: 16px; color: #4a5568; line-height: 1.6;\">Bonjour <strong>{{userName}}</strong>,</p>
                
                <p style=\"font-size: 16px; color: #4a5568; line-height: 1.6;\">
                    Vous avez demandé la réinitialisation de votre mot de passe pour votre compte MerelFormation.
                </p>
                
                <div style=\"background: linear-gradient(135deg, #ebf8ff, #bee3f8); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3182ce;\">
                    <p style=\"margin: 0; font-size: 16px; color: #2d3748;\">
                        <strong>⚠️ Important :</strong> Ce lien est valable pendant <strong>{{expirationTime}}</strong> seulement.
                    </p>
                </div>
                
                <div style=\"text-align: center; margin: 30px 0;\">
                    <a href=\"{{resetUrl}}\" 
                       style=\"display: inline-block; background: linear-gradient(135deg, #3182ce, #2c5282); 
                              color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; 
                              font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">
                        🔑 Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <div style=\"background-color: #fef5e7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d69e2e;\">
                    <p style=\"margin: 0; font-size: 14px; color: #744210;\">
                        <strong>Sécurité :</strong> Si vous n\\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. 
                        Votre mot de passe actuel reste inchangé.
                    </p>
                </div>
                
                <p style=\"font-size: 14px; color: #718096; line-height: 1.6;\">
                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                    <span style=\"word-break: break-all; color: #3182ce;\">{{resetUrl}}</span>
                </p>
                
                <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;\">
                    <p style=\"font-size: 14px; color: #718096; margin: 0;\">
                        Cordialement,<br>
                        <strong style=\"color: #2d3748;\">L\\'équipe MerelFormation</strong><br>
                        <span style=\"color: #a0aec0;\">Centre de formation taxi de référence</span>
                    </p>
                </div>
            </div>',
            '[\"userName\", \"resetUrl\", \"expirationTime\", \"userEmail\"]',
            NOW(),
            NOW()
        )");
    }

    public function down(Schema $schema): void
    {
        // Supprimer le template ajouté
        $this->addSql("DELETE FROM email_template WHERE identifier = 'password_reset_user'");
    }
}