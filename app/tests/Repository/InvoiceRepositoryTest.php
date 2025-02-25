<?php

namespace App\Tests\Repository;

use App\Entity\Invoice;
use App\Entity\User;
use App\Entity\Payment;
use App\Repository\InvoiceRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class InvoiceRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?InvoiceRepository $invoiceRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->invoiceRepository = $this->entityManager->getRepository(Invoice::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->invoiceRepository = null;
    }

    private function createTestUser(): User
    {
        $user = new User();
        $user->setEmail('test@example.com')
            ->setFirstName('Test')
            ->setLastName('User')
            ->setPassword('password')
            ->setIsActive(true);
        
        $this->entityManager->persist($user);
        return $user;
    }

    private function createTestPayment(User $user, float $amount): Payment
    {
        $payment = new Payment();
        $payment->setTransactionId('TXN-' . uniqid())
            ->setUser($user)
            ->setAmount($amount)
            ->setMethod('card')
            ->setStatus('completed');

        $this->entityManager->persist($payment);
        return $payment;
    }

    public function testFindUserInvoices(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $invoice = new Invoice();
        $invoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($invoice);
        $this->entityManager->flush();

        $userInvoices = $this->invoiceRepository->findUserInvoices($user->getId());

        $this->assertGreaterThanOrEqual(1, count($userInvoices));
        $this->assertEquals($user->getId(), $userInvoices[0]->getUser()->getId());
    }

    public function testFindOverdueInvoices(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $overdueInvoice = new Invoice();
        $overdueInvoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('-1 day'))
            ->setPayment($payment);

        $currentInvoice = new Invoice();
        $currentInvoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($overdueInvoice);
        $this->entityManager->persist($currentInvoice);
        $this->entityManager->flush();

        $overdueInvoices = $this->invoiceRepository->findOverdueInvoices();

        $this->assertGreaterThanOrEqual(1, count($overdueInvoices));
        foreach ($overdueInvoices as $invoice) {
            $this->assertTrue($invoice->getDueDate() < new \DateTimeImmutable());
            $this->assertEquals('pending', $invoice->getStatus());
        }
    }

    public function testFindByDateRange(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $invoice = new Invoice();
        $invoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($invoice);
        $this->entityManager->flush();

        $startDate = new \DateTimeImmutable('-1 day');
        $endDate = new \DateTimeImmutable('+1 day');

        $invoices = $this->invoiceRepository->findByDateRange($startDate, $endDate);

        $this->assertGreaterThanOrEqual(1, count($invoices));
    }

    public function testFindUnpaidInvoices(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $unpaidInvoice = new Invoice();
        $unpaidInvoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $paidInvoice = new Invoice();
        $paidInvoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('paid')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($unpaidInvoice);
        $this->entityManager->persist($paidInvoice);
        $this->entityManager->flush();

        $unpaidInvoices = $this->invoiceRepository->findUnpaidInvoices();

        $this->assertGreaterThanOrEqual(1, count($unpaidInvoices));
        foreach ($unpaidInvoices as $invoice) {
            $this->assertEquals('pending', $invoice->getStatus());
        }
    }

    public function testGetStatistics(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $invoice = new Invoice();
        $invoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($invoice);
        $this->entityManager->flush();

        $stats = $this->invoiceRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalAmount', $stats);
        $this->assertArrayHasKey('countByStatus', $stats);
        $this->assertArrayHasKey('overdueAmount', $stats);
        $this->assertArrayHasKey('paymentRate', $stats);
    }

    public function testSearchByCriteria(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $invoice = new Invoice();
        $invoice->setInvoiceNumber('INV-2024-SEARCH')
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($invoice);
        $this->entityManager->flush();

        // Test different search criteria
        $statusResults = $this->invoiceRepository->searchByCriteria(['status' => 'pending']);
        $this->assertGreaterThanOrEqual(1, count($statusResults));

        $invoiceNumberResults = $this->invoiceRepository->searchByCriteria(['invoiceNumber' => 'SEARCH']);
        $this->assertGreaterThanOrEqual(1, count($invoiceNumberResults));

        $amountResults = $this->invoiceRepository->searchByCriteria([
            'minAmount' => 50.0,
            'maxAmount' => 150.0
        ]);
        $this->assertGreaterThanOrEqual(1, count($amountResults));
    }

    public function testGetMonthlyInvoiceSummary(): void
    {
        $user = $this->createTestUser();
        $payment = $this->createTestPayment($user, 100.0);

        $invoice = new Invoice();
        $invoice->setInvoiceNumber('INV-2024-' . uniqid())
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'))
            ->setPayment($payment);

        $this->entityManager->persist($invoice);
        $this->entityManager->flush();

        $year = (int) date('Y');
        $summary = $this->invoiceRepository->getMonthlyInvoiceSummary($year);

        $this->assertIsArray($summary);
        $this->assertGreaterThanOrEqual(1, count($summary));
        foreach ($summary as $monthData) {
            $this->assertArrayHasKey('month', $monthData);
            $this->assertArrayHasKey('count', $monthData);
            $this->assertArrayHasKey('total', $monthData);
            $this->assertArrayHasKey('paid', $monthData);
            $this->assertArrayHasKey('pending', $monthData);
        }
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->invoiceRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['status' => 'INVALID_STATUS']],
            [['invoiceNumber' => '']],
            [['minAmount' => 'invalid']],
        ];
    }
}