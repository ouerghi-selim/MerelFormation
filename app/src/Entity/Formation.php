<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\FormationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: FormationRepository::class)]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['formation:read', 'formation:item:read']]),
        new GetCollection(normalizationContext: ['groups' => ['formation:read']]),
        new Post(denormalizationContext: ['groups' => ['formation:write']]),
        new Put(denormalizationContext: ['groups' => ['formation:write']])
    ],
    order: ['createdAt' => 'DESC']
)]
class Formation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['formation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['formation:read', 'formation:write'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['formation:read', 'formation:write'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['formation:read', 'formation:write'])]
    private ?float $price = null;

    #[ORM\Column]
    #[Groups(['formation:read', 'formation:write'])]
    private ?int $duration = null; // Duration in hours

    #[ORM\Column(length: 50)]
    #[Groups(['formation:read', 'formation:write'])]
    private ?string $type = null; // initial, continuous, mobility

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['formation:read', 'formation:write'])]
    private ?string $prerequisites = null;

    #[ORM\Column]
    #[Groups(['formation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['formation:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column]
    #[Groups(['formation:read', 'formation:write'])]
    private ?bool $isActive = true;

    #[ORM\OneToMany(mappedBy: 'formation', targetEntity: Session::class, orphanRemoval: true)]
    #[Groups(['formation:item:read'])]
    private Collection $sessions;

    public function __construct()
    {
        $this->sessions = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue()
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;
        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;
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

    public function getPrerequisites(): ?string
    {
        return $this->prerequisites;
    }

    public function setPrerequisites(?string $prerequisites): static
    {
        $this->prerequisites = $prerequisites;
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

    public function isIsActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    /**
     * @return Collection<int, Session>
     */
    public function getSessions(): Collection
    {
        return $this->sessions;
    }

    public function addSession(Session $session): static
    {
        if (!$this->sessions->contains($session)) {
            $this->sessions->add($session);
            $session->setFormation($this);
        }

        return $this;
    }

    public function removeSession(Session $session): static
    {
        if ($this->sessions->removeElement($session)) {
            // set the owning side to null (unless already changed)
            if ($session->getFormation() === $this) {
                $session->setFormation(null);
            }
        }

        return $this;
    }
}