<?php

namespace App\Command;

use App\DataFixtures\AppFixtures;
use App\DataFixtures\CategoryFixtures;
use App\DataFixtures\CMSContentFixtures;
use App\DataFixtures\DocumentFixtures;
use App\DataFixtures\EmailTemplateFixtures;
use App\DataFixtures\ExamCenterFixtures;
use App\DataFixtures\FormationFixtures;
use App\DataFixtures\ModuleFixtures;
use App\DataFixtures\PaymentFixtures;
use App\DataFixtures\PrerequisiteFixtures;
use App\DataFixtures\ReservationFixtures;
use App\DataFixtures\SessionFixtures;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\VehicleFixtures;
use App\DataFixtures\VehicleRentalFixtures;
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
    private AppFixtures $appFixtures;
    private UserFixtures $userFixtures;
    private CategoryFixtures $categoryFixtures;
    private CMSContentFixtures $cmsContentFixtures;
    private EmailTemplateFixtures $emailTemplateFixtures;
    private ExamCenterFixtures $examCenterFixtures;
    private VehicleFixtures $vehicleFixtures;
    private FormationFixtures $formationFixtures;
    private ModuleFixtures $moduleFixtures;
    private PrerequisiteFixtures $prerequisiteFixtures;
    private SessionFixtures $sessionFixtures;
    private DocumentFixtures $documentFixtures;
    private PaymentFixtures $paymentFixtures;
    private ReservationFixtures $reservationFixtures;
    private VehicleRentalFixtures $vehicleRentalFixtures;
    private ?LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        AppFixtures $appFixtures,
        UserFixtures $userFixtures,
        CategoryFixtures $categoryFixtures,
        CMSContentFixtures $cmsContentFixtures,
        EmailTemplateFixtures $emailTemplateFixtures,
        ExamCenterFixtures $examCenterFixtures,
        VehicleFixtures $vehicleFixtures,
        FormationFixtures $formationFixtures,
        ModuleFixtures $moduleFixtures,
        PrerequisiteFixtures $prerequisiteFixtures,
        SessionFixtures $sessionFixtures,
        DocumentFixtures $documentFixtures,
        PaymentFixtures $paymentFixtures,
        ReservationFixtures $reservationFixtures,
        VehicleRentalFixtures $vehicleRentalFixtures,
        ?LoggerInterface $logger = null
    ) {
        parent::__construct();

        $this->entityManager = $entityManager;
        $this->appFixtures = $appFixtures;
        $this->userFixtures = $userFixtures;
        $this->categoryFixtures = $categoryFixtures;
        $this->cmsContentFixtures = $cmsContentFixtures;
        $this->emailTemplateFixtures = $emailTemplateFixtures;
        $this->examCenterFixtures = $examCenterFixtures;
        $this->vehicleFixtures = $vehicleFixtures;
        $this->formationFixtures = $formationFixtures;
        $this->moduleFixtures = $moduleFixtures;
        $this->prerequisiteFixtures = $prerequisiteFixtures;
        $this->sessionFixtures = $sessionFixtures;
        $this->documentFixtures = $documentFixtures;
        $this->paymentFixtures = $paymentFixtures;
        $this->reservationFixtures = $reservationFixtures;
        $this->vehicleRentalFixtures = $vehicleRentalFixtures;
        $this->logger = $logger;
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

            // 1. Chargement des fixtures de base (sans dépendances)
            $io->text('Loading base fixtures...');
            $executor->execute([$this->appFixtures], $append);
            $executor->execute([$this->userFixtures], $append);
            $executor->execute([$this->categoryFixtures], $append);
            $executor->execute([$this->examCenterFixtures], $append);
            $executor->execute([$this->vehicleFixtures], $append);

            // 2. Chargement des fixtures avec une dépendance
            $io->text('Loading content fixtures...');
            $executor->execute([$this->cmsContentFixtures], $append);
            $executor->execute([$this->emailTemplateFixtures], $append);
            $executor->execute([$this->formationFixtures], $append);

            // 3. Chargement des fixtures avec des dépendances de formations
            $io->text('Loading formation-related fixtures...');
            $executor->execute([$this->moduleFixtures], $append);
            $executor->execute([$this->prerequisiteFixtures], $append);
            $executor->execute([$this->sessionFixtures], $append);

            // 4. Chargement des fixtures avec des dépendances multiples
            $io->text('Loading transaction fixtures...');
            $executor->execute([$this->documentFixtures], $append);
            $executor->execute([$this->paymentFixtures], $append);
            $executor->execute([$this->reservationFixtures], $append);
            $executor->execute([$this->vehicleRentalFixtures], $append);

            $io->success('All fixtures loaded successfully!');
            $io->text('Loaded fixtures:');
            $io->listing([
                'AppFixtures',
                'UserFixtures',
                'CategoryFixtures',
                'CMSContentFixtures',
                'EmailTemplateFixtures',
                'ExamCenterFixtures',
                'VehicleFixtures',
                'FormationFixtures',
                'ModuleFixtures',
                'PrerequisiteFixtures',
                'SessionFixtures',
                'DocumentFixtures',
                'PaymentFixtures',
                'ReservationFixtures',
                'VehicleRentalFixtures'
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('An error occurred during fixture loading: ' . $e->getMessage());
            $io->text($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}