<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\DocumentRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[ORM\Entity(repositoryClass: DocumentRepository::class)]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['document:read']]),
        new GetCollection(normalizationContext: ['groups' => ['document:read']]),
        new Post(denormalizationContext: ['groups' => ['document:write']])
    ],
    order: ['uploadedAt' => 'DESC']
)]
#[Vich\Uploadable]
#[ORM\Table]
#[ORM\Index(columns: ['type', 'category'], name: 'document_type_category_idx')]
#[ORM\Index(columns: ['uploaded_at'], name: 'document_upload_idx')]
class Document
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['document:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 50)]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\Choice(choices: ['pdf', 'doc', 'docx'])]
    private ?string $type = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['document:read'])]
    private ?string $fileName = null;

    /**
     * @Vich\UploadableFile(
     *     mapping="session_documents",
     *     mimeTypes={
     *         "application/pdf",
     *         "application/msword",
     *         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
     *     },
     *     maxSize="100M"
     * )
     */
    #[Assert\NotNull]
    #[Vich\UploadableField(mapping: 'session_documents', fileNameProperty: 'fileName')]

    private ?File $file = null;

    #[ORM\Column(length: 50)]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\Choice(choices: ['support', 'contract', 'attestation', 'facture', 'direct'])]
    private ?string $category = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'uploaded_by', referencedColumnName: 'id')]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\NotNull]
    private ?User $uploadedBy = null;

    #[ORM\ManyToOne(targetEntity: Formation::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(name: 'formation_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?Formation $formation = null;

    #[ORM\ManyToOne(targetEntity: Reservation::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?Reservation $reservation = null;

    #[ORM\ManyToOne(targetEntity: VehicleRental::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?VehicleRental $vehicleRental = null;

    #[ORM\Column]
    #[Groups(['document:read', 'document:write'])]
    private ?bool $private = false;

    #[ORM\ManyToOne(targetEntity: Session::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(name: 'session_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?Session $session = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?User $user = null;

    #[ORM\Column]
    #[Groups(['document:read'])]
    private ?\DateTimeImmutable $uploadedAt = null;

    #[ORM\Column]
    #[Groups(['document:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 20)]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\Choice(choices: ['en_attente', 'valide', 'rejete'])]
    private ?string $validationStatus = 'en_attente';

    #[ORM\Column(nullable: true)]
    #[Groups(['document:read'])]
    private ?\DateTimeImmutable $validatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'validated_by', referencedColumnName: 'id', nullable: true)]
    #[Groups(['document:read'])]
    private ?User $validatedBy = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?string $rejectionReason = null;

    public function __construct()
    {
        $this->uploadedAt = new \DateTimeImmutable();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getFileName(): ?string
    {
        return $this->fileName;
    }

    public function setFileName(string $fileName): static
    {
        $this->fileName = $fileName;
        return $this;
    }

    public function getFile(): ?File
    {
        return $this->file;
    }

    public function setFile(?File $file = null): void
    {
        $this->file = $file;
        if (null !== $file) {
            $this->updatedAt = new \DateTimeImmutable();
        }
    }

    public function getUploadedBy(): ?User
    {
        return $this->uploadedBy;
    }

    public function setUploadedBy(?User $uploadedBy): static
    {
        $this->uploadedBy = $uploadedBy;
        return $this;
    }

    public function getFormation(): ?Formation
    {
        return $this->formation;
    }

    public function setFormation(?Formation $formation): static
    {
        $this->formation = $formation;
        return $this;
    }

    public function isPrivate(): ?bool
    {
        return $this->private;
    }

    public function setPrivate(bool $private): static
    {
        $this->private = $private;
        return $this;
    }

    public function getUploadedAt(): ?\DateTimeImmutable
    {
        return $this->uploadedAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(?Reservation $reservation): self
    {
        $this->reservation = $reservation;
        return $this;
    }

    public function getVehicleRental(): ?VehicleRental
    {
        return $this->vehicleRental;
    }

    public function setVehicleRental(?VehicleRental $vehicleRental): self
    {
        $this->vehicleRental = $vehicleRental;
        return $this;
    }

    public function getSession(): ?Session
    {
        return $this->session;
    }

    public function setSession(?Session $session): static
    {
        $this->session = $session;
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

    public function getValidationStatus(): ?string
    {
        return $this->validationStatus;
    }

    public function setValidationStatus(?string $validationStatus): static
    {
        $this->validationStatus = $validationStatus;
        return $this;
    }

    public function getValidatedAt(): ?\DateTimeImmutable
    {
        return $this->validatedAt;
    }

    public function setValidatedAt(?\DateTimeImmutable $validatedAt): static
    {
        $this->validatedAt = $validatedAt;
        return $this;
    }

    public function getValidatedBy(): ?User
    {
        return $this->validatedBy;
    }

    public function setValidatedBy(?User $validatedBy): static
    {
        $this->validatedBy = $validatedBy;
        return $this;
    }

    public function getRejectionReason(): ?string
    {
        return $this->rejectionReason;
    }

    public function setRejectionReason(?string $rejectionReason): static
    {
        $this->rejectionReason = $rejectionReason;
        return $this;
    }
}
