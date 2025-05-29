import React, { useState, useEffect } from 'react';
import { 
    Calculator, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ArrowLeft, 
    Building,
    Euro,
    Tag,
    CheckCircle,
    XCircle,
    Filter
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
    isActive: boolean;
}

interface Formula {
    id: number;
    name: string;
    description: string;
    price?: number;
    type: string;
    isActive: boolean;
    additionalInfo?: string;
    createdAt: string;
    updatedAt: string;
    examCenter: ExamCenter;
}

interface FormData {
    name: string;
    description: string;
    price: string;
    type: string;
    additionalInfo: string;
    isActive: boolean;
    examCenterId: number | '';
}

const FormulasAdmin: React.FC = () => {
    const [formulas, setFormulas] = useState<Formula[]>([]);
    const [examCenters, setExamCenters] = useState<ExamCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCenterFilter, setSelectedCenterFilter] = useState<number | ''>('');
    const [showModal, setShowModal] = useState(false);
    const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { addNotification } = useNotification();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        type: 'simple',
        additionalInfo: '',
        isActive: true,
        examCenterId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Récupérer les formules et centres d'examen en parallèle
            const [formulasResponse, centersResponse] = await Promise.all([
                fetch('/admin/formulas', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('/admin/exam-centers/active', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (!formulasResponse.ok || !centersResponse.ok) {
                throw new Error('Erreur lors du chargement');
            }

            const [formulasResult, centersResult] = await Promise.all([
                formulasResponse.json(),
                centersResponse.json()
            ]);

            setFormulas(formulasResult.data || []);
            setExamCenters(centersResult || []);
        } catch (error) {
            console.error('Erreur:', error);
            addNotification('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);
            const url = editingFormula ? `/admin/formulas/${editingFormula.id}` : '/admin/formulas';
            const method = editingFormula ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                price: formData.price ? parseFloat(formData.price) : null,
                examCenterId: formData.examCenterId
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la sauvegarde');
            }

            addNotification(
                editingFormula ? 'Formule modifiée avec succès' : 'Formule créée avec succès',
                'success'
            );

            await fetchData();
            handleCloseModal();
        } catch (error: any) {
            console.error('Erreur:', error);
            addNotification(error.message || 'Erreur lors de la sauvegarde', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (formula: Formula) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la formule "${formula.name}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`/admin/formulas/${formula.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la suppression');
            }

            addNotification('Formule supprimée avec succès', 'success');
            await fetchData();
        } catch (error: any) {
            console.error('Erreur:', error);
            addNotification(error.message || 'Erreur lors de la suppression', 'error');
        }
    };

    const handleEdit = (formula: Formula) => {
        setEditingFormula(formula);
        setFormData({
            name: formula.name,
            description: formula.description,
            price: formula.price ? formula.price.toString() : '',
            type: formula.type,
            additionalInfo: formula.additionalInfo || '',
            isActive: formula.isActive,
            examCenterId: formula.examCenter.id
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingFormula(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            type: 'simple',
            additionalInfo: '',
            isActive: true,
            examCenterId: ''
        });
    };

    const filteredFormulas = formulas.filter(formula => {
        const matchesSearch = 
            formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formula.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formula.examCenter.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCenter = selectedCenterFilter === '' || formula.examCenter.id === selectedCenterFilter;

        return matchesSearch && matchesCenter;
    });

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
                            <Calculator className="h-8 w-8 mr-3 text-blue-600" />
                            Formules d'examen
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gérez les formules et tarifs par centre d'examen
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Nouvelle formule
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une formule..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            value={selectedCenterFilter}
                            onChange={(e) => setSelectedCenterFilter(e.target.value ? parseInt(e.target.value) : '')}
                        >
                            <option value="">Tous les centres</option>
                            {examCenters.map(center => (
                                <option key={center.id} value={center.id}>
                                    {center.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calculator className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total formules</p>
                                <p className="text-2xl font-bold text-gray-900">{formulas.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Formules actives</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formulas.filter(f => f.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Tag className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Type simple</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formulas.filter(f => f.type === 'simple').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Euro className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Prix moyen</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formulas.filter(f => f.price).length > 0 
                                        ? Math.round(formulas.filter(f => f.price).reduce((sum, f) => sum + (f.price || 0), 0) / formulas.filter(f => f.price).length)
                                        : 0
                                    }€
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulas List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Liste des formules ({filteredFormulas.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Formule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Centre d'examen
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type / Prix
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
                                {filteredFormulas.map((formula) => (
                                    <tr key={formula.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formula.name}
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {formula.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Building className="h-4 w-4 mr-1 text-gray-400" />
                                                {formula.examCenter.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formula.examCenter.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    formula.type === 'simple'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {formula.type === 'simple' ? 'Simple' : 'Intégrale'}
                                                </span>
                                                <div className="text-sm text-gray-900 mt-1">
                                                    {formula.price ? (
                                                        <span className="font-medium text-green-600">
                                                            {formula.price}€ TTC
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">Nous consulter</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                formula.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {formula.isActive ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(formula)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(formula)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
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
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {editingFormula ? 'Modifier la formule' : 'Nouvelle formule'}
                                </h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Centre d'examen *
                                    </label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.examCenterId}
                                        onChange={(e) => setFormData({...formData, examCenterId: e.target.value ? parseInt(e.target.value) : ''})}
                                    >
                                        <option value="">Sélectionnez un centre</option>
                                        {examCenters.map(center => (
                                            <option key={center.id} value={center.id}>
                                                {center.name} - {center.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nom de la formule *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ex: Formule simple"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description *
                                    </label>
                                    <textarea
                                        required
                                        placeholder="ex: Location Véhicule Taxi-Ecole"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Type de formule *
                                        </label>
                                        <select
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="simple">Simple</option>
                                            <option value="integral">Intégrale</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Prix (€ TTC)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Laisser vide pour 'nous consulter'"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Informations supplémentaires
                                    </label>
                                    <textarea
                                        placeholder="ex: + 1H30 En individuel de Prise en main du véhicule, Conduite"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        rows={2}
                                        value={formData.additionalInfo}
                                        onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
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
                                        Formule active
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
            </div>
        </AdminLayout>
    );
};

export default FormulasAdmin;