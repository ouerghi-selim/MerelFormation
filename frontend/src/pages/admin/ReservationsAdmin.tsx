// src/pages/admin/ReservationsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronDown, Eye, Check, X, User, Car } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminReservationsApi } from '@/services/api.ts';
import Alert from '../../components/common/Alert';
import ReservationDetailModal from '../../components/admin/ReservationDetailModal';
import { getStatusBadgeClass, getStatusLabel, ReservationStatus, ReservationTransition } from '@/utils/reservationStatuses.ts';

interface VehicleReservation {
  id: number;
  date: string;
  examCenter: string;
  formula: string;
  status: string;
  vehicleAssigned: string | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName: string;
  };
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
  // Suppression de l'onglet session - maintenant uniquement véhicules

  // États pour les réservations de véhicules
  const [vehicleReservations, setVehicleReservations] = useState<VehicleReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedVehicleReservation, setSelectedVehicleReservation] = useState<VehicleReservation | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // États pour le modal de détail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const selectedReservationType = 'vehicle'; // Toujours véhicule maintenant
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
  const [customMessage, setCustomMessage] = useState('');

  // Fonction helper pour les labels de statuts (toujours véhicule)
  const getStatusLabelForType = (status: string) => {
    return getStatusLabel(status, 'vehicle');
  };

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


  // Effet pour charger les réservations de véhicules
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);

        // Paramètres de filtrage
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
  }, [searchTerm, statusFilter, dateFilter]);


  // Fonction pour ouvrir le modal de détails
  const handleViewVehicleDetails = (reservation: VehicleReservation) => {
    setSelectedReservationId(reservation.id);
    setShowDetailModal(true);
  };

  // Fonction pour mettre à jour le statut d'une réservation
  const handleReservationStatusChange = async (id: number, newStatus: string) => {
    try {
      // Faire l'appel API (sans message personnalisé depuis le modal)
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
  const handleStatusChangeRequest = (reservationId: number, newStatus: string) => {
    // Trouver la réservation véhicule pour obtenir les informations
    const reservation = vehicleReservations.find(r => r.id === reservationId);
    if (!reservation) return;

    // Préparer les données pour le modal de confirmation
    setPendingStatusChange({
      reservationId,
      newStatus,
      reservationType: 'vehicle',
      currentStatus: reservation.status,
      studentName: reservation.user.fullName
    });
    
    // Fermer la liste déroulante et ouvrir le modal
    setShowStatusDropdown(prev => ({ ...prev, [reservationId]: false }));
    setShowConfirmModal(true);
  };

  // Fonction pour confirmer le changement de statut
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { reservationId, newStatus } = pendingStatusChange;
    
    try {
      await adminReservationsApi.updateStatus(reservationId, newStatus, customMessage || undefined);
      setVehicleReservations(vehicleReservations.map(r =>
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));

      const messageText = customMessage ? ' avec message personnalisé' : '';
      setSuccessMessage(`Statut mis à jour vers: ${getStatusLabelForType(newStatus)} - Email envoyé${messageText}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Fermer le modal et nettoyer l'état
      setShowConfirmModal(false);
      setPendingStatusChange(null);
      setCustomMessage('');
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
    setCustomMessage('');
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

  // Fonction pour obtenir les statuts véhicules
  const getStatusOptions = () => {
    const vehicleStatuses = [
      'submitted', 'under_review', 'awaiting_documents', 'documents_pending', 
      'documents_rejected', 'awaiting_payment', 'payment_pending', 'confirmed', 
      'in_progress', 'completed', 'cancelled', 'refunded'
    ];
    
    return vehicleStatuses.map(status => ({
      value: status,
      label: getStatusLabel(status, 'vehicle'),
      phase: '',
      color: 'gray',
      allowedTransitions: []
    }));
  };

  return (
    <AdminLayout title="Réservations de véhicules">
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

            {/* Contenu des réservations de véhicules */}
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="text-xl font-bold text-gray-800">
                      Demandes de réservation de véhicules
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <div className="relative w-full md:flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full md:w-36">
                        <Filter className="absolute left-3 top-3 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">Statuts</option>
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
                          <table className="w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '20%'}}>
                                Client
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '14%'}}>
                                Date
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '16%'}}>
                                Centre
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '14%'}}>
                                Formule
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '16%'}}>
                                Véhicule
                              </th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '12%'}}>
                                Statut
                              </th>
                              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '8%'}}>
                                Actions
                              </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {vehicleReservations.map((reservation) => (
                                <tr key={reservation.id}>
                                  <td className="px-3 py-4">
                                    <div className="text-sm font-medium text-gray-900 truncate" title="{reservation.user.fullName}">{reservation.user.fullName}</div>
                                    <div className="text-xs text-gray-500 truncate" title="{reservation.user.email}">{reservation.user.email}</div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="text-sm text-gray-900">{reservation.date}</div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="text-sm text-gray-900 truncate" title="{reservation.examCenter}">{reservation.examCenter}</div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="text-sm text-gray-900 truncate" title="{reservation.formula}">{reservation.formula}</div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="text-sm text-gray-900 truncate" title="{reservation.vehicleAssigned || 'Non assigné'}">
                                      {reservation.vehicleAssigned || 'Non assigné'}
                                    </div>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="relative">
                                      <button
                                        onClick={() => toggleStatusDropdown(reservation.id)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeClass(reservation.status)}`}
                                      >
                                        {getStatusLabelForType(reservation.status)}
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      </button>
                                      
                                      {showStatusDropdown[reservation.id] && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-32">
                                          <div className="py-1 max-h-64 overflow-y-auto">
                                            {getStatusOptions().map((status) => (
                                              <button
                                                key={status.value}
                                                onClick={() => handleStatusChangeRequest(reservation.id, status.value)}
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
                            {getStatusLabelForType(pendingStatusChange.currentStatus)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                        <div className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(pendingStatusChange.newStatus)}`}>
                            {getStatusLabelForType(pendingStatusChange.newStatus)}
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
                        <p className="mt-1 text-xs text-gray-500">
                          Ce message sera ajouté dans l'email pour donner plus de contexte à l'utilisateur.
                        </p>
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
                            {customMessage && (
                              <span className="block mt-1 text-xs">
                                + Votre message personnalisé
                              </span>
                            )}
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
    </AdminLayout>
  );
};

export default ReservationsAdmin;