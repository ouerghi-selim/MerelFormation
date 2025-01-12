import { Search, Calendar, Clock, Users } from 'lucide-react';
import {Link} from "react-router-dom";

const FormationsPage = () => {
  const formations = [
    {
      id: 1,
      title: 'Formation Initiale Taxi',
      duration: '140h',
      startDate: '15 Février 2024',
      price: '1500€',
      places: '8 places disponibles',
      description: 'Formation complète pour devenir chauffeur de taxi',
    },
    {
      id: 2,
      title: 'Formation Continue',
      duration: '14h',
      startDate: '1 Mars 2024',
      price: '400€',
      places: '12 places disponibles',
      description: 'Formation de mise à jour des connaissances',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la page */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Nos Formations Taxi</h1>
          <p className="text-xl">Découvrez nos programmes de formation certifiants</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Type de formation</option>
                <option>Formation Initiale</option>
                <option>Formation Continue</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Durée</option>
                <option>140 heures</option>
                <option>14 heures</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille des formations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <div key={formation.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{formation.title}</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{formation.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formation.startDate}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{formation.places}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{formation.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-900">{formation.price}</span>
                  <Link to="/formations/initial" className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                    S'inscrire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section des avantages */}
      <div className="bg-gray-100 py-16 mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir nos formations ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-900 font-bold text-xl mb-4">Formation Certifiante</div>
              <p className="text-gray-600">Nos formations sont reconnues par l'État et vous permettent d'obtenir votre carte professionnelle.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-900 font-bold text-xl mb-4">Formateurs Expérimentés</div>
              <p className="text-gray-600">Notre équipe de formateurs possède une solide expérience du métier de chauffeur de taxi.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-900 font-bold text-xl mb-4">Accompagnement Personnalisé</div>
              <p className="text-gray-600">Un suivi individuel tout au long de votre formation pour garantir votre réussite.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationsPage;