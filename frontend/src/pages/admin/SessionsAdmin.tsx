import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, ChevronDown, Calendar, X, Users } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
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
}

interface Formation {
    id: number;
    title: string;
}

const SessionsAdmin: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormation, setSelectedFormation] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [updating, setUpdating] = useState(false);

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

                // Données de secours en cas d'erreur (pour le développement)
                const mockSessions: Session[] = [
                    {
                        id: 1,
                        formation: { id: 1, title: 'Formation Initiale Taxi' },
                        startDate: new Date(Date.now() + 7*24*3600*1000).toISOString(),
                        endDate: new Date(Date.now() + 30*24*3600*1000).toISOString(),
                        maxParticipants: 12,
                        location: '7 RUE Georges Maillols, 35000 RENNES',
                        status: 'scheduled',
                        participants: []
                    },
                    {
                        id: 2,
                        formation: { id: 1, title: 'Formation Initiale Taxi' },
                        startDate: new Date(Date.now() + 45*24*3600*1000).toISOString(),
                        endDate: new Date(Date.now() + 75*24*3600*1000).toISOString(),
                        maxParticipants: 12,
                        location: '7 RUE Georges Maillols, 35000 RENNES',
                        status: 'scheduled',
                        participants: []
                    },
                    {
                        id: 3,
                        formation: { id: 2, title: 'Formation Continue Taxi' },
                        startDate: new Date(Date.now() + 3*24*3600*1000).toISOString(),
                        endDate: new Date(Date.now() + 5*24*3600*1000).toISOString(),
                        maxParticipants: 15,
                        location: '7 RUE Georges Maillols, 35000 RENNES',
                        status: 'scheduled',
                        participants: []
                    }
                ];

                const mockFormations: Formation[] = [
                    { id: 1, title: 'Formation Initiale Taxi' },
                    { id: 2, title: 'Formation Continue Taxi' },
                    { id: 3, title: 'Formation Mobilité Taxi' }
                ];

                setSessions(mockSessions);
                setFormations(mockFormations);
            }
        };

        fetchData();
    }, [searchTerm, selectedFormation, selectedStatus]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // La recherche est déjà gérée par le useEffect via searchTerm
    };

    const confirmDelete = (session: Session) => {
        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!sessionToDelete) return;

        try {
            await adminSessionsApi.delete(sessionToDelete.id);
            setSessions(sessions.filter(s => s.id !== sessionToDelete.id));
            setShowDeleteModal(false);
            setSessionToDelete(null);
        } catch (err) {
            console.error('Error deleting session:', err);
            setError('Erreur lors de la suppression de la session');
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
        } catch (err) {
            console.error('Error updating session:', err);
            setError('Erreur lors de la mise à jour de la session');
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Gestion des sessions" />

                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <Link
                            to="/admin/sessions/new"
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nouvelle session
                        </Link>

                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="relative w-full md:w-48">
                                <Filter className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                                    value={selectedFormation}
                                    onChange={(e) => setSelectedFormation(e.target.value)}
                                >
                                    <option value="">Toutes les formations</option>
                                    {formations.map(formation => (
                                        <option key={formation.id} value={formation.id.toString()}>
                                            {formation.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>

                            <div className="relative w-full md:w-48">
                                <Filter className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="scheduled">Programmée</option>
                                    <option value="ongoing">En cours</option>
                                    <option value="completed">Terminée</option>
                                    <option value="cancelled">Annulée</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </form>
                    </div>

                    {loading ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                            <p className="mt-4 text-gray-700">Chargement des sessions...</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-700">Aucune session trouvée</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Formation
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lieu
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Participants
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {sessions.map((session) => (
                                        <tr key={session.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{session.formation.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    Du {formatDate(session.startDate)}
                                                    <br />
                                                    Au {formatDate(session.endDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{session.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {session.participants ? session.participants.length : 0} / {session.maxParticipants}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(session.status)}`}>
                            {formatStatus(session.status)}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Statistiques des sessions */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-blue-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Sessions programmées</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {sessions.filter(s => s.status === 'scheduled').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-green-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Sessions en cours</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {sessions.filter(s => s.status === 'ongoing').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-gray-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Sessions terminées</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {sessions.filter(s => s.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <Users className="h-6 w-6 text-purple-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Participants total</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {sessions.reduce((total, session) =>
                                            total + (session.participants ? session.participants.length : 0), 0
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                        <p className="mb-6">
                            Êtes-vous sûr de vouloir supprimer la session de {sessionToDelete?.formation.title} débutant le {formatDate(sessionToDelete?.startDate || '')} ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'édition */}
            {showEditModal && sessionToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Modifier la session</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

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
                                        Nombre maximum de participants*
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.maxParticipants ? 'border-red-500' : ''
                                        }`}
                                        value={sessionToEdit.maxParticipants}
                                        onChange={(e) => setSessionToEdit({...sessionToEdit, maxParticipants: parseInt(e.target.value) || 0})}
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

                            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Mise à jour...
                                        </>
                                    ) : (
                                        <>Enregistrer</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionsAdmin;