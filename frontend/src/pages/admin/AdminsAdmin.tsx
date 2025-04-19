// AdminsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, ChevronDown, UserPlus, Shield } from 'lucide-react';
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
    phone?: string;
}

const UsersAdmin: React.FC = () => {
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                setLoading(true);

                // Simuler des données pour le développement
                setTimeout(() => {
                    const mockAdmins: User[] = [
                        {
                            id: 1,
                            firstName: 'Jean',
                            lastName: 'Dupont',
                            email: 'jean.dupont@example.com',
                            role: 'ROLE_ADMIN',
                            isActive: true,
                            lastLogin: '20/03/2025 14:30',
                            phone: '06 67 89 01 23'
                        },
                        {
                            id: 7,
                            firstName: 'Marc',
                            lastName: 'Dubois',
                            email: 'marc.dubois@example.com',
                            role: 'ROLE_ADMIN',
                            isActive: true,
                            lastLogin: '20/03/2025 11:15',
                            phone: '06 78 90 12 34'
                        }
                    ];

                    // Filtrer les administrateurs en fonction des critères de recherche
                    let filteredAdmins = mockAdmins;

                    if (searchTerm) {
                        const search = searchTerm.toLowerCase();
                        filteredAdmins = filteredAdmins.filter(user =>
                            user.firstName.toLowerCase().includes(search) ||
                            user.lastName.toLowerCase().includes(search) ||
                            user.email.toLowerCase().includes(search)
                        );
                    }

                    if (statusFilter) {
                        filteredAdmins = filteredAdmins.filter(user =>
                            statusFilter === 'active' ? user.isActive : !user.isActive
                        );
                    }

                    setAdmins(filteredAdmins);
                    setLoading(false);
                }, 1000);

                // Code pour la production
                /*
                const response = await axios.get('/api/admin/users', {
                  params: {
                    role: 'ROLE_ADMIN',
                    search: searchTerm || undefined,
                    status: statusFilter || undefined
                  }
                });
                setAdmins(response.data);
                setLoading(false);
                */
            } catch (err) {
                console.error('Error fetching admins:', err);
                setError('Erreur lors du chargement des administrateurs');
                setLoading(false);
            }
        };

        fetchAdmins();
    }, [searchTerm, statusFilter]);

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            // Simuler la suppression pour le développement
            setAdmins(admins.filter(u => u.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);

            // Code pour la production
            /*
            await axios.delete(`/api/admin/users/${userToDelete.id}`);
            setAdmins(admins.filter(u => u.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);
            */
        } catch (err) {
            console.error('Error deleting admin:', err);
            setError('Erreur lors de la suppression de l\'administrateur');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Gestion des administrateurs" />

                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <Link
                            to="/admin/admins/new"
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Nouvel administrateur
                        </Link>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un administrateur..."
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
                                    <option value="active">Actifs</option>
                                    <option value="inactive">Inactifs</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                            <p className="mt-4 text-gray-700">Chargement des administrateurs...</p>
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-700">Aucun administrateur trouvé</p>
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
                                            Téléphone
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
                                    {admins.map((admin) => (
                                        <tr key={admin.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Shield className="h-5 w-5 text-purple-600 mr-3" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {admin.firstName} {admin.lastName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{admin.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{admin.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'Actif' : 'Inactif'}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{admin.lastLogin || 'Jamais'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/admin/admins/${admin.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    {/* Ne pas permettre la suppression du compte actuellement connecté */}
                                                    {admin.id !== 1 && (
                                                        <button
                                                            onClick={() => confirmDelete(admin)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
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

                    {/* Statistiques des administrateurs */}
                    <div className="mt-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Total administrateurs</h3>
                                    <p className="text-2xl font-semibold">{admins.length}</p>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                <p>Les administrateurs ont un accès complet au système et peuvent gérer tous les aspects de la plateforme, y compris les utilisateurs, les formations, les réservations et les paramètres du site.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                        <p className="mb-6">
                            Êtes-vous sûr de vouloir supprimer l'administrateur "{userToDelete?.firstName} {userToDelete?.lastName}" ?
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