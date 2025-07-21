<?php

namespace App\DataFixtures;

use App\Entity\Reservation;
use App\Entity\User;
use App\Entity\Session;
use App\Enum\ReservationStatus;
use App\Repository\UserRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class ReservationFixtures extends Fixture implements DependentFixtureInterface
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function load(ObjectManager $manager): void
    {
        // Sessions disponibles (références)
        $sessions = [
            $this->getReference(SessionFixtures::SESSION_1_REFERENCE, Session::class),
            $this->getReference(SessionFixtures::SESSION_2_REFERENCE, Session::class),
        ];

        // Récupérer tous les utilisateurs avec le rôle ROLE_STUDENT
        $students = $this->userRepository->findBy(['roles' => 'ROLE_STUDENT']);
        if (empty($students)) {
            // Fallback: utiliser la référence unique
            $students = [$this->getReference(UserFixtures::STUDENT_USER_REFERENCE, User::class)];
        }

        // Créer plusieurs réservations par étudiant
        foreach ($students as $index => $student) {
            // 2-3 réservations par étudiant
            $reservationsCount = mt_rand(1, 2);

            for ($i = 0; $i < $reservationsCount; $i++) {
                $reservation = new Reservation();

                // Attribuer l'étudiant
                $reservation->setUser($student);

                // Attribuer une session aléatoire
                $session = $sessions[array_rand($sessions)];
                $reservation->setSession($session);

                // Statut aléatoire avec distribution pondérée utilisant les nouveaux statuts
                // 30% confirmed, 25% completed, 15% submitted, 10% in_progress, 10% under_review, 10% cancelled
                $rand = mt_rand(1, 100);
                if ($rand <= 30) {
                    $status = ReservationStatus::CONFIRMED;
                } elseif ($rand <= 55) {
                    $status = ReservationStatus::COMPLETED;
                } elseif ($rand <= 70) {
                    $status = ReservationStatus::SUBMITTED;
                } elseif ($rand <= 80) {
                    $status = ReservationStatus::IN_PROGRESS;
                } elseif ($rand <= 90) {
                    $status = ReservationStatus::UNDER_REVIEW;
                } else {
                    $status = ReservationStatus::CANCELLED;
                }
                $reservation->setStatus($status);

                // Notes aléatoires (50% des réservations ont des notes)
                if (mt_rand(0, 1) === 1) {
                    $notes = [
                        'Besoin de documents supplémentaires',
                        'Demande de report possible',
                        'Arrivera en retard le premier jour',
                        'A besoin de matériel spécifique',
                        'Demande d\'aménagement pour handicap'
                    ];
                    $reservation->setNotes($notes[array_rand($notes)]);
                }

                // Dates de création décalées dans le passé
                $createdDaysAgo = mt_rand(1, 30); // 1 à 30 jours dans le passé
                $createdAt = (new \DateTimeImmutable())->modify("-$createdDaysAgo days");
                $reservation->setCreatedAt($createdAt);
                $reservation->setUpdatedAt($createdAt); // Même date pour la création et la mise à jour

                $manager->persist($reservation);
            }
        }

        // Créer une réservation pour l'administrateur aussi (pour tester)
        $admin = $this->getReference(UserFixtures::ADMIN_USER_REFERENCE, User::class);
        $reservation = new Reservation();
        $reservation->setUser($admin);
        $reservation->setSession($sessions[0]); // Première session
        $reservation->setStatus(ReservationStatus::CONFIRMED);
        $reservation->setCreatedAt(new \DateTimeImmutable('-5 days'));
        $reservation->setUpdatedAt(new \DateTimeImmutable('-5 days'));
        $manager->persist($reservation);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            SessionFixtures::class
        ];
    }
}