<?php

namespace App\DataFixtures;

use App\Entity\ContentText;
use App\Entity\Testimonial;
use App\Entity\Faq;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Fixture pour insérer les contenus par défaut du CMS
 * Cette fixture remplace la migration et transfère les données en dur
 * des pages front-end vers les entités CMS
 */
class CMSContentFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $this->loadHomeHeroContent($manager);
        $this->loadHomeServicesContent($manager);
        $this->loadHomeCTAContent($manager);
        $this->loadFormationsContent($manager);
        $this->loadTrackingContent($manager);
        $this->loadTestimonials($manager);
        $this->loadFAQ($manager);
        $this->loadTestimonialsSection($manager);

        $manager->flush();
    }

    private function loadHomeHeroContent(ObjectManager $manager): void
    {
        $contents = [
            [
                'section' => 'home_hero',
                'type' => 'title',
                'identifier' => 'home_hero_title',
                'title' => 'Titre Hero Accueil',
                'content' => 'Devenez Chauffeur de Taxi Professionnel',
                'sortOrder' => 1
            ],
            [
                'section' => 'home_hero',
                'type' => 'description',
                'identifier' => 'home_hero_description',
                'title' => 'Description Hero Accueil',
                'content' => 'Formation certifiante et location de véhicules pour réussir dans le métier de taxi. Plus de 500 professionnels formés avec 95% de réussite.',
                'sortOrder' => 2
            ],
            [
                'section' => 'home_hero',
                'type' => 'cta_text',
                'identifier' => 'home_hero_cta_formations',
                'title' => 'CTA Formations',
                'content' => 'Découvrir nos formations',
                'sortOrder' => 3
            ],
            [
                'section' => 'home_hero',
                'type' => 'cta_text',
                'identifier' => 'home_hero_cta_location',
                'title' => 'CTA Location',
                'content' => 'Location de véhicules',
                'sortOrder' => 4
            ],
            [
                'section' => 'home_hero',
                'type' => 'text',
                'identifier' => 'home_hero_community',
                'title' => 'Texte Communauté',
                'content' => 'Rejoignez plus de 500 chauffeurs formés',
                'sortOrder' => 5
            ]
        ];

        foreach ($contents as $data) {
            $content = new ContentText();
            $content->setSection($data['section']);
            $content->setType($data['type']);
            $content->setIdentifier($data['identifier']);
            $content->setTitle($data['title']);
            $content->setContent($data['content']);
            $content->setIsActive(true);
            $content->setSortOrder($data['sortOrder']);
            $content->setCreatedAt(new \DateTimeImmutable());
            $content->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($content);
        }
    }

    private function loadHomeServicesContent(ObjectManager $manager): void
    {
        $contents = [
            [
                'section' => 'home_services',
                'type' => 'title',
                'identifier' => 'home_services_title',
                'title' => 'Titre Services',
                'content' => 'Nos Services Complets',
                'sortOrder' => 1
            ],
            [
                'section' => 'home_services',
                'type' => 'description',
                'identifier' => 'home_services_description',
                'title' => 'Description Services',
                'content' => 'Une offre complète pour votre réussite professionnelle, de la formation à la mise en route.',
                'sortOrder' => 2
            ],
            [
                'section' => 'home_services',
                'type' => 'service_title',
                'identifier' => 'service_formation_title',
                'title' => 'Titre Service Formation',
                'content' => 'Formation Taxi',
                'sortOrder' => 3
            ],
            [
                'section' => 'home_services',
                'type' => 'service_description',
                'identifier' => 'service_formation_description',
                'title' => 'Description Service Formation',
                'content' => 'Formation initiale et continue pour les chauffeurs de taxi. Programme complet et certifiant.',
                'sortOrder' => 4
            ],
            [
                'section' => 'home_services',
                'type' => 'service_title',
                'identifier' => 'service_location_title',
                'title' => 'Titre Service Location',
                'content' => 'Location Véhicules',
                'sortOrder' => 5
            ],
            [
                'section' => 'home_services',
                'type' => 'service_description',
                'identifier' => 'service_location_description',
                'title' => 'Description Service Location',
                'content' => 'Location de véhicules équipés et adaptés pour l\'activité de taxi.',
                'sortOrder' => 6
            ],
            [
                'section' => 'home_services',
                'type' => 'service_title',
                'identifier' => 'service_planning_title',
                'title' => 'Titre Service Planning',
                'content' => 'Planning Flexible',
                'sortOrder' => 7
            ],
            [
                'section' => 'home_services',
                'type' => 'service_description',
                'identifier' => 'service_planning_description',
                'title' => 'Description Service Planning',
                'content' => 'Des sessions de formation adaptées à vos disponibilités.',
                'sortOrder' => 8
            ]
        ];

        foreach ($contents as $data) {
            $content = new ContentText();
            $content->setSection($data['section']);
            $content->setType($data['type']);
            $content->setIdentifier($data['identifier']);
            $content->setTitle($data['title']);
            $content->setContent($data['content']);
            $content->setIsActive(true);
            $content->setSortOrder($data['sortOrder']);
            $content->setCreatedAt(new \DateTimeImmutable());
            $content->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($content);
        }
    }

    private function loadHomeCTAContent(ObjectManager $manager): void
    {
        $contents = [
            [
                'section' => 'home_cta',
                'type' => 'title',
                'identifier' => 'home_cta_title',
                'title' => 'Titre CTA Final',
                'content' => 'Prêt à démarrer votre carrière ?',
                'sortOrder' => 1
            ],
            [
                'section' => 'home_cta',
                'type' => 'description',
                'identifier' => 'home_cta_description',
                'title' => 'Description CTA Final',
                'content' => 'Inscrivez-vous à nos formations et lancez-vous dans l\'aventure du taxi professionnel.',
                'sortOrder' => 2
            ],
            [
                'section' => 'home_cta',
                'type' => 'button_text',
                'identifier' => 'home_cta_contact',
                'title' => 'Bouton Contact',
                'content' => 'Nous contacter',
                'sortOrder' => 3
            ],
            [
                'section' => 'home_cta',
                'type' => 'button_text',
                'identifier' => 'home_cta_formations',
                'title' => 'Bouton Formations',
                'content' => 'Voir les formations',
                'sortOrder' => 4
            ]
        ];

        foreach ($contents as $data) {
            $content = new ContentText();
            $content->setSection($data['section']);
            $content->setType($data['type']);
            $content->setIdentifier($data['identifier']);
            $content->setTitle($data['title']);
            $content->setContent($data['content']);
            $content->setIsActive(true);
            $content->setSortOrder($data['sortOrder']);
            $content->setCreatedAt(new \DateTimeImmutable());
            $content->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($content);
        }
    }

    private function loadFormationsContent(ObjectManager $manager): void
    {
        $contents = [
            [
                'section' => 'formations_hero',
                'type' => 'title',
                'identifier' => 'formations_hero_title',
                'title' => 'Titre Hero Formations',
                'content' => 'Nos Formations Taxi',
                'sortOrder' => 1
            ],
            [
                'section' => 'formations_hero',
                'type' => 'description',
                'identifier' => 'formations_hero_description',
                'title' => 'Description Hero Formations',
                'content' => 'Découvrez nos programmes de formation certifiants pour devenir chauffeur de taxi professionnel. Des formations adaptées à tous les niveaux pour réussir dans le métier.',
                'sortOrder' => 2
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'title',
                'identifier' => 'formations_advantages_title',
                'title' => 'Titre Avantages',
                'content' => 'Pourquoi choisir nos formations ?',
                'sortOrder' => 1
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'advantage_title',
                'identifier' => 'advantage_certification_title',
                'title' => 'Titre Certification',
                'content' => 'Formation Certifiante',
                'sortOrder' => 2
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'advantage_description',
                'identifier' => 'advantage_certification_description',
                'title' => 'Description Certification',
                'content' => 'Nos formations sont reconnues par l\'État et vous permettent d\'obtenir votre carte professionnelle de chauffeur de taxi.',
                'sortOrder' => 3
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'advantage_title',
                'identifier' => 'advantage_trainers_title',
                'title' => 'Titre Formateurs',
                'content' => 'Formateurs Expérimentés',
                'sortOrder' => 4
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'advantage_description',
                'identifier' => 'advantage_trainers_description',
                'title' => 'Description Formateurs',
                'content' => 'Notre équipe de formateurs possède une solide expérience du métier de chauffeur de taxi et connaît parfaitement les exigences de l\'examen.',
                'sortOrder' => 5
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'advantage_title',
                'identifier' => 'advantage_support_title',
                'title' => 'Titre Support',
                'content' => 'Accompagnement Personnalisé',
                'sortOrder' => 6
            ],
            [
                'section' => 'formations_advantages',
                'type' => 'advantage_description',
                'identifier' => 'advantage_support_description',
                'title' => 'Description Support',
                'content' => 'Un suivi individuel tout au long de votre formation pour garantir votre réussite et vous aider à préparer efficacement l\'examen.',
                'sortOrder' => 7
            ]
        ];

        foreach ($contents as $data) {
            $content = new ContentText();
            $content->setSection($data['section']);
            $content->setType($data['type']);
            $content->setIdentifier($data['identifier']);
            $content->setTitle($data['title']);
            $content->setContent($data['content']);
            $content->setIsActive(true);
            $content->setSortOrder($data['sortOrder']);
            $content->setCreatedAt(new \DateTimeImmutable());
            $content->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($content);
        }
    }

    private function loadTestimonials(ObjectManager $manager): void
    {
        $testimonials = [
            [
                'clientName' => 'Sarah M.',
                'content' => 'Formation excellente et très professionnelle. Les formateurs sont à l\'écoute et le contenu est parfaitement adapté.',
                'rating' => 5,
                'formation' => 'Formation Initiale Taxi',
                'isFeatured' => true
            ],
            [
                'clientName' => 'Thomas R.',
                'content' => 'Le service de location est impeccable. Véhicules toujours en parfait état et une équipe très réactive.',
                'rating' => 5,
                'formation' => 'Location Véhicules',
                'isFeatured' => true
            ],
            [
                'clientName' => 'Michel P.',
                'content' => 'Une formation complète qui m\'a permis d\'obtenir ma certification du premier coup. Je recommande vivement.',
                'rating' => 5,
                'formation' => 'Formation Initiale Taxi',
                'isFeatured' => true
            ]
        ];

        foreach ($testimonials as $data) {
            $testimonial = new Testimonial();
            $testimonial->setClientName($data['clientName']);
            $testimonial->setContent($data['content']);
            $testimonial->setRating($data['rating']);
            $testimonial->setFormation($data['formation']);
            $testimonial->setIsActive(true);
            $testimonial->setIsFeatured($data['isFeatured']);
            $testimonial->setCreatedAt(new \DateTimeImmutable());
            $testimonial->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($testimonial);
        }
    }

    private function loadFAQ(ObjectManager $manager): void
    {
        $faqs = [
            [
                'question' => 'Combien de temps dure la formation initiale ?',
                'answer' => 'La formation initiale pour devenir chauffeur de taxi dure 140 heures, réparties sur plusieurs semaines selon le planning choisi.',
                'category' => 'formation',
                'isFeatured' => true,
                'sortOrder' => 1
            ],
            [
                'question' => 'Quels sont les prérequis pour s\'inscrire ?',
                'answer' => 'Il faut être titulaire du permis B depuis au moins 3 ans et ne pas avoir fait l\'objet de certaines condamnations pénales.',
                'category' => 'formation',
                'isFeatured' => true,
                'sortOrder' => 2
            ],
            [
                'question' => 'La formation est-elle certifiante ?',
                'answer' => 'Oui, nos formations sont reconnues par l\'État et vous permettent d\'obtenir votre carte professionnelle de chauffeur de taxi.',
                'category' => 'formation',
                'isFeatured' => true,
                'sortOrder' => 3
            ],
            [
                'question' => 'Proposez-vous des financements ?',
                'answer' => 'Oui, nos formations peuvent être prises en charge par le CPF, Pôle Emploi ou d\'autres organismes selon votre situation.',
                'category' => 'financement',
                'isFeatured' => true,
                'sortOrder' => 4
            ],
            [
                'question' => 'Puis-je louer un véhicule sans suivre de formation ?',
                'answer' => 'Oui, notre service de location de véhicules est ouvert à tous les chauffeurs de taxi titulaires d\'une carte professionnelle.',
                'category' => 'location',
                'isFeatured' => false,
                'sortOrder' => 5
            ]
        ];

        foreach ($faqs as $data) {
            $faq = new Faq();
            $faq->setQuestion($data['question']);
            $faq->setAnswer($data['answer']);
            $faq->setCategory($data['category']);
            $faq->setIsActive(true);
            $faq->setIsFeatured($data['isFeatured']);
            $faq->setSortOrder($data['sortOrder']);
            $faq->setCreatedAt(new \DateTimeImmutable());
            $faq->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($faq);
        }
    }

    private function loadTrackingContent(ObjectManager $manager): void
    {
        $contents = [
            // Header de la page de tracking
            [
                'section' => 'tracking_header',
                'type' => 'title',
                'identifier' => 'tracking_header_title',
                'title' => 'Titre Header Tracking',
                'content' => 'Suivi de réservation',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_header',
                'type' => 'description',
                'identifier' => 'tracking_header_description',
                'title' => 'Description Header Tracking',
                'content' => 'Suivez l\'évolution de votre demande de réservation en temps réel',
                'sortOrder' => 2
            ],
            // Section progression
            [
                'section' => 'tracking_progress',
                'type' => 'title',
                'identifier' => 'tracking_progress_title',
                'title' => 'Titre Progression',
                'content' => 'Progression de votre réservation',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_progress',
                'type' => 'description',
                'identifier' => 'tracking_progress_description',
                'title' => 'Description Progression',
                'content' => 'Votre réservation passe par plusieurs étapes pour assurer la meilleure qualité de service',
                'sortOrder' => 2
            ],
            // Section historique
            [
                'section' => 'tracking_history',
                'type' => 'title',
                'identifier' => 'tracking_history_title',
                'title' => 'Titre Historique',
                'content' => 'Historique détaillé',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_history',
                'type' => 'description',
                'identifier' => 'tracking_history_description',
                'title' => 'Description Historique',
                'content' => 'Toutes les étapes importantes de votre réservation sont enregistrées ici',
                'sortOrder' => 2
            ],
            // Section documents
            [
                'section' => 'tracking_documents',
                'type' => 'title',
                'identifier' => 'tracking_documents_title',
                'title' => 'Titre Documents',
                'content' => 'Documents de votre réservation',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_documents',
                'type' => 'description',
                'identifier' => 'tracking_documents_description',
                'title' => 'Description Documents',
                'content' => 'Tous les documents liés à votre réservation sont accessible ici en téléchargement sécurisé',
                'sortOrder' => 2
            ],
            // Section facture
            [
                'section' => 'tracking_invoice',
                'type' => 'title',
                'identifier' => 'tracking_invoice_title',
                'title' => 'Titre Facture',
                'content' => 'Facture disponible',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_invoice',
                'type' => 'description',
                'identifier' => 'tracking_invoice_description',
                'title' => 'Description Facture',
                'content' => 'Votre facture est prête et peut être téléchargée',
                'sortOrder' => 2
            ],
            [
                'section' => 'tracking_invoice',
                'type' => 'button_text',
                'identifier' => 'tracking_invoice_download_button',
                'title' => 'Bouton Télécharger Facture',
                'content' => 'Télécharger la facture',
                'sortOrder' => 3
            ],
            // Messages d'état
            [
                'section' => 'tracking_status',
                'type' => 'message',
                'identifier' => 'tracking_status_awaiting_docs',
                'title' => 'Message Attente Documents',
                'content' => 'Veuillez fournir les documents demandés pour continuer le traitement de votre réservation',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_status',
                'type' => 'message',
                'identifier' => 'tracking_status_no_docs',
                'title' => 'Message Aucun Document',
                'content' => 'Aucun document complémentaire n\'est associé à cette réservation',
                'sortOrder' => 2
            ],
            // Footer
            [
                'section' => 'tracking_footer',
                'type' => 'description',
                'identifier' => 'tracking_footer_note',
                'title' => 'Note Footer',
                'content' => 'Conservez ce lien pour suivre l\'évolution de votre demande',
                'sortOrder' => 1
            ],
            [
                'section' => 'tracking_footer',
                'type' => 'brand',
                'identifier' => 'tracking_footer_brand',
                'title' => 'Marque Footer',
                'content' => 'MerelFormation',
                'sortOrder' => 2
            ]
        ];

        foreach ($contents as $data) {
            $content = new ContentText();
            $content->setSection($data['section']);
            $content->setType($data['type']);
            $content->setIdentifier($data['identifier']);
            $content->setTitle($data['title']);
            $content->setContent($data['content']);
            $content->setIsActive(true);
            $content->setSortOrder($data['sortOrder']);
            $content->setCreatedAt(new \DateTimeImmutable());
            $content->setUpdatedAt(new \DateTimeImmutable());

            $manager->persist($content);
        }
    }

    private function loadTestimonialsSection(ObjectManager $manager): void
    {
        $content = new ContentText();
        $content->setSection('home_testimonials');
        $content->setType('title');
        $content->setIdentifier('home_testimonials_title');
        $content->setTitle('Titre Témoignages');
        $content->setContent('Ils nous font confiance');
        $content->setIsActive(true);
        $content->setSortOrder(1);
        $content->setCreatedAt(new \DateTimeImmutable());
        $content->setUpdatedAt(new \DateTimeImmutable());

        $manager->persist($content);
    }
}