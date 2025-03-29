import { CalendarEvent } from '../types/planning';

// Créer une instance axios avec la configuration de base
const api = {
  // Récupérer tous les événements du calendrier pour une période donnée
  getEvents: async (start: Date, end: Date): Promise<CalendarEvent[]> => {
    // Cette fonction sera remplacée par un appel API réel
    return new Promise((resolve) => {
      setTimeout(() => {
        // Générer des événements pour la période demandée
        const demoEvents: CalendarEvent[] = [
          {
            id: 1,
            title: 'Formation Initiale Taxi',
            start: new Date(start.getFullYear(), start.getMonth(), 5, 9, 0),
            end: new Date(start.getFullYear(), start.getMonth(), 5, 17, 0),
            type: 'formation',
            location: 'Centre de formation Rennes',
            instructor: 'Jean Dupont',
            maxParticipants: 12,
            currentParticipants: 8
          },
          {
            id: 2,
            title: 'Examen Théorique',
            start: new Date(start.getFullYear(), start.getMonth(), 12, 10, 0),
            end: new Date(start.getFullYear(), start.getMonth(), 12, 12, 0),
            type: 'exam',
            location: 'Centre d\'examen Rennes',
            maxParticipants: 20,
            currentParticipants: 15
          },
          {
            id: 3,
            title: 'Formation Continue',
            start: new Date(start.getFullYear(), start.getMonth(), 15, 9, 0),
            end: new Date(start.getFullYear(), start.getMonth(), 16, 17, 0),
            type: 'formation',
            location: 'Centre de formation Nantes',
            instructor: 'Marie Lambert',
            maxParticipants: 10,
            currentParticipants: 6
          },
          {
            id: 4,
            title: 'Examen Pratique',
            start: new Date(start.getFullYear(), start.getMonth(), 20, 8, 0),
            end: new Date(start.getFullYear(), start.getMonth(), 20, 18, 0),
            type: 'exam',
            location: 'Centre d\'examen Nantes',
            maxParticipants: 8,
            currentParticipants: 8
          }
        ];
        
        resolve(demoEvents);
      }, 1000);
    });
  },
  
  // Créer un nouvel événement
  createEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    // Cette fonction sera remplacée par un appel API réel
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEvent: CalendarEvent = {
          ...event,
          id: Math.floor(Math.random() * 1000) + 5 // ID aléatoire pour la démo
        };
        resolve(newEvent);
      }, 500);
    });
  },
  
  // Mettre à jour un événement existant
  updateEvent: async (id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    // Cette fonction sera remplacée par un appel API réel
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedEvent: CalendarEvent = {
          id,
          title: event.title || 'Événement sans titre',
          start: event.start || new Date(),
          end: event.end || new Date(),
          type: event.type || 'formation',
          location: event.location || '',
          instructor: event.instructor,
          maxParticipants: event.maxParticipants,
          currentParticipants: event.currentParticipants
        };
        resolve(updatedEvent);
      }, 500);
    });
  },
  
  // Supprimer un événement
  deleteEvent: async (id: number): Promise<boolean> => {
    // Cette fonction sera remplacée par un appel API réel
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },
  
  // Récupérer les formateurs disponibles
  getAvailableInstructors: async (): Promise<string[]> => {
    // Cette fonction sera remplacée par un appel API réel
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['Jean Dupont', 'Marie Lambert', 'Thomas Blanc', 'Sophie Klein']);
      }, 500);
    });
  },
  
  // Récupérer les lieux disponibles
  getAvailableLocations: async (): Promise<string[]> => {
    // Cette fonction sera remplacée par un appel API réel
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['Centre de formation Rennes', 'Centre de formation Nantes', 'Centre d\'examen Rennes', 'Centre d\'examen Nantes']);
      }, 500);
    });
  }
};

export default api;
