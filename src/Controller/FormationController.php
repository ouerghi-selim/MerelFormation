<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Repository\FormationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FormationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormationRepository $formationRepository,
    ) {
    }

    #[Route('/formations', name: 'formation_list', methods: ['GET'])]
    public function index(): Response
    {
        $formations = $this->formationRepository->findAll();

        return $this->render('formation/index.html.twig', [
            'formations' => $formations,
        ]);
    }

    #[Route('/formations/new', name: 'formation_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $formation = new Formation();
            $formation->setTitle($request->request->get('title'));
            $formation->setDescription($request->request->get('description'));
            $formation->setPrice($request->request->get('price'));
            $formation->setDuration($request->request->get('duration'));
            $formation->setType($request->request->get('type'));
            $formation->setPrerequisites($request->request->get('prerequisites'));

            $this->entityManager->persist($formation);
            $this->entityManager->flush();

            return $this->redirectToRoute('formation_list');
        }

        return $this->render('formation/new.html.twig');
    }

    #[Route('/formations/{id}', name: 'formation_edit', methods: ['GET', 'POST'])]
    public function edit(Formation $formation, Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $formation->setTitle($request->request->get('title'));
            $formation->setDescription($request->request->get('description'));
            $formation->setPrice($request->request->get('price'));
            $formation->setDuration($request->request->get('duration'));
            $formation->setType($request->request->get('type'));
            $formation->setPrerequisites($request->request->get('prerequisites'));

            $this->entityManager->flush();

            return $this->redirectToRoute('formation_list');
        }

        return $this->render('formation/edit.html.twig', [
            'formation' => $formation,
        ]);
    }

    #[Route('/formations/{id}/delete', name: 'formation_delete', methods: ['POST'])]
    public function delete(Formation $formation): Response
    {
        $this->entityManager->remove($formation);
        $this->entityManager->flush();

        return $this->redirectToRoute('formation_list');
    }

    #[Route('/formations/{id}/toggle', name: 'formation_toggle', methods: ['POST'])]
    public function toggleActive(Formation $formation): Response
    {
        $formation->setIsActive(!$formation->isIsActive());
        $this->entityManager->flush();

        return $this->redirectToRoute('formation_list');
    }
}