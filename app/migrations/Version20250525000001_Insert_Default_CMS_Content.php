<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour insérer les contenus par défaut du CMS
 * Cette migration transfère les données en dur des pages front-end vers les tables CMS
 */
final class Version20250525000001_Insert_Default_CMS_Content extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Insert default CMS content from hardcoded frontend data';
    }

    public function up(Schema $schema): void
    {
        // CONTENU TEXTE POUR LA PAGE D'ACCUEIL

        // Section Hero Page d'accueil
        $this->addSql("INSERT INTO content_text (section, type, identifier, title, content, is_active, sort_order, created_at, updated_at) VALUES 
        ('home_hero', 'title', 'home_hero_title', 'Titre Hero Accueil', 'Devenez Chauffeur de Taxi Professionnel', true, 1, NOW(), NOW()),
        ('home_hero', 'description', 'home_hero_description', 'Description Hero Accueil', 'Formation certifiante et location de véhicules pour réussir dans le métier de taxi. Plus de 500 professionnels formés avec 95% de réussite.', true, 2, NOW(), NOW()),
        ('home_hero', 'cta_text', 'home_hero_cta_formations', 'CTA Formations', 'Découvrir nos formations', true, 3, NOW(), NOW()),
        ('home_hero', 'cta_text', 'home_hero_cta_location', 'CTA Location', 'Location de véhicules', true, 4, NOW(), NOW()),
        ('home_hero', 'text', 'home_hero_community', 'Texte Communauté', 'Rejoignez plus de 500 chauffeurs formés', true, 5, NOW(), NOW())
    ");

        // Section Services Page d'accueil
        $this->addSql("INSERT INTO content_text (section, type, identifier, title, content, is_active, sort_order, created_at, updated_at) VALUES 
        ('home_services', 'title', 'home_services_title', 'Titre Services', 'Nos Services Complets', true, 1, NOW(), NOW()),
        ('home_services', 'description', 'home_services_description', 'Description Services', 'Une offre complète pour votre réussite professionnelle, de la formation à la mise en route.', true, 2, NOW(), NOW()),
        ('home_services', 'service_title', 'service_formation_title', 'Titre Service Formation', 'Formation Taxi', true, 3, NOW(), NOW()),
        ('home_services', 'service_description', 'service_formation_description', 'Description Service Formation', 'Formation initiale et continue pour les chauffeurs de taxi. Programme complet et certifiant.', true, 4, NOW(), NOW()),
        ('home_services', 'service_title', 'service_location_title', 'Titre Service Location', 'Location Véhicules', true, 5, NOW(), NOW()),
        ('home_services', 'service_description', 'service_location_description', 'Description Service Location', 'Location de véhicules équipés et adaptés pour l''activité de taxi.', true, 6, NOW(), NOW()),
        ('home_services', 'service_title', 'service_planning_title', 'Titre Service Planning', 'Planning Flexible', true, 7, NOW(), NOW()),
        ('home_services', 'service_description', 'service_planning_description', 'Description Service Planning', 'Des sessions de formation adaptées à vos disponibilités.', true, 8, NOW(), NOW())
    ");

        // Section CTA Page d'accueil
        $this->addSql("INSERT INTO content_text (section, type, identifier, title, content, is_active, sort_order, created_at, updated_at) VALUES 
        ('home_cta', 'title', 'home_cta_title', 'Titre CTA Final', 'Prêt à démarrer votre carrière ?', true, 1, NOW(), NOW()),
        ('home_cta', 'description', 'home_cta_description', 'Description CTA Final', 'Inscrivez-vous à nos formations et lancez-vous dans l''aventure du taxi professionnel.', true, 2, NOW(), NOW()),
        ('home_cta', 'button_text', 'home_cta_contact', 'Bouton Contact', 'Nous contacter', true, 3, NOW(), NOW()),
        ('home_cta', 'button_text', 'home_cta_formations', 'Bouton Formations', 'Voir les formations', true, 4, NOW(), NOW())
    ");

        // CONTENU TEXTE POUR LA PAGE FORMATIONS

        // Section Hero Formations
        $this->addSql("INSERT INTO content_text (section, type, identifier, title, content, is_active, sort_order, created_at, updated_at) VALUES 
        ('formations_hero', 'title', 'formations_hero_title', 'Titre Hero Formations', 'Nos Formations Taxi', true, 1, NOW(), NOW()),
        ('formations_hero', 'description', 'formations_hero_description', 'Description Hero Formations', 'Découvrez nos programmes de formation certifiants pour devenir chauffeur de taxi professionnel. Des formations adaptées à tous les niveaux pour réussir dans le métier.', true, 2, NOW(), NOW())
    ");

        // Section Avantages Formations
        $this->addSql("INSERT INTO content_text (section, type, identifier, title, content, is_active, sort_order, created_at, updated_at) VALUES 
        ('formations_advantages', 'title', 'formations_advantages_title', 'Titre Avantages', 'Pourquoi choisir nos formations ?', true, 1, NOW(), NOW()),
        ('formations_advantages', 'advantage_title', 'advantage_certification_title', 'Titre Certification', 'Formation Certifiante', true, 2, NOW(), NOW()),
        ('formations_advantages', 'advantage_description', 'advantage_certification_description', 'Description Certification', 'Nos formations sont reconnues par l''État et vous permettent d''obtenir votre carte professionnelle de chauffeur de taxi.', true, 3, NOW(), NOW()),
        ('formations_advantages', 'advantage_title', 'advantage_trainers_title', 'Titre Formateurs', 'Formateurs Expérimentés', true, 4, NOW(), NOW()),
        ('formations_advantages', 'advantage_description', 'advantage_trainers_description', 'Description Formateurs', 'Notre équipe de formateurs possède une solide expérience du métier de chauffeur de taxi et connaît parfaitement les exigences de l''examen.', true, 5, NOW(), NOW()),
        ('formations_advantages', 'advantage_title', 'advantage_support_title', 'Titre Support', 'Accompagnement Personnalisé', true, 6, NOW(), NOW()),
        ('formations_advantages', 'advantage_description', 'advantage_support_description', 'Description Support', 'Un suivi individuel tout au long de votre formation pour garantir votre réussite et vous aider à préparer efficacement l''examen.', true, 7, NOW(), NOW())
    ");

        // TÉMOIGNAGES PAR DÉFAUT
        $this->addSql("INSERT INTO testimonial (client_name, content, rating, formation, is_active, is_featured, created_at, updated_at) VALUES 
        ('Sarah M.', 'Formation excellente et très professionnelle. Les formateurs sont à l''écoute et le contenu est parfaitement adapté.', 5, 'Formation Initiale Taxi', true, true, NOW(), NOW()),
        ('Thomas R.', 'Le service de location est impeccable. Véhicules toujours en parfait état et une équipe très réactive.', 5, 'Location Véhicules', true, true, NOW(), NOW()),
        ('Michel P.', 'Une formation complète qui m''a permis d''obtenir ma certification du premier coup. Je recommande vivement.', 5, 'Formation Initiale Taxi', true, true, NOW(), NOW())
    ");

        // FAQ PAR DÉFAUT
        $this->addSql("INSERT INTO faq (question, answer, category, is_active, is_featured, sort_order, created_at, updated_at) VALUES 
        ('Combien de temps dure la formation initiale ?', 'La formation initiale pour devenir chauffeur de taxi dure 140 heures, réparties sur plusieurs semaines selon le planning choisi.', 'formation', true, true, 1, NOW(), NOW()),
        ('Quels sont les prérequis pour s''inscrire ?', 'Il faut être titulaire du permis B depuis au moins 3 ans et ne pas avoir fait l''objet de certaines condamnations pénales.', 'formation', true, true, 2, NOW(), NOW()),
        ('La formation est-elle certifiante ?', 'Oui, nos formations sont reconnues par l''État et vous permettent d''obtenir votre carte professionnelle de chauffeur de taxi.', 'formation', true, true, 3, NOW(), NOW()),
        ('Proposez-vous des financements ?', 'Oui, nos formations peuvent être prises en charge par le CPF, Pôle Emploi ou d''autres organismes selon votre situation.', 'financement', true, true, 4, NOW(), NOW()),
        ('Puis-je louer un véhicule sans suivre de formation ?', 'Oui, notre service de location de véhicules est ouvert à tous les chauffeurs de taxi titulaires d''une carte professionnelle.', 'location', true, false, 5, NOW(), NOW())
    ");

        // CONTENU POUR LA SECTION TÉMOIGNAGES
        $this->addSql("INSERT INTO content_text (section, type, identifier, title, content, is_active, sort_order, created_at, updated_at) VALUES 
        ('home_testimonials', 'title', 'home_testimonials_title', 'Titre Témoignages', 'Ils nous font confiance', true, 1, NOW(), NOW())
    ");
    }

    public function down(Schema $schema): void
    {
        // Supprimer toutes les données insérées
        $this->addSql("DELETE FROM content_text WHERE section IN ('home_hero', 'home_services', 'home_cta', 'formations_hero', 'formations_advantages', 'home_testimonials')");
        $this->addSql("DELETE FROM testimonial WHERE client_name IN ('Sarah M.', 'Thomas R.', 'Michel P.')");
        $this->addSql("DELETE FROM faq WHERE category IN ('formation', 'financement', 'location')");
    }
}
