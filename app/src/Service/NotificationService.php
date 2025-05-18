<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Entity\Reservation;
use App\Entity\VehicleRental;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Psr\Log\LoggerInterface;

class NotificationService
{
    private $em;
    private $mailer;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        MailerInterface $mailer,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    /**
     * Notify admin about new session registration
     */
    public function notifyAdminAboutRegistration(Reservation $reservation): void
    {
        try {
            // Log start of notification process
            $this->logger->info('Début de notification pour la réservation #' . $reservation->getId());

            // Get all admin users
            $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');

            // Log number of admins found
            $this->logger->info('Admins trouvés: ' . count($admins));

            if (empty($admins)) {
                $this->logger->warning('Aucun administrateur trouvé pour envoyer la notification!');
                return;
            }

            $student = $reservation->getUser();
            $session = $reservation->getSession();
            $formation = $session->getFormation();

            $title = 'Nouvelle inscription à une formation';
            $content = sprintf(
                "L'utilisateur %s %s s'est inscrit à la formation \"%s\" (session du %s).",
                $student->getFirstName(),
                $student->getLastName(),
                $formation->getTitle(),
                $session->getStartDate()->format('d/m/Y')
            );

            foreach ($admins as $admin) {
                $this->logger->info('Envoi de notification à: ' . $admin->getEmail());

                // Create notification entity
                $notification = new Notification();
                $notification->setTitle($title);
                $notification->setContent($content);
                $notification->setType('info');
                $notification->setUser($admin);

                $this->em->persist($notification);

                // Send email
                try {
                    $this->sendEmailToAdmin(
                        $admin->getEmail(),
                        $title,
                        $content,
                        [
                            'reservationId' => $reservation->getId(),
                            'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                            'formationTitle' => $formation->getTitle(),
                            'sessionDate' => $session->getStartDate()->format('d/m/Y')
                        ]
                    );
                    $this->logger->info('Email envoyé avec succès à: ' . $admin->getEmail());
                } catch (\Exception $e) {
                    $this->logger->error('Erreur lors de l\'envoi d\'email: ' . $e->getMessage());
                }
            }

            $this->em->flush();
            $this->logger->info('Notifications enregistrées dans la base de données');

        } catch (\Exception $e) {
            $this->logger->error('Erreur dans notifyAdminAboutRegistration: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            // Re-throw if needed
            throw $e;
        }
    }

    /**
     * Send an email to an admin with optional context data
     */
    private function sendEmailToAdmin(string $adminEmail, string $subject, string $content, array $context = []): void
    {
        try {
            // You could create more advanced HTML templates here with the context data
            $emailBody = $content;

            if (!empty($context)) {
                $emailBody .= "\n\nInformations complémentaires:";
                foreach ($context as $key => $value) {
                    $emailBody .= "\n- " . ucfirst($key) . ": " . $value;
                }
            }

            $email = (new Email())
                ->from('no-reply@merelformation.com')
                ->to($adminEmail)
                ->subject($subject)
                ->text($emailBody);

            $this->logger->info('Tentative d\'envoi d\'email à: ' . $adminEmail);
            $this->mailer->send($email);
            $this->logger->info('Email envoyé avec succès');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de l\'envoi d\'email: ' . $e->getMessage());
            throw $e; // Re-throw pour le débogage
        }
    }

    // Autres méthodes...
}