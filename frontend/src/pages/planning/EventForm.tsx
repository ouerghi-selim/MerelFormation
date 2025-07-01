// src/pages/admin/PlanningCalendar/EventForm.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarEvent, Formation, Instructor, FormErrors } from './types';

interface EventFormProps {
    event: CalendarEvent | null;
    onSave: (eventData: Partial<CalendarEvent>) => void;
    availableLocations: string[];
    availableInstructors: Instructor[];
    formations: Formation[];
    onSubmit: (submitFn: () => void) => void;
}

const EventForm: React.FC<EventFormProps> = ({
                                                 event,
                                                 onSave,
                                                 availableLocations,
                                                 availableInstructors,
                                                 formations,
                                                 onSubmit
                                             }) => {
    // ✅ Vérifier si c'est un événement d'examen (lecture seule)
    const isExamEvent = event && typeof event.id === 'string' && event.id.startsWith('exam-');

    const [formationId, setFormationId] = useState<number | undefined>(event?.formation?.id);
    const [title, setTitle] = useState(event?.title || '');

    // Format ISO pour les dates (YYYY-MM-DD)
    const [startDate, setStartDate] = useState(
        event?.start ? event.start.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );

    // Format HH:MM pour les heures
    const [startTime, setStartTime] = useState(
        event?.start
            ? `${event.start.getHours().toString().padStart(2, '0')}:${event.start.getMinutes().toString().padStart(2, '0')}`
            : '09:00'
    );

    const [endDate, setEndDate] = useState(
        event?.end ? event.end.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );

    const [endTime, setEndTime] = useState(
        event?.end
            ? `${event.end.getHours().toString().padStart(2, '0')}:${event.end.getMinutes().toString().padStart(2, '0')}`
            : '17:00'
    );

    const [type] = useState<'formation' | 'exam'>('formation'); // Toujours formation
    const [location, setLocation] = useState(event?.location || '7 RUE Georges Maillols, 35000 RENNES');
    const [selectedInstructors, setSelectedInstructors] = useState<number[]>(
        event?.instructors ? event.instructors.map(inst => inst.id) :
        event?.instructor?.id ? [event.instructor.id] : []
    );
    const [maxParticipants, setMaxParticipants] = useState(event?.maxParticipants || 12);
    const [status, setStatus] = useState(event?.status || 'scheduled');
    const [notes, setNotes] = useState(event?.notes || '');
    const [errors, setErrors] = useState<FormErrors>({});

    // Mettre à jour le titre quand la formation change
    useEffect(() => {
        if (formationId && !isExamEvent) { // Ne pas changer le titre pour les examens
            const formation = formations.find(f => f.id === formationId);
            if (formation) {
                setTitle(formation.title);
            }
        }
    }, [formationId, formations, isExamEvent]);

    // Valider le formulaire
    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};

        // ✅ Ne pas valider les événements d'examen (lecture seule)
        if (isExamEvent) {
            setErrors({});
            return false; // Empêcher la soumission
        }

        if (!formationId) newErrors.formation = 'La formation est requise';
        if (!startDate) newErrors.startDate = 'La date de début est requise';
        if (!startTime) newErrors.startTime = 'L\'heure de début est requise';
        if (!endDate) newErrors.endDate = 'La date de fin est requise';
        if (!endTime) newErrors.endTime = 'L\'heure de fin est requise';
        if (!location) newErrors.location = 'Le lieu est requis';
        if (!maxParticipants || maxParticipants <= 0)
            newErrors.maxParticipants = 'Le nombre de participants doit être positif';

        // Vérifier que la date de fin est après la date de début
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        if (start >= end) {
            newErrors.endDate = 'La fin doit être après le début';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formationId, startDate, startTime, endDate, endTime, location, maxParticipants, status, notes, isExamEvent]);

    // Fonction pour soumettre le formulaire
    const handleSubmit = useCallback(() => {
        if (!validateForm()) return false;

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);

        const eventData: Partial<CalendarEvent> = {
            title,
            formation: { id: formationId },
            startDate: startDateTime.toISOString(), // ✅ Harmonisé avec SessionNew
            endDate: endDateTime.toISOString(),     // ✅ Harmonisé avec SessionNew
            start: startDateTime,  // Garder pour le calendrier
            end: endDateTime,      // Garder pour le calendrier
            type,
            location,
            instructors: selectedInstructors,
            maxParticipants,
            status,
            notes: notes.trim() || null,
            currentParticipants: event?.currentParticipants || 0
        };

        onSave(eventData);
        return true;
    }, [
        title, formationId, startDate, startTime, endDate, endTime,
        type, location, selectedInstructors, maxParticipants, status, notes, event,
        validateForm, onSave
    ]);

    // ✅ Utiliser useRef pour éviter la boucle infinie mais garder les valeurs à jour
    const submitRef = useRef(handleSubmit);
    submitRef.current = handleSubmit; // Toujours la version la plus récente

    // Enregistrer la fonction de soumission pour pouvoir l'appeler depuis le parent
    useEffect(() => {
        onSubmit(() => submitRef.current());
        // ✅ Pas de dépendances pour éviter la boucle infinie
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Affichage spécial pour les événements d'examen (lecture seule)
    if (isExamEvent) {
        return (
            <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Événement d'examen
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Les événements d'examen ne peuvent pas être modifiés depuis le planning.
                                    Veuillez utiliser la section "Réservations" pour gérer les examens.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                            value={title}
                            readOnly
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input
                                type="date"
                                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                                value={startDate}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                            <input
                                type="date"
                                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                                value={endDate}
                                readOnly
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                            value={location}
                            readOnly
                        />
                    </div>

                    {event?.clientName && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <input
                                type="text"
                                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                                value={event.clientName}
                                readOnly
                            />
                        </div>
                    )}

                    {event?.vehicleAssigned && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule assigné</label>
                            <input
                                type="text"
                                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                                value={event.vehicleAssigned}
                                readOnly
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formation*
                </label>
                <select
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.formation ? 'border-red-500' : ''
                    }`}
                    value={formationId || ''}
                    onChange={(e) => setFormationId(e.target.value ? parseInt(e.target.value) : undefined)}
                >
                    <option value="">Sélectionner une formation</option>
                    {formations.map(formation => (
                        <option key={formation.id} value={formation.id}>{formation.title}</option>
                    ))}
                </select>
                {errors.formation && (
                    <p className="mt-1 text-sm text-red-500">{errors.formation}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de début*
                    </label>
                    <input
                        type="date"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.startDate ? 'border-red-500' : ''
                        }`}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    {errors.startDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de début*
                    </label>
                    <input
                        type="time"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.startTime ? 'border-red-500' : ''
                        }`}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    {errors.startTime && (
                        <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin*
                    </label>
                    <input
                        type="date"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.endDate ? 'border-red-500' : ''
                        }`}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    {errors.endDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de fin*
                    </label>
                    <input
                        type="time"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.endTime ? 'border-red-500' : ''
                        }`}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                    {errors.endTime && (
                        <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lieu*
                    </label>
                    <select
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.location ? 'border-red-500' : ''
                        }`}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option value="">Sélectionner un lieu</option>
                        {availableLocations.map((loc, index) => (
                            <option key={index} value={loc}>{loc}</option>
                        ))}
                    </select>
                    {errors.location && (
                        <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Formateur(s)
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                        {availableInstructors.map(instructor => (
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
                                    {instructor.firstName && instructor.lastName ? 
                                        `${instructor.firstName} ${instructor.lastName}` : 
                                        instructor.name}
                                    {instructor.specialization && (
                                        <span className="text-gray-500 ml-1">({instructor.specialization})</span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                    {selectedInstructors.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">Aucun formateur sélectionné</p>
                    )}
                    {errors.instructor && (
                        <p className="mt-1 text-sm text-red-500">{errors.instructor}</p>
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
                            errors.maxParticipants ? 'border-red-500' : ''
                        }`}
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)}
                    />
                    {errors.maxParticipants && (
                        <p className="mt-1 text-sm text-red-500">{errors.maxParticipants}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut*
                    </label>
                    <select
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.status ? 'border-red-500' : ''
                        }`}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="scheduled">Programmée</option>
                        <option value="ongoing">En cours</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                    </select>
                    {errors.status && (
                        <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (facultatif)
                </label>
                <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informations complémentaires sur la session..."
                />
            </div>
        </div>
    );
};

export default EventForm;