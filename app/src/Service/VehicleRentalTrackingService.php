<?php

namespace App\Service;

use App\Entity\VehicleRental;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;

class VehicleRentalTrackingService
{
    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        private string $appUrl = 'http://193.108.53.178/' // À configurer selon l'environnement
    ) {}

    /**
     * Génère un token de suivi unique
     */
    public function generateTrackingToken(VehicleRental $rental): string
    {
        $data = sprintf(
            '%d_%s_%s_%s',
            $rental->getId() ?? 0,
            $rental->getUser()->getEmail(),
            $rental->getCreatedAt()?->format('YmdHis') ?? date('YmdHis'),
            uniqid()
        );
        
        return 'track_' . substr(md5($data), 0, 16) . '_' . time();
    }

    /**
     * Génère l'URL complète de suivi
     */
    public function generateTrackingUrl(string $trackingToken): string
    {
        return rtrim($this->appUrl, '/') . '/track/' . $trackingToken;
    }

    /**
     * Envoie l'email de confirmation avec le lien de suivi
     */
    public function sendTrackingEmail(VehicleRental $rental): bool
    {
        try {
            $trackingUrl = $this->generateTrackingUrl($rental->getTrackingToken());
            
            $email = (new TemplatedEmail())
                ->from('noreply@merelformation.com')
                ->to($rental->getUser()->getEmail())
                ->subject('Confirmation de votre réservation de véhicule - MerelFormation')
                ->htmlTemplate('emails/vehicle_rental_confirmation.html.twig')
                ->context([
                    'rental' => $rental,
                    'trackingUrl' => $trackingUrl,
                    'customerName' => $rental->getUser()->getFirstName().' '.$rental->getUser()->getLastName(),
                    'vehicleModel' => $rental->getVehicle()?->getModel(),
                    'startDate' => $rental->getStartDate(),
                    'endDate' => $rental->getEndDate(),
                    'totalPrice' => $rental->getTotalPrice(),
                    'examTime' => $rental->getExamTime()
                ]);

            $this->mailer->send($email);
            
            $this->logger->info('Tracking email sent successfully', [
                'rental_id' => $rental->getId(),
                'customer_email' => $rental->getUser()->getEmail(),
                'tracking_token' => $rental->getTrackingToken()
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send tracking email', [
                'rental_id' => $rental->getId(),
                'customer_email' => $rental->getUser()->getEmail(),
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Met à jour le statut et envoie une notification
     */
    public function updateStatusAndNotify(VehicleRental $rental, string $newStatus, ?string $adminNotes = null): bool
    {
        $oldStatus = $rental->getStatus();
        $rental->setStatus($newStatus);
        $rental->setUpdatedAt(new \DateTimeImmutable());
        
        if ($adminNotes) {
            $rental->setAdminNotes($adminNotes);
        }

        // Envoyer email de mise à jour si le statut change significativement
        if ($oldStatus !== $newStatus && in_array($newStatus, ['confirmed', 'cancelled'])) {
            return $this->sendStatusUpdateEmail($rental, $oldStatus, $newStatus);
        }

        return true;
    }

    /**
     * Envoie un email de mise à jour de statut
     */
    private function sendStatusUpdateEmail(VehicleRental $rental, string $oldStatus, string $newStatus): bool
    {
        try {
            $trackingUrl = $this->generateTrackingUrl($rental->getTrackingToken());
            
            $email = (new TemplatedEmail())
                ->from('noreply@merelformation.com')
                ->to($rental->getUser()->getEmail()())
                ->subject($this->getStatusEmailSubject($newStatus))
                ->htmlTemplate('emails/vehicle_rental_status_update.html.twig')
                ->context([
                    'rental' => $rental,
                    'trackingUrl' => $trackingUrl,
                    'oldStatus' => $oldStatus,
                    'newStatus' => $newStatus,
                    'statusText' => $this->getStatusText($newStatus),
                    'customerName' => $rental->getUser()->getFirstName().' '.$rental->getUser()->getLastName(),
                    'vehicleModel' => $rental->getVehicle()?->getModel()
                ]);

            $this->mailer->send($email);
            
            $this->logger->info('Status update email sent successfully', [
                'rental_id' => $rental->getId(),
                'customer_email' => $rental->getUser()->getEmail()(),
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send status update email', [
                'rental_id' => $rental->getId(),
                'customer_email' => $rental->getUser()->getEmail()(),
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    private function getStatusEmailSubject(string $status): string
    {
        return match($status) {
            'confirmed' => 'Votre réservation a été confirmée - MerelFormation',
            'cancelled' => 'Votre réservation a été annulée - MerelFormation',
            'completed' => 'Votre location est terminée - MerelFormation',
            default => 'Mise à jour de votre réservation - MerelFormation'
        };
    }

    private function getStatusText(string $status): string
    {
        return match($status) {
            'submitted' => 'Demande soumise',
            'confirmed' => 'Confirmée',
            'cancelled' => 'Annulée',
            'completed' => 'Terminée',
            default => $status
        };
    }
}