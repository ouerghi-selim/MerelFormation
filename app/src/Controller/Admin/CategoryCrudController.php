<?php

namespace App\Controller\Admin;

use App\Entity\Category;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;

class CategoryCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Category::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Catégorie')
            ->setEntityLabelInPlural('Catégories')
            ->setSearchFields(['name', 'description'])
            ->setDefaultSort(['lft' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('name', 'Nom');
        yield TextEditorField::new('description')
            ->hideOnIndex();
        yield TextField::new('slug')
            ->hideOnForm();
        yield AssociationField::new('parent', 'Catégorie parente')
            ->setRequired(false);
        yield BooleanField::new('isActive', 'Active');

        // Champs pour l'arborescence
        if ($pageName === Crud::PAGE_INDEX) {
            yield IntegerField::new('level', 'Niveau')
                ->setTemplatePath('admin/field/tree_level.html.twig');
        }

        if ($pageName === Crud::PAGE_DETAIL) {
            yield AssociationField::new('children', 'Sous-catégories');
            yield AssociationField::new('formations', 'Formations');
        }
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_EDIT, Action::SAVE_AND_ADD_ANOTHER)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE])
            // Action personnalisée pour réorganiser l'arbre
            ->add(Crud::PAGE_INDEX, Action::new('reorder', 'Réorganiser')
                ->linkToCrudAction('reorderTree')
                ->addCssClass('btn btn-primary'));
    }

    public function reorderTree()
    {
        // Page de réorganisation des catégories avec interface drag & drop
        return $this->render('admin/category/reorder.html.twig', [
            'categories' => $this->getDoctrine()->getRepository(Category::class)->getHierarchy(),
        ]);
    }
}
