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

        $manager->flush();
    }
}