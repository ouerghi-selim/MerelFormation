<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\Student\FormationStudentController;

#[ApiResource(
    shortName: 'student_formations',
    operations: [
        new GetCollection(
            uriTemplate: '/student/formations',
            controller: FormationStudentController::class . '::list',
        ),
        new Get(
            uriTemplate: '/student/formations/{id}',
            controller: FormationStudentController::class . '::get',
        ),
    ]
)]
class StudentFormations
{
    // Propriétés si nécessaire...
}
