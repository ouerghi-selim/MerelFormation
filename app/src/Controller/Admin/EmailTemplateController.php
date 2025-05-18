<?php

namespace App\Controller\Admin;

use App\Entity\EmailTemplate;
use App\Repository\EmailTemplateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * @Route("/api/admin/email-templates")
 */
class EmailTemplateController extends AbstractController
{
    private $entityManager;
    private $emailTemplateRepository;
    private $serializer;
    private $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        EmailTemplateRepository $emailTemplateRepository,
        SerializerInterface $serializer,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->emailTemplateRepository = $emailTemplateRepository;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    /**
     * @Route("", methods={"GET"})
     */
    public function list(): JsonResponse
    {
        $templates = $this->emailTemplateRepository->findAll();

        // Transformer les entités en tableaux associatifs
        $data = array_map(function($template) {
            return [
                'id' => $template->getId(),
                'name' => $template->getName(),
                'subject' => $template->getSubject(),
                'content' => $template->getContent(),
                'type' => $template->getType(),
                'variables' => $template->getVariables() ?: [], // Assure que variables est toujours un tableau
            ];
        }, $templates);

        return new JsonResponse($data);
    }

    /**
     * @Route("/{id}", methods={"GET"})
     */
    public function show(int $id): JsonResponse
    {
        $template = $this->emailTemplateRepository->find($id);

        if (!$template) {
            return $this->json(['message' => 'Template non trouvé'], 404);
        }
// Transformer les entités en tableaux associatifs
        $data =[
                'id' => $template->getId(),
                'name' => $template->getName(),
                'subject' => $template->getSubject(),
                'content' => $template->getContent(),
                'type' => $template->getType(),
                'variables' => $template->getVariables() ?: [], // Assure que variables est toujours un tableau
            ];

        return new JsonResponse($data);
//        return $this->json($template, 200, [], ['groups' => 'template:read']);
    }

    /**
     * @Route("", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $template = new EmailTemplate();
        $template->setName($data['name']);
        $template->setSubject($data['subject']);
        $template->setContent($data['content']);
        $template->setType($data['type']);
        $template->setVariables($data['variables'] ?? []);

        $errors = $this->validator->validate($template);
        if (count($errors) > 0) {
            return $this->json(['message' => (string) $errors], 400);
        }

        $this->entityManager->persist($template);
        $this->entityManager->flush();

        return $this->json($template, 201, [], ['groups' => 'template:read']);
    }

    /**
     * @Route("/{id}", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $template = $this->emailTemplateRepository->find($id);

        if (!$template) {
            return $this->json(['message' => 'Template non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $template->setName($data['name'] ?? $template->getName());
        $template->setSubject($data['subject'] ?? $template->getSubject());
        $template->setContent($data['content'] ?? $template->getContent());
        $template->setType($data['type'] ?? $template->getType());

        if (isset($data['variables'])) {
            $template->setVariables($data['variables']);
        }

        $errors = $this->validator->validate($template);
        if (count($errors) > 0) {
            return $this->json(['message' => (string) $errors], 400);
        }

        $this->entityManager->flush();

        return $this->json($template, 200, [], ['groups' => 'template:read']);
    }

    /**
     * @Route("/{id}", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        $template = $this->emailTemplateRepository->find($id);

        if (!$template) {
            return $this->json(['message' => 'Template non trouvé'], 404);
        }

        $this->entityManager->remove($template);
        $this->entityManager->flush();

        return $this->json(['message' => 'Template supprimé avec succès']);
    }

    /**
     * @Route("/{id}/preview", methods={"POST"})
     */
    public function preview(int $id, Request $request): JsonResponse
    {
        $template = $this->emailTemplateRepository->find($id);

        if (!$template) {
            return $this->json(['message' => 'Template non trouvé'], 404);
        }

        $testData = json_decode($request->getContent(), true);

        // Remplacer les variables dans le template
        $content = $template->getContent();
        $subject = $template->getSubject();

        foreach ($testData as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
            $subject = str_replace('{{' . $key . '}}', $value, $subject);
        }

        return $this->json([
            'subject' => $subject,
            'content' => $content
        ]);
    }

    /**
     * @Route("/{id}/duplicate", methods={"POST"})
     */
    public function duplicate(int $id, Request $request): JsonResponse
    {
        $template = $this->emailTemplateRepository->find($id);

        if (!$template) {
            return $this->json(['message' => 'Template non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $newName = $data['name'] ?? $template->getName() . ' (copie)';

        $newTemplate = new EmailTemplate();
        $newTemplate->setName($newName);
        $newTemplate->setSubject($template->getSubject());
        $newTemplate->setContent($template->getContent());
        $newTemplate->setType($template->getType());
        $newTemplate->setVariables($template->getVariables());

        $this->entityManager->persist($newTemplate);
        $this->entityManager->flush();

        return $this->json($newTemplate, 201, [], ['groups' => 'template:read']);
    }
}