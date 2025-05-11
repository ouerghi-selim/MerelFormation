// src/pages/admin/PlanningCalendar/calendarConfig.ts
import { BigCalendarEvent } from './types';

// Messages en français pour React Big Calendar
export const messages = {
    allDay: 'Journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd\'hui',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    showMore: (total: number) => `+ ${total} de plus`
};

// Personnalisation des événements
export const eventStyleGetter = (event: BigCalendarEvent) => {
    // Déterminer si l'événement est complet
    const isEventFull = event.currentParticipants >= event.maxParticipants;

    // Style de base pour les formations
    if (event.type === 'formation') {
        if (isEventFull) {
            // Formation complète
            return {
                style: {
                    backgroundColor: '#FEF2F2', // Rouge pâle
                    color: '#B91C1C',          // Rouge foncé
                    border: '1px solid #FCA5A5',
                    borderRadius: '4px',
                    opacity: 0.9,
                    display: 'block',
                    overflow: 'hidden'
                }
            };
        } else {
            // Formation normale
            return {
                style: {
                    backgroundColor: '#EBF5FF', // Bleu pâle
                    color: '#1E40AF',         // Bleu foncé
                    border: '1px solid #93C5FD',
                    borderRadius: '4px',
                    opacity: 0.9,
                    display: 'block',
                    overflow: 'hidden'
                }
            };
        }
    }
    // Style pour les examens
    else if (event.type === 'exam') {
        return {
            style: {
                backgroundColor: '#E6F4EA', // Vert pâle
                color: '#0C5A31',         // Vert foncé
                border: '1px solid #A7F3D0',
                borderRadius: '4px',
                opacity: 0.9,
                display: 'block',
                overflow: 'hidden'
            }
        };
    }

    // Style par défaut
    return {
        style: {
            backgroundColor: '#F3F4F6',
            color: '#374151',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            opacity: 0.9,
            display: 'block',
            overflow: 'hidden'
        }
    };
};

// Liste des lieux disponibles (à déplacer vers l'API plus tard)
export const DEFAULT_LOCATIONS = [
    'Centre de formation Rennes',
    'Centre de formation Nantes',
    'Centre d\'examen Rennes',
    'Centre d\'examen Nantes'
];