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
            uriTemplate: '/admin/users/deleted',
            controller: UserAdminController::class . '::getDeletedUsers',
        ),
        new GetCollection(
            uriTemplate: '/admin/users/{id}/sessions',
            controller: UserAdminController::class . '::getUserSessions',
        ),
        new Get(
            uriTemplate: '/admin/users/{id}',
            controller: UserAdminController::class . '::get',
            requirements: ['id' => '\d+']
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
        new GetCollection(
            uriTemplate: '/admin/users/{id}/documents',
            controller: UserAdminController::class . '::getUserDocuments',
        ),
        new Post(
            uriTemplate: '/admin/users/{id}/restore',
            controller: UserAdminController::class . '::restore',
        ),
        new Post(
            uriTemplate: '/admin/users/{id}/force-delete',
            controller: UserAdminController::class . '::forceDelete',
        ),
        new Get(
            uriTemplate: '/admin/users/{id}/company',
            controller: UserAdminController::class . '::getCompany',
        ),
        new Post(
            uriTemplate: '/admin/users/{id}/company',
            controller: UserAdminController::class . '::createCompany',
        ),
        new Put(
            uriTemplate: '/admin/users/{id}/company',
            controller: UserAdminController::class . '::updateCompany',
        ),
        new GetCollection(
            uriTemplate: '/admin/users/inscription-documents',
            controller: UserAdminController::class . '::getAllInscriptionDocuments',
        ),
    ]
)]
class AdminUsers
{
    // Propriétés si nécessaire...
}