<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Controller\Admin\CompanyAdminController;

#[ApiResource(
    shortName: 'admin_companies',
    operations: [
        new GetCollection(
            uriTemplate: '/admin/companies',
            controller: CompanyAdminController::class . '::index',
        ),
        new Get(
            uriTemplate: '/admin/companies/{id}',
            controller: CompanyAdminController::class . '::get',
            requirements: ['id' => '\d+']
        ),
        new Post(
            uriTemplate: '/admin/companies',
            controller: CompanyAdminController::class . '::create',
        ),
        new Put(
            uriTemplate: '/admin/companies/{id}',
            controller: CompanyAdminController::class . '::update',
            requirements: ['id' => '\d+']
        ),
        new Delete(
            uriTemplate: '/admin/companies/{id}',
            controller: CompanyAdminController::class . '::delete',
            requirements: ['id' => '\d+']
        ),
    ]
)]
class AdminCompanies
{
}