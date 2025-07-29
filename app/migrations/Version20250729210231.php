<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250729210231 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Migration des statuts VehicleRental vers ReservationStatus unifié';
    }

    public function up(Schema $schema): void
    {
        // Mappage des anciens statuts vers les nouveaux statuts unifiés
        $statusMapping = [
            'pending' => 'submitted',
            'confirmed' => 'confirmed',
            'in_progress' => 'in_progress',
            'completed' => 'completed',
            'cancelled' => 'cancelled'
        ];

        // Mise à jour des statuts existants
        foreach ($statusMapping as $oldStatus => $newStatus) {
            $this->addSql(
                'UPDATE vehicle_rental SET status = :newStatus WHERE status = :oldStatus',
                ['newStatus' => $newStatus, 'oldStatus' => $oldStatus]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // Restauration des anciens statuts
        $reverseMapping = [
            'submitted' => 'pending',
            'confirmed' => 'confirmed',
            'in_progress' => 'in_progress',
            'completed' => 'completed',
            'cancelled' => 'cancelled'
        ];

        foreach ($reverseMapping as $newStatus => $oldStatus) {
            $this->addSql(
                'UPDATE vehicle_rental SET status = :oldStatus WHERE status = :newStatus',
                ['oldStatus' => $oldStatus, 'newStatus' => $newStatus]
            );
        }
    }
}
