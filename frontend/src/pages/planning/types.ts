export interface Instructor {
    id: number;
    name: string;
}

export interface Formation {
    id: number;
    title: string;
}

export interface CalendarEvent {
    id: number | string; // Peut être une string pour les examens
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
    vehicleAssigned?: string; // Pour les examens
    clientName?: string; // Pour les examens
}

// Événement formaté pour react-big-calendar
export interface BigCalendarEvent extends CalendarEvent {
    resourceId?: number;
    allDay: boolean;
}

export interface FormErrors {
    formation?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    instructor?: string;
    maxParticipants?: string;
}