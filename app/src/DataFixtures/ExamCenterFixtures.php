<?php

namespace App\DataFixtures;

use App\Entity\ExamCenter;
use App\Entity\Formula;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ExamCenterFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Centre d'examen Rennes (Bruz)
        $rennesCenter = new ExamCenter();
        $rennesCenter->setName('35 Rennes (Bruz)')
                     ->setCode('RENNES_BRUZ')
                     ->setCity('Rennes')
                     ->setDepartmentCode('35')
                     ->setAddress('Zone d\'activité de Bruz, 35170 Bruz')
                     ->setIsActive(true);

        $manager->persist($rennesCenter);

        // Formules pour Rennes
        $rennesSimple = new Formula();
        $rennesSimple->setName('Formule simple')
                     ->setDescription('Location Véhicule Taxi-Ecole')
                     ->setPrice('120.00')
                     ->setType('simple')
                     ->setIsActive(true)
                     ->setExamCenter($rennesCenter);

        $manager->persist($rennesSimple);

        $rennesIntegral = new Formula();
        $rennesIntegral->setName('Formule intégrale')
                       ->setDescription('Location Véhicule Taxi-Ecole pour votre passage')
                       ->setPrice('240.00')
                       ->setType('integral')
                       ->setAdditionalInfo('+ 1H30 En individuel de Prise en main du véhicule, Conduite')
                       ->setIsActive(true)
                       ->setExamCenter($rennesCenter);

        $manager->persist($rennesIntegral);

        // Centre d'examen Saint-Brieuc
        $saintBrieucCenter = new ExamCenter();
        $saintBrieucCenter->setName('22 Saint Brieuc')
                          ->setCode('SAINT_BRIEUC')
                          ->setCity('Saint-Brieuc')
                          ->setDepartmentCode('22')
                          ->setAddress('Saint-Brieuc, 22000')
                          ->setIsActive(true);

        $manager->persist($saintBrieucCenter);

        // Formules pour Saint-Brieuc
        $saintBrieucSimple = new Formula();
        $saintBrieucSimple->setName('Formule simple')
                          ->setDescription('Location Véhicule Taxi-Ecole')
                          ->setType('simple')
                          ->setIsActive(true)
                          ->setExamCenter($saintBrieucCenter);

        $manager->persist($saintBrieucSimple);

        $saintBrieucIntegral = new Formula();
        $saintBrieucIntegral->setName('Formule intégrale')
                            ->setDescription('Location Véhicule Taxi-Ecole pour votre passage')
                            ->setType('integral')
                            ->setAdditionalInfo('+ 1H30 En individuel Prise en main du véhicule, Conduite')
                            ->setIsActive(true)
                            ->setExamCenter($saintBrieucCenter);

        $manager->persist($saintBrieucIntegral);

        // Centre d'examen Vannes
        $vannesCenter = new ExamCenter();
        $vannesCenter->setName('56 Vannes')
                     ->setCode('VANNES')
                     ->setCity('Vannes')
                     ->setDepartmentCode('56')
                     ->setAddress('Vannes, 56000')
                     ->setIsActive(true);

        $manager->persist($vannesCenter);

        // Formules pour Vannes
        $vannesSimple = new Formula();
        $vannesSimple->setName('Formule simple')
                     ->setDescription('Location Véhicule Taxi-Ecole')
                     ->setType('simple')
                     ->setIsActive(true)
                     ->setExamCenter($vannesCenter);

        $manager->persist($vannesSimple);

        $vannesIntegral = new Formula();
        $vannesIntegral->setName('Formule intégrale')
                       ->setDescription('Location Véhicule Taxi-Ecole pour votre passage')
                       ->setType('integral')
                       ->setAdditionalInfo('+ 1H30 En individuel Prise en main du véhicule, Conduite')
                       ->setIsActive(true)
                       ->setExamCenter($vannesCenter);

        $manager->persist($vannesIntegral);

        // Centre d'examen Nantes
        $nantesCenter = new ExamCenter();
        $nantesCenter->setName('44 Nantes')
                     ->setCode('NANTES')
                     ->setCity('Nantes')
                     ->setDepartmentCode('44')
                     ->setAddress('Nantes, 44000')
                     ->setIsActive(true);

        $manager->persist($nantesCenter);

        // Formules pour Nantes
        $nantesSimple = new Formula();
        $nantesSimple->setName('Formule simple')
                     ->setDescription('Location Véhicule Taxi-Ecole')
                     ->setType('simple')
                     ->setIsActive(true)
                     ->setExamCenter($nantesCenter);

        $manager->persist($nantesSimple);

        $nantesIntegral = new Formula();
        $nantesIntegral->setName('Formule intégrale')
                       ->setDescription('Location Véhicule Taxi-Ecole pour votre passage')
                       ->setType('integral')
                       ->setAdditionalInfo('+ 1H30 En individuel Prise en main du véhicule, Conduite')
                       ->setIsActive(true)
                       ->setExamCenter($nantesCenter);

        $manager->persist($nantesIntegral);

        $manager->flush();
    }
}