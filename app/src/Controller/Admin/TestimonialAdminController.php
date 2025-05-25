<?php

namespace App\Controller\Admin;

use App\Entity\Testimonial;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class TestimonialAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $formation = $request->query->get('formation');
        $rating = $request->query->getInt('rating');
        $featured = $request->query->get('featured');
        $active = $request->query->get('active');
        $search = $request->query->get('search');

        $qb = $this->entityManager->createQueryBuilder()
            ->select('t')
            ->from(Testimonial::class, 't');

        if ($formation) {
            $qb->andWhere('t.formation LIKE :formation')
               ->setParameter('formation', '%' . $formation . '%');
        }

        if ($rating) {
            $qb->andWhere('t.rating = :rating')
               ->setParameter('rating', $rating);
        }

        if ($featured !== null) {
            $qb->andWhere('t.isFeatured = :featured')
               ->setParameter('featured', $featured === 'true');
        }

        if ($active !== null) {
            $qb->andWhere('t.isActive = :active')
               ->setParameter('active', $active === 'true');
        }

        if ($search) {
            $qb->andWhere('t.clientName LIKE :search OR t.content LIKE :search OR t.clientCompany LIKE :search')
               ->setParameter('search', '%' . $search . '%');
        }

        $qb->orderBy('t.isFeatured', 'DESC')
           ->addOrderBy('t.createdAt', 'DESC');

        // Count total
        $countQb = clone $qb;
        $total = $countQb->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

        // Get paginated results
        $testimonials = $qb->setFirstResult(($page - 1) * $limit)
                          ->setMaxResults($limit)
                          ->getQuery()
                          ->getResult();

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeTestimonial'], $testimonials),
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
        $testimonial = $this->entityManager->getRepository(Testimonial::class)->find($id);
        
        if (!$testimonial) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Témoignage non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'success' => true,
            'data' => $this->serializeTestimonial($testimonial)
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $testimonial = new Testimonial();
        $this->updateTestimonialFromData($testimonial, $data);

        $errors = $this->validator->validate($testimonial);
        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => array_map(fn($error) => $error->getMessage(), iterator_to_array($errors))
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($testimonial);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Témoignage créé avec succès',
            'data' => $this->serializeTestimonial($testimonial)
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $testimonial = $this->entityManager->getRepository(Testimonial::class)->find($id);
        
        if (!$testimonial) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Témoignage non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        
        $this->updateTestimonialFromData($testimonial, $data);
        $testimonial->setUpdatedAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($testimonial);
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
            'message' => 'Témoignage modifié avec succès',
            'data' => $this->serializeTestimonial($testimonial)
        ]);
    }

    public function delete(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $testimonial = $this->entityManager->getRepository(Testimonial::class)->find($id);
        
        if (!$testimonial) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Témoignage non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($testimonial);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Témoignage supprimé avec succès'
        ]);
    }

    public function toggleFeatured(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $testimonial = $this->entityManager->getRepository(Testimonial::class)->find($id);
        
        if (!$testimonial) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Témoignage non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $testimonial->setIsFeatured(!$testimonial->isFeatured());
        $testimonial->setUpdatedAt(new \DateTimeImmutable());
        
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => $testimonial->isFeatured() ? 'Témoignage mis en avant' : 'Témoignage retiré de la mise en avant',
            'data' => $this->serializeTestimonial($testimonial)
        ]);
    }

    public function toggleActive(Request $request): JsonResponse
    {
        $id = $request->attributes->get('id');
        $testimonial = $this->entityManager->getRepository(Testimonial::class)->find($id);
        
        if (!$testimonial) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Témoignage non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $testimonial->setIsActive(!$testimonial->isActive());
        $testimonial->setUpdatedAt(new \DateTimeImmutable());
        
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => $testimonial->isActive() ? 'Témoignage activé' : 'Témoignage désactivé',
            'data' => $this->serializeTestimonial($testimonial)
        ]);
    }

    public function getFeatured(): JsonResponse
    {
        $testimonials = $this->entityManager->getRepository(Testimonial::class)
            ->findBy(['isFeatured' => true, 'isActive' => true], ['createdAt' => 'DESC']);

        return new JsonResponse([
            'success' => true,
            'data' => array_map([$this, 'serializeTestimonial'], $testimonials)
        ]);
    }

    public function getFormations(): JsonResponse
    {
        $formations = $this->entityManager->createQueryBuilder()
            ->select('DISTINCT t.formation')
            ->from(Testimonial::class, 't')
            ->where('t.formation IS NOT NULL')
            ->orderBy('t.formation', 'ASC')
            ->getQuery()
            ->getResult();

        $formationList = array_map(fn($formation) => $formation['formation'], $formations);

        return new JsonResponse([
            'success' => true,
            'data' => $formationList
        ]);
    }

    private function updateTestimonialFromData(Testimonial $testimonial, array $data): void
    {
        if (isset($data['clientName'])) {
            $testimonial->setClientName($data['clientName']);
        }
        if (isset($data['clientJob'])) {
            $testimonial->setClientJob($data['clientJob']);
        }
        if (isset($data['clientCompany'])) {
            $testimonial->setClientCompany($data['clientCompany']);
        }
        if (isset($data['content'])) {
            $testimonial->setContent($data['content']);
        }
        if (isset($data['rating'])) {
            $testimonial->setRating($data['rating']);
        }
        if (isset($data['formation'])) {
            $testimonial->setFormation($data['formation']);
        }
        if (isset($data['clientImage'])) {
            $testimonial->setClientImage($data['clientImage']);
        }
        if (isset($data['isActive'])) {
            $testimonial->setIsActive($data['isActive']);
        }
        if (isset($data['isFeatured'])) {
            $testimonial->setIsFeatured($data['isFeatured']);
        }
        if (isset($data['testimonialDate'])) {
            $testimonial->setTestimonialDate(new \DateTime($data['testimonialDate']));
        }
    }

    private function serializeTestimonial(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->getId(),
            'clientName' => $testimonial->getClientName(),
            'clientJob' => $testimonial->getClientJob(),
            'clientCompany' => $testimonial->getClientCompany(),
            'content' => $testimonial->getContent(),
            'rating' => $testimonial->getRating(),
            'formation' => $testimonial->getFormation(),
            'clientImage' => $testimonial->getClientImage(),
            'isActive' => $testimonial->isActive(),
            'isFeatured' => $testimonial->isFeatured(),
            'testimonialDate' => $testimonial->getTestimonialDate()?->format('Y-m-d'),
            'createdAt' => $testimonial->getCreatedAt()?->format('c'),
            'updatedAt' => $testimonial->getUpdatedAt()?->format('c')
        ];
    }
}
