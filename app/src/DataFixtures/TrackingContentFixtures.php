<?php

namespace App\DataFixtures;

use App\Entity\ContentText;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Fixture spécifique pour les contenus CMS de la page de tracking
 * Cette fixture sert principalement pour le développement
 * En production, utiliser la migration Version20250810164029
 */
class TrackingContentFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $this->loadTrackingContent($manager);
        $manager->flush();
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
                'content' => 'Tous les documents liés à votre réservation sont accessibles ici en téléchargement sécurisé',
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
            // Vérifier si le contenu existe déjà pour éviter les doublons
            $existingContent = $manager->getRepository(ContentText::class)
                ->findOneBy(['identifier' => $data['identifier']]);
            
            if (!$existingContent) {
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
    }
}