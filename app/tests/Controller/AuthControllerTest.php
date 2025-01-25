<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class AuthControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = self::getContainer()->get(EntityManagerInterface::class);

        // Clear test database
        $this->entityManager->createQuery('DELETE FROM App\\Entity\\User')->execute();
        $this->entityManager->createQuery('DELETE FROM App\\Entity\\RefreshToken')->execute();
    }

    public function testRegister(): void
    {
        $this->client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'test@example.com',
                'password' => 'password123',
                'firstName' => 'Test',
                'lastName' => 'User',
                'phone' => '0123456789'
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $response = json_decode($this->client->getResponse()->getContent(), true);
        
        $this->assertArrayHasKey('message', $response);
        $this->assertArrayHasKey('user', $response);
        $this->assertEquals('test@example.com', $response['user']['email']);
    }

    public function testRegisterWithInvalidData(): void
    {
        $this->client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'invalid-email',
                'password' => 'short',
                'firstName' => '',
                'lastName' => ''
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testLoginAndRefreshToken(): void
    {
        // 1. First create a user
        $email = 'refresh@example.com';
        $password = 'password123';
        $this->client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
                'firstName' => 'Refresh',
                'lastName' => 'Test'
            ])
        );

        // 2. Login to get tokens
        $this->client->request(
            'POST',
            '/api/login_check',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password
            ])
        );

        $this->assertResponseIsSuccessful();
        $loginResponse = json_decode($this->client->getResponse()->getContent(), true);
        
        $this->assertArrayHasKey('token', $loginResponse);
        $this->assertArrayHasKey('refresh_token', $loginResponse);

        // 3. Try to refresh the token
        $this->client->request(
            'POST',
            '/api/token/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'refresh_token' => $loginResponse['refresh_token']
            ])
        );

        $this->assertResponseIsSuccessful();
        $refreshResponse = json_decode($this->client->getResponse()->getContent(), true);
        
        $this->assertArrayHasKey('token', $refreshResponse);
        $this->assertArrayHasKey('refresh_token', $refreshResponse);
        $this->assertNotEquals($loginResponse['token'], $refreshResponse['token']);
    }

    public function testRefreshTokenWithInvalidToken(): void
    {
        $this->client->request(
            'POST',
            '/api/token/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'refresh_token' => 'invalid_refresh_token'
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testGetProfile(): void
    {
        // First create and login user
        $email = 'profile@example.com';
        $this->createAuthenticatedUser($email);

        // Then try to get profile
        $this->client->request('GET', '/api/profile');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($this->client->getResponse()->getContent(), true);
        
        $this->assertEquals($email, $response['email']);
    }

    public function testUpdateProfile(): void
    {
        // First create and login user
        $email = 'update@example.com';
        $this->createAuthenticatedUser($email);

        // Then try to update profile
        $this->client->request(
            'PUT',
            '/api/profile',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstName' => 'Updated',
                'lastName' => 'Name',
                'phone' => '9876543210'
            ])
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($this->client->getResponse()->getContent(), true);
        
        $this->assertEquals('Updated', $response['user']['firstName']);
        $this->assertEquals('Name', $response['user']['lastName']);
        $this->assertEquals('9876543210', $response['user']['phone']);
    }

    private function createAuthenticatedUser(string $email): void
    {
        // Create user
        $this->client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => 'password123',
                'firstName' => 'Test',
                'lastName' => 'User'
            ])
        );

        // Login
        $this->client->request(
            'POST',
            '/api/login_check',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => 'password123'
            ])
        );

        $response = json_decode($this->client->getResponse()->getContent(), true);
        $token = $response['token'];

        // Add token to client
        $this->client->setServerParameter('HTTP_AUTHORIZATION', sprintf('Bearer %s', $token));
    }
}
