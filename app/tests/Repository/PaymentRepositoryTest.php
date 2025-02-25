<?php

namespace App\Tests\Repository;

use App\Entity\Payment;
use App\Entity\User;
use App\Entity\Invoice;
use App\Repository\PaymentRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class PaymentRepositoryTest extends KernelTestCase
{
    private ?EntityManagerInterface $entityManager = null;
    private ?PaymentRepository $paymentRepository = null;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager();
        $this->paymentRepository = $this->entityManager->getRepository(Payment::class);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
        $this->paymentRepository = null;
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

    private function createTestInvoice(User $user): Invoice
    {
        $invoice = new Invoice();
        $invoice->setInvoiceNumber('INV-2024-000001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setStatus('pending')
            ->setDueDate(new \DateTimeImmutable('+30 days'));

        $this->entityManager->persist($invoice);
        return $invoice;
    }

    public function testFindUserPayments(): void
    {
        $user = $this->createTestUser();
        $invoice = $this->createTestInvoice($user);

        $payment = new Payment();
        $payment->setTransactionId('TXN-001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('card')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        $userPayments = $this->paymentRepository->findUserPayments($user->getId());

        $this->assertGreaterThanOrEqual(1, count($userPayments));
        $this->assertEquals($user->getId(), $userPayments[0]->getUser()->getId());
    }

    public function testFindByStatus(): void
    {
        $user = $this->createTestUser();
        $invoice = $this->createTestInvoice($user);

        $completedPayment = new Payment();
        $completedPayment->setTransactionId('TXN-001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('card')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $pendingPayment = new Payment();
        $pendingPayment->setTransactionId('TXN-002')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('transfer')
            ->setStatus('pending')
            ->setInvoice($invoice);

        $this->entityManager->persist($completedPayment);
        $this->entityManager->persist($pendingPayment);
        $this->entityManager->flush();

        $completedPayments = $this->paymentRepository->findByStatus('completed');
        $pendingPayments = $this->paymentRepository->findByStatus('pending');

        $this->assertGreaterThanOrEqual(1, count($completedPayments));
        $this->assertGreaterThanOrEqual(1, count($pendingPayments));
        $this->assertEquals('completed', $completedPayments[0]->getStatus());
        $this->assertEquals('pending', $pendingPayments[0]->getStatus());
    }

    public function testFindByDateRange(): void
    {
        $user = $this->createTestUser();
        $invoice = $this->createTestInvoice($user);

        $payment = new Payment();
        $payment->setTransactionId('TXN-001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('card')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        $startDate = new \DateTimeImmutable('-1 day');
        $endDate = new \DateTimeImmutable('+1 day');

        $payments = $this->paymentRepository->findByDateRange($startDate, $endDate);

        $this->assertGreaterThanOrEqual(1, count($payments));
    }

    public function testFindByMethod(): void
    {
        $user = $this->createTestUser();
        $invoice = $this->createTestInvoice($user);

        $cardPayment = new Payment();
        $cardPayment->setTransactionId('TXN-001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('card')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $transferPayment = new Payment();
        $transferPayment->setTransactionId('TXN-002')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('transfer')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $this->entityManager->persist($cardPayment);
        $this->entityManager->persist($transferPayment);
        $this->entityManager->flush();

        $cardPayments = $this->paymentRepository->findByMethod('card');
        $transferPayments = $this->paymentRepository->findByMethod('transfer');

        $this->assertGreaterThanOrEqual(1, count($cardPayments));
        $this->assertGreaterThanOrEqual(1, count($transferPayments));
        $this->assertEquals('card', $cardPayments[0]->getMethod());
        $this->assertEquals('transfer', $transferPayments[0]->getMethod());
    }

    public function testGetStatistics(): void
    {
        $user = $this->createTestUser();
        $invoice = $this->createTestInvoice($user);

        $payment = new Payment();
        $payment->setTransactionId('TXN-001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('card')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        $stats = $this->paymentRepository->getStatistics();

        $this->assertIsArray($stats);
        $this->assertArrayHasKey('totalAmount', $stats);
        $this->assertArrayHasKey('countByStatus', $stats);
        $this->assertArrayHasKey('countByMethod', $stats);
        $this->assertArrayHasKey('successRate', $stats);
    }

    public function testSearchByCriteria(): void
    {
        $user = $this->createTestUser();
        $invoice = $this->createTestInvoice($user);

        $payment = new Payment();
        $payment->setTransactionId('TXN-001')
            ->setUser($user)
            ->setAmount(100.0)
            ->setMethod('card')
            ->setStatus('completed')
            ->setInvoice($invoice);

        $this->entityManager->persist($payment);
        $this->entityManager->flush();

        // Test different search criteria
        $statusResults = $this->paymentRepository->searchByCriteria(['status' => 'completed']);
        $this->assertGreaterThanOrEqual(1, count($statusResults));

        $methodResults = $this->paymentRepository->searchByCriteria(['method' => 'card']);
        $this->assertGreaterThanOrEqual(1, count($methodResults));

        $amountResults = $this->paymentRepository->searchByCriteria([
            'minAmount' => 50.0,
            'maxAmount' => 150.0
        ]);
        $this->assertGreaterThanOrEqual(1, count($amountResults));
    }

    /**
     * @dataProvider invalidSearchCriteriaProvider
     */
    public function testSearchByCriteriaWithInvalidInput(array $criteria): void
    {
        $results = $this->paymentRepository->searchByCriteria($criteria);
        $this->assertIsArray($results);
    }

    public function invalidSearchCriteriaProvider(): array
    {
        return [
            [[]],
            [['invalid' => 'criteria']],
            [['status' => 'INVALID_STATUS']],
            [['method' => 'INVALID_METHOD']],
            [['minAmount' => 'invalid']],
        ];
    }
}