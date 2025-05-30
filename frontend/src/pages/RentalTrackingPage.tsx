import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Car, 
  Clock, 
  DollarSign, 
  Phone, 
  User, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Home,
  RefreshCw
} from 'lucide-react';
import { 
  trackRental, 
  getStatusColor, 
  getStatusText, 
  getStatusIcon,
  VehicleRentalTracking 
} from '../services/vehicleRentalTrackingService';

const RentalTrackingPage: React.FC = () => {
  const { trackingToken } = useParams<{ trackingToken: string }>();
  const [rental, setRental] = useState<VehicleRentalTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRental = async () => {
    if (!trackingToken) return;
    
    try {
      setRefreshing(true);
      const data = await trackRental(trackingToken);
      setRental(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error('Error tracking rental:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRental();
  }, [trackingToken]);

  const handleRefresh = () => {
    fetchRental();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chargement du suivi...</h3>
          <p className="mt-2 text-gray-500">Récupération des informations de votre réservation</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Réservation introuvable
            </h3>
            <p className="text-gray-500 mb-6">
              {error || 'Le lien de suivi est invalide ou a expiré.'}
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleRefresh}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
              <Link 
                to="/" 
                className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Suivi de réservation
                </h1>
                <p className="text-gray-500">
                  Réservation #{rental.id} • {rental.customerName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <Link 
                to="/" 
                className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Link>
            </div>
          </div>

          {/* Status principal */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(rental.status)}`}>
            <span className="text-2xl mr-2">{getStatusIcon(rental.status)}</span>
            <span className="font-medium text-lg">{getStatusText(rental.status)}</span>
          </div>
        </div>

        {/* Timeline des statuts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Historique de votre demande
          </h2>
          <div className="space-y-4">
            {rental.statusHistory.map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  item.status === rental.status 
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {item.status === 'pending' && <AlertCircle className="h-4 w-4" />}
                  {item.status === 'confirmed' && <CheckCircle className="h-4 w-4" />}
                  {item.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                  {item.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      item.status === rental.status ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du véhicule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Car className="mr-2 h-5 w-5 text-blue-600" />
              Véhicule réservé
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Modèle</label>
                <p className="text-lg font-medium text-gray-900">{rental.vehicle.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Plaque d'immatriculation</label>
                <p className="text-gray-900 font-mono">{rental.vehicle.plate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Catégorie</label>
                <p className="text-gray-900">{rental.vehicle.category}</p>
              </div>
            </div>
          </div>

          {/* Dates et prix */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Détails de la réservation
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Début de location</label>
                <p className="text-gray-900">
                  {new Date(rental.startDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fin de location</label>
                <p className="text-gray-900">
                  {new Date(rental.endDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Prix total</label>
                <p className="text-2xl font-bold text-green-600">{rental.totalPrice}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-purple-600" />
            Vos informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Nom</label>
                <p className="text-gray-900">{rental.customerName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{rental.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-gray-900">{rental.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations examen */}
        {rental.examTime && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
              <FileText className="mr-2 h-5 w-5" />
              Réservation pour examen
            </h2>
            <div className="bg-white rounded-lg p-4">
              <label className="block text-sm font-medium text-purple-600 mb-1">Date d'examen</label>
              <p className="text-lg font-medium text-purple-900">
                {new Date(rental.examTime).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {(rental.notes || rental.adminNotes) && (
          <div className="space-y-4 mt-6">
            {rental.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-amber-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Vos notes
                </h3>
                <p className="text-amber-900 bg-white rounded p-3">{rental.notes}</p>
              </div>
            )}
            
            {rental.adminNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Informations de l'équipe
                </h3>
                <p className="text-blue-900 bg-white rounded p-3">{rental.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Réservation créée le {new Date(rental.createdAt).toLocaleDateString('fr-FR')} à {new Date(rental.createdAt).toLocaleTimeString('fr-FR')}
          </p>
          <p className="text-xs text-gray-400">
            Conservez ce lien pour suivre l'évolution de votre demande • MerelFormation
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentalTrackingPage;