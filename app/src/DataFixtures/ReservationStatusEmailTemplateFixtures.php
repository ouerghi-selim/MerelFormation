<?php

namespace App\DataFixtures;

use App\Entity\EmailTemplate;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ReservationStatusEmailTemplateFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ===== PHASE 1: DEMANDE INITIALE =====

        // SUBMITTED - Demande soumise (Étudiant)
        $submittedStudent = new EmailTemplate();
        $submittedStudent->setName('Demande d\'inscription soumise (Étudiant)');
        $submittedStudent->setIdentifier('reservation_status_submitted_student');
        $submittedStudent->setEventType('reservation_status_change');
        $submittedStudent->setTargetRole('ROLE_STUDENT');
        $submittedStudent->setIsSystem(true);
        $submittedStudent->setType('notification');
        $submittedStudent->setSubject('✅ Votre demande d\'inscription a été soumise');
        $submittedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #3182ce;">✅ Demande soumise avec succès</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre demande d\'inscription a été soumise avec succès !</p>
                <div style="background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;">
                    <p><strong>Détails de votre demande :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation : {{formationTitle}}</li>
                        <li>Date de session : {{sessionDate}}</li>
                        <li>Numéro de demande : {{reservationId}}</li>
                        <li>Date de soumission : {{submissionDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>📋 Prochaines étapes :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre demande va être examinée par notre équipe</li>
                        <li>Vous recevrez une notification à chaque étape</li>
                        <li>Délai de traitement initial : 24-48h ouvrées</li>
                    </ul>
                </div>
                <p>Merci pour votre confiance. Nous reviendrons vers vous très prochainement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $submittedStudent->setVariables(['studentName', 'formationTitle', 'sessionDate', 'reservationId', 'submissionDate']);
        $manager->persist($submittedStudent);

        // UNDER_REVIEW - En cours d'examen (Étudiant)
        $underReviewStudent = new EmailTemplate();
        $underReviewStudent->setName('Demande en cours d\'examen (Étudiant)');
        $underReviewStudent->setIdentifier('reservation_status_under_review_student');
        $underReviewStudent->setEventType('reservation_status_change');
        $underReviewStudent->setTargetRole('ROLE_STUDENT');
        $underReviewStudent->setIsSystem(true);
        $underReviewStudent->setType('notification');
        $underReviewStudent->setSubject('🔍 Votre demande est en cours d\'examen');
        $underReviewStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #3182ce;">🔍 Examen en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre demande d\'inscription pour <strong>{{formationTitle}}</strong> est maintenant <strong>en cours d\'examen</strong> par notre équipe pédagogique.</p>
                <div style="background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3182ce;">
                    <p><strong>📝 Ce que nous vérifions :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Conformité de votre profil avec la formation</li>
                        <li>Disponibilité des places</li>
                        <li>Prérequis nécessaires</li>
                        <li>Cohérence de votre demande</li>
                    </ul>
                </div>
                <p>Cette étape nous permet de vous proposer le meilleur accompagnement possible. Vous serez informé(e) du résultat dans les plus brefs délais.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $underReviewStudent->setVariables(['studentName', 'formationTitle', 'reservationId']);
        $manager->persist($underReviewStudent);

        // ===== PHASE 2: VÉRIFICATIONS ADMINISTRATIVES =====

        // AWAITING_DOCUMENTS - En attente de documents (Étudiant)
        $awaitingDocsStudent = new EmailTemplate();
        $awaitingDocsStudent->setName('En attente de documents (Étudiant)');
        $awaitingDocsStudent->setIdentifier('reservation_status_awaiting_documents_student');
        $awaitingDocsStudent->setEventType('reservation_status_change');
        $awaitingDocsStudent->setTargetRole('ROLE_STUDENT');
        $awaitingDocsStudent->setIsSystem(true);
        $awaitingDocsStudent->setType('notification');
        $awaitingDocsStudent->setSubject('📄 Documents requis pour votre inscription');
        $awaitingDocsStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #ed8936;">📄 Documents requis</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Pour finaliser votre inscription à <strong>{{formationTitle}}</strong>, nous avons besoin de documents complémentaires.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;">
                    <p><strong>📋 Documents à fournir :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Pièce d\'identité (recto-verso)</li>
                        <li>Justificatif de domicile de moins de 3 mois</li>
                        <li>{{specificDocuments}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💡 Comment procéder :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Connectez-vous à votre espace personnel</li>
                        <li>Rendez-vous dans la section "Mes Documents"</li>
                        <li>Téléchargez vos documents au format PDF ou JPG</li>
                        <li>Cliquez sur "Soumettre" une fois terminé</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{studentPortalUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Télécharger mes documents
                    </a>
                </p>
                <p>Dès réception de vos documents, nous procéderons à leur validation dans les 24-48h ouvrées.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingDocsStudent->setVariables(['studentName', 'formationTitle', 'specificDocuments', 'studentPortalUrl']);
        $manager->persist($awaitingDocsStudent);

        // DOCUMENTS_PENDING - Documents en cours de validation (Étudiant)
        $docsPendingStudent = new EmailTemplate();
        $docsPendingStudent->setName('Documents en cours de validation (Étudiant)');
        $docsPendingStudent->setIdentifier('reservation_status_documents_pending_student');
        $docsPendingStudent->setEventType('reservation_status_change');
        $docsPendingStudent->setTargetRole('ROLE_STUDENT');
        $docsPendingStudent->setIsSystem(true);
        $docsPendingStudent->setType('notification');
        $docsPendingStudent->setSubject('⏳ Vos documents sont en cours de validation');
        $docsPendingStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #ed8936;">⏳ Validation en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Merci d\'avoir transmis vos documents ! Notre équipe administrative procède actuellement à leur validation.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;">
                    <p><strong>📋 Documents reçus :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Date de réception : {{documentsReceivedDate}}</li>
                        <li>Nombre de documents : {{documentCount}}</li>
                        <li>Statut : En cours de vérification</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>⏱️ Délais de traitement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Validation administrative : 24-48h ouvrées</li>
                        <li>Vous serez informé(e) du résultat par email</li>
                        <li>En cas de document manquant, nous vous le signalerons</li>
                    </ul>
                </div>
                <p>Merci pour votre patience. Nous mettons tout en œuvre pour traiter votre dossier rapidement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $docsPendingStudent->setVariables(['studentName', 'documentsReceivedDate', 'documentCount']);
        $manager->persist($docsPendingStudent);

        // DOCUMENTS_REJECTED - Documents refusés (Étudiant)
        $docsRejectedStudent = new EmailTemplate();
        $docsRejectedStudent->setName('Documents refusés (Étudiant)');
        $docsRejectedStudent->setIdentifier('reservation_status_documents_rejected_student');
        $docsRejectedStudent->setEventType('reservation_status_change');
        $docsRejectedStudent->setTargetRole('ROLE_STUDENT');
        $docsRejectedStudent->setIsSystem(true);
        $docsRejectedStudent->setType('notification');
        $docsRejectedStudent->setSubject('❌ Action requise : Documents à corriger');
        $docsRejectedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">❌ Documents à corriger</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Après examen de vos documents, nous devons vous demander de les corriger ou de les compléter.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>❗ Problèmes identifiés :</strong></p>
                    <div style="padding-left: 20px; color: #744210;">
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
                    <a href="{{studentPortalUrl}}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Corriger mes documents
                    </a>
                </p>
                <p>N\'hésitez pas à nous contacter si vous avez besoin d\'aide pour corriger vos documents.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $docsRejectedStudent->setVariables(['studentName', 'rejectionReason', 'studentPortalUrl']);
        $manager->persist($docsRejectedStudent);

        // AWAITING_PREREQUISITES - En attente de prérequis (Étudiant)
        $awaitingPrereqStudent = new EmailTemplate();
        $awaitingPrereqStudent->setName('En attente de prérequis (Étudiant)');
        $awaitingPrereqStudent->setIdentifier('reservation_status_awaiting_prerequisites_student');
        $awaitingPrereqStudent->setEventType('reservation_status_change');
        $awaitingPrereqStudent->setTargetRole('ROLE_STUDENT');
        $awaitingPrereqStudent->setIsSystem(true);
        $awaitingPrereqStudent->setType('notification');
        $awaitingPrereqStudent->setSubject('📚 Prérequis manquants pour votre formation');
        $awaitingPrereqStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #ed8936;">📚 Prérequis requis</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Pour accéder à la formation <strong>{{formationTitle}}</strong>, vous devez valider certains prérequis.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ed8936;">
                    <p><strong>📋 Prérequis manquants :</strong></p>
                    <div style="padding-left: 20px;">
                        {{missingPrerequisites}}
                    </div>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💡 Comment procéder :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Consultez les formations préalables proposées</li>
                        <li>Inscrivez-vous aux modules manquants</li>
                        <li>Fournissez des justificatifs de formations antérieures</li>
                        <li>Contactez notre équipe pour un entretien pédagogique</li>
                    </ul>
                </div>
                <p>Notre équipe pédagogique peut vous accompagner pour définir le parcours optimal selon votre profil.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingPrereqStudent->setVariables(['studentName', 'formationTitle', 'missingPrerequisites']);
        $manager->persist($awaitingPrereqStudent);

        // ===== PHASE 3: VALIDATION FINANCIÈRE =====

        // AWAITING_FUNDING - En attente de financement (Étudiant)
        $awaitingFundingStudent = new EmailTemplate();
        $awaitingFundingStudent->setName('En attente de financement (Étudiant)');
        $awaitingFundingStudent->setIdentifier('reservation_status_awaiting_funding_student');
        $awaitingFundingStudent->setEventType('reservation_status_change');
        $awaitingFundingStudent->setTargetRole('ROLE_STUDENT');
        $awaitingFundingStudent->setIsSystem(true);
        $awaitingFundingStudent->setType('notification');
        $awaitingFundingStudent->setSubject('💰 Options de financement pour votre formation');
        $awaitingFundingStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">💰 Financement de votre formation</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre dossier administratif est validé ! Il ne reste plus qu\'à finaliser le financement de votre formation <strong>{{formationTitle}}</strong>.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>💳 Coût de la formation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant total : {{totalAmount}} €</li>
                        <li>Formation : {{formationTitle}}</li>
                        <li>Durée : {{duration}} heures</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🏦 Options de financement disponibles :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Pôle Emploi (AIF, CPF)</li>
                        <li>OPCO (plan de formation entreprise)</li>
                        <li>Financement personnel</li>
                        <li>Facilités de paiement (3x sans frais)</li>
                    </ul>
                </div>
                <p>Notre équipe commerciale vous contactera sous 24h pour vous accompagner dans le montage de votre dossier de financement.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingFundingStudent->setVariables(['studentName', 'formationTitle', 'totalAmount', 'duration']);
        $manager->persist($awaitingFundingStudent);

        // FUNDING_APPROVED - Financement approuvé (Étudiant)
        $fundingApprovedStudent = new EmailTemplate();
        $fundingApprovedStudent->setName('Financement approuvé (Étudiant)');
        $fundingApprovedStudent->setIdentifier('reservation_status_funding_approved_student');
        $fundingApprovedStudent->setEventType('reservation_status_change');
        $fundingApprovedStudent->setTargetRole('ROLE_STUDENT');
        $fundingApprovedStudent->setIsSystem(true);
        $fundingApprovedStudent->setType('notification');
        $fundingApprovedStudent->setSubject('✅ Financement approuvé !');
        $fundingApprovedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">✅ Financement approuvé !</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Excellente nouvelle ! Le financement de votre formation <strong>{{formationTitle}}</strong> a été approuvé.</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>✅ Financement validé :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Organisme : {{fundingOrganization}}</li>
                        <li>Montant pris en charge : {{approvedAmount}} €</li>
                        <li>Numéro de dossier : {{fundingFileNumber}}</li>
                        <li>Date d\'approbation : {{approvalDate}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📋 Prochaines étapes :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre place en formation est maintenant réservée</li>
                        <li>Nous finalisons votre inscription définitive</li>
                        <li>Vous recevrez sous peu votre convocation</li>
                    </ul>
                </div>
                <p>Félicitations ! Votre formation peut maintenant débuter selon le planning prévu.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $fundingApprovedStudent->setVariables(['studentName', 'formationTitle', 'fundingOrganization', 'approvedAmount', 'fundingFileNumber', 'approvalDate']);
        $manager->persist($fundingApprovedStudent);

        // AWAITING_PAYMENT - En attente de paiement (Étudiant)
        $awaitingPaymentStudent = new EmailTemplate();
        $awaitingPaymentStudent->setName('En attente de paiement (Étudiant)');
        $awaitingPaymentStudent->setIdentifier('reservation_status_awaiting_payment_student');
        $awaitingPaymentStudent->setEventType('reservation_status_change');
        $awaitingPaymentStudent->setTargetRole('ROLE_STUDENT');
        $awaitingPaymentStudent->setIsSystem(true);
        $awaitingPaymentStudent->setType('notification');
        $awaitingPaymentStudent->setSubject('💳 Finalisation du paiement requise');
        $awaitingPaymentStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">💳 Paiement en attente</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Pour finaliser votre inscription à <strong>{{formationTitle}}</strong>, le règlement de la formation est nécessaire.</p>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>💰 Détails du paiement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant à régler : {{amountDue}} €</li>
                        <li>Facture N° : {{invoiceNumber}}</li>
                        <li>Date limite : {{paymentDeadline}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>💳 Moyens de paiement acceptés :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Virement bancaire</li>
                        <li>Chèque (libellé à l\'ordre de MerelFormation)</li>
                        <li>Paiement en ligne sécurisé</li>
                        <li>Paiement en 3 fois sans frais (sur demande)</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{paymentUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Procéder au paiement
                    </a>
                </p>
                <p>Dès réception de votre paiement, votre inscription sera définitivement confirmée.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingPaymentStudent->setVariables(['studentName', 'formationTitle', 'amountDue', 'invoiceNumber', 'paymentDeadline', 'paymentUrl']);
        $manager->persist($awaitingPaymentStudent);

        // PAYMENT_PENDING - Paiement en cours (Étudiant)
        $paymentPendingStudent = new EmailTemplate();
        $paymentPendingStudent->setName('Paiement en cours (Étudiant)');
        $paymentPendingStudent->setIdentifier('reservation_status_payment_pending_student');
        $paymentPendingStudent->setEventType('reservation_status_change');
        $paymentPendingStudent->setTargetRole('ROLE_STUDENT');
        $paymentPendingStudent->setIsSystem(true);
        $paymentPendingStudent->setType('notification');
        $paymentPendingStudent->setSubject('⏳ Paiement en cours de traitement');
        $paymentPendingStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #d69e2e;">⏳ Paiement en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons bien reçu votre paiement pour la formation <strong>{{formationTitle}}</strong>. Il est actuellement en cours de traitement.</p>
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
                        <li>Confirmation d\'inscription : Automatique après validation</li>
                        <li>Envoi de la convocation : Dans les 48h suivant la confirmation</li>
                    </ul>
                </div>
                <p>Merci pour votre confiance. Vous recevrez une confirmation dès que le paiement sera validé.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $paymentPendingStudent->setVariables(['studentName', 'formationTitle', 'paidAmount', 'paymentMethod', 'paymentDate', 'paymentReference']);
        $manager->persist($paymentPendingStudent);

        $manager->flush();
    }
}