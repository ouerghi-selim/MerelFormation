<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['module_point:read']],
    denormalizationContext: ['groups' => ['module_point:write']]
)]
class ModulePoint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['module_point:read', 'module:read', 'formation:item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['module_point:read', 'module_point:write', 'module:read', 'formation:item:read'])]
    private ?string $content = null;

    #[ORM\ManyToOne(inversedBy: 'points')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['module_point:read', 'module_point:write'])]
    private ?Module $module = null;

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

    public function getModule(): ?Module
    {
        return $this->module;
    }

    public function setModule(?Module $module): self
    {
        $this->module = $module;
        return $this;
    }
}