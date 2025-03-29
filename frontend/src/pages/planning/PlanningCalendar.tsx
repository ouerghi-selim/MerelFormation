import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

// Cette interface sera étendue lorsque nous intégrerons avec l'API
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'formation' | 'exam';
  location: string;
  instructor?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}

const PlanningCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Données de démonstration pour le calendrier
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Simuler un appel API
        setTimeout(() => {
          // Générer des événements pour le mois en cours
          const today = new Date();
          const demoEvents: CalendarEvent[] = [
            {
              id: 1,
              title: 'Formation Initiale Taxi',
              start: new Date(today.getFullYear(), today.getMonth(), 5, 9, 0),
              end: new Date(today.getFullYear(), today.getMonth(), 5, 17, 0),
              type: 'formation',
              location: 'Centre de formation Rennes',
              instructor: 'Jean Dupont',
              maxParticipants: 12,
              currentParticipants: 8
            },
            {
              id: 2,
              title: 'Examen Théorique',
              start: new Date(today.getFullYear(), today.getMonth(), 12, 10, 0),
              end: new Date(today.getFullYear(), today.getMonth(), 12, 12, 0),
              type: 'exam',
              location: 'Centre d\'examen Rennes',
              maxParticipants: 20,
              currentParticipants: 15
            },
            {
              id: 3,
              title: 'Formation Continue',
              start: new Date(today.getFullYear(), today.getMonth(), 15, 9, 0),
              end: new Date(today.getFullYear(), today.getMonth(), 16, 17, 0),
              type: 'formation',
              location: 'Centre de formation Nantes',
              instructor: 'Marie Lambert',
              maxParticipants: 10,
              currentParticipants: 6
            },
            {
              id: 4,
              title: 'Examen Pratique',
              start: new Date(today.getFullYear(), today.getMonth(), 20, 8, 0),
              end: new Date(today.getFullYear(), today.getMonth(), 20, 18, 0),
              type: 'exam',
              location: 'Centre d\'examen Nantes',
              maxParticipants: 8,
              currentParticipants: 8
            }
          ];
          
          setEvents(demoEvents);
          setLoading(false);
        }, 1000);
        
        // À terme, nous utiliserons un appel API réel
        // const response = await axios.get('/api/planning/events', {
        //   params: {
        //     start: startOfMonth(currentDate),
        //     end: endOfMonth(currentDate)
        //   }
        // });
        // setEvents(response.data);
        // setLoading(false);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {selectedEvent ? 'Modifier l\'événement' : 'Ajouter un événement'}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={selectedEvent?.title || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedEvent?.start.toISOString().split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de début
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedEvent?.start.toTimeString().slice(0, 5) || ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedEvent?.end.toISOString().split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fin
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedEvent?.end.toTimeString().slice(0, 5) || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={selectedEvent?.type || 'formation'}
                >
                  <option value="formation">Formation</option>
                  <option value="exam">Examen</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={selectedEvent?.location || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formateur
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={selectedEvent?.instructor || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre max. de participants
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedEvent?.maxParticipants || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participants actuels
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedEvent?.currentParticipants || '0'}
                  />
                </div>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              
              {selectedEvent && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer
                </button>
              )}
              
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
              >
                {selectedEvent ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningCalendar;
