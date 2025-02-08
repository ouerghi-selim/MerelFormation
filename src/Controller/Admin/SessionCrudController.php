<?php

namespace App\Controller\Admin;

use App\Entity\Session;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;

class SessionCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Session::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Session')
            ->setEntityLabelInPlural('Sessions')
            ->setSearchFields(['formation.title', 'location', 'status'])
            ->setDefaultSort(['startDate' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('formation', 'Formation');
        yield DateTimeField::new('startDate', 'Date de début')
            ->setFormat('dd/MM/yyyy HH:mm')
            ->renderAsNativeWidget();
        yield DateTimeField::new('endDate', 'Date de fin')
            ->setFormat('dd/MM/yyyy HH:mm')
            ->renderAsNativeWidget();
        yield IntegerField::new('maxParticipants', 'Places max.');
        yield TextField::new('location', 'Lieu');
        yield ChoiceField::new('status', 'Statut')
            ->setChoices([
                'Planifiée' => 'scheduled',
                'En cours' => 'ongoing',
                'Terminée' => 'completed',
                'Annulée' => 'cancelled'
            ])
            ->renderAsBadges([
                'scheduled' => 'primary',
                'ongoing' => 'success',
                'completed' => 'info',
                'cancelled' => 'danger'
            ]);
        yield TextField::new('notes', 'Notes')
            ->hideOnIndex();

        if ($pageName === Crud::PAGE_DETAIL || $pageName === Crud::PAGE_INDEX) {
            yield CollectionField::new('participants', 'Participants')
                ->setTemplatePath('admin/field/participants.html.twig');
            yield CollectionField::new('reservations', 'Réservations')
                ->onlyOnDetail();
            yield CollectionField::new('documents', 'Documents')
                ->onlyOnDetail();
        }
    }

    public function configureActions(Actions $actions): Actions
    {
        $exportPDF = Action::new('exportPDF', 'Exporter PDF')
            ->linkToRoute('session_export_pdf', function (Session $session): array {
                return [
                    'id' => $session->getId(),
                ];
            })
            ->addCssClass('btn btn-primary')
            ->setIcon('fa fa-file-pdf');

        $manageParticipants = Action::new('manageParticipants', 'Gérer participants')
            ->linkToRoute('session_manage_participants', function (Session $session): array {
                return [
                    'id' => $session->getId(),
                ];
            })
            ->addCssClass('btn btn-info')
            ->setIcon('fa fa-users');

        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_DETAIL, $exportPDF)
            ->add(Crud::PAGE_DETAIL, $manageParticipants)
            ->add(Crud::PAGE_EDIT, Action::SAVE_AND_ADD_ANOTHER)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE]);
    }
}