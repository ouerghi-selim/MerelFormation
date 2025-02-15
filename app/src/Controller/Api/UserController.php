<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/users')]
class UserController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    #[Route('', name: 'app_users_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $role = $request->query->get('role');

        $criteria = ['isActive' => true];
        if ($role) {
            $users = $this->userRepository->findByRole($role);
        } else {
            $users = $this->userRepository->findBy(
                $criteria,
                ['createdAt' => 'DESC'],
                $limit,
                ($page - 1) * $limit
            );
        }

        $totalUsers = $this->userRepository->count($criteria);

        return $this->json([
            'data' => $users,
            'total' => $totalUsers,
            'page' => $page,
            'limit' => $limit,
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/{id}', name: 'app_users_show', methods: ['GET'])]
    public function show(User $user): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN') && $user !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('', name: 'app_users_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $user = $this->serializer->deserialize(
            $request->getContent(),
            User::class,
            'json',
            ['groups' => ['user:write']]
        );

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        // Hash password if provided
        if ($plainPassword = $user->getPassword()) {
            $user->setPassword(
                $this->passwordHasher->hashPassword($user, $plainPassword)
            );
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => ['user:read']]);
    }

    #[Route('/{id}', name: 'app_users_update', methods: ['PUT'])]
    public function update(Request $request, User $user): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN') && $user !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $this->serializer->deserialize(
            $request->getContent(),
            User::class,
            'json',
            ['object_to_populate' => $user, 'groups' => ['user:write']]
        );

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        // Hash password if provided
        if ($plainPassword = $user->getPassword()) {
            $user->setPassword(
                $this->passwordHasher->hashPassword($user, $plainPassword)
            );
        }

        $this->entityManager->flush();

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/{id}', name: 'app_users_delete', methods: ['DELETE'])]
    public function delete(User $user): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $user->setIsActive(false);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/me', name: 'app_users_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        return $this->json($this->getUser(), Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/search', name: 'app_users_search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $criteria = [
            'email' => $request->query->get('email'),
            'name' => $request->query->get('name'),
            'role' => $request->query->get('role'),
            'active' => $request->query->getBoolean('active', true),
        ];

        $users = $this->userRepository->searchByCriteria(array_filter($criteria));

        return $this->json($users, Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }
}
