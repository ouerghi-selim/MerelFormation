<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['prerequisite:read']],
    denormalizationContext: ['groups' => ['prerequisite:write']]
)]
class Prerequisite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['prerequisite:read', 'formation:item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['prerequisite:read', 'prerequisite:write', 'formation:item:read'])]
    private ?string $content = null;

    #[ORM\ManyToOne(inversedBy: 'prerequisites')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['prerequisite:read', 'prerequisite:write'])]
    private ?Formation $formation = null;

    // Getters et setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
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
}