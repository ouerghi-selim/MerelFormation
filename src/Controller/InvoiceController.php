<?php

namespace App\Controller;

use App\Entity\Invoice;
use App\Repository\InvoiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Knp\Bundle\SnappyBundle\Snappy\Response\PdfResponse;
use Knp\Snappy\Pdf;

class InvoiceController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private InvoiceRepository $invoiceRepository,
        private Pdf $knpSnappyPdf
    ) {
    }

    #[Route('/admin/invoices', name: 'admin_invoices', methods: ['GET'])]
    public function adminList(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $status = $request->query->get('status');
        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        $criteria = [];
        if ($status) {
            $criteria['status'] = $status;
        }
        if ($startDate && $endDate) {
            $criteria['dateRange'] = [
                'start' => new \DateTimeImmutable($startDate),
                'end' => new \DateTimeImmutable($endDate)
            ];
        }

        $invoices = $this->invoiceRepository->searchByCriteria($criteria);

        return $this->render('admin/invoice/index.html.twig', [
            'invoices' => $invoices,
        ]);
    }

    #[Route('/user/invoices', name: 'user_invoices', methods: ['GET'])]
    public function userInvoices(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $invoices = $this->invoiceRepository->findUserInvoices($this->getUser()->getId());

        return $this->render('invoice/user_invoices.html.twig', [
            'invoices' => $invoices,
        ]);
    }

    #[Route('/invoice/{id}/download', name: 'invoice_download', methods: ['GET'])]
    public function download(Invoice $invoice): PdfResponse
    {
        if (!$this->isGranted('ROLE_ADMIN') && $invoice->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $html = $this->renderView('invoice/pdf.html.twig', [
            'invoice' => $invoice,
        ]);

        return new PdfResponse(
            $this->knpSnappyPdf->getOutputFromHtml($html),
            'facture-' . $invoice->getInvoiceNumber() . '.pdf'
        );
    }

    #[Route('/invoice/{id}/send', name: 'invoice_send', methods: ['POST'])]
    public function send(Invoice $invoice): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        try {
            // Génération du PDF
            $html = $this->renderView('invoice/pdf.html.twig', [
                'invoice' => $invoice,
            ]);
            $pdf = $this->knpSnappyPdf->getOutputFromHtml($html);

            // Envoi par email
            $email = (new TemplatedEmail())
                ->from('facturation@merelformation.fr')
                ->to($invoice->getUser()->getEmail())
                ->subject('Votre facture ' . $invoice->getInvoiceNumber())
                ->htmlTemplate('emails/invoice.html.twig')
                ->context([
                    'invoice' => $invoice,
                ])
                ->attach($pdf, 'facture-' . $invoice->getInvoiceNumber() . '.pdf', 'application/pdf');

            $this->mailer->send($email);

            $this->addFlash('success', 'Facture envoyée avec succès');
        } catch (\Exception $e) {
            $this->addFlash('error', 'Erreur lors de l\'envoi de la facture');
        }

        return $this->redirectToRoute('admin_invoices');
    }

    #[Route('/invoice/{id}/cancel', name: 'invoice_cancel', methods: ['POST'])]
    public function cancel(Invoice $invoice): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($invoice->getStatus() === 'paid') {
            $this->addFlash('error', 'Impossible d\'annuler une facture déjà payée');
            return $this->redirectToRoute('admin_invoices');
        }

        $invoice->setStatus('cancelled');
        $this->entityManager->flush();

        $this->addFlash('success', 'Facture annulée avec succès');
        return $this->redirectToRoute('admin_invoices');
    }

    #[Route('/invoice/summary', name: 'invoice_summary', methods: ['GET'])]
    public function summary(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $startDate = new \DateTimeImmutable($request->query->get('startDate', 'first day of this month'));
        $endDate = new \DateTimeImmutable($request->query->get('endDate', 'last day of this month'));

        $statistics = $this->invoiceRepository->getStatistics($startDate, $endDate);

        return $this->render('admin/invoice/summary.html.twig', [
            'statistics' => $statistics,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}