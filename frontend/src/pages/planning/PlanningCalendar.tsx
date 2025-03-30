import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import EventModal from '../../components/planning/EventModal';
import planningApi from '../../services/planningApi';
import { CalendarEvent } from '../../types/planning';

const PlanningCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Charger les lieux et formateurs disponibles
        const locations = await planningApi.getAvailableLocations();
        const instructors = await planningApi.getAvailableInstructors();
        
        setAvailableLocations(locations);
        setAvailableInstructors(instructors);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Erreur lors du chargement des données initiales');
      }
    };

    fetchInitialData();
  }, []);

  // Charger les événements du calendrier
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Calculer le premier et dernier jour du mois
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Récupérer les événements pour la période
        const fetchedEvents = await planningApi.getEvents(firstDay, lastDay);
        setEvents(fetchedEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Erreur lors du chargement des événements');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

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
      
      if (selectedEvent) {
        // Mise à jour d'un événement existant
        const updatedEvent = await planningApi.updateEvent(selectedEvent.id, eventData);
        
        // Mettre à jour la liste des événements
        setEvents(events.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ));
        
        setSuccessMessage('Événement mis à jour avec succès');
      } else {
        // Création d'un nouvel événement
        const newEvent = await planningApi.createEvent(eventData as Omit<CalendarEvent, 'id'>);
        
        // Ajouter le nouvel événement à la liste
        setEvents([...events, newEvent]);
        
        setSuccessMessage('Événement créé avec succès');
      }
      
      // Fermer la modal
      setShowEventModal(false);
      setSelectedEvent(null);
      setIsProcessing(false);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Erreur lors de la sauvegarde de l\'événement');
      setIsProcessing(false);
    }
  };

  // Gérer la suppression d'un événement
  const handleDeleteEvent = async (id: number) => {
    try {
      setIsProcessing(true);
      
      // Supprimer l'événement
      const success = await planningApi.deleteEvent(id);
      
      if (success) {
        // Mettre à jour la liste des événements
        setEvents(events.filter(event => event.id !== id));
        
        setSuccessMessage('Événement supprimé avec succès');
      } else {
        setError('Erreur lors de la suppression de l\'événement');
      }
      
      // Fermer la modal
      setShowEventModal(false);
      setSelectedEvent(null);
      setIsProcessing(false);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Erreur lors de la suppression de l\'événement');
      setIsProcessing(false);
    }
  };

  // Génération du calendrier
  const generateCalendarDays = () => {
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
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        events: events.filter(event => 
          event.start.getDate() === prevMonthDay.getDate() &&
          event.start.getMonth() === prevMonthDay.getMonth() &&
          event.start.getFullYear() === prevMonthDay.getFullYear()
        )
      });
    }
    
    // Jours du mois en cours
    for (let i = 1; i <= totalDays; i++) {
      const currentMonthDay = new Date(year, month, i);
      days.push({
        date: currentMonthDay,
        isCurrentMonth: true,
        events: events.filter(event => 
          event.start.getDate() === i &&
          event.start.getMonth() === month &&
          event.start.getFullYear() === year
        )
      });
    }
    
    // Jours du mois suivant
    const remainingCells = totalCells - (firstDayOfWeek + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        events: events.filter(event => 
          event.start.getDate() === nextMonthDay.getDate() &&
          event.start.getMonth() === nextMonthDay.getMonth() &&
          event.start.getFullYear() === nextMonthDay.getFullYear()
        )
      });
    }
    
    return days;
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Gestion des plannings" />
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
              <button 
                className="text-sm underline mt-1"
                onClick={() => setError(null)}
              >
                Fermer
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p>{successMessage}</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Barre d'outils du calendrier */}
            <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-800 w-48 text-center">
                  {formatMonthYear(currentDate)}
                </h2>
                <button 
                  onClick={goToNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
                <button 
                  onClick={goToToday}
                  className="ml-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  Aujourd'hui
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex border rounded-md overflow-hidden">
                  <button 
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-blue-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    Mois
                  </button>
                  <button 
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-blue-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    Semaine
                  </button>
                  <button 
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 text-sm ${viewMode === 'day' ? 'bg-blue-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    Jour
                  </button>
                </div>
                
                <button 
                  onClick={handleAddEvent}
                  className="flex items-center px-3 py-1 bg-blue-700 text-white rounded-md hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </button>
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
                    <div className="grid grid-cols-7 border-b">
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
                                className={`px-2 py-1 text-xs rounded truncate cursor-pointer ${
                                  event.type === 'formation' 
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {formatTime(event.start)} - {event.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Vue semaine et jour à implémenter */}
                {viewMode === 'week' && (
                  <div className="p-8 text-center text-gray-500">
                    Vue semaine à implémenter
                  </div>
                )}
                
                {viewMode === 'day' && (
                  <div className="p-8 text-center text-gray-500">
                    Vue jour à implémenter
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
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          availableLocations={availableLocations}
          availableInstructors={availableInstructors}
        />
      )}
      
      {/* Overlay de chargement pendant le traitement */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-700">Traitement en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningCalendar;
