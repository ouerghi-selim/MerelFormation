<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\FormationAdminController;

#[ApiResource(
    shortName: 'admin_formations',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/formations',
            controller: FormationAdminController::class . '::list',
        ),
        new Get(
            uriTemplate: '/admin/formations/{id}',
            controller: FormationAdminController::class . '::get',
        ),
        new Post(
            uriTemplate: '/admin/formations',
            controller: FormationAdminController::class . '::create',
        ),
        new Put(
            uriTemplate: '/admin/formations/{id}',
            controller: FormationAdminController::class . '::update',
        ),
        new Delete(
            uriTemplate: '/admin/formations/{id}',
            controller: FormationAdminController::class . '::delete',
        ),
        new GetCollection(
            uriTemplate: '/admin/formations/sessions',
            controller: FormationAdminController::class . '::getSessions',
        ),
    ]
)]
class AdminFormations
{
    // Propriétés si nécessaire...
}
