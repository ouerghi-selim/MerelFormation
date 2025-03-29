import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronDown, Eye, Check, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminReservationsApi } from '../../services/api';

interface VehicleReservation {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  examCenter: string;
  formula: string;
  status: string;
  vehicleAssigned: string | null;
}

const ReservationsAdmin: React.FC = () => {
  const [reservations, setReservations] = useState<VehicleReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<VehicleReservation | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);

        // Utilisation des appels API réels
        const response = await adminReservationsApi.getAll();
        setReservations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Erreur lors du chargement des réservations');
        setLoading(false);
        
        // Données de secours en cas d'erreur (pour le développement)
        const mockReservations: VehicleReservation[] = [
          {
            id: 1,
            clientName: 'Sophie Klein',
            clientEmail: 'sophie.klein@example.com',
            clientPhone: '06 12 34 56 78',
            date: '15/03/2025',
            examCenter: 'Rennes',
            formula: 'Examen pratique (2h)',
            status: 'pending',
            vehicleAssigned: null
          },
          {
            id: 2,
            clientName: 'Kevin Robert',
            clientEmail: 'kevin.robert@example.com',
            clientPhone: '06 23 45 67 89',
            date: '14/03/2025',
            examCenter: 'Nantes',
            formula: 'Examen pratique (2h)',
            status: 'confirmed',
            vehicleAssigned: 'Touran'
          },
          {
            id: 3,
            clientName: 'Thomas Blanc',
            clientEmail: 'thomas.blanc@example.com',
            clientPhone: '06 34 56 78 90',
            date: '12/03/2025',
            examCenter: 'Rennes',
            formula: 'Préparation examen (1h)',
            status: 'completed',
            vehicleAssigned: 'Clio'
          },
          {
            id: 4,
            clientName: 'Julie Moreau',
            clientEmail: 'julie.moreau@example.com',
            clientPhone: '06 45 67 89 01',
            date: '10/03/2025',
            examCenter: 'Nantes',
            formula: 'Examen pratique (2h)',
            status: 'cancelled',
            vehicleAssigned: null
          }
        ];
        
        setReservations(mockReservations);
      }
    };

    fetchReservations();
  }, [searchTerm, statusFilter, dateFilter]);

  const handleViewDetails = async (reservation: VehicleReservation) => {
    setSelectedReservation(reservation);

    try {
      // Utilisation des appels API réels
      const response = await adminReservationsApi.getAvailableVehicles();
      setAvailableVehicles(response.data.map((v: any) => v.model));
    } catch (err) {
      console.error('Error fetching available vehicles:', err);
      // Données de secours en cas d'erreur
      setAvailableVehicles(['Touran', 'Clio', 'Peugeot 308']);
    }

    setShowDetailModal(true);
  };

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      // Utilisation des appels API réels
      await adminReservationsApi.updateStatus(reservationId, newStatus);
      
      // Mise à jour de l'état local
      setReservations(reservations.map(r =>
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Erreur lors de la mise à jour du statut');
      
      // Mise à jour de l'état local même en cas d'erreur (pour le développement)
      setReservations(reservations.map(r =>
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedReservation || !selectedVehicle) return;

    try {
      // Utilisation des appels API réels
      await adminReservationsApi.assignVehicle(selectedReservation.id, parseInt(selectedVehicle));
      
      // Mise à jour de l'état local
      setReservations(reservations.map(r =>
        r.id === selectedReservation.id ? { ...r, vehicleAssigned: selectedVehicle } : r
      ));
      
      setShowDetailModal(false);
    } catch (err) {
      console.error('Error assigning vehicle:', err);
      setError('Erreur lors de l\'assignation du véhicule');
      
      // Mise à jour de l'état local même en cas d'erreur (pour le développement)
      setReservations(reservations.map(r =>
        r.id === selectedReservation.id ? { ...r, vehicleAssigned: selectedVehicle } : r
      ));
      
      setShowDetailModal(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Gestion des réservations de véhicule" />

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="text-xl font-bold text-gray-800">
              Demandes de réservation
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-3 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="completed">Complétée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
              </div>

              <div className="relative w-full md:w-48">
                <Calendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-700">Chargement des réservations...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-700">Aucune réservation trouvée</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'examen
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Centre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formule
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Véhicule
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{reservation.clientName}</div>
                          <div className="text-xs text-gray-500">{reservation.clientEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.examCenter}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.formula}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reservation.vehicleAssigned || 'Non assigné'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {reservation.status === 'pending' ? 'En attente' : 
                             reservation.status === 'confirmed' ? 'Confirmée' : 
                             reservation.status === 'completed' ? 'Terminée' :
                             'Annulée'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleViewDetails(reservation)}
                              className="text-blue-700 hover:text-blue-900"
                              title="Voir détails"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {reservation.status === 'pending' && (
                              <button 
                                onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Confirmer"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                            )}
                            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                              <button 
                                onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Annuler"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de détails et assignation de véhicule */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Détails de la réservation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{selectedReservation.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{selectedReservation.clientPhone}</p>
                <p className="text-sm">{selectedReservation.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'examen</p>
                <p className="font-medium">{selectedReservation.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Centre d'examen</p>
                <p className="font-medium">{selectedReservation.examCenter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Formule</p>
                <p className="font-medium">{selectedReservation.formula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedReservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      selectedReservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      selectedReservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {selectedReservation.status === 'pending' ? 'En attente' : 
                     selectedReservation.status === 'confirmed' ? 'Confirmée' : 
                     selectedReservation.status === 'completed' ? 'Terminée' :
                     'Annulée'}
                  </span>
                </p>
              </div>
            </div>
            
            {(selectedReservation.status === 'pending' || selectedReservation.status === 'confirmed') && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Assigner un véhicule</h4>
                <div className="flex space-x-3">
                  <select 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {availableVehicles.map((vehicle, index) => (
                      <option key={index} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAssignVehicle}
                    disabled={!selectedVehicle}
                    className={`px-4 py-2 rounded-lg ${
                      selectedVehicle 
                        ? 'bg-blue-700 text-white hover:bg-blue-800' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Assigner
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Fermer
              </button>
              {selectedReservation.status === 'pending' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedReservation.id, 'confirmed');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirmer
                </button>
              )}
              {(selectedReservation.status === 'pending' || selectedReservation.status === 'confirmed') && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedReservation.id, 'cancelled');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsAdmin;
