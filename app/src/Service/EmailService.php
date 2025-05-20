<?php

namespace App\Service;

use App\Entity\EmailTemplate;
use App\Repository\EmailTemplateRepository;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

class EmailService
{
    private $mailer;
    private $emailTemplateRepository;

    public function __construct(
        MailerInterface $mailer,
        EmailTemplateRepository $emailTemplateRepository
    ) {
        $this->mailer = $mailer;
        $this->emailTemplateRepository = $emailTemplateRepository;
    }

    /**
     * Envoi d'email simple sans template
     */
    public function sendEmail(string $to, string $subject, string $content, array $options = []): void
    {
        $email = (new Email())
            ->from($options['from'] ?? 'no-reply@merelformation.com')
            ->to($to)
            ->subject($subject)
            ->text($content);

        if (isset($options['html']) && $options['html']) {
            $email->html($content);
        }

        $this->mailer->send($email);
    }

    /**
     * Envoi d'email en utilisant un template
     */
    public function sendTemplatedEmail(
        string $to,
        string $eventType,
        string $templateIdentifier,
        array $variables = [],
        array $options = []
    ): void {
        // Rechercher le template par son identifiant unique
        $template = $this->emailTemplateRepository->findOneBy([
            'eventType' => $eventType,
            'isSystem' => true
        ]);

        // Si pas de template spécifique au rôle, chercher un template générique pour cet événement
        if (!$template) {
            $template = $this->emailTemplateRepository->findOneBy([
                'eventType' => $eventType,
                'targetRole' => null,
                'isSystem' => true
            ]);
        }

        if (!$template) {
            throw new \Exception("Template d'email non trouvé: " . $templateIdentifier);
        }

        // Remplacer les variables dans le template
        $content = $this->replaceVariables($template->getContent(), $variables);
        $subject = $this->replaceVariables($template->getSubject(), $variables);

        // Créer l'email
        $email = (new Email())
            ->from($options['from'] ?? 'no-reply@merelformation.com')
            ->to($to)
            ->subject($subject)
            ->html($content);

        // Ajouter un texte alternatif (version sans HTML)
        if (isset($options['text']) && $options['text']) {
            $email->text($options['text']);
        } else {
            // Créer une version texte simple à partir du HTML
            $textContent = strip_tags($content);
            $email->text($textContent);
        }

        // Envoyer l'email
        $this->mailer->send($email);
    }

    /**
     * Envoi d'email en utilisant un template basé sur le type d'événement et le rôle
     */
    public function sendTemplatedEmailByEventAndRole(
        string $to,
        string $eventType,
        string $role,
        array $variables = [],
        array $options = []
    ): void {
        // Rechercher le template selon l'événement et le rôle
        $template = $this->emailTemplateRepository->findOneBy([
            'eventType' => $eventType,
            'targetRole' => $role,
            'isSystem' => true
        ]);

        // Si pas de template spécifique au rôle, chercher un template générique pour cet événement
        if (!$template) {
            $template = $this->emailTemplateRepository->findOneBy([
                'eventType' => $eventType,
                'targetRole' => null,
                'isSystem' => true
            ]);
        }

        if (!$template) {
            throw new \Exception("Template d'email non trouvé pour l'événement: $eventType et le rôle: $role");
        }

        // Le reste est similaire à la méthode sendTemplatedEmail
        $content = $this->replaceVariables($template->getContent(), $variables);
        $subject = $this->replaceVariables($template->getSubject(), $variables);

        $email = (new Email())
            ->from($options['from'] ?? 'no-reply@merelformation.com')
            ->to($to)
            ->subject($subject)
            ->html($content);

        if (isset($options['text']) && $options['text']) {
            $email->text($options['text']);
        } else {
            $textContent = strip_tags($content);
            $email->text($textContent);
        }

        $this->mailer->send($email);
    }

    /**
     * Remplace les variables dans un texte
     */
    private function replaceVariables(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace('{{' . $key . '}}', $value, $text);
        }

        return $text;
    }
}