<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\Api\ImageServeController;

#[ApiResource(
    shortName: 'image_serve',
    operations: [
        new Get(
            uriTemplate: '/uploads/{type}/{filename}',
            requirements: [
                'type' => 'cms|images|documents|formations|sessions|licenses|user-documents',
                'filename' => '[^/]+'
            ],
            controller: ImageServeController::class . '::serveImage',
            description: 'Serve uploaded files (images, documents, etc.) with proper security and caching headers',
            deserialize: false
        ),
        new Get(
            uriTemplate: '/uploads/cms/{filename}',
            requirements: ['filename' => '[^/]+'],
            controller: ImageServeController::class . '::serveCmsImage',
            description: 'Serve CMS images with optimized caching',
            deserialize: false
        ),
        new Get(
            uriTemplate: '/uploads/images/{filename}',
            requirements: ['filename' => '[^/]+'],
            controller: ImageServeController::class . '::serveGeneralImage',
            description: 'Serve general images with optimized caching',
            deserialize: false
        ),
        new Get(
            uriTemplate: '/uploads/documents/{filename}',
            requirements: ['filename' => '[^/]+'],
            controller: ImageServeController::class . '::serveDocument',
            description: 'Serve documents with proper security validation',
            deserialize: false
        ),
    ]
)]
class ImageServeResource
{
    // Cette classe sert uniquement à définir les routes API pour le service d'images
    // Le contrôleur ImageServeController gère la logique métier
}