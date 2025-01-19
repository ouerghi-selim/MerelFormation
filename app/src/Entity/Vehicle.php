<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\VehicleRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: VehicleRepository::class)]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['vehicle:read']]),
        new GetCollection(normalizationContext: ['groups' => ['vehicle:read']]),
        new Post(denormalizationContext: ['groups' => ['vehicle:write']]),
        new Put(denormalizationContext: ['groups' => ['vehicle:write']]),
    ],
    order: ['model' => 'ASC']
)]
class Vehicle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['vehicle:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $model = null;

    #[ORM\Column(length: 20)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $plate = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $year = null;

    #[ORM\Column(length: 50)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $status = 'available'; // available, rented, maintenance

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?float $dailyRate = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?bool $isActive = true;

    #[ORM\Column(length: 50)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $category = null; // berline, monospace, etc.

    #[ORM\Column]
    #[Groups(['vehicle:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['vehicle:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
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

    public function getModel(): ?string
    {
        return $this->model;
    }

    public function setModel(string $model): static
    {
        $this->model = $model;
        return $this;
    }

    public function getPlate(): ?string
    {
        return $this->plate;
    }

    public function setPlate(string $plate): static
    {
        $this->plate = $plate;
        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(int $year): static
    {
        $this->year = $year;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getDailyRate(): ?float
    {
        return $this->dailyRate;
    }

    public function setDailyRate(float $dailyRate): static
    {
        $this->dailyRate = $dailyRate;
        return $this;
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

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;
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
