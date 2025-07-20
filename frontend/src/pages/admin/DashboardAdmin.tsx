// src/pages/admin/DashboardAdmin.tsx (version modifiée)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ReservationDetailModal from '../../components/admin/ReservationDetailModal';
import {adminDashboardApi, adminReservationsApi} from '@/services/api.ts';
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

const DashboardAdmin: React.FC = () => {
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
  } | null>(null);
  const [statusChangeProcessing, setStatusChangeProcessing] = useState(false);

  // États pour les statuts et les dropdowns
  const [availableStatuses, setAvailableStatuses] = useState<ReservationStatus[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState<Record<number, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Fonction pour basculer l'affichage de la liste déroulante de statut
  const toggleStatusDropdown = (reservationId: number) => {
    setShowStatusDropdown(prev => ({
      ...prev,
      [reservationId]: !prev[reservationId]
    }));
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

    setStatusChangeData({
      reservationId,
      newStatus,
      reservationType,
      currentStatusLabel,
      newStatusLabel
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
        await adminReservationsApi.updateStatus(reservationId, newStatus);
        setReservations(reservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ));
      } else {
        await adminReservationsApi.updateSessionReservationStatus(reservationId, newStatus);
        setSessionReservations(sessionReservations.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ));
      }

      setSuccessMessage(`Statut mis à jour vers: ${getStatusLabel(newStatus)}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Fermer le modal de confirmation
      setShowStatusConfirmModal(false);
      setStatusChangeData(null);
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
      { value: 'pending', label: 'En attente', phase: '', color: 'yellow', allowedTransitions: [] },
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
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 p-8">
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader
              title="Tableau de bord"
              breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Tableau de bord' }
              ]}
          />

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                            <button
                                onClick={() => handleOpenSessionReservation(reservation.id)}
                                className="text-blue-700 hover:text-blue-900"
                            >
                              Détails
                            </button>
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

            {/* Modal de confirmation pour le changement de statut */}
            <Modal
                isOpen={showStatusConfirmModal}
                onClose={() => setShowStatusConfirmModal(false)}
                title="Confirmer le changement de statut"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusConfirmModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            loading={statusChangeProcessing}
                            onClick={handleConfirmStatusChange}
                        >
                            Confirmer
                        </Button>
                    </div>
                }
            >
                {statusChangeData && (
                    <div>
                        <p className="text-gray-700 mb-2">
                            Êtes-vous sûr de vouloir modifier le statut de cette réservation ?
                        </p>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">
                                <span className="font-medium">Statut actuel :</span>{' '}
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(statusChangeData.reservationType === 'vehicle' 
                                  ? reservations.find(r => r.id === statusChangeData.reservationId)?.status || ''
                                  : sessionReservations.find(r => r.id === statusChangeData.reservationId)?.status || ''
                                )}`}>
                                    {statusChangeData.currentStatusLabel}
                                </span>
                            </p>
                            <p className="text-sm mt-1">
                                <span className="font-medium">Nouveau statut :</span>{' '}
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(statusChangeData.newStatus)}`}>
                                    {statusChangeData.newStatusLabel}
                                </span>
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

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
          </div>
        </div>
      </div>
  );
};

export default DashboardAdmin;