<?php

namespace App\Controller;

use App\Entity\Document;
use App\Repository\DocumentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class DocumentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private DocumentRepository $documentRepository,
        private string $documentDirectory,
        private SluggerInterface $slugger
    ) {
    }

    #[Route('/documents', name: 'document_list', methods: ['GET'])]
    public function index(): Response
    {
        $documents = $this->documentRepository->findBy(['private' => false]);
        return $this->render('document/index.html.twig', [
            'documents' => $documents,
        ]);
    }

    #[Route('/admin/documents/new', name: 'document_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($request->isMethod('POST')) {
            $document = new Document();
            $document->setTitle($request->request->get('title'));
            $document->setType($request->request->get('type'));
            $document->setCategory($request->request->get('category'));
            $document->setPrivate($request->request->getBoolean('private'));
            $document->setUploadedBy($this->getUser());

            $file = $request->files->get('file');
            if ($file) {
                $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $this->slugger->slug($originalFilename);
                $newFilename = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

                try {
                    $file->move(
                        $this->documentDirectory,
                        $newFilename
                    );
                    $document->setFileName($newFilename);
                } catch (FileException $e) {
                    $this->addFlash('error', 'Une erreur est survenue lors du téléchargement du fichier');
                    return $this->redirectToRoute('document_new');
                }
            }

            $this->entityManager->persist($document);
            $this->entityManager->flush();

            return $this->redirectToRoute('document_list');
        }

        return $this->render('admin/document/new.html.twig');
    }

    #[Route('/documents/{id}', name: 'document_show', methods: ['GET'])]
    public function show(Document $document): Response
    {
        if ($document->isPrivate() && !$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        return $this->render('document/show.html.twig', [
            'document' => $document,
        ]);
    }

    #[Route('/admin/documents/{id}/delete', name: 'document_delete', methods: ['POST'])]
    public function delete(Document $document): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        // Supprimer le fichier physique
        if ($document->getFileName()) {
            $filepath = $this->documentDirectory.'/'.$document->getFileName();
            if (file_exists($filepath)) {
                unlink($filepath);
            }
        }

        $this->entityManager->remove($document);
        $this->entityManager->flush();

        return $this->redirectToRoute('document_list');
    }

    #[Route('/documents/{id}/download', name: 'document_download', methods: ['GET'])]
    public function download(Document $document): Response
    {
        if ($document->isPrivate() && !$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $filepath = $this->documentDirectory.'/'.$document->getFileName();
        if (!file_exists($filepath)) {
            throw $this->createNotFoundException('Document non trouvé');
        }

        return $this->file($filepath);
    }

    #[Route('/documents/category/{category}', name: 'document_by_category', methods: ['GET'])]
    public function byCategory(string $category): Response
    {
        $documents = $this->documentRepository->findByCategoryAndType($category, 'public');
        
        return $this->render('document/category.html.twig', [
            'documents' => $documents,
            'category' => $category,
        ]);
    }
}