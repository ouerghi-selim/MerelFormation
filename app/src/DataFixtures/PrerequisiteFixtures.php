<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use App\Entity\Prerequisite;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class PrerequisiteFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $prerequisites = [
            [
                'content' => 'Permis B en cours de validité (hors période probatoire)',
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class),
            ],
            [
                'content' => 'Maîtrise du Français oral et écrit',
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class),
            ],
            [
                'content' => 'Notions en anglais écrit',
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class),
            ],
        ];

        foreach ($prerequisites as $prereqData) {
            $prerequisite = new Prerequisite();
            $prerequisite->setContent($prereqData['content']);
            $prerequisite->setFormation($prereqData['formation']);
            $manager->persist($prerequisite);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            FormationFixtures::class,
        ];
    }
}