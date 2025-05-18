<?php

namespace App\Service;

use App\Entity\EmailTemplate;
use App\Repository\EmailTemplateRepository;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class EmailService
{
    private $mailer;
    private $emailTemplateRepository;
    private $twig;

    public function __construct(
        MailerInterface $mailer,
        EmailTemplateRepository $emailTemplateRepository,
        Environment $twig
    ) {
        $this->mailer = $mailer;
        $this->emailTemplateRepository = $emailTemplateRepository;
        $this->twig = $twig;
    }

    /**
     * Envoyer un email simple
     */
    public function sendEmail(string $to, string $subject, string $content): void
    {
        $email = (new Email())
            ->from('no-reply@merelformation.com')
            ->to($to)
            ->subject($subject)
            ->text($content);

        $this->mailer->send($email);
    }

    /**
     * Envoyer un email en utilisant un template
     */
    public function sendTemplatedEmail(string $to, string $templateName, array $variables = []): void
    {
        $template = $this->emailTemplateRepository->findByName($templateName);

        if (!$template) {
            throw new \Exception("Template d'email non trouvé: " . $templateName);
        }

        // Remplacer les variables dans le template
        $content = $template->getContent();
        $subject = $template->getSubject();

        foreach ($variables as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
            $subject = str_replace('{{' . $key . '}}', $value, $subject);
        }

        $email = (new Email())
            ->from('no-reply@merelformation.com')
            ->to($to)
            ->subject($subject)
            ->html($content);

        $this->mailer->send($email);
    }
}