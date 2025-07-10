export interface Instructor {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    specialization?: string;
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
    startDate?: string; // Format ISO pour l'API
    endDate?: string;   // Format ISO pour l'API
    type: 'formation' | 'exam';
    location: string;
    instructor?: {
        id: number | undefined;
        name?: string;
    };
    instructors?: Array<{
        id: number;
        firstName: string;
        lastName: string;
        specialization?: string;
    }>;
    maxParticipants: number;
    currentParticipants: number;
    status?: string;
    notes?: string | null;
    vehicleAssigned?: string; // Pour les examens
    clientName?: string; // Pour les examens
    // Documents pour les sessions
    documents?: Array<{
        id: number;
        title: string;
        type: string;
        fileSize: string;
        downloadUrl: string;
    }>;
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
    status?: string;
    notes?: string;
}