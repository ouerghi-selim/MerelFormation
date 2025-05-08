// src/pages/admin/SessionsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, Users } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import { adminSessionsApi, adminFormationsApi } from '../../services/api';

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

    const openEditModal = (session: Session) => {
        setSessionToEdit({...session});
        setFormErrors({});
        setShowEditModal(true);
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
        if (!session.instructor?.id) errors.instructor = 'Le formateur est requis';

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
            await adminSessionsApi.update(sessionToEdit.id, sessionToEdit);

            // Mettre à jour la liste des sessions
            setSessions(
                sessions.map(s =>
                    s.id === sessionToEdit.id ? sessionToEdit : s
                )
            );

            setShowEditModal(false);
            setSessionToEdit(null);
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
            title: 'Formateur',
            field: (row: Session) => row.instructor ?
                `${row.instructor.firstName} ${row.instructor.lastName}` :
                'Non assigné',
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
                                    Formateur
                                </label>
                                <select
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.instructor ? 'border-red-500' : ''
                                    }`}
                                    value={sessionToEdit.instructor?.id || ''}
                                    onChange={(e) => {
                                        const instructorId = e.target.value;
                                        if (instructorId) {
                                            const selectedInstructor = instructors.find(i => i.id === parseInt(instructorId));
                                            setSessionToEdit({
                                                ...sessionToEdit,
                                                instructor: selectedInstructor || null
                                            });
                                        } else {
                                            setSessionToEdit({
                                                ...sessionToEdit,
                                                instructor: null
                                            });
                                        }
                                    }}
                                >
                                    <option value="">Sélectionner un formateur</option>
                                    {instructors.map(instructor => (
                                        <option key={instructor.id} value={instructor.id}>
                                            {instructor.firstName} {instructor.lastName}
                                        </option>
                                    ))}
                                </select>
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
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default SessionsAdmin;