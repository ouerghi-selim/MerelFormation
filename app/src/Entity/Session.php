<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\SessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: SessionRepository::class)]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['session:read', 'session:item:read']]),
        new GetCollection(normalizationContext: ['groups' => ['session:read']]),
        new Post(denormalizationContext: ['groups' => ['session:write']]),
        new Put(denormalizationContext: ['groups' => ['session:write']])
    ],
    order: ['startDate' => 'ASC']
)]
#[ORM\Table]
#[ORM\Index(columns: ['start_date'], name: 'session_start_idx')]
#[ORM\Index(columns: ['status'], name: 'session_status_idx')]
class Session
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['session:read', 'formation:item:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'sessions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['session:read', 'session:write'])]
    private ?Formation $formation = null;

    #[ORM\Column]
    #[Groups(['session:read', 'session:write', 'formation:item:read'])]
    private ?\DateTimeImmutable $startDate = null;

    #[ORM\Column]
    #[Groups(['session:read', 'session:write', 'formation:item:read'])]
    private ?\DateTimeImmutable $endDate = null;

    #[ORM\Column]
    #[Groups(['session:read', 'session:write', 'formation:item:read'])]
    private ?int $maxParticipants = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['session:read', 'session:write', 'formation:item:read'])]
    private ?string $location = null;

    #[ORM\ManyToOne(targetEntity: Center::class, inversedBy: 'sessions')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['session:read', 'session:write'])]
    private ?Center $center = null;

    #[ORM\Column(length: 50)]
    #[Groups(['session:read', 'session:write', 'formation:item:read'])]
    private ?string $status = 'scheduled'; // scheduled, ongoing, completed, cancelled

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['session:read', 'session:write'])]
    private ?string $notes = null;

    #[ORM\OneToMany(mappedBy: 'session', targetEntity: Reservation::class)]
    private Collection $reservations;

    #[ORM\OneToMany(mappedBy: 'session', targetEntity: Document::class)]
    private Collection $documents;

    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'session_instructors')]
    #[Groups(['session:read', 'session:write'])]
    private Collection $instructors;

    // Gardons l'ancien champ pour compatibilité arrière (sera déprécié)
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['session:read', 'session:write'])]
    private ?User $instructor = null;

    #[ORM\Column]
    #[Groups(['session:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->reservations = new ArrayCollection();
        $this->documents = new ArrayCollection();
        $this->instructors = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFormation(): ?Formation
    {
        return $this->formation;
    }

    public function setFormation(?Formation $formation): static
    {
        $this->formation = $formation;
        return $this;
    }

    public function getStartDate(): ?\DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeImmutable $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeImmutable $endDate): static
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getMaxParticipants(): ?int
    {
        return $this->maxParticipants;
    }

    public function setMaxParticipants(int $maxParticipants): static
    {
        $this->maxParticipants = $maxParticipants;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;
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

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * Get participants with confirmed reservations (EXCLUDING archived reservations and deleted users)
     *
     * @return Collection<int, User>
     */
    #[Groups(['session:item:read'])]
    public function getParticipants(): Collection
    {
        $participants = new ArrayCollection();
        foreach ($this->reservations as $reservation) {
            // ✅ VÉRIFICATIONS D'ARCHIVAGE
            $isReservationActive = !$reservation->isArchived(); // Réservation non archivée
            $isUserActive = $reservation->getUser()->getDeletedAt() === null; // Utilisateur non supprimé
            $isConfirmed = ($reservation->getStatus() === 'confirmed' || $reservation->getStatus() === 'completed');
            
            if ($isConfirmed && $isReservationActive && $isUserActive) {
                if (!$participants->contains($reservation->getUser())) {
                    $participants->add($reservation->getUser());
                }
            }
        }
        return $participants;
    }

    /**
     * Check if a user is a participant (has confirmed reservation AND is not archived)
     *
     * @param User $user
     * @return bool
     */
    public function hasParticipant(User $user): bool
    {
        foreach ($this->reservations as $reservation) {
            // ✅ VÉRIFICATIONS D'ARCHIVAGE
            $isReservationActive = !$reservation->isArchived();
            $isUserActive = $reservation->getUser()->getDeletedAt() === null;
            $isConfirmed = ($reservation->getStatus() === 'confirmed' || $reservation->getStatus() === 'completed');
            
            if ($reservation->getUser() === $user && $isConfirmed && $isReservationActive && $isUserActive) {
                return true;
            }
        }
        return false;
    }

    /**
     * Find user's reservation for this session
     *
     * @param User $user
     * @return Reservation|null
     */
    public function findUserReservation(User $user): ?Reservation
    {
        foreach ($this->reservations as $reservation) {
            if ($reservation->getUser() === $user) {
                return $reservation;
            }
        }
        return null;
    }

    /**
     * Add participant through reservation
     * Note: This method identifies if the user already has a reservation
     * and updates its status to confirmed. If no reservation exists,
     * a new one will need to be created through the appropriate service.
     *
     * @param User $participant
     * @return static
     */
    public function addParticipant(User $participant): static
    {
        // Check if participant already exists with confirmed status
        if (!$this->hasParticipant($participant)) {
            // Check if participant has a reservation
            $reservation = $this->findUserReservation($participant);
            if ($reservation) {
                // Update existing reservation to confirmed
                $reservation->setStatus('confirmed');
            }
            // Note: If no reservation exists, this should be handled at service level
        }

        return $this;
    }

    /**
     * Remove participant by setting reservation status to cancelled
     *
     * @param User $participant
     * @return static
     */
    public function removeParticipant(User $participant): static
    {
        $reservation = $this->findUserReservation($participant);
        if ($reservation && ($reservation->getStatus() === 'confirmed' || $reservation->getStatus() === 'completed')) {
            $reservation->setStatus('cancelled');
        }

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

    public function getInstructor(): ?User
    {
        return $this->instructor;
    }

    public function setInstructor(?User $instructor): void
    {
        $this->instructor = $instructor;
    }

    public function getCenter(): ?Center
    {
        return $this->center;
    }

    public function setCenter(?Center $center): static
    {
        $this->center = $center;
        return $this;
    }

    /**
     * Get effective location (from center or manual location)
     */
    public function getEffectiveLocation(): ?string
    {
        if ($this->center) {
            return $this->center->getFullAddress();
        }
        
        return $this->location;
    }

    /**
     * @return Collection<int, User>
     */
    public function getInstructors(): Collection
    {
        return $this->instructors;
    }

    public function addInstructor(User $instructor): static
    {
        if (!$this->instructors->contains($instructor)) {
            $this->instructors->add($instructor);
        }

        return $this;
    }

    public function removeInstructor(User $instructor): static
    {
        $this->instructors->removeElement($instructor);

        return $this;
    }

    public function setInstructors(Collection $instructors): static
    {
        $this->instructors = $instructors;
        return $this;
    }

    /**
     * Helper method to get instructor names as string (for backward compatibility)
     */
    public function getInstructorNames(): string
    {
        $names = [];
        foreach ($this->instructors as $instructor) {
            $names[] = $instructor->getFirstName() . ' ' . $instructor->getLastName();
        }
        return implode(', ', $names);
    }

}