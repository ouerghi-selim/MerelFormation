import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, ChevronDown, UserPlus } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
// @ts-ignore
import axios from 'axios';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Simuler des données pour le développement
        setTimeout(() => {
          const mockUsers: User[] = [
            { 
              id: 1, 
              firstName: 'Jean', 
              lastName: 'Dupont', 
              email: 'jean.dupont@example.com', 
              role: 'ROLE_ADMIN', 
              isActive: true,
              lastLogin: '20/03/2025 14:30'
            },
            { 
              id: 2, 
              firstName: 'Marie', 
              lastName: 'Lambert', 
              email: 'marie.lambert@example.com', 
              role: 'ROLE_STUDENT', 
              isActive: true,
              lastLogin: '19/03/2025 10:15'
            },
            { 
              id: 3, 
              firstName: 'Paul', 
              lastName: 'Martin', 
              email: 'paul.martin@example.com', 
              role: 'ROLE_STUDENT', 
              isActive: true,
              lastLogin: '18/03/2025 16:45'
            },
            { 
              id: 4, 
              firstName: 'Sophie', 
              lastName: 'Klein', 
              email: 'sophie.klein@example.com', 
              role: 'ROLE_STUDENT', 
              isActive: false,
              lastLogin: '15/02/2025 09:20'
            },
            { 
              id: 5, 
              firstName: 'Thomas', 
              lastName: 'Blanc', 
              email: 'thomas.blanc@example.com', 
              role: 'ROLE_INSTRUCTOR', 
              isActive: true,
              lastLogin: '20/03/2025 08:30'
            }
          ];
          
          // Filtrer les utilisateurs en fonction des critères de recherche
          let filteredUsers = mockUsers;
          
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
              user.firstName.toLowerCase().includes(search) || 
              user.lastName.toLowerCase().includes(search) || 
              user.email.toLowerCase().includes(search)
            );
          }
          
          if (roleFilter) {
            filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
          }
          
          setUsers(filteredUsers);
          setLoading(false);
        }, 1000);
        
        // Commenté pour le développement, à décommenter pour la production
        /*
        const response = await axios.get('/api/admin/users', {
          params: {
            search: searchTerm || undefined,
            role: roleFilter || undefined
          }
        });
        setUsers(response.data);
        setLoading(false);
        */
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Erreur lors du chargement des utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, roleFilter]);

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      // Simuler la suppression pour le développement
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Commenté pour le développement, à décommenter pour la production
      /*
      await axios.delete(`/api/admin/users/${userToDelete.id}`);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      */
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const formatRole = (role: string): string => {
    const roles: { [key: string]: string } = {
      'ROLE_ADMIN': 'Administrateur',
      'ROLE_STUDENT': 'Élève',
      'ROLE_INSTRUCTOR': 'Formateur'
    };
    return roles[role] || role;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Gestion des utilisateurs" />
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Link 
              to="/admin/users/new" 
              className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Nouvel utilisateur
            </Link>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-3 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">Tous les rôles</option>
                  <option value="ROLE_ADMIN">Administrateurs</option>
                  <option value="ROLE_STUDENT">Élèves</option>
                  <option value="ROLE_INSTRUCTOR">Formateurs</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-700">Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-700">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'ROLE_INSTRUCTOR' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.lastLogin || 'Jamais'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              to={`/admin/users/${user.id}/edit`}
                              className="text-blue-700 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button 
                              onClick={() => confirmDelete(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
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
        </div>
      </div>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.firstName} {userToDelete?.lastName}" ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
