<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\DocumentRepository;
use Doctrine\ORM\Mapping as ORM;
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

    #[ORM\Column(length: 255)]
    #[Groups(['document:read'])]
    private ?string $fileName = null;

    /**
     * @Vich\UploadableFile(
     *     mapping="document_files",
     *     mimeTypes={
     *         "application/pdf",
     *         "application/msword",
     *         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
     *     },
     *     maxSize="4M"
     * )
     */
    #[Assert\NotNull]
    private ?string $file = null;

    #[ORM\Column(length: 50)]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\Choice(choices: ['support', 'contrat', 'attestation', 'facture'])]
    private ?string $category = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'uploaded_by', referencedColumnName: 'id')]
    #[Groups(['document:read', 'document:write'])]
    #[Assert\NotNull]
    private ?User $uploadedBy = null;

    #[ORM\ManyToOne(targetEntity: Formation::class)]
    #[ORM\JoinColumn(name: 'formation_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['document:read', 'document:write'])]
    private ?Formation $formation = null;

    #[ORM\Column]
    #[Groups(['document:read', 'document:write'])]
    private ?bool $private = false;

    #[ORM\Column]
    #[Groups(['document:read'])]
    private ?\DateTimeImmutable $uploadedAt = null;

    #[ORM\Column]
    #[Groups(['document:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

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

    public function getFile(): ?string
    {
        return $this->file;
    }

    public function setFile(?string $file): static
    {
        $this->file = $file;
        if ($file) {
            $this->updatedAt = new \DateTimeImmutable();
        }
        return $this;
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
}
