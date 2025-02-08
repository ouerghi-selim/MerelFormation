<?php

namespace App\Controller\Admin;

use App\Entity\VehicleRental;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;

class VehicleRentalCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return VehicleRental::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Location')
            ->setEntityLabelInPlural('Locations')
            ->setSearchFields(['vehicle.model', 'user.email', 'status'])
            ->setDefaultSort(['startDate' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('user', 'Client');
        yield AssociationField::new('vehicle', 'Véhicule');
        yield DateTimeField::new('startDate', 'Date de début')
            ->setFormat('dd/MM/yyyy HH:mm')
            ->renderAsNativeWidget();
        yield DateTimeField::new('endDate', 'Date de fin')
            ->setFormat('dd/MM/yyyy HH:mm')
            ->renderAsNativeWidget();
        yield MoneyField::new('totalPrice', 'Prix total')
            ->setCurrency('EUR')
            ->hideOnForm();
        yield ChoiceField::new('status', 'Statut')
            ->setChoices([
                'En attente' => 'pending',
                'Confirmée' => 'confirmed',
                'En cours' => 'in_progress',
                'Terminée' => 'completed',
                'Annulée' => 'cancelled'
            ])
            ->renderAsBadges([
                'pending' => 'warning',
                'confirmed' => 'primary',
                'in_progress' => 'success',
                'completed' => 'info',
                'cancelled' => 'danger'
            ]);
        yield TextField::new('pickupLocation', 'Lieu de prise en charge');
        yield TextField::new('returnLocation', 'Lieu de retour');
        yield TextareaField::new('notes', 'Notes')
            ->hideOnIndex();

        if ($pageName === Crud::PAGE_DETAIL) {
            yield AssociationField::new('invoice', 'Facture');
            yield DateTimeField::new('createdAt', 'Créé le');
            yield DateTimeField::new('updatedAt', 'Mis à jour le');
        }
    }

    public function configureActions(Actions $actions): Actions
    {
        $generateInvoice = Action::new('generateInvoice', 'Générer facture')
            ->linkToRoute('rental_generate_invoice', function (VehicleRental $rental): array {
                return [
                    'id' => $rental->getId(),
                ];
            })
            ->displayIf(static function (VehicleRental $rental): bool {
                return $rental->getStatus() === 'completed' && $rental->getInvoice() === null;
            });

        $printContract = Action::new('printContract', 'Imprimer contrat')
            ->linkToRoute('rental_print_contract', function (VehicleRental $rental): array {
                return [
                    'id' => $rental->getId(),
                ];
            })
            ->displayIf(static function (VehicleRental $rental): bool {
                return $rental->getStatus() === 'confirmed';
            });

        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_DETAIL, $generateInvoice)
            ->add(Crud::PAGE_DETAIL, $printContract)
            ->add(Crud::PAGE_EDIT, Action::SAVE_AND_ADD_ANOTHER)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE]);
    }
}