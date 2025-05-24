import { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { adminPlanningApi, adminReservationsApi, adminFormationsApi, adminSessionsApi } from '@/services/api';
import {BigCalendarEvent, CalendarEvent, Formation, Instructor} from './types';
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

                // 1. Récupérer les sessions directement via l'API des sessions
                const sessionParams = new URLSearchParams();
                sessionParams.append('startDate', startDate);
                sessionParams.append('endDate', endDate);
                sessionParams.append('status', 'scheduled'); // Seulement les sessions programmées

                const sessionResponse = await adminSessionsApi.getAll(sessionParams.toString());

                // Transformer les sessions en événements
                const sessionEvents = sessionResponse.data.map((session: any) => ({
                    id: session.id, // ✅ ID de session directement
                    title: session.formation.title,
                    formation: { id: session.formation.id },
                    start: new Date(session.startDate),
                    end: new Date(session.endDate ||
                        new Date(new Date(session.startDate).setHours(
                            new Date(session.startDate).getHours() + 8))), // Par défaut +8h si pas de date de fin
                    type: 'formation' as const,
                    location: session.location || 'Centre de formation',
                    instructor: session.instructor ? {
                        id: session.instructor.id,
                        name: `${session.instructor.firstName} ${session.instructor.lastName}`
                    } : undefined,
                    maxParticipants: session.maxParticipants || 12,
                    currentParticipants: session.participants ? session.participants.length : 0
                }));

                // 2. Récupérer les réservations de véhicules CONFIRMÉES pour examen
                const vehicleParams = new URLSearchParams();
                vehicleParams.append('status', 'confirmed');

                const vehicleResponse = await adminReservationsApi.getAll(vehicleParams.toString());


                // Transformer les réservations de véhicules en événements d'examen
                const examEvents = vehicleResponse.data
                    .filter((reservation: any) => {
                        // ✅ Prendre seulement les réservations confirmées
                        return reservation.status === 'confirmed';
                    })
                    .map((reservation: any) => {
                        try {
                            // ✅ Parser la date au format d/m/Y retourné par votre API
                            const dateParts = reservation.date.split('/');
                            if (dateParts.length !== 3) {
                                console.error('Invalid date format:', reservation.date);
                                return null;
                            }

                            const day = parseInt(dateParts[0], 10);
                            const month = parseInt(dateParts[1], 10) - 1; // Les mois sont 0-indexés en JavaScript
                            const year = parseInt(dateParts[2], 10);

                            // Vérifier que les valeurs sont valides
                            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                                console.error('Invalid date parts:', dateParts);
                                return null;
                            }

                            const examDate = new Date(year, month, day, 9, 0); // 9h par défaut
                            const examEndDate = new Date(year, month, day, 12, 0); // 12h par défaut (3h d'examen)

                            return {
                                id: `exam-${reservation.id}`, // ✅ Garder le préfixe pour éviter les conflits d'ID
                                title: `Examen - ${reservation.clientName}`,
                                formation: { id: undefined }, // Pas lié à une formation
                                start: examDate,
                                end: examEndDate,
                                type: 'exam' as const,
                                location: reservation.examCenter || 'Centre d\'examen',
                                maxParticipants: 1, // Un seul participant pour un examen
                                currentParticipants: 1, // Toujours complet
                                vehicleAssigned: reservation.vehicleAssigned,
                                clientName: reservation.clientName
                            };
                        } catch (error) {
                            console.error('Error parsing reservation:', reservation, error);
                            return null;
                        }
                    })
                    .filter(Boolean); // Supprimer les éléments null

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
        allDay: false // ✅ Afficher avec les heures
    }));

    // Gérer la sauvegarde d'un événement (création ou mise à jour)
    const saveEvent = async (eventData: Partial<CalendarEvent>, selectedEventId?: number | string) => {
        try {
            setIsProcessing(true);

            // ✅ Vérifier si c'est un événement d'examen (ne peut pas être modifié ici)
            if (typeof selectedEventId === 'string' && selectedEventId.startsWith('exam-')) {
                addToast('Les examens ne peuvent pas être modifiés depuis le planning', 'warning');
                return false;
            }

            // Préparation des données pour l'API
            const sessionData = {
                formation: { id: eventData.formation?.id },
                startDate: eventData.start?.toISOString(),
                endDate: eventData.end?.toISOString(),
                location: eventData.location,
                maxParticipants: eventData.maxParticipants,
                instructor: eventData.instructor ? { id: eventData.instructor.id } : null,
                notes: eventData.type === 'exam' ? 'Examen' : '',
                status: 'scheduled' // ✅ Statut par défaut pour les nouvelles sessions
            };

            let updatedEvents: CalendarEvent[];

            if (selectedEventId && typeof selectedEventId === 'number') {
                // ✅ Mise à jour d'une session existante (ID numérique uniquement)
                const response = await adminSessionsApi.update(selectedEventId, sessionData);

                // ✅ L'API retourne {message: "...", data: {...}} donc on accède à .data
                const apiResponse = response.data;
                const updatedSessionData = apiResponse.data; // ✅ Accéder au bon niveau

                // ✅ Conversion sécurisée des dates
                let startDate: Date;
                let endDate: Date;

                try {
                    startDate = new Date(updatedSessionData.startDate);
                    endDate = new Date(updatedSessionData.endDate);

                    // Vérifier que les dates sont valides
                    if (isNaN(startDate.getTime())) {
                        console.error('Invalid start date:', updatedSessionData.startDate);
                        startDate = eventData.start || new Date(); // Fallback sur les données du formulaire
                    }
                    if (isNaN(endDate.getTime())) {
                        console.error('Invalid end date:', updatedSessionData.endDate);
                        endDate = eventData.end || new Date(); // Fallback sur les données du formulaire
                    }
                } catch (error) {
                    console.error('Error converting dates:', error);
                    startDate = eventData.start || new Date();
                    endDate = eventData.end || new Date();
                }

                // Transformer les données de l'API en format CalendarEvent avec vérifications de sécurité
                const updatedEvent: CalendarEvent = {
                    id: updatedSessionData.id,
                    title: updatedSessionData.formation?.title || eventData.title || 'Session sans titre',
                    formation: {
                        id: updatedSessionData.formation?.id || eventData.formation?.id
                    },
                    start: startDate,
                    end: endDate,
                    type: 'formation' as const,
                    location: updatedSessionData.location || '',
                    instructor: updatedSessionData.instructor ? {
                        id: updatedSessionData.instructor.id,
                        name: `${updatedSessionData.instructor.firstName || ''} ${updatedSessionData.instructor.lastName || ''}`.trim()
                    } : eventData.instructor,
                    maxParticipants: updatedSessionData.maxParticipants || 12,
                    currentParticipants: updatedSessionData.participants ? updatedSessionData.participants.length : 0
                };


                // Mettre à jour la liste des événements avec les vraies données de l'API
                updatedEvents = events.map(event =>
                    event.id === selectedEventId ? updatedEvent : event
                );

                addToast('Session mise à jour avec succès', 'success');
            } else {
                // ✅ Création d'une nouvelle session
                const response = await adminSessionsApi.create(sessionData);

                // ✅ L'API retourne {message: "...", data: {...}} donc on accède à .data
                const apiResponse = response.data;
                const newSessionData = apiResponse.data || apiResponse; // ✅ Fallback si la structure est différente

                // ✅ Conversion sécurisée des dates
                let startDate: Date;
                let endDate: Date;

                try {
                    startDate = new Date(newSessionData.startDate);
                    endDate = new Date(newSessionData.endDate);

                    // Vérifier que les dates sont valides
                    if (isNaN(startDate.getTime())) {
                        console.error('Invalid start date:', newSessionData.startDate);
                        startDate = eventData.start || new Date();
                    }
                    if (isNaN(endDate.getTime())) {
                        console.error('Invalid end date:', newSessionData.endDate);
                        endDate = eventData.end || new Date();
                    }
                } catch (error) {
                    console.error('Error converting dates for new event:', error);
                    startDate = eventData.start || new Date();
                    endDate = eventData.end || new Date();
                }

                // ✅ Créer un nouvel événement avec les données retournées par l'API
                const newEvent: CalendarEvent = {
                    id: newSessionData.id,
                    title: newSessionData.formation?.title || eventData.title || 'Session sans titre',
                    formation: {
                        id: newSessionData.formation?.id || eventData.formation?.id
                    },
                    start: startDate,
                    end: endDate,
                    type: 'formation' as const,
                    location: newSessionData.location || '',
                    instructor: newSessionData.instructor ? {
                        id: newSessionData.instructor.id,
                        name: `${newSessionData.instructor.firstName || ''} ${newSessionData.instructor.lastName || ''}`.trim()
                    } : eventData.instructor,
                    maxParticipants: newSessionData.maxParticipants || 12,
                    currentParticipants: newSessionData.participants ? newSessionData.participants.length : 0
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
    const deleteEvent = async (id: number | string) => {
        try {
            setIsProcessing(true);

            // ✅ Vérifier si c'est un événement d'examen (ne peut pas être supprimé ici)
            if (typeof id === 'string' && id.startsWith('exam-')) {
                addToast('Les examens ne peuvent pas être supprimés depuis le planning', 'warning');
                return false;
            }

            // ✅ Supprimer seulement les sessions (ID numérique)
            if (typeof id === 'number') {
                await adminSessionsApi.delete(id);

                // Mettre à jour la liste des événements
                setEvents(prevEvents => prevEvents.filter(event => event.id !== id));

                addToast('Session supprimée avec succès', 'success');
                return true;
            }

            return false;
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
            allDay: false // ✅ Afficher avec les heures
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