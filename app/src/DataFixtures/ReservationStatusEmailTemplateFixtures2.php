<?php

namespace App\DataFixtures;

use App\Entity\EmailTemplate;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ReservationStatusEmailTemplateFixtures2 extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ===== PHASE 4: CONFIRMATION =====

        // CONFIRMED - Inscription confirmée (Étudiant)
        $confirmedStudent = new EmailTemplate();
        $confirmedStudent->setName('Inscription confirmée (Étudiant)');
        $confirmedStudent->setIdentifier('reservation_status_confirmed_student');
        $confirmedStudent->setEventType('reservation_status_change');
        $confirmedStudent->setTargetRole('ROLE_STUDENT');
        $confirmedStudent->setIsSystem(true);
        $confirmedStudent->setType('notification');
        $confirmedStudent->setSubject('🎉 Inscription confirmée - {{formationTitle}}');
        $confirmedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">🎉 Inscription confirmée !</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Félicitations ! Votre inscription à la formation <strong>{{formationTitle}}</strong> est désormais <strong>confirmée</strong>.</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>✅ Détails de votre formation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation : {{formationTitle}}</li>
                        <li>Date de début : {{sessionStartDate}}</li>
                        <li>Durée : {{duration}} heures</li>
                        <li>Lieu : {{location}}</li>
                        <li>Formateur : {{instructorName}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📋 Informations importantes :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Votre convocation sera envoyée 7 jours avant le début</li>
                        <li>Consultez vos documents de formation dans votre espace personnel</li>
                        <li>En cas d\'empêchement, prévenez-nous au moins 48h à l\'avance</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{studentPortalUrl}}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Accéder à mon espace formation
                    </a>
                </p>
                <p>Nous avons hâte de vous accueillir et de vous accompagner dans votre parcours de formation !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $confirmedStudent->setVariables(['studentName', 'formationTitle', 'sessionStartDate', 'duration', 'location', 'instructorName', 'studentPortalUrl']);
        $manager->persist($confirmedStudent);

        // AWAITING_START - En attente du début (Étudiant)
        $awaitingStartStudent = new EmailTemplate();
        $awaitingStartStudent->setName('En attente du début (Étudiant)');
        $awaitingStartStudent->setIdentifier('reservation_status_awaiting_start_student');
        $awaitingStartStudent->setEventType('reservation_status_change');
        $awaitingStartStudent->setTargetRole('ROLE_STUDENT');
        $awaitingStartStudent->setIsSystem(true);
        $awaitingStartStudent->setType('notification');
        $awaitingStartStudent->setSubject('📅 Votre formation débute bientôt !');
        $awaitingStartStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">📅 Formation imminente</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre formation <strong>{{formationTitle}}</strong> débute dans quelques jours ! Tout est prêt pour votre arrivée.</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>📋 Rappel des informations pratiques :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Date de début : {{sessionStartDate}}</li>
                        <li>Heure d\'arrivée : {{startTime}}</li>
                        <li>Lieu : {{location}}</li>
                        <li>Salle : {{roomNumber}}</li>
                        <li>Formateur : {{instructorName}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🎒 À apporter le jour J :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Pièce d\'identité en cours de validité</li>
                        <li>Votre convocation imprimée</li>
                        <li>De quoi prendre des notes</li>
                        <li>{{specificRequirements}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>⏰ Planning de la première journée :</strong></p>
                    <p>{{firstDaySchedule}}</p>
                </div>
                <p>En cas de questions ou d\'empêchement de dernière minute, contactez-nous immédiatement au <strong>{{emergencyPhone}}</strong>.</p>
                <p>À très bientôt pour cette belle aventure de formation !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $awaitingStartStudent->setVariables(['studentName', 'formationTitle', 'sessionStartDate', 'startTime', 'location', 'roomNumber', 'instructorName', 'specificRequirements', 'firstDaySchedule', 'emergencyPhone']);
        $manager->persist($awaitingStartStudent);

        // ===== PHASE 5: FORMATION EN COURS =====

        // IN_PROGRESS - Formation en cours (Étudiant)
        $inProgressStudent = new EmailTemplate();
        $inProgressStudent->setName('Formation en cours (Étudiant)');
        $inProgressStudent->setIdentifier('reservation_status_in_progress_student');
        $inProgressStudent->setEventType('reservation_status_change');
        $inProgressStudent->setTargetRole('ROLE_STUDENT');
        $inProgressStudent->setIsSystem(true);
        $inProgressStudent->setType('notification');
        $inProgressStudent->setSubject('📚 Votre formation est en cours');
        $inProgressStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5a67d8;">📚 Formation en cours</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Votre formation <strong>{{formationTitle}}</strong> a officiellement commencé. Bienvenue dans votre parcours d\'apprentissage !</p>
                <div style="background-color: #ebf4ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #5a67d8;">
                    <p><strong>📈 Progression actuelle :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Heures effectuées : {{completedHours}} / {{totalHours}}</li>
                        <li>Modules validés : {{completedModules}} / {{totalModules}}</li>
                        <li>Prochaine session : {{nextSessionDate}}</li>
                        <li>Progression : {{progressPercentage}}%</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🎯 Rappels importants :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Assiduité obligatoire pour validation</li>
                        <li>Consultez régulièrement vos documents de cours</li>
                        <li>N\'hésitez pas à poser des questions à votre formateur</li>
                        <li>Prévenez en cas d\'absence prévue</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{studentPortalUrl}}" style="background-color: #5a67d8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Voir ma progression
                    </a>
                </p>
                <p>Continuez ainsi, vous êtes sur la bonne voie !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $inProgressStudent->setVariables(['studentName', 'formationTitle', 'completedHours', 'totalHours', 'completedModules', 'totalModules', 'nextSessionDate', 'progressPercentage', 'studentPortalUrl']);
        $manager->persist($inProgressStudent);

        // ATTENDANCE_ISSUES - Problèmes d\'assiduité (Étudiant)
        $attendanceIssuesStudent = new EmailTemplate();
        $attendanceIssuesStudent->setName('Problèmes d\'assiduité (Étudiant)');
        $attendanceIssuesStudent->setIdentifier('reservation_status_attendance_issues_student');
        $attendanceIssuesStudent->setEventType('reservation_status_change');
        $attendanceIssuesStudent->setTargetRole('ROLE_STUDENT');
        $attendanceIssuesStudent->setIsSystem(true);
        $attendanceIssuesStudent->setType('notification');
        $attendanceIssuesStudent->setSubject('⚠️ IMPORTANT: Problème d\'assiduité détecté');
        $attendanceIssuesStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">⚠️ Alerte assiduité</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons constaté un problème d\'assiduité concernant votre formation <strong>{{formationTitle}}</strong>.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>📊 Situation actuelle :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Absences non justifiées : {{unjustifiedAbsences}}</li>
                        <li>Retards cumulés : {{cumulatedDelays}}</li>
                        <li>Taux de présence : {{attendanceRate}}%</li>
                        <li>Seuil minimum requis : 80%</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>⚡ Actions urgentes requises :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Contactez immédiatement votre formateur</li>
                        <li>Fournissez les justificatifs d\'absence manquants</li>
                        <li>Rattrapez les sessions manquées si possible</li>
                        <li>Respectez impérativement les prochaines sessions</li>
                    </ul>
                </div>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>⚠️ Conséquences en cas de non-amélioration :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Suspension de la formation</li>
                        <li>Non-délivrance du certificat</li>
                        <li>Remboursement du financement à l\'organisme</li>
                    </ul>
                </div>
                <p><strong>Contactez-nous rapidement au {{urgentPhone}} pour résoudre cette situation.</strong></p>
                <p>Nous comptons sur votre réactivité.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $attendanceIssuesStudent->setVariables(['studentName', 'formationTitle', 'unjustifiedAbsences', 'cumulatedDelays', 'attendanceRate', 'urgentPhone']);
        $manager->persist($attendanceIssuesStudent);

        // SUSPENDED - Inscription suspendue (Étudiant)
        $suspendedStudent = new EmailTemplate();
        $suspendedStudent->setName('Inscription suspendue (Étudiant)');
        $suspendedStudent->setIdentifier('reservation_status_suspended_student');
        $suspendedStudent->setEventType('reservation_status_change');
        $suspendedStudent->setTargetRole('ROLE_STUDENT');
        $suspendedStudent->setIsSystem(true);
        $suspendedStudent->setType('notification');
        $suspendedStudent->setSubject('⛔ URGENT: Suspension de votre formation');
        $suspendedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">⛔ Formation suspendue</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous informons que votre formation <strong>{{formationTitle}}</strong> a été <strong>suspendue</strong>.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>📋 Détails de la suspension :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Date de suspension : {{suspensionDate}}</li>
                        <li>Raison : {{suspensionReason}}</li>
                        <li>Durée prévue : {{suspensionDuration}}</li>
                        <li>Décision prise par : {{suspendedBy}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>🔄 Conditions de reprise :</strong></p>
                    <div style="padding-left: 20px;">
                        {{resumptionConditions}}
                    </div>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📞 Contact obligatoire :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Appelez immédiatement le {{urgentPhone}}</li>
                        <li>Demandez un entretien avec votre responsable pédagogique</li>
                        <li>Prenez rendez-vous avant {{deadlineDate}}</li>
                    </ul>
                </div>
                <p><strong>Il est essentiel de nous contacter rapidement pour envisager une reprise de formation.</strong></p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $suspendedStudent->setVariables(['studentName', 'formationTitle', 'suspensionDate', 'suspensionReason', 'suspensionDuration', 'suspendedBy', 'resumptionConditions', 'urgentPhone', 'deadlineDate']);
        $manager->persist($suspendedStudent);

        // ===== PHASE 6: FINALISATION =====

        // COMPLETED - Formation terminée (Étudiant)
        $completedStudent = new EmailTemplate();
        $completedStudent->setName('Formation terminée (Étudiant)');
        $completedStudent->setIdentifier('reservation_status_completed_student');
        $completedStudent->setEventType('reservation_status_change');
        $completedStudent->setTargetRole('ROLE_STUDENT');
        $completedStudent->setIsSystem(true);
        $completedStudent->setType('notification');
        $completedStudent->setSubject('🎓 Félicitations ! Formation terminée avec succès');
        $completedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #38a169;">🎓 Félicitations !</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous avons le plaisir de vous informer que vous avez <strong>terminé avec succès</strong> la formation <strong>{{formationTitle}}</strong> !</p>
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38a169;">
                    <p><strong>🏆 Résultats de votre formation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Formation : {{formationTitle}}</li>
                        <li>Date de fin : {{completionDate}}</li>
                        <li>Durée totale : {{totalHours}} heures</li>
                        <li>Note finale : {{finalGrade}}/20</li>
                        <li>Taux de présence : {{finalAttendanceRate}}%</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>📜 Vos documents :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Certificat de formation : Disponible dans votre espace</li>
                        <li>Attestation de présence : Téléchargeable</li>
                        <li>Relevé de notes : Joint à ce message</li>
                        <li>Évaluation de satisfaction : À compléter</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{certificateDownloadUrl}}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">
                        Télécharger mon certificat
                    </a>
                    <a href="{{satisfactionSurveyUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Évaluer la formation
                    </a>
                </p>
                <p>Merci pour votre assiduité et votre engagement. Nous vous souhaitons beaucoup de succès dans la suite de votre parcours professionnel !</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $completedStudent->setVariables(['studentName', 'formationTitle', 'completionDate', 'totalHours', 'finalGrade', 'finalAttendanceRate', 'certificateDownloadUrl', 'satisfactionSurveyUrl']);
        $manager->persist($completedStudent);

        // FAILED - Échec de formation (Étudiant)
        $failedStudent = new EmailTemplate();
        $failedStudent->setName('Échec de formation (Étudiant)');
        $failedStudent->setIdentifier('reservation_status_failed_student');
        $failedStudent->setEventType('reservation_status_change');
        $failedStudent->setTargetRole('ROLE_STUDENT');
        $failedStudent->setIsSystem(true);
        $failedStudent->setType('notification');
        $failedStudent->setSubject('📋 Résultats de votre formation');
        $failedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">📋 Fin de formation</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous informons des résultats concernant votre formation <strong>{{formationTitle}}</strong>.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>📊 Résultats obtenus :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Note finale : {{finalGrade}}/20</li>
                        <li>Taux de présence : {{attendanceRate}}%</li>
                        <li>Modules validés : {{validatedModules}}/{{totalModules}}</li>
                        <li>Seuil de validation : {{passingGrade}}/20</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>📝 Raisons principales :</strong></p>
                    <div style="padding-left: 20px;">
                        {{failureReasons}}
                    </div>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🔄 Possibilités de rattrapage :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Sessions de rattrapage disponibles</li>
                        <li>Formation complémentaire ciblée</li>
                        <li>Accompagnement pédagogique renforcé</li>
                        <li>Nouvelle tentative dans {{retryDelay}} mois</li>
                    </ul>
                </div>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{{retryRegistrationUrl}}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Explorer les options de rattrapage
                    </a>
                </p>
                <p>Ne vous découragez pas ! Notre équipe pédagogique reste à votre disposition pour vous accompagner vers la réussite.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $failedStudent->setVariables(['studentName', 'formationTitle', 'finalGrade', 'attendanceRate', 'validatedModules', 'totalModules', 'passingGrade', 'failureReasons', 'retryDelay', 'retryRegistrationUrl']);
        $manager->persist($failedStudent);

        // CANCELLED - Inscription annulée (Étudiant)
        $cancelledStudent = new EmailTemplate();
        $cancelledStudent->setName('Inscription annulée (Étudiant)');
        $cancelledStudent->setIdentifier('reservation_status_cancelled_student');
        $cancelledStudent->setEventType('reservation_status_change');
        $cancelledStudent->setTargetRole('ROLE_STUDENT');
        $cancelledStudent->setIsSystem(true);
        $cancelledStudent->setType('notification');
        $cancelledStudent->setSubject('❌ Annulation de votre inscription');
        $cancelledStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #e53e3e;">❌ Inscription annulée</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous confirmons l\'annulation de votre inscription à la formation <strong>{{formationTitle}}</strong>.</p>
                <div style="background-color: #fed7d7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #e53e3e;">
                    <p><strong>📋 Détails de l\'annulation :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Date d\'annulation : {{cancellationDate}}</li>
                        <li>Raison : {{cancellationReason}}</li>
                        <li>Demandée par : {{cancelledBy}}</li>
                        <li>Numéro de dossier : {{reservationId}}</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>💰 Conditions financières :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>{{refundConditions}}</li>
                        <li>Délai de traitement : {{refundDelay}} jours ouvrés</li>
                        <li>Mode de remboursement : {{refundMethod}}</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>🔄 Formations alternatives :</strong></p>
                    <p>{{alternativeFormations}}</p>
                </div>
                <p>Nous regrettons cette annulation et espérons pouvoir vous accueillir prochainement pour une autre formation.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $cancelledStudent->setVariables(['studentName', 'formationTitle', 'cancellationDate', 'cancellationReason', 'cancelledBy', 'reservationId', 'refundConditions', 'refundDelay', 'refundMethod', 'alternativeFormations']);
        $manager->persist($cancelledStudent);

        // REFUNDED - Remboursement effectué (Étudiant)
        $refundedStudent = new EmailTemplate();
        $refundedStudent->setName('Remboursement effectué (Étudiant)');
        $refundedStudent->setIdentifier('reservation_status_refunded_student');
        $refundedStudent->setEventType('reservation_status_change');
        $refundedStudent->setTargetRole('ROLE_STUDENT');
        $refundedStudent->setIsSystem(true);
        $refundedStudent->setType('notification');
        $refundedStudent->setSubject('💰 Remboursement effectué');
        $refundedStudent->setContent('
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #718096;">💰 Remboursement effectué</h2>
                <p>Bonjour {{studentName}},</p>
                <p>Nous vous confirmons que le remboursement relatif à votre formation <strong>{{formationTitle}}</strong> a été effectué.</p>
                <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #718096;">
                    <p><strong>💸 Détails du remboursement :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Montant remboursé : {{refundAmount}} €</li>
                        <li>Date de traitement : {{refundDate}}</li>
                        <li>Mode de remboursement : {{refundMethod}}</li>
                        <li>Référence : {{refundReference}}</li>
                        <li>Délai de réception : {{receptionDelay}} jours ouvrés</li>
                    </ul>
                </div>
                <div style="background-color: #e6fffa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #38b2ac;">
                    <p><strong>ℹ️ Informations importantes :</strong></p>
                    <ul style="padding-left: 20px;">
                        <li>Le virement apparaîtra sur votre compte sous {{bankingDelay}} jours</li>
                        <li>Vous recevrez un justificatif par courrier</li>
                        <li>En cas de question, contactez notre service comptabilité</li>
                    </ul>
                </div>
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d69e2e;">
                    <p><strong>🎓 Toujours intéressé(e) par nos formations ?</strong></p>
                    <p>Consultez notre catalogue de formations. Nous serions ravis de vous accueillir à nouveau !</p>
                    <p style="text-align: center; margin: 10px 0;">
                        <a href="{{formationCatalogUrl}}" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Voir nos formations
                        </a>
                    </p>
                </div>
                <p>Merci pour votre compréhension.</p>
                <p>Cordialement,<br>L\'équipe MerelFormation</p>
            </div>
        ');
        $refundedStudent->setVariables(['studentName', 'formationTitle', 'refundAmount', 'refundDate', 'refundMethod', 'refundReference', 'receptionDelay', 'bankingDelay', 'formationCatalogUrl']);
        $manager->persist($refundedStudent);

        $manager->flush();
    }
}