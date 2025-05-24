<?php

namespace App\Controller\Admin;

use App\Entity\ContentText;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ContentTextAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $section = $request->query->get('section');
        $type = $request->query->get('type');
        $search = $request->query->get('search');

        $qb = $this->entityManager->createQueryBuilder()
            ->select('ct')
            ->from(ContentText::class, 'ct');

        if ($section) {
            $qb->andWhere('ct.section = :section')
               ->setParameter('section', $section);
        }

        if ($type) {
            $qb->andWhere('ct.type = :type')
               ->setParameter('type', $type);
        }

        if ($search) {
            $qb->andWhere('ct.title LIKE :search OR ct.content LIKE :search OR ct.identifier LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        $qb->orderBy('ct.section', 'ASC')
           ->addOrderBy('ct.type', 'ASC')
           ->addOrderBy('ct.title', 'ASC');

        // Count total
        $countQb = clone $qb;
        $total = $countQb->select('COUNT(ct.id)')->getQuery()->getSingleScalarResult();

        // Get paginated results
        $contentTexts = $qb->setFirstResult(($page - 1) * $limit)
                          ->setMaxResults($limit)
                          ->getQuery()
                          ->getResult();

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeContentText'], $contentTexts),
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $contentText = $this->entityManager->getRepository(ContentText::class)->find($id);
        
        if (!$contentText) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Contenu non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'success' => true,
            'data' => $this->serializeContentText($contentText)
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $contentText = new ContentText();
        $this->updateContentTextFromData($contentText, $data);

        $errors = $this->validator->validate($contentText);
        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => array_map(fn($error) => $error->getMessage(), iterator_to_array($errors))
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($contentText);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Contenu créé avec succès',
            'data' => $this->serializeContentText($contentText)
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $contentText = $this->entityManager->getRepository(ContentText::class)->find($id);
        
        if (!$contentText) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Contenu non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        
        $this->updateContentTextFromData($contentText, $data);
        $contentText->setUpdatedAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($contentText);
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
            'message' => 'Contenu modifié avec succès',
            'data' => $this->serializeContentText($contentText)
        ]);
    }

    public function delete(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $contentText = $this->entityManager->getRepository(ContentText::class)->find($id);
        
        if (!$contentText) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Contenu non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($contentText);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Contenu supprimé avec succès'
        ]);
    }

    public function getSections(): JsonResponse
    {
        $sections = $this->entityManager->createQueryBuilder()
            ->select('DISTINCT ct.section')
            ->from(ContentText::class, 'ct')
            ->where('ct.section IS NOT NULL')
            ->orderBy('ct.section', 'ASC')
            ->getQuery()
            ->getResult();

        $sectionList = array_map(fn($section) => $section['section'], $sections);

        return new JsonResponse([
            'success' => true,
            'data' => $sectionList
        ]);
    }

    public function getTypes(): JsonResponse
    {
        $types = ['title', 'subtitle', 'paragraph', 'button', 'description', 'slogan'];

        return new JsonResponse([
            'success' => true,
            'data' => $types
        ]);
    }

    public function getBySection(Request $request): JsonResponse
    {
        $section = $request->attributes->get('section');
        $contentTexts = $this->entityManager->getRepository(ContentText::class)
            ->findBy(['section' => $section, 'isActive' => true], ['type' => 'ASC']);

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeContentText'], $contentTexts)
        ]);
    }

    private function updateContentTextFromData(ContentText $contentText, array $data): void
    {
        if (isset($data['identifier'])) {
            $contentText->setIdentifier($data['identifier']);
        }
        if (isset($data['title'])) {
            $contentText->setTitle($data['title']);
        }
        if (isset($data['content'])) {
            $contentText->setContent($data['content']);
        }
        if (isset($data['section'])) {
            $contentText->setSection($data['section']);
        }
        if (isset($data['type'])) {
            $contentText->setType($data['type']);
        }
        if (isset($data['isActive'])) {
            $contentText->setIsActive($data['isActive']);
        }
    }

    private function serializeContentText(ContentText $contentText): array
    {
        return [
            'id' => $contentText->getId(),
            'identifier' => $contentText->getIdentifier(),
            'title' => $contentText->getTitle(),
            'content' => $contentText->getContent(),
            'section' => $contentText->getSection(),
            'type' => $contentText->getType(),
            'isActive' => $contentText->isActive(),
            'createdAt' => $contentText->getCreatedAt()?->format('c'),
            'updatedAt' => $contentText->getUpdatedAt()?->format('c')
        ];
    }
}
