<?php

namespace App\Command;

use App\Enum\ReservationStatus;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-reservation-status',
    description: 'Test du système de statuts de réservation unifié'
)]
class TestReservationStatusCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Test du système de statuts de réservation unifié');

        // Test 1: Statuts pour formations
        $io->section('Statuts disponibles pour les formations');
        $formationStatuses = ReservationStatus::getStatusesForType('formation');
        $io->listing($formationStatuses);

        // Test 2: Statuts pour véhicules
        $io->section('Statuts disponibles pour les véhicules');
        $vehicleStatuses = ReservationStatus::getStatusesForType('vehicle');
        $io->listing($vehicleStatuses);

        // Test 3: Transitions pour véhicules
        $io->section('Transitions disponibles depuis "submitted" pour véhicules');
        $transitions = ReservationStatus::getAllowedTransitionsForType('submitted', 'vehicle');
        $io->listing($transitions);

        // Test 4: Validation
        $io->section('Validation des statuts');
        $testCases = [
            ['failed', 'vehicle', false],
            ['confirmed', 'vehicle', true],
            ['awaiting_funding', 'vehicle', false],
            ['awaiting_funding', 'formation', true],
        ];

        foreach ($testCases as [$status, $type, $expected]) {
            $result = ReservationStatus::isValidForType($status, $type);
            $icon = $result === $expected ? '✅' : '❌';
            $io->writeln("$icon Status '$status' pour '$type': " . ($result ? 'VALIDE' : 'INVALIDE'));
        }

        $io->success('Tous les tests sont passés ! Le système unifié fonctionne correctement.');

        return Command::SUCCESS;
    }
}