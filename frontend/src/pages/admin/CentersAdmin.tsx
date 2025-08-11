import React, { useState, useEffect } from 'react';
import {
    Building,
    Plus,
    Search,
    Edit,
    Trash2,
    ArrowLeft,
    MapPin,
    Hash,
    Users,
    Eye,
    CheckCircle,
    XCircle,
    Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import ActionMenu from '../../components/common/ActionMenu';
import DataTable from '../../components/common/DataTable';
import { useNotification } from '../../contexts/NotificationContext';
import { adminCentersApi } from '../../services/api';
import { Center, CenterType, CENTER_TYPES } from '../../types/center';


interface CenterInterface {
    id: number;
    name: string;
    code: string;
    type: CenterType;
    city: string;
    departmentCode: string;
    address?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    formulas: Formula[];
}

interface Formula {
    id: number;
    name: string;
    type: string;
    price?: number;
    isActive: boolean;
}

interface FormData {
    name: string;
    code: string;
    type: CenterType;
    city: string;
    departmentCode: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
}

const CentersAdmin: React.FC = () => {
    const [centers, setCenters] = useState<CenterInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<CenterType | 'all'>('all');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<CenterInterface | null>(null);
    const [editingCenter, setEditingCenter] = useState<CenterInterface | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useNotification();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        code: '',
        type: 'formation',
        city: '',
        departmentCode: '',
        address: '',
        phone: '',
        email: '',
        isActive: true
    });

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            setLoading(true);
            const response = await adminCentersApi.getAll();
            // La réponse est maintenant directement un tableau, pas un objet avec .data
            setCenters(response.data || response || []);
        } catch (error: any) {
            console.error('Erreur:', error);
            addToast('Erreur lors du chargement des centres', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);

            let response;
            if (editingCenter) {
                // Mise à jour d'un centre existant
                response = await adminCentersApi.update(editingCenter.id, formData);
            } else {
                // Création d'un nouveau centre
                response = await adminCentersApi.create(formData);
            }

            addToast(
                editingCenter ? 'Centre modifié avec succès' : 'Centre créé avec succès',
                'success'
            );

            await fetchCenters();
            handleCloseModal();
        } catch (error: any) {
            console.error('Erreur:', error);
            addToast(error.response?.data?.error || error.message || 'Erreur lors de la sauvegarde', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (center: CenterInterface) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le centre "${center.name}" ?`)) {
            return;
        }

        try {
            await adminCentersApi.delete(center.id);
            addToast('Centre supprimé avec succès', 'success');
            await fetchCenters();
        } catch (error: any) {
            console.error('Erreur:', error);
            addToast(error.response?.data?.error || error.message || 'Erreur lors de la suppression', 'error');
        }
    };

    const handleEdit = (center: CenterInterface) => {
        setEditingCenter(center);
        setFormData({
            name: center.name,
            code: center.code,
            type: center.type,
            city: center.city,
            departmentCode: center.departmentCode,
            address: center.address || '',
            phone: center.phone || '',
            email: center.email || '',
            isActive: center.isActive
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCenter(null);
        setFormData({
            name: '',
            code: '',
            type: 'formation',
            city: '',
            departmentCode: '',
            address: '',
            phone: '',
            email: '',
            isActive: true
        });
    };

    const handleViewDetails = (center: CenterInterface) => {
        setSelectedCenter(center);
        setShowDetailModal(true);
    };

    const filteredCenters = centers.filter(center => {
        const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            center.code.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === 'all' || center.type === typeFilter;
        
        return matchesSearch && matchesType;
    });

    const getTypeStats = () => {
        const stats = {
            total: centers.length,
            active: centers.filter(c => c.isActive).length,
            formation: centers.filter(c => c.type === 'formation').length,
            exam: centers.filter(c => c.type === 'exam').length,
            both: centers.filter(c => c.type === 'both').length
        };
        return stats;
    };

    const stats = getTypeStats();

    // Configuration des colonnes pour le DataTable
    const columns = [
        {
            title: 'Centre',
            field: (row: CenterInterface) => (
                <div>
                    <div className="text-sm font-medium text-gray-900 truncate" title={row.name}>
                        {row.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center truncate">
                        <Hash className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate" title={row.code}>{row.code}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: 'w-1/4'
        },
        {
            title: 'Type',
            field: (row: CenterInterface) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.type === 'formation' 
                        ? 'bg-blue-100 text-blue-800'
                        : row.type === 'exam'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                }`}>
                    {row.type === 'formation' ? 'Formation' : 
                     row.type === 'exam' ? 'Examen' : 
                     'Formation & Examen'}
                </span>
            ),
            sortable: true,
            width: 'w-1/8',
            cellClassName: 'text-center'
        },
        {
            title: 'Localisation',
            field: (row: CenterInterface) => (
                <div>
                    <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                        <span className="truncate" title={`${row.city} (${row.departmentCode})`}>
                            {row.city} ({row.departmentCode})
                        </span>
                    </div>
                    {row.address && (
                        <div className="text-xs text-gray-500 mt-1 truncate" title={row.address}>
                            {row.address}
                        </div>
                    )}
                </div>
            ),
            sortable: true,
            width: 'w-1/4'
        },
        {
            title: 'Formules',
            field: (row: CenterInterface) => (
                <div className="text-center">
                    <div className="text-sm text-gray-900">
                        {row.formulas.length} formule{row.formulas.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.formulas.filter(f => f.isActive).length} active{row.formulas.filter(f => f.isActive).length > 1 ? 's' : ''}
                    </div>
                </div>
            ),
            sortable: false,
            width: 'w-1/8',
            cellClassName: 'text-center'
        },
        {
            title: 'Statut',
            field: (row: CenterInterface) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {row.isActive ? (
                        <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactif
                        </>
                    )}
                </span>
            ),
            sortable: true,
            width: 'w-1/8',
            cellClassName: 'text-center'
        }
    ];

    // Fonction pour générer les actions
    const generateActions = (center: CenterInterface) => [
        {
            label: 'Voir les détails',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewDetails(center)
        },
        {
            label: 'Modifier',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEdit(center)
        },
        {
            label: 'Supprimer',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDelete(center),
            variant: 'danger' as const,
            disabled: center.formulas.length > 0
        }
    ];

    if (loading) {
        return (
            <AdminLayout title="Chargement...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Gestion des centres" breadcrumbItems={[
            { label: 'Admin', path: '/admin' },
            { label: 'Centres' }
        ]}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Retour au dashboard
                        </Link>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Building className="h-8 w-8 mr-3 text-blue-600" />
                            Gestion des centres
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gérez les centres de formation, d'examen et leurs informations
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouveau centre
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un centre..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as CenterType | 'all')}
                        >
                            <option value="all">Tous les types</option>
                            <option value="formation">Formation</option>
                            <option value="exam">Examen</option>
                            <option value="both">Formation & Examen</option>
                        </select>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total centres</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Centres actifs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Formation</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.formation}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Building className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Examen</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.exam}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Additional stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Building className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Formation & Examen</p>
                                <p className="text-2xl font-bold text-green-600">{stats.both}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Users className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total formules</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {centers.reduce((total, center) => total + center.formulas.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Centers List */}
                <DataTable<CenterInterface>
                    data={filteredCenters}
                    columns={columns}
                    keyField="id"
                    loading={loading}
                    actions={generateActions}
                    searchFields={['name', 'city', 'code']}
                    emptyMessage="Aucun centre trouvé"
                    title="Liste des centres"
                    searchPlaceholder="Rechercher par nom, ville ou code..."
                    showSearch={false} // On utilise les filtres personnalisés au-dessus
                />

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {editingCenter ? 'Modifier le centre' : 'Nouveau centre'}
                                </h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nom du centre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Code du centre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ex: RENNES_BRUZ"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Type de centre *
                                    </label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value as CenterType})}
                                    >
                                        <option value="formation">Formation</option>
                                        <option value="exam">Examen</option>
                                        <option value="both">Formation & Examen</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ville *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Département *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: 35"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.departmentCode}
                                            onChange={(e) => setFormData({...formData, departmentCode: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Adresse complète
                                    </label>
                                    <textarea
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="ex: 02 99 XX XX XX"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="ex: centre@example.com"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">
                                        Centre actif
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        disabled={submitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedCenter && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Détails du centre - {selectedCenter.name}
                                </h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Nom</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Code</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.code}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Type</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedCenter.type === 'formation' ? 'Formation' : 
                                             selectedCenter.type === 'exam' ? 'Examen' : 
                                             'Formation & Examen'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Statut</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.isActive ? 'Actif' : 'Inactif'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Ville</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.city}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Département</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.departmentCode}</p>
                                    </div>
                                    {selectedCenter.phone && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                                            <p className="text-sm text-gray-900">{selectedCenter.phone}</p>
                                        </div>
                                    )}
                                    {selectedCenter.email && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-sm text-gray-900">{selectedCenter.email}</p>
                                        </div>
                                    )}
                                </div>
                                {selectedCenter.address && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Adresse</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.address}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">
                                        Formules ({selectedCenter.formulas.length})
                                    </label>
                                    {selectedCenter.formulas.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedCenter.formulas.map((formula) => (
                                                <div key={formula.id} className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{formula.name}</p>
                                                            <p className="text-sm text-gray-600">Type: {formula.type}</p>
                                                            {formula.price && (
                                                                <p className="text-sm text-green-600">{formula.price}€ TTC</p>
                                                            )}
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            formula.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {formula.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Aucune formule configurée</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CentersAdmin;