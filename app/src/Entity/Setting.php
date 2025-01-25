<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Setting
{
    #[ORM\Id]
    #[ORM\Column(length: 255)]
    private string $key;

    #[ORM\Column(type: 'text')]
    private string $value;

    #[ORM\Column(length: 50)]
    private string $type = 'string'; // string, boolean, integer, array, etc.

    #[ORM\Column(length: 255)]
    private string $description;

    #[ORM\Column]
    private bool $isPublic = false;

    public function getKey(): string
    {
        return $this->key;
    }

    public function setKey(string $key): void
    {
        $this->key = $key;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function setValue(string $value): void
    {
        $this->value = $value;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function isPublic(): bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): void
    {
        $this->isPublic = $isPublic;
    }

}