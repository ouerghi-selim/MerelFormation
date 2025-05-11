import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { adminPlanningApi, adminReservationsApi,adminFormationsApi } from '@/services/api';
import { CalendarEvent, Formation, Instructor } from './types';
import { DEFAULT_LOCATIONS } from './calendarConfig';

export const usePlanningData = () => {
    const { addToast } = useNotification();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [availableLocations, setAvailableLocations] = useState<string[]>(DEFAULT_LOCATIONS);
    const [availableInstructors, setAvailableInstructors] = useState<Instructor[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Charger les données initiales (formations, formateurs, etc.)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Chargement des formations
                const formationsResponse = await adminFormationsApi.getAll();
                const formationsData = formationsResponse.data.map((formation: any) => ({
                    id: formation.id,
                    title: formation.title
                }));
                setFormations(formationsData);

                // Chargement des formateurs
                const instructorsResponse = await adminPlanningApi.getInstructors();
                const instructorsData = instructorsResponse.data.map((instructor: any) => ({
                    id: instructor.id,
                    name: `${instructor.firstName} ${instructor.lastName}`
                }));
                setAvailableInstructors(instructorsData);
            } catch (err) {
                console.error('Error fetching initial data:', err);
                addToast('Erreur lors du chargement des données initiales', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [addToast]);

    // Charger les événements quand la date change
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                // Calculer le premier et dernier jour avec une marge
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month - 1, 1);
                const lastDay = new Date(year, month + 2, 0);

                // Format des dates pour l'API (YYYY-MM-DD)
                const startDate = firstDay.toISOString().split('T')[0];
                const endDate = lastDay.toISOString().split('T')[0];

                // 1. Récupérer les sessions de formation (seulement celles confirmées)
                const sessionParams = new URLSearchParams();
                //sessionParams.append('status', 'confirmed');
                sessionParams.append('startDate', startDate);
                sessionParams.append('endDate', endDate);

                const sessionResponse = await adminReservationsApi.getSessionReservations(sessionParams.toString());

                // Transformer les sessions en événements
                const sessionEvents = sessionResponse.data.map((session: any) => ({
                    id: session.id,
                    title: session.session.formation.title,
                    formation: { id: session.session.formation.id },
                    start: new Date(session.session.startDate),
                    end: new Date(session.session.endDate ||
                        new Date(new Date(session.session.startDate).setHours(
                            new Date(session.session.startDate).getHours() + 8))), // Par défaut +8h si pas de date de fin
                    type: 'formation',
                    location: session.session.location || 'Centre de formation',
                    instructor: session.session.instructor ? {
                        id: session.session.instructor.id,
                        name: `${session.session.instructor.firstName} ${session.session.instructor.lastName}`
                    } : undefined,
                    maxParticipants: session.session.maxParticipants || 12,
                    currentParticipants: session.session.participants ? session.session.participants.length : 0
                }));

                // 2. Récupérer les réservations de véhicules pour examen (seulement celles confirmées)
                const vehicleParams = new URLSearchParams();
                vehicleParams.append('status', 'confirmed');
                vehicleParams.append('startDate', startDate);
                vehicleParams.append('endDate', endDate);

                const vehicleResponse = await adminReservationsApi.getAll(vehicleParams.toString());

                // Transformer les réservations de véhicules en événements
                const examEvents = vehicleResponse.data.map((reservation: any) => ({
                    id: `exam-${reservation.id}`, // Préfixe pour éviter les conflits d'ID
                    title: `Examen - ${reservation.clientName}`,
                    formation: { id: undefined }, // Pas lié à une formation
                    start: new Date(reservation.date), // Date de l'examen
                    end: new Date(new Date(reservation.date).setHours(
                        new Date(reservation.date).getHours() + 3)), // Par défaut +3h pour un examen
                    type: 'exam',
                    location: reservation.examCenter || 'Centre d\'examen',
                    maxParticipants: 1, // Un seul participant pour un examen
                    currentParticipants: 1, // Toujours complet
                    vehicleAssigned: reservation.vehicleAssigned,
                    clientName: reservation.clientName
                }));

                // 3. Fusionner les deux types d'événements
                const allEvents = [...sessionEvents, ...examEvents];

                // 4. Trier les événements par date
                allEvents.sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());

                setEvents(allEvents);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Erreur lors du chargement des événements');
                addToast('Erreur lors du chargement des événements', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentDate, addToast]);

    // Convertir les événements pour react-big-calendar
    const calendarEvents: BigCalendarEvent[] = events.map(event => ({
        ...event,
        resourceId: event.formation.id,
        allDay: true
    }));

    // Gérer la sauvegarde d'un événement (création ou mise à jour)
    const saveEvent = async (eventData: Partial<CalendarEvent>, selectedEventId?: number) => {
        try {
            setIsProcessing(true);

            // Préparation des données pour l'API
            const sessionData = {
                formation: { id: eventData.formation?.id },
                startDate: eventData.start?.toISOString(),
                endDate: eventData.end?.toISOString(),
                location: eventData.location,
                maxParticipants: eventData.maxParticipants,
                instructor: eventData.instructor ? { id: eventData.instructor.id } : 8,
                notes: eventData.type === 'exam' ? 'Examen' : '',
                type: eventData.type
            };

            let updatedEvents: CalendarEvent[];

            if (selectedEventId) {
                // Mise à jour d'un événement existant
                await adminPlanningApi.updateEvent(selectedEventId, sessionData);

                // Mettre à jour la liste des événements
                updatedEvents = events.map(event =>
                    event.id === selectedEventId ? {...event, ...eventData as CalendarEvent} : event
                );

                addToast('Session mise à jour avec succès', 'success');
            } else {
                // Création d'un nouvel événement
                const response = await adminPlanningApi.createEvent(sessionData);
                const newEventId = response.data.id;

                // Créer un nouvel événement avec l'ID retourné
                const newEvent: CalendarEvent = {
                    id: newEventId,
                    title: eventData.title || '',
                    formation: { id: eventData.formation?.id },
                    start: eventData.start || new Date(),
                    end: eventData.end || new Date(),
                    type: eventData.type || 'formation',
                    location: eventData.location || '',
                    instructor: eventData.instructor,
                    maxParticipants: eventData.maxParticipants || 12,
                    currentParticipants: eventData.currentParticipants || 0
                };

                // Ajouter le nouvel événement à la liste
                updatedEvents = [...events, newEvent];

                addToast('Session créée avec succès', 'success');
            }

            // Mettre à jour l'état avec les événements mis à jour
            setEvents(updatedEvents);
            return true;
        } catch (err) {
            console.error('Error saving event:', err);
            setError('Erreur lors de la sauvegarde de la session');
            addToast('Erreur lors de la sauvegarde de la session', 'error');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    // Gérer la suppression d'un événement
    const deleteEvent = async (id: number) => {
        try {
            setIsProcessing(true);

            // Supprimer l'événement via l'API
            await adminPlanningApi.deleteEvent(id);

            // Mettre à jour la liste des événements
            setEvents(prevEvents => prevEvents.filter(event => event.id !== id));

            addToast('Session supprimée avec succès', 'success');
            return true;
        } catch (err) {
            console.error('Error deleting event:', err);
            setError('Erreur lors de la suppression de la session');
            addToast('Erreur lors de la suppression de la session', 'error');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        currentDate,
        setCurrentDate,
        events,
        calendarEvents: events.map(event => ({
            ...event,
            resourceId: event.formation?.id,
            allDay: true // Les événements s'étendent sur toute la journée
        })),
        availableLocations,
        availableInstructors,
        formations,
        loading,
        error,
        setError,
        isProcessing,
        saveEvent,
        deleteEvent
    };
};