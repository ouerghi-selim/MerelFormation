import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    Car, 
    MapPin, 
    Calendar, 
    Clock, 
    CreditCard, 
    FileText, 
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Mail,
    Building,
    X
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import { adminReservationsApi } from '../../services/api';
import Alert from '../../components/common/Alert';
import { getStatusBadgeClass, getStatusLabel as getReservationStatusLabel } from '../../utils/reservationStatuses';

interface VehicleReservationDetail {
    id: number;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    date: string;
    examCenter: string;
    formula: string;
    status: string;
    vehicleAssigned: string | null;
    // Champs supplémentaires que nous espérons avoir dans l'API
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
    pickupLocation?: string;
    returnLocation?: string;
    examTime?: string;
    financing?: string;
    paymentMethod?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    // Documents et facture
    documents?: any[];
    invoice?: any;
}

const VehicleReservationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [reservation, setReservation] = useState<VehicleReservationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [availableTransitions, setAvailableTransitions] = useState<any[]>([]);
    
    // États pour le modal de confirmation de changement de statut
    const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        newStatus: string;
        currentStatus: string;
        studentName: string;
    } | null>(null);
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        if (id) {
            fetchReservationDetails();
            fetchAvailableTransitions();
        }
    }, [id]);

    const fetchAvailableTransitions = async () => {
        try {
            const response = await adminReservationsApi.getVehicleRentalTransitions();
            setAvailableTransitions(response.data);
        } catch (err) {
            console.error('Error fetching transitions:', err);
        }
    };

    const fetchReservationDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await adminReservationsApi.getById(Number(id));
            setReservation(response.data);
            
            if (response.data.vehicleAssigned) {
                setSelectedVehicle(response.data.vehicleAssigned);
            }

            // Charger les véhicules disponibles
            if (response.data.date) {
                const dateParts = response.data.date.split('/');
                if (dateParts.length === 3) {
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    const vehiclesResponse = await adminReservationsApi.getAvailableVehicles(formattedDate);
                    setAvailableVehicles(vehiclesResponse.data.map((v: any) => v.model));
                }
            }
        } catch (err) {
            console.error('Error fetching reservation details:', err);
            setError('Erreur lors du chargement des détails de la réservation');
        } finally {
            setLoading(false);
        }
    };

    const requestStatusChange = (newStatus: string) => {
        if (!reservation) return;

        setPendingStatusChange({
            newStatus,
            currentStatus: reservation.status,
            studentName: reservation.clientName
        });
        
        setShowStatusConfirmModal(true);
    };

    const handleStatusChange = async () => {
        if (!reservation || !pendingStatusChange) return;

        try {
            setLoading(true);
            await adminReservationsApi.updateStatus(reservation.id, pendingStatusChange.newStatus, customMessage);
            setReservation({ ...reservation, status: pendingStatusChange.newStatus });
            setSuccessMessage(`Statut mis à jour avec succès vers "${getReservationStatusLabel(pendingStatusChange.newStatus, 'vehicle')}"`);
            setTimeout(() => setSuccessMessage(null), 3000);
            
            // Fermer le modal de confirmation et nettoyer l'état
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } catch (err) {
            setError('Erreur lors de la mise à jour du statut');
            setShowStatusConfirmModal(false);
            setPendingStatusChange(null);
            setCustomMessage('');
        } finally {
            setLoading(false);
        }
    };

    const cancelStatusChange = () => {
        setShowStatusConfirmModal(false);
        setPendingStatusChange(null);
        setCustomMessage('');
    };

    // Fonction pour obtenir la description de l'email
    const getEmailDescription = (status: string): string => {
        const emailDescriptions: Record<string, string> = {
            'pending': 'Email de confirmation de demande',
            'confirmed': 'Email de confirmation de réservation',
            'completed': 'Email de confirmation de fin de service',
            'cancelled': 'Email de confirmation d\'annulation'
        };
        
        return emailDescriptions[status] || 'Email de notification de changement de statut';
    };

    const handleAssignVehicle = async () => {
        if (!reservation || !selectedVehicle) return;

        try {
            setLoading(true);
            await adminReservationsApi.assignVehicle(reservation.id, selectedVehicle);
            setReservation({ ...reservation, vehicleAssigned: selectedVehicle });
            setSuccessMessage('Véhicule assigné avec succès');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Erreur lors de l\'assignation du véhicule');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        return getReservationStatusLabel(status, 'vehicle');
    };

    const getStatusColor = (status: string) => {
        return getStatusBadgeClass(status) + ' border';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'submitted': return <AlertCircle className="w-4 h-4" />;
            case 'under_review': return <Clock className="w-4 h-4" />;
            case 'awaiting_documents': return <FileText className="w-4 h-4" />;
            case 'documents_pending': return <FileText className="w-4 h-4" />;
            case 'documents_rejected': return <XCircle className="w-4 h-4" />;
            case 'awaiting_payment': return <CreditCard className="w-4 h-4" />;
            case 'payment_pending': return <CreditCard className="w-4 h-4" />;
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'in_progress': return <Car className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            case 'refunded': return <CreditCard className="w-4 h-4" />;
            // Anciens statuts pour compatibilité
            case 'pending': return <AlertCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getButtonVariant = (status: string): 'primary' | 'success' | 'danger' | 'outline' => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'completed': return 'primary';
            case 'cancelled': return 'danger';
            case 'refunded': return 'outline';
            default: return 'outline';
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Non renseigné';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return 'Non renseigné';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1">
                    <AdminHeader title="Chargement..." />
                    <div className="p-6">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1">
                    <AdminHeader title="Erreur" />
                    <div className="p-6">
                        <Alert type="error" message={error} />
                        <div className="mt-4">
                            <Button onClick={() => navigate('/admin/reservations')} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour aux réservations
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1">
                    <AdminHeader title="Réservation introuvable" />
                    <div className="p-6">
                        <Alert type="error" message="Cette réservation n'existe pas ou a été supprimée." />
                        <div className="mt-4">
                            <Button onClick={() => navigate('/admin/reservations')} variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour aux réservations
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title={`Réservation véhicule #${reservation.id}`} />
                
                <div className="p-6">
                    {/* Messages de succès et d'erreur */}
                    {successMessage && (
                        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
                    )}
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}

                    {/* En-tête avec navigation et statut */}
                    <div className="flex justify-between items-start mb-6">
                        <Button onClick={() => navigate('/admin/reservations')} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour aux réservations
                        </Button>
                        
                        <div className={`flex items-center px-4 py-2 rounded-lg border ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            <span className="ml-2 font-medium">{getStatusLabel(reservation.status)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne principale */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Section Client */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 text-blue-600 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Informations Client</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                            <p className="mt-1 text-sm text-gray-900">{reservation.clientName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <div className="mt-1 flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.clientEmail}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                            <div className="mt-1 flex items-center">
                                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.clientPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Réservation */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <Car className="w-5 h-5 text-blue-600 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Détails de la Réservation</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date de début</label>
                                            <div className="mt-1 flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.startDate ? formatDate(reservation.startDate) : reservation.date}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date de fin</label>
                                            <div className="mt-1 flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.endDate ? formatDate(reservation.endDate) : 'Non renseigné'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Lieu de prise en charge</label>
                                            <div className="mt-1 flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.pickupLocation || 'Non renseigné'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Lieu de retour</label>
                                            <div className="mt-1 flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.returnLocation || 'Non renseigné'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Véhicule assigné</label>
                                            <p className="text-sm text-gray-900">{reservation.vehicleAssigned || 'Aucun véhicule assigné'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Examen */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <Building className="w-5 h-5 text-blue-600 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Détails de l'Examen</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Centre d'examen</label>
                                            <p className="mt-1 text-sm text-gray-900">{reservation.examCenter}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date d'examen</label>
                                            <div className="mt-1 flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.date}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Heure d'examen</label>
                                            <div className="mt-1 flex items-center">
                                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{reservation.examTime || 'Non renseigné'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Formule</label>
                                            <p className="mt-1 text-sm text-gray-900">{reservation.formula}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Financière */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Informations Financières</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Prix total</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                {reservation.totalPrice ? `${reservation.totalPrice}€` : 'Non renseigné'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Mode de paiement</label>
                                            <p className="mt-1 text-sm text-gray-900">{reservation.paymentMethod || 'Non renseigné'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Financement</label>
                                            <p className="mt-1 text-sm text-gray-900">{reservation.financing || 'Non renseigné'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Facture</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {reservation.invoice ? 'Générée' : 'Non générée'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Notes */}
                            {reservation.notes && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center">
                                            <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                                            <h2 className="text-lg font-semibold text-gray-900">Notes et Commentaires</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{reservation.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Colonne latérale */}
                        <div className="space-y-6">
                            {/* Actions rapides */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {/* Affichage des transitions autorisées */}
                                    {availableTransitions
                                        .find(t => t.fromStatus === reservation.status)?.toStatuses
                                        .map((transition: any) => (
                                            <Button 
                                                key={transition.status}
                                                onClick={() => requestStatusChange(transition.status)} 
                                                variant={getButtonVariant(transition.status)}
                                                className="w-full"
                                            >
                                                {getStatusIcon(transition.status)}
                                                <span className="ml-2">{transition.label}</span>
                                            </Button>
                                        ))
                                    }
                                    
                                    {/* Message si aucune transition disponible */}
                                    {availableTransitions.length > 0 && 
                                     (!availableTransitions.find(t => t.fromStatus === reservation.status)?.toStatuses?.length || 
                                      availableTransitions.find(t => t.fromStatus === reservation.status)?.toStatuses?.length === 0) && (
                                        <div className="text-center text-gray-500 text-sm py-4">
                                            Aucune action disponible pour ce statut
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assignation de véhicule */}
                            {(['submitted', 'under_review', 'confirmed', 'awaiting_payment', 'payment_pending'].includes(reservation.status)) && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Assignation Véhicule</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                                                disabled={!selectedVehicle || selectedVehicle === reservation.vehicleAssigned}
                                                className="w-full"
                                            >
                                                <Car className="w-4 h-4 mr-2" />
                                                {reservation.vehicleAssigned ? 'Changer le véhicule' : 'Assigner le véhicule'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Informations système */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Informations Système</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ID Réservation</label>
                                        <p className="mt-1 text-sm text-gray-900">#{reservation.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Créée le</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {reservation.createdAt ? formatDateTime(reservation.createdAt) : 'Non renseigné'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {reservation.updatedAt ? formatDateTime(reservation.updatedAt) : 'Non renseigné'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                                    {getReservationStatusLabel(pendingStatusChange.currentStatus, 'vehicle')}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.newStatus)}`}>
                                                    {getReservationStatusLabel(pendingStatusChange.newStatus, 'vehicle')}
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
                                    onClick={handleStatusChange}
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
        </div>
    );
};

export default VehicleReservationDetail;