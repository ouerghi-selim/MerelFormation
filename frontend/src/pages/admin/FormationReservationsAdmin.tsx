import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronDown, Eye, User, GraduationCap, X } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminReservationsApi, adminUsersApi } from '@/services/api.ts';
import Alert from '../../components/common/Alert';
import StudentDetailModal from '../../components/admin/StudentDetailModal';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/reservationStatuses';
import { useNotification } from '../../contexts/NotificationContext';

interface SessionReservation {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    session: {
        id: number;
        startDate: string;
        formation: {
            id: number;
            title: string;
        }
    };
    status: string;
    createdAt: string;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    phone?: string;
    company?: {
        id: number;
        name: string;
        address: string;
        postalCode: string;
        city: string;
        siret: string;
        responsableName: string;
        email: string;
        phone: string;
    };
}


const FormationReservationsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    
    // États pour les réservations
    const [reservations, setReservations] = useState<SessionReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    
    // États pour la gestion des statuts
    const [showStatusDropdown, setShowStatusDropdown] = useState<Record<number, boolean>>({});
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        reservationId: number;
        newStatus: string;
        currentStatus: string;
        studentName: string;
    } | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [statusProcessing, setStatusProcessing] = useState(false);
    
    // États pour le modal détails étudiant
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [loadingStudent, setLoadingStudent] = useState(false);

    // Charger les réservations
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (statusFilter) params.append('status', statusFilter);
                if (dateFilter) params.append('date', dateFilter);

                const response = await adminReservationsApi.getSessionReservations(params.toString());
                setReservations(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching reservations:', err);
                setError('Erreur lors du chargement des réservations');
                setLoading(false);
            }
        };

        fetchReservations();
    }, [searchTerm, statusFilter, dateFilter]);

    // Effet pour fermer les dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.status-dropdown-container')) {
                setShowStatusDropdown({});
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Fonctions de gestion des statuts
    const toggleStatusDropdown = (reservationId: number) => {
        setShowStatusDropdown(prev => ({
            ...prev,
            [reservationId]: !prev[reservationId]
        }));
    };

    const handleStatusChangeRequest = (reservationId: number, newStatus: string) => {
        const reservation = reservations.find(r => r.id === reservationId);
        if (!reservation) return;

        setPendingStatusChange({
            reservationId,
            newStatus,
            currentStatus: reservation.status,
            studentName: `${reservation.user.firstName} ${reservation.user.lastName}`
        });
        
        setShowStatusDropdown(prev => ({ ...prev, [reservationId]: false }));
        setShowStatusConfirmModal(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatusChange) return;

        try {
            setStatusProcessing(true);
            const { reservationId, newStatus } = pendingStatusChange;
            
            await adminReservationsApi.updateSessionReservationStatus(reservationId, newStatus, customMessage || undefined);
            
            setReservations(reservations.map(r =>
                r.id === reservationId ? { ...r, status: newStatus } : r
            ));

            addToast(`Statut mis à jour vers: ${getStatusLabel(newStatus, 'formation')}`, 'success');
            
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } catch (err) {
            console.error('Error updating status:', err);
            addToast('Erreur lors de la mise à jour du statut', 'error');
        } finally {
            setStatusProcessing(false);
        }
    };

    const cancelStatusChange = () => {
        setShowStatusConfirmModal(false);
        setPendingStatusChange(null);
        setCustomMessage('');
    };

    // Fonction pour voir les détails de l'étudiant
    const viewStudentDetails = async (userId: number) => {
        try {
            setLoadingStudent(true);
            const response = await adminUsersApi.get(userId);
            setSelectedStudent(response.data);
            setShowStudentModal(true);
        } catch (err) {
            console.error('Error fetching student details:', err);
            addToast('Erreur lors du chargement des détails de l\'étudiant', 'error');
        } finally {
            setLoadingStudent(false);
        }
    };

    const getStatusOptions = () => {
        const formationStatuses = [
            'submitted', 'under_review', 'awaiting_documents', 'documents_pending', 
            'documents_rejected', 'awaiting_prerequisites', 'awaiting_funding', 
            'funding_approved', 'awaiting_payment', 'payment_pending', 'confirmed', 
            'awaiting_start', 'in_progress', 'attendance_issues', 'suspended', 
            'completed', 'failed', 'cancelled', 'refunded'
        ];

        return formationStatuses.map(status => ({
            value: status,
            label: getStatusLabel(status, 'formation')
        }));
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
        <AdminLayout 
            title="Réservations de formations"
            breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Réservations', path: '/admin/reservations' },
                { label: 'Formations' }
            ]}
        >
            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {successMessage && (
                <Alert
                    type="success"
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}

            {/* Filtres */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="text-xl font-bold text-gray-800">
                    Toutes les réservations de formations
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher étudiant..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full md:w-40">
                        <Filter className="absolute left-3 top-3 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Tous les statuts</option>
                            {getStatusOptions().map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                    </div>

                    <div className="relative w-full md:w-36">
                        <Calendar className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="date"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table des réservations */}
            {loading ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Chargement des réservations...</p>
                </div>
            ) : reservations.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700">Aucune réservation trouvée</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Étudiant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Formation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date début
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Demande
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {reservation.user.firstName} {reservation.user.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {reservation.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {reservation.session.formation.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(reservation.session.startDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(reservation.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative status-dropdown-container">
                                                <button
                                                    onClick={() => toggleStatusDropdown(reservation.id)}
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeClass(reservation.status)}`}
                                                >
                                                    {getStatusLabel(reservation.status, 'formation')}
                                                    <ChevronDown className="ml-1 h-3 w-3" />
                                                </button>
                                                
                                                {showStatusDropdown[reservation.id] && (
                                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-64 max-h-80 overflow-y-auto"
                                                         style={{ zIndex: 9999 }}>
                                                        <div className="p-2">
                                                            <div className="text-xs text-gray-500 p-2 border-b mb-2">
                                                                Changer le statut de {reservation.user.firstName} {reservation.user.lastName}
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {getStatusOptions().map((status) => (
                                                                    <button
                                                                        key={status.value}
                                                                        onClick={() => handleStatusChangeRequest(reservation.id, status.value)}
                                                                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                                                                            reservation.status === status.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                                        }`}
                                                                        disabled={reservation.status === status.value}
                                                                    >
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className={`inline-block w-3 h-3 rounded-full ${getStatusBadgeClass(status.value).split(' ')[0]}`}></span>
                                                                            <span>{status.label}</span>
                                                                            {reservation.status === status.value && (
                                                                                <span className="text-xs">(actuel)</span>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => viewStudentDetails(reservation.user.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Voir détails de l'étudiant"
                                                disabled={loadingStudent}
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de confirmation pour changement de statut */}
            {showStatusConfirmModal && pendingStatusChange && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirmation de changement de statut
                                </h3>
                                <button
                                    onClick={cancelStatusChange}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mb-6 space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-yellow-800">
                                                Attention : Un email sera automatiquement envoyé
                                            </h4>
                                            <p className="mt-1 text-sm text-yellow-700">
                                                Cette action déclenchera l'envoi d'un email automatique à l'étudiant.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Étudiant concerné :</label>
                                        <p className="text-base font-semibold text-gray-900">{pendingStatusChange.studentName}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Statut actuel :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.currentStatus)}`}>
                                                    {getStatusLabel(pendingStatusChange.currentStatus, 'formation')}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.newStatus)}`}>
                                                    {getStatusLabel(pendingStatusChange.newStatus, 'formation')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Message personnalisé (optionnel) :</label>
                                        <div className="mt-1">
                                            <textarea
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Ajoutez un message personnalisé qui sera inclus dans l'email..."
                                                value={customMessage}
                                                onChange={(e) => setCustomMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelStatusChange}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    disabled={statusProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {statusProcessing ? 'Traitement...' : 'Confirmer et envoyer l\'email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal détails étudiant */}
            <StudentDetailModal
                isOpen={showStudentModal}
                onClose={() => setShowStudentModal(false)}
                student={selectedStudent}
                activeTab="reservations"
            />
        </AdminLayout>
    );
};

export default FormationReservationsAdmin;