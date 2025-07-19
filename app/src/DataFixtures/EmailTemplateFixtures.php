<?php

namespace App\DataFixtures;

use App\Entity\EmailTemplate;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class EmailTemplateFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Template pour les notifications d'inscription
        $template = new EmailTemplate();
        $template->setName('Notification d\'inscription à une formation');
        $template->setIdentifier('registration_notification'); // Identifiant technique fixe
        $template->setEventType('registration_confirmation');
        $template->setTargetRole('ROLE_ADMIN');
        $template->setIsSystem(true); // Marquer comme template système
        $template->setType('notification');
        $template->setSubject('Nouvelle inscription à une formation');
        $template->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvelle inscription à une formation</h2>
                <p>Bonjour {{adminName}},</p>
                <p>Un nouvel utilisateur s\'est inscrit à une formation sur la plateforme MerelFormation.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de l\'inscription:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Étudiant: {{studentName}}</li>
                        <li>Formation: {{formationTitle}}</li>
                        <li>Date de session: {{sessionDate}}</li>
                        <li>ID de réservation: {{reservationId}}</li>
                    </ul>
                </div>
                <p>Vous pouvez consulter et gérer cette inscription dans votre <a href="http://merelformation.localhost/admin/reservations" style="color: #3182ce;">tableau de bord administrateur</a>.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $template->setVariables(['adminName', 'studentName', 'formationTitle', 'sessionDate', 'reservationId']);

        $manager->persist($template);

        // Template pour l'étudiant - Demande d'inscription reçue
        $studentRequestTemplate = new EmailTemplate();
        $studentRequestTemplate->setName('Demande d\'inscription reçue (Étudiant)');
        $studentRequestTemplate->setIdentifier('registration_request_student');
        $studentRequestTemplate->setEventType('registration_request');
        $studentRequestTemplate->setTargetRole('ROLE_STUDENT');
        $studentRequestTemplate->setIsSystem(true);
        $studentRequestTemplate->setType('notification');
        $studentRequestTemplate->setSubject('Demande d\'inscription reçue - {{formationTitle}}');
        $studentRequestTemplate->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Demande d\'inscription reçue</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons bien reçu votre demande d\'inscription à la formation suivante :</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de votre demande:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation: {{formationTitle}}</li>
                        <li>Date de session: {{sessionDate}}</li>
                        <li>Lieu: {{location}}</li>
                        <li>Numéro de demande: {{reservationId}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>Prochaines étapes:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre demande est en cours de traitement</li>
                        <li>Un administrateur ou formateur va examiner votre inscription</li>
                        <li>Vous recevrez une confirmation par email une fois validée</li>
                        <li>Délai de traitement: 24-48h ouvrées</li>
                    </ul>
                </div>
                <p>Si votre demande est urgente, vous pouvez nous contacter directement par téléphone au <strong>04 XX XX XX XX</strong>.</p>
                <p>Nous vous remercions pour votre intérêt et vous répondrons dans les plus brefs délais.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $studentRequestTemplate->setVariables(['studentName', 'formationTitle', 'sessionDate', 'location', 'reservationId']);

        $manager->persist($studentRequestTemplate);

        // Template pour l'étudiant - Confirmation d'inscription
        $studentTemplate = new EmailTemplate();
        $studentTemplate->setName('Confirmation d\'inscription (Étudiant)');
        $studentTemplate->setIdentifier('registration_confirmation_student');
        $studentTemplate->setEventType('registration_confirmation');
        $studentTemplate->setTargetRole('ROLE_STUDENT');
        $studentTemplate->setIsSystem(true);
        $studentTemplate->setType('notification');
        $studentTemplate->setSubject('Confirmation de votre inscription à {{formationTitle}}');
        $studentTemplate->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Confirmation d\'inscription</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous confirmons votre inscription à la formation suivante :</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de votre formation:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation: {{formationTitle}}</li>
                        <li>Date: {{sessionDate}}</li>
                        <li>Lieu: {{location}}</li>
                        <li>Prix: {{price}}</li>
                    </ul>
                </div>
                <p>Nous vous remercions pour votre confiance et nous nous réjouissons de vous accueillir prochainement.</p>
                <p>Si vous avez des questions, n\'hésitez pas à nous contacter.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $studentTemplate->setVariables(['studentName', 'formationTitle', 'sessionDate', 'location', 'price']);

        $manager->persist($studentTemplate);

        // Template pour le formateur - Nouvelle inscription
        $instructorTemplate = new EmailTemplate();
        $instructorTemplate->setName('Notification d\'inscription (Formateur)');
        $instructorTemplate->setIdentifier('registration_confirmation_instructor');
        $instructorTemplate->setEventType('registration_confirmation');
        $instructorTemplate->setTargetRole('ROLE_INSTRUCTOR');
        $instructorTemplate->setIsSystem(true);
        $instructorTemplate->setType('notification');
        $instructorTemplate->setSubject('Nouvel inscrit à votre session de formation');
        $instructorTemplate->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvel inscrit à votre session</h2>
                <p>Bonjour {{instructorName}},</p>
                <p>Un nouvel étudiant s\'est inscrit à la session de formation que vous animez :</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de la session:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Étudiant: {{studentName}}</li>
                        <li>Formation: {{formationTitle}}</li>
                        <li>Date: {{sessionDate}}</li>
                    </ul>
                </div>
                <p>Vous pouvez consulter la liste complète des inscrits dans votre espace formateur.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $instructorTemplate->setVariables(['instructorName', 'studentName', 'formationTitle', 'sessionDate']);

        $manager->persist($instructorTemplate);

        // Template pour les réservations de véhicules
        $vehicleTemplate = new EmailTemplate();
        $vehicleTemplate->setName('Nouvelle réservation de véhicule');
        $vehicleTemplate->setIdentifier('vehicle_rental_notification'); // Identifiant technique fixe
        $vehicleTemplate->setEventType('vehicle_rental');
        $vehicleTemplate->setTargetRole('ROLE_ADMIN');
        $vehicleTemplate->setIsSystem(true); // Marquer comme template système
        $vehicleTemplate->setType('reservation');
        $vehicleTemplate->setSubject('Nouvelle réservation de véhicule');
        $vehicleTemplate->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvelle réservation de véhicule</h2>
                <p>Bonjour {{adminName}},</p>
                <p>Un utilisateur a réservé un véhicule sur la plateforme MerelFormation.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de la réservation:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Client: {{studentName}}</li>
                        <li>Centre d\'examen: {{examCenter}}</li>
                        <li>Date de début: {{startDate}}</li>
                        <li>Date de fin: {{endDate}}</li>
                        <li>Véhicule: {{vehicleInfo}}</li>
                    </ul>
                </div>
                <p>Vous pouvez consulter et gérer cette réservation dans votre <a href="http://merelformation.localhost/admin/reservations" style="color: #3182ce;">tableau de bord administrateur</a>.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $vehicleTemplate->setVariables(['adminName', 'studentName', 'examCenter', 'startDate', 'endDate', 'vehicleInfo']);

        $manager->persist($vehicleTemplate);


        // Template pour la confirmation de réservation de véhicule au client
        $vehicleClientTemplate = new EmailTemplate();
        $vehicleClientTemplate->setName('Confirmation de réservation de véhicule (Client)');
        $vehicleClientTemplate->setIdentifier('vehicle_rental_confirmation_client');
        $vehicleClientTemplate->setEventType('vehicle_rental');
        $vehicleClientTemplate->setTargetRole('ROLE_STUDENT');
        $vehicleClientTemplate->setIsSystem(true);
        $vehicleClientTemplate->setType('reservation');
        $vehicleClientTemplate->setSubject('Confirmation de votre réservation de véhicule');
        $vehicleClientTemplate->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Confirmation de réservation</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous confirmons votre réservation de véhicule pour votre examen de conduite.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de votre réservation:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li><strong>Véhicule:</strong> {{vehicleInfo}}</li>
                        <li><strong>Centre d\'examen:</strong> {{examCenter}}</li>
                        <li><strong>Date de début:</strong> {{startDate}}</li>
                        <li><strong>Date de fin:</strong> {{endDate}}</li>
                        <li><strong>Numéro de réservation:</strong> {{rentalId}}</li>
                    </ul>
                </div>
                
                <div style="background-color: #EDF2F7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4299E1;">
                    <p><strong>Informations importantes:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Présentez-vous 30 minutes avant l\'heure de votre examen</li>
                        <li>N\'oubliez pas votre pièce d\'identité et votre convocation à l\'examen</li>
                        <li>Le véhicule sera disponible à notre agence principale (sauf indication contraire)</li>
                        <li>En cas d\'annulation, merci de nous prévenir au moins 48h à l\'avance</li>
                    </ul>
                </div>
                
                <p>Si vous avez des questions concernant votre réservation ou besoin d\'assistance, vous pouvez nous contacter par téléphone au <strong>04 XX XX XX XX</strong> ou par email à <strong>contact@merelformation.com</strong>.</p>
                
                <p>Nous vous souhaitons bonne chance pour votre examen!</p>
                
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
                
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #718096; text-align: center;">
                    <p>Ce message est envoyé automatiquement, merci de ne pas y répondre directement.</p>
                </div>
            </div>
        ');
        $vehicleClientTemplate->setVariables(['studentName', 'vehicleInfo', 'examCenter', 'startDate', 'endDate', 'rentalId']);

        $manager->persist($vehicleClientTemplate);

        // === FORMATION TEMPLATES ===
        
        // Formation Created - Admin notification
        $formationCreatedAdmin = new EmailTemplate();
        $formationCreatedAdmin->setName('Nouvelle formation créée (Admin)');
        $formationCreatedAdmin->setIdentifier('formation_created_admin');
        $formationCreatedAdmin->setEventType('formation_created');
        $formationCreatedAdmin->setTargetRole('ROLE_ADMIN');
        $formationCreatedAdmin->setIsSystem(true);
        $formationCreatedAdmin->setType('notification');
        $formationCreatedAdmin->setSubject('Nouvelle formation créée: {{formationTitle}}');
        $formationCreatedAdmin->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvelle formation créée</h2>
                <p>Une nouvelle formation a été créée dans le système MerelFormation.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de la formation:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{formationTitle}}</li>
                        <li>Créée par: {{createdBy}}</li>
                        <li>Date de création: {{createdAt}}</li>
                        <li>Durée: {{duration}} heures</li>
                    </ul>
                </div>
                <p>Vous pouvez consulter cette formation dans votre <a href="http://merelformation.localhost/admin/formations" style="color: #3182ce;">tableau de bord administrateur</a>.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $formationCreatedAdmin->setVariables(['formationTitle', 'createdBy', 'createdAt', 'duration']);
        $manager->persist($formationCreatedAdmin);

        // Formation Created - Instructor notification
        $formationCreatedInstructor = new EmailTemplate();
        $formationCreatedInstructor->setName('Nouvelle formation disponible (Instructeur)');
        $formationCreatedInstructor->setIdentifier('formation_created_instructor');
        $formationCreatedInstructor->setEventType('formation_created');
        $formationCreatedInstructor->setTargetRole('ROLE_INSTRUCTOR');
        $formationCreatedInstructor->setIsSystem(true);
        $formationCreatedInstructor->setType('notification');
        $formationCreatedInstructor->setSubject('Nouvelle formation disponible: {{formationTitle}}');
        $formationCreatedInstructor->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvelle formation disponible</h2>
                <p>Bonjour {{instructorName}},</p>
                <p>Une nouvelle formation est maintenant disponible sur la plateforme MerelFormation.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de la formation:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{formationTitle}}</li>
                        <li>Durée: {{duration}} heures</li>
                        <li>Catégorie: {{category}}</li>
                    </ul>
                </div>
                <p>Vous pourrez bientôt animer des sessions de cette formation. Consultez votre espace instructeur pour plus de détails.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $formationCreatedInstructor->setVariables(['instructorName', 'formationTitle', 'duration', 'category']);
        $manager->persist($formationCreatedInstructor);

        // Formation Updated - Students notification
        $formationUpdatedStudent = new EmailTemplate();
        $formationUpdatedStudent->setName('Formation modifiée (Étudiant)');
        $formationUpdatedStudent->setIdentifier('formation_updated_student');
        $formationUpdatedStudent->setEventType('formation_updated');
        $formationUpdatedStudent->setTargetRole('ROLE_STUDENT');
        $formationUpdatedStudent->setIsSystem(true);
        $formationUpdatedStudent->setType('notification');
        $formationUpdatedStudent->setSubject('Modification de votre formation: {{formationTitle}}');
        $formationUpdatedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Modification de votre formation</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Des modifications ont été apportées à la formation à laquelle vous êtes inscrit(e):</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Formation concernée:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{formationTitle}}</li>
                        <li>Modifications: {{changesDescription}}</li>
                        <li>Date de modification: {{updatedAt}}</li>
                    </ul>
                </div>
                <p>Pour plus de détails, consultez votre espace étudiant.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $formationUpdatedStudent->setVariables(['studentName', 'formationTitle', 'changesDescription', 'updatedAt']);
        $manager->persist($formationUpdatedStudent);

        // Formation Deleted - Students notification
        $formationDeletedStudent = new EmailTemplate();
        $formationDeletedStudent->setName('Formation annulée (Étudiant)');
        $formationDeletedStudent->setIdentifier('formation_deleted_student');
        $formationDeletedStudent->setEventType('formation_deleted');
        $formationDeletedStudent->setTargetRole('ROLE_STUDENT');
        $formationDeletedStudent->setIsSystem(true);
        $formationDeletedStudent->setType('notification');
        $formationDeletedStudent->setSubject('IMPORTANT: Annulation de la formation {{formationTitle}}');
        $formationDeletedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">Formation annulée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous informons que la formation suivante a été annulée:</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>Formation annulée:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{formationTitle}}</li>
                        <li>Date d\'annulation: {{deletedAt}}</li>
                        <li>Raison: {{reason}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>Formations alternatives:</strong></p>
                    <p>{{alternativeFormations}}</p>
                </div>
                <p>Notre équipe vous contactera pour vous proposer des solutions alternatives. Si vous avez des questions, contactez-nous.</p>
                <p>Nous nous excusons pour la gêne occasionnée.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $formationDeletedStudent->setVariables(['studentName', 'formationTitle', 'deletedAt', 'reason', 'alternativeFormations']);
        $manager->persist($formationDeletedStudent);

        // === SESSION TEMPLATES ===

        // Session Created - Students notification
        $sessionCreatedStudent = new EmailTemplate();
        $sessionCreatedStudent->setName('Nouvelle session disponible (Étudiant)');
        $sessionCreatedStudent->setIdentifier('session_created_student');
        $sessionCreatedStudent->setEventType('session_created');
        $sessionCreatedStudent->setTargetRole('ROLE_STUDENT');
        $sessionCreatedStudent->setIsSystem(true);
        $sessionCreatedStudent->setType('notification');
        $sessionCreatedStudent->setSubject('Nouvelle session disponible: {{formationTitle}}');
        $sessionCreatedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvelle session disponible</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Une nouvelle session est programmée pour une formation qui pourrait vous intéresser:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails de la session:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation: {{formationTitle}}</li>
                        <li>Date: {{sessionDate}}</li>
                        <li>Lieu: {{location}}</li>
                        <li>Places disponibles: {{availableSeats}}</li>
                        <li>Prix: {{price}}</li>
                    </ul>
                </div>
                <p>Inscrivez-vous rapidement, les places sont limitées!</p>
                <p><a href="http://merelformation.localhost/formations" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">S\'inscrire maintenant</a></p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $sessionCreatedStudent->setVariables(['studentName', 'formationTitle', 'sessionDate', 'location', 'availableSeats', 'price']);
        $manager->persist($sessionCreatedStudent);

        // Session Updated - Participants notification
        $sessionUpdatedStudent = new EmailTemplate();
        $sessionUpdatedStudent->setName('Session modifiée (Participant)');
        $sessionUpdatedStudent->setIdentifier('session_updated_participant');
        $sessionUpdatedStudent->setEventType('session_updated');
        $sessionUpdatedStudent->setTargetRole('ROLE_STUDENT');
        $sessionUpdatedStudent->setIsSystem(true);
        $sessionUpdatedStudent->setType('notification');
        $sessionUpdatedStudent->setSubject('IMPORTANT: Modification de votre session de formation');
        $sessionUpdatedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">Modification de session</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Des modifications ont été apportées à votre session de formation:</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>Session concernée:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation: {{formationTitle}}</li>
                        <li>Nouvelle date: {{newSessionDate}}</li>
                        <li>Nouveau lieu: {{newLocation}}</li>
                        <li>Modifications: {{changesDescription}}</li>
                    </ul>
                </div>
                <p>Merci de prendre note de ces changements. Si vous avez des questions ou des contraintes, contactez-nous rapidement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $sessionUpdatedStudent->setVariables(['studentName', 'formationTitle', 'newSessionDate', 'newLocation', 'changesDescription']);
        $manager->persist($sessionUpdatedStudent);

        // Session Cancelled - Participants notification
        $sessionCancelledStudent = new EmailTemplate();
        $sessionCancelledStudent->setName('Session annulée (Participant)');
        $sessionCancelledStudent->setIdentifier('session_cancelled_participant');
        $sessionCancelledStudent->setEventType('session_cancelled');
        $sessionCancelledStudent->setTargetRole('ROLE_STUDENT');
        $sessionCancelledStudent->setIsSystem(true);
        $sessionCancelledStudent->setType('notification');
        $sessionCancelledStudent->setSubject('URGENT: Annulation de votre session de formation');
        $sessionCancelledStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">Session annulée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous informons avec regret que votre session de formation a été annulée:</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>Session annulée:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation: {{formationTitle}}</li>
                        <li>Date prévue: {{originalSessionDate}}</li>
                        <li>Raison: {{reason}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>Reprogrammation:</strong></p>
                    <p>{{rescheduleInfo}}</p>
                </div>
                <p>Notre équipe vous contactera dans les plus brefs délais pour vous proposer une nouvelle date.</p>
                <p>Nous nous excusons sincèrement pour ce désagrément.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $sessionCancelledStudent->setVariables(['studentName', 'formationTitle', 'originalSessionDate', 'reason', 'rescheduleInfo']);
        $manager->persist($sessionCancelledStudent);

        // === USER TEMPLATES ===

        // User Welcome - New user
        $userWelcome = new EmailTemplate();
        $userWelcome->setName('Bienvenue sur MerelFormation');
        $userWelcome->setIdentifier('user_welcome');
        $userWelcome->setEventType('user_welcome');
        $userWelcome->setTargetRole('ROLE_STUDENT');
        $userWelcome->setIsSystem(true);
        $userWelcome->setType('notification');
        $userWelcome->setSubject('Bienvenue sur MerelFormation - Votre compte a été créé');
        $userWelcome->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Bienvenue sur MerelFormation!</h2>
                <p>Bonjour {{userName}},</p>
                <p>Votre compte a été créé avec succès. Voici vos informations de connexion:</p>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>Vos identifiants:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Email: {{userEmail}}</li>
                        <li>Mot de passe temporaire: {{temporaryPassword}}</li>
                        <li>Rôle: {{userRole}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>Important:</strong></p>
                    <p>Pour des raisons de sécurité, vous devez changer votre mot de passe lors de votre première connexion.</p>
                </div>
                <p><a href="http://merelformation.localhost/login" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Se connecter maintenant</a></p>
                <p>Si vous avez des questions, notre équipe est à votre disposition.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $userWelcome->setVariables(['userName', 'userEmail', 'temporaryPassword', 'userRole']);
        $manager->persist($userWelcome);

        // User Updated - User notification
        $userUpdated = new EmailTemplate();
        $userUpdated->setName('Modification de votre profil');
        $userUpdated->setIdentifier('user_updated');
        $userUpdated->setEventType('user_updated');
        $userUpdated->setTargetRole('ROLE_STUDENT');
        $userUpdated->setIsSystem(true);
        $userUpdated->setType('notification');
        $userUpdated->setSubject('Modification de votre profil MerelFormation');
        $userUpdated->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Modification de profil</h2>
                <p>Bonjour {{userName}},</p>
                <p>Votre profil MerelFormation a été modifié:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Modifications apportées:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>{{changesDescription}}</li>
                        <li>Date de modification: {{updatedAt}}</li>
                        <li>Modifié par: {{updatedBy}}</li>
                    </ul>
                </div>
                <p>Si vous n\'êtes pas à l\'origine de ces modifications, contactez-nous immédiatement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $userUpdated->setVariables(['userName', 'changesDescription', 'updatedAt', 'updatedBy']);
        $manager->persist($userUpdated);

        // User Deactivated - User notification
        $userDeactivated = new EmailTemplate();
        $userDeactivated->setName('Désactivation de votre compte');
        $userDeactivated->setIdentifier('user_deactivated');
        $userDeactivated->setEventType('user_deactivated');
        $userDeactivated->setTargetRole('ROLE_STUDENT');
        $userDeactivated->setIsSystem(true);
        $userDeactivated->setType('notification');
        $userDeactivated->setSubject('Désactivation de votre compte MerelFormation');
        $userDeactivated->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">Désactivation de compte</h2>
                <p>Bonjour {{userName}},</p>
                <p>Votre compte MerelFormation a été désactivé:</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>Détails:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Date de désactivation: {{deactivatedAt}}</li>
                        <li>Raison: {{reason}}</li>
                    </ul>
                </div>
                <p>Si vous pensez qu\'il s\'agit d\'une erreur ou souhaitez réactiver votre compte, contactez notre support.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $userDeactivated->setVariables(['userName', 'deactivatedAt', 'reason']);
        $manager->persist($userDeactivated);

        // === VEHICLE TEMPLATES ===

        // Vehicle Added - Admin notification
        $vehicleAdded = new EmailTemplate();
        $vehicleAdded->setName('Nouveau véhicule ajouté');
        $vehicleAdded->setIdentifier('vehicle_added_admin');
        $vehicleAdded->setEventType('vehicle_added');
        $vehicleAdded->setTargetRole('ROLE_ADMIN');
        $vehicleAdded->setIsSystem(true);
        $vehicleAdded->setType('notification');
        $vehicleAdded->setSubject('Nouveau véhicule ajouté au parc');
        $vehicleAdded->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouveau véhicule ajouté</h2>
                <p>Un nouveau véhicule a été ajouté au parc automobile:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails du véhicule:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Modèle: {{vehicleModel}}</li>
                        <li>Immatriculation: {{vehiclePlate}}</li>
                        <li>Type: {{vehicleType}}</li>
                        <li>Ajouté par: {{addedBy}}</li>
                        <li>Date d\'ajout: {{addedAt}}</li>
                    </ul>
                </div>
                <p>Le véhicule est maintenant disponible pour les réservations.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $vehicleAdded->setVariables(['vehicleModel', 'vehiclePlate', 'vehicleType', 'addedBy', 'addedAt']);
        $manager->persist($vehicleAdded);

        // Vehicle Maintenance - Clients notification
        $vehicleMaintenance = new EmailTemplate();
        $vehicleMaintenance->setName('Véhicule en maintenance');
        $vehicleMaintenance->setIdentifier('vehicle_maintenance_client');
        $vehicleMaintenance->setEventType('vehicle_maintenance');
        $vehicleMaintenance->setTargetRole('ROLE_STUDENT');
        $vehicleMaintenance->setIsSystem(true);
        $vehicleMaintenance->setType('notification');
        $vehicleMaintenance->setSubject('Véhicule indisponible - Solutions alternatives');
        $vehicleMaintenance->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">Véhicule temporairement indisponible</h2>
                <p>Bonjour {{clientName}},</p>
                <p>Le véhicule que vous aviez réservé est temporairement indisponible:</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>Véhicule concerné:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Modèle: {{vehicleModel}}</li>
                        <li>Votre réservation: {{reservationDate}}</li>
                        <li>Raison: {{maintenanceReason}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>Solutions alternatives:</strong></p>
                    <p>{{alternativeVehicles}}</p>
                </div>
                <p>Notre équipe vous contactera pour vous proposer une solution de remplacement.</p>
                <p>Nous nous excusons pour ce désagrément.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $vehicleMaintenance->setVariables(['clientName', 'vehicleModel', 'reservationDate', 'maintenanceReason', 'alternativeVehicles']);
        $manager->persist($vehicleMaintenance);

        // === DOCUMENT TEMPLATES ===

        // Document Added - Students notification
        $documentAdded = new EmailTemplate();
        $documentAdded->setName('Nouveau document disponible');
        $documentAdded->setIdentifier('document_added_student');
        $documentAdded->setEventType('document_added');
        $documentAdded->setTargetRole('ROLE_STUDENT');
        $documentAdded->setIsSystem(true);
        $documentAdded->setType('notification');
        $documentAdded->setSubject('Nouveau document disponible: {{documentTitle}}');
        $documentAdded->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouveau document disponible</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Un nouveau document a été ajouté à votre formation:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails du document:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{documentTitle}}</li>
                        <li>Formation: {{formationTitle}}</li>
                        <li>Type: {{documentType}}</li>
                        <li>Ajouté le: {{addedAt}}</li>
                    </ul>
                </div>
                <p>Vous pouvez télécharger ce document dans votre espace étudiant, section "Mes Documents".</p>
                <p><a href="http://merelformation.localhost/student/documents" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accéder aux documents</a></p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $documentAdded->setVariables(['studentName', 'documentTitle', 'formationTitle', 'documentType', 'addedAt']);
        $manager->persist($documentAdded);

        // === PAYMENT TEMPLATES ===

        // Payment Received - Client confirmation
        $paymentReceived = new EmailTemplate();
        $paymentReceived->setName('Confirmation de paiement');
        $paymentReceived->setIdentifier('payment_received_client');
        $paymentReceived->setEventType('payment_received');
        $paymentReceived->setTargetRole('ROLE_STUDENT');
        $paymentReceived->setIsSystem(true);
        $paymentReceived->setType('notification');
        $paymentReceived->setSubject('Confirmation de paiement - Facture {{invoiceNumber}}');
        $paymentReceived->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">Paiement confirmé</h2>
                <p>Bonjour {{clientName}},</p>
                <p>Nous confirmons la réception de votre paiement:</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>Détails du paiement:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant: {{amount}} €</li>
                        <li>Facture N°: {{invoiceNumber}}</li>
                        <li>Date de paiement: {{paymentDate}}</li>
                        <li>Mode de paiement: {{paymentMethod}}</li>
                    </ul>
                </div>
                <p>Votre facture est jointe à cet email. Vous pouvez également la retrouver dans votre espace client.</p>
                <p>Merci pour votre confiance.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $paymentReceived->setVariables(['clientName', 'amount', 'invoiceNumber', 'paymentDate', 'paymentMethod']);
        $manager->persist($paymentReceived);

        // Payment Due - Client reminder
        $paymentDue = new EmailTemplate();
        $paymentDue->setName('Rappel d\'échéance de paiement');
        $paymentDue->setIdentifier('payment_due_client');
        $paymentDue->setEventType('payment_due');
        $paymentDue->setTargetRole('ROLE_STUDENT');
        $paymentDue->setIsSystem(true);
        $paymentDue->setType('notification');
        $paymentDue->setSubject('Rappel: Échéance de paiement dans {{daysUntilDue}} jours');
        $paymentDue->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">Rappel d\'échéance</h2>
                <p>Bonjour {{clientName}},</p>
                <p>Nous vous rappelons qu\'un paiement arrive à échéance:</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>Détails du paiement:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant: {{amount}} €</li>
                        <li>Facture N°: {{invoiceNumber}}</li>
                        <li>Date d\'échéance: {{dueDate}}</li>
                        <li>Formation: {{formationTitle}}</li>
                    </ul>
                </div>
                <p>Merci de procéder au règlement avant la date d\'échéance pour éviter tout désagrément.</p>
                <p>Pour toute question sur votre facture, contactez-nous.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $paymentDue->setVariables(['clientName', 'amount', 'invoiceNumber', 'dueDate', 'formationTitle', 'daysUntilDue']);
        $manager->persist($paymentDue);

        // === CONTACT TEMPLATES ===

        // Contact Request - Admin notification
        $contactRequestAdmin = new EmailTemplate();
        $contactRequestAdmin->setName('Nouvelle demande de contact');
        $contactRequestAdmin->setIdentifier('contact_request_admin');
        $contactRequestAdmin->setEventType('contact_request');
        $contactRequestAdmin->setTargetRole('ROLE_ADMIN');
        $contactRequestAdmin->setIsSystem(true);
        $contactRequestAdmin->setType('notification');
        $contactRequestAdmin->setSubject('Nouvelle demande de contact de {{contactName}}');
        $contactRequestAdmin->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouvelle demande de contact</h2>
                <p>Une nouvelle demande de contact a été reçue via le site web:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Détails du contact:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Nom: {{contactName}}</li>
                        <li>Email: {{contactEmail}}</li>
                        <li>Téléphone: {{contactPhone}}</li>
                        <li>Sujet: {{contactSubject}}</li>
                    </ul>
                </div>
                <div style="background-color: #edf2f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Message:</strong></p>
                    <p style="font-style: italic;">{{contactMessage}}</p>
                </div>
                <p>Date de réception: {{receivedAt}}</p>
                <p>Merci de traiter cette demande dans les plus brefs délais.</p>
            </div>
        ');
        $contactRequestAdmin->setVariables(['contactName', 'contactEmail', 'contactPhone', 'contactSubject', 'contactMessage', 'receivedAt']);
        $manager->persist($contactRequestAdmin);

        // Contact Request - Client acknowledgment
        $contactRequestClient = new EmailTemplate();
        $contactRequestClient->setName('Accusé de réception de votre demande');
        $contactRequestClient->setIdentifier('contact_request_client');
        $contactRequestClient->setEventType('contact_request');
        $contactRequestClient->setTargetRole('ROLE_STUDENT');
        $contactRequestClient->setIsSystem(true);
        $contactRequestClient->setType('notification');
        $contactRequestClient->setSubject('Accusé de réception - Votre demande de contact');
        $contactRequestClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Accusé de réception</h2>
                <p>Bonjour {{contactName}},</p>
                <p>Nous avons bien reçu votre demande de contact et vous remercions de votre intérêt pour MerelFormation.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Récapitulatif de votre demande:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Sujet: {{contactSubject}}</li>
                        <li>Date: {{receivedAt}}</li>
                    </ul>
                </div>
                <p>Notre équipe va examiner votre demande et vous répondra dans les meilleurs délais, généralement sous 24-48 heures ouvrées.</p>
                <p>Si votre demande est urgente, vous pouvez nous contacter directement par téléphone au <strong>04 XX XX XX XX</strong>.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $contactRequestClient->setVariables(['contactName', 'contactSubject', 'receivedAt']);
        $manager->persist($contactRequestClient);

        // === DOCUMENTS TEMPLATES (GROUPÉS) ===

        // Documents Added - Student notification (multiple docs)
        $documentsAddedStudent = new EmailTemplate();
        $documentsAddedStudent->setName('Nouveaux documents ajoutés');
        $documentsAddedStudent->setIdentifier('documents_added_student');
        $documentsAddedStudent->setEventType('documents_added');
        $documentsAddedStudent->setTargetRole('ROLE_STUDENT');
        $documentsAddedStudent->setIsSystem(true);
        $documentsAddedStudent->setType('notification');
        $documentsAddedStudent->setSubject('{{documentCount}} nouveaux document(s) disponible(s)');
        $documentsAddedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Nouveaux documents disponibles</h2>
                <p>Bonjour {{studentName}},</p>
                <p>{{documentCount}} nouveau(x) document(s) a/ont été ajouté(s) à votre formation:</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Formation:</strong> {{formationTitle}}</p>
                    <p><strong>Session:</strong> {{sessionTitle}}</p>
                    <p><strong>Ajouté par:</strong> {{addedByName}}</p>
                    <p><strong>Date d\'ajout:</strong> {{addedAt}}</p>
                </div>

                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>Documents ajoutés:</strong></p>
                    <div style="padding-left: 20px;">
                        {{documentListHtml}}
                    </div>
                </div>

                <p>Vous pouvez accéder à ces documents depuis votre espace étudiant dans la section "Mes Documents".</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $documentsAddedStudent->setVariables(['studentName', 'documentCount', 'formationTitle', 'sessionTitle', 'addedByName', 'addedAt', 'documentListHtml']);
        $manager->persist($documentsAddedStudent);

        // Documents Added by Instructor - Admin notification
        $documentsAddedByInstructor = new EmailTemplate();
        $documentsAddedByInstructor->setName('Documents ajoutés par un formateur');
        $documentsAddedByInstructor->setIdentifier('documents_added_by_instructor_admin');
        $documentsAddedByInstructor->setEventType('documents_added_by_instructor');
        $documentsAddedByInstructor->setTargetRole('ROLE_ADMIN');
        $documentsAddedByInstructor->setIsSystem(true);
        $documentsAddedByInstructor->setType('notification');
        $documentsAddedByInstructor->setSubject('Documents ajoutés par {{instructorName}}');
        $documentsAddedByInstructor->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #2c5282;">Documents ajoutés par un formateur</h2>
                <p>Bonjour {{adminName}},</p>
                <p>Le formateur <strong>{{instructorName}}</strong> a ajouté {{documentCount}} document(s) à une formation:</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Formation:</strong> {{formationTitle}}</p>
                    <p><strong>Session:</strong> {{sessionTitle}}</p>
                    <p><strong>Ajouté le:</strong> {{addedAt}}</p>
                </div>

                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>Documents ajoutés:</strong></p>
                    <div style="padding-left: 20px;">
                        {{documentListHtml}}
                    </div>
                </div>

                <p><strong>Action requise:</strong> Veuillez vérifier et valider ces documents si nécessaire.</p>
                <p>Les étudiants ont été automatiquement notifiés de l\'ajout de ces documents.</p>
                <p>Cordialement,<br>Système MerelFormation</p>
            </div>
        ');
        $documentsAddedByInstructor->setVariables(['adminName', 'instructorName', 'documentCount', 'formationTitle', 'sessionTitle', 'addedAt', 'documentListHtml']);
        $manager->persist($documentsAddedByInstructor);

        // === DOCUMENT VALIDATION TEMPLATES ===

        // Document Validated - Student notification
        $documentValidated = new EmailTemplate();
        $documentValidated->setName('Document d\'inscription validé');
        $documentValidated->setIdentifier('document_validated_student');
        $documentValidated->setEventType('document_validated');
        $documentValidated->setTargetRole('ROLE_STUDENT');
        $documentValidated->setIsSystem(true);
        $documentValidated->setType('notification');
        $documentValidated->setSubject('✅ Votre document d\'inscription a été validé');
        $documentValidated->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">✅ Document validé</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Excellente nouvelle! Votre document d\'inscription a été <strong>validé</strong> par notre équipe.</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>Document validé:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{documentTitle}}</li>
                        <li>Validé par: {{validatedBy}}</li>
                        <li>Date de validation: {{validatedDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>Prochaines étapes:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre dossier d\'inscription progresse normalement</li>
                        <li>Vous pouvez consulter le statut de vos documents dans votre espace personnel</li>
                        <li>Notre équipe vous tiendra informé des prochaines étapes</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{loginUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Accéder à mon espace
                    </a>
                </p>
                <p>Merci pour votre confiance et votre patience.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $documentValidated->setVariables(['studentName', 'documentTitle', 'validatedBy', 'validatedDate', 'loginUrl']);
        $manager->persist($documentValidated);

        // Document Rejected - Student notification
        $documentRejected = new EmailTemplate();
        $documentRejected->setName('Document d\'inscription rejeté');
        $documentRejected->setIdentifier('document_rejected_student');
        $documentRejected->setEventType('document_rejected');
        $documentRejected->setTargetRole('ROLE_STUDENT');
        $documentRejected->setIsSystem(true);
        $documentRejected->setType('notification');
        $documentRejected->setSubject('❌ Action requise: Document d\'inscription à corriger');
        $documentRejected->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">❌ Document à corriger</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons examiné votre document d\'inscription et nous devons vous demander de le corriger.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>Document concerné:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Titre: {{documentTitle}}</li>
                        <li>Examiné par: {{rejectedBy}}</li>
                        <li>Date d\'examen: {{rejectedDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>⚠️ Raison du rejet:</strong></p>
                    <p style="font-style: italic; color: #744210;">{{rejectionReason}}</p>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📋 Actions à effectuer:</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Corrigez votre document selon les indications ci-dessus</li>
                        <li>Connectez-vous à votre espace personnel pour télécharger un nouveau document</li>
                        <li>Notre équipe réexaminera votre document dans les plus brefs délais</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{loginUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Corriger mon document
                    </a>
                </p>
                <p>Si vous avez des questions concernant les corrections à apporter, n\'hésitez pas à nous contacter.</p>
                <p>Nous restons à votre disposition pour vous accompagner dans votre inscription.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $documentRejected->setVariables(['studentName', 'documentTitle', 'rejectedBy', 'rejectedDate', 'rejectionReason', 'loginUrl']);
        $manager->persist($documentRejected);

        $manager->flush();
    }
}