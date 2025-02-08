<?php

namespace App\Controller\Admin;

use App\Entity\Invoice;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;

class InvoiceCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Invoice::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Facture')
            ->setEntityLabelInPlural('Factures')
            ->setSearchFields(['invoiceNumber', 'status', 'user.email'])
            ->setDefaultSort(['createdAt' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('invoiceNumber', 'Numéro de facture')
            ->hideOnForm();
        yield AssociationField::new('user', 'Client');
        yield MoneyField::new('amount', 'Montant')
            ->setCurrency('EUR');
        yield ChoiceField::new('status', 'Statut')
            ->setChoices([
                'En attente' => 'pending',
                'Payée' => 'paid',
                'Annulée' => 'cancelled'
            ])
            ->renderAsBadges([
                'pending' => 'warning',
                'paid' => 'success',
                'cancelled' => 'danger'
            ]);
        yield DateTimeField::new('dueDate', 'Date d\'échéance')
            ->setFormat('dd/MM/yyyy')
            ->renderAsNativeWidget();
        yield TextareaField::new('billingDetails', 'Détails de facturation')
            ->hideOnIndex();

        if ($pageName === Crud::PAGE_DETAIL || $pageName === Crud::PAGE_INDEX) {
            yield AssociationField::new('payment', 'Paiement');
            yield AssociationField::new('reservation', 'Réservation');
            yield DateTimeField::new('createdAt', 'Date de création');
            yield DateTimeField::new('updatedAt', 'Dernière modification')
                ->hideOnIndex();
        }
    }

    public function configureActions(Actions $actions): Actions
    {
        $downloadPDF = Action::new('downloadPDF', 'Télécharger PDF')
            ->linkToRoute('invoice_download', function (Invoice $invoice): array {
                return [
                    'id' => $invoice->getId(),
                ];
            })
            ->addCssClass('btn btn-primary')
            ->setIcon('fa fa-file-pdf');

        $sendEmail = Action::new('sendEmail', 'Envoyer par email')
            ->linkToRoute('invoice_send', function (Invoice $invoice): array {
                return [
                    'id' => $invoice->getId(),
                ];
            })
            ->addCssClass('btn btn-info')
            ->setIcon('fa fa-envelope');

        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_DETAIL, $downloadPDF)
            ->add(Crud::PAGE_DETAIL, $sendEmail)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE]);
    }
}