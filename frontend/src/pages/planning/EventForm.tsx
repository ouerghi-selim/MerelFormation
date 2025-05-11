// src/pages/admin/PlanningCalendar/EventForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

    const [type, setType] = useState<'formation' | 'exam'>(event?.type || 'formation');
    const [location, setLocation] = useState(event?.location || '');
    const [instructorId, setInstructorId] = useState<number | undefined>(event?.instructor?.id);
    const [maxParticipants, setMaxParticipants] = useState(event?.maxParticipants || 12);
    const [errors, setErrors] = useState<FormErrors>({});

    // Mettre à jour le titre quand la formation change
    useEffect(() => {
        if (formationId) {
            const formation = formations.find(f => f.id === formationId);
            if (formation) {
                setTitle(formation.title);
            }
        }
    }, [formationId, formations]);

    // Valider le formulaire
    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};

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
    }, [formationId, startDate, startTime, endDate, endTime, location, maxParticipants]);

    // Fonction pour soumettre le formulaire
    const handleSubmit = useCallback(() => {
        if (!validateForm()) return false;

        const eventData: Partial<CalendarEvent> = {
            title,
            formation: { id: formationId },
            start: new Date(`${startDate}T${startTime}`),
            end: new Date(`${endDate}T${endTime}`),
            type,
            location,
            instructor: instructorId ? { id: instructorId } : undefined,
            maxParticipants,
            currentParticipants: event?.currentParticipants || 0
        };

        onSave(eventData);
        return true;
    }, [
        title, formationId, startDate, startTime, endDate, endTime,
        type, location, instructorId, maxParticipants, event,
        validateForm, onSave
    ]);

    // Enregistrer la fonction de soumission pour pouvoir l'appeler depuis le parent
    useEffect(() => {
        onSubmit(() => handleSubmit());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                        Type d'événement*
                    </label>
                    <select
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                        value={type}
                        onChange={(e) => setType(e.target.value as 'formation' | 'exam')}
                    >
                        <option value="formation">Formation</option>
                        <option value="exam">Examen</option>
                    </select>
                </div>

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

                {type === 'formation' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Formateur*
                        </label>
                        <select
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                errors.instructor ? 'border-red-500' : ''
                            }`}
                            value={instructorId || ''}
                            onChange={(e) => {
                                setInstructorId(e.target.value ? parseInt(e.target.value, 10) : undefined);
                            }}
                        >
                            <option value="">Sélectionner un formateur</option>
                            {availableInstructors.map((instr) => (
                                <option key={instr.id} value={instr.id}>{instr.name}</option>
                            ))}
                        </select>
                        {errors.instructor && (
                            <p className="mt-1 text-sm text-red-500">{errors.instructor}</p>
                        )}
                    </div>
                )}

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
            </div>
        </div>
    );
};

export default EventForm;