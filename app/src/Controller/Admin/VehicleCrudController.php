<?php

namespace App\Controller\Admin;

use App\Entity\Vehicle;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
class VehicleCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Vehicle::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Véhicule')
            ->setEntityLabelInPlural('Véhicules')
            ->setSearchFields(['model', 'plate', 'category'])
            ->setDefaultSort(['model' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('model', 'Modèle');
        yield TextField::new('plate', 'Immatriculation');
        yield NumberField::new('year', 'Année');
        yield ChoiceField::new('status', 'Statut')
            ->setChoices([
                'Disponible' => 'available',
                'En location' => 'rented',
                'En maintenance' => 'maintenance'
            ])
            ->renderAsBadges([
                'available' => 'success',
                'rented' => 'warning',
                'maintenance' => 'danger'
            ]);
        yield NumberField::new('dailyRate', 'Tarif journalier')
            ->setNumDecimals(2);
        yield ChoiceField::new('category', 'Catégorie')
            ->setChoices([
                'Berline' => 'berline',
                'Monospace' => 'monospace',
                'SUV' => 'suv'
            ]);
        yield BooleanField::new('isActive', 'Actif');

        if ($pageName === Crud::PAGE_INDEX || $pageName === Crud::PAGE_DETAIL) {
            yield DateTimeField::new('createdAt', 'Créé le');
            yield DateTimeField::new('updatedAt', 'Mis à jour le');
        }
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_EDIT, Action::SAVE_AND_ADD_ANOTHER)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE]);
    }
}
