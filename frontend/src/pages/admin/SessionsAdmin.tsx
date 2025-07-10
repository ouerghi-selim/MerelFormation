// src/pages/admin/SessionsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, Users, Eye } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import { adminSessionsApi, adminFormationsApi, documentsApi } from '@/services/api.ts';
import SessionForm from '../../components/admin/SessionForm';

interface Session {
    id: number;
    formation: {
        id: number;
        title: string;
    };
    startDate: string;
    endDate: string;
    maxParticipants: number;
    location: string;
    status: string;
    notes?: string;
    participants?: Array<any>;
    instructor?: {
        id: number;
        firstName: string;
        lastName: string;
    };
    instructors?: Array<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        specialization?: string;
    }>;
    documents?: Array<{
        id: number;
        title: string;
        type: string;
        fileSize: string;
        downloadUrl: string;
    }>;
}

interface Formation {
    id: number;
    title: string;
}

const SessionsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [loading, setLoading] = useState(true);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormation, setSelectedFormation] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [instructors, setInstructors] = useState<Array<{id: number, firstName: string, lastName: string}>>([]);
    const [loadingInstructors, setLoadingInstructors] = useState(false);
    const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
    const [showInspectModal, setShowInspectModal] = useState(false);
    const [sessionToInspect, setSessionToInspect] = useState<Session | null>(null);
    const [newDocuments, setNewDocuments] = useState<File[]>([]);
    
    // États pour les documents temporaires (nouveau système)
    const [tempDocuments, setTempDocuments] = useState<{tempId: string, document: any}[]>([]);
    const [pendingTempIds, setPendingTempIds] = useState<string[]>([]);

    const handleUnifiedSave = async (sessionData: any) => {
        try {
            setUpdating(true);
            await adminSessionsApi.update(sessionData.id, {
                ...sessionData,
                instructors: sessionData.instructors
            });
            setShowEditModal(false);
            setSessionToEdit(null);
            addToast('Session mise à jour avec succès', 'success');
        } catch (error) {
            console.error('Error updating session:', error);
            addToast('Erreur lors de la mise à jour', 'error');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch formations for the filter dropdown
                const formationsResponse = await adminFormationsApi.getAll();
                setFormations(formationsResponse.data);

                // Fetch sessions with filters
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (selectedFormation) params.append('formation', selectedFormation);
                if (selectedStatus) params.append('status', selectedStatus);

                const response = await adminSessionsApi.getAll(params.toString());
                setSessions(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError('Erreur lors du chargement des sessions');
                setLoading(false);
            }
        };

        fetchData();
    }, [searchTerm, selectedFormation, selectedStatus]);
    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                setLoadingInstructors(true);
                const response = await adminSessionsApi.getInstructors();
                setInstructors(response.data);
            } catch (err) {
                console.error('Error fetching instructors:', err);
            } finally {
                setLoadingInstructors(false);
            }
        };
        fetchInstructors();
    }, []);

    const confirmDelete = (session: Session) => {

        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!sessionToDelete) return;

        try {
            setUpdating(true);
            await adminSessionsApi.delete(sessionToDelete.id);
            setSessions(sessions.filter(s => s.id !== sessionToDelete.id));
            setShowDeleteModal(false);
            setSessionToDelete(null);
            addToast('Session supprimée avec succès', 'success');
        } catch (err) {
            console.error('Error deleting session:', err);
            addToast('Erreur lors de la suppression de la session', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const openInspectModal = (session: Session) => {
        setSessionToInspect({...session});
        setShowInspectModal(true);
    };
    const openEditModal = (session: Session) => {
        setSessionToEdit({...session});
        setFormErrors({});
        setNewDocuments([]); // Reset nouveaux documents (ancien système)
        setTempDocuments([]); // Reset documents temporaires
        setPendingTempIds([]); // Reset IDs temporaires
        
        // Initialiser les instructeurs sélectionnés
        if (session.instructors && session.instructors.length > 0) {
            setSelectedInstructors(session.instructors.map(inst => inst.id));
        } else if (session.instructor) {
            setSelectedInstructors([session.instructor.id]);
        } else {
            setSelectedInstructors([]);
        }
        
        setShowEditModal(true);
    };

    // Gestion des documents temporaires
    const handleTempDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('title', file.name);
                formData.append('category', 'support');

                // Upload temporaire
                const response = await documentsApi.tempUpload(formData);
                const { tempId, document: tempDoc } = response.data;

                // Ajouter aux documents temporaires
                setTempDocuments(prev => [...prev, { tempId, document: tempDoc }]);
                setPendingTempIds(prev => [...prev, tempId]);
            }

            addToast('Document(s) ajouté(s) temporairement. Sauvegardez pour finaliser.', 'info');
        } catch (err: any) {
            console.error('Error uploading temporary document:', err);
            
            // ✅ CORRECTION : Gestion spécifique de l'erreur 413 (fichier trop volumineux)
            if (err.response?.status === 413) {
                addToast('Fichier trop volumineux. La taille maximale autorisée est de 100 Mo.', 'error');
            } else if (err.response?.status >= 400 && err.response?.status < 500) {
                addToast('Erreur lors de l\'upload: ' + (err.response?.data?.message || 'Format de fichier non autorisé'), 'error');
            } else {
                addToast('Erreur lors de l\'upload temporaire', 'error');
            }
        }
        
        // Réinitialiser l'input
        event.target.value = '';
    };

    const deleteTempDocument = async (tempId: string) => {
        try {
            await documentsApi.deleteTempDocument(tempId);
            setTempDocuments(prev => prev.filter(td => td.tempId !== tempId));
            setPendingTempIds(prev => prev.filter(id => id !== tempId));
            addToast('Document temporaire supprimé', 'success');
        } catch (err) {
            console.error('Error deleting temporary document:', err);
            addToast('Erreur lors de la suppression temporaire', 'error');
        }
    };

    const validateForm = (session: Session) => {
        const errors: {[key: string]: string} = {};

        if (!session.formation?.id) errors.formation = 'La formation est requise';

        const startDate = new Date(session.startDate);
        const endDate = new Date(session.endDate);

        if (!startDate || isNaN(startDate.getTime()))
            errors.startDate = 'La date de début est requise';

        if (!endDate || isNaN(endDate.getTime()))
            errors.endDate = 'La date de fin est requise';

        if (startDate && endDate && startDate >= endDate)
            errors.endDate = 'La date de fin doit être après la date de début';

        if (!session.maxParticipants || session.maxParticipants <= 0)
            errors.maxParticipants = 'Le nombre maximum de participants doit être un nombre positif';

        if (!session.location?.trim()) errors.location = 'Le lieu est requis';

        if (!session.status) errors.status = 'Le statut est requis';
        //if (!session.instructor?.id) errors.instructor = 'Le formateur est requis';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionToEdit || !validateForm(sessionToEdit)) {
            return;
        }

        try {
            setUpdating(true);

            // 1. Préparer les données avec les instructeurs multiples
            const sessionData = {
                ...sessionToEdit,
                instructors: selectedInstructors
            };
            
            // 2. Mettre à jour la session (JSON)
            await adminSessionsApi.update(sessionToEdit.id, sessionData);

            // 2. Finaliser les documents temporaires s'il y en a
            if (pendingTempIds.length > 0) {
                try {
                    await documentsApi.finalizeDocuments({
                        tempIds: pendingTempIds,
                        entityType: 'session',
                        entityId: sessionToEdit.id
                    });
                    
                    // Nettoyer les documents temporaires
                    setTempDocuments([]);
                    setPendingTempIds([]);
                } catch (docErr) {
                    console.error('Error finalizing documents:', docErr);
                    addToast('Session mise à jour, mais erreur lors de la finalisation des documents', 'warning');
                }
            }

            // 3. Traiter les anciens documents (fallback pour compatibilité)
            for (const document of newDocuments) {
                const formData = new FormData();
                formData.append('file', document);
                formData.append('title', document.name);
                formData.append('category', 'support');

                // Utiliser l'API standardisée
                await adminSessionsApi.uploadDocument(sessionToEdit.id, formData);
            }

            // 3. Mettre à jour la liste des sessions
            setSessions(
                sessions.map(s =>
                    s.id === sessionToEdit.id ? sessionToEdit : s
                )
            );

            setShowEditModal(false);
            setSessionToEdit(null);
            setNewDocuments([]);
            addToast('Session mise à jour avec succès', 'success');
        } catch (err) {
            console.error('Error updating session:', err);
            addToast('Erreur lors de la mise à jour de la session', 'error');
        } finally {
            setUpdating(false);
        }
    };
    const formatStatus = (status: string): string => {
        const statuses: { [key: string]: string } = {
            'scheduled': 'Programmée',
            'ongoing': 'En cours',
            'completed': 'Terminée',
            'cancelled': 'Annulée'
        };
        return statuses[status] || status;
    };

    const getStatusClass = (status: string): string => {
        const classes: { [key: string]: string } = {
            'scheduled': 'bg-blue-100 text-blue-800',
            'ongoing': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Formation',
            field: (row: Session) => row.formation.title,
            sortable: true
        },
        {
            title: 'Dates',
            field: (row: Session) => (
                <div className="text-sm text-gray-900">
                    Du {formatDate(row.startDate)}
                    <br />
                    Au {formatDate(row.endDate)}
                </div>
            ),
            sortable: false
        },
        {
            title: 'Lieu',
            field: 'location' as keyof Session,
            sortable: true
        },
        {
            title: 'Formateur(s)',
            field: (row: Session) => {
                // Priorité aux nouveaux instructeurs multiples
                if (row.instructors && row.instructors.length > 0) {
                    return (
                        <div className="text-sm text-gray-900">
                            {row.instructors.map(inst => `${inst.firstName} ${inst.lastName}`).join(', ')}
                            {row.instructors.length > 1 && (
                                <span className="text-xs text-blue-600 ml-1">({row.instructors.length})</span>
                            )}
                        </div>
                    );
                }
                // Fallback sur l'ancien système
                return row.instructor ? 
                    `${row.instructor.firstName} ${row.instructor.lastName}` : 
                    'Non assigné';
            },
            sortable: true
        },
        {
            title: 'Participants',
            field: (row: Session) => (
                <div className="text-sm text-gray-900">
                    {row.participants ? row.participants.length : 0} / {row.maxParticipants}
                </div>
            ),
            sortable: false
        },
        {
            title: 'Statut',
            field: (row: Session) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(row.status)}`}>
                    {formatStatus(row.status)}
                </span>
            ),
            sortable: false
        }
    ];

    // Rendu des actions pour chaque ligne
    const renderActions = (session: Session) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => openInspectModal(session)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Voir les détails"
            >
                <Eye className="h-5 w-5" />
            </button>
            <button
                onClick={() => openEditModal(session)}
                className="text-blue-700 hover:text-blue-900"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                onClick={() => confirmDelete(session)}
                className="text-red-600 hover:text-red-900"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    // Calcul des statistiques

    const scheduledSessions = sessions ? sessions.filter(s => s.status === 'scheduled').length : 0;
    const ongoingSessions = sessions ? sessions.filter(s => s.status === 'ongoing').length : 0;
    const completedSessions = sessions ? sessions.filter(s => s.status === 'completed').length : 0;
    const totalParticipants = sessions ? sessions.reduce((total, session) =>
        total + (session.participants ? session.participants.length : 0), 0
    ) : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des sessions"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Formations', path: '/admin/formations' },
                        { label: 'Sessions' }
                    ]}
                />

                <div className="p-6">
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            to="/admin/sessions/new"
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2"/>
                            Nouvelle session
                        </Link>
                    </div>

                    <DataTable<Session>
                        data={sessions}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        actions={renderActions}
                        searchFields={['formation.title', 'location']}
                        emptyMessage="Aucune session trouvée"
                    />

                    {/* Statistiques des sessions */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-blue-700"/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Sessions programmées</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {scheduledSessions}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-green-700"/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Sessions en cours</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {ongoingSessions}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-gray-700"/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Sessions terminées</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {completedSessions}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <Users className="h-6 w-6 text-purple-700"/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Participants total</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {totalParticipants}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            onClick={handleDelete}
                            loading={updating}
                        >
                            Supprimer
                        </Button>
                    </div>
                }
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer la session de {sessionToDelete?.formation.title} débutant le {formatDate(sessionToDelete?.startDate || '')} ?
                    Cette action est irréversible.
                </p>
            </Modal>

            {/* Modal d'édition */}
            <SessionForm
                mode="edit"
                session={sessionToEdit}
                onSave={handleUnifiedSave}
                onCancel={() => setShowEditModal(false)}
                isOpen={showEditModal}
            />



        </div>
    );
};

export default SessionsAdmin;