<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Controller\Admin\TestimonialAdminController;

#[ApiResource(
    shortName: 'admin_testimonial',
    operations: [
        // Routes spécifiques AVANT les routes génériques avec {id}
        new GetCollection(
            uriTemplate: '/admin/testimonials/featured',
            controller: TestimonialAdminController::class . '::getFeatured',
            name: 'get_featured_testimonials'
        ),
        new GetCollection(
            uriTemplate: '/admin/testimonials/formations',
            controller: TestimonialAdminController::class . '::getFormations',
            name: 'get_testimonial_formations'
        ),
        // Routes génériques
        new GetCollection(
            uriTemplate: '/admin/testimonials',
            controller: TestimonialAdminController::class . '::index',
            name: 'get_testimonials'
        ),
        new Get(
            uriTemplate: '/admin/testimonials/{id}',
            controller: TestimonialAdminController::class . '::show',
            name: 'get_testimonial'
        ),
        new Post(
            uriTemplate: '/admin/testimonials',
            controller: TestimonialAdminController::class . '::create',
            name: 'create_testimonial'
        ),
        new Put(
            uriTemplate: '/admin/testimonials/{id}',
            controller: TestimonialAdminController::class . '::update',
            name: 'update_testimonial'
        ),
        new Delete(
            uriTemplate: '/admin/testimonials/{id}',
            controller: TestimonialAdminController::class . '::delete',
            name: 'delete_testimonial'
        ),
        new Patch(
            uriTemplate: '/admin/testimonials/{id}/toggle-featured',
            controller: TestimonialAdminController::class . '::toggleFeatured',
            name: 'toggle_testimonial_featured'
        ),
        new Patch(
            uriTemplate: '/admin/testimonials/{id}/toggle-active',
            controller: TestimonialAdminController::class . '::toggleActive',
            name: 'toggle_testimonial_active'
        )
    ]
)]
class TestimonialApiResource
{
    // Cette classe est utilisée uniquement pour configurer les routes de l'API
    // Les propriétés sont définies dans l'entité App\Entity\Testimonial
}
