// src/components/admin/SessionForm.tsx - Composant unifié basé sur SessionNew.tsx
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calendar, Clock, MapPin, Users, FileText, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { adminSessionsApi, adminFormationsApi, adminCentersApi, documentsApi } from '../../services/api';

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

interface Instructor {
    id: number;
    firstName: string;
    lastName: string;
    specialization?: string;
    isActive?: boolean;
}

interface SessionData {
    id?: number;
    formation: { id: number; title?: string };
    startDate: string;
    endDate: string;
    location: string;
    maxParticipants: number;
    status: string;
    notes?: string;
    instructors?: number[];
    center?: { id: number } | null;
    // Pour le planning
    start?: Date;
    end?: Date;
    title?: string;
    type?: 'formation' | 'exam';
    currentParticipants?: number;
    // Documents existants
    documents?: Array<{
        id: number;
        title: string;
        type: string;
        fileSize: string;
        downloadUrl: string;
    }>;
}

interface SessionFormProps {
    mode: 'create' | 'edit' | 'planning';
    session?: SessionData;
    onSave: (data: SessionData) => Promise<any>;
    onCancel: () => void;
    isOpen: boolean;
    // Contexte spécifique
    isExamEvent?: boolean;
    showTimeFields?: boolean;
    showDocuments?: boolean;
}

interface FormErrors {
    formation?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    maxParticipants?: string;
    status?: string;
}

const SessionForm: React.FC<SessionFormProps> = ({
    mode,
    session,
    onSave,
    onCancel,
    isOpen,
    isExamEvent = false,
    showTimeFields = false,
    showDocuments = false
}) => {
    const { addToast } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // États pour les données
    const [formationsData, setFormationsData] = useState<Formation[]>([]);
    const [centersData, setCentersData] = useState<Center[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loadingFormations, setLoadingFormations] = useState(true);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [loadingInstructors, setLoadingInstructors] = useState(true);

    // États du formulaire
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
    const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);

    // États pour les documents
    const [documents, setDocuments] = useState<File[]>([]);
    const [tempDocuments, setTempDocuments] = useState<{tempId: string, document: any}[]>([]);
    const [pendingTempIds, setPendingTempIds] = useState<string[]>([]);
    const [existingDocuments, setExistingDocuments] = useState<Array<{
        id: number;
        title: string;
        type: string;
        fileSize: string;
        downloadUrl: string;
    }>>([]);

    // Charger les données initiales
    useEffect(() => {
        if (isOpen) {
            fetchFormations();
            fetchInstructors();
            fetchCenters(); // Toujours charger les centres
            
            // Initialiser avec les données de session existante
            if (session) {
                initializeForm(session);
            } else {
                resetForm();
            }
        }
    }, [isOpen, session, mode]);

    const fetchFormations = async () => {
        try {
            setLoadingFormations(true);
            const response = await adminFormationsApi.getAll();
            setFormationsData(response.data);
        } catch (err) {
            console.error('Error fetching formations:', err);
            addToast('Erreur lors du chargement des formations', 'error');
        } finally {
            setLoadingFormations(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            setLoadingInstructors(true);
            const response = await adminSessionsApi.getInstructors();
            // Filtrer seulement les instructeurs actifs
            const activeInstructors = response.data.filter((instructor: Instructor) => instructor.isActive !== false);
            setInstructors(activeInstructors);
        } catch (err) {
            console.error('Error fetching instructors:', err);
            addToast('Erreur lors du chargement des instructeurs', 'error');
        } finally {
            setLoadingInstructors(false);
        }
    };

    const fetchCenters = async () => {
        try {
            setLoadingCenters(true);
            const response = await adminCentersApi.getForFormations();
            // Filtrer côté frontend pour s'assurer qu'on a que les centres de formation
            const formationCenters = response.data.filter((center: Center) => 
                center.type === 'formation' || center.type === 'Formation' || !center.type
            );
            setCentersData(formationCenters);
        } catch (err) {
            console.error('Error fetching centers:', err);
            addToast('Erreur lors du chargement des centres', 'error');
        } finally {
            setLoadingCenters(false);
        }
    };

    const initializeForm = (sessionData: SessionData) => {
        setFormationId(sessionData.formation.id.toString());
        setMaxParticipants(sessionData.maxParticipants.toString());
        setLocation(sessionData.location);
        setStatus(sessionData.status);
        setNotes(sessionData.notes || '');
        setCenterId(sessionData.center?.id.toString() || '');

        // Traitement des dates - même logique pour tous les modes
        if (sessionData.start) {
            // Si on a des dates Date (planning)
            setStartDate(sessionData.start.toISOString().split('T')[0]);
            const hours = sessionData.start.getHours().toString().padStart(2, '0');
            const minutes = sessionData.start.getMinutes().toString().padStart(2, '0');
            setStartTime(`${hours}:${minutes}`);
        } else if (sessionData.startDate) {
            // Si on a des dates string (create/edit)
            setStartDate(sessionData.startDate.split('T')[0]);
            if (sessionData.startDate.includes('T')) {
                setStartTime(sessionData.startDate.split('T')[1].slice(0, 5));
            }
        }
        
        if (sessionData.end) {
            // Si on a des dates Date (planning)
            setEndDate(sessionData.end.toISOString().split('T')[0]);
            const hours = sessionData.end.getHours().toString().padStart(2, '0');
            const minutes = sessionData.end.getMinutes().toString().padStart(2, '0');
            setEndTime(`${hours}:${minutes}`);
        } else if (sessionData.endDate) {
            // Si on a des dates string (create/edit)
            setEndDate(sessionData.endDate.split('T')[0]);
            if (sessionData.endDate.includes('T')) {
                setEndTime(sessionData.endDate.split('T')[1].slice(0, 5));
            }
        }

        // Instructeurs
        if (sessionData.instructors) {
            setSelectedInstructors(sessionData.instructors);
        }

        // Réinitialiser les documents
        setDocuments([]);
        setTempDocuments([]);
        setPendingTempIds([]);
        
        // Charger les documents existants pour l'édition
        if (mode === 'edit' && sessionData.id) {
            fetchExistingDocuments(sessionData.id);
        } else {
            setExistingDocuments([]);
        }
    };

    const resetForm = () => {
        setFormationId('');
        setStartDate('');
        setStartTime('09:00');
        setEndDate('');
        setEndTime('17:00');
        setMaxParticipants('12');
        setLocation('7 RUE Georges Maillols, 35000 RENNES');
        setCenterId('');
        setStatus('scheduled');
        setNotes('');
        setSelectedInstructors([]);
        setDocuments([]);
        setTempDocuments([]);
        setPendingTempIds([]);
        setExistingDocuments([]);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors: FormErrors = {};

        if (!formationId) errors.formation = 'La formation est requise';
        if (!startDate) errors.startDate = 'La date de début est requise';
        if (!endDate) errors.endDate = 'La date de fin est requise';

        // Validation des dates avec heures
        if (startDate && endDate) {
            let startDateTime: Date;
            let endDateTime: Date;

            if (showTimeFields) {
                startDateTime = new Date(startDate);
                endDateTime = new Date(endDate);
            } else {
                startDateTime = new Date(`${startDate}T${startTime}`);
                endDateTime = new Date(`${endDate}T${endTime}`);
            }

            if (startDateTime >= endDateTime) {
                errors.endDate = 'La date et heure de fin doivent être après le début';
            }
        }

        if (!maxParticipants || parseInt(maxParticipants) <= 0) {
            errors.maxParticipants = 'Le nombre maximum de participants doit être un nombre positif';
        }
        if (!location.trim()) errors.location = 'Le lieu est requis';
        if (!status) errors.status = 'Le statut est requis';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            let sessionData: SessionData;

            if (showTimeFields) {
                // Mode planning
                const startDateTime = new Date(startDate);
                const endDateTime = new Date(endDate);
                
                sessionData = {
                    ...session,
                    formation: { id: parseInt(formationId) },
                    startDate: startDateTime.toISOString(),
                    endDate: endDateTime.toISOString(),
                    start: startDateTime,
                    end: endDateTime,
                    location,
                    maxParticipants: parseInt(maxParticipants),
                    status,
                    notes: notes.trim() || undefined,
                    instructors: selectedInstructors,
                    type: isExamEvent ? 'exam' : 'formation'
                };

                // Auto-générer le titre si pas présent
                if (!sessionData.title) {
                    const formation = formationsData.find(f => f.id === parseInt(formationId));
                    sessionData.title = formation?.title || 'Session de formation';
                }
            } else {
                // Mode create/edit
                const startDateTime = new Date(`${startDate}T${startTime}`);
                const endDateTime = new Date(`${endDate}T${endTime}`);
                
                sessionData = {
                    ...session,
                    formation: { id: parseInt(formationId) },
                    startDate: startDateTime.toISOString(),
                    endDate: endDateTime.toISOString(),
                    location,
                    maxParticipants: parseInt(maxParticipants),
                    status,
                    notes: notes.trim() || undefined,
                    instructors: selectedInstructors,
                    center: centerId ? { id: parseInt(centerId) } : null
                };
            }

            // Gérer les documents pour tous les modes
            if (mode === 'create') {
                const response = await onSave(sessionData);

                // Upload documents après création
                if (documents.length > 0) {
                    const sessionId = response.data.id;
                    for (const document of documents) {
                        const formData = new FormData();
                        formData.append('file', document);
                        formData.append('title', document.name.split('.')[0]);
                        formData.append('category', 'support');

                        try {
                            await adminSessionsApi.uploadDocument(sessionId, formData);
                        } catch (docError) {
                            console.error('Erreur upload:', document.name, docError);
                        }
                    }
                }
            } else {
                await onSave(sessionData);

                // Finaliser temp documents (edit)
                if (mode === 'edit' && pendingTempIds.length > 0) {
                    try {
                        await documentsApi.finalizeDocuments({
                            tempIds: pendingTempIds,
                            entityType: 'session',
                            entityId: sessionData.id
                        });
                        setTempDocuments([]);
                        setPendingTempIds([]);
                    } catch (docErr) {
                        console.error('Error finalizing documents:', docErr);
                        addToast('Erreur finalisation documents', 'warning');
                    }
                }
            }


            addToast(`Session ${mode === 'create' ? 'créée' : mode === 'edit' ? 'modifiée' : 'mise à jour'} avec succès`, 'success');
            
        } catch (error) {
            console.error('Error saving session:', error);
            addToast(`Erreur lors de la ${mode === 'create' ? 'création' : 'modification'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calcul automatique de la date de fin
    const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFormationId = e.target.value;
        setFormationId(selectedFormationId);

        if (selectedFormationId && startDate && !showTimeFields) {
            const selectedFormation = formationsData.find(f => f.id.toString() === selectedFormationId);
            if (selectedFormation) {
                let durationDays = 28; // Par défaut 4 semaines pour formation initiale

                if (selectedFormation.title.toLowerCase().includes('continue')) {
                    durationDays = 2; // 2 jours pour formation continue
                } else if (selectedFormation.title.toLowerCase().includes('mobilité')) {
                    durationDays = 7; // 1 semaine pour formation mobilité
                }

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
        if (formationId && newStartDate && !showTimeFields) {
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
                const fullAddress = selectedCenter.address ? 
                    `${selectedCenter.address}, ${selectedCenter.city}` : 
                    selectedCenter.city;
                setLocation(fullAddress);
            }
        }
    };

    // Gestion des documents
    const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        
        if (mode === 'create') {
            setDocuments([...documents, ...Array.from(files)]);
        } else if (mode === 'edit') {
            handleTempDocumentUpload(files);
        }
        
        event.target.value = '';
    };

    const handleTempDocumentUpload = async (files: FileList) => {
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('title', file.name);
                formData.append('category', 'support');

                const response = await documentsApi.tempUpload(formData);
                const { tempId, document: tempDoc } = response.data;

                setTempDocuments(prev => [...prev, { tempId, document: tempDoc }]);
                setPendingTempIds(prev => [...prev, tempId]);
            }

            addToast('Document(s) ajouté(s) temporairement. Sauvegardez pour finaliser.', 'info');
        } catch (err: any) {
            console.error('Error uploading temporary document:', err);
            
            if (err.response?.status === 413) {
                addToast('Fichier trop volumineux. La taille maximale autorisée est de 100 Mo.', 'error');
            } else if (err.response?.status >= 400 && err.response?.status < 500) {
                addToast('Erreur lors de l\'upload: ' + (err.response?.data?.message || 'Format de fichier non autorisé'), 'error');
            } else {
                addToast('Erreur lors de l\'upload temporaire', 'error');
            }
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const removeTempDocument = async (tempId: string) => {
        try {
            await documentsApi.deleteTempDocument(tempId);
            setTempDocuments(prev => prev.filter(td => td.tempId !== tempId));
            setPendingTempIds(prev => prev.filter(id => id !== tempId));
            addToast('Document temporaire supprimé', 'success');
        } catch (err) {
            console.error('Error deleting temporary document:', err);
            addToast('Erreur lors de la suppression temporaire', 'error');
        }
    };

    // Fonction pour récupérer les documents existants d'une session
    const fetchExistingDocuments = async (sessionId: number) => {
        try {
            const response = await adminSessionsApi.get(sessionId);
            const sessionData = response.data;
            if (sessionData.documents && sessionData.documents.length > 0) {
                setExistingDocuments(sessionData.documents);
            } else {
                setExistingDocuments([]);
            }
        } catch (err) {
            console.error('Error fetching existing documents:', err);
            setExistingDocuments([]);
        }
    };

    // Fonction pour supprimer un document existant
    const removeExistingDocument = async (documentId: number) => {
        if (!session?.id) return;
        
        try {
            await adminSessionsApi.deleteDocument(session.id, documentId);
            setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
            addToast('Document supprimé avec succès', 'success');
        } catch (err) {
            console.error('Error deleting existing document:', err);
            addToast('Erreur lors de la suppression du document', 'error');
        }
    };

    // Fonction pour télécharger un document existant
    const downloadExistingDocument = (document: any) => {
        if (document.downloadUrl) {
            window.open(document.downloadUrl, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* En-tête */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            {mode === 'create' ? 'Créer une session' : 
                             mode === 'edit' ? 'Modifier la session' : 
                             'Gérer la session'}
                        </h3>
                        {isExamEvent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Événement d'examen
                            </span>
                        )}
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            
                            {/* Formation */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FileText className="h-4 w-4 inline mr-1" />
                                    Formation*
                                </label>
                                <select
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.formation ? 'border-red-500' : ''
                                    } ${isExamEvent ? 'bg-gray-50' : ''}`}
                                    value={formationId}
                                    onChange={handleFormationChange}
                                    disabled={loadingFormations || isExamEvent}
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

                            {/* Date de début */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    Date de début*
                                </label>
                                <input
                                    type={showTimeFields ? 'datetime-local' : 'date'}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.startDate ? 'border-red-500' : ''
                                    } ${isExamEvent ? 'bg-gray-50' : ''}`}
                                    value={startDate}
                                    onChange={showTimeFields ? 
                                        (e) => setStartDate(e.target.value) : 
                                        handleStartDateChange
                                    }
                                    disabled={isExamEvent}
                                />
                                {formErrors.startDate && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>
                                )}
                            </div>

                            {/* Heure de début pour les modes create/edit */}
                            {!showTimeFields && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Heure de début*
                                    </label>
                                    <input
                                        type="time"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        disabled={isExamEvent}
                                    />
                                </div>
                            )}

                            {/* Date de fin */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    Date de fin*
                                </label>
                                <input
                                    type={showTimeFields ? 'datetime-local' : 'date'}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.endDate ? 'border-red-500' : ''
                                    } ${isExamEvent ? 'bg-gray-50' : ''}`}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isExamEvent}
                                />
                                {formErrors.endDate && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>
                                )}
                            </div>

                            {/* Heure de fin pour les modes create/edit */}
                            {!showTimeFields && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Heure de fin*
                                    </label>
                                    <input
                                        type="time"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        disabled={isExamEvent}
                                    />
                                </div>
                            )}

                            {/* Centre de formation pour les modes create/edit */}
                            {!showTimeFields && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <MapPin className="h-4 w-4 inline mr-1" />
                                        Centre de formation
                                    </label>
                                    <select
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={centerId}
                                        onChange={handleCenterChange}
                                        disabled={loadingCenters || isExamEvent}
                                    >
                                        <option value="">Sélectionner un centre</option>
                                        {centersData.map(center => (
                                            <option key={center.id} value={center.id}>
                                                {center.name} - {center.city}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Le lieu se met à jour automatiquement selon le centre sélectionné
                                    </p>
                                </div>
                            )}

                            {/* Lieu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Lieu*
                                </label>
                                <input
                                    type="text"
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.location ? 'border-red-500' : ''
                                    } ${isExamEvent ? 'bg-gray-50' : ''}`}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Adresse du lieu de formation"
                                    disabled={isExamEvent}
                                />
                                {formErrors.location && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                                )}
                            </div>

                            {/* Participants maximum */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Users className="h-4 w-4 inline mr-1" />
                                    Participants maximum*
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.maxParticipants ? 'border-red-500' : ''
                                    } ${isExamEvent ? 'bg-gray-50' : ''}`}
                                    value={maxParticipants}
                                    onChange={(e) => setMaxParticipants(e.target.value)}
                                    disabled={isExamEvent}
                                />
                                {formErrors.maxParticipants && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.maxParticipants}</p>
                                )}
                            </div>

                            {/* Statut */}
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
                        </div>

                        {/* Instructeurs */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users className="h-4 w-4 inline mr-1" />
                                Instructeur(s)
                            </label>
                            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
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
                                            disabled={isExamEvent}
                                        />
                                        <span className="ml-2 text-sm text-gray-900">
                                            {instructor.firstName} {instructor.lastName}
                                            {instructor.specialization && (
                                                <span className="text-gray-500 ml-1">({instructor.specialization})</span>
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {selectedInstructors.length === 0 && (
                                <p className="mt-1 text-sm text-gray-500">Aucun instructeur sélectionné</p>
                            )}
                        </div>

                        {/* Section Documents - toujours affichée */}
                        <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-medium text-gray-900">
                                        <FileText className="h-5 w-5 inline mr-2" />
                                        Documents
                                    </h4>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        onChange={handleDocumentUpload}
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

                                {/* Documents en mode création */}
                                {mode === 'create' && documents.length > 0 && (
                                    <div className="space-y-2">
                                        {documents.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Documents temporaires en mode édition */}
                                {mode === 'edit' && tempDocuments.length > 0 && (
                                    <div className="space-y-2">
                                        {tempDocuments.map((tempDoc) => (
                                            <div key={tempDoc.tempId} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                                                <div>
                                                    <span className="text-sm">{tempDoc.document.title}</span>
                                                    <span className="text-xs text-yellow-700 ml-2">(temporaire)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTempDocument(tempDoc.tempId)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Documents existants pour l'édition */}
                                {mode === 'edit' && existingDocuments.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        <h5 className="text-sm font-medium text-gray-700">Documents existants :</h5>
                                        {existingDocuments.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium">{doc.title}</span>
                                                    <div className="text-xs text-gray-500">
                                                        {doc.type} • {doc.fileSize}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => downloadExistingDocument(doc)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Télécharger"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingDocument(doc.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {documents.length === 0 && tempDocuments.length === 0 && existingDocuments.length === 0 && (
                                    <p className="text-gray-500 text-sm italic">Aucun document</p>
                                )}
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (optionnel)
                            </label>
                            <textarea
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notes additionnelles sur la session..."
                            />
                        </div>

                        {/* Boutons */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                                disabled={isExamEvent}
                                icon={!loading && <Save className="h-5 w-5" />}
                            >
                                {mode === 'create' ? 'Créer' : mode === 'edit' ? 'Enregistrer' : 'Mettre à jour'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SessionForm;