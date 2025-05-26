<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\SessionAdminController;

#[ApiResource(
    shortName: 'admin_sessions',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/sessions',
            controller: SessionAdminController::class . '::list',
        ),
        new Get(
            uriTemplate: '/admin/sessions/{id}',
            controller: SessionAdminController::class . '::get',
        ),
        new Post(
            uriTemplate: '/admin/sessions',
            controller: SessionAdminController::class . '::create',
        ),
        new Put(
            uriTemplate: '/admin/sessions/{id}',
            controller: SessionAdminController::class . '::update',
        ),
        new Delete(
            uriTemplate: '/admin/sessions/{id}',
            controller: SessionAdminController::class . '::delete',
        ),
        new GetCollection(
            uriTemplate: '/admin/sessions/stats',
            controller: SessionAdminController::class . '::getStats',
        ),
        new GetCollection(
            uriTemplate: '/admin/sessions/{id}/participants',
            controller: SessionAdminController::class . '::getParticipants',
        ),
        new Post(
            uriTemplate: '/admin/sessions/{id}/add-participant',
            controller: SessionAdminController::class . '::addParticipant',
        ),
        new Post(
            uriTemplate: '/admin/sessions/{id}/documents',
            controller: SessionAdminController::class . '::uploadDocument',
        ),
        new Delete(
            uriTemplate: '/admin/sessions/{id}/remove-participant/{userId}',
            controller: SessionAdminController::class . '::removeParticipant',
        ),
    ]
)]
class AdminSessions
{
    // Cette classe est vide car elle sert uniquement à définir les routes API
}