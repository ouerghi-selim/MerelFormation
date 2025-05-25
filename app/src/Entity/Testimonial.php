<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'testimonial')]
#[ORM\Index(name: 'IDX_testimonial_active', columns: ['is_active'])]
#[ORM\Index(name: 'IDX_testimonial_featured', columns: ['is_featured'])]
#[ORM\Index(name: 'IDX_testimonial_formation', columns: ['formation'])]
#[ORM\Index(name: 'IDX_testimonial_rating', columns: ['rating'])]
class Testimonial
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $clientName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $clientJob = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $clientCompany = null;

    #[ORM\Column(type: 'text')]
    private ?string $content = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $rating = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $formation = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $clientImage = null;

    #[ORM\Column(options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(options: ['default' => false])]
    private bool $isFeatured = false;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $testimonialDate = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getClientName(): ?string
    {
        return $this->clientName;
    }

    public function setClientName(string $clientName): self
    {
        $this->clientName = $clientName;
        return $this;
    }

    public function getClientJob(): ?string
    {
        return $this->clientJob;
    }

    public function setClientJob(?string $clientJob): self
    {
        $this->clientJob = $clientJob;
        return $this;
    }

    public function getClientCompany(): ?string
    {
        return $this->clientCompany;
    }

    public function setClientCompany(?string $clientCompany): self
    {
        $this->clientCompany = $clientCompany;
        return $this;
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

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(?int $rating): self
    {
        if ($rating !== null && ($rating < 1 || $rating > 5)) {
            throw new \InvalidArgumentException('Rating must be between 1 and 5');
        }
        $this->rating = $rating;
        return $this;
    }

    public function getFormation(): ?string
    {
        return $this->formation;
    }

    public function setFormation(?string $formation): self
    {
        $this->formation = $formation;
        return $this;
    }

    public function getClientImage(): ?string
    {
        return $this->clientImage;
    }

    public function setClientImage(?string $clientImage): self
    {
        $this->clientImage = $clientImage;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function isFeatured(): bool
    {
        return $this->isFeatured;
    }

    public function setIsFeatured(bool $isFeatured): self
    {
        $this->isFeatured = $isFeatured;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getTestimonialDate(): ?\DateTimeInterface
    {
        return $this->testimonialDate;
    }

    public function setTestimonialDate(?\DateTimeInterface $testimonialDate): self
    {
        $this->testimonialDate = $testimonialDate;
        return $this;
    }
}
