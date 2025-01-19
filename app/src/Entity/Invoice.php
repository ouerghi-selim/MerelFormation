<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\InvoiceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: InvoiceRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['invoice:read']]),
        new GetCollection(normalizationContext: ['groups' => ['invoice:read']]),
        new Post(denormalizationContext: ['groups' => ['invoice:write']]),
        new Put(denormalizationContext: ['groups' => ['invoice:write']])
    ],
    order: ['createdAt' => 'DESC']
)]
class Invoice
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['invoice:read'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 10, max: 255)]
    #[Assert\Regex(pattern: '/^INV-\d{4}-\d{6}$/', message: 'Le format du numéro de facture n\'est pas valide')]
    private ?string $invoiceNumber = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['invoice:read', 'invoice:write'])]
    #[Assert\NotNull]
    private ?User $user = null;

    #[ORM\Column]
    #[Groups(['invoice:read', 'invoice:write'])]
    #[Assert\NotBlank]
    #[Assert\Positive]
    private ?float $amount = null;

    #[ORM\Column(length: 50)]
    #[Groups(['invoice:read', 'invoice:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['pending', 'paid', 'cancelled'])]
    private ?string $status = 'pending';

    #[ORM\Column]
    #[Groups(['invoice:read', 'invoice:write'])]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $dueDate = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['invoice:read', 'invoice:write'])]
    private ?string $billingDetails = null;

    #[ORM\OneToOne(inversedBy: 'invoice')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['invoice:read', 'invoice:write'])]
    private ?Payment $payment = null;

    #[ORM\OneToOne(mappedBy: 'invoice', targetEntity: Reservation::class, cascade: ['persist'])]
    #[Groups(['invoice:read'])]
    private ?Reservation $reservation = null;

    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->dueDate = (new \DateTimeImmutable())->modify('+30 days');
    }

    #[ORM\PrePersist]
    public function prePersist(): void
    {
        if ($this->invoiceNumber === null) {
            $this->invoiceNumber = $this->generateInvoiceNumber();
        }
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    private function generateInvoiceNumber(): string
    {
        return sprintf(
            'INV-%s-%s',
            date('Y'),
            str_pad((string)rand(1, 999999), 6, '0', STR_PAD_LEFT)
        );
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInvoiceNumber(): ?string
    {
        return $this->invoiceNumber;
    }

    public function setInvoiceNumber(string $invoiceNumber): static
    {
        $this->invoiceNumber = $invoiceNumber;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getDueDate(): ?\DateTimeImmutable
    {
        return $this->dueDate;
    }

    public function setDueDate(\DateTimeImmutable $dueDate): static
    {
        $this->dueDate = $dueDate;
        return $this;
    }

    public function getBillingDetails(): ?string
    {
        return $this->billingDetails;
    }

    public function setBillingDetails(?string $billingDetails): static
    {
        $this->billingDetails = $billingDetails;
        return $this;
    }

    public function getPayment(): ?Payment
    {
        return $this->payment;
    }

    public function setPayment(Payment $payment): static
    {
        $this->payment = $payment;
        return $this;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(?Reservation $reservation): static
    {
        $this->reservation = $reservation;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
