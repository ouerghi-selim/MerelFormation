<?php

namespace App\DataFixtures;

use App\Entity\EmailTemplate;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class VehicleRentalEmailTemplateFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ===== PHASE 1: DEMANDE INITIALE =====

        // SUBMITTED - Demande soumise (Client)
        $submittedClient = new EmailTemplate();
        $submittedClient->setName('Demande de véhicule soumise (Client)');
        $submittedClient->setIdentifier('vehicle_rental_status_submitted_student');
        $submittedClient->setEventType('vehicle_rental_status_updated');
        $submittedClient->setTargetRole('ROLE_STUDENT');
        $submittedClient->setIsSystem(true);
        $submittedClient->setType('notification');
        $submittedClient->setSubject('✅ Votre demande de véhicule a été soumise');
        $submittedClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #3182ce;">🚗 Demande de véhicule soumise</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre demande de réservation véhicule a été soumise avec succès !</p>
                <div style="background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;">
                    <p><strong>Détails de votre demande :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Véhicule : {{vehicleModel}}</li>
                        <li>Centre d\'examen : {{examCenter}}</li>
                        <li>Dates : {{rentalDates}}</li>
                        <li>Numéro de demande : {{rentalId}}</li>
                        <li>Date de soumission : {{submissionDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>📋 Prochaines étapes :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre demande va être examinée par notre équipe</li>
                        <li>Nous vérifierons la disponibilité du véhicule</li>
                        <li>Vous recevrez une notification à chaque étape</li>
                        <li>Délai de traitement initial : 24-48h ouvrées</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{trackingUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Suivre ma demande
                    </a>
                </p>
                {{#if message}}<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;"><p><strong>📝 Message de notre équipe :</strong></p><p style="font-style: italic; color: #856404;">{{message}}</p></div>{{/if}}
                <p>Merci pour votre confiance. Nous reviendrons vers vous très prochainement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $submittedClient->setVariables(['studentName', 'vehicleModel', 'examCenter', 'rentalDates', 'rentalId', 'submissionDate', 'trackingUrl', 'message']);
        $manager->persist($submittedClient);

        // UNDER_REVIEW - En cours d'examen (Client)
        $underReviewClient = new EmailTemplate();
        $underReviewClient->setName('Demande véhicule en cours d\'examen (Client)');
        $underReviewClient->setIdentifier('vehicle_rental_status_under_review_student');
        $underReviewClient->setEventType('vehicle_rental_status_updated');
        $underReviewClient->setTargetRole('ROLE_STUDENT');
        $underReviewClient->setIsSystem(true);
        $underReviewClient->setType('notification');
        $underReviewClient->setSubject('🔍 Votre demande de véhicule est en cours d\'examen');
        $underReviewClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #3182ce;">🔍 Examen en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre demande de véhicule pour <strong>{{examCenter}}</strong> est maintenant <strong>en cours d\'examen</strong> par notre équipe.</p>
                <div style="background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;">
                    <p><strong>📝 Ce que nous vérifions :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Disponibilité du véhicule aux dates demandées</li>
                        <li>Compatibilité avec votre examen</li>
                        <li>Vérification de vos pièces d\'identité</li>
                        <li>Validation de votre dossier</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🚗 Détails de votre réservation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Véhicule demandé : {{vehicleModel}}</li>
                        <li>Centre d\'examen : {{examCenter}}</li>
                        <li>Période : {{rentalDates}}</li>
                    </ul>
                </div>
                <p>Cette étape nous permet de vous garantir le meilleur service. Vous serez informé(e) du résultat dans les plus brefs délais.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $underReviewClient->setVariables(['studentName', 'vehicleModel', 'examCenter', 'rentalDates', 'message']);
        $manager->persist($underReviewClient);

        // ===== PHASE 2: VÉRIFICATIONS ADMINISTRATIVES =====

        // AWAITING_DOCUMENTS - En attente de documents (Client)
        $awaitingDocsClient = new EmailTemplate();
        $awaitingDocsClient->setName('Véhicule - En attente de documents (Client)');
        $awaitingDocsClient->setIdentifier('vehicle_rental_status_awaiting_documents_student');
        $awaitingDocsClient->setEventType('vehicle_rental_status_updated');
        $awaitingDocsClient->setTargetRole('ROLE_STUDENT');
        $awaitingDocsClient->setIsSystem(true);
        $awaitingDocsClient->setType('notification');
        $awaitingDocsClient->setSubject('📄 Documents requis pour votre réservation véhicule');
        $awaitingDocsClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #ed8936;">📄 Documents requis</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Pour finaliser votre réservation véhicule pour <strong>{{examCenter}}</strong>, nous avons besoin de documents complémentaires.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;">
                    <p><strong>📋 Documents obligatoires :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Permis de conduire provisoire ou définitif (recto-verso)</li>
                        <li>Pièce d\'identité valide (recto-verso)</li>
                        <li>Convocation à l\'examen (si disponible)</li>
                        <li>Justificatif de domicile de moins de 3 mois</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💡 Comment procéder :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Scannez ou photographiez vos documents</li>
                        <li>Assurez-vous qu\'ils sont lisibles et complets</li>
                        <li>Formats acceptés : PDF, JPG, PNG</li>
                        <li>Taille maximum : 5 Mo par document</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{documentUploadUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Télécharger mes documents
                    </a>
                </p>
                <p>Dès réception de vos documents, nous procéderons à leur validation dans les 24-48h ouvrées.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingDocsClient->setVariables(['studentName', 'examCenter', 'documentUploadUrl', 'message']);
        $manager->persist($awaitingDocsClient);

        // DOCUMENTS_PENDING - Documents en cours de validation (Client)
        $docsPendingClient = new EmailTemplate();
        $docsPendingClient->setName('Véhicule - Documents en cours de validation (Client)');
        $docsPendingClient->setIdentifier('vehicle_rental_status_documents_pending_student');
        $docsPendingClient->setEventType('vehicle_rental_status_updated');
        $docsPendingClient->setTargetRole('ROLE_STUDENT');
        $docsPendingClient->setIsSystem(true);
        $docsPendingClient->setType('notification');
        $docsPendingClient->setSubject('⏳ Vos documents sont en cours de validation');
        $docsPendingClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #ed8936;">⏳ Validation en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Merci d\'avoir transmis vos documents ! Notre équipe procède actuellement à leur validation pour votre réservation véhicule.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;">
                    <p><strong>📋 Documents reçus :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Date de réception : {{documentsReceivedDate}}</li>
                        <li>Réservation : Véhicule pour {{examCenter}}</li>
                        <li>Statut : En cours de vérification</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>⏱️ Délais de traitement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Validation administrative : 24-48h ouvrées</li>
                        <li>Notification du résultat par email automatique</li>
                        <li>En cas de document non conforme, nous vous le signalerons</li>
                        <li>Après validation : Passage au devis personnalisé</li>
                    </ul>
                </div>
                <p>Merci pour votre patience. Nous mettons tout en œuvre pour traiter votre dossier rapidement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $docsPendingClient->setVariables(['studentName', 'examCenter', 'documentsReceivedDate', 'message']);
        $manager->persist($docsPendingClient);

        // DOCUMENTS_REJECTED - Documents refusés (Client)
        $docsRejectedClient = new EmailTemplate();
        $docsRejectedClient->setName('Véhicule - Documents refusés (Client)');
        $docsRejectedClient->setIdentifier('vehicle_rental_status_documents_rejected_student');
        $docsRejectedClient->setEventType('vehicle_rental_status_updated');
        $docsRejectedClient->setTargetRole('ROLE_STUDENT');
        $docsRejectedClient->setIsSystem(true);
        $docsRejectedClient->setType('notification');
        $docsRejectedClient->setSubject('❌ Action requise : Documents à corriger');
        $docsRejectedClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">❌ Documents à corriger</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Après examen de vos documents pour la réservation véhicule, nous devons vous demander de les corriger ou de les compléter.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>❗ Problèmes identifiés :</strong></p>
                    <div style="padding-left: 20px; color: #744210; font-style: italic;">
                        {{rejectionReason}}
                    </div>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🔧 Actions à effectuer :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Corrigez les documents selon les indications ci-dessus</li>
                        <li>Assurez-vous que les documents sont lisibles et complets</li>
                        <li>Téléchargez à nouveau vos documents corrigés</li>
                        <li>Notre équipe réexaminera votre dossier sous 24h</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{documentUploadUrl}}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Corriger mes documents
                    </a>
                </p>
                <p>N\'hésitez pas à nous contacter si vous avez besoin d\'aide pour corriger vos documents.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $docsRejectedClient->setVariables(['studentName', 'rejectionReason', 'documentUploadUrl', 'message']);
        $manager->persist($docsRejectedClient);

        // ===== PHASE 3: VALIDATION FINANCIÈRE =====

        // AWAITING_PAYMENT - En attente de paiement (Client)
        $awaitingPaymentClient = new EmailTemplate();
        $awaitingPaymentClient->setName('Véhicule - En attente de paiement (Client)');
        $awaitingPaymentClient->setIdentifier('vehicle_rental_status_awaiting_payment_student');
        $awaitingPaymentClient->setEventType('vehicle_rental_status_updated');
        $awaitingPaymentClient->setTargetRole('ROLE_STUDENT');
        $awaitingPaymentClient->setIsSystem(true);
        $awaitingPaymentClient->setType('notification');
        $awaitingPaymentClient->setSubject('💳 Devis personnalisé - Paiement requis');
        $awaitingPaymentClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">💳 Devis personnalisé</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre dossier a été validé ! Voici votre devis personnalisé pour la réservation véhicule.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>🚗 Détails de votre réservation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Véhicule : {{vehicleModel}}</li>
                        <li>Centre d\'examen : {{examCenter}}</li>
                        <li>Dates : {{rentalDates}}</li>
                        <li>Lieu de prise en charge : {{pickupLocation}}</li>
                    </ul>
                </div>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>💰 Tarification :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Prix de base : {{basePrice}} €</li>
                        <li>Options supplémentaires : {{optionsPrice}} €</li>
                        <li><strong>Total à régler : {{totalPrice}} €</strong></li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💳 Moyens de paiement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Paiement en ligne sécurisé (CB, PayPal)</li>
                        <li>Virement bancaire</li>
                        <li>Chèque (ordre : MerelFormation)</li>
                        <li>Paiement comptant à l\'agence</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{paymentUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Procéder au paiement
                    </a>
                </p>
                <p>Dès réception de votre paiement, votre véhicule sera définitivement réservé.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingPaymentClient->setVariables(['studentName', 'vehicleModel', 'examCenter', 'rentalDates', 'pickupLocation', 'basePrice', 'optionsPrice', 'totalPrice', 'paymentUrl', 'message']);
        $manager->persist($awaitingPaymentClient);

        // PAYMENT_PENDING - Paiement en cours (Client)
        $paymentPendingClient = new EmailTemplate();
        $paymentPendingClient->setName('Véhicule - Paiement en cours (Client)');
        $paymentPendingClient->setIdentifier('vehicle_rental_status_payment_pending_student');
        $paymentPendingClient->setEventType('vehicle_rental_status_updated');
        $paymentPendingClient->setTargetRole('ROLE_STUDENT');
        $paymentPendingClient->setIsSystem(true);
        $paymentPendingClient->setType('notification');
        $paymentPendingClient->setSubject('⏳ Paiement en cours de traitement');
        $paymentPendingClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">⏳ Paiement en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons bien reçu votre paiement pour la réservation véhicule. Il est actuellement en cours de traitement.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>📋 Informations du paiement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant : {{paidAmount}} €</li>
                        <li>Mode de paiement : {{paymentMethod}}</li>
                        <li>Date de réception : {{paymentDate}}</li>
                        <li>Référence : {{paymentReference}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>⏱️ Délais de traitement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Validation du paiement : 24-48h ouvrées</li>
                        <li>Confirmation de réservation : Automatique après validation</li>
                        <li>Instructions de prise en charge : Dans les 48h</li>
                        <li>Contact véhicule : 24h avant votre examen</li>
                    </ul>
                </div>
                <p>Merci pour votre confiance. Vous recevrez une confirmation dès que le paiement sera validé.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $paymentPendingClient->setVariables(['studentName', 'paidAmount', 'paymentMethod', 'paymentDate', 'paymentReference', 'message']);
        $manager->persist($paymentPendingClient);

        // ===== PHASE 4: CONFIRMATION =====

        // CONFIRMED - Réservation confirmée (Client)
        $confirmedClient = new EmailTemplate();
        $confirmedClient->setName('Véhicule - Réservation confirmée (Client)');
        $confirmedClient->setIdentifier('vehicle_rental_status_confirmed_student');
        $confirmedClient->setEventType('vehicle_rental_status_updated');
        $confirmedClient->setTargetRole('ROLE_STUDENT');
        $confirmedClient->setIsSystem(true);
        $confirmedClient->setType('notification');
        $confirmedClient->setSubject('✅ Réservation véhicule confirmée !');
        $confirmedClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">✅ Réservation confirmée !</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Excellente nouvelle ! Votre réservation véhicule est maintenant <strong>confirmée</strong>.</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>🚗 Détails de votre réservation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Véhicule : {{vehicleModel}}</li>
                        <li>Immatriculation : {{vehiclePlate}}</li>
                        <li>Centre d\'examen : {{examCenter}}</li>
                        <li>Date d\'examen : {{examDate}}</li>
                        <li>Lieu de prise en charge : {{pickupLocation}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>⚠️ Informations importantes :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Présentez-vous 30 minutes avant l\'heure d\'examen</li>
                        <li>Apportez : pièce d\'identité + convocation + permis</li>
                        <li>Le véhicule sera nettoyé et vérifié avant remise</li>
                        <li>Respectez les consignes de conduite et de stationnement</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📞 Contact d\'urgence :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Numéro d\'urgence : {{emergencyPhone}}</li>
                        <li>Email : {{contactEmail}}</li>
                        <li>Vous serez contacté(e) 24h avant par notre équipe</li>
                    </ul>
                </div>
                <p>Nous vous souhaitons bonne chance pour votre examen !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $confirmedClient->setVariables(['studentName', 'vehicleModel', 'vehiclePlate', 'examCenter', 'examDate', 'pickupLocation', 'emergencyPhone', 'contactEmail', 'message']);
        $manager->persist($confirmedClient);

        // ===== PHASE 5: LOCATION EN COURS =====

        // IN_PROGRESS - Location en cours (Client)
        $inProgressClient = new EmailTemplate();
        $inProgressClient->setName('Véhicule - Location en cours (Client)');
        $inProgressClient->setIdentifier('vehicle_rental_status_in_progress_student');
        $inProgressClient->setEventType('vehicle_rental_status_updated');
        $inProgressClient->setTargetRole('ROLE_STUDENT');
        $inProgressClient->setIsSystem(true);
        $inProgressClient->setType('notification');
        $inProgressClient->setSubject('🚗 Votre location véhicule est active');
        $inProgressClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #6b46c1;">🚗 Location active</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre location véhicule est maintenant <strong>active</strong>. Bon examen !</p>
                <div style="background-color: #f3e8ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #6b46c1;">
                    <p><strong>🚗 Véhicule en cours d\'utilisation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Véhicule : {{vehicleModel}} ({{vehiclePlate}})</li>
                        <li>Pris en charge le : {{pickupDate}}</li>
                        <li>Lieu : {{pickupLocation}}</li>
                        <li>Retour prévu : {{returnDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>⚠️ Rappels importants :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Conduisez prudemment et respectez le code de la route</li>
                        <li>En cas de problème technique, contactez-nous immédiatement</li>
                        <li>Respectez l\'heure de retour convenue</li>
                        <li>Rendez le véhicule dans l\'état où vous l\'avez reçu</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📞 En cas d\'urgence :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Numéro d\'urgence : {{emergencyPhone}}</li>
                        <li>Disponible 24h/24 pour les urgences</li>
                    </ul>
                </div>
                <p>Nous vous souhaitons un excellent examen et une conduite en toute sécurité !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $inProgressClient->setVariables(['studentName', 'vehicleModel', 'vehiclePlate', 'pickupDate', 'pickupLocation', 'returnDate', 'emergencyPhone', 'message']);
        $manager->persist($inProgressClient);

        // ===== PHASE 6: FINALISATION =====

        // COMPLETED - Location terminée (Client)
        $completedClient = new EmailTemplate();
        $completedClient->setName('Véhicule - Location terminée (Client)');
        $completedClient->setIdentifier('vehicle_rental_status_completed_student');
        $completedClient->setEventType('vehicle_rental_status_updated');
        $completedClient->setTargetRole('ROLE_STUDENT');
        $completedClient->setIsSystem(true);
        $completedClient->setType('notification');
        $completedClient->setSubject('🎉 Location terminée - Merci pour votre confiance');
        $completedClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">🎉 Location terminée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre location véhicule s\'est terminée avec succès. Merci pour votre confiance !</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>📋 Récapitulatif de votre location :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Véhicule : {{vehicleModel}} ({{vehiclePlate}})</li>
                        <li>Période : {{rentalPeriod}}</li>
                        <li>Centre d\'examen : {{examCenter}}</li>
                        <li>Date de retour : {{returnDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💰 Facturation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre facture définitive vous sera envoyée sous 48h</li>
                        <li>Aucun frais supplémentaire constaté</li>
                        <li>Mode de paiement : {{paymentMethod}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>⭐ Votre avis nous intéresse :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Comment s\'est passée votre expérience ?</li>
                        <li>Avez-vous des suggestions d\'amélioration ?</li>
                        <li>Recommanderiez-vous nos services ?</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{feedbackUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Laisser un avis
                    </a>
                </p>
                <p>Nous espérons que votre examen s\'est bien déroulé et vous souhaitons une excellente route !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $completedClient->setVariables(['studentName', 'vehicleModel', 'vehiclePlate', 'rentalPeriod', 'examCenter', 'returnDate', 'paymentMethod', 'feedbackUrl', 'message']);
        $manager->persist($completedClient);

        // CANCELLED - Réservation annulée (Client)
        $cancelledClient = new EmailTemplate();
        $cancelledClient->setName('Véhicule - Réservation annulée (Client)');
        $cancelledClient->setIdentifier('vehicle_rental_status_cancelled_student');
        $cancelledClient->setEventType('vehicle_rental_status_updated');
        $cancelledClient->setTargetRole('ROLE_STUDENT');
        $cancelledClient->setIsSystem(true);
        $cancelledClient->setType('notification');
        $cancelledClient->setSubject('❌ Réservation véhicule annulée');
        $cancelledClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">❌ Réservation annulée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous informons que votre réservation véhicule a été annulée.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>📋 Détails de l\'annulation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Réservation : {{vehicleModel}} pour {{examCenter}}</li>
                        <li>Date d\'annulation : {{cancellationDate}}</li>
                        <li>Raison : {{cancellationReason}}</li>
                        <li>Annulée par : {{cancelledBy}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💰 Remboursement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Si un paiement a été effectué, le remboursement sera traité</li>
                        <li>Délai de remboursement : 3 à 5 jours ouvrés</li>
                        <li>Mode de remboursement : même moyen de paiement</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>🔄 Nouvelle réservation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Vous pouvez effectuer une nouvelle réservation à tout moment</li>
                        <li>{{alternativeVehicles}}</li>
                        <li>Notre équipe peut vous aider à trouver une solution</li>
                    </ul>
                </div>
                <p>Nous nous excusons pour la gêne occasionnée et restons à votre disposition pour toute question.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $cancelledClient->setVariables(['studentName', 'vehicleModel', 'examCenter', 'cancellationDate', 'cancellationReason', 'cancelledBy', 'alternativeVehicles', 'message']);
        $manager->persist($cancelledClient);

        // REFUNDED - Remboursement effectué (Client)
        $refundedClient = new EmailTemplate();
        $refundedClient->setName('Véhicule - Remboursement effectué (Client)');
        $refundedClient->setIdentifier('vehicle_rental_status_refunded_student');
        $refundedClient->setEventType('vehicle_rental_status_updated');
        $refundedClient->setTargetRole('ROLE_STUDENT');
        $refundedClient->setIsSystem(true);
        $refundedClient->setType('notification');
        $refundedClient->setSubject('💸 Remboursement effectué');
        $refundedClient->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #6b7280;">💸 Remboursement traité</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Le remboursement de votre réservation véhicule annulée a été traité avec succès.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #6b7280;">
                    <p><strong>💰 Détails du remboursement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant remboursé : {{refundAmount}} €</li>
                        <li>Date de traitement : {{refundDate}}</li>
                        <li>Mode de remboursement : {{refundMethod}}</li>
                        <li>Référence : {{refundReference}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>⏱️ Délais de réception :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Carte bancaire : 3 à 5 jours ouvrés</li>
                        <li>Virement : 1 à 3 jours ouvrés</li>
                        <li>Le remboursement apparaîtra sur votre relevé de compte</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>🔄 Nouvelle réservation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Vous pouvez effectuer une nouvelle réservation</li>
                        <li>Profitez de votre expérience pour choisir au mieux</li>
                        <li>Notre équipe reste disponible pour vous conseiller</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{newReservationUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Nouvelle réservation
                    </a>
                </p>
                <p>Nous espérons avoir l\'occasion de vous servir à nouveau prochainement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $refundedClient->setVariables(['studentName', 'refundAmount', 'refundDate', 'refundMethod', 'refundReference', 'newReservationUrl', 'message']);
        $manager->persist($refundedClient);

        $manager->flush();
    }
}