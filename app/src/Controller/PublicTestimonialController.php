<?php

namespace App\Controller;

use App\Entity\Testimonial;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/testimonials', name: 'api_testimonials_')]
class PublicTestimonialController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/featured', name: 'featured', methods: ['GET'])]
    public function getFeatured(): JsonResponse
    {
        try {
            $testimonials = $this->entityManager->getRepository(Testimonial::class)
                ->findBy(
                    ['isFeatured' => true, 'isActive' => true], 
                    ['createdAt' => 'DESC']
                    // Pas de limite - afficher tous les témoignages en vedette
                );

            return new JsonResponse([
                'success' => true,
                'data' => array_map([$this, 'serializeTestimonial'], $testimonials)
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors du chargement des témoignages',
                'data' => []
            ], 500);
        }
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        try {
            $testimonials = $this->entityManager->getRepository(Testimonial::class)
                ->findBy(
                    ['isActive' => true], 
                    ['isFeatured' => 'DESC', 'createdAt' => 'DESC'],
                    20 // Limiter à 20 témoignages max pour la page publique
                );

            return new JsonResponse([
                'success' => true,
                'data' => array_map([$this, 'serializeTestimonial'], $testimonials)
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors du chargement des témoignages',
                'data' => []
            ], 500);
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
            'testimonialDate' => $testimonial->getTestimonialDate()?->format('Y-m-d')
        ];
    }
}