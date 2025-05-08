<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\UserAdminController;

#[ApiResource(
    shortName: 'admin_users',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/users',
            controller: UserAdminController::class . '::list',
        ),
        new GetCollection(
            uriTemplate: '/admin/users/{id}/sessions',
            controller: UserAdminController::class . '::getUserSessions',
        ),
        new Get(
            uriTemplate: '/admin/users/{id}',
            controller: UserAdminController::class . '::get',
        ),
        new Post(
            uriTemplate: '/admin/users',
            controller: UserAdminController::class . '::create',
        ),
        new Put(
            uriTemplate: '/admin/users/{id}',
            controller: UserAdminController::class . '::update',
        ),
        new Delete(
            uriTemplate: '/admin/users/{id}',
            controller: UserAdminController::class . '::delete',
        ),
        new GetCollection(
            uriTemplate: '/admin/users/students',
            controller: UserAdminController::class . '::listStudents',
        ),
        new GetCollection(
            uriTemplate: '/admin/users/{id}/formations',
            controller: UserAdminController::class . '::getUserFormations',
        ),
    ]
)]
class AdminUsers
{
    // Propriétés si nécessaire...
}