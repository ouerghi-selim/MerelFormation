<?php

namespace App\Command;

use App\Entity\User;
use App\Entity\Reservation;
use App\Entity\Document;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-soft-delete-cascade',
    description: 'Test the Gedmo SoftDelete cascade functionality'
)]
class TestSoftDeleteCascadeCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        $io->title('🧪 Test de l\'archivage en cascade Gedmo');
        
        // Chercher un utilisateur avec des réservations
        $user = $this->findUserWithReservations();
        
        if (!$user) {
            $io->error('❌ Aucun utilisateur avec réservations trouvé pour le test');
            return Command::FAILURE;
        }
        
        $io->section("👤 Test avec l'utilisateur: {$user->getEmail()}");
        
        // Compter les entités AVANT archivage
        $beforeStats = $this->getEntityCounts($user);
        $io->table(
            ['Type d\'entité', 'Nombre avant archivage'],
            [
                ['Réservations actives', $beforeStats['reservations']],
                ['Documents actifs', $beforeStats['documents']],
                ['Notifications actives', $beforeStats['notifications']],
            ]
        );
        
        if ($beforeStats['reservations'] === 0) {
            $io->warning('⚠️ Cet utilisateur n\'a pas de réservations actives');
        }
        
        // Archiver l'utilisateur
        $io->section('🗑️ Archivage de l\'utilisateur...');
        $user->setDeletedAt(new \DateTime());
        $this->entityManager->flush();
        
        $io->success('✅ Utilisateur archivé !');
        
        // Vérifier l'archivage en cascade
        $afterStats = $this->getEntityCounts($user);
        $io->table(
            ['Type d\'entité', 'Avant', 'Après', 'Différence'],
            [
                [
                    'Réservations actives', 
                    $beforeStats['reservations'], 
                    $afterStats['reservations'],
                    $beforeStats['reservations'] - $afterStats['reservations']
                ],
                [
                    'Documents actifs', 
                    $beforeStats['documents'], 
                    $afterStats['documents'],
                    $beforeStats['documents'] - $afterStats['documents']
                ],
                [
                    'Notifications actives', 
                    $beforeStats['notifications'], 
                    $afterStats['notifications'],
                    $beforeStats['notifications'] - $afterStats['notifications']
                ],
            ]
        );
        
        // Test de restauration
        if ($io->confirm('🔄 Voulez-vous tester la restauration ?', true)) {
            $io->section('🔄 Restauration de l\'utilisateur...');
            $user->setDeletedAt(null);
            $this->entityManager->flush();
            
            $restoredStats = $this->getEntityCounts($user);
            $io->table(
                ['Type d\'entité', 'Avant archivage', 'Après restauration', 'Restauré'],
                [
                    [
                        'Réservations actives', 
                        $beforeStats['reservations'], 
                        $restoredStats['reservations'],
                        $restoredStats['reservations'] === $beforeStats['reservations'] ? '✅' : '❌'
                    ],
                    [
                        'Documents actifs', 
                        $beforeStats['documents'], 
                        $restoredStats['documents'],
                        $restoredStats['documents'] === $beforeStats['documents'] ? '✅' : '❌'
                    ],
                    [
                        'Notifications actives', 
                        $beforeStats['notifications'], 
                        $restoredStats['notifications'],
                        $restoredStats['notifications'] === $beforeStats['notifications'] ? '✅' : '❌'
                    ],
                ]
            );
            
            $io->success('✅ Test de restauration terminé !');
        }
        
        $io->success('🎉 Test complet terminé !');
        
        return Command::SUCCESS;
    }
    
    private function findUserWithReservations(): ?User
    {
        return $this->entityManager->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u')
            ->leftJoin('u.reservations', 'r')
            ->where('u.deletedAt IS NULL')
            ->andWhere('r.deletedAt IS NULL')
            ->groupBy('u.id')
            ->having('COUNT(r.id) > 0')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
    
    private function getEntityCounts(User $user): array
    {
        return [
            'reservations' => $this->entityManager->createQueryBuilder()
                ->select('COUNT(r.id)')
                ->from(Reservation::class, 'r')
                ->where('r.user = :user')
                ->andWhere('r.deletedAt IS NULL')
                ->setParameter('user', $user)
                ->getQuery()
                ->getSingleScalarResult(),
                
            'documents' => $this->entityManager->createQueryBuilder()
                ->select('COUNT(d.id)')
                ->from(Document::class, 'd')
                ->where('d.user = :user')
                ->andWhere('d.deletedAt IS NULL')
                ->setParameter('user', $user)
                ->getQuery()
                ->getSingleScalarResult(),
                
            'notifications' => $this->entityManager->createQueryBuilder()
                ->select('COUNT(n.id)')
                ->from('App\Entity\Notification', 'n')
                ->where('n.user = :user')
                ->andWhere('n.deletedAt IS NULL')
                ->setParameter('user', $user)
                ->getQuery()
                ->getSingleScalarResult(),
        ];
    }
}