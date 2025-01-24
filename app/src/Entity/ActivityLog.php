<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['log:read']],
            security: "is_granted('ROLE_ADMIN')"
        )
    ],
    order: ['createdAt' => 'DESC']
)]
class ActivityLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['log:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['log:read'])]
    private ?string $action = null; // create, update, delete, login, etc.

    #[ORM\Column(length: 50)]
    #[Groups(['log:read'])]
    private ?string $entityType = null; // User, Formation, Vehicle, etc.

    #[ORM\Column(nullable: true)]
    #[Groups(['log:read'])]
    private ?int $entityId = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['log:read'])]
    private ?array $details = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(['log:read'])]
    private ?User $user = null;

    #[ORM\Column(length: 45, nullable: true)]
    #[Groups(['log:read'])]
    private ?string $ipAddress = null;

    #[ORM\Column]
    #[Groups(['log:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(?string $action): void
    {
        $this->action = $action;
    }

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function setEntityType(?string $entityType): void
    {
        $this->entityType = $entityType;
    }

    public function getEntityId(): ?int
    {
        return $this->entityId;
    }

    public function setEntityId(?int $entityId): void
    {
        $this->entityId = $entityId;
    }

    public function getDetails(): ?array
    {
        return $this->details;
    }

    public function setDetails(?array $details): void
    {
        $this->details = $details;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): void
    {
        $this->ipAddress = $ipAddress;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

}