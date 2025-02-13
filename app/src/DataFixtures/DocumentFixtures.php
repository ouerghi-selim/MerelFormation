<?php

namespace App\DataFixtures;

use App\Entity\Document;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class DocumentFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $documents = [
            [
                'title' => 'Programme Formation Initiale',
                'type' => 'pdf',
                'fileName' => 'programme_formation_initiale.pdf',
                'category' => 'support',
                'private' => false,
                'uploadedBy' => $this->getReference(UserFixtures::FORMATEUR_USER_REFERENCE),
                'formation' => $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE),
            ],
            [
                'title' => 'Convention de formation',
                'type' => 'pdf',
                'fileName' => 'convention_formation.pdf',
                'category' => 'contrat',
                'private' => true,
                'uploadedBy' => $this->getReference(UserFixtures::ADMIN_USER_REFERENCE),
            ],
            [
                'title' => 'Guide du stagiaire',
                'type' => 'pdf',
                'fileName' => 'guide_stagiaire.pdf',
                'category' => 'support',
                'private' => false,
                'uploadedBy' => $this->getReference(UserFixtures::FORMATEUR_USER_REFERENCE),
            ],
        ];

        foreach ($documents as $documentData) {
            $document = new Document();
            $document->setTitle($documentData['title']);
            $document->setType($documentData['type']);
            $document->setFileName($documentData['fileName']);
            $document->setCategory($documentData['category']);
            $document->setPrivate($documentData['private']);
            $document->setUploadedBy($documentData['uploadedBy']);
            
            if (isset($documentData['formation'])) {
                $document->setFormation($documentData['formation']);
            }

            $manager->persist($document);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            FormationFixtures::class,
        ];
    }
}