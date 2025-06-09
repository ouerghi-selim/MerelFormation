<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Controller\Api\ContactController;

#[ApiResource(
    shortName: 'contact',
    operations: [
        new Post(
            uriTemplate: '/contact',
            controller: ContactController::class . '::submitContact',
            deserialize: false,
        ),
    ]
)]
class Contact
{
    // Cette classe est vide car elle sert uniquement à définir les routes API
}