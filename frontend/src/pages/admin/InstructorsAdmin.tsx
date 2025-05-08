// src/pages/admin/InstructorsAdmin.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, Award, Calendar, Check, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
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
    specialization?: string;
}

interface Session {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    type: string;
}

const InstructorsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<User | null>(null);
    const [instructorSessions, setInstructorSessions] = useState<Session[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [processing, setProcessing] = useState(false);
    const [instructorToEdit, setInstructorToEdit] = useState<User | null>(null);

    // Nouvel instructeur form state
    const [newInstructor, setNewInstructor] = useState<Omit<User, 'id'>>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'ROLE_INSTRUCTOR',
        isActive: true,
        lastLogin: null,
        phone: '',
        specialization: ''
    });

    // Spécialisations disponibles
    const specializations = [
        'Formation initiale',
        'Formation continue',
        'Mobilité',
        'Préparation à l\'examen',
        'Conduite'
    ];
    const fetchInstructors = useCallback(() => {
        return adminUsersApi.getAll('role=ROLE_INSTRUCTOR')
            .then(response => response.data);
    }, []); // tableau vide pour n'exécuter qu'une seule fois
    // Utiliser le hook personnalisé pour charger les données
    const {
        data: instructors = [],
        loading,
        error,
        setData: setInstructors,
        setError,
        refetch
    } = useDataFetching<User[]>({
        fetchFn: fetchInstructors
    });

    const location = useLocation();

    // Effet pour ouvrir le modal d'ajout automatiquement
    useEffect(() => {
        // Vérifie si le paramètre showAddModal est présent dans l'URL
        const params = new URLSearchParams(location.search);
        if (params.get('showAddModal') === 'true') {
            setShowAddModal(true);
        }
    }, [location]);
    // Validation du formulaire (ajout et édition)
    const validateInstructorForm = (instructor: Omit<User, 'id'> | User) => {
        const errors: {[key: string]: string} = {};

        if (!instructor.firstName.trim())
            errors.firstName = 'Le prénom est requis';
        if (!instructor.lastName.trim())
            errors.lastName = 'Le nom est requis';
        if (!instructor.email.trim())
            errors.email = 'L\'email est requis';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(instructor.email))
            errors.email = 'Format d\'email invalide';
        if (!instructor.specialization)
            errors.specialization = 'La spécialisation est requise';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const viewDetails = async (user: User) => {
        setSelectedInstructor(user);
        setShowDetailsModal(true);

        try {
            setLoadingSessions(true);
            const response = await adminUsersApi.getSessions(user.id);
            setInstructorSessions(response.data);
        } catch (err) {
            console.error('Error fetching instructor sessions:', err);
            setInstructorSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    };

    const openEditModal = (instructor: User) => {
        setInstructorToEdit({...instructor});
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAddInstructor = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateInstructorForm(newInstructor)) {
            return;
        }

        try {
            setProcessing(true);
            const response = await adminUsersApi.create(newInstructor);

            // Ajouter le nouvel instructeur à la liste
            setInstructors([...instructors, response.data]);
            addToast('Formateur ajouté avec succès', 'success');

            // Réinitialiser le formulaire
            setNewInstructor({
                firstName: '',
                lastName: '',
                email: '',
                role: 'ROLE_INSTRUCTOR',
                isActive: true,
                lastLogin: null,
                phone: '',
                specialization: ''
            });

            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding instructor:', err);
            addToast('Erreur lors de l\'ajout du formateur', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditInstructor = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!instructorToEdit) return;

        if (!validateInstructorForm(instructorToEdit)) {
            return;
        }

        try {
            setProcessing(true);
            await adminUsersApi.update(instructorToEdit.id, instructorToEdit);

            // Mettre à jour la liste
            setInstructors(instructors.map(i => i.id === instructorToEdit.id ? instructorToEdit : i));
            addToast('Formateur mis à jour avec succès', 'success');

            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating instructor:', err);
            addToast('Erreur lors de la mise à jour du formateur', 'error');
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
            setInstructors(instructors.filter(i => i.id !== userToDelete.id));
            addToast('Formateur supprimé avec succès', 'success');

            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error('Error deleting instructor:', err);
            addToast('Erreur lors de la suppression du formateur', 'error');
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
                    <Award className="h-5 w-5 text-yellow-600 mr-3" />
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
            title: 'Spécialisation',
            field: (row: User) => row.specialization || '-',
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
        }
    ];

    // Rendu des actions pour chaque ligne
    const renderActions = (instructor: User) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => viewDetails(instructor)}
                className="text-blue-600 hover:text-blue-900"
                title="Voir détails"
            >
                <Eye className="h-5 w-5" />
            </button>
            <button
                onClick={() => openEditModal(instructor)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Modifier"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                onClick={() => confirmDelete(instructor)}
                className="text-red-600 hover:text-red-900"
                title="Supprimer"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    // Rendu du formulaire d'instructeur (utilisé dans les modals d'ajout et d'édition)
    const renderInstructorForm = (instructor: Omit<User, 'id'> | User, setInstructor: React.Dispatch<React.SetStateAction<any>>) => (
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
                    value={instructor.firstName}
                    onChange={(e) => setInstructor({...instructor, firstName: e.target.value})}
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
                    value={instructor.lastName}
                    onChange={(e) => setInstructor({...instructor, lastName: e.target.value})}
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
                    value={instructor.email}
                    onChange={(e) => setInstructor({...instructor, email: e.target.value})}
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
                    value={instructor.phone || ''}
                    onChange={(e) => setInstructor({...instructor, phone: e.target.value})}
                    placeholder="06 12 34 56 78"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialisation*
                </label>
                <select
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.specialization ? 'border-red-500' : ''
                    }`}
                    value={instructor.specialization || ''}
                    onChange={(e) => setInstructor({...instructor, specialization: e.target.value})}
                >
                    <option value="">Sélectionnez une spécialisation</option>
                    {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
                {formErrors.specialization && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.specialization}</p>
                )}
            </div>

            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={instructor.isActive}
                    onChange={(e) => setInstructor({...instructor, isActive: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">
                    Compte actif
                </span>
            </div>
        </div>
    );

    // Calcul des statistiques
    const activeInstructors = instructors ? instructors.filter(i => i.isActive).length : 0;
    const inactiveInstructors = instructors ? instructors.filter(i => !i.isActive).length : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des formateurs"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Utilisateurs', path: '/admin/users' },
                        { label: 'Formateurs' }
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
                            Nouveau formateur
                        </Button>
                    </div>

                    <DataTable<User>
                        data={instructors || []}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        actions={renderActions}
                        searchFields={['firstName', 'lastName', 'email', 'specialization']}
                        emptyMessage="Aucun formateur trouvé"
                    />

                    {/* Statistiques des formateurs */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <Award className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Total formateurs</h3>
                                    <p className="text-2xl font-semibold">{instructors.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Formateurs actifs</h3>
                                    <p className="text-2xl font-semibold">{activeInstructors}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Formateurs inactifs</h3>
                                    <p className="text-2xl font-semibold">{inactiveInstructors}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout de formateur */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Ajouter un formateur"
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
                            onClick={handleAddInstructor}
                        >
                            Ajouter
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleAddInstructor}>
                    {renderInstructorForm(newInstructor, setNewInstructor)}
                </form>
            </Modal>

            {/* Modal d'édition de formateur */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier le formateur"
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
                            onClick={handleEditInstructor}
                        >
                            Enregistrer
                        </Button>
                    </div>
                }
            >
                {instructorToEdit && (
                    <form onSubmit={handleEditInstructor}>
                        {renderInstructorForm(instructorToEdit, setInstructorToEdit)}
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
                    Êtes-vous sûr de vouloir supprimer le formateur "{userToDelete?.firstName} {userToDelete?.lastName}" ?
                    Cette action est irréversible.
                </p>
            </Modal>

            {/* Modal de détails du formateur */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Détails du formateur"
                maxWidth="max-w-2xl"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            Fermer
                        </Button>
                        {selectedInstructor && (
                            <Button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    openEditModal(selectedInstructor);
                                }}
                            >
                                Modifier
                            </Button>
                        )}
                    </div>
                }
            >
                {selectedInstructor && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h4>
                                <p className="text-base font-medium">{selectedInstructor.firstName} {selectedInstructor.lastName}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                                <p className="text-base">{selectedInstructor.email}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                                <p className="text-base">{selectedInstructor.phone || '-'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Spécialisation</h4>
                                <p className="text-base">{selectedInstructor.specialization || '-'}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    selectedInstructor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {selectedInstructor.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Dernière connexion</h4>
                                <p className="text-base">{selectedInstructor.lastLogin || 'Jamais'}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <h4 className="font-medium mb-4">Sessions de formation programmées</h4>
                            {loadingSessions ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                    <span className="ml-2">Chargement...</span>
                                </div>
                            ) : instructorSessions && instructorSessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Session
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lieu
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dates
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {instructorSessions.map((session, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                                                        {session.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {session.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {session.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(session.startDate).toLocaleDateString('fr-FR')} - {new Date(session.endDate).toLocaleDateString('fr-FR')}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Aucune session trouvée</p>
                            )}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default InstructorsAdmin;