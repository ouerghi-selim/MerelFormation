<?php

namespace App\Entity;

use App\Repository\FormulaRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: FormulaRepository::class)]
class Formula
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['formula:read', 'exam_center:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['formula:read', 'formula:write', 'exam_center:read'])]
    private ?string $name = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['formula:read', 'formula:write', 'exam_center:read'])]
    private ?string $description = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    #[Groups(['formula:read', 'formula:write', 'exam_center:read'])]
    private ?string $price = null;

    #[ORM\Column(length: 20)]
    #[Groups(['formula:read', 'formula:write', 'exam_center:read'])]
    private ?string $type = null; // 'simple', 'integral'

    #[ORM\Column]
    #[Groups(['formula:read', 'formula:write', 'exam_center:read'])]
    private ?bool $isActive = true;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['formula:read', 'formula:write'])]
    private ?string $additionalInfo = null;

    #[ORM\Column]
    #[Groups(['formula:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['formula:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'formulas')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['formula:read', 'formula:write'])]
    private ?Center $examCenter = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(?string $price): static
    {
        $this->price = $price;
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

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getAdditionalInfo(): ?string
    {
        return $this->additionalInfo;
    }

    public function setAdditionalInfo(?string $additionalInfo): static
    {
        $this->additionalInfo = $additionalInfo;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getExamCenter(): ?Center
    {
        return $this->examCenter;
    }

    public function setExamCenter(?Center $examCenter): static
    {
        $this->examCenter = $examCenter;
        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }

    /**
     * Génère le texte complet de la formule pour l'affichage
     */
    #[Groups(['formula:read', 'exam_center:read'])]
    public function getFullText(): string
    {
        $text = $this->examCenter?->getName() . ': ' . $this->name;
        
        if ($this->price) {
            $text .= ': (' . $this->price . '€ TTC)';
        } else {
            $text .= ': (nous consulter)';
        }
        
        $text .= ' ' . $this->description;
        
        return $text;
    }

    /**
     * Obtient le prix formaté
     */
    #[Groups(['formula:read', 'exam_center:read'])]
    public function getFormattedPrice(): string
    {
        if ($this->price) {
            return number_format((float)$this->price, 0, ',', ' ') . '€ TTC';
        }
        
        return 'nous consulter';
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}