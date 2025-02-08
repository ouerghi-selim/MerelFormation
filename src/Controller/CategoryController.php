<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

class CategoryController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CategoryRepository $categoryRepository,
        private SluggerInterface $slugger
    ) {
    }

    #[Route('/categories', name: 'category_list', methods: ['GET'])]
    public function index(): Response
    {
        $categories = $this->categoryRepository->findActiveWithFormationsCount();
        return $this->render('category/index.html.twig', [
            'categories' => $categories,
        ]);
    }

    #[Route('/admin/categories/new', name: 'category_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $category = new Category();
            $category->setName($request->request->get('name'));
            $category->setDescription($request->request->get('description'));
            $category->setParent($request->request->get('parentId') ? 
                $this->categoryRepository->find($request->request->get('parentId')) : null
            );

            $this->entityManager->persist($category);
            $this->entityManager->flush();

            return $this->redirectToRoute('category_list');
        }

        $parentCategories = $this->categoryRepository->findByLevel(0);
        return $this->render('admin/category/new.html.twig', [
            'parentCategories' => $parentCategories,
        ]);
    }

    #[Route('/admin/categories/{id}', name: 'category_edit', methods: ['GET', 'POST'])]
    public function edit(Category $category, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $category->setName($request->request->get('name'));
            $category->setDescription($request->request->get('description'));
            
            $parentId = $request->request->get('parentId');
            if ($parentId && $parentId != $category->getParent()?->getId()) {
                $parent = $this->categoryRepository->find($parentId);
                $category->setParent($parent);
            }

            $this->entityManager->flush();
            return $this->redirectToRoute('category_list');
        }

        $parentCategories = $this->categoryRepository->findByLevel(0);
        return $this->render('admin/category/edit.html.twig', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    #[Route('/admin/categories/{id}/delete', name: 'category_delete', methods: ['POST'])]
    public function delete(Category $category): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        if (!$category->getChildren()->isEmpty()) {
            $this->addFlash('error', 'Impossible de supprimer une catégorie contenant des sous-catégories');
            return $this->redirectToRoute('category_list');
        }

        if (!$category->getFormations()->isEmpty()) {
            $this->addFlash('error', 'Impossible de supprimer une catégorie contenant des formations');
            return $this->redirectToRoute('category_list');
        }

        $this->entityManager->remove($category);
        $this->entityManager->flush();

        return $this->redirectToRoute('category_list');
    }

    #[Route('/admin/categories/{id}/toggle', name: 'category_toggle', methods: ['POST'])]
    public function toggle(Category $category): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $category->setIsActive(!$category->getIsActive());
        $this->entityManager->flush();

        return $this->redirectToRoute('category_list');
    }

    #[Route('/categories/{id}/formations', name: 'category_formations', methods: ['GET'])]
    public function formations(Category $category): Response
    {
        return $this->render('category/formations.html.twig', [
            'category' => $category,
            'formations' => $category->getFormations(),
        ]);
    }

    #[Route('/admin/categories/reorder', name: 'category_reorder', methods: ['POST'])]
    public function reorder(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $positions = json_decode($request->getContent(), true);
        
        foreach ($positions as $position) {
            $category = $this->categoryRepository->find($position['id']);
            if ($category) {
                $parent = $position['parentId'] ? 
                    $this->categoryRepository->find($position['parentId']) : null;
                $category->setParent($parent);
            }
        }

        $this->entityManager->flush();
        return $this->json(['success' => true]);
    }
}