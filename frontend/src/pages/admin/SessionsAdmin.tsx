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
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier la session"
                maxWidth="max-w-3xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleEditFormSubmit}
                            loading={updating}
                        >
                            Enregistrer
                        </Button>
                    </div>
                }
            >
                {sessionToEdit && (
                    <form onSubmit={handleEditFormSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Formation*
                                </label>
                                <select
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.formation ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.formation.id}
                                    onChange={(e) => setSessionToEdit({
                                        ...sessionToEdit,
                                        formation: {
                                            ...sessionToEdit.formation,
                                            id: parseInt(e.target.value)
                                        }
                                    })}
                                >
                                    <option value="">Sélectionner une formation</option>
                                    {formations.map(formation => (
                                        <option key={formation.id} value={formation.id}>
                                            {formation.title}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.formation && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.formation}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lieu*
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.location ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.location}
                                    onChange={(e) => setSessionToEdit({...sessionToEdit, location: e.target.value})}
                                />
                                {formErrors.location && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de début*
                                </label>
                                <input
                                    type="date"
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.startDate ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.startDate.split('T')[0]}
                                    onChange={(e) => setSessionToEdit({...sessionToEdit, startDate: e.target.value})}
                                />
                                {formErrors.startDate && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de fin*
                                </label>
                                <input
                                    type="date"
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.endDate ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.endDate.split('T')[0]}
                                    onChange={(e) => setSessionToEdit({...sessionToEdit, endDate: e.target.value})}
                                />
                                {formErrors.endDate && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Formateur(s)
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {instructors.map(instructor => (
                                        <label key={instructor.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedInstructors.includes(instructor.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedInstructors([...selectedInstructors, instructor.id]);
                                                    } else {
                                                        setSelectedInstructors(selectedInstructors.filter(id => id !== instructor.id));
                                                    }
                                                }}
                                            />
                                            <span className="ml-2 text-sm text-gray-900">
                                                {instructor.firstName} {instructor.lastName}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {selectedInstructors.length === 0 && (
                                    <p className="mt-1 text-sm text-gray-500">Aucun formateur sélectionné</p>
                                )}
                                {formErrors.instructor && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.instructor}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre maximum de participants*
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.maxParticipants ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.maxParticipants}
                                    onChange={(e) => setSessionToEdit({
                                        ...sessionToEdit,
                                        maxParticipants: parseInt(e.target.value) || 0
                                    })}
                                />
                                {formErrors.maxParticipants && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.maxParticipants}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Statut*
                                </label>
                                <select
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.status ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.status}
                                    onChange={(e) => setSessionToEdit({...sessionToEdit, status: e.target.value})}
                                >
                                    <option value="scheduled">Programmée</option>
                                    <option value="ongoing">En cours</option>
                                    <option value="completed">Terminée</option>
                                    <option value="cancelled">Annulée</option>
                                </select>
                                {formErrors.status && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.status}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={sessionToEdit.notes || ''}
                                    onChange={(e) => setSessionToEdit({...sessionToEdit, notes: e.target.value})}
                                />
                            </div>


                            {/* Section Documents avec système temporaire */}
                            <div className="md:col-span-2 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Documents associés</h3>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        onChange={handleTempDocumentUpload}
                                        className="hidden"
                                        id="documents-upload-edit-temp"
                                    />
                                    <label
                                        htmlFor="documents-upload-edit-temp"
                                        className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4 mr-1"/>
                                        Ajouter des documents
                                    </label>
                                </div>

                                {/* Documents existants (sauvegardés) */}
                                {sessionToEdit.documents && sessionToEdit.documents.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-green-800 mb-2 bg-green-50 px-2 py-1 rounded">Documents sauvegardés</h4>
                                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                            <ul className="divide-y divide-gray-200">
                                                {sessionToEdit.documents.map((document) => (
                                                    <li key={document.id} className="px-4 py-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {document.title}
                                                                </p>
                                                                <p className="text-sm text-gray-500 truncate">
                                                                    {document.type} • {document.fileSize}
                                                                </p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                               <a href={document.downloadUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                                >
                                                                Télécharger
                                                            </a>
                                                        </div>
                                                    </div>
                                                    </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Documents temporaires (nouveau système) */}
                                {tempDocuments.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-yellow-800 mb-2 bg-yellow-50 px-2 py-1 rounded">Documents temporaires (Sauvegardez pour finaliser)</h4>
                                        <div className="space-y-2">
                                            {tempDocuments.map(({ tempId, document: tempDoc }) => (
                                                <div key={tempId} className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{tempDoc.title}</p>
                                                        <p className="text-sm text-yellow-600">Temporaire - {tempDoc.originalName}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteTempDocument(tempId)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Nouveaux documents (ancien système - fallback) */}
                                {newDocuments.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2 bg-blue-50 px-2 py-1 rounded">Documents (ancien système)</h4>
                                        <div className="space-y-2">
                                            {newDocuments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                                                    <span className="text-sm">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewDocuments(docs => docs.filter((_, i) => i !== index))}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Message si aucun document */}
                                {!sessionToEdit.documents?.length && tempDocuments.length === 0 && newDocuments.length === 0 && (
                                    <p className="text-sm text-gray-500">Aucun document associé à cette session.</p>
                                )}
                            </div>
                        </div>
                    </form>
                    )}
            </Modal>

            <Modal
                isOpen={showInspectModal}
                onClose={() => setShowInspectModal(false)}
                title="Détails de la session"
                maxWidth="max-w-3xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowInspectModal(false)}
                        >
                            Fermer
                        </Button>
                    </div>
                }
            >
                {sessionToInspect && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 className="font-medium text-gray-700">Formation</h4>
                                <p>{sessionToInspect.formation.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Lieu</h4>
                                <p>{sessionToInspect.location}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Date de début</h4>
                                <p>{formatDate(sessionToInspect.startDate)}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Date de fin</h4>
                                <p>{formatDate(sessionToInspect.endDate)}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Formateur(s)</h4>
                                <div>
                                    {sessionToInspect.instructors && sessionToInspect.instructors.length > 0 ? (
                                        <div className="space-y-1">
                                            {sessionToInspect.instructors.map(instructor => (
                                                <p key={instructor.id} className="text-sm">
                                                    {instructor.firstName} {instructor.lastName}
                                                    {instructor.specialization && (
                                                        <span className="text-gray-500 ml-1">({instructor.specialization})</span>
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    ) : sessionToInspect.instructor ? (
                                        <p>{sessionToInspect.instructor.firstName} {sessionToInspect.instructor.lastName}</p>
                                    ) : (
                                        <p className="text-gray-500">Non assigné</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Nombre maximum de participants</h4>
                                <p>{sessionToInspect.maxParticipants}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Statut</h4>
                                <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sessionToInspect.status)}`}>
                        {formatStatus(sessionToInspect.status)}
                    </span>
                            </div>
                        </div>

                        {sessionToInspect.notes && (
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-700">Notes</h4>
                                <p className="whitespace-pre-wrap">{sessionToInspect.notes}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Liste des participants</h3>
                            {sessionToInspect.participants && sessionToInspect.participants.length > 0 ? (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {sessionToInspect.participants.map((participant) => (
                                            <li key={participant.id} className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {participant.firstName} {participant.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {participant.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Aucun participant inscrit à cette session.</p>
                            )}
                        </div>
                        {/* AJOUTER CETTE SECTION après la section participants dans le modal d'inspection */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Documents associés</h3>
                            {sessionToInspect.documents && sessionToInspect.documents.length > 0 ? (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {sessionToInspect.documents.map((document) => (
                                            <li key={document.id} className="px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {document.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {document.type} • {document.fileSize}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0">

                                                        <a href={document.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                        >
                                                        Télécharger
                                                    </a>
                                                </div>
                                            </div>
                                            </li>
                                            ))}
                                    </ul>
                                </div>
                                ) : (
                                <p className="text-sm text-gray-500">Aucun document associé à cette session.</p>
                                )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SessionsAdmin;