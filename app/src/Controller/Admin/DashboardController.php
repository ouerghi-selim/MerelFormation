<?php

namespace App\Controller\Admin;

use App\Entity\User;
use App\Entity\Formation;
use App\Entity\Session;
use App\Entity\Vehicle;
use App\Entity\VehicleRental;
use App\Entity\Category;
use App\Entity\Document;
use App\Entity\Payment;
use App\Entity\Invoice;
use App\Entity\Notification;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractDashboardController
{
    public function __construct(
        private AdminUrlGenerator $adminUrlGenerator
    ) {
    }

    #[Route('/admin', name: 'admin')]
    public function index(): Response
    {
        $url = $this->adminUrlGenerator
            ->setController(FormationCrudController::class)
            ->generateUrl();

        return $this->redirect($url);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('MerelFormation Admin')
            ->setFaviconPath('favicon.ico')
            ->renderContentMaximized();
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::section('Formation');
        yield MenuItem::linkToCrud('Formations', 'fas fa-graduation-cap', Formation::class);
        yield MenuItem::linkToCrud('Sessions', 'fas fa-calendar-alt', Session::class);
        yield MenuItem::linkToCrud('Catégories', 'fas fa-folder', Category::class);

        yield MenuItem::section('Location');
        yield MenuItem::linkToCrud('Véhicules', 'fas fa-car', Vehicle::class);
        yield MenuItem::linkToCrud('Locations', 'fas fa-key', VehicleRental::class);

        yield MenuItem::section('Utilisateurs');
        yield MenuItem::linkToCrud('Utilisateurs', 'fas fa-users', User::class);
        yield MenuItem::linkToCrud('Notifications', 'fas fa-bell', Notification::class);

        yield MenuItem::section('Documents');
        yield MenuItem::linkToCrud('Documents', 'fas fa-file', Document::class);

        yield MenuItem::section('Finance');
        yield MenuItem::linkToCrud('Paiements', 'fas fa-credit-card', Payment::class);
        yield MenuItem::linkToCrud('Factures', 'fas fa-file-invoice', Invoice::class);

        yield MenuItem::section('Rapports');
        yield MenuItem::linkToRoute('Statistiques', 'fas fa-chart-bar', 'admin_stats');
        yield MenuItem::linkToRoute('Export Données', 'fas fa-file-export', 'admin_export');
    }
}