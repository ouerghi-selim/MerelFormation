import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronDown, Eye, Check, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
// @ts-ignore
import axios from 'axios';

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

// @ts-ignore
const ReservationsAdmin: React.FC = () => {
  const [reservations, setReservations] = useState<VehicleReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [ setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<VehicleReservation | null>(null);
  const [ setAvailableVehicles] = useState<string[]>([]);
  const [selectedVehicle] = useState<string>('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        
        // Simuler des données pour le développement
        setTimeout(() => {
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
          setLoading(false);
        }, 1000);
        
        // Commenté pour le développement, à décommenter pour la production
        /*
        const response = await axios.get('/api/admin/reservations', {
          params: {
            search: searchTerm || undefined,
            status: statusFilter || undefined,
            date: dateFilter || undefined
          }
        });
        setReservations(response.data);
        setLoading(false);
        */
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Erreur lors du chargement des réservations');
        setLoading(false);
      }
    };

    fetchReservations();
  }, [searchTerm, statusFilter, dateFilter]);

  const handleViewDetails = async (reservation: VehicleReservation) => {
    setSelectedReservation(reservation);
    
    // Simuler des données pour le développement
    // @ts-ignore
    setAvailableVehicles(['Touran', 'Clio', 'Peugeot 308']);
    
    // Commenté pour le développement, à décommenter pour la production
    /*
    try {
      const response = await axios.get('/api/admin/vehicles/available', {
        params: { date: reservation.date }
      });
      setAvailableVehicles(response.data.map((v: any) => v.model));
    } catch (err) {
      console.error('Error fetching available vehicles:', err);
    }
    */
    
    // @ts-ignore
    setShowDetailModal(true);
  };

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      // Simuler la mise à jour pour le développement
      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
      
      // Commenté pour le développement, à décommenter pour la production
      /*
      await axios.put(`/api/admin/reservations/${reservationId}/status`, { status: newStatus });
      
      // Update the local state
      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
      */
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  // @ts-ignore
  const handleAssignVehicle = async () => {
    if (!selectedReservation || !selectedVehicle) return;
    
    try {
      // Simuler l'assignation pour le développement
      setReservations(reservations.map(r => 
        r.id === selectedReservation.id ? { ...r, vehicleAssigned: selectedVehicle } : r
      ));
      
      // @ts-ignore
      setShowDetailModal(false);
      
      // Commenté pour le développement, à décommenter pour la production
      /*
      await axios.put(`/api/admin/reservations/${selectedReservation.id}/assign-vehicle`, {
        vehicleModel: selectedVehicle
      });
      
      // Update the local state
      setReservations(reservations.map(r => 
        r.id === selectedReservation.id ? { ...r, vehicleAssigned: selectedVehicle } : r
      ));
      
      setShowDetailModal(false);
      */
    } catch (err) {
      console.error('Error assigning vehicle:', err);
      setError('Erreur lors de l\'assignation du véhicule');
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
                        Véhicule assigné
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
                          <div className="text-sm text-gray-500">{reservation.clientEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.examCenter}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{reservation.formula}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {reservation.vehicleAssigned ? (
                            <div className="text-sm text-gray-900">{reservation.vehicleAssigned}</div>
                          ) : (
                            <span className="text-sm text-yellow-600">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status === 'pending' ? 'En attente' : 
                             reservation.status === 'confirmed' ? 'Confirmée' : 
                             reservation.status === 'completed' ? 'Complétée' : 
                             'Annulée'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleViewDetails(reservation)}
                              className="text-blue-700 hover:text-blue-900"
                              title="Voir les détails"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {reservation.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                  className="text-green-600 hover:text-green-800"
                                  title="Confirmer"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-800"
                                  title="Annuler"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
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
    </div>)}

      {/*/!* Modal de détails et d'assignation de véhicule *!/*/}
      {/*{showDetailModal && selectedReservation && (*/}
      {/*  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">*/}
      {/*    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">*/}
      {/*      <h3 className="text-lg font-bold mb-4">Détails de la réservation</h3>*/}
      {/*      */}
      {/*      <div className="space-y-4 mb-6">*/}
      {/*        <div>*/}
      {/*          <h4 className="text-sm font-medium text-gray-500">Client</h4>*/}
      {/*          <p className="text-gray-900">{selectedReservation.clientName}</p>*/}
      {/*          <p className="text-gray-600">{selectedReservation.clientEmail}</p>*/}
      {/*          <p className="text-gray-600">{selectedReservation.clientPhone}</p>*/}
      {/*        </div>*/}
      {/*        */}
      {/*        <div>*/}
      {/*          <h4 className="text-sm font-medium text-gray-500">Date d'examen</h4>*/}
      {/*          <p className="text-gray-<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>*/}
export default ReservationsAdmin;