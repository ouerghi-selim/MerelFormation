<?php

namespace App\Command;

use Doctrine\Common\DataFixtures\Executor\ORMExecutor;
use Doctrine\Common\DataFixtures\Loader;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

// Importation de toutes les fixtures
use App\DataFixtures\CategoryFixtures;
use App\DataFixtures\FormationFixtures;
use App\DataFixtures\ModuleFixtures;
use App\DataFixtures\PrerequisiteFixtures;
use App\DataFixtures\SessionFixtures;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\VehicleFixtures;
use App\DataFixtures\DocumentFixtures;
use App\DataFixtures\ReservationFixtures;
use App\DataFixtures\VehicleRentalFixtures;

#[AsCommand(
    name: 'app:load-initial-data',
    description: 'Loads initial data for the application in production environment',
)]
class LoadInitialDataCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private ContainerInterface $container;

    public function __construct(
        EntityManagerInterface $entityManager,
        ContainerInterface $container
    ) {
        $this->entityManager = $entityManager;
        $this->container = $container;

        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'purge',
                null,
                InputOption::VALUE_NONE,
                'Purge database before loading fixtures (USE WITH CAUTION)'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Loading initial data for MerelFormation');

        // Avertissement si l'option purge est activée
        if ($input->getOption('purge')) {
            $io->caution('You are about to purge the database. All existing data will be lost!');
            if (!$io->confirm('Do you want to continue?', false)) {
                return Command::SUCCESS;
            }
        }

        $loader = new Loader();

        // Instanciation manuelle des fixtures dans le bon ordre
        $io->section('Preparing fixtures');

        // Les fixtures qui n'ont pas de dépendances
        $userFixtures = $this->container->get(UserFixtures::class);
        $categoryFixtures = $this->container->get(CategoryFixtures::class);
        $vehicleFixtures = $this->container->get(VehicleFixtures::class);

        // Les fixtures avec dépendances
        $formationFixtures = $this->container->get(FormationFixtures::class);
        $moduleFixtures = $this->container->get(ModuleFixtures::class);
        $prerequisiteFixtures = $this->container->get(PrerequisiteFixtures::class);
        $sessionFixtures = $this->container->get(SessionFixtures::class);
        $documentFixtures = $this->container->get(DocumentFixtures::class);
        $reservationFixtures = $this->container->get(ReservationFixtures::class);
        $vehicleRentalFixtures = $this->container->get(VehicleRentalFixtures::class);

        // On injecte le container dans les fixtures qui en ont besoin
        if ($userFixtures instanceof ContainerAwareInterface) {
            $userFixtures->setContainer($this->container);
        }
        if ($reservationFixtures instanceof ContainerAwareInterface) {
            $reservationFixtures->setContainer($this->container);
        }
        if ($vehicleRentalFixtures instanceof ContainerAwareInterface) {
            $vehicleRentalFixtures->setContainer($this->container);
        }

        // Ajout des fixtures au loader dans l'ordre de dépendance
        $loader->addFixture($userFixtures);
        $loader->addFixture($categoryFixtures);
        $loader->addFixture($vehicleFixtures);
        $loader->addFixture($formationFixtures);
        $loader->addFixture($moduleFixtures);
        $loader->addFixture($prerequisiteFixtures);
        $loader->addFixture($sessionFixtures);
        $loader->addFixture($documentFixtures);
        $loader->addFixture($reservationFixtures);
        $loader->addFixture($vehicleRentalFixtures);

        $fixtures = $loader->getFixtures();

        if (empty($fixtures)) {
            $io->error('No fixtures found');
            return Command::FAILURE;
        }

        $io->note(sprintf('Found %d fixture classes to load', count($fixtures)));

        $purger = new ORMPurger($this->entityManager);
        $purger->setPurgeMode($input->getOption('purge') ? ORMPurger::PURGE_MODE_DELETE : ORMPurger::PURGE_MODE_NONE);

        $executor = new ORMExecutor($this->entityManager, $purger);
        $executor->setLogger(function ($message) use ($io) {
            $io->text(sprintf('  <comment>></comment> <info>%s</info>', $message));
        });

        $io->section('Executing fixtures');

        try {
            $executor->execute($fixtures, !$input->getOption('purge'));
            $io->success('Initial data loaded successfully!');
        } catch (\Exception $e) {
            $io->error('An error occurred during fixture loading: ' . $e->getMessage());
            $io->text($e->getTraceAsString());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}