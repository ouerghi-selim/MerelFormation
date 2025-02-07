<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    #[Route('/admin/users', name: 'user_list', methods: ['GET'])]
    public function index(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $users = $this->userRepository->findAll();
        return $this->render('admin/user/index.html.twig', [
            'users' => $users,
        ]);
    }

    #[Route('/admin/users/new', name: 'user_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $user = new User();
            $user->setEmail($request->request->get('email'));
            $user->setFirstName($request->request->get('firstName'));
            $user->setLastName($request->request->get('lastName'));
            $user->setRoles($request->request->get('roles', ['ROLE_USER']));
            $user->setPassword(
                $this->passwordHasher->hashPassword(
                    $user,
                    $request->request->get('password')
                )
            );

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $this->redirectToRoute('user_list');
        }

        return $this->render('admin/user/new.html.twig');
    }

    #[Route('/admin/users/{id}', name: 'user_edit', methods: ['GET', 'POST'])]
    public function edit(User $user, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $user->setEmail($request->request->get('email'));
            $user->setFirstName($request->request->get('firstName'));
            $user->setLastName($request->request->get('lastName'));
            $user->setRoles($request->request->get('roles', ['ROLE_USER']));

            if ($password = $request->request->get('password')) {
                $user->setPassword(
                    $this->passwordHasher->hashPassword($user, $password)
                );
            }

            $this->entityManager->flush();
            return $this->redirectToRoute('user_list');
        }

        return $this->render('admin/user/edit.html.twig', [
            'user' => $user,
        ]);
    }

    #[Route('/admin/users/{id}/delete', name: 'user_delete', methods: ['POST'])]
    public function delete(User $user): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->redirectToRoute('user_list');
    }

    #[Route('/admin/users/{id}/toggle', name: 'user_toggle', methods: ['POST'])]
    public function toggleActive(User $user): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $user->setIsActive(!$user->isIsActive());
        $this->entityManager->flush();

        return $this->redirectToRoute('user_list');
    }
}