<?php

namespace App\Controller\Admin;

use App\Entity\Payment;
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

class PaymentCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Payment::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Paiement')
            ->setEntityLabelInPlural('Paiements')
            ->setSearchFields(['transactionId', 'method', 'status', 'user.email'])
            ->setDefaultSort(['createdAt' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('transactionId', 'ID Transaction')
            ->hideOnForm();
        yield AssociationField::new('user', 'Client');
        yield MoneyField::new('amount', 'Montant')
            ->setCurrency('EUR');
        yield ChoiceField::new('method', 'Méthode')
            ->setChoices([
                'Carte bancaire' => 'card',
                'Virement' => 'transfer',
                'CPF' => 'cpf'
            ]);
        yield ChoiceField::new('status', 'Statut')
            ->setChoices([
                'En attente' => 'pending',
                'Complété' => 'completed',
                'Échoué' => 'failed',
                'Remboursé' => 'refunded'
            ])
            ->renderAsBadges([
                'pending' => 'warning',
                'completed' => 'success',
                'failed' => 'danger',
                'refunded' => 'info'
            ]);

        if ($pageName === Crud::PAGE_DETAIL || $pageName === Crud::PAGE_INDEX) {
            yield AssociationField::new('invoice', 'Facture');
            yield DateTimeField::new('createdAt', 'Date de création');
            yield DateTimeField::new('completedAt', 'Date de réalisation')
                ->hideOnIndex();
        }
    }

    public function configureActions(Actions $actions): Actions
    {
        $refundAction = Action::new('refund', 'Rembourser')
            ->linkToRoute('payment_refund', function (Payment $payment): array {
                return [
                    'id' => $payment->getId(),
                ];
            })
            ->displayIf(static function (Payment $payment): bool {
                return $payment->getStatus() === 'completed';
            });

        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_DETAIL, $refundAction)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE]);
    }
}