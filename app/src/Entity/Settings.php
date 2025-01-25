<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Repository\SettingsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: SettingsRepository::class)]
#[ORM\Table(name: 'settings')]
#[UniqueEntity(fields: ['key'], message: 'Cette clé de configuration existe déjà')]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['settings:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['settings:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['settings:write']],
            security: "is_granted('ROLE_ADMIN')"
        )
    ]
)]
class Settings
{
    #[ORM\Id]
    #[ORM\Column(length: 255)]
    #[Groups(['settings:read', 'settings:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 255)]
    private ?string $key = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['settings:read', 'settings:write'])]
    #[Assert\NotNull]
    private mixed $value = null;

    #[ORM\Column(length: 50)]
    #[Groups(['settings:read', 'settings:write'])]
    #[Assert\Choice(choices: ['string', 'integer', 'float', 'boolean', 'array', 'json'])]
    private ?string $type = 'string';

    #[ORM\Column(length: 255)]
    #[Groups(['settings:read', 'settings:write'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['settings:read', 'settings:write'])]
    private ?bool $isPublic = false;

    #[ORM\Column]
    #[Groups(['settings:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 50)]
    #[Groups(['settings:read', 'settings:write'])]
    #[Assert\Choice(choices: ['general', 'email', 'payment', 'company', 'legal'])]
    private ?string $category = 'general';

    public function __construct()
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getKey(): ?string
    {
        return $this->key;
    }

    public function setKey(string $key): static
    {
        $this->key = $key;
        return $this;
    }

    public function getValue(): mixed
    {
        if ($this->type === 'json' || $this->type === 'array') {
            return json_decode($this->value, true);
        }

        return match ($this->type) {
            'integer' => (int) $this->value,
            'float' => (float) $this->value,
            'boolean' => (bool) $this->value,
            default => $this->value,
        };
    }

    public function setValue(mixed $value): static
    {
        if (is_array($value)) {
            $this->value = json_encode($value);
        } else {
            $this->value = (string) $value;
        }
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;
        return $this;
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