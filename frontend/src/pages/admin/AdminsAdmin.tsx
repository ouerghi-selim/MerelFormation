import React, { useState, useCallback, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, Shield, Check, X } from 'lucide-react';
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
}

const AdminsAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [processing, setProcessing] = useState(false);
    const [adminToEdit, setAdminToEdit] = useState<User | null>(null);

    // Nouvel admin form state
    const [newAdmin, setNewAdmin] = useState<Omit<User, 'id'>>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'ROLE_ADMIN',
        isActive: true,
        lastLogin: null,
        phone: ''
    });
    const fetchAdmins = useCallback(() => {
        return adminUsersApi.getAll('role=ROLE_ADMIN')
            .then(response => response.data);
    }, []); // tableau vide = fonction stable
    // Utiliser le hook personnalisé pour charger les données
    const {
        data: admins = [],
        loading,
        error,
        setData: setAdmins,
    }  = useDataFetching<User[]>({
        fetchFn: fetchAdmins
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
    const validateAdminForm = (admin: Omit<User, 'id'> | User) => {
        const errors: {[key: string]: string} = {};

        if (!admin.firstName.trim())
            errors.firstName = 'Le prénom est requis';
        if (!admin.lastName.trim())
            errors.lastName = 'Le nom est requis';
        if (!admin.email.trim())
            errors.email = 'L\'email est requis';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(admin.email))
            errors.email = 'Format d\'email invalide';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const viewDetails = (user: User) => {
        setSelectedAdmin(user);
        setShowDetailsModal(true);
    };

    const openEditModal = (admin: User) => {
        setAdminToEdit({...admin});
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAdminForm(newAdmin)) {
            return;
        }

        try {
            setProcessing(true);
            const response = await adminUsersApi.create(newAdmin);

            // Ajouter le nouvel admin à la liste
            setAdmins([...admins, response.data]);
            addToast('Administrateur ajouté avec succès', 'success');

            // Réinitialiser le formulaire
            setNewAdmin({
                firstName: '',
                lastName: '',
                email: '',
                role: 'ROLE_ADMIN',
                isActive: true,
                lastLogin: null,
                phone: ''
            });

            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding admin:', err);
            addToast('Erreur lors de l\'ajout de l\'administrateur', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!adminToEdit) return;

        if (!validateAdminForm(adminToEdit)) {
            return;
        }

        try {
            setProcessing(true);
            await adminUsersApi.update(adminToEdit.id, adminToEdit);

            // Mettre à jour la liste
            setAdmins(admins.map(a => a.id === adminToEdit.id ? adminToEdit : a));
            addToast('Administrateur mis à jour avec succès', 'success');

            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating admin:', err);
            addToast('Erreur lors de la mise à jour de l\'administrateur', 'error');
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
            setAdmins(admins.filter(a => a.id !== userToDelete.id));
            addToast('Administrateur supprimé avec succès', 'success');

            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            console.error('Error deleting admin:', err);
            addToast('Erreur lors de la suppression de l\'administrateur', 'error');
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
                    <Shield className="h-5 w-5 text-purple-600 mr-3" />
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
    const renderActions = (admin: User) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => viewDetails(admin)}
                className="text-blue-600 hover:text-blue-900"
                title="Voir détails"
            >
                <Eye className="h-5 w-5" />
            </button>
            <button
                onClick={() => openEditModal(admin)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Modifier"
            >
                <Edit className="h-5 w-5" />
            </button>
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
    );

    // Rendu du formulaire d'admin (utilisé dans les modals d'ajout et d'édition)
    const renderAdminForm = (admin: Omit<User, 'id'> | User, setAdmin: React.Dispatch<React.SetStateAction<any>>) => (
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
                    value={admin.firstName}
                    onChange={(e) => setAdmin({...admin, firstName: e.target.value})}
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
                    value={admin.lastName}
                    onChange={(e) => setAdmin({...admin, lastName: e.target.value})}
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
                    value={admin.email}
                    onChange={(e) => setAdmin({...admin, email: e.target.value})}
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
                    value={admin.phone || ''}
                    onChange={(e) => setAdmin({...admin, phone: e.target.value})}
                    placeholder="06 12 34 56 78"
                />
            </div>

            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={admin.isActive}
                    onChange={(e) => setAdmin({...admin, isActive: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">
                    Compte actif
                </span>
            </div>
        </div>
    );

    // Calcul des statistiques
    const activeAdmins = admins ? admins.filter(a => a.isActive).length : 0;
    const inactiveAdmins = admins ? admins.filter(a => !a.isActive).length : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des administrateurs"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Utilisateurs', path: '/admin/users' },
                        { label: 'Administrateurs' }
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
                            Nouvel administrateur
                        </Button>
                    </div>

                    <DataTable<User>
                        data={Array.isArray(admins) ? admins : []}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        actions={renderActions}
                        searchFields={['firstName', 'lastName', 'email']}
                        emptyMessage="Aucun administrateur trouvé"
                    />

                    {/* Statistiques des administrateurs */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Administrateurs actifs</h3>
                                    <p className="text-2xl font-semibold">{activeAdmins}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-gray-500 text-sm">Administrateurs inactifs</h3>
                                    <p className="text-2xl font-semibold">{inactiveAdmins}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout d'administrateur */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Ajouter un administrateur"
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
                            onClick={() => handleAddAdmin()}
                        >
                            Ajouter
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleAddAdmin}>
                    {renderAdminForm(newAdmin, setNewAdmin)}
                </form>
            </Modal>

            {/* Modal d'édition d'administrateur */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier l'administrateur"
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
                            onClick={handleEditAdmin}
                        >
                            Enregistrer
                        </Button>
                    </div>
                }
            >
                {adminToEdit && (
                    <form onSubmit={handleEditAdmin}>
                        {renderAdminForm(adminToEdit, setAdminToEdit)}
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
                    Êtes-vous sûr de vouloir supprimer l'administrateur "{userToDelete?.firstName} {userToDelete?.lastName}" ?
                    Cette action est irréversible.
                </p>
            </Modal>

            {/* Modal de détails de l'administrateur */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Détails de l'administrateur"
                footer={
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            Fermer
                        </Button>
                        {selectedAdmin && (
                            <Button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    openEditModal(selectedAdmin);
                                }}
                            >
                                Modifier
                            </Button>
                        )}
                    </div>
                }
            >
                {selectedAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h4>
                            <p className="text-base font-medium">{selectedAdmin.firstName} {selectedAdmin.lastName}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                            <p className="text-base">{selectedAdmin.email}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Téléphone</h4>
                            <p className="text-base">{selectedAdmin.phone || '-'}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                selectedAdmin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {selectedAdmin.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Dernière connexion</h4>
                            <p className="text-base">{selectedAdmin.lastLogin || 'Jamais'}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminsAdmin;