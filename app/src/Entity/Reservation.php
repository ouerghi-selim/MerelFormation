<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ReservationRepository;
use App\Enum\ReservationStatus;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['reservation:read', 'reservation:item:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['reservation:read']]
        ),
        new Post(
            denormalizationContext: ['groups' => ['reservation:write']],
            security: "is_granted('ROLE_STUDENT')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['reservation:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ],
    order: ['createdAt' => 'DESC']
)]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['reservation:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'reservations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['reservation:read', 'reservation:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Session::class, inversedBy: 'reservations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Assert\NotNull]
    private ?Session $session = null;

    #[ORM\Column(length: 50)]
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Assert\Choice(callback: [ReservationStatus::class, 'getAllStatuses'])]
    private ?string $status = ReservationStatus::SUBMITTED;

    #[ORM\OneToOne(targetEntity: Payment::class, inversedBy: 'reservation', cascade: ['persist', 'remove'])]
    #[Groups(['reservation:item:read'])]
    private ?Payment $payment = null;

    #[ORM\OneToOne(targetEntity: Invoice::class, mappedBy: 'reservation', cascade: ['persist', 'remove'])]
    #[Groups(['reservation:item:read'])]
    private ?Invoice $invoice = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['reservation:read', 'reservation:write'])]
    private ?string $notes = null;

    #[ORM\Column]
    #[Groups(['reservation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['reservation:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['reservation:read'])]
    private ?\DateTimeInterface $archivedAt = null;

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    #[Groups(['reservation:read'])]
    private ?string $archiveReason = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }

    public function getSession(): ?Session
    {
        return $this->session;
    }

    public function setSession(?Session $session): void
    {
        $this->session = $session;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }

    public function getPayment(): ?Payment
    {
        return $this->payment;
    }

    public function setPayment(?Payment $payment): void
    {
        $this->payment = $payment;
    }

    public function getInvoice(): ?Invoice
    {
        return $this->invoice;
    }

    public function setInvoice(?Invoice $invoice): void
    {
        $this->invoice = $invoice;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getArchivedAt(): ?\DateTimeInterface
    {
        return $this->archivedAt;
    }

    public function setArchivedAt(?\DateTimeInterface $archivedAt): void
    {
        $this->archivedAt = $archivedAt;
    }

    public function getArchiveReason(): ?string
    {
        return $this->archiveReason;
    }

    public function setArchiveReason(?string $archiveReason): void
    {
        $this->archiveReason = $archiveReason;
    }

    public function isArchived(): bool
    {
        return $this->archivedAt !== null;
    }

}