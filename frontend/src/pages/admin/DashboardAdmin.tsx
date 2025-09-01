// src/pages/admin/DashboardAdmin.tsx (version modifiée)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Calendar, AlertCircle, X, Eye, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ReservationDetailModal from '../../components/admin/ReservationDetailModal';
import SessionInspectionModal from '../../components/admin/SessionInspectionModal';
import {adminDashboardApi, adminReservationsApi, adminUsersApi} from '@/services/api.ts';
import { getStatusBadgeClass, getStatusLabel, ReservationStatus } from '../../utils/reservationStatuses';
import { ChevronDown } from 'lucide-react';

interface DashboardStats {
  activeStudents: number;
  activeFormations: number;
  upcomingSessions: number;
  pendingReservations: number;
  totalRevenue: number;
  conversionRate: number;
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

interface RecentReservation {
  id: number;
  vehicleAssigned: string | null;
  clientName: string;
  date: string;
  status: string;
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

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeStudents: 0,
    activeFormations: 0,
    upcomingSessions: 0,
    pendingReservations: 0,
    totalRevenue: 0,
    conversionRate: 0
  });

  const [sessionReservations, setSessionReservations] = useState<SessionReservation[]>([]);
  const [reservations, setReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservationType, setSelectedReservationType] = useState<'vehicle' | 'session'>('vehicle');
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  
  // États pour la confirmation du changement de statut
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState<{
    reservationId: number;
    newStatus: string;
    reservationType: 'vehicle' | 'session';
    currentStatusLabel: string;
    newStatusLabel: string;
    studentName: string;
  } | null>(null);
  const [statusChangeProcessing, setStatusChangeProcessing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // États pour les statuts et les dropdowns
  const [availableStatuses, setAvailableStatuses] = useState<ReservationStatus[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState<Record<number, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // États pour le modal d'inspection des réservations de session
  const [showSessionInspectionModal, setShowSessionInspectionModal] = useState(false);
  const [selectedSessionUserId, setSelectedSessionUserId] = useState<number | null>(null);
  
  // États pour la suppression de réservation
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<{
    id: number;
    studentName: string;
    formationTitle: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Données de graphique (à remplacer par des données réelles)
  const [revenueData, setRevenueData] = useState([]);
  const [successRateData, setSuccessRateData] = useState([]);

  // Effet pour charger les statuts disponibles
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/admin/reservation-statuses');
        const data = await response.json();
        setAvailableStatuses(data);
      } catch (err) {
        console.error('Error fetching statuses:', err);
        setAvailableStatuses([]);
      }
    };

    fetchStatuses();
  }, []);

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

  // Méthodes pour le modal
  const handleOpenVehicleReservation = (id: number) => {
    setSelectedReservationType('vehicle');
    setSelectedReservationId(id);
    setShowDetailModal(true);
  };

  const handleOpenSessionReservation = (id: number) => {
    setSelectedReservationType('session');
    setSelectedReservationId(id);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReservationId(null);
  };

  // Méthode pour mettre à jour les données après une action sur le modal
  const handleReservationUpdated = () => {
    fetchDashboardData();
    setShowDetailModal(false);
  };

  // Fonction pour ouvrir le modal d'inspection
  const openSessionInspectionModal = (userId: number) => {
    setSelectedSessionUserId(userId);
    setShowSessionInspectionModal(true);
  };

  // Fonction pour initier la suppression d'une réservation
  const handleDeleteReservation = (reservation: SessionReservation) => {
    setReservationToDelete({
      id: reservation.id,
      studentName: `${reservation.user.firstName} ${reservation.user.lastName}`,
      formationTitle: reservation.session.formation.title
    });
    setShowDeleteConfirmModal(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;

    try {
      setDeleting(true);
      await adminReservationsApi.deleteSessionReservation(reservationToDelete.id);
      
      // Mettre à jour la liste des réservations
      setSessionReservations(sessionReservations.filter(r => r.id !== reservationToDelete.id));
      
      setSuccessMessage('Réservation supprimée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setShowDeleteConfirmModal(false);
      setReservationToDelete(null);
    } catch (err) {
      console.error('Error deleting reservation:', err);
      setError('Erreur lors de la suppression de la réservation');
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour basculer l'affichage de la liste déroulante de statut
  const toggleStatusDropdown = (reservationId: number) => {
    setShowStatusDropdown(prev => ({
      ...prev,
      [reservationId]: !prev[reservationId]
    }));
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

  // Fonction pour initier le changement de statut avec confirmation
  const initiateStatusChange = (reservationId: number, newStatus: string, reservationType: 'vehicle' | 'session') => {
    // Trouver la réservation actuelle pour obtenir le statut actuel
    const currentReservation = reservationType === 'vehicle' 
      ? reservations.find(r => r.id === reservationId)
      : sessionReservations.find(r => r.id === reservationId);
    
    if (!currentReservation) return;

    const currentStatusLabel = getStatusLabel(currentReservation.status);
    const newStatusLabel = getStatusLabel(newStatus);
    const studentName = reservationType === 'vehicle' 
      ? currentReservation.clientName
      : sessionReservations.find(r => r.id === reservationId)?.user.firstName + ' ' + sessionReservations.find(r => r.id === reservationId)?.user.lastName;

    setStatusChangeData({
      reservationId,
      newStatus,
      reservationType,
      currentStatusLabel,
      newStatusLabel,
      studentName: studentName || 'Nom non disponible'
    });
    setShowStatusConfirmModal(true);
    
    // Fermer la liste déroulante
    setShowStatusDropdown(prev => ({ ...prev, [reservationId]: false }));
  };

  // Fonction pour confirmer et effectuer le changement de statut
  const handleConfirmStatusChange = async () => {
    if (!statusChangeData) return;

    try {
      setStatusChangeProcessing(true);
      const { reservationId, newStatus, reservationType } = statusChangeData;

      if (reservationType === 'vehicle') {
        await adminReservationsApi.updateStatus(reservationId, newStatus, customMessage);
        setReservations(reservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ));
      } else {
        await adminReservationsApi.updateSessionReservationStatus(reservationId, newStatus, customMessage);
        setSessionReservations(sessionReservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ));
      }

      setSuccessMessage(`Statut mis à jour vers: ${getStatusLabel(newStatus)}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Fermer le modal de confirmation
      setShowStatusConfirmModal(false);
      setStatusChangeData(null);
      setCustomMessage('');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setStatusChangeProcessing(false);
    }
  };

  // Fonction pour obtenir les statuts pour le filtre
  const getStatusOptions = () => {
    if (availableStatuses.length > 0) {
      return availableStatuses;
    }
    // Fallback sur les anciens statuts
    return [
      { value: 'submitted', label: 'Demande soumise', phase: '', color: 'blue', allowedTransitions: [] },
      { value: 'confirmed', label: 'Confirmée', phase: '', color: 'green', allowedTransitions: [] },
      { value: 'completed', label: 'Terminée', phase: '', color: 'blue', allowedTransitions: [] },
      { value: 'cancelled', label: 'Annulée', phase: '', color: 'gray', allowedTransitions: [] },
    ];
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utilisation des appels API réels
      const [
        statsResponse,
        sessionReservationsResponse,
        vehicleReservationsResponse,
        revenueDataResponse,
        successRateDataResponse
      ] = await Promise.all([
        adminDashboardApi.getStats(),
        adminReservationsApi.getSessionReservations('limit=4&sort=createdAt,desc'),
        adminReservationsApi.getAll('limit=4&sort=date,desc'),
        adminDashboardApi.getRevenueData(),
        adminDashboardApi.getSuccessRateData()
      ]);

      setStats(statsResponse.data);
      setSessionReservations(sessionReservationsResponse.data);
      setReservations(vehicleReservationsResponse.data);
      setRevenueData(revenueDataResponse.data);
      setSuccessRateData(successRateDataResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données du tableau de bord');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Tableau de bord">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Tableau de bord"
      breadcrumbItems={[
        { label: 'Admin', path: '/admin' },
        { label: 'Tableau de bord' }
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                  title="Élèves actifs"
                  value={stats.activeStudents}
                  icon={<Users className="h-8 w-8 text-blue-700" />}
                  trend="+5% cette semaine"
                  trendUp={true}
              />
              <StatCard
                  title="Formations actives"
                  value={stats.activeFormations}
                  icon={<BookOpen className="h-8 w-8 text-green-700" />}
              />
              <StatCard
                  title="Sessions à venir"
                  value={stats.upcomingSessions}
                  icon={<Calendar className="h-8 w-8 text-orange-700" />}
              />
              <StatCard
                  title="Réservations en attente"
                  value={stats.pendingReservations}
                  icon={<AlertCircle className="h-8 w-8 text-red-700" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Réservations de formations récentes</h2>
                  <Link to="/admin/reservations" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Élève
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                    {sessionReservations.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.user.firstName} {reservation.user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{reservation.session.formation.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(reservation.createdAt)}</div>
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
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-48">
                                  <div className="py-1 max-h-64 overflow-y-auto">
                                    {getStatusOptions().map((status) => (
                                      <button
                                        key={status.value}
                                        onClick={() => initiateStatusChange(reservation.id, status.value, 'session')}
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
                            <div className="flex items-center justify-end space-x-2">
                              {/* Bouton Inspection rapide */}
                              <button
                                  onClick={() => openSessionInspectionModal(reservation.user.id)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Inspection rapide"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {/* Bouton Modifier (Page complète) */}
                              <button
                                  onClick={() => navigate(`/admin/reservations/session/${reservation.user.id}/edit`)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              {/* Bouton Supprimer */}
                              <button
                                  onClick={() => handleDeleteReservation(reservation)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Réservations de véhicules récentes</h2>
                  <Link to="/admin/reservations" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Véhicule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.vehicleAssigned || 'Non assigné'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{reservation.clientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{reservation.date}</div>
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
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-48">
                                  <div className="py-1 max-h-64 overflow-y-auto">
                                    {getStatusOptions().map((status) => (
                                      <button
                                        key={status.value}
                                        onClick={() => initiateStatusChange(reservation.id, status.value, 'vehicle')}
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
                            <button
                                onClick={() => handleOpenVehicleReservation(reservation.id)}
                                className="text-blue-700 hover:text-blue-900"
                            >
                              Gérer
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <ReservationDetailModal
                isOpen={showDetailModal}
                onClose={handleCloseModal}
                reservationType={selectedReservationType}
                reservationId={selectedReservationId}
                onSuccess={handleReservationUpdated}
            />

            {/* Modal inspection réservation session */}
            <SessionInspectionModal
                isOpen={showSessionInspectionModal}
                onClose={() => {
                    setShowSessionInspectionModal(false);
                    setSelectedSessionUserId(null);
                }}
                userId={selectedSessionUserId || 0}
            />

            {/* Modal de confirmation de suppression */}
            {showDeleteConfirmModal && reservationToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Trash2 className="h-6 w-6 text-red-600 mr-2" />
                                    Confirmer la suppression
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirmModal(false);
                                        setReservationToDelete(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mb-6 space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-red-800">
                                                Attention : Cette action est irréversible
                                            </h4>
                                            <p className="mt-1 text-sm text-red-700">
                                                La réservation sera définitivement supprimée et ne pourra pas être récupérée.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Étudiant :</label>
                                        <p className="text-base font-semibold text-gray-900">{reservationToDelete.studentName}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Formation :</label>
                                        <p className="text-base text-gray-900">{reservationToDelete.formationTitle}</p>
                                    </div>

                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 font-medium">
                                            ⚠️ Cette action va supprimer la réservation de l'étudiant pour cette formation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirmModal(false);
                                        setReservationToDelete(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={deleting}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDeleteReservation}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Suppression...
                                        </span>
                                    ) : (
                                        'Supprimer définitivement'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation pour le changement de statut */}
            {/* Modal de confirmation pour changement de statut - Style unifié */}
            {showStatusConfirmModal && statusChangeData && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirmation de changement de statut
                                </h3>
                                <button
                                    onClick={() => setShowStatusConfirmModal(false)}
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
                                        <p className="text-base font-semibold text-gray-900">{statusChangeData.studentName}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Statut actuel :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(statusChangeData.reservationType === 'vehicle' 
                                                  ? reservations.find(r => r.id === statusChangeData.reservationId)?.status || ''
                                                  : sessionReservations.find(r => r.id === statusChangeData.reservationId)?.status || ''
                                                )}`}>
                                                    {statusChangeData.currentStatusLabel}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nouveau statut :</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(statusChangeData.newStatus)}`}>
                                                    {statusChangeData.newStatusLabel}
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
                                                    {getEmailDescription(statusChangeData.newStatus)}
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
                                    onClick={() => {
                                        setShowStatusConfirmModal(false);
                                        setCustomMessage('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmStatusChange}
                                    disabled={statusChangeProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {statusChangeProcessing ? 'Traitement...' : 'Confirmer et envoyer l\'email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Graphiques temporairement masqués */}
            {/* 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Revenus mensuels</h2>
                <LineChart
                    data={revenueData}
                    lines={[{ dataKey: 'revenue', color: '#4F46E5', name: 'Revenu (€)' }]}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Taux de confirmation des réservations</h2>
                <BarChart
                    data={successRateData}
                    bars={[{ dataKey: 'taux', color: '#10B981', name: 'Taux de confirmation (%)' }]}
                />
              </div>
            </div>
            */}
    </AdminLayout>
  );
};

export default DashboardAdmin;