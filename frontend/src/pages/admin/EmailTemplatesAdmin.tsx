import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminEmailTemplatesApi } from '../../services/api';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    content: string;
    type: string;
    variables: string[];
    isSystem: boolean;
    identifier: string;
    targetRole: string | null;
    eventType: string;
}

// Ajouter une fonction pour formater l'affichage du rôle cible
const formatRole = (targetRole: string | null): string => {
    if (!targetRole) return 'Tous les rôles';

    const roles: { [key: string]: string } = {
        'ROLE_ADMIN': 'Administrateur',
        'ROLE_STUDENT': 'Étudiant',
        'ROLE_INSTRUCTOR': 'Formateur'
    };

    return roles[targetRole] || targetRole;
};

const EmailTemplatesAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [testData, setTestData] = useState<{[key: string]: string}>({});
    const [previewContent, setPreviewContent] = useState<{subject: string, content: string}>({subject: '', content: ''});
    const [processing, setProcessing] = useState(false);

    // Utiliser le hook personnalisé pour charger les données
    const { data: templates, loading, error, setData: setTemplates, refetch } = useDataFetching<EmailTemplate>({
        fetchFn: adminEmailTemplatesApi.getAll
    });

    // Formater le type de template
    const formatType = (type: string): string => {
        const types: { [key: string]: string } = {
            'notification': 'Notification',
            'reservation': 'Réservation',
            'invoice': 'Facturation',
            'reminder': 'Rappel',
            'welcome': 'Bienvenue'
        };
        return types[type] || type;
    };

    // Ouvrir la modal de prévisualisation
    const openPreviewModal = (template: EmailTemplate) => {
        setSelectedTemplate(template);

        // Préparer des valeurs de test réalistes en fonction du nom de la variable
        const initialTestData: {[key: string]: string} = {};
        template.variables.forEach(variable => {
            // Générer des valeurs de test plus naturelles selon le type de variable
            switch(variable.toLowerCase()) {
                case 'adminname':
                case 'username':
                case 'firstname':
                    initialTestData[variable] = 'Jean';
                    break;
                case 'lastname':
                    initialTestData[variable] = 'Dupont';
                    break;
                case 'studentname':
                case 'name':
                    initialTestData[variable] = 'Jean Dupont';
                    break;
                case 'email':
                    initialTestData[variable] = 'jean.dupont@example.com';
                    break;
                case 'formationtitle':
                case 'formation':
                    initialTestData[variable] = 'Formation Initiale Taxi';
                    break;
                case 'sessiondate':
                case 'date':
                case 'startdate':
                    initialTestData[variable] = '25/06/2025';
                    break;
                case 'enddate':
                    initialTestData[variable] = '30/06/2025';
                    break;
                case 'reservationid':
                case 'rentalid':
                case 'id':
                    initialTestData[variable] = '12345';
                    break;
                case 'examcenter':
                case 'center':
                case 'location':
                    initialTestData[variable] = 'Centre d\'examen de Marseille';
                    break;
                case 'vehicleinfo':
                case 'vehicle':
                    initialTestData[variable] = 'Peugeot 308 (AB-123-CD)';
                    break;
                default:
                    // Pour les variables non reconnues, offrir un texte générique mais explicite
                    initialTestData[variable] = `Exemple de ${variable}`;
            }
        });

        setTestData(initialTestData);

        // Générer la prévisualisation initiale
        generatePreview(template, initialTestData);
        setShowPreviewModal(true);
    };

    // Générer la prévisualisation
    const generatePreview = (template: EmailTemplate, data: {[key: string]: string}) => {
        let subject = template.subject;
        let content = template.content;

        // Remplacer les variables
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, value);
            content = content.replace(regex, value);
        });

        setPreviewContent({ subject, content });
    };

    // Mettre à jour les données de test et générer une nouvelle prévisualisation
    const handleTestDataChange = (key: string, value: string) => {
        const newTestData = { ...testData, [key]: value };
        setTestData(newTestData);
        if (selectedTemplate) {
            generatePreview(selectedTemplate, newTestData);
        }
    };

    // Ouvrir la modal de suppression
    const openDeleteModal = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setShowDeleteModal(true);
    };

    // Supprimer un template
    const handleDelete = async () => {
        if (!selectedTemplate) return;

        try {
            setProcessing(true);
            await adminEmailTemplatesApi.delete(selectedTemplate.id);

            // Mettre à jour la liste des templates
            setTemplates({ ...templates, data: templates.data.filter(t => t.id !== selectedTemplate.id) });
            addToast('Template supprimé avec succès', 'success');
            setShowDeleteModal(false);
        } catch (err) {
            console.error('Error deleting template:', err);
            addToast('Erreur lors de la suppression du template', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Dupliquer un template
    const handleDuplicate = async (template: EmailTemplate) => {
        try {
            setProcessing(true);
            const response = await adminEmailTemplatesApi.duplicate(template.id, { name: `${template.name} (copie)` });

            // Mettre à jour la liste des templates
            await refetch();
            addToast('Template dupliqué avec succès', 'success');
        } catch (err) {
            console.error('Error duplicating template:', err);
            addToast('Erreur lors de la duplication du template', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Nom',
            field: 'name' as keyof EmailTemplate,
            sortable: true
        },
        {
            title: 'Type d\'événement',
            field: (row: EmailTemplate) => formatEventType(row.eventType),
            sortable: true
        },
        {
            title: 'Destinataire',
            field: (row: EmailTemplate) => formatRole(row.targetRole),
            sortable: true
        },
        {
            title: 'Type',
            field: (row: EmailTemplate) => formatType(row.type),
            sortable: true
        },
        {
            title: 'Sujet',
            field: 'subject' as keyof EmailTemplate,
            sortable: true
        },
    ];


    // Fonction pour formater le type d'événement
    const formatEventType = (eventType: string): string => {
        const eventTypes: { [key: string]: string } = {
            'registration_confirmation': 'Confirmation d\'inscription',
            'vehicle_rental_confirmation': 'Confirmation de location de véhicule',
            'password_reset': 'Réinitialisation de mot de passe',
            // Autres types d'événements...
        };

        return eventTypes[eventType] || eventType;
    };
    // Rendu des actions pour chaque ligne
    const renderActions = (template: EmailTemplate) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => openPreviewModal(template)}
                className="text-purple-700 hover:text-purple-900"
                title="Prévisualiser"
            >
                <Eye className="h-5 w-5" />
            </button>
            <Link
                to={`/admin/email-templates/${template.id}/edit`}
                className="text-blue-700 hover:text-blue-900"
                title="Modifier"
            >
                <Edit className="h-5 w-5" />
            </Link>
            {!template.isSystem && (
                <>
                    <button
                        onClick={() => handleDuplicate(template)}
                        className="text-green-600 hover:text-green-900"
                        title="Dupliquer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => openDeleteModal(template)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </>
            )}
            {template.isSystem && (
                <button
                    onClick={() => handleDuplicate(template)}
                    className="text-green-600 hover:text-green-900"
                    title="Dupliquer (les templates système ne peuvent pas être supprimés)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des templates d'emails"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Templates d\'emails' }
                    ]}
                />

                <div className="p-6">
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => {/* Handle error closure */}}
                        />
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <Link
                            to="/admin/email-templates/new"
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nouveau template
                        </Link>
                    </div>

                    <DataTable<EmailTemplate>
                        data={templates.data || []}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        actions={renderActions}
                        searchFields={['name', 'subject']}
                        emptyMessage="Aucun template d'email trouvé"
                    />
                </div>
            </div>

            {/* Modal de prévisualisation */}
            <Modal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                title="Prévisualisation du template"
                footer={
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreviewModal(false)}
                        >
                            Fermer
                        </Button>
                    </div>
                }
                maxWidth="max-w-4xl"
            >
                {selectedTemplate && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 mb-4">
                                <h3 className="font-medium text-lg mb-2">Données de test</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Modifiez les valeurs ci-dessous pour voir comment elles apparaissent dans le template.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.keys(testData).map(key => (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {key}
                                            </label>
                                            <input
                                                type="text"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={testData[key]}
                                                onChange={(e) => handleTestDataChange(key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-gray-200 rounded-md">
                            <div className="border-b pb-3 mb-4">
                                <h3 className="font-medium mb-1">Sujet:</h3>
                                <div className="text-gray-700">{previewContent.subject}</div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Contenu:</h3>
                                <div
                                    className="prose max-w-none bg-gray-50 p-4 rounded-md border border-gray-200"
                                    dangerouslySetInnerHTML={{ __html: previewContent.content }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmer la suppression"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            loading={processing}
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    </div>
                }
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer le template "{selectedTemplate?.name}" ?
                    Cette action est irréversible.
                </p>
            </Modal>
        </div>
    );
};

export default EmailTemplatesAdmin;