<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasher;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_ADMIN') or object == user"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Post(
            validationContext: ['groups' => ['Default', 'user:create']],
            processor: UserPasswordHasher::class
        ),
        new Put(
            processor: UserPasswordHasher::class,
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_ADMIN') or object == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')"
        ),
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']]
)]
#[UniqueEntity(fields: ['email'], message: 'Cet email est déjà utilisé')]
#[ORM\Index(columns: ['email'], name: 'user_email_idx')]
#[ORM\UniqueConstraint(name: 'user_email_unique', columns: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\Email(message: 'L\'email {{ value }} n\'est pas valide')]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string|null The hashed password
     */
    #[ORM\Column(type: 'string')]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank(message: 'Le prénom est requis')]
    #[Assert\Length(min: 2, max: 50)]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank(message: 'Le nom est requis')]
    #[Assert\Length(min: 2, max: 50)]
    private ?string $lastName = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\Length(min: 10, max: 20)]
    #[Assert\Regex(pattern: '/^[0-9\s\+\-\.]+$/', message: 'Le numéro de téléphone n\'est pas valide')]
    private ?string $phone = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $birthPlace = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $address = null;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $postalCode = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $city = null;


    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $driverLicenseFrontFile = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $driverLicenseBackFile = null;

    #[ORM\OneToMany(targetEntity: Reservation::class, mappedBy: 'user')]
    private Collection $reservations;

    #[ORM\OneToMany(targetEntity: Document::class, mappedBy: 'user')]
    private Collection $documents;

    #[ORM\OneToMany(targetEntity: VehicleRental::class, mappedBy: 'user')]
    private Collection $vehicleRentals;

    #[ORM\OneToMany(targetEntity: Invoice::class, mappedBy: 'user')]
    private Collection $invoices;

    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'user')]
    private Collection $notifications;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?bool $isActive = true;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $specialization = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['user:read'])]
    private ?\DateTimeInterface $deletedAt = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['user:read'])]
    private ?\DateTimeInterface $anonymizedAt = null;

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $deletionLevel = null; // 'deactivated', 'anonymized', 'permanent'

    // Champs de sauvegarde pour restauration (niveau 1 -> restauration)
    #[ORM\Column(type: 'string', length: 180, nullable: true)]
    private ?string $originalEmail = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $originalFirstName = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $originalLastName = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $setupToken = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $setupTokenExpiresAt = null;

    #[ORM\ManyToOne(targetEntity: Company::class, inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?Company $company = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->roles = ['ROLE_STUDENT'];
        $this->reservations = new ArrayCollection();
        $this->documents = new ArrayCollection();
        $this->vehicleRentals = new ArrayCollection();
        $this->invoices = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        // ✅ SOFT DELETE : Si l'utilisateur est supprimé, retirer tous les rôles
        if ($this->deletedAt !== null) {
            return []; // Aucun rôle = pas d'accès
        }
        
        $roles = $this->roles;
        // guarantee every user at least has ROLE_STUDENT
        $roles[] = 'ROLE_STUDENT';

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

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

    public function getBirthDate(): ?\DateTimeInterface
    {
        return $this->birthDate;
    }

    public function setBirthDate(?\DateTimeInterface $birthDate): void
    {
        $this->birthDate = $birthDate;
    }

    public function getBirthPlace(): ?string
    {
        return $this->birthPlace;
    }

    public function setBirthPlace(?string $birthPlace): void
    {
        $this->birthPlace = $birthPlace;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): void
    {
        $this->address = $address;
    }

    public function getPostalCode(): ?string
    {
        return $this->postalCode;
    }

    public function setPostalCode(?string $postalCode): void
    {
        $this->postalCode = $postalCode;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): void
    {
        $this->city = $city;
    }

    public function getDriverLicenseFrontFile(): ?string
    {
        return $this->driverLicenseFrontFile;
    }

    public function setDriverLicenseFrontFile(?string $driverLicenseFrontFile): void
    {
        $this->driverLicenseFrontFile = $driverLicenseFrontFile;
    }

    public function getDriverLicenseBackFile(): ?string
    {
        return $this->driverLicenseBackFile;
    }

    public function setDriverLicenseBackFile(?string $driverLicenseBackFile): void
    {
        $this->driverLicenseBackFile = $driverLicenseBackFile;
    }


    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
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

    public function getDeletedAt(): ?\DateTimeInterface
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeInterface $deletedAt): static
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function getAnonymizedAt(): ?\DateTimeInterface
    {
        return $this->anonymizedAt;
    }

    public function setAnonymizedAt(?\DateTimeInterface $anonymizedAt): static
    {
        $this->anonymizedAt = $anonymizedAt;
        return $this;
    }

    public function getDeletionLevel(): ?string
    {
        return $this->deletionLevel;
    }

    public function setDeletionLevel(?string $deletionLevel): static
    {
        $this->deletionLevel = $deletionLevel;
        return $this;
    }

    public function getOriginalEmail(): ?string
    {
        return $this->originalEmail;
    }

    public function setOriginalEmail(?string $originalEmail): static
    {
        $this->originalEmail = $originalEmail;
        return $this;
    }

    public function getOriginalFirstName(): ?string
    {
        return $this->originalFirstName;
    }

    public function setOriginalFirstName(?string $originalFirstName): static
    {
        $this->originalFirstName = $originalFirstName;
        return $this;
    }

    public function getOriginalLastName(): ?string
    {
        return $this->originalLastName;
    }

    public function setOriginalLastName(?string $originalLastName): static
    {
        $this->originalLastName = $originalLastName;
        return $this;
    }

    public function getReservations(): Collection
    {
        return $this->reservations;
    }

    public function setReservations(Collection $reservations): void
    {
        $this->reservations = $reservations;
    }

    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function setDocuments(Collection $documents): void
    {
        $this->documents = $documents;
    }

    public function getVehicleRentals(): Collection
    {
        return $this->vehicleRentals;
    }

    public function setVehicleRentals(Collection $vehicleRentals): void
    {
        $this->vehicleRentals = $vehicleRentals;
    }

    public function getInvoices(): Collection
    {
        return $this->invoices;
    }

    public function setInvoices(Collection $invoices): void
    {
        $this->invoices = $invoices;
    }

    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function setNotifications(Collection $notifications): void
    {
        $this->notifications = $notifications;
    }

    public function getSpecialization(): ?string
    {
        return $this->specialization;
    }

    public function setSpecialization(?string $specialization): static
    {
        $this->specialization = $specialization;
        return $this;
    }

    public function getSetupToken(): ?string
    {
        return $this->setupToken;
    }

    public function setSetupToken(?string $setupToken): static
    {
        $this->setupToken = $setupToken;
        return $this;
    }

    public function getSetupTokenExpiresAt(): ?\DateTimeInterface
    {
        return $this->setupTokenExpiresAt;
    }

    public function setSetupTokenExpiresAt(?\DateTimeInterface $setupTokenExpiresAt): static
    {
        $this->setupTokenExpiresAt = $setupTokenExpiresAt;
        return $this;
    }

    public function isSetupTokenValid(): bool
    {
        return $this->setupToken && 
               $this->setupTokenExpiresAt && 
               $this->setupTokenExpiresAt > new \DateTime();
    }

    public function getCompany(): ?Company
    {
        return $this->company;
    }

    public function setCompany(?Company $company): static
    {
        $this->company = $company;
        return $this;
    }
}
