<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\CompanyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: CompanyRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['company:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['company:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Post(
            normalizationContext: ['groups' => ['company:read']],
            denormalizationContext: ['groups' => ['company:write']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Put(
            normalizationContext: ['groups' => ['company:read']],
            denormalizationContext: ['groups' => ['company:write']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')"
        ),
    ],
    normalizationContext: ['groups' => ['company:read']],
    denormalizationContext: ['groups' => ['company:write']]
)]
#[UniqueEntity(fields: ['siret'], message: 'Ce numéro SIRET est déjà utilisé')]
#[ORM\Index(columns: ['siret'], name: 'company_siret_idx')]
class Company
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['company:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'Le nom de l\'entreprise est requis')]
    #[Assert\Length(min: 2, max: 255, minMessage: 'Le nom doit faire au moins 2 caractères')]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'L\'adresse est requise')]
    #[Assert\Length(min: 5, max: 255, minMessage: 'L\'adresse doit faire au moins 5 caractères')]
    private ?string $address = null;

    #[ORM\Column(length: 10)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'Le code postal est requis')]
    #[Assert\Regex(pattern: '/^[0-9]{5}$/', message: 'Le code postal doit contenir 5 chiffres')]
    private ?string $postalCode = null;

    #[ORM\Column(length: 255)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'La ville est requise')]
    #[Assert\Length(min: 2, max: 255, minMessage: 'La ville doit faire au moins 2 caractères')]
    private ?string $city = null;

    #[ORM\Column(length: 14)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'Le numéro SIRET est requis')]
    #[Assert\Regex(pattern: '/^[0-9]{14}$/', message: 'Le numéro SIRET doit contenir 14 chiffres')]
    private ?string $siret = null;

    #[ORM\Column(length: 255)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'Le nom du responsable est requis')]
    #[Assert\Length(min: 2, max: 255, minMessage: 'Le nom du responsable doit faire au moins 2 caractères')]
    private ?string $responsableName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'L\'email est requis')]
    #[Assert\Email(message: 'L\'email {{ value }} n\'est pas valide')]
    private ?string $email = null;

    #[ORM\Column(length: 20)]
    #[Groups(['company:read', 'company:write', 'user:read'])]
    #[Assert\NotBlank(message: 'Le téléphone est requis')]
    #[Assert\Length(min: 10, max: 20, minMessage: 'Le téléphone doit faire au moins 10 caractères')]
    #[Assert\Regex(pattern: '/^[0-9\s\+\-\.]+$/', message: 'Le numéro de téléphone n\'est pas valide')]
    private ?string $phone = null;

    #[ORM\Column]
    #[Groups(['company:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['company:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column]
    #[Groups(['company:read', 'company:write'])]
    private ?bool $isActive = true;

    #[ORM\OneToMany(targetEntity: User::class, mappedBy: 'company')]
    private Collection $users;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->users = new ArrayCollection();
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

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getPostalCode(): ?string
    {
        return $this->postalCode;
    }

    public function setPostalCode(string $postalCode): static
    {
        $this->postalCode = $postalCode;
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

    public function getSiret(): ?string
    {
        return $this->siret;
    }

    public function setSiret(string $siret): static
    {
        $this->siret = $siret;
        return $this;
    }

    public function getResponsableName(): ?string
    {
        return $this->responsableName;
    }

    public function setResponsableName(string $responsableName): static
    {
        $this->responsableName = $responsableName;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone;
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

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
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

    /**
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->setCompany($this);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->users->removeElement($user)) {
            // set the owning side to null (unless already changed)
            if ($user->getCompany() === $this) {
                $user->setCompany(null);
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?: 'Entreprise #' . $this->id;
    }
}