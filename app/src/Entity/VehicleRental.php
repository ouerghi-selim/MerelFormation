<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\VehicleRentalRepository;
use App\Enum\ReservationStatus;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\SoftDeleteable\Traits\SoftDeleteableEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: VehicleRentalRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[Gedmo\SoftDeleteable(fieldName: 'deletedAt', timeAware: false, hardDelete: true)]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['rental:read', 'rental:item:read']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['rental:read']]
        ),
        new Post(
            denormalizationContext: ['groups' => ['rental:write']],
            security: "is_granted('ROLE_STUDENT')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['rental:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ],
    order: ['startDate' => 'DESC']
)]
#[ORM\Table]
#[ORM\Index(columns: ['start_date', 'end_date'], name: 'rental_dates_idx')]
#[ORM\Index(columns: ['status'], name: 'rental_status_idx')]
class VehicleRental
{
    use SoftDeleteableEntity; // ✅ Trait Gedmo SoftDelete

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['rental:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'vehicleRentals')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\NotNull]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Vehicle::class, inversedBy: 'rentals')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?Vehicle $vehicle = null;

    #[ORM\Column]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $startDate = null;

    #[ORM\Column]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\NotNull]
    #[Assert\Expression(
        "this.getEndDate() > this.getStartDate()",
        message: "La date de fin doit être postérieure à la date de début"
    )]
    private ?\DateTimeImmutable $endDate = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\NotNull]
    #[Assert\Positive]
    private ?string $totalPrice = null;

    #[ORM\Column(length: 50)]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\Choice(callback: [ReservationStatus::class, 'getVehicleStatuses'])]
    private ?string $status = ReservationStatus::SUBMITTED;

    #[ORM\OneToOne(targetEntity: Invoice::class, mappedBy: 'vehicleRental', cascade: ['persist'])]
    #[Groups(['rental:item:read'])]
    private ?Invoice $invoice = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $notes = null;

    #[ORM\Column]
    #[Groups(['rental:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['rental:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 255)]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\NotBlank]
    private ?string $pickupLocation = null;

    #[ORM\Column(length: 255)]
    #[Groups(['rental:read', 'rental:write'])]
    #[Assert\NotBlank]
    private ?string $returnLocation = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $examCenter = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $formula = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $examTime = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $facturation = null;

    // Informations de paiement
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $financing = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['rental:read', 'rental:write'])]
    private ?string $paymentMethod = null;


    #[ORM\OneToMany(mappedBy: 'vehicleRental', targetEntity: Document::class, cascade: ['persist', 'remove'])]
    #[Groups(['rental:read', 'rental:item:read'])]
    private Collection $documents;

    #[ORM\Column(type: 'string', length: 64, unique: true,  nullable: true)]
    private ?string $trackingToken = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $adminNotes = null;
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->documents = new ArrayCollection();

    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue()
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    // Méthode pour calculer le nombre total de jours
    public function getTotalDays(): int
    {
        if (!$this->startDate || !$this->endDate) {
            return 0;
        }

        $interval = $this->startDate->diff($this->endDate);
        return (int) $interval->days;
    }

    // Méthode pour calculer le prix total
    public function calculateTotalPrice(): float
    {
        if (!$this->vehicle) {
            return 0;
        }

        return $this->vehicle->getDailyRate() * $this->getTotalDays();
    }

    #[ORM\PrePersist]
    public function calculatePriceOnPersist()
    {
        if ($this->totalPrice === null) {
            $this->totalPrice = $this->calculateTotalPrice();
        }
    }

    // Getters et setters
    public function getId(): ?int
    {
        return $this->id;
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

    public function getVehicle(): ?Vehicle
    {
        return $this->vehicle;
    }

    public function setVehicle(?Vehicle $vehicle): static
    {
        $this->vehicle = $vehicle;
        return $this;
    }

    public function getStartDate(): ?\DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeImmutable $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeImmutable $endDate): static
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getTotalPrice(): ?string
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(string  $totalPrice): static
    {
        $this->totalPrice = $totalPrice;
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

    public function getInvoice(): ?Invoice
    {
        return $this->invoice;
    }

    public function setInvoice(?Invoice $invoice): static
    {
        $this->invoice = $invoice;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
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

    public function getPickupLocation(): ?string
    {
        return $this->pickupLocation;
    }

    public function setPickupLocation(string $pickupLocation): static
    {
        $this->pickupLocation = $pickupLocation;
        return $this;
    }

    public function getReturnLocation(): ?string
    {
        return $this->returnLocation;
    }

    public function setReturnLocation(string $returnLocation): static
    {
        $this->returnLocation = $returnLocation;
        return $this;
    }
    public function getExamCenter(): ?string
    {
        return $this->examCenter;
    }

    public function setExamCenter(?string $examCenter): self
    {
        $this->examCenter = $examCenter;
        return $this;
    }

    public function getFormula(): ?string
    {
        return $this->formula;
    }

    public function setFormula(?string $formula): self
    {
        $this->formula = $formula;
        return $this;
    }

    public function getExamTime(): ?string
    {
        return $this->examTime;
    }

    public function setExamTime(?string $examTime): self
    {
        $this->examTime = $examTime;
        return $this;
    }

    public function getFacturation(): ?string
    {
        return $this->facturation;
    }

    public function setFacturation(?string $facturation): self
    {
        $this->facturation = $facturation;
        return $this;
    }

    public function getFinancing(): ?string
    {
        return $this->financing;
    }

    public function setFinancing(?string $financing): self
    {
        $this->financing = $financing;
        return $this;
    }

    public function getPaymentMethod(): ?string
    {
        return $this->paymentMethod;
    }

    public function setPaymentMethod(?string $paymentMethod): self
    {
        $this->paymentMethod = $paymentMethod;
        return $this;
    }

    /**
     * @return Collection<int, Document>
     */
    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function addDocument(Document $document): self
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
            $document->setVehicleRental($this);
        }

        return $this;
    }

    public function removeDocument(Document $document): self
    {
        if ($this->documents->removeElement($document)) {
            if ($document->getVehicleRental() === $this) {
                $document->setVehicleRental(null);
            }
        }

        return $this;
    }

    public function getAdminNotes(): ?string
    {
        return $this->adminNotes;
    }

    public function setAdminNotes(?string $adminNotes): void
    {
        $this->adminNotes = $adminNotes;
    }

    public function getTrackingToken(): ?string { return $this->trackingToken; }
    public function setTrackingToken(string $trackingToken): self { $this->trackingToken = $trackingToken; return $this; }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt)
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}