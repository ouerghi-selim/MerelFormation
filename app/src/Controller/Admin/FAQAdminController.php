<?php

namespace App\Controller\Admin;

use App\Entity\Faq;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/admin/faq', name: 'admin_faq_')]
class FAQAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $category = $request->query->get('category');
        $featured = $request->query->get('featured');
        $active = $request->query->get('active');
        $search = $request->query->get('search');

        $qb = $this->entityManager->createQueryBuilder()
            ->select('f')
            ->from(Faq::class, 'f');

        if ($category) {
            $qb->andWhere('f.category = :category')
               ->setParameter('category', $category);
        }

        if ($featured !== null) {
            $qb->andWhere('f.isFeatured = :featured')
               ->setParameter('featured', $featured === 'true');
        }

        if ($active !== null) {
            $qb->andWhere('f.isActive = :active')
               ->setParameter('active', $active === 'true');
        }

        if ($search) {
            $qb->andWhere('f.question LIKE :search OR f.answer LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        $qb->orderBy('f.isFeatured', 'DESC')
           ->addOrderBy('f.sortOrder', 'ASC')
           ->addOrderBy('f.category', 'ASC');

        // Count total
        $countQb = clone $qb;
        $total = $countQb->select('COUNT(f.id)')->getQuery()->getSingleScalarResult();

        // Get paginated results
        $faqs = $qb->setFirstResult(($page - 1) * $limit)
              ->setMaxResults($limit)
              ->getQuery()
              ->getResult();

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeFAQ'], $faqs),
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Faq $faq): JsonResponse
    {
        // Increment view count
        $faq->incrementViewCount();
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'data' => $this->serializeFAQ($faq)
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $faq = new Faq();
        $this->updateFAQFromData($faq, $data);

        $errors = $this->validator->validate($faq);
        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => array_map(fn($error) => $error->getMessage(), iterator_to_array($errors))
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($faq);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'FAQ créée avec succès',
            'data' => $this->serializeFAQ($faq)
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(Faq $faq, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $this->updateFAQFromData($faq, $data);
        $faq->setUpdatedAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($faq);
        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => array_map(fn($error) => $error->getMessage(), iterator_to_array($errors))
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'FAQ modifiée avec succès',
            'data' => $this->serializeFAQ($faq)
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(Faq $faq): JsonResponse
    {
        $this->entityManager->remove($faq);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'FAQ supprimée avec succès'
        ]);
    }

    #[Route('/{id}/toggle-featured', name: 'toggle_featured', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function toggleFeatured(Faq $faq): JsonResponse
    {
        $faq->setIsFeatured(!$faq->isFeatured());
        $faq->setUpdatedAt(new \DateTimeImmutable());
        
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => $faq->isFeatured() ? 'FAQ mise en avant' : 'FAQ retirée de la mise en avant',
            'data' => $this->serializeFAQ($faq)
        ]);
    }

    #[Route('/{id}/toggle-active', name: 'toggle_active', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function toggleActive(Faq $faq): JsonResponse
    {
        $faq->setIsActive(!$faq->isActive());
        $faq->setUpdatedAt(new \DateTimeImmutable());
        
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => $faq->isActive() ? 'FAQ activée' : 'FAQ désactivée',
            'data' => $this->serializeFAQ($faq)
        ]);
    }

    #[Route('/reorder', name: 'reorder', methods: ['PUT'])]
    public function reorder(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['items']) || !is_array($data['items'])) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données invalides'
            ], Response::HTTP_BAD_REQUEST);
        }

        foreach ($data['items'] as $item) {
            if (isset($item['id']) && isset($item['sortOrder'])) {
                $faq = $this->entityManager->getRepository(Faq::class)->find($item['id']);
                if ($faq) {
                    $faq->setSortOrder($item['sortOrder']);
                    $faq->setUpdatedAt(new \DateTimeImmutable());
                }
            }
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Ordre des FAQ mis à jour'
        ]);
    }

    #[Route('/categories', name: 'categories', methods: ['GET'])]
    public function getCategories(): JsonResponse
    {
        $categories = $this->entityManager->createQueryBuilder()
            ->select('DISTINCT f.category')
            ->from(Faq::class, 'f')
            ->where('f.category IS NOT NULL')
            ->orderBy('f.category', 'ASC')
            ->getQuery()
            ->getResult();

        $categoryList = array_map(fn($category) => $category['category'], $categories);

        return new JsonResponse([
            'success' => true,
            'data' => $categoryList
        ]);
    }

    #[Route('/featured', name: 'featured', methods: ['GET'])]
    public function getFeatured(): JsonResponse
    {
        $faqs = $this->entityManager->getRepository(Faq::class)
            ->findBy(['isFeatured' => true, 'isActive' => true], ['sortOrder' => 'ASC']);

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeFAQ'], $faqs)
        ]);
    }

    #[Route('/by-category/{category}', name: 'by_category', methods: ['GET'])]
    public function getByCategory(string $category): JsonResponse
    {
        $faqs = $this->entityManager->getRepository(Faq::class)
            ->findBy(['category' => $category, 'isActive' => true], ['sortOrder' => 'ASC']);

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeFAQ'], $faqs)
        ]);
    }

    private function updateFAQFromData(Faq $faq, array $data): void
    {
        if (isset($data['question'])) {
            $faq->setQuestion($data['question']);
        }
        if (isset($data['answer'])) {
            $faq->setAnswer($data['answer']);
        }
        if (isset($data['category'])) {
            $faq->setCategory($data['category']);
        }
        if (isset($data['sortOrder'])) {
            $faq->setSortOrder($data['sortOrder']);
        }
        if (isset($data['isActive'])) {
            $faq->setIsActive($data['isActive']);
        }
        if (isset($data['isFeatured'])) {
            $faq->setIsFeatured($data['isFeatured']);
        }
        if (isset($data['tags']) && is_array($data['tags'])) {
            $faq->setTags($data['tags']);
        }
    }

    private function serializeFAQ(Faq $faq): array
    {
        return [
            'id' => $faq->getId(),
            'question' => $faq->getQuestion(),
            'answer' => $faq->getAnswer(),
            'category' => $faq->getCategory(),
            'sortOrder' => $faq->getSortOrder(),
            'isActive' => $faq->isActive(),
            'isFeatured' => $faq->isFeatured(),
            'tags' => $faq->getTags(),
            'viewCount' => $faq->getViewCount(),
            'createdAt' => $faq->getCreatedAt()?->format('c'),
            'updatedAt' => $faq->getUpdatedAt()?->format('c')
        ];
    }
}
