<?php

namespace App\Controller\Api;

use App\Repository\CompanyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/public/companies')]
class CompanyPublicController extends AbstractController
{
    public function __construct(
        private CompanyRepository $companyRepository
    ) {}

    /**
     * Vérifier si un SIRET existe (API publique pour le formulaire de réservation)
     */
    #[Route('/check-siret/{siret}', name: 'api_public_company_check_siret', methods: ['GET'])]
    public function checkSiret(string $siret): JsonResponse
    {
        // Valider le format SIRET (14 chiffres)
        if (!preg_match('/^\d{14}$/', $siret)) {
            return $this->json([
                'exists' => false,
                'error' => 'Format SIRET invalide (14 chiffres requis)'
            ], 400);
        }

        // Chercher l'entreprise par SIRET
        $company = $this->companyRepository->findOneBy([
            'siret' => $siret,
            'isActive' => true
        ]);

        if (!$company) {
            return $this->json([
                'exists' => false,
                'message' => 'Entreprise non trouvée'
            ]);
        }

        // Retourner les informations de l'entreprise (seulement les infos nécessaires)
        return $this->json([
            'exists' => true,
            'company' => [
                'id' => $company->getId(),
                'name' => $company->getName(),
                'siret' => $company->getSiret(),
                'address' => $company->getAddress(),
                'postalCode' => $company->getPostalCode(),
                'city' => $company->getCity(),
                'responsableName' => $company->getResponsableName(),
                'email' => $company->getEmail(),
                'phone' => $company->getPhone()
            ]
        ]);
    }
}