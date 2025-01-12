import {  Calendar, Car,  CreditCard } from 'lucide-react';

const LocationPage = () => {
  const vehicles = [
    {
      id: 1,
      name: 'Toyota Camry Hybride',
      type: 'Berline',
      price: '120€/jour',
      description: 'Véhicule hybride confortable et économique',
      features: ['Automatique', 'Climatisation', 'GPS intégré'],
      available: true
    },
    {
      id: 2,
      name: 'Peugeot 508',
      type: 'Berline',
      price: '100€/jour',
      description: 'Berline française élégante et spacieuse',
      features: ['Automatique', 'Climatisation', 'Caméra de recul'],
      available: true
    }
  ];

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
              />
            </div>
            <div className="relative">
              <Car className="absolute left-3 top-3 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Type de véhicule</option>
                <option>Berline</option>
                <option>Monospace</option>
                <option>SUV</option>
              </select>
            </div>
            <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
              Rechercher
            </button>
          </div>
        </div>

        {/* Liste des véhicules */}
        <div className="grid md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{vehicle.name}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <Car className="h-5 w-5 mr-2" />
                  <span>{vehicle.type}</span>
                </div>
                <p className="text-gray-600 mb-4">{vehicle.description}</p>
                <div className="space-y-2 mb-4">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div>
                    <span className="text-3xl font-bold text-blue-900">{vehicle.price}</span>
                  </div>
                  <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 flex items-center">
                    <CreditCard className="mr-2" />
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          ))}
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