// src/pages/admin/DashboardAdmin.tsx (version refactorisée)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import Alert from '../../components/common/Alert';
import { adminDashboardApi } from '../../services/api';

interface DashboardStats {
  activeStudents: number;
  activeFormations: number;
  upcomingSessions: number;
  pendingReservations: number;
  totalRevenue: number;
  conversionRate: number;
}

interface RecentInscription {
  id: number;
  studentName: string;
  formationName: string;
  date: string;
}

interface RecentReservation {
  id: number;
  vehicleModel: string;
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

  const [inscriptions, setInscriptions] = useState<RecentInscription[]>([]);
  const [reservations, setReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données de graphique (à remplacer par des données réelles)
  const revenueData = [
    { name: 'Jan', revenue: 5000 },
    { name: 'Fév', revenue: 4500 },
    { name: 'Mar', revenue: 6000 },
    { name: 'Avr', revenue: 8000 },
    { name: 'Mai', revenue: 7500 },
    { name: 'Juin', revenue: 9000 },
  ];

  const successRateData = [
    { name: 'Formation Initiale', taux: 85 },
    { name: 'Formation Continue', taux: 92 },
    { name: 'Formation Mobilité', taux: 88 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Utilisation des appels API réels
        const [statsResponse, inscriptionsResponse, reservationsResponse] = await Promise.all([
          adminDashboardApi.getStats(),
          adminDashboardApi.getRecentInscriptions(),
          adminDashboardApi.getRecentReservations()
        ]);

        setStats(statsResponse.data);
        setInscriptions(inscriptionsResponse.data);
        setReservations(reservationsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);

        // Données de secours en cas d'erreur (pour le développement)
        setStats({
          activeStudents: 24,
          activeFormations: 12,
          upcomingSessions: 8,
          pendingReservations: 5,
          totalRevenue: 15000,
          conversionRate: 68
        });

        setInscriptions([
          { id: 1, studentName: 'Jean Dupont', formationName: 'Formation Initiale', date: '12/03/2025' },
          { id: 2, studentName: 'Marie Lambert', formationName: 'Formation Mobilité', date: '10/03/2025' },
          { id: 3, studentName: 'Paul Martin', formationName: 'Formation Continue', date: '08/03/2025' },
          { id: 4, studentName: 'Sophie Klein', formationName: 'Formation Initiale', date: '05/03/2025' }
        ]);

        setReservations([
          { id: 1, vehicleModel: 'Touran', clientName: 'Sophie Klein', date: '15/03/2025', status: 'pending' },
          { id: 2, vehicleModel: 'Touran', clientName: 'Kevin Robert', date: '14/03/2025', status: 'confirmed' },
          { id: 3, vehicleModel: 'Clio', clientName: 'Thomas Blanc', date: '12/03/2025', status: 'completed' },
          { id: 4, vehicleModel: 'Clio', clientName: 'Julie Moreau', date: '10/03/2025', status: 'cancelled' }
        ]);
      }
    };

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
                  <h2 className="text-xl font-bold text-gray-800">Dernières inscriptions</h2>
                  <Link to="/admin/inscriptions" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {inscriptions.map((inscription) => (
                        <tr key={inscription.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{inscription.studentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{inscription.formationName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{inscription.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/admin/inscriptions/${inscription.id}`} className="text-blue-700 hover:text-blue-900">
                              Détails
                            </Link>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Réservations récentes</h2>
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
                            <div className="text-sm font-medium text-gray-900">{reservation.vehicleModel}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{reservation.clientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{reservation.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'}`}>
                            {reservation.status === 'pending' ? 'En attente' :
                                reservation.status === 'confirmed' ? 'Confirmée' :
                                    reservation.status === 'completed' ? 'Terminée' :
                                        'Annulée'}
                          </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/admin/reservations/${reservation.id}`} className="text-blue-700 hover:text-blue-900">
                              Gérer
                            </Link>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Revenus mensuels</h2>
                <LineChart
                    data={revenueData}
                    lines={[{ dataKey: 'revenue', color: '#4F46E5', name: 'Revenu (€)' }]}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Taux de réussite aux examens</h2>
                <BarChart
                    data={successRateData}
                    bars={[{ dataKey: 'taux', color: '#10B981', name: 'Taux de réussite (%)' }]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardAdmin;