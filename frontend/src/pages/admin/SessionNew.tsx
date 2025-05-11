// src/pages/admin/SessionNew.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminSessionsApi, adminFormationsApi } from '../../services/api';

interface Formation {
    id: number;
    title: string;
}

const SessionNew: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotification();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formationId, setFormationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('12');
    const [location, setLocation] = useState('7 RUE Georges Maillols, 35000 RENNES');
    const [status, setStatus] = useState('scheduled');
    const [notes, setNotes] = useState('');

    const [instructorId, setInstructorId] = useState('');
    const [instructors, setInstructors] = useState<Array<{id: number, firstName: string, lastName: string}>>([]);
    const [loadingInstructors, setLoadingInstructors] = useState(true);


    // Form validation
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const [formationsData, setFormationsData] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(true);

    useEffect(() => {
        const fetchFormations = async () => {
            try {
                setLoadingFormations(true);
                const response = await adminFormationsApi.getAll();
                setFormationsData(response.data);
            } catch (err) {
                console.error('Error fetching formations:', err);
            } finally {
                setLoadingFormations(false);
            }
        };

        fetchFormations();
    }, []);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                setLoadingInstructors(true);
                const response = await adminFormationsApi.getInstructors();
                setInstructors(response.data);
            } catch (err) {
                console.error('Error fetching instructors:', err);
            } finally {
                setLoadingInstructors(false);
            }
        };

        fetchInstructors();
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
        // if (!instructorId) errors.instructor = 'Le formateur est requis';


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
                notes: notes.trim() || null,
                instructor: instructorId ? { id: parseInt(instructorId) } : null
            };

            await adminSessionsApi.create(sessionData);
            addToast('Session créée avec succès', 'success');

            // Redirection après un court délai
            setTimeout(() => {
                navigate('/admin/sessions');
            }, 1500);
        } catch (err) {
            console.error('Error creating session:', err);
            setError('Erreur lors de la création de la session');
            addToast('Erreur lors de la création de la session', 'error');
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
            const selectedFormation = formationsDataData.find(f => f.id.toString() === selectedFormationId);
            if (selectedFormation) {
                // Déterminer la durée en fonction du type de formation
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
            const selectedFormation = formationsData.find(f => f.id.toString() === formationId);
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
                <AdminHeader
                    title="Création d'une nouvelle session"
                    breadcrumbItems={[
                        { label: 'Admin', path: '/admin' },
                        { label: 'Sessions', path: '/admin/sessions' },
                        { label: 'Nouvelle session' }
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

                    <div className="flex mb-6">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/sessions')}
                            icon={<ArrowLeft className="h-4 w-4" />}
                        >
                            Retour à la liste
                        </Button>
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
                                        {formationsData.map(formation => (
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
                                        Formateur
                                    </label>
                                    <select
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.instructor ? 'border-red-500' : ''
                                        }`}
                                        value={instructorId}
                                        onChange={(e) => setInstructorId(e.target.value)}
                                        disabled={loadingInstructors}
                                    >
                                        <option value="">Sélectionner un formateur</option>
                                        {instructors.map(instructor => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.firstName} {instructor.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.instructor && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.instructor}</p>
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
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/admin/sessions')}
                                    className="mr-3"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    loading={loading}
                                    icon={!loading && <Save className="h-5 w-5"/>}
                                >
                                    Enregistrer
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionNew;