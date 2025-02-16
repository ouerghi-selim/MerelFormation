import { useState, useEffect } from 'react';
import { Calendar, Car, CreditCard } from 'lucide-react';
import axios from 'axios';

interface Vehicle {
  id: number;
  model: string;
  category: string;
  dailyRate: number;
  description?: string;
  plate: string;
  year: number;
  status: 'available' | 'rented' | 'maintenance';
  isActive: boolean;
}

const LocationPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    category: '',
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/vehicles';

        // Si une date est sélectionnée, utiliser l'endpoint available
        if (searchParams.startDate) {
          endpoint = '/api/vehicles/available';
        }

        const response = await axios.get(endpoint, { params: searchParams });

        // Adapter la récupération des données
        setVehicles(response.data.member || []); // 👈 Corrigé ici
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des véhicules');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [searchParams]);

  const handleSearch = () => {
    if (!searchParams.startDate) {
      setError('Veuillez sélectionner une date de début');
      return;
    }
    setSearchParams(prev => ({ ...prev }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Location de Véhicules</h1>
          <p className="text-xl">Véhicules professionnels pour chauffeurs de taxi</p>
        </div>
      </div>

      {/* Système de recherche et filtres */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Car className="absolute left-3 top-3 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchParams.category}
                onChange={(e) => setSearchParams(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Type de véhicule</option>
                <option value="berline">Berline</option>
                <option value="monospace">Monospace</option>
                <option value="suv">SUV</option>
              </select>
            </div>
            <button 
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
              onClick={handleSearch}
            >
              Rechercher
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-500">{error}</div>
          )}
        </div>

        {/* Liste des véhicules */}
        <div className="grid md:grid-cols-2 gap-6">
          {vehicles && vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{vehicle.model}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <Car className="h-5 w-5 mr-2" />
                  <span>{vehicle.category}</span>
                </div>
                <p className="text-gray-600 mb-4">{vehicle.description || `${vehicle.model} ${vehicle.year}`}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Année: {vehicle.year}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Statut: {vehicle.status === 'available' ? 'Disponible' : 'Indisponible'}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div>
                    <span className="text-3xl font-bold text-blue-900">{vehicle.dailyRate}€/jour</span>
                  </div>
                  <button 
                    className={`${
                      vehicle.status === 'available' 
                        ? 'bg-blue-900 hover:bg-blue-800' 
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white px-6 py-2 rounded-lg flex items-center`}
                    disabled={vehicle.status !== 'available'}
                  >
                    <CreditCard className="mr-2" />
                    {vehicle.status === 'available' ? 'Réserver' : 'Indisponible'}
                  </button>
                </div>
              </div>
            </div>
          ))
          ) : (
              <div className="text-center text-gray-500">Aucun véhicule disponible.</div>
                )}
        </div>
      </div>

      {/* Section d'information */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Choisissez votre véhicule</h3>
              <p className="text-gray-600">Sélectionnez le véhicule qui correspond à vos besoins</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Réservez en ligne</h3>
              <p className="text-gray-600">Effectuez votre réservation en quelques clics</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Retirez le véhicule</h3>
              <p className="text-gray-600">Récupérez votre véhicule à l'agence</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold mb-2">Roulez en toute sérénité</h3>
              <p className="text-gray-600">Profitez de votre véhicule en toute tranquillité</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section contact */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-blue-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'aide ?</h2>
          <p className="mb-6">Notre équipe est à votre disposition pour répondre à vos questions</p>
          <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            Contactez-nous
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;