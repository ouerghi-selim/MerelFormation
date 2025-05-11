// src/pages/admin/VehiclesAdmin.tsx (version refactorisée)
import React, { useState } from 'react';
import { Car, Plus, Edit, Trash2, AlertTriangle, Check } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminVehiclesApi } from '../../services/api';

interface Vehicle {
    id: number;
    model: string;
    plate: string;
    year: number;
    status: string;
    dailyRate: number;
    isActive: boolean;
    category: string;
}

const VehiclesAdmin: React.FC = () => {
    const { addToast } = useNotification();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [processing, setProcessing] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    // New vehicle form state
    const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
        model: '',
        plate: '',
        year: new Date().getFullYear(),
        status: 'available',
        dailyRate: 0,
        isActive: true,
        category: 'berline'
    });

    // Categories list
    const categories = ['berline', 'monospace', 'citadine', 'suv', 'utilitaire'];

    // Utiliser le hook personnalisé pour charger les données
    const { data: vehicles, loading, error, setData: setVehicles, refetch } = useDataFetching<Vehicle>({
        fetchFn: adminVehiclesApi.getAll
    });

    // Validation du formulaire (ajout et édition)
    const validateVehicleForm = (vehicle: Omit<Vehicle, 'id'>) => {
        const errors: {[key: string]: string} = {};

        if (!vehicle.model.trim())
            errors.model = 'Le modèle est requis';
        else if (vehicle.model.length < 2)
            errors.model = 'Le modèle doit contenir au moins 2 caractères';

        if (!vehicle.plate.trim())
            errors.plate = 'La plaque d\'immatriculation est requise';
        else if (!/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/.test(vehicle.plate))
            errors.plate = 'Format: XX-000-XX (ex: AB-123-CD)';

        if (!vehicle.year)
            errors.year = 'L\'année est requise';
        else if (vehicle.year < 2000 || vehicle.year > 2025)
            errors.year = 'L\'année doit être entre 2000 et 2025';

        if (!vehicle.dailyRate || vehicle.dailyRate <= 0)
            errors.dailyRate = 'Le tarif journalier doit être supérieur à 0';

        if (!vehicle.category)
            errors.category = 'La catégorie est requise';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handlers
    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateVehicleForm(newVehicle)) {
            return;
        }

        try {
            setProcessing(true);
            const response = await adminVehiclesApi.create(newVehicle);

            // Ajouter le nouveau véhicule à la liste
            setVehicles({ ...vehicles, data: [...vehicles.data, response.data] });
            addToast('Véhicule ajouté avec succès', 'success');

            // Réinitialiser le formulaire
            setNewVehicle({
                model: '',
                plate: '',
                year: new Date().getFullYear(),
                status: 'available',
                dailyRate: 0,
                isActive: true,
                category: 'berline'
            });

            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding vehicle:', err);
            addToast('Erreur lors de l\'ajout du véhicule', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditVehicle = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vehicleToEdit) return;

        if (!validateVehicleForm(vehicleToEdit)) {
            return;
        }

        try {
            setProcessing(true);
            await adminVehiclesApi.update(vehicleToEdit.id, vehicleToEdit);

            // Mettre à jour la liste des véhicules
            setVehicles({ ...vehicles, data: vehicles.data.map(v => v.id === vehicleToEdit.id ? vehicleToEdit : v) });
            addToast('Véhicule mis à jour avec succès', 'success');

            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating vehicle:', err);
            addToast('Erreur lors de la mise à jour du véhicule', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteVehicle = async () => {
        if (!vehicleToDelete) return;

        try {
            setProcessing(true);
            await adminVehiclesApi.delete(vehicleToDelete.id);

            // Mettre à jour la liste des véhicules
            setVehicles({ ...vehicles, data: vehicles.data.filter(v => v.id !== vehicleToDelete.id) });
            addToast('Véhicule supprimé avec succès', 'success');

            setShowDeleteModal(false);
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            addToast('Erreur lors de la suppression du véhicule', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const openEditModal = (vehicle: Vehicle) => {
        setVehicleToEdit({...vehicle});
        setFormErrors({});
        setShowEditModal(true);
    };

    const openDeleteModal = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setShowDeleteModal(true);
    };

    // Formatage et affichage
    const formatStatus = (status: string): string => {
        const statuses: { [key: string]: string } = {
            'available': 'Disponible',
            'rented': 'En location',
            'maintenance': 'En maintenance'
        };
        return statuses[status] || status;
    };

    const getStatusClass = (status: string): string => {
        const classes: { [key: string]: string } = {
            'available': 'bg-green-100 text-green-800',
            'rented': 'bg-blue-100 text-blue-800',
            'maintenance': 'bg-yellow-100 text-yellow-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Modèle',
            field: (row: Vehicle) => (
                <div className="flex items-center">
                    <Car className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                        {row.model}
                        {!row.isActive && (
                            <span className="ml-2 text-xs text-gray-500">(inactif)</span>
                        )}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Immatriculation',
            field: 'plate' as keyof Vehicle,
            sortable: true
        },
        {
            title: 'Année',
            field: 'year' as keyof Vehicle,
            sortable: true
        },
        {
            title: 'Catégorie',
            field: (row: Vehicle) => (
                <span className="capitalize">{row.category}</span>
            ),
            sortable: true
        },
        {
            title: 'Tarif journalier',
            field: (row: Vehicle) => `${row.dailyRate} €`,
            sortable: true
        },
        {
            title: 'Statut',
            field: (row: Vehicle) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(row.status)}`}>
          {formatStatus(row.status)}
        </span>
            ),
            sortable: false
        }
    ];

    // Rendu des actions pour chaque ligne
    const renderActions = (vehicle: Vehicle) => (
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => openEditModal(vehicle)}
                className="text-blue-700 hover:text-blue-900"
                title="Modifier"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                onClick={() => openDeleteModal(vehicle)}
                className="text-red-600 hover:text-red-900"
                title="Supprimer"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    // Rendu du formulaire de véhicule (utilisé dans les modals d'ajout et d'édition)
    const renderVehicleForm = (vehicle: Omit<Vehicle, 'id'>, setVehicle: React.Dispatch<React.SetStateAction<any>>) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle*
                </label>
                <input
                    type="text"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.model ? 'border-red-500' : ''
                    }`}
                    value={vehicle.model}
                    onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                />
                {formErrors.model && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.model}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Immatriculation* (format: XX-000-XX)
                </label>
                <input
                    type="text"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        formErrors.plate ? 'border-red-500' : ''
                    }`}
                    value={vehicle.plate}
                    onChange={(e) => setVehicle({...vehicle, plate: e.target.value.toUpperCase()})}
                    placeholder="AB-123-CD"
                />
                {formErrors.plate && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.plate}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année*
                    </label>
                    <input
                        type="number"
                        min="2000"
                        max="2025"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.year ? 'border-red-500' : ''
                        }`}
                        value={vehicle.year}
                        onChange={(e) => setVehicle({...vehicle, year: parseInt(e.target.value) || 0})}
                    />
                    {formErrors.year && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.year}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarif journalier* (€)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.dailyRate ? 'border-red-500' : ''
                        }`}
                        value={vehicle.dailyRate}
                        onChange={(e) => setVehicle({...vehicle, dailyRate: parseFloat(e.target.value) || 0})}
                    />
                    {formErrors.dailyRate && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.dailyRate}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie*
                    </label>
                    <select
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.category ? 'border-red-500' : ''
                        }`}
                        value={vehicle.category}
                        onChange={(e) => setVehicle({...vehicle, category: e.target.value})}
                    >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                    {formErrors.category && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut*
                    </label>
                    <select
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.status ? 'border-red-500' : ''
                        }`}
                        value={vehicle.status}
                        onChange={(e) => setVehicle({...vehicle, status: e.target.value})}
                    >
                        <option value="available">Disponible</option>
                        <option value="maintenance">En maintenance</option>
                        {vehicleToEdit && (
                            <option value="rented">En location</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={vehicle.isActive}
                    onChange={(e) => setVehicle({...vehicle, isActive: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">
          Véhicule actif
        </span>
            </div>
        </div>
    );

    // États calculés pour les statistiques
    const activeVehicles = vehicles.data ? vehicles.data.filter(v => v.isActive).length : 0;
    const availableVehicles = vehicles.data ? vehicles.data.filter(v => v.isActive && v.status === 'available').length : 0;
    const rentedVehicles = vehicles.data ? vehicles.data.filter(v => v.isActive && v.status === 'rented').length : 0;
    const maintenanceVehicles = vehicles.data ? vehicles.data.filter(v => v.isActive && v.status === 'maintenance').length : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader
                    title="Gestion des véhicules"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Véhicules' }
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
                            icon={<Plus className="h-5 w-5" />}
                        >
                            Ajouter un véhicule
                        </Button>
                    </div>

                    <DataTable<Vehicle>
                        data={vehicles.data || []}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        actions={renderActions}
                        searchFields={['model', 'plate']}
                        emptyMessage="Aucun véhicule trouvé"
                    />

                    {/* Statistiques des véhicules */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Car className="h-6 w-6 text-blue-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Total véhicules</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {activeVehicles}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Check className="h-6 w-6 text-green-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Disponibles</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {availableVehicles}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Car className="h-6 w-6 text-blue-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">En location</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {rentedVehicles}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-yellow-700" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">En maintenance</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {maintenanceVehicles}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout de véhicule */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Ajouter un véhicule"
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
                            onClick={handleAddVehicle}
                        >
                            Ajouter
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleAddVehicle}>
                    {renderVehicleForm(newVehicle, setNewVehicle)}
                </form>
            </Modal>

            {/* Modal d'édition de véhicule */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Modifier le véhicule"
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
                            onClick={handleEditVehicle}
                        >
                            Enregistrer
                        </Button>
                    </div>
                }
            >
                {vehicleToEdit && (
                    <form onSubmit={handleEditVehicle}>
                        {renderVehicleForm(vehicleToEdit, setVehicleToEdit)}
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
                            onClick={handleDeleteVehicle}
                        >
                            Supprimer
                        </Button>
                    </div>
                }
            >
                <p className="mb-6">
                    Êtes-vous sûr de vouloir supprimer le véhicule <span className="font-semibold">{vehicleToDelete?.model}</span> ({vehicleToDelete?.plate}) ?
                    Cette action est irréversible.
                </p>
            </Modal>
        </div>
    );
};

export default VehiclesAdmin;