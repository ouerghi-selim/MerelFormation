import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { adminReservationsApi } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/reservationStatuses';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface VehicleReservation {
    id: number;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    date: string;
    examCenter: string;
    formula: string;
    status: string;
    vehicleAssigned: string | null;
}

interface SessionReservation {
    id: number;
    user: User;
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

type ReservationType = 'vehicle' | 'session';

interface ReservationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationType: ReservationType;
    reservationId: number | null;
    onStatusChange?: (id: number, status: string) => void;
    onSuccess?: () => void;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
                                                                               isOpen,
                                                                               onClose,
                                                                               reservationType,
                                                                               reservationId,
                                                                               onStatusChange,
                                                                               onSuccess
                                                                           }) => {
    const navigate = useNavigate();
    const [vehicleReservation, setVehicleReservation] = useState<VehicleReservation | null>(null);
    const [sessionReservation, setSessionReservation] = useState<SessionReservation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    
    // États pour le modal de confirmation de changement de statut
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        newStatus: string;
        currentStatus: string;
        studentName: string;
    } | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    
    console.log("type:", reservationType);

    useEffect(() => {
        if (!isOpen || !reservationId) return;

        const fetchReservationDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                setSelectedVehicle(''); // Reset selected vehicle on each open
                console.log("Fetching details for type:", reservationType, "id:", reservationId);

                if (reservationType === 'vehicle') {
                    const response = await adminReservationsApi.getById(reservationId);
                    setVehicleReservation(response.data);

                    // Définir selectedVehicle avec le véhicule déjà assigné
                    if (response.data && response.data.vehicleAssigned) {
                        setSelectedVehicle(response.data.vehicleAssigned);
                    }
                    // Convertir la date au format ISO pour l'API
                    // On utilise la date de la réservation pour trouver les véhicules disponibles ce jour-là
                    if (response.data && response.data.date) {
                        // Convertir du format français (JJ/MM/AAAA) vers ISO (AAAA-MM-JJ)
                        const dateParts = response.data.date.split('/');
                        if (dateParts.length === 3) {
                            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

                            // Fetch available vehicles for that date
                            const vehiclesResponse = await adminReservationsApi.getAvailableVehicles(formattedDate);
                            setAvailableVehicles(vehiclesResponse.data.map((v: any) => v.model));
                        } else {
                            // Si la date n'est pas au format attendu, utiliser la date d'aujourd'hui
                            const today = new Date().toISOString().split('T')[0];
                            const vehiclesResponse = await adminReservationsApi.getAvailableVehicles(today);
                            setAvailableVehicles(vehiclesResponse.data.map((v: any) => v.model));
                        }
                    } else {
                        // Fallback à la date d'aujourd'hui si pas de date disponible
                        const today = new Date().toISOString().split('T')[0];
                        const vehiclesResponse = await adminReservationsApi.getAvailableVehicles(today);
                        setAvailableVehicles(vehiclesResponse.data.map((v: any) => v.model));
                    }
                } else {
                    try {
                        console.log("Fetching session reservation:", reservationId);
                        const response = await adminReservationsApi.getSessionReservationById(reservationId);
                        console.log("Session data:", response.data);
                        setSessionReservation(response.data);
                    } catch (sessErr) {
                        console.error("Error loading session reservation:", sessErr);
                    }
                }
            } catch (err) {
                console.error('Error fetching reservation details:', err);
                setError('Erreur lors du chargement des détails de la réservation');
            } finally {
                setLoading(false);
            }
        };

        fetchReservationDetails();
    }, [isOpen, reservationId, reservationType]);

    // Fonction pour préparer le changement de statut (ouvre le modal de confirmation)
    const requestStatusChange = (newStatus: string) => {
        if (!reservationId) return;

        let currentStatus = '';
        let studentName = '';
        
        if (reservationType === 'vehicle' && vehicleReservation) {
            currentStatus = vehicleReservation.status;
            studentName = vehicleReservation.clientName;
        } else if (reservationType === 'session' && sessionReservation) {
            currentStatus = sessionReservation.status;
            studentName = `${sessionReservation.user.firstName} ${sessionReservation.user.lastName}`;
        }

        setPendingStatusChange({
            newStatus,
            currentStatus,
            studentName
        });
        
        setShowStatusConfirmModal(true);
    };

    // Fonction pour obtenir la description de l'email
    const getEmailDescription = (status: string): string => {
        const emailDescriptions: Record<string, string> = {
            'submitted': 'Email de confirmation de réception de demande',
            'under_review': 'Email informant que le dossier est en cours d\'examen',
            'awaiting_documents': 'Email demandant les documents manquants',
            'documents_pending': 'Email confirmant la réception des documents',
            'documents_rejected': 'Email expliquant le rejet des documents',
            'awaiting_prerequisites': 'Email détaillant les prérequis manquants',
            'awaiting_funding': 'Email concernant l\'attente de financement',
            'funding_approved': 'Email de confirmation du financement',
            'awaiting_payment': 'Email de demande de paiement',
            'payment_pending': 'Email confirmant la réception du paiement',
            'confirmed': 'Email de confirmation d\'inscription avec détails',
            'awaiting_start': 'Email avec informations de début de formation',
            'in_progress': 'Email confirmant le début de la formation',
            'attendance_issues': 'Email concernant les problèmes d\'assiduité',
            'suspended': 'Email notifiant la suspension temporaire',
            'completed': 'Email de félicitations avec certificat',
            'failed': 'Email d\'information sur l\'échec et possibilités de rattrapage',
            'cancelled': 'Email de confirmation d\'annulation',
            'refunded': 'Email confirmant le remboursement'
        };
        
        return emailDescriptions[status] || 'Email de notification de changement de statut';
    };

    const handleStatusChange = async (status: string) => {
        if (!reservationId) return;

        try {
            setLoading(true);
            setError(null);

            if (reservationType === 'vehicle') {
                await adminReservationsApi.updateStatus(reservationId, status, customMessage);
                if (vehicleReservation) {
                    setVehicleReservation({
                        ...vehicleReservation,
                        status
                    });
                }
            } else {
                await adminReservationsApi.updateSessionReservationStatus(reservationId, status, customMessage);
                if (sessionReservation) {
                    setSessionReservation({
                        ...sessionReservation,
                        status
                    });
                }
            }

            if (onStatusChange) {
                onStatusChange(reservationId, status);
            }

            if (onSuccess) {
                onSuccess();
            }
            
            // Fermer le modal de confirmation et nettoyer l'état
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Erreur lors de la mise à jour du statut');
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour confirmer le changement de statut
    const confirmStatusChange = () => {
        if (!pendingStatusChange) return;
        handleStatusChange(pendingStatusChange.newStatus);
    };

    // Fonction pour annuler le changement de statut
    const cancelStatusChange = () => {
        setShowStatusConfirmModal(false);
        setPendingStatusChange(null);
        setCustomMessage('');
    };

    const handleAssignVehicle = async () => {
        if (!reservationId || !selectedVehicle || reservationType !== 'vehicle') return;

        try {
            setLoading(true);
            setError(null);

            await adminReservationsApi.assignVehicle(reservationId, selectedVehicle);

            if (vehicleReservation) {
                setVehicleReservation({
                    ...vehicleReservation,
                    vehicleAssigned: selectedVehicle
                });
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.error('Error assigning vehicle:', err);
            setError('Erreur lors de l\'assignation du véhicule');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Utilisation des fonctions utilitaires unifiées

    // Fonction pour naviguer vers la page de détails complets
    const handleViewFullDetails = () => {
        if (reservationId && reservationType === 'vehicle') {
            navigate(`/admin/reservations/vehicle/${reservationId}`);
            onClose(); // Fermer le modal
        }
    };

    // Rendu du contenu du modal pour véhicule
    const renderVehicleContent = () => {
        if (!vehicleReservation) return null;

        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Client</p>
                        <p className="font-medium">{vehicleReservation.clientName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium">{vehicleReservation.clientPhone}</p>
                        <p className="text-sm">{vehicleReservation.clientEmail}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date d'examen</p>
                        <p className="font-medium">{vehicleReservation.date}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Centre d'examen</p>
                        <p className="font-medium">{vehicleReservation.examCenter}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Formule</p>
                        <p className="font-medium">{vehicleReservation.formula}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className="font-medium">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(vehicleReservation.status)}`}>
                {getStatusLabel(vehicleReservation.status, 'vehicle')}
            </span>
                        </p>
                    </div>
                </div>

                {(vehicleReservation.status === 'submitted' || vehicleReservation.status === 'under_review' || vehicleReservation.status === 'confirmed') && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-2">Assigner un véhicule</h4>
                        <div className="flex space-x-3">
                            <select
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                            >
                                <option value="">Sélectionner un véhicule</option>
                                {availableVehicles.map((vehicle, index) => (
                                    <option key={index} value={vehicle}>{vehicle}</option>
                                ))}
                            </select>
                            <Button
                                onClick={handleAssignVehicle}
                                disabled={!selectedVehicle}
                            >
                                Assigner
                            </Button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // Rendu du contenu du modal pour session
    const renderSessionContent = () => {
        if (!sessionReservation) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500">Élève</p>
                    <p className="font-medium">
                        {sessionReservation.user.firstName} {sessionReservation.user.lastName}
                    </p>
                    <p className="text-sm">{sessionReservation.user.email}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{sessionReservation.user.phone || 'Non renseigné'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Formation</p>
                    <p className="font-medium">{sessionReservation.session.formation.title}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{formatDate(sessionReservation.session.startDate)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Date de demande</p>
                    <p className="font-medium">{formatDate(sessionReservation.createdAt)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="font-medium">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(sessionReservation.status)}`}>
                {getStatusLabel(sessionReservation.status, 'formation')}
            </span>
                    </p>
                </div>
            </div>
        );
    };

    // Contenu à afficher en cas de chargement ou d'erreur
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{error}</p>
                </div>
            );
        }

        return reservationType === 'vehicle' ? renderVehicleContent() : renderSessionContent();
    };

    // Rendu du footer avec les actions
    const renderFooter = () => {
        return (
            <div className="flex justify-between items-center">
                {/* Bouton "Voir détails complets" à gauche, seulement pour les véhicules */}
                <div>
                    {reservationType === 'vehicle' && vehicleReservation && (
                        <Button
                            variant="outline"
                            onClick={handleViewFullDetails}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                            Voir détails complets
                        </Button>
                    )}
                </div>

                {/* Actions principales à droite */}
                <div className="flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Fermer
                    </Button>

                    {reservationType === 'vehicle' && (vehicleReservation?.status === 'submitted' || vehicleReservation?.status === 'under_review') && (
                        <Button
                            variant="success"
                            onClick={() => requestStatusChange('confirmed')}
                        >
                            Confirmer
                        </Button>
                    )}

                    {reservationType === 'vehicle' && (vehicleReservation?.status === 'submitted' || vehicleReservation?.status === 'under_review' || vehicleReservation?.status === 'confirmed') && (
                        <Button
                            variant="danger"
                            onClick={() => requestStatusChange('cancelled')}
                        >
                            Annuler
                        </Button>
                    )}

                    {reservationType === 'session' && (sessionReservation?.status === 'submitted' || sessionReservation?.status === 'under_review') && (
                        <Button
                            variant="success"
                            onClick={() => requestStatusChange('confirmed')}
                        >
                            Confirmer l'inscription
                        </Button>
                    )}

                    {reservationType === 'session' && (sessionReservation?.status === 'submitted' || sessionReservation?.status === 'under_review' || sessionReservation?.status === 'confirmed') && (
                        <Button
                            variant="danger"
                            onClick={() => requestStatusChange('cancelled')}
                        >
                            Annuler l'inscription
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const getModalTitle = () => {
        if (loading) return "Chargement...";
        if (reservationType === 'vehicle') return "Détails de la réservation de véhicule";
        return "Détails de l'inscription à la formation";
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={getModalTitle()}
                footer={renderFooter()}
                maxWidth="max-w-2xl"
            >
                {renderContent()}
            </Modal>

            {/* Modal de confirmation pour changement de statut */}
            {showStatusConfirmModal && pendingStatusChange && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            {/* Header */}
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

                            {/* Contenu */}
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
                                                Cette action déclenchera l'envoi d'un email automatique à l'utilisateur.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Utilisateur concerné :</label>
                                        <p className="text-base font-semibold text-gray-900">{pendingStatusChange.studentName}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Statut actuel :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.currentStatus)}`}>
                                                    {getStatusLabel(pendingStatusChange.currentStatus)}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.newStatus)}`}>
                                                    {getStatusLabel(pendingStatusChange.newStatus)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Email qui sera envoyé :</label>
                                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-blue-800 font-medium">
                                                    {getEmailDescription(pendingStatusChange.newStatus)}
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

                            {/* Boutons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelStatusChange}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Traitement...' : 'Confirmer et envoyer l\'email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReservationDetailModal;