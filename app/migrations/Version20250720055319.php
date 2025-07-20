<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250720055319 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add customMessage variable to reservation status email templates and update content to include custom message section';
    }

    public function up(Schema $schema): void
    {
        // Ajouter la variable customMessage à tous les templates de statut de réservation
        $this->addSql("
            UPDATE email_template 
            SET variables = JSON_ARRAY_APPEND(variables, '$', 'customMessage')
            WHERE identifier LIKE 'reservation_status_%_student'
            AND JSON_SEARCH(variables, 'one', 'customMessage') IS NULL
        ");

        // Mettre à jour le contenu des templates pour inclure le message personnalisé
        // Template pour statut confirmed
        $this->addSql("
            UPDATE email_template 
            SET content = REPLACE(content, 
                '<p>Nous avons hâte de vous accueillir et de vous accompagner dans votre parcours de formation !</p>',
                '
                <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                    <p style=\"font-style: italic;\">{{customMessage}}</p>
                </div>
                <p>Nous avons hâte de vous accueillir et de vous accompagner dans votre parcours de formation !</p>'
            )
            WHERE identifier = 'reservation_status_confirmed_student'
        ");

        // Template pour statut awaiting_documents
        $this->addSql("
            UPDATE email_template 
            SET content = REPLACE(content, 
                '<p>Cordialement,<br>MerelFormation</p>',
                '
                <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                    <p style=\"font-style: italic;\">{{customMessage}}</p>
                </div>'
            )
            WHERE identifier = 'reservation_status_awaiting_documents_student'
        ");

        // Template pour statut cancelled
        $this->addSql("
            UPDATE email_template 
            SET content = REPLACE(content, 
                '<p>Cordialement,<br> MerelFormation</p>',
                '
                <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                    <p style=\"font-style: italic;\">{{customMessage}}</p>
                </div>
                <p>Cordialement,<br>MerelFormation</p>'
            )
            WHERE identifier = 'reservation_status_cancelled_student'
        ");

        // Mettre à jour tous les autres templates de statut avec une approche générique
        $this->addSql("
            UPDATE email_template 
            SET content = REPLACE(content, 
                '</div>',
                '
                <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                    <p style=\"font-style: italic;\">{{customMessage}}</p>
                </div>
                </div>'
            )
            WHERE identifier LIKE 'reservation_status_%_student'
            AND identifier NOT IN ('reservation_status_confirmed_student', 'reservation_status_awaiting_documents_student', 'reservation_status_cancelled_student')
            AND content NOT LIKE '%Message personnalisé%'
            AND content LIKE '%</div>'
            AND SUBSTRING_INDEX(content, '</div>', -1) = ''
        ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer la variable customMessage des templates
        $this->addSql("
            UPDATE email_template 
            SET variables = JSON_REMOVE(variables, JSON_UNQUOTE(JSON_SEARCH(variables, 'one', 'customMessage')))
            WHERE identifier LIKE 'reservation_status_%_student'
            AND JSON_SEARCH(variables, 'one', 'customMessage') IS NOT NULL
        ");

        // Supprimer les sections de message personnalisé du contenu
        $this->addSql("
            UPDATE email_template 
            SET content = REPLACE(content, 
                '
                <div style=\"background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;\">
                    <p style=\"font-style: italic;\">{{customMessage}}</p>
                </div>
                ',
                ''
            )
            WHERE identifier LIKE 'reservation_status_%_student'
            AND content LIKE '%Message personnalisé%'
        ");
    }
}
