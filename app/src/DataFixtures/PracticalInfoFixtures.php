<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use App\Entity\PracticalInfo;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class PracticalInfoFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Partie pratique pour la Formation Initiale Taxi
        $formationInitial = $this->getReference(FormationFixtures::FORMATION_INITIAL_REFERENCE, Formation::class);
        
        $practicalInfoInitial = new PracticalInfo();
        $practicalInfoInitial->setTitle('Formation Pratique');
        $practicalInfoInitial->setDescription(
            '<p>21 heures de formation pratique en conditions réelles avec :</p>
            <ul>
                <li>🚗 <strong>Véhicule école équipé taxi</strong> avec doubles commandes</li>
                <li>💳 <strong>Équipements professionnels complets</strong> (taximètre, terminal de paiement)</li>
                <li>📅 <strong>Sessions pratiques</strong> en conditions réelles</li>
                <li>👨‍🏫 <strong>Accompagnement personnalisé</strong> par un formateur expérimenté</li>
                <li>🗺️ <strong>Découverte du territoire</strong> et des points d\'intérêt locaux</li>
            </ul>
            <p><strong>Objectifs :</strong> Maîtriser la conduite professionnelle, les équipements taxi et les relations clientèle.</p>'
        );
        $practicalInfoInitial->setImage('/images/practical.jpg');
        $practicalInfoInitial->setFormation($formationInitial);

        $manager->persist($practicalInfoInitial);

        // Partie pratique pour la Formation Continue
        $formationContinue = $this->getReference(FormationFixtures::FORMATION_CONTINUE_REFERENCE, Formation::class);
        
        $practicalInfoContinue = new PracticalInfo();
        $practicalInfoContinue->setTitle('Mise en Pratique');
        $practicalInfoContinue->setDescription(
            '<p>Sessions pratiques de mise à jour des compétences :</p>
            <ul>
                <li>👥 <strong>Exercices de mise en situation clients</strong></li>
                <li>💳 <strong>Utilisation des nouveaux équipements</strong></li>
                <li>📱 <strong>Applications mobiles</strong> et technologies récentes</li>
                <li>🛡️ <strong>Sécurité et gestes barrières</strong></li>
            </ul>
            <p><em>Formation adaptée aux évolutions du métier de chauffeur de taxi.</em></p>'
        );
        $practicalInfoContinue->setImage('/images/practical.jpg');
        $practicalInfoContinue->setFormation($formationContinue);

        $manager->persist($practicalInfoContinue);

        // Partie pratique pour la Formation Mobilité
        $formationMobility = $this->getReference(FormationFixtures::FORMATION_MOBILITY_REFERENCE, Formation::class);
        
        $practicalInfoMobility = new PracticalInfo();
        $practicalInfoMobility->setTitle('Adaptation Territoriale');
        $practicalInfoMobility->setDescription(
            '<p>Formation pratique d\'adaptation au nouveau territoire :</p>
            <ul>
                <li>🗺️ <strong>Découverte du territoire</strong> et des points d\'intérêt</li>
                <li>📋 <strong>Spécificités locales</strong> et réglementations</li>
                <li>🏢 <strong>Zones d\'activité importantes</strong> (gares, aéroports, hôpitaux)</li>
                <li>📞 <strong>Contacts utiles</strong> et services locaux</li>
            </ul>
            <p><strong>Durée :</strong> Adaptation progressive sur plusieurs sessions pour une intégration optimale.</p>'
        );
        $practicalInfoMobility->setImage('/images/practical.jpg');
        $practicalInfoMobility->setFormation($formationMobility);

        $manager->persist($practicalInfoMobility);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            FormationFixtures::class,
        ];
    }
}