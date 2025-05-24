<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Controller\Admin\FAQAdminController;

#[ApiResource(
    shortName: 'admin_faq',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/faq',
            controller: FAQAdminController::class . '::index',
            name: 'get_faqs'
        ),
        new Get(
            uriTemplate: '/admin/faq/{id}',
            controller: FAQAdminController::class . '::show',
            name: 'get_faq'
        ),
        new Post(
            uriTemplate: '/admin/faq',
            controller: FAQAdminController::class . '::create',
            name: 'create_faq'
        ),
        new Put(
            uriTemplate: '/admin/faq/{id}',
            controller: FAQAdminController::class . '::update',
            name: 'update_faq'
        ),
        new Delete(
            uriTemplate: '/admin/faq/{id}',
            controller: FAQAdminController::class . '::delete',
            name: 'delete_faq'
        ),
        new Patch(
            uriTemplate: '/admin/faq/{id}/toggle-featured',
            controller: FAQAdminController::class . '::toggleFeatured',
            name: 'toggle_faq_featured'
        ),
        new Patch(
            uriTemplate: '/admin/faq/{id}/toggle-active',
            controller: FAQAdminController::class . '::toggleActive',
            name: 'toggle_faq_active'
        ),
        new Put(
            uriTemplate: '/admin/faq/reorder',
            controller: FAQAdminController::class . '::reorder',
            name: 'reorder_faqs'
        ),
        new GetCollection(
            uriTemplate: '/admin/faq/categories',
            controller: FAQAdminController::class . '::getCategories',
            name: 'get_faq_categories'
        ),
        new GetCollection(
            uriTemplate: '/admin/faq/featured',
            controller: FAQAdminController::class . '::getFeatured',
            name: 'get_featured_faqs'
        ),
        new GetCollection(
            uriTemplate: '/admin/faq/by-category/{category}',
            controller: FAQAdminController::class . '::getByCategory',
            name: 'get_faqs_by_category'
        )
    ]
)]
class FAQApiResource
{
    // Cette classe est utilisée uniquement pour configurer les routes de l'API
    // Les propriétés sont définies dans l'entité App\Entity\FAQ
}
