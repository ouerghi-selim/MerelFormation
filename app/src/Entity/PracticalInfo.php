<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ORM\Table]
class PracticalInfo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['practical_info:read', 'formation:item:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Formation::class, inversedBy: 'practicalInfos')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['practical_info:read', 'practical_info:write'])]
    private ?Formation $formation = null;

    #[ORM\Column(length: 255)]
    #[Groups(['practical_info:read', 'practical_info:write', 'formation:item:read'])]
    #[Assert\NotBlank(message: 'Le titre est requis')]
    #[Assert\Length(min: 3, max: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['practical_info:read', 'practical_info:write', 'formation:item:read'])]
    #[Assert\NotBlank(message: 'La description est requise')]
    #[Assert\Length(min: 10)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['practical_info:read', 'practical_info:write', 'formation:item:read'])]
    private ?string $image = null;

    #[ORM\Column]
    #[Groups(['practical_info:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['practical_info:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

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

    public function getFormation(): ?Formation
    {
        return $this->formation;
    }

    public function setFormation(?Formation $formation): static
    {
        $this->formation = $formation;
        return $this;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;
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