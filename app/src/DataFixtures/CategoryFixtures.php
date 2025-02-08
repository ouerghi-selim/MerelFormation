<?php

namespace App\DataFixtures;

use App\Entity\Category;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\String\Slugger\AsciiSlugger;

class CategoryFixtures extends Fixture
{
    public const TAXI_CATEGORY_REFERENCE = 'taxi-category';
    public const VTC_CATEGORY_REFERENCE = 'vtc-category';

    public function load(ObjectManager $manager): void
    {
        $slugger = new AsciiSlugger();
        $categories = [
            [
                'name' => 'Formation Taxi',
                'description' => 'Toutes les formations pour devenir chauffeur de taxi',
                'reference' => self::TAXI_CATEGORY_REFERENCE,
                'slug' => 'formation-taxi'
            ],
            [
                'name' => 'Formation VTC',
                'description' => 'Toutes les formations pour devenir chauffeur VTC',
                'reference' => self::VTC_CATEGORY_REFERENCE,
                'slug' => 'formation-vtc'
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = new Category();
            $category->setName($categoryData['name']);
            $category->setDescription($categoryData['description']);
            $category->setSlug($categoryData['slug']);
            $category->setIsActive(true);
            $category->setLft(1);
            $category->setRgt(2);
            $category->setLevel(0);

            $manager->persist($category);
            $this->addReference($categoryData['reference'], $category);
        }

        $manager->flush();
    }
}