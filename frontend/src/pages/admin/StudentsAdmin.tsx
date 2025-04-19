// StudentsAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, ChevronDown, UserPlus, GraduationCap } from 'lucide-react';
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

const StudentsAdmin: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);

                // Simuler des données pour le développement
                setTimeout(() => {
                    const mockUsers: User[] = [
                        {
                            id: 2,
                            firstName: 'Marie',
                            lastName: 'Lambert',
                            email: 'marie.lambert@example.com',
                            role: 'ROLE_STUDENT',
                            isActive: true,
                            lastLogin: '19/03/2025 10:15',
                            phone: '06 12 34 56 78'
                        },
                        {
                            id: 3,
                            firstName: 'Paul',
                            lastName: 'Martin',
                            email: 'paul.martin@example.com',
                            role: 'ROLE_STUDENT',
                            isActive: true,
                            lastLogin: '18/03/2025 16:45',
                            phone: '06 23 45 67 89'
                        },
                        {
                            id: 4,
                            firstName: 'Sophie',
                            lastName: 'Klein',
                            email: 'sophie.klein@example.com',
                            role: 'ROLE_STUDENT',
                            isActive: false,
                            lastLogin: '15/02/2025 09:20',
                            phone: '06 34 56 78 90'
                        }
                    ];

                    // Filtrer les utilisateurs en fonction des critères de recherche
                    let filteredStudents = mockUsers;

                    if (searchTerm) {
                        const search = searchTerm.toLowerCase();
                        filteredStudents = filteredStudents.filter(user =>
                            user.firstName.toLowerCase().includes(search) ||
                            user.lastName.toLowerCase().includes(search) ||
                            user.email.toLowerCase().includes(search)
                        );
                    }

                    if (statusFilter) {
                        filteredStudents = filteredStudents.filter(user =>
                            statusFilter === 'active' ? user.isActive : !user.isActive
                        );
                    }

                    setStudents(filteredStudents);
                    setLoading(false);
                }, 1000);

                // Code pour la production
                /*
                const response = await axios.get('/api/admin/users', {
                  params: {
                    role: 'ROLE_STUDENT',
                    search: searchTerm || undefined,
                    status: statusFilter || undefined
                  }
                });
                setStudents(response.data);
                setLoading(false);
                */
            } catch (err) {
                console.error('Error fetching students:', err);
                setError('Erreur lors du chargement des élèves');
                setLoading(false);
            }
        };

        fetchStudents();
    }, [searchTerm, statusFilter]);

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const viewDetails = (user: User) => {
        setSelectedStudent(user);
        setShowDetailsModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            // Simuler la suppression pour le développement
            setStudents(students.filter(u => u.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);

            // Code pour la production
            /*
            await axios.delete(`/api/admin/users/${userToDelete.id}`);
            setStudents(students.filter(u => u.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);
            */
        } catch (err) {
            console.error('Error deleting student:', err);
            setError('Erreur lors de la suppression de l\'élève');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Gestion des élèves" />

                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <Link
                            to="/admin/students/new"
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Nouvel élève
                        </Link>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un élève..."
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
                            <p className="mt-4 text-gray-700">Chargement des élèves...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-700">Aucun élève trouvé</p>
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
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.isActive ? 'Actif' : 'Inactif'}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{student.lastLogin || 'Jamais'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => viewDetails(student)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Voir détails"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <Link
                                                        to={`/admin/students/${student.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(student)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
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

                    {/* Statistiques des élèves */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <GraduationCap className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Total élèves</h3>
                                    <p className="text-2xl font-semibold">{students.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Élèves actifs</h3>
                                    <p className="text-2xl font-semibold">{students.filter(s => s.isActive).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Élèves inactifs</h3>
                                    <p className="text-2xl font-semibold">{students.filter(s => !s.isActive).length}</p>
                                </div>
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
                            Êtes-vous sûr de vouloir supprimer l'élève "{userToDelete?.firstName} {userToDelete?.lastName}" ?
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

            {/* Modal de détails de l'élève */}
            {showDetailsModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Détails de l'élève</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h4>
                                <p className="text-base font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                                <p className="text-base">{selectedStudent.email}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                                <p className="text-base">{selectedStudent.phone || '-'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    selectedStudent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                  {selectedStudent.isActive ? 'Actif' : 'Inactif'}
                </span>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Dernière connexion</h4>
                                <p className="text-base">{selectedStudent.lastLogin || 'Jamais'}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h4 className="font-medium mb-4">Formations inscrites</h4>
                            <p className="text-gray-500 italic">Aucune formation trouvée</p>
                            {/* Ici vous pourriez ajouter la liste des formations auxquelles l'élève est inscrit */}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                Fermer
                            </button>
                            <Link
                                to={`/admin/students/${selectedStudent.id}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Modifier
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsAdmin;