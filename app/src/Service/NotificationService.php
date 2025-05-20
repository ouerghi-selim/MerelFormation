<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Entity\Reservation;
use App\Entity\VehicleRental;
use App\Enum\NotificationEventType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Psr\Log\LoggerInterface;

class NotificationService
{
    private $em;
    private $logger;
    private $emailService;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        EmailService $emailService
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->emailService = $emailService;
    }


    /**
     * Détermine le type d'événement en fonction de l'entité
     */
    private function resolveEventType(object $entity): string
    {
        if ($entity instanceof Reservation) {
            return NotificationEventType::REGISTRATION_CONFIRMATION;
        } elseif ($entity instanceof VehicleRental) {
            return NotificationEventType::VEHICLE_RENTAL;
        }

        // Par défaut ou throw exception
        throw new \InvalidArgumentException('Type d\'entité non pris en charge pour la notification');
    }

    /**
     * Envoie une notification en déterminant automatiquement le type d'événement et le rôle
     */
    private function sendNotification(User $recipient, object $entity, array $variables): void
    {
        $eventType = $this->resolveEventType($entity);
        $role = $this->getHighestRole($recipient);

        try {
            $this->emailService->sendTemplatedEmailByEventAndRole(
                $recipient->getEmail(),
                $eventType,
                $role,
                $variables
            );
            $this->logger->info("Email de type {$eventType} envoyé à {$recipient->getEmail()} (rôle: {$role})");
        } catch (\Exception $e) {
            $this->logger->error("Erreur lors de l'envoi d'email: " . $e->getMessage());

            // Fallback si nécessaire
        }
    }

    /**
     * Récupère le rôle le plus élevé d'un utilisateur
     */
    private function getHighestRole(User $user): string
    {
        $roles = $user->getRoles();

        // Priorité des rôles: ADMIN > INSTRUCTOR > STUDENT
        if (in_array('ROLE_ADMIN', $roles)) {
            return 'ROLE_ADMIN';
        } elseif (in_array('ROLE_INSTRUCTOR', $roles)) {
            return 'ROLE_INSTRUCTOR';
        } elseif (in_array('ROLE_STUDENT', $roles)) {
            return 'ROLE_STUDENT';
        }

        return 'ROLE_USER'; // Rôle par défaut
    }
    /**
     * Notify about new session registration to all relevant parties
     */
    public function notifyAboutRegistration(Reservation $reservation): void
    {
        // Obtenir les données communes
        $student = $reservation->getUser();
        $session = $reservation->getSession();
        $formation = $session->getFormation();
        $formationTitle = $formation->getTitle();
        $sessionDate = $session->getStartDate()->format('d/m/Y');
        $reservationId = $reservation->getId();

        // 1. Notifier l'étudiant
        $studentVariables = [
            'studentName' => $student->getFirstName(),
            'formationTitle' => $formationTitle,
            'sessionDate' => $sessionDate,
            'location' => $session->getLocation() ?? 'À confirmer',
            'price' => $formation->getPrice() . ' €',
            // Variables spécifiques à l'étudiant...
        ];

        try {
            $this->emailService->sendTemplatedEmailByEventAndRole(
                $student->getEmail(),
                'registration_confirmation', // Type d'événement
                'ROLE_STUDENT', // Rôle cible
                $studentVariables
            );
            $this->logger->info('Email de confirmation envoyé à l\'étudiant: ' . $student->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de l\'envoi du mail à l\'étudiant: ' . $e->getMessage());
        }

        // 2. Notifier les admins
        $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');

        foreach ($admins as $admin) {
            // Créer une notification dans la base de données
            $notification = new Notification();
            $notification->setTitle('Nouvelle inscription à une formation');
            $notification->setContent(
                sprintf(
                    "L'utilisateur %s %s s'est inscrit à la formation \"%s\" (session du %s).",
                    $student->getFirstName(),
                    $student->getLastName(),
                    $formationTitle,
                    $sessionDate
                )
            );
            $notification->setType('info');
            $notification->setUser($admin);

            $this->em->persist($notification);

            // Variables pour l'admin
            $adminVariables = [
                'adminName' => $admin->getFirstName(),
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'studentEmail' => $student->getEmail(),
                'formationTitle' => $formationTitle,
                'sessionDate' => $sessionDate,
                'reservationId' => $reservationId,
                // Variables spécifiques à l'admin...
            ];

            try {
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $admin->getEmail(),
                    'registration_confirmation', // Type d'événement
                    'ROLE_ADMIN', // Rôle cible
                    $adminVariables
                );
                $this->logger->info('Email de notification envoyé à l\'admin: ' . $admin->getEmail());
            } catch (\Exception $e) {
                $this->logger->error('Erreur lors de l\'envoi du mail à l\'admin: ' . $e->getMessage());
            }
        }

        // 3. Notifier le formateur si la session a un formateur assigné
        $instructor = $session->getInstructor();
        if ($instructor) {
            // Variables pour le formateur
            $instructorVariables = [
                'instructorName' => $instructor->getFirstName(),
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'formationTitle' => $formationTitle,
                'sessionDate' => $sessionDate,
                'reservationId' => $reservationId,
                // Variables spécifiques au formateur...
            ];

            try {
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $instructor->getEmail(),
                    'registration_confirmation', // Type d'événement
                    'ROLE_INSTRUCTOR', // Rôle cible
                    $instructorVariables
                );
                $this->logger->info('Email de notification envoyé au formateur: ' . $instructor->getEmail());
            } catch (\Exception $e) {
                $this->logger->error('Erreur lors de l\'envoi du mail au formateur: ' . $e->getMessage());
            }
        }

        $this->em->flush();
    }
    /**
     * Notify admin about new session registration
     */
    public function notifyAdminAboutRegistration(Reservation $reservation): void
    {
        try {
            $this->logger->info('Début de notification pour la réservation #' . $reservation->getId());

            // Obtenir les administrateurs
            $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');
            $this->logger->info('Admins trouvés: ' . count($admins));

            if (empty($admins)) {
                $this->logger->warning('Aucun administrateur trouvé pour envoyer la notification!');
                return;
            }

            $student = $reservation->getUser();
            $session = $reservation->getSession();
            $formation = $session->getFormation();
            $instructor = $session->getInstructor();

            $title = 'Nouvelle inscription à une formation';
            $content = sprintf(
                "L'utilisateur %s %s s'est inscrit à la formation \"%s\" (session du %s).",
                $student->getFirstName(),
                $student->getLastName(),
                $formation->getTitle(),
                $session->getStartDate()->format('d/m/Y')
            );

            // Préparer les variables pour le template
            $variables = [
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'formationTitle' => $formation->getTitle(),
                'sessionDate' => $session->getStartDate()->format('d/m/Y'),
                'reservationId' => $reservation->getId(),
                'adminName' => '', // Sera remplacé pour chaque admin
            ];

            foreach ($admins as $admin) {
                $this->logger->info('Envoi de notification à: ' . $admin->getEmail());

                // Créer une notification dans la base de données
                $notification = new Notification();
                $notification->setTitle($title);
                $notification->setContent($content);
                $notification->setType('info');
                $notification->setUser($admin);

                $this->em->persist($notification);

                // Personnaliser les variables pour cet admin
                $adminVariables = array_merge($variables, [
                    'adminName' => $admin->getFirstName()
                ]);

                // Utiliser la nouvelle méthode sendNotification
                $this->sendNotification($admin, $reservation, $adminVariables);
            }
            $this->sendNotification($student, $reservation, $variables);
            if ($instructor){
            $this->sendNotification($instructor, $reservation, $variables);
            }

            $this->em->flush();
            $this->logger->info('Notifications enregistrées dans la base de données');

        } catch (\Exception $e) {
            $this->logger->error('Erreur dans notifyAdminAboutRegistration: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
        }
    }

    /**
     * Notify admin about new vehicle rental
     */
    public function notifyAdminAboutVehicleRental(VehicleRental $rental): void
    {
        try {
            // Obtenir les administrateurs
            $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');

            if (empty($admins)) {
                return;
            }

            $student = $rental->getUser();
            $vehicle = $rental->getVehicle();
            $examCenter = $rental->getExamCenter() ?: 'Non spécifié';

            $title = 'Nouvelle réservation de véhicule pour examen';

            // Préparer les variables pour le template
            $variables = [
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'examCenter' => $examCenter,
                'startDate' => $rental->getStartDate()->format('d/m/Y'),
                'endDate' => $rental->getEndDate()->format('d/m/Y'),
                'vehicleInfo' => $vehicle ? $vehicle->getModel() : 'Non attribué',
                'rentalId' => $rental->getId(),
                'adminName' => '', // Sera remplacé pour chaque admin
            ];

            foreach ($admins as $admin) {
                // Créer notification
                $notification = new Notification();
                $notification->setTitle($title);
                $notification->setContent(sprintf(
                    "L'utilisateur %s %s a réservé un véhicule pour un examen au centre \"%s\" du %s au %s.",
                    $student->getFirstName(),
                    $student->getLastName(),
                    $examCenter,
                    $rental->getStartDate()->format('d/m/Y'),
                    $rental->getEndDate()->format('d/m/Y')
                ));
                $notification->setType('info');
                $notification->setUser($admin);

                $this->em->persist($notification);

                // Personnaliser les variables pour cet admin
                $adminVariables = array_merge($variables, [
                    'adminName' => $admin->getFirstName()
                ]);

                // Utiliser la nouvelle méthode sendNotification
                $this->sendNotification($admin, $rental, $adminVariables);
            }
            $this->sendNotification($student, $rental, $variables);

            $this->em->flush();

        } catch (\Exception $e) {
            $this->logger->error('Erreur dans notifyAdminAboutVehicleRental: ' . $e->getMessage());
        }
    }
    // Méthode de secours si le template n'existe pas
    private function sendEmailToAdmin(string $adminEmail, string $subject, string $content, array $context = []): void
    {
        try {
            // Formatter le contenu avec les variables contextuelles
            $emailBody = $content;

            if (!empty($context)) {
                $emailBody .= "\n\nInformations complémentaires:";
                foreach ($context as $key => $value) {
                    $emailBody .= "\n- " . ucfirst($key) . ": " . $value;
                }
            }

            // Utiliser le service d'email pour l'envoi
            $this->emailService->sendEmail(
                $adminEmail,
                $subject,
                $emailBody
            );

            $this->logger->info('Email envoyé avec succès');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de l\'envoi d\'email: ' . $e->getMessage());
        }
    }

}