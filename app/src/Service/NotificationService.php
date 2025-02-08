
<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class NotificationService
{
    private $em;
    private $mailer;
    public function __construct(EntityManagerInterface $em, MailerInterface $mailer)
    {
        $this->em = $em;
        $this->mailer = $mailer;
    }

    public function sendNotification(array $data): bool
    {
        $notification = new Notification();
        $notification->setTitle($data['title']);
        $notification->setMessage($data['message']);
        $notification->setRecipient($this->em->getRepository(User::class)->find($data['recipient_id']));

        $this->em->persist($notification);
        $this->em->flush();

        $this->sendEmailNotification($notification);

        return true;
    }

    private function sendEmailNotification(Notification $notification)
    {
        $email = (new Email())
            ->from('no-reply@merelformation.com')
            ->to($notification->getRecipient()->getEmail())
            ->subject($notification->getTitle())
            ->text($notification->getMessage());

        $this->mailer->send($email);
    }
}
