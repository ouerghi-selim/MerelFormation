<?php

namespace App\DataFixtures;

use App\Entity\Payment;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class PaymentFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Création de quelques paiements
        $paymentData = [
            [
                'transactionId' => 'TRX-' . uniqid(),
                'amount' => 1800.00,
                'method' => 'card',
                'status' => 'completed',
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE),
            ],
            [
                'transactionId' => 'TRX-' . uniqid(),
                'amount' => 400.00,
                'method' => 'transfer',
                'status' => 'pending',
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE),
            ],
            [
                'transactionId' => 'TRX-' . uniqid(),
                'amount' => 300.00,
                'method' => 'cpf',
                'status' => 'completed',
                'user' => $this->getReference(UserFixtures::STUDENT_USER_REFERENCE),
            ],
        ];

        foreach ($paymentData as $data) {
            $payment = new Payment();
            $payment->setTransactionId($data['transactionId']);
            $payment->setAmount($data['amount']);
            $payment->setMethod($data['method']);
            $payment->setStatus($data['status']);
            $payment->setUser($data['user']);

            $manager->persist($payment);
            if ($data['status'] === 'completed') {
                $payment->setCompletedAt(new \DateTimeImmutable());
            }
        }

        $manager->flush();
    }

    public function getDependencies()
    {
        return [
            UserFixtures::class,
        ];
    }
}