<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\Admin\ReservationAdminController;

#[ApiResource(
    shortName: 'user_license_files',
    operations: [
        new Get(
            uriTemplate: '/admin/users/{userId}/license/{type}/download',
            controller: ReservationAdminController::class . '::downloadUserLicense',
            requirements: ['userId' => '\d+', 'type' => 'front|back'],
        ),
    ]
)]
class UserLicenseFiles
{
    // Cette classe sert uniquement à définir les routes API
}