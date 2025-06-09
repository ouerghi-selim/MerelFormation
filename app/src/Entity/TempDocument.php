<?php

namespace App\Entity;

use App\Repository\TempDocumentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TempDocumentRepository::class)]
#[ORM\Table(name: "temp_documents")]
class TempDocument
{
    #[ORM\Id]
    #[ORM\Column(type: "string", length: 255)]
    private string $tempId;

    #[ORM\Column(type: "string", length: 255)]
    private string $title;

    #[ORM\Column(type: "string", length: 10)]
    private string $type;

    #[ORM\Column(type: "string", length: 50)]
    private string $category;

    #[ORM\Column(type: "string", length: 255)]
    private string $fileName;

    #[ORM\Column(type: "string", length: 255)]
    private string $originalName;

    #[ORM\Column(type: "integer")]
    private int $uploadedBy;

    #[ORM\Column(type: "datetime")]
    private \DateTime $uploadedAt;

    #[ORM\Column(type: "integer", nullable: true)]
    private ?int $fileSize = null;

    public function __construct()
    {
        $this->uploadedAt = new \DateTime();
    }

    public function getTempId(): string
    {
        return $this->tempId;
    }

    public function setTempId(string $tempId): self
    {
        $this->tempId = $tempId;
        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function setCategory(string $category): self
    {
        $this->category = $category;
        return $this;
    }

    public function getFileName(): string
    {
        return $this->fileName;
    }

    public function setFileName(string $fileName): self
    {
        $this->fileName = $fileName;
        return $this;
    }

    public function getOriginalName(): string
    {
        return $this->originalName;
    }

    public function setOriginalName(string $originalName): self
    {
        $this->originalName = $originalName;
        return $this;
    }

    public function getUploadedBy(): int
    {
        return $this->uploadedBy;
    }

    public function setUploadedBy(int $uploadedBy): self
    {
        $this->uploadedBy = $uploadedBy;
        return $this;
    }

    public function getUploadedAt(): \DateTime
    {
        return $this->uploadedAt;
    }

    public function setUploadedAt(\DateTime $uploadedAt): self
    {
        $this->uploadedAt = $uploadedAt;
        return $this;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function setFileSize(?int $fileSize): self
    {
        $this->fileSize = $fileSize;
        return $this;
    }
}