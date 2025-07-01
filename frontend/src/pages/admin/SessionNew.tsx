// src/pages/admin/SessionNew.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';

import { adminSessionsApi, adminFormationsApi, adminCentersApi } from '../../services/api';

interface Formation {
    id: number;
    title: string;
}

interface Center {
    id: number;
    name: string;
    address: string;
    city: string;
    type: string;
}

const SessionNew: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotification();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formationId, setFormationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('17:00');
    const [maxParticipants, setMaxParticipants] = useState('12');
    const [location, setLocation] = useState('7 RUE Georges Maillols, 35000 RENNES');
    const [centerId, setCenterId] = useState('');
    const [status, setStatus] = useState('scheduled');
    const [notes, setNotes] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);


    const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
    const [instructors, setInstructors] = useState<Array<{id: number, firstName: string, lastName: string}>>([]);
    const [loadingInstructors, setLoadingInstructors] = useState(true);


    // Form validation
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    const [formationsData, setFormationsData] = useState<Formation[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(true);
    const [centersData, setCentersData] = useState<Center[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(true);

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
                const response = await adminSessionsApi.getInstructors();
                setInstructors(response.data);
            } catch (err) {
                console.error('Error fetching instructors:', err);
            } finally {
                setLoadingInstructors(false);
            }
        };

        fetchInstructors();
    }, []);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                setLoadingCenters(true);
                const response = await adminCentersApi.getForFormations();
                setCentersData(response.data);
            } catch (err) {
                console.error('Error fetching centers:', err);
            } finally {
                setLoadingCenters(false);
            }
        };

        fetchCenters();
    }, []);

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!formationId) errors.formation = 'La formation est requise';

        if (!startDate) errors.startDate = 'La date de début est requise';

        if (!endDate) errors.endDate = 'La date de fin est requise';

        // Vérifier que la date/heure de fin est après la date/heure de début
        if (startDate && endDate && startTime && endTime) {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);
            if (startDateTime >= endDateTime) {
                errors.endDate = 'La date et heure de fin doivent être après le début';
            }
        }

        if (!maxParticipants) errors.maxParticipants = 'Le nombre maximum de participants est requis';
        else if (parseInt(maxParticipants) <= 0)
            errors.maxParticipants = 'Le nombre maximum de participants doit être un nombre positif';

        if (!location.trim()) errors.location = 'Le lieu est requis';

        if (!status) errors.status = 'Le statut est requis';
        // Les instructeurs ne sont plus obligatoires


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

            // Préparer les données au format JSON attendu par le contrôleur
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);
            
            const sessionData = {
                formation: { id: parseInt(formationId) },
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                maxParticipants: parseInt(maxParticipants),
                location: location,
                center: centerId ? { id: parseInt(centerId) } : null,
                status: status,
                notes: notes.trim() || null,
                instructors: selectedInstructors
            };

            // Créer la session d'abord
            const response = await adminSessionsApi.create(sessionData);
            
            // Si des documents sont attachés, les uploader séparément
            if (documents.length > 0) {
                const sessionId = response.data.id;
                for (const document of documents) {
                    const formData = new FormData();
                    formData.append('file', document);
                    formData.append('title', document.name.split('.')[0]); // Utiliser le nom du fichier sans extension
                    formData.append('category', 'support');
                    
                    try {
                        await adminSessionsApi.uploadDocument(sessionId, formData);
                    } catch (docError) {
                        console.error('Erreur lors de l\'upload du document:', document.name, docError);
                        // Continue avec les autres documents même si un échoue
                    }
                }
            }
            addToast('Session créée avec succès', 'success');

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
            const selectedFormation = formationsData.find(f => f.id.toString() === selectedFormationId);
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

    const handleCenterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCenterId = e.target.value;
        setCenterId(selectedCenterId);

        if (selectedCenterId) {
            const selectedCenter = centersData.find(c => c.id.toString() === selectedCenterId);
            if (selectedCenter) {
                // Mettre à jour automatiquement le champ location avec l'adresse du centre
                const fullAddress = selectedCenter.address ? 
                    `${selectedCenter.address}, ${selectedCenter.city}` : 
                    selectedCenter.city;
                setLocation(fullAddress);
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                                        Heure de début*
                                    </label>
                                    <input
                                        type="time"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
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
                                        Heure de fin*
                                    </label>
                                    <input
                                        type="time"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Centre de formation
                                    </label>
                                    <select
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={centerId}
                                        onChange={handleCenterChange}
                                        disabled={loadingCenters}
                                    >
                                        <option value="">Sélectionner un centre</option>
                                        {centersData.map(center => (
                                            <option key={center.id} value={center.id}>
                                                {center.name} - {center.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lieu (automatique ou manuel)*
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.location ? 'border-red-500' : ''
                                        }`}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Adresse du lieu de formation..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Se remplit automatiquement si un centre est sélectionné, ou peut être saisi manuellement
                                    </p>
                                    {formErrors.location && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Formateur(s)
                                    </label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                        {instructors.map(instructor => (
                                            <label key={instructor.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedInstructors.includes(instructor.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedInstructors([...selectedInstructors, instructor.id]);
                                                        } else {
                                                            setSelectedInstructors(selectedInstructors.filter(id => id !== instructor.id));
                                                        }
                                                    }}
                                                />
                                                <span className="ml-2 text-sm text-gray-900">
                                                    {instructor.firstName} {instructor.lastName}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedInstructors.length === 0 && (
                                        <p className="mt-1 text-sm text-gray-500">Aucun formateur sélectionné</p>
                                    )}
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
                                {/* Section Documents */}
                                <div className="mt-8 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            onChange={(e) => setDocuments(Array.from(e.target.files || []))}
                                            className="hidden"
                                            id="documents-upload"
                                        />
                                        <label
                                            htmlFor="documents-upload"
                                            className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ajouter des documents
                                        </label>
                                    </div>

                                    {documents.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">Aucun document ajouté</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {documents.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDocuments(docs => docs.filter((_, i) => i !== index))}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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