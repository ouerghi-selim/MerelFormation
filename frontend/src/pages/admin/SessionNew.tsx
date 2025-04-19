import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminSessionsApi, adminFormationsApi } from '../../services/api';

interface Formation {
    id: number;
    title: string;
}

const SessionNew: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingFormations, setLoadingFormations] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formations, setFormations] = useState<Formation[]>([]);

    // Form state
    const [formationId, setFormationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('12');
    const [location, setLocation] = useState('7 RUE Georges Maillols, 35000 RENNES');
    const [status, setStatus] = useState('scheduled');
    const [notes, setNotes] = useState('');

    // Form validation
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    // Charger les formations disponibles
    useEffect(() => {
        const fetchFormations = async () => {
            try {
                setLoadingFormations(true);
                const response = await adminFormationsApi.getAll();
                setFormations(response.data);
                setLoadingFormations(false);
            } catch (err) {
                console.error('Error fetching formations:', err);
                setError('Erreur lors du chargement des formations');
                setLoadingFormations(false);

                // Données de secours en cas d'erreur
                const mockFormations: Formation[] = [
                    { id: 1, title: 'Formation Initiale Taxi' },
                    { id: 2, title: 'Formation Continue Taxi' },
                    { id: 3, title: 'Formation Mobilité Taxi' }
                ];

                setFormations(mockFormations);
            }
        };

        fetchFormations();
    }, []);

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!formationId) errors.formation = 'La formation est requise';

        if (!startDate) errors.startDate = 'La date de début est requise';

        if (!endDate) errors.endDate = 'La date de fin est requise';

        if (startDate && endDate && new Date(startDate) >= new Date(endDate))
            errors.endDate = 'La date de fin doit être après la date de début';

        if (!maxParticipants) errors.maxParticipants = 'Le nombre maximum de participants est requis';
        else if (parseInt(maxParticipants) <= 0)
            errors.maxParticipants = 'Le nombre maximum de participants doit être un nombre positif';

        if (!location.trim()) errors.location = 'Le lieu est requis';

        if (!status) errors.status = 'Le statut est requis';

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

            const sessionData = {
                formation: { id: parseInt(formationId) },
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                maxParticipants: parseInt(maxParticipants),
                location,
                status,
                notes: notes.trim() || null
            };

            await adminSessionsApi.create(sessionData);

            setSuccess('Session créée avec succès');
            setTimeout(() => {
                navigate('/admin/sessions');
            }, 1500);
        } catch (err) {
            console.error('Error creating session:', err);
            setError('Erreur lors de la création de la session');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    // Calcul automatique de la date de fin en fonction de la formation sélectionnée
    const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFormationId = e.target.value;
        setFormationId(selectedFormationId);

        if (selectedFormationId && startDate) {
            const selectedFormation = formations.find(f => f.id.toString() === selectedFormationId);
            if (selectedFormation) {
                // Déterminer la durée en fonction du type de formation
                // Ces durées sont fictives, à ajuster selon votre logique métier
                let durationDays = 28; // Par défaut 4 semaines pour formation initiale

                if (selectedFormation.title.toLowerCase().includes('continue')) {
                    durationDays = 2; // 2 jours pour formation continue
                } else if (selectedFormation.title.toLowerCase().includes('mobilité')) {
                    durationDays = 7; // 1 semaine pour formation mobilité
                }

                // Calculer la date de fin
                const start = new Date(startDate);
                const end = new Date(start);
                end.setDate(start.getDate() + durationDays);

                setEndDate(end.toISOString().split('T')[0]);
            }
        }
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);

        // Mettre à jour la date de fin automatiquement si une formation est sélectionnée
        if (formationId && newStartDate) {
            const selectedFormation = formations.find(f => f.id.toString() === formationId);
            if (selectedFormation) {
                let durationDays = 28;

                if (selectedFormation.title.toLowerCase().includes('continue')) {
                    durationDays = 2;
                } else if (selectedFormation.title.toLowerCase().includes('mobilité')) {
                    durationDays = 7;
                }

                const start = new Date(newStartDate);
                const end = new Date(start);
                end.setDate(start.getDate() + durationDays);

                setEndDate(end.toISOString().split('T')[0]);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader title="Création d'une nouvelle session" />

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
                            onClick={() => navigate('/admin/sessions')}
                            className="flex items-center text-blue-700 hover:text-blue-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour à la liste
                        </button>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Formation*
                                    </label>
                                    <select
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.formation ? 'border-red-500' : ''
                                        }`}
                                        value={formationId}
                                        onChange={handleFormationChange}
                                        disabled={loadingFormations}
                                    >
                                        <option value="">Sélectionner une formation</option>
                                        {formations.map(formation => (
                                            <option key={formation.id} value={formation.id}>
                                                {formation.title}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.formation && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.formation}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de début*
                                    </label>
                                    <input
                                        type="date"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.startDate ? 'border-red-500' : ''
                                        }`}
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                    />
                                    {formErrors.startDate && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de fin*
                                    </label>
                                    <input
                                        type="date"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.endDate ? 'border-red-500' : ''
                                        }`}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    {formErrors.endDate && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lieu*
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.location ? 'border-red-500' : ''
                                        }`}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                    {formErrors.location && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre maximum de participants*
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.maxParticipants ? 'border-red-500' : ''
                                        }`}
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(e.target.value)}
                                    />
                                    {formErrors.maxParticipants && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.maxParticipants}</p>
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
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="scheduled">Programmée</option>
                                        <option value="ongoing">En cours</option>
                                        <option value="completed">Terminée</option>
                                        <option value="cancelled">Annulée</option>
                                    </select>
                                    {formErrors.status && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.status}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (facultatif)
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Informations complémentaires sur la session..."
                                    />
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/sessions')}
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

export default SessionNew;