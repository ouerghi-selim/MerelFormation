import React from 'react';
import { CalendarEvent } from '../../types/planning';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (id: number) => void;
  availableLocations: string[];
  availableInstructors: string[];
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableLocations,
  availableInstructors
}) => {
  const [formData, setFormData] = React.useState<Partial<CalendarEvent>>({
    title: '',
    start: new Date(),
    end: new Date(),
    type: 'formation',
    location: '',
    instructor: '',
    maxParticipants: 10,
    currentParticipants: 0
  });

  React.useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        start: event.start,
        end: event.end,
        type: event.type,
        location: event.location,
        instructor: event.instructor,
        maxParticipants: event.maxParticipants,
        currentParticipants: event.currentParticipants
      });
    } else {
      // Réinitialiser le formulaire pour un nouvel événement
      const today = new Date();
      const startTime = new Date(today);
      startTime.setHours(9, 0, 0, 0);
      
      const endTime = new Date(today);
      endTime.setHours(17, 0, 0, 0);
      
      setFormData({
        title: '',
        start: startTime,
        end: endTime,
        type: 'formation',
        location: availableLocations[0] || '',
        instructor: '',
        maxParticipants: 10,
        currentParticipants: 0
      });
    }
  }, [event, availableLocations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      const dateType = name === 'startDate' ? 'start' : 'end';
      const timeField = name === 'startDate' ? 'startTime' : 'endTime';
      const currentDate = formData[dateType as keyof typeof formData] as Date;
      const newDate = new Date(value);
      
      // Préserver l'heure actuelle
      newDate.setHours(
        currentDate.getHours(),
        currentDate.getMinutes(),
        0,
        0
      );
      
      setFormData(prev => ({
        ...prev,
        [dateType]: newDate
      }));
    } else if (name === 'startTime' || name === 'endTime') {
      const dateType = name === 'startTime' ? 'start' : 'end';
      const currentDate = formData[dateType as keyof typeof formData] as Date;
      const [hours, minutes] = value.split(':').map(Number);
      
      const newDate = new Date(currentDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        [dateType]: newDate
      }));
    } else if (name === 'maxParticipants' || name === 'currentParticipants') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {event ? 'Modifier l\'événement' : 'Ajouter un événement'}
        </h3>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input 
              type="text" 
              name="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.title || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input 
                type="date" 
                name="startDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.start ? formData.start.toISOString().split('T')[0] : ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début
              </label>
              <input 
                type="time" 
                name="startTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.start ? 
                  `${formData.start.getHours().toString().padStart(2, '0')}:${formData.start.getMinutes().toString().padStart(2, '0')}` 
                  : ''}
                onChange={handleChange}
                required
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
                name="endDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.end ? formData.end.toISOString().split('T')[0] : ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin
              </label>
              <input 
                type="time" 
                name="endTime"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.end ? 
                  `${formData.end.getHours().toString().padStart(2, '0')}:${formData.end.getMinutes().toString().padStart(2, '0')}` 
                  : ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select 
              name="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.type || 'formation'}
              onChange={handleChange}
              required
            >
              <option value="formation">Formation</option>
              <option value="exam">Examen</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <select 
              name="location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.location || ''}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un lieu</option>
              {availableLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          {formData.type === 'formation' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formateur
              </label>
              <select 
                name="instructor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.instructor || ''}
                onChange={handleChange}
              >
                <option value="">Sélectionner un formateur</option>
                {availableInstructors.map((instructor, index) => (
                  <option key={index} value={instructor}>{instructor}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre max. de participants
              </label>
              <input 
                type="number" 
                name="maxParticipants"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.maxParticipants || ''}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participants actuels
              </label>
              <input 
                type="number" 
                name="currentParticipants"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.currentParticipants || '0'}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            
            {event && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            )}
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              {event ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
