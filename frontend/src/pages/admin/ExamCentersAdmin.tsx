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
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNotification } from '@/contexts/NotificationContext';

interface ExamCenter {
    id: number;
    name: string;
    code: string;
    city: string;
    departmentCode: string;
    address?: string;
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
    city: string;
    departmentCode: string;
    address: string;
    isActive: boolean;
}

const ExamCentersAdmin: React.FC = () => {
    const [examCenters, setExamCenters] = useState<ExamCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null);
    const [editingCenter, setEditingCenter] = useState<ExamCenter | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { addNotification } = useNotification();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        code: '',
        city: '',
        departmentCode: '',
        address: '',
        isActive: true
    });

    useEffect(() => {
        fetchExamCenters();
    }, []);

    const fetchExamCenters = async () => {
        try {
            setLoading(true);
            const response = await fetch('/admin/exam-centers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            setExamCenters(result.data || []);
        } catch (error) {
            console.error('Erreur:', error);
            addNotification('Erreur lors du chargement des centres d\'examen', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);
            const url = editingCenter ? `/admin/exam-centers/${editingCenter.id}` : '/admin/exam-centers';
            const method = editingCenter ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la sauvegarde');
            }

            addNotification(
                editingCenter ? 'Centre d\'examen modifié avec succès' : 'Centre d\'examen créé avec succès',
                'success'
            );

            await fetchExamCenters();
            handleCloseModal();
        } catch (error: any) {
            console.error('Erreur:', error);
            addNotification(error.message || 'Erreur lors de la sauvegarde', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (center: ExamCenter) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le centre "${center.name}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`/admin/exam-centers/${center.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la suppression');
            }

            addNotification('Centre d\'examen supprimé avec succès', 'success');
            await fetchExamCenters();
        } catch (error: any) {
            console.error('Erreur:', error);
            addNotification(error.message || 'Erreur lors de la suppression', 'error');
        }
    };

    const handleEdit = (center: ExamCenter) => {
        setEditingCenter(center);
        setFormData({
            name: center.name,
            code: center.code,
            city: center.city,
            departmentCode: center.departmentCode,
            address: center.address || '',
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
            city: '',
            departmentCode: '',
            address: '',
            isActive: true
        });
    };

    const handleViewDetails = (center: ExamCenter) => {
        setSelectedCenter(center);
        setShowDetailModal(true);
    };

    const filteredCenters = examCenters.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
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
                            Centres d'examen
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gérez les centres d'examen et leurs formules
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

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un centre d'examen..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total centres</p>
                                <p className="text-2xl font-bold text-gray-900">{examCenters.length}</p>
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
                                <p className="text-2xl font-bold text-gray-900">
                                    {examCenters.filter(c => c.isActive).length}
                                </p>
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
                                    {examCenters.reduce((total, center) => total + center.formulas.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Centers List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Liste des centres ({filteredCenters.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Centre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Localisation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Formules
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCenters.map((center) => (
                                    <tr key={center.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {center.name}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Hash className="h-4 w-4 mr-1" />
                                                    {center.code}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                {center.city} ({center.departmentCode})
                                            </div>
                                            {center.address && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {center.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {center.formulas.length} formule{center.formulas.length > 1 ? 's' : ''}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {center.formulas.filter(f => f.isActive).length} active{center.formulas.filter(f => f.isActive).length > 1 ? 's' : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                center.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {center.isActive ? (
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(center)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(center)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(center)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
                                                    disabled={center.formulas.length > 0}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {editingCenter ? 'Modifier le centre d\'examen' : 'Nouveau centre d\'examen'}
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
                                        <label className="block text-sm font-medium text-gray-500">Ville</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.city}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Département</label>
                                        <p className="text-sm text-gray-900">{selectedCenter.departmentCode}</p>
                                    </div>
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

export default ExamCentersAdmin;