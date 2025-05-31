<?php

namespace App\Command;

use App\DataFixtures\CategoryFixtures;
use App\DataFixtures\DocumentFixtures;
use App\DataFixtures\FormationFixtures;
use App\DataFixtures\ModuleFixtures;
use App\DataFixtures\PrerequisiteFixtures;
use App\DataFixtures\ReservationFixtures;
use App\DataFixtures\SessionFixtures;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\VehicleFixtures;
use App\DataFixtures\VehicleRentalFixtures;
// Ajouter conditionnellement les fixtures qui existent
use App\DataFixtures\AppFixtures;
use App\DataFixtures\PaymentFixtures;
use App\DataFixtures\EmailTemplateFixtures;
use App\DataFixtures\ExamCenterFixtures;
use App\DataFixtures\CMSContentFixtures;
use Doctrine\Common\DataFixtures\Executor\ORMExecutor;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\AbstractLogger;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Logger personnalisé qui utilise SymfonyStyle pour l'affichage
 */
class ConsoleLogger extends AbstractLogger
{
    private SymfonyStyle $io;

    public function __construct(SymfonyStyle $io)
    {
        $this->io = $io;
    }

    public function log($level, $message, array $context = []): void
    {
        $this->io->text(sprintf('  <comment>></comment> <info>%s</info>', $message));
    }
}

#[AsCommand(
    name: 'app:fixtures:load',
    description: 'Load fixtures as initial data in production'
)]
class LoadInitialDataCommand extends Command
{
    protected static $defaultName = 'app:fixtures:load';

    private EntityManagerInterface $entityManager;
    private UserFixtures $userFixtures;
    private CategoryFixtures $categoryFixtures;
    private VehicleFixtures $vehicleFixtures;
    private FormationFixtures $formationFixtures;
    private ModuleFixtures $moduleFixtures;
    private PrerequisiteFixtures $prerequisiteFixtures;
    private SessionFixtures $sessionFixtures;
    private DocumentFixtures $documentFixtures;
    private ReservationFixtures $reservationFixtures;
    private VehicleRentalFixtures $vehicleRentalFixtures;

    // Fixtures optionnelles (peuvent ne pas exister)
    private ?AppFixtures $appFixtures = null;
    private ?PaymentFixtures $paymentFixtures = null;
    private ?EmailTemplateFixtures $emailTemplateFixtures = null;
    private ?ExamCenterFixtures $examCenterFixtures = null;
    private ?CMSContentFixtures $cmsContentFixtures = null;

    private ?LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserFixtures $userFixtures,
        CategoryFixtures $categoryFixtures,
        VehicleFixtures $vehicleFixtures,
        FormationFixtures $formationFixtures,
        ModuleFixtures $moduleFixtures,
        PrerequisiteFixtures $prerequisiteFixtures,
        SessionFixtures $sessionFixtures,
        DocumentFixtures $documentFixtures,
        ReservationFixtures $reservationFixtures,
        VehicleRentalFixtures $vehicleRentalFixtures,
        ?LoggerInterface $logger = null,
        ?AppFixtures $appFixtures = null,
        ?PaymentFixtures $paymentFixtures = null,
        ?EmailTemplateFixtures $emailTemplateFixtures = null,
        ?ExamCenterFixtures $examCenterFixtures = null,
        ?CMSContentFixtures $cmsContentFixtures = null
    ) {
        parent::__construct();

        $this->entityManager = $entityManager;
        $this->userFixtures = $userFixtures;
        $this->categoryFixtures = $categoryFixtures;
        $this->vehicleFixtures = $vehicleFixtures;
        $this->formationFixtures = $formationFixtures;
        $this->moduleFixtures = $moduleFixtures;
        $this->prerequisiteFixtures = $prerequisiteFixtures;
        $this->sessionFixtures = $sessionFixtures;
        $this->documentFixtures = $documentFixtures;
        $this->reservationFixtures = $reservationFixtures;
        $this->vehicleRentalFixtures = $vehicleRentalFixtures;
        $this->logger = $logger;

        // Fixtures optionnelles
        $this->appFixtures = $appFixtures;
        $this->paymentFixtures = $paymentFixtures;
        $this->emailTemplateFixtures = $emailTemplateFixtures;
        $this->examCenterFixtures = $examCenterFixtures;
        $this->cmsContentFixtures = $cmsContentFixtures;
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'purge',
                null,
                InputOption::VALUE_NONE,
                'Purge database before loading fixtures (USE WITH CAUTION)'
            )
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                'Force loading even if data already exists (may cause duplicates)'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Loading initial data for MerelFormation');

        // Vérifier s'il y a déjà des données
        $hasExistingData = $this->checkExistingData();

        if ($hasExistingData && !$input->getOption('purge') && !$input->getOption('force')) {
            $io->warning('Database already contains data.');
            $io->text('Options:');
            $io->listing([
                'Use --purge to clear all data before loading fixtures',
                'Use --force to load anyway (may cause duplicates)',
                'Run without options to cancel'
            ]);

            if (!$io->confirm('Continue anyway? This may cause duplicate errors.', false)) {
                return Command::SUCCESS;
            }
        }

        // Avertissement si l'option purge est activée
        if ($input->getOption('purge')) {
            $io->caution('You are about to purge the database. All existing data will be lost!');
            if (!$io->confirm('Do you want to continue?', false)) {
                return Command::SUCCESS;
            }
        }

        try {
            // Créer un logger qui utilise SymfonyStyle
            $logger = new ConsoleLogger($io);

            // Configuration du purger et de l'exécuteur
            $purger = null;

            if ($input->getOption('purge')) {
                // Uniquement créer un purger si l'option --purge est spécifiée
                $purger = new ORMPurger($this->entityManager);
                // On utilise directement 1 qui correspond généralement à PURGE_MODE_DELETE
                $purger->setPurgeMode(1);
                $executor = new ORMExecutor($this->entityManager, $purger);
                $append = false; // Si on purge, on n'utilise pas l'option append
            } else {
                // Sans purger, on crée l'exécuteur sans purger
                $executor = new ORMExecutor($this->entityManager);
                $append = true; // On utilise l'option append pour ajouter les données
            }

            // Définir le logger pour l'exécuteur
            $executor->setLogger($logger);

            // Chargement des fixtures dans un ordre spécifique pour respecter les dépendances
            $io->section('Loading fixtures');

            $this->loadFixturesWithErrorHandling($executor, $io, $append);

            $io->success('Fixtures loading completed!');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('An error occurred during fixture loading: ' . $e->getMessage());
            $io->text('Stack trace:');
            $io->text($e->getTraceAsString());

            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                $io->note('This error suggests data already exists. Try using --purge option to clear the database first.');
            }

            return Command::FAILURE;
        }
    }

    private function checkExistingData(): bool
    {
        // Vérifier s'il y a des données dans les principales tables
        $tables = ['user', 'vehicle', 'formation', 'category'];

        foreach ($tables as $table) {
            try {
                $count = $this->entityManager->getConnection()
                    ->executeQuery("SELECT COUNT(*) FROM {$table}")
                    ->fetchOne();

                if ($count > 0) {
                    return true;
                }
            } catch (\Exception $e) {
                // Si la table n'existe pas, continuer
                continue;
            }
        }

        return false;
    }

    private function loadFixturesWithErrorHandling(ORMExecutor $executor, SymfonyStyle $io, bool $append): void
    {
        $fixturesGroups = [
            'Base fixtures' => [
                $this->userFixtures,
                $this->categoryFixtures,
            ],
            'Optional base fixtures' => [
                $this->appFixtures,
                $this->examCenterFixtures,
                $this->cmsContentFixtures,
                $this->emailTemplateFixtures,
            ],
            'Vehicle fixtures' => [
                $this->vehicleFixtures,
            ],
            'Formation fixtures' => [
                $this->formationFixtures,
                $this->moduleFixtures,
                $this->prerequisiteFixtures,
                $this->sessionFixtures,
            ],
            'Transaction fixtures' => [
                $this->documentFixtures,
                $this->paymentFixtures,
                $this->reservationFixtures,
                $this->vehicleRentalFixtures,
            ]
        ];

        foreach ($fixturesGroups as $groupName => $fixtures) {
            $io->text("Loading {$groupName}...");

            foreach ($fixtures as $fixture) {
                if ($fixture === null) {
                    continue; // Ignorer les fixtures optionnelles qui n'existent pas
                }

                try {
                    $executor->execute([$fixture], $append);
                } catch (\Exception $e) {
                    if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                        $io->warning("Skipping fixture " . get_class($fixture) . " (data already exists)");
                        continue;
                    }
                    throw $e; // Relancer l'exception si ce n'est pas un problème de doublon
                }
            }
        }
    }
}