import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import EventForm from './EventForm';
import { usePlanningData } from './usePlanningData';
import { messages, eventStyleGetter } from './calendarConfig';
import { CalendarEvent } from './types';
import SessionForm from '../../components/admin/SessionForm';
import { adminSessionsApi } from '../../services/api';


// Configuration de moment en français
moment.locale('fr');
const localizer = momentLocalizer(moment);

const PlanningCalendar: React.FC = () => {
    const {
        currentDate,
        setCurrentDate,
        calendarEvents,
        availableLocations,
        availableInstructors,
        formations,
        loading,
        error,
        setError,
        isProcessing,
        saveEvent,
        deleteEvent
    } = usePlanningData();

    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [submitForm, setSubmitForm] = useState<() => boolean>(() => () => false);

    // ✅ Vérifier si l'événement sélectionné est un examen
    const isExamEvent = selectedEvent && typeof selectedEvent.id === 'string' && selectedEvent.id.startsWith('exam-');

    // Gestion des événements
    const handleEventClick = (event: any) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const handleAddEvent = () => {
        setSelectedEvent(null);
        setShowEventModal(true);
    };

    const handleSaveEvent = async (sessionData: any) => {
        try {
            // Utiliser la même API que SessionForm
            await adminSessionsApi.update(sessionData.id, {
                ...sessionData,
                instructors: sessionData.instructors
            });
            setShowEventModal(false);
            setSelectedEvent(null);
            // Recharger les données du planning
            window.location.reload(); // Simple refresh pour voir les changements
        } catch (error) {
            console.error('Error updating session from planning:', error);
        }
    };

    const handleDeleteEvent = async (id: number | string) => {
        const success = await deleteEvent(id);
        if (success) {
            setShowEventModal(false);
            setSelectedEvent(null);
        }
    };

    // Modal footer pour l'édition d'événements
    const renderModalFooter = () => (
        <div className="flex justify-between">
            {selectedEvent && !isExamEvent && (
                <Button
                    variant="danger"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    loading={isProcessing}
                >
                    Supprimer
                </Button>
            )}

            {/* ✅ Message pour les examens */}
            {isExamEvent && (
                <div className="text-sm text-gray-500 italic">
                    Les examens doivent être gérés depuis la section "Réservations"
                </div>
            )}

            <div className="flex space-x-3">
                <Button
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                >
                    {isExamEvent ? 'Fermer' : 'Annuler'}
                </Button>

                {/* ✅ Masquer le bouton de sauvegarde pour les examens */}
                {!isExamEvent && (
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
                )}
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
                        <div className="p-4 border-b flex flex-row justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <p><strong>Note :</strong> Ce planning affiche uniquement les sessions programmées et les examens confirmés.</p>
                                <p>Les examens doivent être gérés depuis la section "Réservations".</p>
                            </div>
                            <Button
                                onClick={handleAddEvent}
                                icon={<Plus className="h-4 w-4"/>}
                                size="sm"
                            >
                                Ajouter une session
                            </Button>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
                                <p className="mt-4 text-gray-700">Chargement du calendrier...</p>
                            </div>
                        ) : (
                            <div style={{height: '700px'}}>
                                <Calendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{height: '100%'}}
                                    views={['month', 'week', 'day']}
                                    defaultView="month"
                                    date={currentDate}
                                    onNavigate={date => setCurrentDate(date)}
                                    onView={(newView) => setViewMode(newView as 'month' | 'week' | 'day')}
                                    messages={messages}
                                    eventPropGetter={eventStyleGetter}
                                    onSelectEvent={handleEventClick}
                                    popup
                                    selectable
                                    onSelectSlot={(slotInfo) => {
                                        setSelectedEvent(null);
                                        setShowEventModal(true);
                                    }}
                                    // ✅ Format des événements dans le tooltip
                                    components={{
                                        event: ({ event }) => (
                                            <div className="text-xs">
                                                <div className="font-semibold">{event.title}</div>
                                                <div>{event.location}</div>
                                                {event.type === 'exam' && event.clientName && (
                                                    <div>Client: {event.clientName}</div>
                                                )}
                                                {event.type === 'formation' && (
                                                    <div>{event.currentParticipants}/{event.maxParticipants} participants</div>
                                                )}
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Légende */}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Session de formation</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Examen confirmé</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Session complète</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'ajout/édition d'événement */}
            <Modal
                isOpen={showEventModal}
                onClose={() => setShowEventModal(false)}
                title={
                    isExamEvent
                        ? "Détails de l'examen"
                        : selectedEvent
                            ? "Modifier la session"
                            : "Ajouter une session"
                }
                footer={renderModalFooter()}
                maxWidth="max-w-2xl"
            >
                <SessionForm
                    mode="planning"
                    session={selectedEvent}
                    onSave={handleSaveEvent}
                    onCancel={() => setShowEventModal(false)}
                    isOpen={showEventModal}
                    isExamEvent={isExamEvent}
                />
            </Modal>
        </div>
    );
};

export default PlanningCalendar;