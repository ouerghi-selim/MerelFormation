import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import { adminPlanningApi, adminFormationsApi } from '../../services/api';

// Types
interface CalendarEvent {
  id: number;
  title: string;
  formation: {
    id: number | undefined;
  };
  start: Date;
  end: Date;
  type: 'formation' | 'exam';
  location: string;
  instructor?: {
    id: number | undefined;
    name?: string;
  };
  maxParticipants: number;
  currentParticipants: number;
}

// Composant pour le formulaire d'événement
const EventForm = ({
                     event,
                     onSave,
                     availableLocations,
                     availableInstructors,
                     formations,
                     onSubmit
                   }: {
  event: CalendarEvent | null;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  availableLocations: string[];
  availableInstructors: {id: number, name: string}[];
  formations: {id: number, title: string}[];
  onSubmit: (submitFn: () => void) => void;
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
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | undefined>(
      event?.instructor?.id
  );
  const [instructorId, setInstructorId] =  useState<number | undefined>(event?.instructor?.id);
  const [maxParticipants, setMaxParticipants] = useState(event?.maxParticipants || 12);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    const newErrors: Record<string, string> = {};

    if (!formationId) newErrors.formation = 'La formation est requise';
    if (!startDate) newErrors.startDate = 'La date de début est requise';
    if (!startTime) newErrors.startTime = 'L\'heure de début est requise';
    if (!endDate) newErrors.endDate = 'La date de fin est requise';
    if (!endTime) newErrors.endTime = 'L\'heure de fin est requise';
    if (!location) newErrors.location = 'Le lieu est requis';
   // if (type === 'formation' && !instructorId) newErrors.instructor = 'Le formateur est requis';
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
  }, [formationId, startDate, startTime, endDate, endTime, location, type, instructorId, maxParticipants]);

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
      instructor: selectedInstructorId ? { id: selectedInstructorId } : undefined,
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
                      const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      setInstructorId(value);
                      setSelectedInstructorId(value); // Conserver aussi dans cet état secondaire
                      console.log("Setting instructorId and selectedInstructorId to:", value);
                    }}             >
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

const PlanningCalendar: React.FC = () => {
  const { addToast } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<{id: number, name: string}[]>([]);
  const [formations, setFormations] = useState<{id: number, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitForm, setSubmitForm] = useState<() => boolean>(() => () => false);

  // Charger les données initiales (formations, lieux et formateurs)
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

        // Pour les lieux, nous utilisons des valeurs statiques en attendant une API
        setAvailableLocations([
          'Centre de formation Rennes',
          'Centre de formation Nantes',
          'Centre d\'examen Rennes',
          'Centre d\'examen Nantes'
        ]);
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

        // Calculer le premier et dernier jour du mois avec une marge
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Ajouter une marge d'un mois avant et après pour avoir les événements des jours précédents/suivants
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month + 2, 0);

        // Format des dates pour l'API (YYYY-MM-DD)
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];

        // Appel API
        const response = await adminPlanningApi.getEvents(startDate, endDate);

        // Convertir les sessions en événements du calendrier
        const mappedEvents = response.data.map((session: any) => ({
          id: session.id,
          title: session.formation.title,
          formation: { id: session.formation.id },
          // S'assurer que les dates sont des objets Date valides
          start: new Date(session.startDate),
          end: new Date(session.endDate),
          type: session.type || 'formation',
          location: session.location,
          instructor: session.instructor ? {
            id: session.instructor.id,
            name: `${session.instructor.firstName} ${session.instructor.lastName}`
          } : undefined,
          maxParticipants: session.maxParticipants,
          currentParticipants: session.participants ? session.participants.length : 0
        }));

        // Trier les événements par date
        mappedEvents.sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());

        setEvents(mappedEvents);
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


  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Gestion des événements
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Gérer la sauvegarde d'un événement (création ou mise à jour)
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
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

      if (selectedEvent) {
        // Mise à jour d'un événement existant
        await adminPlanningApi.updateEvent(selectedEvent.id, sessionData);

        // Mettre à jour la liste des événements
        updatedEvents = events.map(event =>
            event.id === selectedEvent.id ? {...event, ...eventData as CalendarEvent} : event
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

      // Fermer la modal
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Erreur lors de la sauvegarde de la session');
      addToast('Erreur lors de la sauvegarde de la session', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Gérer la suppression d'un événement
  const handleDeleteEvent = async (id: number) => {
    try {
      setIsProcessing(true);

      // Supprimer l'événement via l'API
      await adminPlanningApi.deleteEvent(id);

      // Mettre à jour la liste des événements
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));

      addToast('Session supprimée avec succès', 'success');

      // Fermer la modal
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Erreur lors de la suppression de la session');
      addToast('Erreur lors de la suppression de la session', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Génération du calendrier
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Ajuster pour commencer la semaine le lundi (0 = lundi, 6 = dimanche)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const totalDays = lastDayOfMonth.getDate();
    const totalCells = Math.ceil((totalDays + firstDayOfWeek) / 7) * 7;

    const days = [];

    // Jours du mois précédent
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);

      // Filtrer les événements pour ce jour (vérifier année, mois et jour)
      const dayEvents = events.filter(event =>
          event.start.getDate() === prevMonthDay.getDate() &&
          event.start.getMonth() === prevMonthDay.getMonth() &&
          event.start.getFullYear() === prevMonthDay.getFullYear()
      );

      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        events: dayEvents
      });
    }

    // Jours du mois en cours
    for (let i = 1; i <= totalDays; i++) {
      const currentMonthDay = new Date(year, month, i);

      // Filtrer les événements pour ce jour (vérifier année, mois et jour)
      const dayEvents = events.filter(event =>
          event.start.getDate() === i &&
          event.start.getMonth() === month &&
          event.start.getFullYear() === year
      );

      days.push({
        date: currentMonthDay,
        isCurrentMonth: true,
        events: dayEvents
      });
    }

    // Jours du mois suivant
    const remainingCells = totalCells - (firstDayOfWeek + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);

      // Filtrer les événements pour ce jour (vérifier année, mois et jour)
      const dayEvents = events.filter(event =>
          event.start.getDate() === nextMonthDay.getDate() &&
          event.start.getMonth() === nextMonthDay.getMonth() &&
          event.start.getFullYear() === nextMonthDay.getFullYear()
      );

      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        events: dayEvents
      });
    }

    return days;
  }, [currentDate, events]);

  // Formatage des dates
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Rendu du calendrier
  const calendarDays = generateCalendarDays();
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Modal footer pour l'édition d'événements
  const renderModalFooter = () => (
      <div className="flex justify-between">
        {selectedEvent && (
            <Button
                variant="danger"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                loading={isProcessing}
            >
              Supprimer
            </Button>
        )}
        <div className="flex space-x-3">
          <Button
              variant="outline"
              onClick={() => setShowEventModal(false)}
          >
            Annuler
          </Button>
          <Button
              onClick={() => {
                if (submitForm()) {
                  // Ne rien faire ici, la fonction submitForm s'occupe de tout
                }
              }}
              loading={isProcessing}
          >
            {selectedEvent ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </div>
  );

  return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader
              title="Gestion des plannings"
              breadcrumbItems={[
                { label: 'Admin', path: '/admin' },
                { label: 'Plannings' }
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Barre d'outils du calendrier */}
              <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousMonth}
                      className="p-2 min-w-0"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-xl font-semibold text-gray-800 w-48 text-center">
                    {formatMonthYear(currentDate)}
                  </h2>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextMonth}
                      className="p-2 min-w-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="ml-2"
                  >
                    Aujourd'hui
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                        variant={viewMode === 'month' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('month')}
                        className="rounded-none"
                    >
                      Mois
                    </Button>
                    <Button
                        variant={viewMode === 'week' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                        className="rounded-none"
                    >
                      Semaine
                    </Button>
                    <Button
                        variant={viewMode === 'day' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('day')}
                        className="rounded-none"
                    >
                      Jour
                    </Button>
                  </div>

                  <Button
                      onClick={handleAddEvent}
                      icon={<Plus className="h-4 w-4" />}
                      size="sm"
                  >
                    Ajouter
                  </Button>
                </div>
              </div>

              {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Chargement du calendrier...</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    {/* Vue mensuelle */}
                    {viewMode === 'month' && (
                        <div className="min-w-full">
                          {/* En-têtes des jours de la semaine */}
                          <div className="grid grid-cols-7 border-b">
                            {weekDays.map((day, index) => (
                                <div key={index} className="py-2 text-center text-sm font-medium text-gray-500">
                                  {day}
                                </div>
                            ))}
                          </div>

                          {/* Grille des jours */}
                          <div className="grid grid-cols-7">
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={`min-h-[120px] p-1 border-r border-b ${
                                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                    } ${
                                        day.date.getDate() === new Date().getDate() &&
                                        day.date.getMonth() === new Date().getMonth() &&
                                        day.date.getFullYear() === new Date().getFullYear()
                                            ? 'bg-blue-50'
                                            : ''
                                    }`}
                                >
                                  <div className="text-right p-1">
                            <span className={`text-sm font-medium ${
                                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {day.date.getDate()}
                            </span>
                                  </div>

                                  {/* Événements du jour */}
                                  <div className="space-y-1 mt-1">
                                    {day.events.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => handleEventClick(event)}
                                            className={`px-2 py-1 text-xs rounded truncate cursor-pointer hover:opacity-80 ${
                                                event.type === 'formation'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                            title={`${event.title} - ${formatTime(event.start)} à ${formatTime(event.end)}`}
                                        >
                                          {formatTime(event.start)} - {event.title.length > 15
                                            ? event.title.substring(0, 15) + '...'
                                            : event.title}
                                        </div>
                                    ))}
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* Vue semaine - implémentation de base */}
                    {viewMode === 'week' && (
                        <div className="p-8">
                          <h3 className="text-lg font-semibold mb-4">Vue semaine</h3>
                          <p className="text-gray-500">La vue par semaine sera disponible prochainement.</p>
                        </div>
                    )}

                    {/* Vue jour - implémentation de base */}
                    {viewMode === 'day' && (
                        <div className="p-8">
                          <h3 className="text-lg font-semibold mb-4">Vue jour</h3>
                          <p className="text-gray-500">La vue par jour sera disponible prochainement.</p>
                        </div>
                    )}
                  </div>
              )}
            </div>

            {/* Légende */}
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Formation</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Examen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal d'ajout/édition d'événement */}
        <Modal
            isOpen={showEventModal}
            onClose={() => setShowEventModal(false)}
            title={selectedEvent ? "Modifier l'événement" : "Ajouter un événement"}
            footer={renderModalFooter()}
            maxWidth="max-w-2xl"
        >
          <EventForm
              event={selectedEvent}
              onSave={handleSaveEvent}
              availableLocations={availableLocations}
              availableInstructors={availableInstructors}
              formations={formations || []}
              onSubmit={(submitFn) => {
                setSubmitForm(() => submitFn);
              }}
          />
        </Modal>
      </div>
  );
};

export default PlanningCalendar;