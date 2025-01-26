<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $requiredFields = ['email', 'password', 'firstName', 'lastName'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return new JsonResponse(['error' => sprintf('%s is required', $field)], Response::HTTP_BAD_REQUEST);
            }
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword(
            $passwordHasher->hashPassword(
                $user,
                $data['password']
            )
        );
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        // Validation
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = [
                    'property' => $error->getPropertyPath(),
                    'message' => $error->getMessage(),
                ];
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();

            return new JsonResponse(
                [
                    'message' => 'User registered successfully',
                    'user' => [
                        'id' => $user->getId(),
                        'email' => $user->getEmail(),
                        'firstName' => $user->getFirstName(),
                        'lastName' => $user->getLastName(),
                    ]
                ],
                Response::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'An error occurred while registering the user'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'phone' => $user->getPhone(),
            'roles' => $user->getRoles(),
            'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/profile', name: 'profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = [
                    'property' => $error->getPropertyPath(),
                    'message' => $error->getMessage(),
                ];
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->flush();

            return new JsonResponse([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'phone' => $user->getPhone(),
                ]
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'An error occurred while updating the profile'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/profile/change-password', name: 'change_password', methods: ['POST'])]
    public function changePassword(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
            return new JsonResponse(
                ['error' => 'Current password and new password are required'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!$passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return new JsonResponse(
                ['error' => 'Current password is invalid'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $user->setPassword($passwordHasher->hashPassword($user, $data['newPassword']));

        try {
            $entityManager->flush();
            return new JsonResponse(['message' => 'Password updated successfully']);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'An error occurred while updating the password'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
