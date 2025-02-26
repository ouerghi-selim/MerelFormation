<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Formation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class FormationFixtures extends Fixture implements DependentFixtureInterface
{
    public const FORMATION_INITIAL_REFERENCE = 'formation-initial';
    public const FORMATION_CONTINUE_REFERENCE = 'formation-continue';
    public const FORMATION_MOBILITY_REFERENCE = 'formation-mobility';

    public function load(ObjectManager $manager): void
    {
        $formations = [
            [
                'title' => 'Formation Initiale Taxi',
                'description' => 'Formation complète pour devenir chauffeur de taxi (140h)',
                'price' => 1800.00,
                'duration' => 140,
                'type' => 'initial',
                'reference' => self::FORMATION_INITIAL_REFERENCE,
            ],
            [
                'title' => 'Formation Continue Taxi',
                'description' => 'Formation continue obligatoire pour les chauffeurs de taxi (14h)',
                'price' => 400.00,
                'duration' => 14,
                'type' => 'continuous',
                'reference' => self::FORMATION_CONTINUE_REFERENCE,
            ],
            [
                'title' => 'Formation Mobilité Taxi',
                'description' => 'Formation mobilité pour les chauffeurs souhaitant exercer dans un autre département',
                'price' => 300.00,
                'duration' => 14,
                'type' => 'mobility',
                'reference' => self::FORMATION_MOBILITY_REFERENCE,
            ],
        ];

        foreach ($formations as $formationData) {
            $formation = new Formation();
            $formation->setTitle($formationData['title']);
            $formation->setDescription($formationData['description']);
            $formation->setPrice($formationData['price']);
            $formation->setDuration($formationData['duration']);
            $formation->setType($formationData['type']);
            $formation->setIsActive(true);
            $formation->setCategory($this->getReference(CategoryFixtures::TAXI_CATEGORY_REFERENCE, Category::class));

            $manager->persist($formation);
            $this->addReference($formationData['reference'], $formation);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            CategoryFixtures::class,
        ];
    }
}