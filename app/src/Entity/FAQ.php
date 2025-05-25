<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'faq')]
#[ORM\Index(name: 'IDX_faq_category', columns: ['category'])]
#[ORM\Index(name: 'IDX_faq_active', columns: ['is_active'])]
#[ORM\Index(name: 'IDX_faq_featured', columns: ['is_featured'])]
#[ORM\Index(name: 'IDX_faq_sort_order', columns: ['sort_order'])]
class FAQ
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 500)]
    private ?string $question = null;

    #[ORM\Column(type: 'text')]
    private ?string $answer = null;

    #[ORM\Column(length: 100)]
    private ?string $category = null; // 'general', 'formation', 'payment', 'location', etc.

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $sortOrder = 0; // Pour l'ordre d'affichage

    #[ORM\Column(options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(options: ['default' => false])]
    private bool $isFeatured = false; // FAQ mise en avant

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $tags = null; // Tags pour recherche

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $viewCount = 0; // Nombre de fois consultée

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->tags = [];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(string $question): self
    {
        $this->question = $question;
        return $this;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(string $answer): self
    {
        $this->answer = $answer;
        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): self
    {
        $this->category = $category;
        return $this;
    }

    public function getSortOrder(): int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): self
    {
        $this->sortOrder = $sortOrder;
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

    public function getTags(): ?array
    {
        return $this->tags;
    }

    public function setTags(?array $tags): self
    {
        $this->tags = $tags;
        return $this;
    }

    public function addTag(string $tag): self
    {
        if (!in_array($tag, $this->tags ?? [])) {
            $this->tags[] = $tag;
        }
        return $this;
    }

    public function removeTag(string $tag): self
    {
        $this->tags = array_filter($this->tags ?? [], fn($t) => $t !== $tag);
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

    public function getViewCount(): int
    {
        return $this->viewCount;
    }

    public function setViewCount(int $viewCount): self
    {
        $this->viewCount = $viewCount;
        return $this;
    }

    public function incrementViewCount(): self
    {
        $this->viewCount++;
        return $this;
    }
}
