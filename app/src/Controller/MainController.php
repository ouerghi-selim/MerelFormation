<?php
// src/Controller/MainController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MainController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_home', defaults: ['reactRouting' => null], requirements: ['reactRouting' => '^(?!api|admin|_wdt|_profiler).+'])]
    public function index(): Response
    {
        return $this->render('base.html.twig');
    }
}