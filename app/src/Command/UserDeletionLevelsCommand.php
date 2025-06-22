<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:user-deletion-levels',
    description: 'Gère les niveaux de suppression des utilisateurs (RGPD)',
)]
class UserDeletionLevelsCommand extends Command
{
    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager)
    {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Simulation sans modification')
            ->setHelp('
Cette commande gère automatiquement les niveaux de suppression des utilisateurs :

NIVEAU 1 → NIVEAU 2 (après 30 jours) : Anonymisation
NIVEAU 2 → NIVEAU 3 (après 1 an) : Suppression définitive

Recommandation : Exécuter quotidiennement via CRON
            ')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $isDryRun = $input->getOption('dry-run');

        if ($isDryRun) {
            $io->warning('MODE SIMULATION - Aucune modification ne sera effectuée');
        }

        $io->title('🗑️  Gestion des niveaux de suppression des utilisateurs');

        // NIVEAU 1 → NIVEAU 2 : Anonymisation après 30 jours
        $usersToAnonymize = $this->findUsersForAnonymization();
        $anonymizedCount = 0;

        if (!empty($usersToAnonymize)) {
            $io->section(sprintf('📊 %d utilisateur(s) à anonymiser (niveau 1 → 2)', count($usersToAnonymize)));
            
            foreach ($usersToAnonymize as $user) {
                $daysSinceDeletion = $user->getDeletedAt()->diff(new \DateTime())->days;
                
                $io->text(sprintf(
                    'Utilisateur #%d - %s (%s) - Supprimé depuis %d jours',
                    $user->getId(),
                    $user->getEmail(),
                    $user->getFirstName() . ' ' . $user->getLastName(),
                    $daysSinceDeletion
                ));

                if (!$isDryRun) {
                    $this->anonymizeUser($user);
                    $anonymizedCount++;
                }
            }
        }

        // NIVEAU 2 → NIVEAU 3 : Suppression définitive après 1 an
        $usersToDelete = $this->findUsersForDeletion();
        $deletedCount = 0;

        if (!empty($usersToDelete)) {
            $io->section(sprintf('💀 %d utilisateur(s) à supprimer définitivement (niveau 2 → 3)', count($usersToDelete)));
            
            foreach ($usersToDelete as $user) {
                $daysSinceAnonymization = $user->getAnonymizedAt()->diff(new \DateTime())->days;
                
                $io->text(sprintf(
                    'Utilisateur #%d - Anonymisé depuis %d jours',
                    $user->getId(),
                    $daysSinceAnonymization
                ));

                if (!$isDryRun) {
                    $this->permanentlyDeleteUser($user);
                    $deletedCount++;
                }
            }
        }

        if (!$isDryRun) {
            $this->entityManager->flush();
        }

        // Résumé
        $io->success(sprintf(
            'Traitement terminé ! %d anonymisation(s), %d suppression(s) définitive(s)',
            $anonymizedCount,
            $deletedCount
        ));

        if (empty($usersToAnonymize) && empty($usersToDelete)) {
            $io->info('Aucun utilisateur à traiter aujourd\'hui.');
        }

        return Command::SUCCESS;
    }

    private function findUsersForAnonymization(): array
    {
        $thirtyDaysAgo = new \DateTime('-30 days');
        
        return $this->userRepository->createQueryBuilder('u')
            ->andWhere('u.deletionLevel = :level')
            ->andWhere('u.deletedAt <= :date')
            ->setParameter('level', 'deactivated')
            ->setParameter('date', $thirtyDaysAgo)
            ->getQuery()
            ->getResult();
    }

    private function findUsersForDeletion(): array
    {
        $oneYearAgo = new \DateTime('-1 year');
        
        return $this->userRepository->createQueryBuilder('u')
            ->andWhere('u.deletionLevel = :level')
            ->andWhere('u.anonymizedAt <= :date')
            ->setParameter('level', 'anonymized')
            ->setParameter('date', $oneYearAgo)
            ->getQuery()
            ->getResult();
    }

    private function anonymizeUser($user): void
    {
        // NIVEAU 2 : Anonymisation
        $user->setEmail('anonymized_' . $user->getId() . '@deleted.local');
        $user->setFirstName('Utilisateur');
        $user->setLastName('Anonymisé');
        $user->setPhone(null);
        $user->setAddress(null);
        $user->setBirthPlace(null);
        $user->setBirthDate(null);
        
        $user->setAnonymizedAt(new \DateTime());
        $user->setDeletionLevel('anonymized');
        
        // Effacer les données de restauration
        $user->setOriginalEmail(null);
        $user->setOriginalFirstName(null);
        $user->setOriginalLastName(null);
    }

    private function permanentlyDeleteUser($user): void
    {
        // NIVEAU 3 : Suppression définitive
        $user->setDeletionLevel('permanent');
        
        // Supprimer toutes les notifications
        foreach ($user->getNotifications() as $notification) {
            $this->entityManager->remove($notification);
        }
        
        // Marquer comme supprimé définitivement
        $this->entityManager->remove($user);
    }
}