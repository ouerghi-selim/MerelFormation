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
    Building
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import { adminReservationsApi } from '../../services/api';
import Alert from '../../components/common/Alert';

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

    useEffect(() => {
        if (id) {
            fetchReservationDetails();
        }
    }, [id]);

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

    const handleStatusChange = async (newStatus: string) => {
        if (!reservation) return;

        try {
            setLoading(true);
            await adminReservationsApi.updateStatus(reservation.id, newStatus);
            setReservation({ ...reservation, status: newStatus });
            setSuccessMessage(`Statut mis à jour avec succès vers "${getStatusLabel(newStatus)}"`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Erreur lors de la mise à jour du statut');
        } finally {
            setLoading(false);
        }
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
        switch (status) {
            case 'pending': return 'En attente';
            case 'confirmed': return 'Confirmée';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <AlertCircle className="w-5 h-5" />;
            case 'confirmed': return <CheckCircle className="w-5 h-5" />;
            case 'completed': return <CheckCircle className="w-5 h-5" />;
            case 'cancelled': return <XCircle className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
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
                                    {reservation.status === 'pending' && (
                                        <Button 
                                            onClick={() => handleStatusChange('confirmed')} 
                                            variant="success" 
                                            className="w-full"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Confirmer
                                        </Button>
                                    )}
                                    
                                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                        <Button 
                                            onClick={() => handleStatusChange('cancelled')} 
                                            variant="danger" 
                                            className="w-full"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Annuler
                                        </Button>
                                    )}

                                    {reservation.status === 'confirmed' && (
                                        <Button 
                                            onClick={() => handleStatusChange('completed')} 
                                            variant="primary" 
                                            className="w-full"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Marquer comme terminée
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Assignation de véhicule */}
                            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
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
        </div>
    );
};

export default VehicleReservationDetail;