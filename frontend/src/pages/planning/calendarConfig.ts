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

// Définition des couleurs par statut de session
export const statusColors = {
    scheduled: {
        background: '#EBF5FF', // Bleu pâle
        color: '#1E40AF',       // Bleu foncé
        border: '#93C5FD',      // Bleu moyen
        label: 'Programmée'
    },
    ongoing: {
        background: '#F0FDF4', // Vert pâle
        color: '#15803D',       // Vert foncé
        border: '#86EFAC',      // Vert moyen
        label: 'En cours'
    },
    completed: {
        background: '#F3F4F6', // Gris pâle
        color: '#374151',       // Gris foncé
        border: '#D1D5DB',      // Gris moyen
        label: 'Terminée'
    },
    cancelled: {
        background: '#FEF2F2', // Rouge pâle
        color: '#B91C1C',       // Rouge foncé
        border: '#FCA5A5',      // Rouge moyen
        label: 'Annulée'
    },
    exam: {
        background: '#E6F4EA', // Vert lime pâle
        color: '#0C5A31',       // Vert lime foncé
        border: '#A7F3D0',      // Vert lime moyen
        label: 'Examen'
    }
};

// Personnalisation des événements
export const eventStyleGetter = (event: BigCalendarEvent) => {
    // Déterminer si l'événement est complet
    const isEventFull = event.currentParticipants >= event.maxParticipants;

    // Style pour les examens
    if (event.type === 'exam') {
        const colors = statusColors.exam;
        return {
            style: {
                backgroundColor: colors.background,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                opacity: 0.9,
                display: 'block',
                overflow: 'hidden',
                fontWeight: '600'
            }
        };
    }

    // Style pour les formations selon le statut
    if (event.type === 'formation') {
        let colors;

        // Couleur selon le statut uniquement
        switch (event.status) {
            case 'ongoing':
                colors = statusColors.ongoing;
                break;
            case 'completed':
                colors = statusColors.completed;
                break;
            case 'cancelled':
                colors = statusColors.cancelled;
                break;
            case 'scheduled':
            default:
                colors = statusColors.scheduled;
                break;
        }

        return {
            style: {
                backgroundColor: colors.background,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                opacity: 0.9,
                display: 'block',
                overflow: 'hidden',
                fontWeight: '500',
                position: 'relative'
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