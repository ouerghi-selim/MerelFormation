import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, ChevronDown, Car, X, Check, AlertTriangle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
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
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Modals state
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

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);

                // Utilisation des appels API réels
                const response = await adminVehiclesApi.getAll();
                setVehicles(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Erreur lors du chargement des véhicules');
                setLoading(false);

                // Données de secours en cas d'erreur (pour le développement)
                const mockVehicles: Vehicle[] = [
                    {
                        id: 1,
                        model: 'Volkswagen Touran',
                        plate: 'AB-123-CD',
                        year: 2022,
                        status: 'available',
                        dailyRate: 120,
                        isActive: true,
                        category: 'monospace'
                    },
                    {
                        id: 2,
                        model: 'Renault Clio',
                        plate: 'EF-456-GH',
                        year: 2021,
                        status: 'rented',
                        dailyRate: 80,
                        isActive: true,
                        category: 'berline'
                    },
                    {
                        id: 3,
                        model: 'Peugeot 308',
                        plate: 'IJ-789-KL',
                        year: 2022,
                        status: 'maintenance',
                        dailyRate: 90,
                        isActive: true,
                        category: 'berline'
                    },
                    {
                        id: 4,
                        model: 'Citroën C3',
                        plate: 'MN-012-OP',
                        year: 2020,
                        status: 'available',
                        dailyRate: 75,
                        isActive: false,
                        category: 'citadine'
                    }
                ];

                setVehicles(mockVehicles);
            }
        };

        fetchVehicles();
    }, [searchTerm, statusFilter, categoryFilter]);

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
            setVehicles([...vehicles, response.data]);

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
            setError('Erreur lors de l\'ajout du véhicule');
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
            setVehicles(vehicles.map(v => v.id === vehicleToEdit.id ? vehicleToEdit : v));

            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating vehicle:', err);
            setError('Erreur lors de la mise à jour du véhicule');
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
            setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));

            setShowDeleteModal(false);
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            setError('Erreur lors de la suppression du véhicule');
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Gestion des véhicules" />

                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                            <p>{error}</p>
                            <button
                                className="text-sm underline mt-1"
                                onClick={() => setError(null)}
                            >
                                Fermer
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Ajouter un véhicule
                        </button>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un modèle..."
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
                                    <option value="available">Disponibles</option>
                                    <option value="rented">En location</option>
                                    <option value="maintenance">En maintenance</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>

                            <div className="relative w-full md:w-48">
                                <Filter className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Toutes les catégories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                            <p className="mt-4 text-gray-700">Chargement des véhicules...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-700">Aucun véhicule trouvé</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Modèle
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Immatriculation
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Année
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Catégorie
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tarif journalier
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {vehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className={!vehicle.isActive ? 'bg-gray-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Car className="h-5 w-5 text-gray-400 mr-2" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {vehicle.model}
                                                        {!vehicle.isActive && (
                                                            <span className="ml-2 text-xs text-gray-500">(inactif)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{vehicle.plate}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{vehicle.year}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 capitalize">{vehicle.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{vehicle.dailyRate} €</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(vehicle.status)}`}>
                            {formatStatus(vehicle.status)}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

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
                                        {vehicles.filter(v => v.isActive).length}
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
                                        {vehicles.filter(v => v.isActive && v.status === 'available').length}
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
                                        {vehicles.filter(v => v.isActive && v.status === 'rented').length}
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
                                        {vehicles.filter(v => v.isActive && v.status === 'maintenance').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout de véhicule */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Ajouter un véhicule</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddVehicle}>
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
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
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
                                        value={newVehicle.plate}
                                        onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})}
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
                                            value={newVehicle.year}
                                            onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value) || 0})}
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
                                            value={newVehicle.dailyRate}
                                            onChange={(e) => setNewVehicle({...newVehicle, dailyRate: parseFloat(e.target.value) || 0})}
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
                                            value={newVehicle.category}
                                            onChange={(e) => setNewVehicle({...newVehicle, category: e.target.value})}
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
                                            value={newVehicle.status}
                                            onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                                        >
                                            <option value="available">Disponible</option>
                                            <option value="maintenance">En maintenance</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={newVehicle.isActive}
                                        onChange={(e) => setNewVehicle({...newVehicle, isActive: e.target.checked})}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                    Véhicule actif
                  </span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Ajout en cours...
                                        </>
                                    ) : (
                                        <>Ajouter</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal d'édition de véhicule */}
            {showEditModal && vehicleToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Modifier le véhicule</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditVehicle}>
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
                                        value={vehicleToEdit.model}
                                        onChange={(e) => setVehicleToEdit({...vehicleToEdit, model: e.target.value})}
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
                                        value={vehicleToEdit.plate}
                                        onChange={(e) => setVehicleToEdit({...vehicleToEdit, plate: e.target.value.toUpperCase()})}
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
                                            value={vehicleToEdit.year}
                                            onChange={(e) => setVehicleToEdit({...vehicleToEdit, year: parseInt(e.target.value) || 0})}
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
                                            value={vehicleToEdit.dailyRate}
                                            onChange={(e) => setVehicleToEdit({...vehicleToEdit, dailyRate: parseFloat(e.target.value) || 0})}
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
                                            value={vehicleToEdit.category}
                                            onChange={(e) => setVehicleToEdit({...vehicleToEdit, category: e.target.value})}
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
                                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                                            value={vehicleToEdit.status}
                                            onChange={(e) => setVehicleToEdit({...vehicleToEdit, status: e.target.value})}
                                        >
                                            <option value="available">Disponible</option>
                                            <option value="rented">En location</option>
                                            <option value="maintenance">En maintenance</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={vehicleToEdit.isActive}
                                        onChange={(e) => setVehicleToEdit({...vehicleToEdit, isActive: e.target.checked})}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                    Véhicule actif
                  </span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Mise à jour...
                                        </>
                                    ) : (
                                        <>Enregistrer</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && vehicleToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                        <p className="mb-6">
                            Êtes-vous sûr de vouloir supprimer le véhicule <span className="font-semibold">{vehicleToDelete.model}</span> ({vehicleToDelete.plate}) ?
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
                                onClick={handleDeleteVehicle}
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Suppression...
                                    </>
                                ) : (
                                    <>Supprimer</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiclesAdmin;