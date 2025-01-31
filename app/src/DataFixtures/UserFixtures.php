<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public const ADMIN_USER_REFERENCE = 'admin-user';
    public const STUDENT_USER_REFERENCE = 'student-user';
    public const FORMATEUR_USER_REFERENCE = 'formateur-user';

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Admin user
        $adminUser = new User();
        $adminUser->setEmail('admin@merelformation.fr');
        $adminUser->setFirstName('Admin');
        $adminUser->setLastName('Merel');
        $adminUser->setRoles(['ROLE_ADMIN']);
        $adminUser->setPhone('0123456789');
        $adminUser->setIsActive(true);
        $hashedPassword = $this->passwordHasher->hashPassword($adminUser, 'admin123');
        $adminUser->setPassword($hashedPassword);
        $manager->persist($adminUser);
        $this->addReference(self::ADMIN_USER_REFERENCE, $adminUser);

        // Formateur user
        $formateurUser = new User();
        $formateurUser->setEmail('formateur@merelformation.fr');
        $formateurUser->setFirstName('Jean');
        $formateurUser->setLastName('Formateur');
        $formateurUser->setRoles(['ROLE_FORMATEUR']);
        $formateurUser->setPhone('0123456790');
        $formateurUser->setIsActive(true);
        $hashedPassword = $this->passwordHasher->hashPassword($formateurUser, 'formateur123');
        $formateurUser->setPassword($hashedPassword);
        $manager->persist($formateurUser);
        $this->addReference(self::FORMATEUR_USER_REFERENCE, $formateurUser);

        // Create 5 student users
        for ($i = 1; $i <= 5; $i++) {
            $user = new User();
            $user->setEmail("student{$i}@example.com");
            $user->setFirstName("Student");
            $user->setLastName("Number {$i}");
            $user->setRoles(['ROLE_USER']);
            $user->setPhone("012345678{$i}");
            $user->setIsActive(true);
            $hashedPassword = $this->passwordHasher->hashPassword($user, 'student123');
            $user->setPassword($hashedPassword);
            $manager->persist($user);

            if ($i === 1) {
                $this->addReference(self::STUDENT_USER_REFERENCE, $user);
            }
        }

        $manager->flush();
    }
}