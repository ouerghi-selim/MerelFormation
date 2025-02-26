<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use App\Entity\Module;
use App\Entity\ModulePoint;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class ModuleFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $modules = [
            [
                'title' => 'Organisation du Transport',
                'duration' => 21,
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class),
                'points' => [
                    'Réglementation nationale du transport de personnes',
                    'Code des transports et textes officiels',
                    'Gestion des contrôles et sanctions'
                ]
            ],
            [
                'title' => 'Sécurité Routière',
                'duration' => 28,
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class),
                'points' => [
                    'Règles du code de la route',
                    'Éco-conduite et sécurité',
                    'Gestion des incidents'
                ]
            ],
            [
                'title' => 'Gestion et Réglementation',
                'duration' => 35,
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class),
                'points' => [
                    'Gestion d\'entreprise taxi',
                    'Réglementation locale',
                    'Obligations comptables et fiscales'
                ]
            ],
        ];

        foreach ($modules as $moduleData) {
            $module = new Module();
            $module->setTitle($moduleData['title']);
            $module->setDuration($moduleData['duration']);
            $module->setFormation($moduleData['formation']);

            foreach ($moduleData['points'] as $pointContent) {
                $point = new ModulePoint();
                $point->setContent($pointContent);
                $point->setModule($module);
                $manager->persist($point);
                $module->addPoint($point);
            }

            $manager->persist($module);
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