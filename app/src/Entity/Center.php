<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\CenterRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CenterRepository::class)]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['center:read']]),
        new GetCollection(normalizationContext: ['groups' => ['center:read']]),
        new Post(denormalizationContext: ['groups' => ['center:write']]),
        new Put(denormalizationContext: ['groups' => ['center:write']]),
        new Delete()
    ]
)]
class Center
{
    public const TYPE_FORMATION = 'formation';
    public const TYPE_EXAM = 'exam';
    public const TYPE_BOTH = 'both';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['center:read', 'session:read', 'formula:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['center:read', 'center:write', 'session:read', 'formula:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 100)]
    #[Groups(['center:read', 'center:write', 'session:read', 'formula:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 50)]
    #[Groups(['center:read', 'center:write', 'session:read'])]
    private ?string $type = self::TYPE_BOTH;

    #[ORM\Column(length: 255)]
    #[Groups(['center:read', 'center:write'])]
    private ?string $city = null;

    #[ORM\Column(length: 10)]
    #[Groups(['center:read', 'center:write'])]
    private ?string $departmentCode = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['center:read', 'center:write'])]
    private ?string $address = null;

    #[ORM\Column(length: 15, nullable: true)]
    #[Groups(['center:read', 'center:write'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['center:read', 'center:write'])]
    private ?string $email = null;

    #[ORM\Column]
    #[Groups(['center:read', 'center:write'])]
    private ?bool $isActive = true;

    #[ORM\Column]
    #[Groups(['center:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['center:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, Formula>
     */
    #[ORM\OneToMany(targetEntity: Formula::class, mappedBy: 'examCenter', orphanRemoval: true)]
    #[Groups(['center:read'])]
    private Collection $formulas;

    /**
     * @var Collection<int, Session>
     */
    #[ORM\OneToMany(targetEntity: Session::class, mappedBy: 'center')]
    private Collection $sessions;

    public function __construct()
    {
        $this->formulas = new ArrayCollection();
        $this->sessions = new ArrayCollection();
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

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;
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

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;
        return $this;
    }

    public function getDepartmentCode(): ?string
    {
        return $this->departmentCode;
    }

    public function setDepartmentCode(string $departmentCode): static
    {
        $this->departmentCode = $departmentCode;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;
        return $this;
    }

    #[Groups(['center:read', 'center:write'])]
    public function getIsActive(): ?bool
    {
        return $this->isActive;
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

    /**
     * @return Collection<int, Formula>
     */
    public function getFormulas(): Collection
    {
        return $this->formulas;
    }

    public function addFormula(Formula $formula): static
    {
        if (!$this->formulas->contains($formula)) {
            $this->formulas->add($formula);
            $formula->setExamCenter($this);
        }

        return $this;
    }

    public function removeFormula(Formula $formula): static
    {
        if ($this->formulas->removeElement($formula)) {
            if ($formula->getExamCenter() === $this) {
                $formula->setExamCenter(null);
            }
        }

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
            $session->setCenter($this);
        }

        return $this;
    }

    public function removeSession(Session $session): static
    {
        if ($this->sessions->removeElement($session)) {
            if ($session->getCenter() === $this) {
                $session->setCenter(null);
            }
        }

        return $this;
    }

    public function getFullAddress(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->departmentCode
        ]);
        
        return implode(', ', $parts);
    }

    public function getDisplayName(): string
    {
        return $this->name . ' - ' . $this->city;
    }

    public function canBeUsedForFormation(): bool
    {
        return $this->type === self::TYPE_FORMATION || $this->type === self::TYPE_BOTH;
    }

    public function canBeUsedForExam(): bool
    {
        return $this->type === self::TYPE_EXAM || $this->type === self::TYPE_BOTH;
    }

    public function __toString(): string
    {
        return $this->getDisplayName();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}