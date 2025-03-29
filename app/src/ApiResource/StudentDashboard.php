<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Student\DashboardStudentController;

#[ApiResource(
    shortName: 'student_dashboard',
    operations: [
        new Get(
            uriTemplate: '/student/dashboard',
            controller: DashboardStudentController::class . '::index',
        ),
        new Get(
            uriTemplate: '/student/profile',
            controller: DashboardStudentController::class . '::getProfile',
        ),
    ]
)]
class StudentDashboard
{
    // Propriétés si nécessaire...
}
