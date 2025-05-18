<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\EmailTemplateController;

#[ApiResource(
    shortName: 'admin_email_template',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/email-templates',
            controller: EmailTemplateController::class . '::list',
            name: 'get_email_templates'
        ),
        new Get(
            uriTemplate: '/admin/email-templates/{id}',
            controller: EmailTemplateController::class . '::show',
            name: 'get_email_template'
        ),
        new Post(
            uriTemplate: '/admin/email-templates',
            controller: EmailTemplateController::class . '::create',
            name: 'create_email_template'
        ),
        new Put(
            uriTemplate: '/admin/email-templates/{id}',
            controller: EmailTemplateController::class . '::update',
            name: 'update_email_template'
        ),
        new Delete(
            uriTemplate: '/admin/email-templates/{id}',
            controller: EmailTemplateController::class . '::delete',
            name: 'delete_email_template'
        ),
        new Post(
            uriTemplate: '/admin/email-templates/{id}/duplicate',
            controller: EmailTemplateController::class . '::duplicate',
            name: 'duplicate_email_template'
        ),
        new Post(
            uriTemplate: '/admin/email-templates/{id}/preview',
            controller: EmailTemplateController::class . '::preview',
            name: 'preview_email_template'
        )
    ]
)]
class EmailTemplate
{
    // Cette classe est utilisée uniquement pour configurer les routes de l'API
    // Les propriétés sont définies dans l'entité App\Entity\EmailTemplate
}