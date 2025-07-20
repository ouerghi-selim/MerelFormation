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
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class NotificationService
{
    private $em;
    private $logger;
    private $emailService;
    private $baseUrl;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        EmailService $emailService,
        ParameterBagInterface $parameterBag
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->emailService = $emailService;
        $this->baseUrl = $parameterBag->get('app.base_url');
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
     * Notify about new session registration request (when user first registers)
     */
    public function notifyAboutRegistrationRequest(Reservation $reservation): void
    {
        // Obtenir les données communes
        $student = $reservation->getUser();
        $session = $reservation->getSession();
        $formation = $session->getFormation();
        $formationTitle = $formation->getTitle();
        $sessionDate = $session->getStartDate()->format('d/m/Y');
        $reservationId = $reservation->getId();

        // 1. Notifier l'étudiant de la réception de sa demande
        $studentVariables = [
            'studentName' => $student->getFirstName(),
            'formationTitle' => $formationTitle,
            'sessionDate' => $sessionDate,
            'location' => $session->getLocation() ?? 'À confirmer',
            'reservationId' => $reservationId,
        ];

        try {
            $this->emailService->sendTemplatedEmailByEventAndRole(
                $student->getEmail(),
                'registration_request', // Nouveau type d'événement
                'ROLE_STUDENT', // Rôle cible
                $studentVariables
            );
            $this->logger->info('Email de demande d\'inscription envoyé à l\'étudiant: ' . $student->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de l\'envoi du mail de demande à l\'étudiant: ' . $e->getMessage());
        }

        // 2. Notifier les admins de la nouvelle demande
        $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');

        foreach ($admins as $admin) {
            // Créer une notification dans la base de données
            $notification = new Notification();
            $notification->setTitle('Nouvelle demande d\'inscription');
            $notification->setContent(
                sprintf(
                    "L'utilisateur %s %s a fait une demande d'inscription à la formation \"%s\" (session du %s). Action requise: confirmer ou refuser l'inscription.",
                    $student->getFirstName(),
                    $student->getLastName(),
                    $formationTitle,
                    $sessionDate
                )
            );
            $notification->setUser($admin);
            $notification->setType('registration_request');
            $notification->setCreatedAt(new \DateTimeImmutable());
            $notification->setIsRead(false);

            $this->em->persist($notification);

            // Envoyer l'email de notification admin
            $adminVariables = [
                'adminName' => $admin->getFirstName(),
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'formationTitle' => $formationTitle,
                'sessionDate' => $sessionDate,
                'reservationId' => $reservationId,
            ];

            try {
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $admin->getEmail(),
                    'registration_confirmation', // Utilise le template admin existant
                    'ROLE_ADMIN',
                    $adminVariables
                );
                $this->logger->info('Email de notification envoyé à l\'admin: ' . $admin->getEmail());
            } catch (\Exception $e) {
                $this->logger->error('Erreur lors de l\'envoi du mail à l\'admin: ' . $e->getMessage());
            }
        }

        $this->em->flush();
    }

    /**
     * Notify about confirmed session registration (when admin confirms)
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

        // 1. Notifier l'étudiant avec URL de définition du mot de passe
        // Générer un token sécurisé pour l'URL
        $passwordToken = bin2hex(random_bytes(32));
        
        // Sauvegarder le token en base avec expiration (7 jours)
        $expiresAt = new \DateTime();
        $expiresAt->add(new \DateInterval('P7D')); // 7 jours
        
        $student->setSetupToken($passwordToken);
        $student->setSetupTokenExpiresAt($expiresAt);
        $this->em->persist($student);
        
        $studentVariables = [
            'studentName' => $student->getFirstName(),
            'formationTitle' => $formationTitle,
            'sessionDate' => $sessionDate,
            'location' => $session->getLocation() ?? 'À confirmer',
            'price' => $formation->getPrice() . ' €',
            'passwordSetupUrl' => $this->baseUrl . '/setup-password?token=' . $passwordToken . '&email=' . urlencode($student->getEmail()),
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
//        $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');
//
//        foreach ($admins as $admin) {
//            // Créer une notification dans la base de données
//            $notification = new Notification();
//            $notification->setTitle('Nouvelle inscription à une formation');
//            $notification->setContent(
//                sprintf(
//                    "L'utilisateur %s %s s'est inscrit à la formation \"%s\" (session du %s).",
//                    $student->getFirstName(),
//                    $student->getLastName(),
//                    $formationTitle,
//                    $sessionDate
//                )
//            );
//            $notification->setType('info');
//            $notification->setUser($admin);
//
//            $this->em->persist($notification);
//
//            // Variables pour l'admin
//            $adminVariables = [
//                'adminName' => $admin->getFirstName(),
//                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
//                'studentEmail' => $student->getEmail(),
//                'formationTitle' => $formationTitle,
//                'sessionDate' => $sessionDate,
//                'reservationId' => $reservationId,
//                // Variables spécifiques à l'admin...
//            ];
//
//            try {
//                $this->emailService->sendTemplatedEmailByEventAndRole(
//                    $admin->getEmail(),
//                    'registration_confirmation', // Type d'événement
//                    'ROLE_ADMIN', // Rôle cible
//                    $adminVariables
//                );
//                $this->logger->info('Email de notification envoyé à l\'admin: ' . $admin->getEmail());
//            } catch (\Exception $e) {
//                $this->logger->error('Erreur lors de l\'envoi du mail à l\'admin: ' . $e->getMessage());
//            }
//        }

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
    // === FORMATION NOTIFICATIONS ===

    /**
     * Notify about formation creation
     */
    public function notifyAboutFormationCreated($formation, $createdBy): void
    {
        try {
            // Variables communes
            $variables = [
                'formationTitle' => $formation->getTitle(),
                'createdBy' => $createdBy->getFirstName() . ' ' . $createdBy->getLastName(),
                'createdAt' => (new \DateTime())->format('d/m/Y H:i'),
                'duration' => $formation->getDuration(),
                'category' => $formation->getCategory() ? $formation->getCategory()->getName() : 'Non définie'
            ];

            // Notifier les admins
            $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');
            foreach ($admins as $admin) {
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $admin->getEmail(),
                    NotificationEventType::FORMATION_CREATED,
                    'ROLE_ADMIN',
                    $variables
                );
            }

            // Notifier les instructeurs
            $instructors = $this->em->getRepository(User::class)->findByRole('ROLE_INSTRUCTOR');
            foreach ($instructors as $instructor) {
                $instructorVariables = array_merge($variables, [
                    'instructorName' => $instructor->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $instructor->getEmail(),
                    NotificationEventType::FORMATION_CREATED,
                    'ROLE_INSTRUCTOR',
                    $instructorVariables
                );
            }

            $this->logger->info('Notifications de création de formation envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications de création de formation: ' . $e->getMessage());
        }
    }

    /**
     * Notify about formation updates
     */
    public function notifyAboutFormationUpdated($formation, $changesDescription): void
    {
        try {
            // Récupérer les étudiants inscrits à cette formation
            $students = $this->getStudentsEnrolledInFormation($formation);

            $variables = [
                'formationTitle' => $formation->getTitle(),
                'changesDescription' => $changesDescription,
                'updatedAt' => (new \DateTime())->format('d/m/Y H:i')
            ];

            foreach ($students as $student) {
                $studentVariables = array_merge($variables, [
                    'studentName' => $student->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $student->getEmail(),
                    NotificationEventType::FORMATION_UPDATED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            $this->logger->info('Notifications de modification de formation envoyées à ' . count($students) . ' étudiants');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications de modification de formation: ' . $e->getMessage());
        }
    }

    /**
     * Notify about formation deletion
     */
    public function notifyAboutFormationDeleted($formation, $reason, $alternativeFormations): void
    {
        try {
            $students = $this->getStudentsEnrolledInFormation($formation);

            $variables = [
                'formationTitle' => $formation->getTitle(),
                'deletedAt' => (new \DateTime())->format('d/m/Y H:i'),
                'reason' => $reason,
                'alternativeFormations' => $alternativeFormations
            ];

            foreach ($students as $student) {
                $studentVariables = array_merge($variables, [
                    'studentName' => $student->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $student->getEmail(),
                    NotificationEventType::FORMATION_DELETED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            $this->logger->info('Notifications d\'annulation de formation envoyées à ' . count($students) . ' étudiants');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications d\'annulation de formation: ' . $e->getMessage());
        }
    }

    // === SESSION NOTIFICATIONS ===

    /**
     * Notify about session creation
     */
    public function notifyAboutSessionCreated($session): void
    {
        try {
            // Récupérer les étudiants potentiellement intéressés
            $students = $this->em->getRepository(User::class)->findByRole('ROLE_STUDENT');

            $variables = [
                'formationTitle' => $session->getFormation()->getTitle(),
                'sessionDate' => $session->getStartDate()->format('d/m/Y H:i'),
                'location' => $session->getLocation() ?? 'À confirmer',
                'availableSeats' => $session->getMaxParticipants() - count($session->getReservations()),
                'price' => $session->getFormation()->getPrice() . ' €'
            ];

            foreach ($students as $student) {
                $studentVariables = array_merge($variables, [
                    'studentName' => $student->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $student->getEmail(),
                    NotificationEventType::SESSION_CREATED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            $this->logger->info('Notifications de nouvelle session envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications de nouvelle session: ' . $e->getMessage());
        }
    }

    /**
     * Notify about session updates
     */
    public function notifyAboutSessionUpdated($session, $changesDescription): void
    {
        try {
            $participants = $this->getSessionParticipants($session);

            $variables = [
                'formationTitle' => $session->getFormation()->getTitle(),
                'newSessionDate' => $session->getStartDate()->format('d/m/Y H:i'),
                'newLocation' => $session->getLocation() ?? 'À confirmer',
                'changesDescription' => $changesDescription
            ];

            foreach ($participants as $participant) {
                $studentVariables = array_merge($variables, [
                    'studentName' => $participant->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $participant->getEmail(),
                    NotificationEventType::SESSION_UPDATED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            $this->logger->info('Notifications de modification de session envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications de modification de session: ' . $e->getMessage());
        }
    }

    /**
     * Notify about session cancellation
     */
    public function notifyAboutSessionCancelled($session, $reason, $rescheduleInfo): void
    {
        try {
            $participants = $this->getSessionParticipants($session);

            $variables = [
                'formationTitle' => $session->getFormation()->getTitle(),
                'originalSessionDate' => $session->getStartDate()->format('d/m/Y H:i'),
                'reason' => $reason,
                'rescheduleInfo' => $rescheduleInfo
            ];

            foreach ($participants as $participant) {
                $studentVariables = array_merge($variables, [
                    'studentName' => $participant->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $participant->getEmail(),
                    NotificationEventType::SESSION_CANCELLED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            $this->logger->info('Notifications d\'annulation de session envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications d\'annulation de session: ' . $e->getMessage());
        }
    }

    // === USER NOTIFICATIONS ===

    /**
     * Send welcome email to new user
     */
    public function notifyUserWelcome($user, $temporaryPassword): void
    {
        try {
            $variables = [
                'userName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'userEmail' => $user->getEmail(),
                'temporaryPassword' => $temporaryPassword,
                'userRole' => $this->getHighestRole($user)
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $user->getEmail(),
                NotificationEventType::USER_WELCOME,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Email de bienvenue envoyé à: ' . $user->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de l\'envoi de l\'email de bienvenue: ' . $e->getMessage());
        }
    }

    /**
     * Notify about user profile updates
     */
    public function notifyUserUpdated($user, $changesDescription, $updatedBy): void
    {
        try {
            $variables = [
                'userName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'changesDescription' => $changesDescription,
                'updatedAt' => (new \DateTime())->format('d/m/Y H:i'),
                'updatedBy' => $updatedBy->getFirstName() . ' ' . $updatedBy->getLastName()
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $user->getEmail(),
                NotificationEventType::USER_UPDATED,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification de modification de profil envoyée');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de modification de profil: ' . $e->getMessage());
        }
    }

    /**
     * Notify about user deactivation
     */
    public function notifyUserDeactivated($user, $reason): void
    {
        try {
            $variables = [
                'userName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'deactivatedAt' => (new \DateTime())->format('d/m/Y H:i'),
                'reason' => $reason
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $user->getEmail(),
                NotificationEventType::USER_DEACTIVATED,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification de désactivation envoyée');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de désactivation: ' . $e->getMessage());
        }
    }

    /**
     * Notify about user reactivation/restoration
     */
    public function notifyUserReactivated($user): void
    {
        try {
            $variables = [
                'userName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'reactivatedAt' => (new \DateTime())->format('d/m/Y H:i'),
                'userEmail' => $user->getEmail()
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $user->getEmail(),
                NotificationEventType::USER_REACTIVATED,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification de réactivation envoyée à: ' . $user->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de réactivation: ' . $e->getMessage());
        }
    }

    // === VEHICLE NOTIFICATIONS ===

    /**
     * Notify about vehicle addition
     */
    public function notifyVehicleAdded($vehicle, $addedBy): void
    {
        try {
            $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');

            $variables = [
                'vehicleModel' => $vehicle->getModel(),
                'vehiclePlate' => $vehicle->getPlateNumber(),
                'vehicleType' => $vehicle->getType(),
                'addedBy' => $addedBy->getFirstName() . ' ' . $addedBy->getLastName(),
                'addedAt' => (new \DateTime())->format('d/m/Y H:i')
            ];

            foreach ($admins as $admin) {
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $admin->getEmail(),
                    NotificationEventType::VEHICLE_ADDED,
                    'ROLE_ADMIN',
                    $variables
                );
            }

            $this->logger->info('Notifications d\'ajout de véhicule envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications d\'ajout de véhicule: ' . $e->getMessage());
        }
    }

    /**
     * Notify about vehicle maintenance
     */
    public function notifyVehicleMaintenance($vehicle, $maintenanceReason, $alternativeVehicles): void
    {
        try {
            // Récupérer les clients avec des réservations pour ce véhicule
            $affectedClients = $this->getClientsWithVehicleReservations($vehicle);

            $variables = [
                'vehicleModel' => $vehicle->getModel(),
                'maintenanceReason' => $maintenanceReason,
                'alternativeVehicles' => $alternativeVehicles
            ];

            foreach ($affectedClients as $client) {
                $clientVariables = array_merge($variables, [
                    'clientName' => $client['user']->getFirstName(),
                    'reservationDate' => $client['reservationDate']
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $client['user']->getEmail(),
                    NotificationEventType::VEHICLE_MAINTENANCE,
                    'ROLE_STUDENT',
                    $clientVariables
                );
            }

            $this->logger->info('Notifications de maintenance de véhicule envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications de maintenance: ' . $e->getMessage());
        }
    }

    // === DOCUMENT NOTIFICATIONS ===

    /**
     * Notify about document addition (single document - deprecated)
     */
    public function notifyDocumentAdded($document, $formation, $session = null): void
    {
        try {
            $students = [];
            
            if ($session) {
                // Document spécifique à une session
                $students = $this->getSessionParticipants($session);
            } else {
                // Document général pour la formation
                $students = $this->getStudentsEnrolledInFormation($formation);
            }

            $variables = [
                'documentTitle' => $document->getTitle(),
                'formationTitle' => $formation->getTitle(),
                'documentType' => $document->getType(),
                'addedAt' => (new \DateTime())->format('d/m/Y H:i')
            ];

            foreach ($students as $student) {
                $studentVariables = array_merge($variables, [
                    'studentName' => $student->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $student->getEmail(),
                    NotificationEventType::DOCUMENT_ADDED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            $this->logger->info('Notifications d\'ajout de document envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications d\'ajout de document: ' . $e->getMessage());
        }
    }

    /**
     * Notify about multiple documents added (new improved version)
     */
    public function notifyDocumentsAdded(array $documents, $formation, $session = null, $addedByUser = null): void
    {
        try {
            if (empty($documents)) {
                return;
            }

            $documentCount = count($documents);
            $isInstructor = $addedByUser && in_array('ROLE_INSTRUCTOR', $addedByUser->getRoles());

            // Préparer la liste des documents pour les emails (HTML)
            $documentListHtml = '<ul style="margin: 0; padding-left: 20px;">';
            foreach ($documents as $document) {
                $documentListHtml .= '<li style="margin-bottom: 5px;">' . 
                    htmlspecialchars($document->getTitle()) . ' <span style="color: #666;">(' . 
                    strtoupper(htmlspecialchars($document->getType())) . ')</span></li>';
            }
            $documentListHtml .= '</ul>';

            $baseVariables = [
                'documentCount' => $documentCount,
                'documentListHtml' => $documentListHtml,
                'formationTitle' => $formation->getTitle(),
                'sessionTitle' => $session ? $session->getLocation() . ' (' . $session->getStartDate()->format('d/m/Y') . ')' : '',
                'addedAt' => (new \DateTime())->format('d/m/Y H:i'),
                'addedByName' => $addedByUser ? $addedByUser->getFirstName() . ' ' . $addedByUser->getLastName() : 'Administrateur'
            ];

            // 1. Notification aux étudiants
            $students = [];
            if ($session) {
                $students = $this->getSessionParticipants($session);
            } else {
                $students = $this->getStudentsEnrolledInFormation($formation);
            }

            foreach ($students as $student) {
                $studentVariables = array_merge($baseVariables, [
                    'studentName' => $student->getFirstName()
                ]);
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $student->getEmail(),
                    NotificationEventType::DOCUMENTS_ADDED,
                    'ROLE_STUDENT',
                    $studentVariables
                );
            }

            // 2. Notification aux admins si c'est un instructeur qui a ajouté les documents
            if ($isInstructor) {
                $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');
                
                foreach ($admins as $admin) {
                    $adminVariables = array_merge($baseVariables, [
                        'adminName' => $admin->getFirstName(),
                        'instructorName' => $addedByUser->getFirstName() . ' ' . $addedByUser->getLastName()
                    ]);
                    $this->emailService->sendTemplatedEmailByEventAndRole(
                        $admin->getEmail(),
                        NotificationEventType::DOCUMENTS_ADDED_BY_INSTRUCTOR,
                        'ROLE_ADMIN',
                        $adminVariables
                    );
                }
            }

            $this->logger->info("Notifications d'ajout de {$documentCount} documents envoyées à " . count($students) . " étudiants" . ($isInstructor ? " et aux admins" : ""));
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications d\'ajout de documents: ' . $e->getMessage());
        }
    }

    // === CONTACT NOTIFICATIONS ===

    /**
     * Notify about contact request
     */
    public function notifyContactRequest($contactData): void
    {
        try {
            // Notifier les admins
            $admins = $this->em->getRepository(User::class)->findByRole('ROLE_ADMIN');
            
            $adminVariables = [
                'contactName' => $contactData['name'],
                'contactEmail' => $contactData['email'],
                'contactPhone' => $contactData['phone'] ?? 'Non renseigné',
                'contactSubject' => $contactData['subject'],
                'contactMessage' => $contactData['message'],
                'receivedAt' => (new \DateTime())->format('d/m/Y H:i')
            ];

            foreach ($admins as $admin) {
                $this->emailService->sendTemplatedEmailByEventAndRole(
                    $admin->getEmail(),
                    NotificationEventType::CONTACT_REQUEST,
                    'ROLE_ADMIN',
                    $adminVariables
                );
            }

            // Accusé de réception au client
            $clientVariables = [
                'contactName' => $contactData['name'],
                'contactSubject' => $contactData['subject'],
                'receivedAt' => (new \DateTime())->format('d/m/Y H:i')
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $contactData['email'],
                NotificationEventType::CONTACT_REQUEST,
                'ROLE_STUDENT',
                $clientVariables
            );

            $this->logger->info('Notifications de demande de contact envoyées');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors des notifications de contact: ' . $e->getMessage());
        }
    }

    // === PAYMENT NOTIFICATIONS ===

    /**
     * Notify about payment received
     */
    public function notifyPaymentReceived($payment): void
    {
        try {
            $variables = [
                'clientName' => $payment->getUser()->getFirstName() . ' ' . $payment->getUser()->getLastName(),
                'amount' => $payment->getAmount(),
                'invoiceNumber' => $payment->getInvoice() ? $payment->getInvoice()->getNumber() : 'N/A',
                'paymentDate' => $payment->getCreatedAt()->format('d/m/Y'),
                'paymentMethod' => $payment->getMethod() ?? 'Non spécifié'
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $payment->getUser()->getEmail(),
                NotificationEventType::PAYMENT_RECEIVED,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification de paiement reçu envoyée');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de paiement: ' . $e->getMessage());
        }
    }

    /**
     * Notify about payment due
     */
    public function notifyPaymentDue($invoice, $daysUntilDue): void
    {
        try {
            $variables = [
                'clientName' => $invoice->getUser()->getFirstName() . ' ' . $invoice->getUser()->getLastName(),
                'amount' => $invoice->getAmount(),
                'invoiceNumber' => $invoice->getNumber(),
                'dueDate' => $invoice->getDueDate()->format('d/m/Y'),
                'formationTitle' => $invoice->getFormation() ? $invoice->getFormation()->getTitle() : 'Service',
                'daysUntilDue' => $daysUntilDue
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $invoice->getUser()->getEmail(),
                NotificationEventType::PAYMENT_DUE,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Rappel d\'échéance de paiement envoyé');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du rappel d\'échéance: ' . $e->getMessage());
        }
    }

    // === HELPER METHODS ===

    /**
     * Get students enrolled in a formation
     */
    private function getStudentsEnrolledInFormation($formation): array
    {
        return $this->em->getRepository(User::class)
            ->createQueryBuilder('u')
            ->join('u.reservations', 'r')
            ->join('r.session', 's')
            ->where('s.formation = :formation')
            ->andWhere('r.status = :confirmed')
            ->setParameter('formation', $formation)
            ->setParameter('confirmed', 'confirmed')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get participants of a session
     */
    private function getSessionParticipants($session): array
    {
        return $this->em->getRepository(User::class)
            ->createQueryBuilder('u')
            ->join('u.reservations', 'r')
            ->where('r.session = :session')
            ->andWhere('r.status = :confirmed')
            ->setParameter('session', $session)
            ->setParameter('confirmed', 'confirmed')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get clients with reservations for a specific vehicle
     */
    private function getClientsWithVehicleReservations($vehicle): array
    {
        $rentals = $this->em->getRepository(VehicleRental::class)
            ->createQueryBuilder('vr')
            ->where('vr.vehicle = :vehicle')
            ->andWhere('vr.startDate > :now')
            ->setParameter('vehicle', $vehicle)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getResult();

        $clients = [];
        foreach ($rentals as $rental) {
            $clients[] = [
                'user' => $rental->getUser(),
                'reservationDate' => $rental->getStartDate()->format('d/m/Y')
            ];
        }

        return $clients;
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

    // === DOCUMENT NOTIFICATIONS ===

    /**
     * Notify student about direct document sent
     */
    public function notifyAboutDirectDocumentSent($document, $message = ''): void
    {
        try {
            $student = $document->getUser();
            $sender = $document->getUploadedBy();
            
            if (!$student || !$sender) {
                $this->logger->warning('Document direct sans étudiant ou expéditeur défini');
                return;
            }

            $variables = [
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'documentTitle' => $document->getTitle(),
                'documentType' => strtoupper($document->getType()),
                'senderName' => $sender->getFirstName() . ' ' . $sender->getLastName(),
                'senderRole' => $this->getHighestRole($sender),
                'sentAt' => (new \DateTime())->format('d/m/Y H:i'),
                'message' => $message ?: 'Aucun message spécifique fourni.',
                'downloadUrl' => '/student/documents' // Lien vers la section documents
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $student->getEmail(),
                NotificationEventType::DIRECT_DOCUMENT_SENT,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification document direct envoyée à: ' . $student->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification document direct: ' . $e->getMessage());
        }
    }

    /**
     * Notifie l'étudiant que son document d'inscription a été validé
     */
    public function notifyDocumentValidated($document, $validatedByUser): void
    {
        try {
            $student = $document->getUser();
            if (!$student) {
                $this->logger->warning('Document sans utilisateur associé - impossible d\'envoyer la notification de validation');
                return;
            }

            $variables = [
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'documentTitle' => $document->getTitle(),
                'validatedBy' => $validatedByUser->getFirstName() . ' ' . $validatedByUser->getLastName(),
                'validatedDate' => $document->getValidatedAt()->format('d/m/Y à H:i'),
                'loginUrl' => $this->baseUrl . '/login'
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $student->getEmail(),
                NotificationEventType::DOCUMENT_VALIDATED,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification de validation de document envoyée à: ' . $student->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de validation de document: ' . $e->getMessage());
        }
    }

    /**
     * Notifie l'étudiant que son document d'inscription a été rejeté
     */
    public function notifyDocumentRejected($document, $rejectedByUser): void
    {
        try {
            $student = $document->getUser();
            if (!$student) {
                $this->logger->warning('Document sans utilisateur associé - impossible d\'envoyer la notification de rejet');
                return;
            }

            $variables = [
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'documentTitle' => $document->getTitle(),
                'rejectedBy' => $rejectedByUser->getFirstName() . ' ' . $rejectedByUser->getLastName(),
                'rejectedDate' => $document->getValidatedAt()->format('d/m/Y à H:i'),
                'rejectionReason' => $document->getRejectionReason(),
                'loginUrl' => $this->baseUrl . '/login'
            ];

            $this->emailService->sendTemplatedEmailByEventAndRole(
                $student->getEmail(),
                NotificationEventType::DOCUMENT_REJECTED,
                'ROLE_STUDENT',
                $variables
            );

            $this->logger->info('Notification de rejet de document envoyée à: ' . $student->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de rejet de document: ' . $e->getMessage());
        }
    }

    /**
     * Notifie lors du changement de statut d'une réservation
     */
    public function notifyReservationStatusChange(Reservation $reservation, string $oldStatus, string $newStatus): void
    {
        try {
            $student = $reservation->getUser();
            if (!$student) {
                $this->logger->warning('Réservation sans utilisateur associé - impossible d\'envoyer la notification de changement de statut');
                return;
            }

            // Préparer les variables communes
            $session = $reservation->getSession();
            $formation = $session->getFormation();
            
            $commonVariables = [
                'studentName' => $student->getFirstName() . ' ' . $student->getLastName(),
                'formationTitle' => $formation->getTitle(),
                'sessionDate' => $session->getStartDate()->format('d/m/Y'),
                'reservationId' => $reservation->getId(),
                'oldStatus' => $oldStatus,
                'newStatus' => $newStatus,
                'statusChangeDate' => (new \DateTime())->format('d/m/Y à H:i'),
                'studentPortalUrl' => $this->baseUrl . '/student/dashboard',
                'loginUrl' => $this->baseUrl . '/login'
            ];

            // Variables spécifiques selon le statut
            $specificVariables = $this->getStatusSpecificVariables($reservation, $newStatus);
            $variables = array_merge($commonVariables, $specificVariables);

            // Identifier du template basé sur le nouveau statut
            $templateIdentifier = 'reservation_status_' . $newStatus . '_student';

            // Envoyer la notification à l'étudiant
            $this->emailService->sendTemplatedEmailByIdentifier(
                $student->getEmail(),
                $templateIdentifier,
                $variables
            );

            $this->logger->info("Notification de changement de statut envoyée: {$oldStatus} → {$newStatus} pour réservation {$reservation->getId()}");
            
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la notification de changement de statut: ' . $e->getMessage());
        }
    }

    /**
     * Retourne les variables spécifiques selon le statut
     */
    private function getStatusSpecificVariables(Reservation $reservation, string $status): array
    {
        $session = $reservation->getSession();
        $formation = $session->getFormation();
        
        switch ($status) {
            case 'submitted':
                return [
                    'submissionDate' => $reservation->getCreatedAt()->format('d/m/Y à H:i')
                ];

            case 'awaiting_documents':
                return [
                    'specificDocuments' => 'CV, lettre de motivation, diplômes'
                ];

            case 'documents_pending':
                return [
                    'documentsReceivedDate' => (new \DateTime())->format('d/m/Y'),
                    'documentCount' => '3'
                ];

            case 'documents_rejected':
                return [
                    'rejectionReason' => 'Documents incomplets ou illisibles. Veuillez fournir des documents au format PDF de qualité.'
                ];

            case 'awaiting_prerequisites':
                return [
                    'missingPrerequisites' => 'Permis de conduire valide, formation code de la route'
                ];

            case 'awaiting_funding':
                return [
                    'totalAmount' => $formation->getPrice() ?? '1500',
                    'duration' => $formation->getDurationHours() ?? '140'
                ];

            case 'funding_approved':
                return [
                    'fundingOrganization' => 'Pôle Emploi',
                    'approvedAmount' => $formation->getPrice() ?? '1500',
                    'fundingFileNumber' => 'PE-' . $reservation->getId(),
                    'approvalDate' => (new \DateTime())->format('d/m/Y')
                ];

            case 'awaiting_payment':
                return [
                    'amountDue' => $formation->getPrice() ?? '1500',
                    'invoiceNumber' => 'INV-' . $reservation->getId(),
                    'paymentDeadline' => (new \DateTime('+15 days'))->format('d/m/Y'),
                    'paymentUrl' => $this->baseUrl . '/student/payment/' . $reservation->getId()
                ];

            case 'payment_pending':
                return [
                    'paidAmount' => $formation->getPrice() ?? '1500',
                    'paymentMethod' => 'Virement bancaire',
                    'paymentDate' => (new \DateTime())->format('d/m/Y'),
                    'paymentReference' => 'PAY-' . $reservation->getId()
                ];

            case 'confirmed':
                return [
                    'sessionStartDate' => $session->getStartDate()->format('d/m/Y'),
                    'duration' => $formation->getDurationHours() ?? '140',
                    'location' => 'Centre MerelFormation',
                    'instructorName' => $session->getInstructor() ? 
                        $session->getInstructor()->getFirstName() . ' ' . $session->getInstructor()->getLastName() 
                        : 'À définir'
                ];

            case 'awaiting_start':
                return [
                    'sessionStartDate' => $session->getStartDate()->format('d/m/Y'),
                    'startTime' => $session->getStartDate()->format('H:i'),
                    'location' => 'Centre MerelFormation',
                    'roomNumber' => 'Salle ' . ($reservation->getId() % 5 + 1),
                    'instructorName' => $session->getInstructor() ? 
                        $session->getInstructor()->getFirstName() . ' ' . $session->getInstructor()->getLastName() 
                        : 'À définir',
                    'specificRequirements' => 'Ordinateur portable conseillé',
                    'firstDaySchedule' => '09h00-12h00 : Accueil et présentation\n13h30-17h00 : Premier module théorique',
                    'emergencyPhone' => '04 XX XX XX XX'
                ];

            case 'in_progress':
                return [
                    'completedHours' => '20',
                    'totalHours' => $formation->getDurationHours() ?? '140',
                    'completedModules' => '2',
                    'totalModules' => '8',
                    'nextSessionDate' => (new \DateTime('+7 days'))->format('d/m/Y'),
                    'progressPercentage' => '25'
                ];

            case 'attendance_issues':
                return [
                    'unjustifiedAbsences' => '3',
                    'cumulatedDelays' => '2h30',
                    'attendanceRate' => '65',
                    'urgentPhone' => '04 XX XX XX XX'
                ];

            case 'suspended':
                return [
                    'suspensionDate' => (new \DateTime())->format('d/m/Y'),
                    'suspensionReason' => 'Absences répétées non justifiées',
                    'suspensionDuration' => '2 semaines',
                    'suspendedBy' => 'Direction pédagogique',
                    'resumptionConditions' => 'Entretien pédagogique obligatoire et engagement écrit sur l\'assiduité',
                    'urgentPhone' => '04 XX XX XX XX',
                    'deadlineDate' => (new \DateTime('+14 days'))->format('d/m/Y')
                ];

            case 'completed':
                return [
                    'completionDate' => (new \DateTime())->format('d/m/Y'),
                    'totalHours' => $formation->getDurationHours() ?? '140',
                    'finalGrade' => '16',
                    'finalAttendanceRate' => '95',
                    'certificateDownloadUrl' => $this->baseUrl . '/student/certificate/' . $reservation->getId(),
                    'satisfactionSurveyUrl' => $this->baseUrl . '/student/survey/' . $reservation->getId()
                ];

            case 'failed':
                return [
                    'finalGrade' => '8',
                    'attendanceRate' => '70',
                    'validatedModules' => '5',
                    'totalModules' => '8',
                    'passingGrade' => '10',
                    'failureReasons' => 'Note insuffisante aux évaluations finales et taux de présence en dessous du minimum requis',
                    'retryDelay' => '6',
                    'retryRegistrationUrl' => $this->baseUrl . '/formations/' . $formation->getId()
                ];

            case 'cancelled':
                return [
                    'cancellationDate' => (new \DateTime())->format('d/m/Y'),
                    'cancellationReason' => 'Demande de l\'étudiant',
                    'cancelledBy' => 'Étudiant',
                    'refundConditions' => 'Remboursement intégral sous 15 jours (annulation > 7 jours avant début)',
                    'refundDelay' => '15',
                    'refundMethod' => 'Virement bancaire',
                    'alternativeFormations' => 'Formation taxi 14h, Formation VTC, Recyclage conducteur'
                ];

            case 'refunded':
                return [
                    'refundAmount' => $formation->getPrice() ?? '1500',
                    'refundDate' => (new \DateTime())->format('d/m/Y'),
                    'refundMethod' => 'Virement bancaire',
                    'refundReference' => 'REF-' . $reservation->getId(),
                    'receptionDelay' => '3-5',
                    'bankingDelay' => '2-3',
                    'formationCatalogUrl' => $this->baseUrl . '/formations'
                ];

            default:
                return [];
        }
    }

}