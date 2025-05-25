<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\ContentTextAdminController;

#[ApiResource(
    shortName: 'admin_content_text',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/content-texts',
            controller: ContentTextAdminController::class . '::index',
            name: 'get_content_texts'
        ),
        new Get(
            uriTemplate: '/admin/content-texts/{id}',
            controller: ContentTextAdminController::class . '::show',
            name: 'get_content_text'
        ),
        new Post(
            uriTemplate: '/admin/content-texts',
            controller: ContentTextAdminController::class . '::create',
            name: 'create_content_text'
        ),
        new Put(
            uriTemplate: '/admin/content-texts/{id}',
            controller: ContentTextAdminController::class . '::update',
            name: 'update_content_text'
        ),
        new Delete(
            uriTemplate: '/admin/content-texts/{id}',
            controller: ContentTextAdminController::class . '::delete',
            name: 'delete_content_text'
        ),
        new GetCollection(
            uriTemplate: '/admin/content-texts/sections',
            controller: ContentTextAdminController::class . '::getSections',
            name: 'get_content_text_sections'
        ),
        new GetCollection(
            uriTemplate: '/admin/content-texts/types',
            controller: ContentTextAdminController::class . '::getTypes',
            name: 'get_content_text_types'
        ),
        new GetCollection(
            uriTemplate: '/admin/content-texts/by-section/{section}',
            controller: ContentTextAdminController::class . '::getBySection',
            name: 'get_content_texts_by_section'
        )
    ]
)]
class ContentTextApiResource
{
    // Cette classe est utilisée uniquement pour configurer les routes de l'API
    // Les propriétés sont définies dans l'entité App\Entity\ContentText
}
