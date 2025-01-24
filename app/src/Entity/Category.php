<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
#[ORM\Table(name: 'category')]
#[ApiResource(
   operations: [
       new Get(normalizationContext: ['groups' => ['category:read', 'category:item:read']]),
       new GetCollection(normalizationContext: ['groups' => ['category:read']]),
       new Post(
           denormalizationContext: ['groups' => ['category:write']],
           security: "is_granted('ROLE_ADMIN')"
       ),
       new Put(
           denormalizationContext: ['groups' => ['category:write']],
           security: "is_granted('ROLE_ADMIN')"
       )
   ]
)]
class Category
{
   #[ORM\Id]
   #[ORM\GeneratedValue]
   #[ORM\Column]
   #[Groups(['category:read'])]
   private ?int $id = null;

   #[ORM\Column(length: 255)]
   #[Groups(['category:read', 'category:write'])]
   #[Assert\NotBlank]
   #[Assert\Length(min: 2, max: 255)]
   private ?string $name = null;

   #[ORM\Column(length: 255, unique: true)]
   #[Groups(['category:read'])]
   #[Gedmo\Slug(fields: ['name'])]
   private ?string $slug = null;

   #[ORM\Column(type: 'text', nullable: true)]
   #[Groups(['category:read', 'category:write'])]
   private ?string $description = null;

   #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'children')]
   #[Groups(['category:read', 'category:write', 'category:item:read'])]
   private ?self $parent = null;

   #[ORM\OneToMany(mappedBy: 'parent', targetEntity: self::class)]
   #[Groups(['category:item:read'])]
   private Collection $children;

   #[ORM\OneToMany(mappedBy: 'category', targetEntity: Formation::class)]
   #[Groups(['category:item:read'])]
   private Collection $formations;

   #[ORM\Column]
   #[Groups(['category:read', 'category:write'])]
   private ?bool $isActive = true;

   #[Gedmo\TreeLeft]
   #[ORM\Column]
   private ?int $lft = null;

   #[Gedmo\TreeRight]
   #[ORM\Column]
   private ?int $rgt = null;

   #[Gedmo\TreeLevel]
   #[ORM\Column]
   private ?int $level = null;

   public function __construct()
   {
       $this->children = new ArrayCollection();
       $this->formations = new ArrayCollection();
   }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): void
    {
        $this->slug = $slug;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getParent(): ?Category
    {
        return $this->parent;
    }

    public function setParent(?Category $parent): void
    {
        $this->parent = $parent;
    }

    public function getChildren(): Collection
    {
        return $this->children;
    }

    public function setChildren(Collection $children): void
    {
        $this->children = $children;
    }

    public function getFormations(): Collection
    {
        return $this->formations;
    }

    public function setFormations(Collection $formations): void
    {
        $this->formations = $formations;
    }

    public function getIsActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(?bool $isActive): void
    {
        $this->isActive = $isActive;
    }

    public function getLft(): ?int
    {
        return $this->lft;
    }

    public function setLft(?int $lft): void
    {
        $this->lft = $lft;
    }

    public function getRgt(): ?int
    {
        return $this->rgt;
    }

    public function setRgt(?int $rgt): void
    {
        $this->rgt = $rgt;
    }

    public function getLevel(): ?int
    {
        return $this->level;
    }

    public function setLevel(?int $level): void
    {
        $this->level = $level;
    }


}