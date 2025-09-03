<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour supprimer les templates d'emails obsolètes qui créent des doublures
 * - vehicle_rental_notification (pour admin)
 * - vehicle_rental_confirmation_client (pour étudiant)
 * Ces templates sont remplacés par le système de statuts unifié
 */
final class Version20250903102000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime les templates emails obsolètes qui créent des doublures lors des réservations de véhicules';
    }

    public function up(Schema $schema): void
    {
        // Supprimer les templates d'emails obsolètes qui créent des doublures
        $this->addSql("DELETE FROM email_template WHERE identifier = 'vehicle_rental_notification'");
        $this->addSql("DELETE FROM email_template WHERE identifier = 'vehicle_rental_confirmation_client'");
        
        // Logs pour traçabilité
        $this->write('Suppression des templates emails obsolètes :');
        $this->write('- vehicle_rental_notification (admin legacy)');
        $this->write('- vehicle_rental_confirmation_client (étudiant legacy)');
        $this->write('Le système utilise maintenant uniquement les templates du système de statuts unifié.');
    }

    public function down(Schema $schema): void
    {
        // Pas de rollback car ces templates créaient des doublures
        // Si besoin, ils peuvent être recréés via les fixtures originales
        $this->write('ATTENTION: Cette migration ne peut pas être annulée car elle supprime des templates obsolètes.');
        $this->write('Les templates supprimés créaient des emails en double lors des réservations de véhicules.');
        $this->write('Si nécessaire, utilisez les fixtures EmailTemplateFixtures pour les recréer.');
    }
}