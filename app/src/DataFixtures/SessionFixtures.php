<?php

namespace App\DataFixtures;

use App\Entity\Session;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class SessionFixtures extends Fixture implements DependentFixtureInterface
{
    public const SESSION_1_REFERENCE = 'session-1';
    public const SESSION_2_REFERENCE = 'session-2';

    public function load(ObjectManager $manager): void
    {
        // Création des sessions pour la formation initiale
        $startDates = [
            new \DateTimeImmutable('+2 weeks'),
            new \DateTimeImmutable('+6 weeks'),
        ];

        foreach ($startDates as $index => $startDate) {
            $session = new Session();
            $session->setFormation($this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE));
            $session->setStartDate($startDate);
            $session->setEndDate($startDate->modify('+4 weeks')); // 4 semaines de formation
            $session->setMaxParticipants(12);
            $session->setLocation('7 RUE Georges Maillols, 35000 RENNES');
            $session->setStatus('scheduled');
            $session->setNotes('Session de formation initiale taxi');

            $manager->persist($session);
            $this->addReference('session-' . ($index + 1), $session);
        }

        // Création d'une session pour la formation continue
        $sessionContinue = new Session();
        $sessionContinue->setFormation($this->getReference(FormationFixtures::FORMATION_CONTINUE_REFERENCE));
        $sessionContinue->setStartDate(new \DateTimeImmutable('+1 week'));
        $sessionContinue->setEndDate(new \DateTimeImmutable('+1 week 2 days')); // 2 jours de formation
        $sessionContinue->setMaxParticipants(15);
        $sessionContinue->setLocation('7 RUE Georges Maillols, 35000 RENNES');
        $sessionContinue->setStatus('scheduled');
        $sessionContinue->setNotes('Session de formation continue taxi');

        $manager->persist($sessionContinue);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            FormationFixtures::class,
        ];
    }
}