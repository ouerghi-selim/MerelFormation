<?php

namespace App\Command;

use App\Entity\User;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:migrate-to-gedmo-soft-delete',
    description: 'Migrate custom soft delete to Gedmo SoftDelete'
)]
class MigrateToGedmoSoftDeleteCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        $io->title('Migration vers Gedmo SoftDelete');
        
        // Migrer les utilisateurs
        $this->migrateUsers($io);
        
        // Migrer les réservations
        $this->migrateReservations($io);
        
        $io->success('Migration terminée avec succès !');
        
        return Command::SUCCESS;
    }
    
    private function migrateUsers(SymfonyStyle $io): void
    {
        $io->section('Migration des utilisateurs');
        
        // Récupérer tous les utilisateurs avec deletedAt (même supprimés)
        $users = $this->entityManager->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u')
            ->where('u.deletedAt IS NOT NULL')
            ->getQuery()
            ->getResult();
            
        $io->progressStart(count($users));
        
        foreach ($users as $user) {
            // Pour Gedmo, on garde juste deletedAt, le reste sera géré automatiquement
            // Les champs deletionLevel, anonymizedAt, etc. peuvent être conservés pour l'historique
            $io->progressAdvance();
        }
        
        $io->progressFinish();
        $io->text(sprintf('Migré %d utilisateurs', count($users)));
    }
    
    private function migrateReservations(SymfonyStyle $io): void
    {
        $io->section('Migration des réservations');
        
        // Récupérer toutes les réservations archivées
        $reservations = $this->entityManager->createQueryBuilder()
            ->select('r')
            ->from(Reservation::class, 'r')
            ->where('r.archivedAt IS NOT NULL')
            ->getQuery()
            ->getResult();
            
        $io->progressStart(count($reservations));
        
        foreach ($reservations as $reservation) {
            // Copier archivedAt vers deletedAt pour Gedmo
            $reservation->setDeletedAt($reservation->getArchivedAt());
            $io->progressAdvance();
        }
        
        $this->entityManager->flush();
        $io->progressFinish();
        $io->text(sprintf('Migré %d réservations', count($reservations)));
    }
}