<?php

namespace App\Tests\Repository;

use App\Entity\EmailTemplate;
use App\Repository\EmailTemplateRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class EmailTemplateRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?EmailTemplateRepository $emailTemplateRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->emailTemplateRepository = $this->entityManager->getRepository(EmailTemplate::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->emailTemplateRepository = null;
    }

    public function testFindByType(): void
    {
        $welcomeTemplate = new EmailTemplate();
        $welcomeTemplate->setName('Welcome Email')
            ->setSubject('Welcome to MerelFormation')
            ->setContent('Welcome content')
            ->setType('welcome')
            ->setVariables(['user_name']);

        $reminderTemplate = new EmailTemplate();
        $reminderTemplate->setName('Reminder Email')
            ->setSubject('Session Reminder')
            ->setContent('Reminder content')
            ->setType('reminder')
            ->setVariables(['session_date', 'formation_name']);

        $this->entityManager->persist($welcomeTemplate);
        $this->entityManager->persist($reminderTemplate);
        $this->entityManager->flush();

        $welcomeTemplates = $this->emailTemplateRepository->findByType('welcome');
        $reminderTemplates = $this->emailTemplateRepository->findByType('reminder');

        $this->assertGreaterThanOrEqual(1, count($welcomeTemplates));
        $this->assertGreaterThanOrEqual(1, count($reminderTemplates));
        $this->assertEquals('welcome', $welcomeTemplates[0]->getType());
        $this->assertEquals('reminder', $reminderTemplates[0]->getType());
    }

    public function testFindByName(): void
    {
        $template = new EmailTemplate();
        $template->setName('Unique Template Name')
            ->setSubject('Test Subject')
            ->setContent('Test content')
            ->setType('test')
            ->setVariables([]);

        $this->entityManager->persist($template);
        $this->entityManager->flush();

        $foundTemplate = $this->emailTemplateRepository->findByName('Unique Template Name');

        $this->assertNotNull($foundTemplate);
        $this->assertEquals('Unique Template Name', $foundTemplate->getName());
    }

    public function testFindByVariable(): void
    {
        $template1 = new EmailTemplate();
        $template1->setName('Template with user_name')
            ->setSubject('Test Subject')
            ->setContent('Test content')
            ->setType('test')
            ->setVariables(['user_name', 'date']);

        $template2 = new EmailTemplate();
        $template2->setName('Template without user_name')
            ->setSubject('Test Subject')
            ->setContent('Test content')
            ->setType('test')
            ->setVariables(['date']);

        $this->entityManager->persist($template1);
        $this->entityManager->persist($template2);
        $this->entityManager->flush();

        $templatesWithUserName = $this->emailTemplateRepository->findByVariable('user_name');

        $this->assertGreaterThanOrEqual(1, count($templatesWithUserName));
        foreach ($templatesWithUserName as $template) {
            $this->assertContains('user_name', $template->getVariables());
        }
    }

    public function testSearchTemplates(): void
    {
        $template = new EmailTemplate();
        $template->setName('Searchable Template')
            ->setSubject('Searchable Subject')
            ->setContent('Searchable content')
            ->setType('test')
            ->setVariables([]);

        $this->entityManager->persist($template);
        $this->entityManager->flush();

        $nameResults = $this->emailTemplateRepository->searchTemplates('Searchable Template');
        $subjectResults = $this->emailTemplateRepository->searchTemplates('Searchable Subject');
        $contentResults = $this->emailTemplateRepository->searchTemplates('Searchable content');

        $this->assertGreaterThanOrEqual(1, count($nameResults));
        $this->assertGreaterThanOrEqual(1, count($subjectResults));
        $this->assertGreaterThanOrEqual(1, count($contentResults));
    }

    public function testGetTemplatesByUsage(): void
    {
        $welcomeTemplate = new EmailTemplate();
        $welcomeTemplate->setName('Welcome Template')
            ->setSubject('Welcome')
            ->setContent('Welcome content')
            ->setType('welcome')
            ->setVariables([]);

        $reminderTemplate = new EmailTemplate();
        $reminderTemplate->setName('Reminder Template')
            ->setSubject('Reminder')
            ->setContent('Reminder content')
            ->setType('reminder')
            ->setVariables([]);

        $this->entityManager->persist($welcomeTemplate);
        $this->entityManager->persist($reminderTemplate);
        $this->entityManager->flush();

        $usage = $this->emailTemplateRepository->getTemplatesByUsage(['welcome', 'reminder']);

        $this->assertIsArray($usage);
        $this->assertGreaterThanOrEqual(2, count($usage));
        foreach ($usage as $typeUsage) {
            $this->assertArrayHasKey('type', $typeUsage);
            $this->assertArrayHasKey('count', $typeUsage);
        }
    }

    public function testGetStatistics(): void
    {
        $template = new EmailTemplate();
        $template->setName('Statistics Template')
            ->setSubject('Test Subject')
            ->setContent('Test content')
            ->setType('test')
            ->setVariables(['var1', 'var2']);

        $this->entityManager->persist($template);
        $this->entityManager->flush();

        $stats = $this->emailTemplateRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalTemplates', $stats);
        $this->assertArrayHasKey('templatesByType', $stats);
        $this->assertArrayHasKey('averageVariablesPerTemplate', $stats);
    }

    public function testSearchByCriteria(): void
    {
        $template = new EmailTemplate();
        $template->setName('Criteria Template')
            ->setSubject('Criteria Subject')
            ->setContent('Criteria content')
            ->setType('test')
            ->setVariables(['test_var']);

        $this->entityManager->persist($template);
        $this->entityManager->flush();

        // Test different search criteria
        $nameResults = $this->emailTemplateRepository->searchByCriteria(['name' => 'Criteria']);
        $this->assertGreaterThanOrEqual(1, count($nameResults));

        $typeResults = $this->emailTemplateRepository->searchByCriteria(['type' => 'test']);
        $this->assertGreaterThanOrEqual(1, count($typeResults));

        $variableResults = $this->emailTemplateRepository->searchByCriteria(['variable' => 'test_var']);
        $this->assertGreaterThanOrEqual(1, count($variableResults));
    }

    public function testCloneTemplate(): void
    {
        $originalTemplate = new EmailTemplate();
        $originalTemplate->setName('Original Template')
            ->setSubject('Original Subject')
            ->setContent('Original content')
            ->setType('test')
            ->setVariables(['var1']);

        $this->entityManager->persist($originalTemplate);
        $this->entityManager->flush();

        $clonedTemplate = $this->emailTemplateRepository->cloneTemplate($originalTemplate, 'Cloned Template');

        $this->assertNotNull($clonedTemplate);
        $this->assertEquals('Cloned Template', $clonedTemplate->getName());
        $this->assertEquals($originalTemplate->getSubject(), $clonedTemplate->getSubject());
        $this->assertEquals($originalTemplate->getContent(), $clonedTemplate->getContent());
        $this->assertEquals($originalTemplate->getType(), $clonedTemplate->getType());
        $this->assertEquals($originalTemplate->getVariables(), $clonedTemplate->getVariables());
    }
}