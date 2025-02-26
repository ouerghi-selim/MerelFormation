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
#[ORM\Table]
#[ORM\Index(columns: ['title'], name: 'formation_title_idx')]
#[ORM\Index(columns: ['type'], name: 'formation_type_idx')]
class Formation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['formation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['formation:read', 'formation:write'])]
    #[Assert\NotBlank(message: 'Le titre est requis')]
    #[Assert\Length(min: 5, max: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['formation:read', 'formation:write'])]
    #[Assert\NotBlank(message: 'La description est requise')]
    #[Assert\Length(min: 20)]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['formation:read', 'formation:write'])]
    #[Assert\NotBlank]
    #[Assert\Positive]
    private ?float $price = null;

    #[ORM\Column]
    #[Groups(['formation:read', 'formation:write'])] 
    #[Assert\NotBlank]
    #[Assert\Positive]
    private ?int $duration = null; // Duration in hours

    #[ORM\Column(length: 50)]
    #[Groups(['formation:read', 'formation:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['initial', 'continuous', 'mobility'])]
    private ?string $type = null; // initial, continuous, mobility

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'formations')]
    private ?Category $category = null;

    #[ORM\OneToMany(mappedBy: 'formation', targetEntity: Document::class)]
    private Collection $documents;

    #[ORM\OneToMany(mappedBy: 'formation', targetEntity: Media::class)]
    private Collection $media;

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

    #[ORM\OneToMany(mappedBy: 'formation', targetEntity: Module::class, cascade: ['persist', 'remove'])]
    #[Groups(['formation:item:read'])]
    private Collection $modules;

    #[ORM\OneToMany(mappedBy: 'formation', targetEntity: Prerequisite::class, cascade: ['persist', 'remove'])]
    #[Groups(['formation:item:read'])]
    private Collection $prerequisites;
    public function __construct()
    {
        $this->sessions = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->modules = new ArrayCollection();
        $this->prerequisites = new ArrayCollection();
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

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): void
    {
        $this->category = $category;
    }

    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function setDocuments(Collection $documents): void
    {
        $this->documents = $documents;
    }

    public function getMedia(): Collection
    {
        return $this->media;
    }

    public function setMedia(Collection $media): void
    {
        $this->media = $media;
    }
    /**
     * @return Collection<int, Module>
     */
    public function getModules(): Collection
    {
        return $this->modules;
    }

    public function addModule(Module $module): self
    {
        if (!$this->modules->contains($module)) {
            $this->modules->add($module);
            $module->setFormation($this);
        }
        return $this;
    }

    public function removeModule(Module $module): self
    {
        if ($this->modules->removeElement($module)) {
            if ($module->getFormation() === $this) {
                $module->setFormation(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Prerequisite>
     */
    public function getPrerequisites(): Collection
    {
        return $this->prerequisites;
    }

    public function addPrerequisite(Prerequisite $prerequisite): self
    {
        if (!$this->prerequisites->contains($prerequisite)) {
            $this->prerequisites->add($prerequisite);
            $prerequisite->setFormation($this);
        }
        return $this;
    }

    public function removePrerequisite(Prerequisite $prerequisite): self
    {
        if ($this->prerequisites->removeElement($prerequisite)) {
            if ($prerequisite->getFormation() === $this) {
                $prerequisite->setFormation(null);
            }
        }
        return $this;
    }
}
