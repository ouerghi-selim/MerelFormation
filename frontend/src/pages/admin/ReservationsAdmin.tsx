// src/pages/admin/ReservationsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronDown, Eye, Check, X, User, Car, BookOpen } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminReservationsApi } from '../../services/api';
import Alert from '../../components/common/Alert';
import ReservationDetailModal from '../../components/admin/ReservationDetailModal';

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

const ReservationsAdmin: React.FC = () => {
  // État pour le type de réservation actif (onglet)
  const [activeTab, setActiveTab] = useState<'vehicle' | 'session'>('vehicle');

  // États pour les réservations de véhicules
  const [vehicleReservations, setVehicleReservations] = useState<VehicleReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedVehicleReservation, setSelectedVehicleReservation] = useState<VehicleReservation | null>(null);

  // États pour les réservations de sessions
  const [sessionReservations, setSessionReservations] = useState<SessionReservation[]>([]);
  const [loadingSessionReservations, setLoadingSessionReservations] = useState(true);
  const [sessionSearchTerm, setSessionSearchTerm] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour le modal de détail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservationType, setSelectedReservationType] = useState<'vehicle' | 'session'>('vehicle');
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  // Effet pour charger les réservations de véhicules
  useEffect(() => {
    const fetchReservations = async () => {
      if (activeTab !== 'vehicle') return;

      try {
        setLoading(true);

        // Utilisation des appels API réels
        const response = await adminReservationsApi.getAll();
        setVehicleReservations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicle reservations:', err);
        setError('Erreur lors du chargement des réservations de véhicules');
      }
    };

    fetchReservations();
  }, [activeTab, searchTerm, statusFilter, dateFilter]);

  // Effet pour charger les réservations de sessions
  useEffect(() => {
    const fetchSessionReservations = async () => {
      if (activeTab !== 'session') return;

      try {
        setLoadingSessionReservations(true);

        // Paramètres de recherche/filtrage
        const params = new URLSearchParams();
        if (sessionSearchTerm) params.append('search', sessionSearchTerm);
        if (sessionStatusFilter) params.append('status', sessionStatusFilter);

        // Appel API
        const response = await adminReservationsApi.getSessionReservations(params.toString());
        setSessionReservations(response.data);
        setLoadingSessionReservations(false);
      } catch (err) {
        console.error('Error fetching session reservations:', err);
        setError('Erreur lors du chargement des réservations de sessions');
        setLoadingSessionReservations(false);

        // Données de test
        // setSessionReservations([
        //   // Vos mêmes données de mock...
        // ]);
      }
    };

    fetchSessionReservations();
  }, [activeTab, sessionSearchTerm, sessionStatusFilter]);

  // Fonctions pour ouvrir les modals de détails
  const handleViewVehicleDetails = (reservation: VehicleReservation) => {
    setSelectedReservationType('vehicle');
    setSelectedReservationId(reservation.id);
    setShowDetailModal(true);
  };

  const handleViewSessionDetails = (reservation: SessionReservation) => {
    setSelectedReservationType('session');
    setSelectedReservationId(reservation.id);
    setShowDetailModal(true);
  };

  // Fonction pour mettre à jour le statut d'une réservation
  const handleReservationStatusChange = (id: number, newStatus: string) => {
    if (selectedReservationType === 'vehicle') {
      setVehicleReservations(vehicleReservations.map(r =>
          r.id === id ? { ...r, status: newStatus } : r
      ));
    } else {
      setSessionReservations(sessionReservations.map(r =>
          r.id === id ? { ...r, status: newStatus } : r
      ));
    }

    setSuccessMessage(`Statut de la réservation mis à jour avec succès`);
    setTimeout(() => setSuccessMessage(null), 3000);
    setShowDetailModal(false);
  };

  // Fonction pour gérer le succès des opérations
  const handleModalSuccess = () => {
    // Recharger les données après un changement
    if (selectedReservationType === 'vehicle') {
      // Mettre à jour la liste des véhicules...
      // Pour l'instant, on se contente de fermer le modal
    }
    setShowDetailModal(false);
  };

  const handleSessionStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      // Appel API à créer
      await adminReservationsApi.updateSessionReservationStatus(reservationId, newStatus);

      // Mise à jour de l'état local
      setSessionReservations(sessionReservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
      ));

      setSuccessMessage(`Statut de la réservation mis à jour avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating session reservation status:', err);
      setError('Erreur lors de la mise à jour du statut');

      // Mise à jour de l'état local même en cas d'erreur (pour le développement)
      setSessionReservations(sessionReservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
      ));
    }
  };

  // Fonction utilitaire pour formater les dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonctions utilitaires pour les statuts
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

  return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title="Gestion des réservations" />

          <div className="p-6">
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

            {/* Onglets de navigation */}
            <div className="flex mb-6 border-b">
              <button
                  className={`py-2 px-4 font-medium text-sm ${
                      activeTab === 'vehicle'
                          ? 'text-blue-900 border-b-2 border-blue-900'
                          : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('vehicle')}
              >
                <Car className="inline-block h-4 w-4 mr-1" />
                Réservations de véhicules
              </button>
              <button
                  className={`py-2 px-4 font-medium text-sm ${
                      activeTab === 'session'
                          ? 'text-blue-900 border-b-2 border-blue-900'
                          : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('session')}
              >
                <BookOpen className="inline-block h-4 w-4 mr-1" />
                Réservations de formations
              </button>
            </div>

            {/* Contenu de l'onglet "Réservations de véhicules" */}
            {activeTab === 'vehicle' && (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="text-xl font-bold text-gray-800">
                      Demandes de réservation de véhicules
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-3 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="completed">Complétée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                      </div>

                      <div className="relative w-full md:w-48">
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

                  {loading ? (
                      <div className="bg-white p-8 rounded-lg shadow text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Chargement des réservations...</p>
                      </div>
                  ) : vehicleReservations.length === 0 ? (
                      <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-gray-700">Aucune réservation trouvée</p>
                      </div>
                  ) : (
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date d'examen
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Centre
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Formule
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Véhicule
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
                            {vehicleReservations.map((reservation) => (
                                <tr key={reservation.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{reservation.clientName}</div>
                                    <div className="text-xs text-gray-500">{reservation.clientEmail}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{reservation.date}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{reservation.examCenter}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{reservation.formula}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {reservation.vehicleAssigned || 'Non assigné'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(reservation.status)}`}>
                                {getStatusLabel(reservation.status)}
                              </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                          onClick={() => handleViewVehicleDetails(reservation)}
                                          className="text-blue-700 hover:text-blue-900"
                                          title="Voir détails"
                                      >
                                        <Eye className="h-5 w-5" />
                                      </button>
                                      {reservation.status === 'pending' && (
                                          <button
                                              onClick={() => handleReservationStatusChange(reservation.id, 'confirmed')}
                                              className="text-green-600 hover:text-green-900"
                                              title="Confirmer"
                                          >
                                            <Check className="h-5 w-5" />
                                          </button>
                                      )}
                                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                          <button
                                              onClick={() => handleReservationStatusChange(reservation.id, 'cancelled')}
                                              className="text-red-600 hover:text-red-900"
                                              title="Annuler"
                                          >
                                            <X className="h-5 w-5" />
                                          </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                  )}
                </>
            )}

            {/* Contenu de l'onglet "Réservations de sessions" */}
            {activeTab === 'session' && (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="text-xl font-bold text-gray-800">
                      Demandes d'inscription aux formations
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un élève..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={sessionSearchTerm}
                            onChange={(e) => setSessionSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-3 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                            value={sessionStatusFilter}
                            onChange={(e) => setSessionStatusFilter(e.target.value)}
                        >
                          <option value="">Tous les statuts</option>
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {loadingSessionReservations ? (
                      <div className="bg-white p-8 rounded-lg shadow text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Chargement des inscriptions...</p>
                      </div>
                  ) : sessionReservations.length === 0 ? (
                      <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-gray-700">Aucune inscription trouvée</p>
                      </div>
                  ) : (
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Élève
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Formation
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de début
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de demande
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
                            {sessionReservations.map((reservation) => (
                                <tr key={reservation.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {reservation.user.firstName} {reservation.user.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">{reservation.user.email}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {reservation.session.formation.title}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(reservation.session.startDate)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(reservation.createdAt)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(reservation.status)}`}>
                                {getStatusLabel(reservation.status)}
                              </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                          onClick={() => handleViewSessionDetails(reservation)}
                                          className="text-blue-700 hover:text-blue-900"
                                          title="Voir détails"
                                      >
                                        <Eye className="h-5 w-5" />
                                      </button>
                                      {reservation.status === 'pending' && (
                                          <button
                                              onClick={() => handleSessionStatusChange(reservation.id, 'confirmed')}
                                              className="text-green-600 hover:text-green-900"
                                              title="Confirmer"
                                          >
                                            <Check className="h-5 w-5" />
                                          </button>
                                      )}
                                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                          <button
                                              onClick={() => handleSessionStatusChange(reservation.id, 'cancelled')}
                                              className="text-red-600 hover:text-red-900"
                                              title="Annuler"
                                          >
                                            <X className="h-5 w-5" />
                                          </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>



        {/* Utilisation du composant ReservationDetailModal */}
        <ReservationDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            reservationType={selectedReservationType}
            reservationId={selectedReservationId}
            onStatusChange={handleReservationStatusChange}
            onSuccess={handleModalSuccess}
        />
      </div>
  );
};

export default ReservationsAdmin;