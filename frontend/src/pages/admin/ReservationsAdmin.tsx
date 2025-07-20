// src/pages/admin/ReservationsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronDown, Eye, Check, X, User, Car, BookOpen } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminReservationsApi } from '../../services/api';
import Alert from '../../components/common/Alert';
import ReservationDetailModal from '../../components/admin/ReservationDetailModal';
import { getStatusBadgeClass, getStatusLabel, ReservationStatus, ReservationTransition } from '../../utils/reservationStatuses';

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

  // États pour les statuts disponibles
  const [availableStatuses, setAvailableStatuses] = useState<ReservationStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  // États pour le modal de détail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservationType, setSelectedReservationType] = useState<'vehicle' | 'session'>('vehicle');
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  // États pour la modification de statut
  const [statusChangeReservationId, setStatusChangeReservationId] = useState<number | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<Record<number, boolean>>({});
  
  // États pour le modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    reservationId: number;
    newStatus: string;
    reservationType: 'vehicle' | 'session';
    currentStatus: string;
    studentName: string;
  } | null>(null);

  // Effet pour fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowStatusDropdown({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Effet pour charger les statuts disponibles
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoadingStatuses(true);
        const response = await fetch('/api/admin/reservation-statuses');
        const data = await response.json();
        setAvailableStatuses(data);
        setLoadingStatuses(false);
      } catch (err) {
        console.error('Error fetching statuses:', err);
        setLoadingStatuses(false);
        // Utiliser les statuts de fallback si l'API n'est pas disponible
        setAvailableStatuses([]);
      }
    };

    fetchStatuses();
  }, []);

  // Effet pour charger les réservations de véhicules
  useEffect(() => {
    const fetchReservations = async () => {
      if (activeTab !== 'vehicle') return;

      try {
        setLoading(true);

        // ✅ CORRECTION : Ajouter les paramètres de filtrage
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (dateFilter) params.append('date', dateFilter);

        // Utilisation des appels API réels avec filtres
        const response = await adminReservationsApi.getAll(params.toString());
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
  const handleReservationStatusChange = async (id: number, newStatus: string) => {
    try {
      // Faire l'appel API
      await adminReservationsApi.updateStatus(id, newStatus);

      // Mettre à jour l'état local seulement après le succès de l'API
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
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
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

  // Fonction pour basculer l'affichage de la liste déroulante de statut
  const toggleStatusDropdown = (reservationId: number) => {
    setShowStatusDropdown(prev => ({
      ...prev,
      [reservationId]: !prev[reservationId]
    }));
  };

  // Fonction pour préparer le changement de statut (ouvre le modal de confirmation)
  const handleStatusChangeRequest = (reservationId: number, newStatus: string, reservationType: 'vehicle' | 'session') => {
    // Trouver la réservation pour obtenir les informations
    let currentStatus = '';
    let studentName = '';
    
    if (reservationType === 'vehicle') {
      const reservation = vehicleReservations.find(r => r.id === reservationId);
      if (reservation) {
        currentStatus = reservation.status;
        studentName = reservation.clientName;
      }
    } else {
      const reservation = sessionReservations.find(r => r.id === reservationId);
      if (reservation) {
        currentStatus = reservation.status;
        studentName = `${reservation.user.firstName} ${reservation.user.lastName}`;
      }
    }

    // Préparer les données pour le modal de confirmation
    setPendingStatusChange({
      reservationId,
      newStatus,
      reservationType,
      currentStatus,
      studentName
    });
    
    // Fermer la liste déroulante et ouvrir le modal
    setShowStatusDropdown(prev => ({ ...prev, [reservationId]: false }));
    setShowConfirmModal(true);
  };

  // Fonction pour confirmer le changement de statut
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { reservationId, newStatus, reservationType } = pendingStatusChange;
    
    try {
      if (reservationType === 'vehicle') {
        await adminReservationsApi.updateStatus(reservationId, newStatus);
        setVehicleReservations(vehicleReservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ));
      } else {
        await adminReservationsApi.updateSessionReservationStatus(reservationId, newStatus);
        setSessionReservations(sessionReservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ));
      }

      setSuccessMessage(`Statut mis à jour vers: ${getStatusLabel(newStatus)} - Email envoyé à l'utilisateur`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Fermer le modal et nettoyer l'état
      setShowConfirmModal(false);
      setPendingStatusChange(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erreur lors de la mise à jour du statut');
      setShowConfirmModal(false);
      setPendingStatusChange(null);
    }
  };

  // Fonction pour annuler le changement de statut
  const cancelStatusChange = () => {
    setShowConfirmModal(false);
    setPendingStatusChange(null);
  };

  // Fonction pour obtenir la description de l'email qui sera envoyé
  const getEmailDescription = (status: string): string => {
    const emailDescriptions: Record<string, string> = {
      // Phase 1 - Demande Initiale
      'submitted': 'Email de confirmation de réception de demande',
      'under_review': 'Email informant que le dossier est en cours d\'examen',
      
      // Phase 2 - Vérifications Administratives  
      'awaiting_documents': 'Email demandant les documents manquants',
      'documents_pending': 'Email confirmant la réception des documents',
      'documents_rejected': 'Email expliquant le rejet des documents',
      'awaiting_prerequisites': 'Email détaillant les prérequis manquants',
      
      // Phase 3 - Validation Financière
      'awaiting_funding': 'Email concernant l\'attente de financement',
      'funding_approved': 'Email de confirmation du financement',
      'awaiting_payment': 'Email de demande de paiement',
      'payment_pending': 'Email confirmant la réception du paiement',
      
      // Phase 4 - Confirmation
      'confirmed': 'Email de confirmation d\'inscription avec détails',
      'awaiting_start': 'Email avec informations de début de formation',
      
      // Phase 5 - Formation en Cours
      'in_progress': 'Email confirmant le début de la formation',
      'attendance_issues': 'Email concernant les problèmes d\'assiduité',
      'suspended': 'Email notifiant la suspension temporaire',
      
      // Phase 6 - Finalisation
      'completed': 'Email de félicitations avec certificat',
      'failed': 'Email d\'information sur l\'échec et possibilités de rattrapage',
      'cancelled': 'Email de confirmation d\'annulation',
      'refunded': 'Email confirmant le remboursement'
    };
    
    return emailDescriptions[status] || 'Email de notification de changement de statut';
  };

  // Fonction pour obtenir les statuts pour le filtre
  const getStatusOptions = () => {
    if (availableStatuses.length > 0) {
      return availableStatuses;
    }
    // Fallback sur les anciens statuts
    return [
      { value: 'pending', label: 'En attente', phase: '', color: 'yellow', allowedTransitions: [] },
      { value: 'confirmed', label: 'Confirmée', phase: '', color: 'green', allowedTransitions: [] },
      { value: 'completed', label: 'Terminée', phase: '', color: 'blue', allowedTransitions: [] },
      { value: 'cancelled', label: 'Annulée', phase: '', color: 'gray', allowedTransitions: [] },
    ];
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
                          {getStatusOptions().map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
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
                                    <div className="relative">
                                      <button
                                        onClick={() => toggleStatusDropdown(reservation.id)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeClass(reservation.status)}`}
                                      >
                                        {getStatusLabel(reservation.status)}
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      </button>
                                      
                                      {showStatusDropdown[reservation.id] && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48">
                                          <div className="py-1 max-h-64 overflow-y-auto">
                                            {getStatusOptions().map((status) => (
                                              <button
                                                key={status.value}
                                                onClick={() => handleStatusChangeRequest(reservation.id, status.value, 'vehicle')}
                                                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                                  reservation.status === status.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                }`}
                                              >
                                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusBadgeClass(status.value).split(' ')[0]}`}></span>
                                                {status.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
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
                          {getStatusOptions().map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
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
                                    <div className="relative">
                                      <button
                                        onClick={() => toggleStatusDropdown(reservation.id)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeClass(reservation.status)}`}
                                      >
                                        {getStatusLabel(reservation.status)}
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      </button>
                                      
                                      {showStatusDropdown[reservation.id] && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48">
                                          <div className="py-1 max-h-64 overflow-y-auto">
                                            {getStatusOptions().map((status) => (
                                              <button
                                                key={status.value}
                                                onClick={() => handleStatusChangeRequest(reservation.id, status.value, 'session')}
                                                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                                  reservation.status === status.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                }`}
                                              >
                                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusBadgeClass(status.value).split(' ')[0]}`}></span>
                                                {status.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
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



        {/* Modal de confirmation pour changement de statut */}
        {showConfirmModal && pendingStatusChange && (
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
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Confirmer et envoyer l'email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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