<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Controller\Student\SessionStudentController;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    shortName: 'session_registration',
    operations: [
        new Post(
            uriTemplate: '/registration',
            controller: SessionStudentController::class . '::register',
            status: 201
        ),
    ]
)]
class SessionRegistration
{
    #[Assert\NotBlank]
    public string $name;

    #[Assert\NotBlank]
    #[Assert\Email]
    public string $email;

    #[Assert\NotBlank]
    public ?int $sessionId = null;
}