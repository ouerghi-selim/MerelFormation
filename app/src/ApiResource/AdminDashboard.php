<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Admin\DashboardAdminController;

#[ApiResource(
    shortName: 'admin_dashboard',
    operations: [
        new Get(
            uriTemplate: '/admin/dashboard/stats',
            controller: DashboardAdminController::class . '::getStats',
        ),
        new GetCollection(
            uriTemplate: '/admin/dashboard/recent-inscriptions',
            controller: DashboardAdminController::class . '::getRecentInscriptions',
        ),
        new GetCollection(
            uriTemplate: '/admin/dashboard/recent-reservations',
            controller: DashboardAdminController::class . '::getRecentReservations',
        ),
        new GetCollection(
            uriTemplate: '/admin/dashboard/revenue-data',
            controller: DashboardAdminController::class . '::getRevenueData',
        ),
        new GetCollection(
            uriTemplate: '/admin/dashboard/success-rate-data',
            controller: DashboardAdminController::class . '::getSuccessRateData',
        ),
    ]
)]
class AdminDashboard
{
    // Propriétés si nécessaire...
}
