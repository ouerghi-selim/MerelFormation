// src/pages/admin/StudentsAdmin.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Edit, Trash2, Eye, GraduationCap, Check, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminUsersApi } from '../../services/api';
import { useLocation } from 'react-router-dom';


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

interface Formation {
    id: number;
    title: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
}

const StudentsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [userFormations, setUserFormations] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [processing, setProcessing] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<User | null>(null);

    // Nouvel étudiant form state
    const [newStudent, setNewStudent] = useState<Omit<User, 'id'>>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'ROLE_USER',
        isActive: true,
        lastLogin: null,
        phone: ''
    });
    const fetchStudents = useCallback(() => {
        return adminUsersApi.getAll('role=ROLE_USER')
            .then(response => response.data);
    }, []); // tableau vide = fonction stable
    // Utiliser le hook personnalisé pour charger les données
    const {
        data: students = [],
        loading,
        error,
        setData: setStudents,
        setError,
        refetch
    } = useDataFetching<User[]>({
        fetchFn: fetchStudents
    });

    const location = useLocation();
    useEffect(() => {
        // Vérifie si le paramètre showAddModal est présent dans l'URL
        const params = new URLSearchParams(location.search);
        if (params.get('showAddModal') === 'true') {
            setShowAddModal(true);
        }
    }, [location]);
    // Validation du formulaire (ajout et édition)
    const validateStudentForm = (student: Omit<User, 'id'> | User) => {
        const errors: {[key: string]: string} = {};

        if (!student.firstName.trim())
            errors.firstName = 'Le prénom est requis';
        if (!student.lastName.trim())
            errors.lastName = 'Le nom est requis';
        if (!student.email.trim())
            errors.email = 'L\'email est requis';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(student.email))
            errors.email = 'Format d\'email invalide';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const viewDetails = async (user: User) => {
        setSelectedStudent(user);
        setShowDetailsModal(true);

        // Charger les formations de l'étudiant
        try {
            setLoadingFormations(true);
            const response = await adminUsersApi.getSessions(user.id);
            setUserFormations(response.data);
        } catch (err) {
            console.error('Error fetching user formations:', err);
            addToast('Erreur lors du chargement des formations de l\'élève', 'error');
        } finally {
            setLoadingFormations(false);
        }
    };

    const openEditModal = (student: User) => {
        setStudentToEdit({...student});
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStudentForm(newStudent)) {
            return;
        }

        try {
            setProcessing(true);
            const response = await adminUsersApi.create(newStudent);

            // Ajouter le nouvel étudiant à la liste
            setStudents([...students, response.data]);
            addToast('Élève ajouté avec succès', 'success');

            // Réinitialiser le formulaire
            setNewStudent({
                firstName: '',
                lastName: '',
                email: '',
                role: 'ROLE_USER',
                isActive: true,
                lastLogin: null,
                phone: ''
            });

            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding student:', err);
            addToast('Erreur lors de l\'ajout de l\'élève', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentToEdit) return;

        if (!validateStudentForm(studentToEdit)) {
            return;
        }

        try {
            setProcessing(true);
            await adminUsersApi.update(studentToEdit.id, studentToEdit);

            // Mettre à jour la liste
            setStudents(students.map(s => s.id === studentToEdit.id ? studentToEdit : s));
            addToast('Élève mis à jour avec succès', 'success');

            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating student:', err);
            addToast('Erreur lors de la mise à jour de l\'élève', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            setProcessing(true);
            await adminUsersApi.delete(userToDelete.id);

            // Mettre à jour la liste
            setStudents(students.filter(s => s.id !== userToDelete.id));
            addToast('Élève supprimé avec succès', 'success');

            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error('Error deleting student:', err);
            addToast('Erreur lors de la suppression de l\'élève', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Nom',
            field: (row: User) => (
                <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                        {row.firstName} {row.lastName}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Email',
            field: 'email' as keyof User,
            sortable: true
        },
        {
            title: 'Téléphone',
            field: (row: User) => row.phone || '-',
            sortable: false
        },
        {
            title: 'Statut',
            field: (row: User) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {row.isActive ? 'Actif' : 'Inactif'}
                </span>
            ),
            sortable: false
        },
        {
            title: 'Dernière connexion',
            field: (row: User) => row.lastLogin || 'Jamais',
            sortable: true
        }
    ];

    // Rendu des actions pour chaque ligne
    const renderActions = (student: User) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => viewDetails(student)}
                className="text-blue-600 hover:text-blue-900"
                title="Voir détails"
            >
                <Eye className="h-5 w-5" />
            </button>
            <button
                onClick={() => openEditModal(student)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Modifier"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                onClick={() => confirmDelete(student)}
                className="text-red-600 hover:text-red-900"
                title="Supprimer"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    // Rendu du formulaire d'étudiant (utilisé dans les modals d'ajout et d'édition)
    const renderStudentForm = (student: Omit<User, 'id'> | User, setStudent: React.Dispatch<React.SetStateAction<any>>) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom*
                </label>
                <input
                    type="text"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.firstName ? 'border-red-500' : ''
                    }`}
                    value={student.firstName}
                    onChange={(e) => setStudent({...student, firstName: e.target.value})}
                />
                {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom*
                </label>
                <input
                    type="text"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.lastName ? 'border-red-500' : ''
                    }`}
                    value={student.lastName}
                    onChange={(e) => setStudent({...student, lastName: e.target.value})}
                />
                {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                </label>
                <input
                    type="email"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.email ? 'border-red-500' : ''
                    }`}
                    value={student.email}
                    onChange={(e) => setStudent({...student, email: e.target.value})}
                />
                {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                </label>
                <input
                    type="tel"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={student.phone || ''}
                    onChange={(e) => setStudent({...student, phone: e.target.value})}
                    placeholder="06 12 34 56 78"
                />
            </div>

            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={student.isActive}
                    onChange={(e) => setStudent({...student, isActive: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">
                    Compte actif
                </span>
            </div>
        </div>
    );

    // Calcul des statistiques
    const activeStudents = students ? students.filter(s => s.isActive).length : 0;
    const inactiveStudents = students ? students.filter(s => !s.isActive).length : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des élèves"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Utilisateurs', path: '/admin/users' },
                        { label: 'Élèves' }
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

                    <div className="flex justify-between items-center mb-6">
                        <Button
                            onClick={() => setShowAddModal(true)}
                            icon={<UserPlus className="h-5 w-5" />}
                        >
                            Nouvel élève
                        </Button>
                    </div>

                    <DataTable<User>
                        data={students || []}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        actions={renderActions}
                        searchFields={['firstName', 'lastName', 'email']}
                        emptyMessage="Aucun élève trouvé"
                    />

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
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Élèves actifs</h3>
                                    <p className="text-2xl font-semibold">{activeStudents}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Élèves inactifs</h3>
                                    <p className="text-2xl font-semibold">{inactiveStudents}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout d'élève */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Ajouter un élève"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            onClick={handleAddStudent}
                        >
                            Ajouter
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleAddStudent}>
                    {renderStudentForm(newStudent, setNewStudent)}
                </form>
            </Modal>

            {/* Modal d'édition d'élève */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier l'élève"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                            onClick={handleEditStudent}
                        >
                            Enregistrer
                        </Button>
                    </div>
                }
            >
                {studentToEdit && (
                    <form onSubmit={handleEditStudent}>
                        {renderStudentForm(studentToEdit, setStudentToEdit)}
                    </form>
                )}
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmer la suppression"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            loading={processing}
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    </div>
                }
            >
                <p>
                    Êtes-vous sûr de vouloir supprimer l'élève "{userToDelete?.firstName} {userToDelete?.lastName}" ?
                    Cette action est irréversible.
                </p>
            </Modal>

            {/* Modal de détails de l'élève */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Détails de l'élève"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            Fermer
                        </Button>
                        {selectedStudent && (
                            <Button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    openEditModal(selectedStudent);
                                }}
                            >
                                Modifier
                            </Button>
                        )}
                    </div>
                }
            >
                {selectedStudent && (
                    <>
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
                            {loadingFormations ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                    <span className="ml-2">Chargement...</span>
                                </div>
                            ) : userFormations && userFormations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Formation
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dates
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {userFormations.map((formation, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formation.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formation.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        formation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            formation.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {formation.status === 'completed' ? 'Terminée' :
                                                            formation.status === 'ongoing' ? 'En cours' :
                                                                formation.status === 'scheduled' ? 'Programmée' : formation.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formation.startDate && formation.endDate
                                                        ? `${new Date(formation.startDate).toLocaleDateString('fr-FR')} - ${new Date(formation.endDate).toLocaleDateString('fr-FR')}`
                                                        : 'Dates non définies'}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Aucune formation trouvée</p>
                            )}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default StudentsAdmin;