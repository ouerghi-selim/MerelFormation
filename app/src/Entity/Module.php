<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['module:read']],
    denormalizationContext: ['groups' => ['module:write']]
)]
class Module
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['module:read', 'formation:item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['module:read', 'module:write', 'formation:item:read'])]
    private ?string $title = null;

    #[ORM\Column]
    #[Groups(['module:read', 'module:write', 'formation:item:read'])]
    private ?int $duration = null;

    #[ORM\Column(name: "position", nullable: true)]
    #[Groups(['module:read', 'module:write', 'formation:item:read'])]
    private ?int $position = null;
    #[ORM\ManyToOne(inversedBy: 'modules')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['module:read', 'module:write'])]
    private ?Formation $formation = null;

    #[ORM\OneToMany(mappedBy: 'module', targetEntity: ModulePoint::class, cascade: ['persist', 'remove'])]
    #[Groups(['module:read', 'module:write', 'formation:item:read'])]
    private Collection $points;

    public function __construct()
    {
        $this->points = new ArrayCollection();
    }

    // Getters et setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): self
    {
        $this->duration = $duration;
        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): self
    {
        $this->position = $position;
        return $this;
    }

    public function getFormation(): ?Formation
    {
        return $this->formation;
    }

    public function setFormation(?Formation $formation): self
    {
        $this->formation = $formation;
        return $this;
    }

    /**
     * @return Collection<int, ModulePoint>
     */
    public function getPoints(): Collection
    {
        return $this->points;
    }

    public function addPoint(ModulePoint $point): self
    {
        if (!$this->points->contains($point)) {
            $this->points->add($point);
            $point->setModule($this);
        }
        return $this;
    }

    public function removePoint(ModulePoint $point): self
    {
        if ($this->points->removeElement($point)) {
            if ($point->getModule() === $this) {
                $point->setModule(null);
            }
        }
        return $this;
    }
}