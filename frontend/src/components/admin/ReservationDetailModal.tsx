import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminReservationsApi } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';

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

    const handleStatusChange = async (status: string) => {
        if (!reservationId) return;

        try {
            setLoading(true);
            setError(null);

            if (reservationType === 'vehicle') {
                await adminReservationsApi.updateStatus(reservationId, status);
                if (vehicleReservation) {
                    setVehicleReservation({
                        ...vehicleReservation,
                        status
                    });
                }
            } else {
                await adminReservationsApi.updateSessionReservationStatus(reservationId, status);
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
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Erreur lors de la mise à jour du statut');
        } finally {
            setLoading(false);
        }
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'confirmed': return 'Confirmée';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(vehicleReservation.status)}`}>
                {getStatusLabel(vehicleReservation.status)}
            </span>
                        </p>
                    </div>
                </div>

                {(vehicleReservation.status === 'pending' || vehicleReservation.status === 'confirmed') && (
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
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sessionReservation.status)}`}>
                {getStatusLabel(sessionReservation.status)}
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

                    {reservationType === 'vehicle' && vehicleReservation?.status === 'pending' && (
                        <Button
                            variant="success"
                            onClick={() => handleStatusChange('confirmed')}
                        >
                            Confirmer
                        </Button>
                    )}

                    {reservationType === 'vehicle' && (vehicleReservation?.status === 'pending' || vehicleReservation?.status === 'confirmed') && (
                        <Button
                            variant="danger"
                            onClick={() => handleStatusChange('cancelled')}
                        >
                            Annuler
                        </Button>
                    )}

                    {reservationType === 'session' && sessionReservation?.status === 'pending' && (
                        <Button
                            variant="success"
                            onClick={() => handleStatusChange('confirmed')}
                        >
                            Confirmer l'inscription
                        </Button>
                    )}

                    {reservationType === 'session' && (sessionReservation?.status === 'pending' || sessionReservation?.status === 'confirmed') && (
                        <Button
                            variant="danger"
                            onClick={() => handleStatusChange('cancelled')}
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getModalTitle()}
            footer={renderFooter()}
            maxWidth="max-w-2xl"
        >
            {renderContent()}
        </Modal>
    );
};

export default ReservationDetailModal;