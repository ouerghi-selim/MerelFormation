<?php

namespace App\Entity;

use App\Repository\ExamCenterRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ExamCenterRepository::class)]
class ExamCenter
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['exam_center:read', 'formula:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['exam_center:read', 'exam_center:write', 'formula:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 100)]
    #[Groups(['exam_center:read', 'exam_center:write', 'formula:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 255)]
    #[Groups(['exam_center:read', 'exam_center:write'])]
    private ?string $city = null;

    #[ORM\Column(length: 10)]
    #[Groups(['exam_center:read', 'exam_center:write'])]
    private ?string $departmentCode = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['exam_center:read', 'exam_center:write'])]
    private ?string $address = null;

    #[ORM\Column]
    #[Groups(['exam_center:read', 'exam_center:write'])]
    private ?bool $isActive = true;

    #[ORM\Column]
    #[Groups(['exam_center:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['exam_center:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, Formula>
     */
    #[ORM\OneToMany(targetEntity: Formula::class, mappedBy: 'examCenter', orphanRemoval: true)]
    #[Groups(['exam_center:read'])]
    private Collection $formulas;

    public function __construct()
    {
        $this->formulas = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;
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

    public function getDepartmentCode(): ?string
    {
        return $this->departmentCode;
    }

    public function setDepartmentCode(string $departmentCode): static
    {
        $this->departmentCode = $departmentCode;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
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

    /**
     * @return Collection<int, Formula>
     */
    public function getFormulas(): Collection
    {
        return $this->formulas;
    }

    public function addFormula(Formula $formula): static
    {
        if (!$this->formulas->contains($formula)) {
            $this->formulas->add($formula);
            $formula->setExamCenter($this);
        }

        return $this;
    }

    public function removeFormula(Formula $formula): static
    {
        if ($this->formulas->removeElement($formula)) {
            // set the owning side to null (unless already changed)
            if ($formula->getExamCenter() === $this) {
                $formula->setExamCenter(null);
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}