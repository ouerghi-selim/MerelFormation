<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\Invoice;
use App\Repository\PaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PaymentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PaymentRepository $paymentRepository
    ) {
    }

    #[Route('/payment/process/{invoiceId}', name: 'payment_process', methods: ['POST'])]
    public function process(Invoice $invoice, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $payment = new Payment();
        $payment->setUser($this->getUser());
        $payment->setInvoice($invoice);
        $payment->setAmount($invoice->getAmount());
        $payment->setMethod($request->request->get('method', 'card'));
        $payment->setTransactionId(uniqid('TRANS_'));
        $payment->setStatus('pending');

        try {
            // Intégration avec le service de paiement (Stripe/PayPal)
            $stripeCharge = $this->stripeService->createCharge([
                'amount' => $payment->getAmount() * 100, // en centimes
                'currency' => 'eur',
                'source' => $request->request->get('stripeToken'),
                'description' => 'Paiement MerelFormation - ' . $invoice->getInvoiceNumber(),
            ]);

            $payment->setStatus('completed');
            $invoice->setStatus('paid');
            
            $this->entityManager->persist($payment);
            $this->entityManager->flush();

            return $this->redirectToRoute('payment_success', ['id' => $payment->getId()]);
        } catch (\Exception $e) {
            $payment->setStatus('failed');
            $this->entityManager->persist($payment);
            $this->entityManager->flush();

            return $this->redirectToRoute('payment_error', ['id' => $payment->getId()]);
        }
    }

    #[Route('/payment/success/{id}', name: 'payment_success', methods: ['GET'])]
    public function success(Payment $payment): Response
    {
        return $this->render('payment/success.html.twig', [
            'payment' => $payment,
        ]);
    }

    #[Route('/payment/error/{id}', name: 'payment_error', methods: ['GET'])]
    public function error(Payment $payment): Response
    {
        return $this->render('payment/error.html.twig', [
            'payment' => $payment,
        ]);
    }

    #[Route('/payment/refund/{id}', name: 'payment_refund', methods: ['POST'])]
    public function refund(Payment $payment): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        try {
            // Intégration avec le service de paiement pour le remboursement
            $refund = $this->stripeService->refundCharge($payment->getTransactionId());
            
            $payment->setStatus('refunded');
            $payment->getInvoice()->setStatus('refunded');
            
            $this->entityManager->flush();

            $this->addFlash('success', 'Remboursement effectué avec succès');
        } catch (\Exception $e) {
            $this->addFlash('error', 'Erreur lors du remboursement');
        }

        return $this->redirectToRoute('admin_payments');
    }

    #[Route('/admin/payments', name: 'admin_payments', methods: ['GET'])]
    public function adminList(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $criteria = [];
        if ($status = $request->query->get('status')) {
            $criteria['status'] = $status;
        }

        $payments = $this->paymentRepository->searchByCriteria($criteria);

        return $this->render('admin/payment/index.html.twig', [
            'payments' => $payments,
        ]);
    }

    #[Route('/user/payments', name: 'user_payments', methods: ['GET'])]
    public function userPayments(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $payments = $this->paymentRepository->findUserPayments($this->getUser()->getId());

        return $this->render('payment/user_payments.html.twig', [
            'payments' => $payments,
        ]);
    }
}