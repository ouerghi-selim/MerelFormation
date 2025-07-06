<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250706195459 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les nouveaux contenus CMS : statistiques page d\'accueil, page location complète et page contact complète';
    }

    public function up(Schema $schema): void
    {
        // Page d'accueil - Statistiques
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('home_stats_students_label', 'Libellé Stagiaires Formés', 'Stagiaires Formés', 'home_statistics', 'label', 1, 1, NOW(), NOW()),
            ('home_stats_students_value', 'Nombre de stagiaires formés', '500+', 'home_statistics', 'value', 2, 1, NOW(), NOW()),
            ('home_stats_success_label', 'Libellé Taux de Réussite', 'Taux de Réussite', 'home_statistics', 'label', 3, 1, NOW(), NOW()),
            ('home_stats_success_value', 'Pourcentage de réussite', '95', 'home_statistics', 'value', 4, 1, NOW(), NOW()),
            ('home_stats_vehicles_label', 'Libellé Véhicules', 'Véhicules', 'home_statistics', 'label', 5, 1, NOW(), NOW()),
            ('home_stats_vehicles_value', 'Nombre de véhicules', '20+', 'home_statistics', 'value', 6, 1, NOW(), NOW()),
            ('home_stats_experience_label', 'Libellé Années d\'Expérience', 'Années d\'Expérience', 'home_statistics', 'label', 7, 1, NOW(), NOW()),
            ('home_stats_experience_value', 'Nombre d\'années d\'expérience', '15+', 'home_statistics', 'value', 8, 1, NOW(), NOW())");

        // Page Location - Hero
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_hero_title', 'Titre principal location', 'Location Véhicule « double commande »', 'location_hero', 'title', 1, 1, NOW(), NOW()),
            ('location_hero_subtitle', 'Sous-titre location', 'Véhicule équipé pour l\'examen TAXI & VTC', 'location_hero', 'subtitle', 2, 1, NOW(), NOW()),
            ('location_hero_cta', 'Bouton réservation', 'Réserver un véhicule', 'location_hero', 'button_text', 3, 1, NOW(), NOW())");

        // Page Location - Informations
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_info_title', 'Titre Examen TAXI-VTC', 'Examen TAXI-VTC', 'location_info', 'title', 1, 1, NOW(), NOW()),
            ('location_info_description', 'Description examen', 'Vous passez l\'examen pratique Taxi VTC ? Vous devez vous présenter le jour de l\'examen pratique avec un véhicule équipé des doubles commandes.', 'location_info', 'description', 2, 1, NOW(), NOW()),
            ('location_info_taxi_requirements', 'Exigences TAXI', 'Pour l\'examen TAXI : le véhicule devra être équipé de doubles commandes (pédaliers) et d\'un rétroviseur supplémentaire.', 'location_info', 'text', 3, 1, NOW(), NOW()),
            ('location_info_vtc_requirements', 'Exigences VTC', 'Pour l\'examen VTC : seul l\'équipement double commande est nécessaire pour la partie pratique.', 'location_info', 'text', 4, 1, NOW(), NOW()),
            ('location_info_footer', 'Conclusion informations', 'Nous vous proposons la location d\'un véhicule agréé pour l\'examen TAXI VTC à Rennes en Ille et Vilaine', 'location_info', 'text', 5, 1, NOW(), NOW())");

        // Page Location - Réservation
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_booking_title', 'Titre Comment réserver', 'Comment réserver ?', 'location_booking', 'title', 1, 1, NOW(), NOW()),
            ('location_booking_step1_title', 'Étape 1 - Titre', 'Choisissez votre date', 'location_booking', 'step_title', 2, 1, NOW(), NOW()),
            ('location_booking_step1_description', 'Étape 1 - Description', 'Sélectionnez la date et l\'heure de votre examen dans notre calendrier en ligne', 'location_booking', 'step_description', 3, 1, NOW(), NOW()),
            ('location_booking_step2_title', 'Étape 2 - Titre', 'Confirmez votre réservation', 'location_booking', 'step_title', 4, 1, NOW(), NOW()),
            ('location_booking_step2_description', 'Étape 2 - Description', 'Remplissez le formulaire avec vos informations et validez votre demande', 'location_booking', 'step_description', 5, 1, NOW(), NOW()),
            ('location_booking_step3_title', 'Étape 3 - Titre', 'Recevez la confirmation', 'location_booking', 'step_title', 6, 1, NOW(), NOW()),
            ('location_booking_step3_description', 'Étape 3 - Description', 'Nous vous contactons sous 24h pour confirmer et finaliser votre réservation', 'location_booking', 'step_description', 7, 1, NOW(), NOW())");

        // Page Location - Véhicules
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_vehicles_title', 'Titre Nos véhicules', 'Nos véhicules d\'examen', 'location_vehicles', 'title', 1, 1, NOW(), NOW()),
            ('location_vehicles_model', 'Modèle véhicule', 'Volkswagen Touran Taxi Auto-École', 'location_vehicles', 'text', 2, 1, NOW(), NOW()),
            ('location_vehicles_features', 'Caractéristiques véhicule', 'Véhicule récent, climatisé, équipé de doubles commandes et rétroviseurs supplémentaires conformes aux exigences', 'location_vehicles', 'text', 3, 1, NOW(), NOW()),
            ('location_vehicles_pricing', 'Information tarifs', 'Des tarifs différents pour préparer au mieux votre passage d\'examen, avec options de location à l\'heure ou à la journée.', 'location_vehicles', 'text', 4, 1, NOW(), NOW())");

        // Page Location - CTA Final
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('location_cta_title', 'Titre CTA location', 'Prêt pour votre examen de taxi ?', 'location_cta', 'title', 1, 1, NOW(), NOW()),
            ('location_cta_description', 'Description CTA location', 'Réservez dès maintenant votre véhicule équipé pour maximiser vos chances de réussite', 'location_cta', 'description', 2, 1, NOW(), NOW())");

        // Page Contact - Hero
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('contact_hero_title', 'Titre principal contact', 'Contactez-nous', 'contact_hero', 'title', 1, 1, NOW(), NOW()),
            ('contact_hero_description', 'Description principale contact', 'Une question sur nos formations ? Besoin d\'informations ? Notre équipe est à votre écoute pour vous accompagner dans votre projet professionnel.', 'contact_hero', 'description', 2, 1, NOW(), NOW())");

        // Page Contact - Informations
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('contact_info_phone_label', 'Libellé Téléphone', 'Téléphone', 'contact_info', 'label', 1, 1, NOW(), NOW()),
            ('contact_info_phone_value', 'Numéro de téléphone', '02 99 83 33 70', 'contact_info', 'value', 2, 1, NOW(), NOW()),
            ('contact_info_address_label', 'Libellé Adresse', 'Adresse', 'contact_info', 'label', 3, 1, NOW(), NOW()),
            ('contact_info_address_value', 'Adresse complète', '7 RUE Georges Maillols<br>35000 RENNES', 'contact_info', 'value', 4, 1, NOW(), NOW()),
            ('contact_info_hours_label', 'Libellé Horaires', 'Horaires', 'contact_info', 'label', 5, 1, NOW(), NOW()),
            ('contact_info_hours_value', 'Horaires d\'ouverture', 'Lundi - Vendredi<br>8h30 - 12h00 | 13h00 - 16h30', 'contact_info', 'value', 6, 1, NOW(), NOW()),
            ('contact_info_director_name', 'Nom du directeur', 'Jean-Louis MEREL', 'contact_info', 'text', 7, 1, NOW(), NOW())");

        // Page Contact - Carte
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('contact_map_title', 'Titre Nous situer', 'Nous situer', 'contact_map', 'title', 1, 1, NOW(), NOW()),
            ('contact_map_description', 'Description localisation', 'Facilement accessible en transports en commun et parking à proximité.', 'contact_map', 'description', 2, 1, NOW(), NOW())");

        // Page Contact - Formulaire
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('contact_form_title', 'Titre du formulaire', 'Envoyez-nous un message', 'contact_form', 'title', 1, 1, NOW(), NOW()),
            ('contact_form_firstname_label', 'Libellé Prénom', 'Prénom', 'contact_form', 'label', 2, 1, NOW(), NOW()),
            ('contact_form_lastname_label', 'Libellé Nom', 'Nom', 'contact_form', 'label', 3, 1, NOW(), NOW()),
            ('contact_form_email_label', 'Libellé Email', 'Email', 'contact_form', 'label', 4, 1, NOW(), NOW()),
            ('contact_form_phone_label', 'Libellé Téléphone', 'Téléphone', 'contact_form', 'label', 5, 1, NOW(), NOW()),
            ('contact_form_subject_label', 'Libellé Sujet', 'Sujet', 'contact_form', 'label', 6, 1, NOW(), NOW()),
            ('contact_form_message_label', 'Libellé Message', 'Votre message', 'contact_form', 'label', 7, 1, NOW(), NOW()),
            ('contact_form_submit_button', 'Bouton Envoyer', 'Envoyer le message', 'contact_form', 'button_text', 8, 1, NOW(), NOW()),
            ('contact_form_gdpr_text', 'Texte RGPD', 'En soumettant ce formulaire, vous acceptez que les informations saisies soient utilisées pour vous recontacter.', 'contact_form', 'text', 9, 1, NOW(), NOW()),
            ('contact_form_success_message', 'Message de succès', 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'contact_form', 'message', 10, 1, NOW(), NOW()),
            ('contact_form_error_message', 'Message d\'erreur', 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'contact_form', 'message', 11, 1, NOW(), NOW())");

        // Page Contact - Informations légales
        $this->addSql("INSERT INTO content_text (identifier, title, content, section, type, sort_order, is_active, created_at, updated_at) VALUES 
            ('contact_legal_title', 'Titre Informations légales', 'Informations légales', 'contact_legal', 'title', 1, 1, NOW(), NOW()),
            ('contact_legal_mediation_title', 'Titre Médiation', 'Médiation', 'contact_legal', 'title', 2, 1, NOW(), NOW()),
            ('contact_legal_company_info', 'Informations entreprise', 'SARL MEREL FORMATION<br>Capital social : 15 000 €<br>SIRET : 123 456 789 00012<br>APE : 8559A', 'contact_legal', 'text', 3, 1, NOW(), NOW()),
            ('contact_legal_mediation_info', 'Informations médiation', 'En cas de litige, vous pouvez saisir le médiateur de la consommation compétent.', 'contact_legal', 'text', 4, 1, NOW(), NOW())");
    }

    public function down(Schema $schema): void
    {
        // Supprimer tous les contenus ajoutés par cette migration
        $identifiers = [
            'home_stats_students_label', 'home_stats_students_value', 'home_stats_success_label', 'home_stats_success_value',
            'home_stats_vehicles_label', 'home_stats_vehicles_value', 'home_stats_experience_label', 'home_stats_experience_value',
            'location_hero_title', 'location_hero_subtitle', 'location_hero_cta',
            'location_info_title', 'location_info_description', 'location_info_taxi_requirements', 'location_info_vtc_requirements', 'location_info_footer',
            'location_booking_title', 'location_booking_step1_title', 'location_booking_step1_description',
            'location_booking_step2_title', 'location_booking_step2_description', 'location_booking_step3_title', 'location_booking_step3_description',
            'location_vehicles_title', 'location_vehicles_model', 'location_vehicles_features', 'location_vehicles_pricing',
            'location_cta_title', 'location_cta_description',
            'contact_hero_title', 'contact_hero_description',
            'contact_info_phone_label', 'contact_info_phone_value', 'contact_info_address_label', 'contact_info_address_value',
            'contact_info_hours_label', 'contact_info_hours_value', 'contact_info_director_name',
            'contact_map_title', 'contact_map_description',
            'contact_form_title', 'contact_form_firstname_label', 'contact_form_lastname_label', 'contact_form_email_label',
            'contact_form_phone_label', 'contact_form_subject_label', 'contact_form_message_label', 'contact_form_submit_button',
            'contact_form_gdpr_text', 'contact_form_success_message', 'contact_form_error_message',
            'contact_legal_title', 'contact_legal_mediation_title', 'contact_legal_company_info', 'contact_legal_mediation_info'
        ];

        foreach ($identifiers as $identifier) {
            $this->addSql("DELETE FROM content_text WHERE identifier = '$identifier'");
        }
    }
}
