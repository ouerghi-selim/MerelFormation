export interface CalendarEvent {
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

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}
