<?php

namespace App\Controller\Admin;

use App\Entity\Document;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use Vich\UploaderBundle\Form\Type\VichFileType;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;

class DocumentCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Document::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Document')
            ->setEntityLabelInPlural('Documents')
            ->setSearchFields(['title', 'fileName', 'type', 'category'])
            ->setDefaultSort(['uploadedAt' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('title', 'Titre');
        yield ChoiceField::new('type', 'Type')
            ->setChoices([
                'PDF' => 'pdf',
                'Word' => 'doc',
                'Excel' => 'docx'
            ]);
        yield ChoiceField::new('category', 'Catégorie')
            ->setChoices([
                'Support' => 'support',
                'Contrat' => 'contrat',
                'Attestation' => 'attestation',
                'Facture' => 'facture'
            ]);
        yield Field::new('file', 'Fichier')
            ->setFormType(VichFileType::class)
            ->onlyOnForms();
        yield TextField::new('fileName', 'Nom du fichier')
            ->hideOnForm();
        yield AssociationField::new('uploadedBy', 'Téléchargé par')
            ->hideOnForm();
        yield AssociationField::new('formation', 'Formation associée')
            ->setRequired(false);
        yield BooleanField::new('private', 'Privé');
        yield DateTimeField::new('uploadedAt', 'Date d\'upload')
            ->hideOnForm();
        yield DateTimeField::new('updatedAt', 'Dernière modification')
            ->hideOnForm();
    }

    public function configureActions(Actions $actions): Actions
    {
        $downloadAction = Action::new('download', 'Télécharger')
            ->linkToRoute('document_download', function (Document $document): array {
                return [
                    'id' => $document->getId(),
                ];
            })
            ->addCssClass('btn btn-success');

        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_INDEX, $downloadAction)
            ->add(Crud::PAGE_DETAIL, $downloadAction)
            ->add(Crud::PAGE_EDIT, Action::SAVE_AND_ADD_ANOTHER)
            ->reorder(Crud::PAGE_INDEX, [Action::DETAIL, Action::EDIT, Action::DELETE]);
    }
}
