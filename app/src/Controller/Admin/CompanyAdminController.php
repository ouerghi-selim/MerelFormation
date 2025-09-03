<?php

namespace App\Controller\Admin;

use App\Entity\Company;
use App\Repository\CompanyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/companies', name: 'admin_companies_')]
class CompanyAdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CompanyRepository $companyRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $companies = $this->companyRepository->findAll();
        
        return $this->json($companies, 200, [], ['groups' => ['company:read']]);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $company = $this->companyRepository->find($id);
        
        if (!$company) {
            return $this->json(['message' => 'Entreprise non trouvée'], 404);
        }
        
        return $this->json($company, 200, [], ['groups' => ['company:read']]);
    }

    /**
     * @Route("", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        
        // Vérifier que le SIRET n'existe pas déjà
        $existingCompany = $this->companyRepository->findOneBy(['siret' => $data['siret']]);
        if ($existingCompany) {
            return $this->json([
                'message' => 'Ce numéro SIRET est déjà utilisé',
                'violations' => [
                    ['propertyPath' => 'siret', 'message' => 'Ce numéro SIRET est déjà utilisé']
                ]
            ], 422);
        }

        $company = new Company();
        $company->setName($data['name'])
                ->setSiret($data['siret'])
                ->setAddress($data['address'])
                ->setPostalCode($data['postalCode'])
                ->setCity($data['city'])
                ->setResponsableName($data['responsableName'])
                ->setEmail($data['email'])
                ->setPhone($data['phone'])
                ->setIsActive(true);

        // Valider l'entité
        $errors = $this->validator->validate($company);
        if (count($errors) > 0) {
            $violations = [];
            foreach ($errors as $error) {
                $violations[] = [
                    'propertyPath' => $error->getPropertyPath(),
                    'message' => $error->getMessage()
                ];
            }
            return $this->json([
                'message' => 'Données invalides',
                'violations' => $violations
            ], 422);
        }

        $this->entityManager->persist($company);
        $this->entityManager->flush();
        
        return $this->json($company, 201, [], ['groups' => ['company:read']]);
    }

    /**
     * @Route("/{id}", name="update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $company = $this->companyRepository->find($id);
        
        if (!$company) {
            return $this->json(['message' => 'Entreprise non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        // Vérifier que le SIRET n'existe pas déjà (sauf pour cette entreprise)
        if (isset($data['siret']) && $data['siret'] !== $company->getSiret()) {
            $existingCompany = $this->companyRepository->findOneBy(['siret' => $data['siret']]);
            if ($existingCompany && $existingCompany->getId() !== $company->getId()) {
                return $this->json([
                    'message' => 'Ce numéro SIRET est déjà utilisé',
                    'violations' => [
                        ['propertyPath' => 'siret', 'message' => 'Ce numéro SIRET est déjà utilisé']
                    ]
                ], 422);
            }
        }

        // Mettre à jour les champs
        if (isset($data['name'])) {
            $company->setName($data['name']);
        }
        if (isset($data['siret'])) {
            $company->setSiret($data['siret']);
        }
        if (isset($data['address'])) {
            $company->setAddress($data['address']);
        }
        if (isset($data['postalCode'])) {
            $company->setPostalCode($data['postalCode']);
        }
        if (isset($data['city'])) {
            $company->setCity($data['city']);
        }
        if (isset($data['responsableName'])) {
            $company->setResponsableName($data['responsableName']);
        }
        if (isset($data['email'])) {
            $company->setEmail($data['email']);
        }
        if (isset($data['phone'])) {
            $company->setPhone($data['phone']);
        }
        if (isset($data['isActive'])) {
            $company->setIsActive($data['isActive']);
        }

        // Valider l'entité (sans la contrainte UniqueEntity car on l'a vérifiée manuellement)
        $errors = $this->validator->validate($company, null, ['Default']);
        if (count($errors) > 0) {
            $violations = [];
            foreach ($errors as $error) {
                // Ignorer l'erreur de SIRET unique car on l'a gérée manuellement
                if ($error->getPropertyPath() === 'siret' && strpos($error->getMessage(), 'déjà utilisé') !== false) {
                    continue;
                }
                $violations[] = [
                    'propertyPath' => $error->getPropertyPath(),
                    'message' => $error->getMessage()
                ];
            }
            if (!empty($violations)) {
                return $this->json([
                    'message' => 'Données invalides',
                    'violations' => $violations
                ], 422);
            }
        }

        $this->entityManager->flush();
        
        return $this->json($company, 200, [], ['groups' => ['company:read']]);
    }

    /**
     * @Route("/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur est admin
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $company = $this->companyRepository->find($id);
        
        if (!$company) {
            return $this->json(['message' => 'Entreprise non trouvée'], 404);
        }

        // Soft delete : marquer comme inactive plutôt que supprimer
        $company->setIsActive(false);
        $this->entityManager->flush();
        
        return $this->json(['message' => 'Entreprise désactivée avec succès']);
    }
}