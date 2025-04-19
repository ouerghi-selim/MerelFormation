import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminFormationsApi } from '../../services/api';

interface ModuleInput {
    title: string;
    description: string;
    duration: number;
    order: number;
}

interface PrerequisiteInput {
    description: string;
}

const FormationNew: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [type, setType] = useState('initial');
    const [isActive, setIsActive] = useState(true);
    const [modules, setModules] = useState<ModuleInput[]>([]);
    const [prerequisites, setPrerequisites] = useState<PrerequisiteInput[]>([]);

    // Form validation
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!title.trim()) errors.title = 'Le titre est requis';
        else if (title.length < 5) errors.title = 'Le titre doit contenir au moins 5 caractères';

        if (!description.trim()) errors.description = 'La description est requise';
        else if (description.length < 20) errors.description = 'La description doit contenir au moins 20 caractères';

        if (!price) errors.price = 'Le prix est requis';
        else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) errors.price = 'Le prix doit être un nombre positif';

        if (!duration) errors.duration = 'La durée est requise';
        else if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) errors.duration = 'La durée doit être un nombre entier positif';

        if (!type) errors.type = 'Le type de formation est requis';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            window.scrollTo(0, 0);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const formationData = {
                title,
                description,
                price: parseFloat(price),
                duration: parseInt(duration),
                type,
                isActive,
                modules: modules.map((module, index) => ({
                    ...module,
                    order: index + 1
                })),
                prerequisites: prerequisites.map(prerequisite => ({
                    description: prerequisite.description
                }))
            };

            await adminFormationsApi.create(formationData);

            setSuccess('Formation créée avec succès');
            setTimeout(() => {
                navigate('/admin/formations');
            }, 1500);
        } catch (err) {
            console.error('Error creating formation:', err);
            setError('Erreur lors de la création de la formation');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const addModule = () => {
        setModules([...modules, { title: '', description: '', duration: 0, order: modules.length + 1 }]);
    };

    const removeModule = (index: number) => {
        const updatedModules = [...modules];
        updatedModules.splice(index, 1);
        setModules(updatedModules);
    };

    const updateModule = (index: number, field: keyof ModuleInput, value: string | number) => {
        const updatedModules = [...modules];
        updatedModules[index] = { ...updatedModules[index], [field]: value };
        setModules(updatedModules);
    };

    const addPrerequisite = () => {
        setPrerequisites([...prerequisites, { description: '' }]);
    };

    const removePrerequisite = (index: number) => {
        const updatedPrerequisites = [...prerequisites];
        updatedPrerequisites.splice(index, 1);
        setPrerequisites(updatedPrerequisites);
    };

    const updatePrerequisite = (index: number, value: string) => {
        const updatedPrerequisites = [...prerequisites];
        updatedPrerequisites[index] = { description: value };
        setPrerequisites(updatedPrerequisites);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Création d'une nouvelle formation" />

                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                            <p>{success}</p>
                        </div>
                    )}

                    <div className="flex mb-6">
                        <button
                            onClick={() => navigate('/admin/formations')}
                            className="flex items-center text-blue-700 hover:text-blue-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour à la liste
                        </button>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titre de la formation*
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.title ? 'border-red-500' : ''
                                        }`}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    {formErrors.title && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description*
                                    </label>
                                    <textarea
                                        rows={4}
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.description ? 'border-red-500' : ''
                                        }`}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    {formErrors.description && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix (€)*
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.price ? 'border-red-500' : ''
                                        }`}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                    {formErrors.price && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Durée (heures)*
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.duration ? 'border-red-500' : ''
                                        }`}
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                                    {formErrors.duration && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.duration}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de formation*
                                    </label>
                                    <select
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.type ? 'border-red-500' : ''
                                        }`}
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="initial">Formation Initiale</option>
                                        <option value="continuous">Formation Continue</option>
                                        <option value="mobility">Formation Mobilité</option>
                                    </select>
                                    {formErrors.type && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <div className="flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                      Formation active
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modules section */}
                            <div className="mt-8 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Modules</h3>
                                    <button
                                        type="button"
                                        onClick={addModule}
                                        className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Ajouter un module
                                    </button>
                                </div>

                                {modules.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">Aucun module ajouté</p>
                                ) : (
                                    <div className="space-y-4">
                                        {modules.map((module, index) => (
                                            <div key={index} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-medium">Module {index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeModule(index)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Titre
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            value={module.title}
                                                            onChange={(e) => updateModule(index, 'title', e.target.value)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Durée (heures)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            value={module.duration}
                                                            onChange={(e) => updateModule(index, 'duration', parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            value={module.description}
                                                            onChange={(e) => updateModule(index, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Prérequis section */}
                            <div className="mt-8 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Prérequis</h3>
                                    <button
                                        type="button"
                                        onClick={addPrerequisite}
                                        className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Ajouter un prérequis
                                    </button>
                                </div>

                                {prerequisites.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">Aucun prérequis ajouté</p>
                                ) : (
                                    <div className="space-y-4">
                                        {prerequisites.map((prerequisite, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    value={prerequisite.description}
                                                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                                                    placeholder="Description du prérequis"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePrerequisite(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/formations')}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <Save className="h-5 w-5 mr-2" />
                                    )}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormationNew;