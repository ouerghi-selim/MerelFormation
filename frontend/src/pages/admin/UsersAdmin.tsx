import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, GraduationCap, Award } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import useDataFetching from '../../hooks/useDataFetching';
import { adminUsersApi } from '../../services/api';
import Alert from '../../components/common/Alert';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

interface Stats {
  admins: UserStats;
  students: UserStats;
  instructors: UserStats;
}

const UsersAdmin: React.FC = () => {
  // Mémoriser la fonction de récupération des statistiques
  const fetchStats = useCallback(async () => {
    try {
      // Effectuer trois appels API parallèles
      const [adminsResponse, studentsResponse, instructorsResponse] = await Promise.all([
        adminUsersApi.getAll('role=ROLE_ADMIN'),
        adminUsersApi.getAll('role=ROLE_USER'),
        adminUsersApi.getAll('role=ROLE_INSTRUCTOR')
      ]);

      // Extraire les données
      const admins = adminsResponse.data || [];
      const students = studentsResponse.data || [];
      const instructors = instructorsResponse.data || [];

      console.log('Données récupérées:', { admins, students, instructors });

      // Calculer les statistiques avec la bonne propriété "isActive"
      const stats = {
        admins: {
          total: admins.length,
          active: admins.filter(user => user.isActive === true).length,
          inactive: admins.filter(user => user.isActive === false).length
        },
        students: {
          total: students.length,
          active: students.filter(user => user.isActive === true).length,
          inactive: students.filter(user => user.isActive === false).length
        },
        instructors: {
          total: instructors.length,
          active: instructors.filter(user => user.isActive === true).length,
          inactive: instructors.filter(user => user.isActive === false).length
        }
      };

      console.log('Statistiques calculées:', stats);

      return stats;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }, []);

  // Utiliser la fonction mémorisée dans le hook
  const { data: stats, loading, error } = useDataFetching<Stats>({
    fetchFn: fetchStats
  });

  const userCategories = [
    {
      title: 'Administrateurs',
      description: 'Gérer les administrateurs de la plateforme',
      icon: <Shield className="h-12 w-12 text-purple-500" />,
      stats: stats?.admins,
      path: '/admin/users/admins',
      color: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
    },
    {
      title: 'Élèves',
      description: 'Gérer les élèves inscrits aux formations',
      icon: <GraduationCap className="h-12 w-12 text-blue-500" />,
      stats: stats?.students,
      path: '/admin/users/students',
      color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
    },
    {
      title: 'Formateurs',
      description: 'Gérer les formateurs et leurs spécialisations',
      icon: <Award className="h-12 w-12 text-yellow-500" />,
      stats: stats?.instructors,
      path: '/admin/users/instructors',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
    }
  ];

  return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader
              title="Gestion des utilisateurs"
              breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Utilisateurs' }
              ]}
          />

          <div className="p-6">
            {error && (
                <Alert
                    type="error"
                    message="Erreur lors du chargement des statistiques"
                    onClose={() => {
                    }}
                />
            )}

            <div className="mb-8">
              <h2 className="text-xl font-medium text-gray-700">
                Bienvenue dans la gestion des utilisateurs
              </h2>
              <p className="mt-2 text-gray-600">
                Sélectionnez une catégorie d'utilisateurs ci-dessous pour gérer vos utilisateurs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userCategories.map((category, index) => (
                  <Link
                      key={index}
                      to={category.path}
                      className={`block p-6 rounded-lg border ${category.color} transition-colors`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {category.icon}
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium">{category.title}</h3>
                        <p className="mt-1 text-sm opacity-80">{category.description}</p>

                        {loading ? (
                            <div className="mt-4 flex items-center">
                              <div
                                  className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                              <span className="ml-2 text-sm">Chargement des statistiques...</span>
                            </div>
                        ) : (

                            <div className="mt-4 grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs font-medium opacity-70">Total</p>
                                <p className="text-2xl font-semibold">{category.stats?.total || 0}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium opacity-70">Actifs</p>
                                <p className="text-2xl font-semibold">{category.stats?.active || 0}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium opacity-70">Inactifs</p>
                                <p className="text-2xl font-semibold">{category.stats?.inactive || 0}</p>
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </Link>
              ))}
            </div>

            <div className="mt-10 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/users/admins?showAddModal=true"
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium">
                  Ajouter un administrateur
                </Link>
                <Link to="/admin/users/students?showAddModal=true"
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium">
                  Ajouter un élève
                </Link>
                <Link to="/admin/users/instructors?showAddModal=true"
                      className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-center font-medium">
                  Ajouter un formateur
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UsersAdmin;