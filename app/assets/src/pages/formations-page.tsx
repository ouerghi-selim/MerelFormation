import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import {Link} from "react-router-dom";

interface Formation {
  slug: number;
  id: number;
  title: string;
  duration: string;
  startDate: string;
  price: string;
  places: string;
  description: string;
  type: string;
  isActive: boolean;
}

const FormationsPage = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    type: '',
    title: '',
  });
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    sessionId: null
  });
// Fonction pour afficher le modal avec les sessions
  const handleShowSessions = async (formation: Formation) => {
    setSelectedFormation(formation);

    try {
      // Récupérer les sessions pour cette formation
      const response = await axios.get(`/api/formations/${formation.id}`);
      setSessions(response.data.sessions || []);
      setShowSessionModal(true);
    } catch (err) {
      console.error('Erreur lors de la récupération des sessions:', err);
    }
  };
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('api/formations', {
          params: searchParams
        });
        setFormations(response.data.member || []);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des formations');
        console.error('Error fetching formations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [searchParams]);
  const handleCloseModal = () => {
    setShowSessionModal(false);
    setShowRegistrationForm(false);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams(prev => ({ ...prev, page: 1 }));
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => ({
      ...prev,
      type: event.target.value,
      page: 1
    }));
  };
  const handleRegisterForSession = (sessionId: any) => {
    setRegistrationData(prev => ({ ...prev, sessionId }));
    setShowRegistrationForm(true);
    setShowSessionModal(false);
  };

  const handleRegistrationSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    try {
      await axios.post('/api/registration', registrationData);
      alert("Inscription réussie! Vérifiez votre email.");
      setShowRegistrationForm(false);
    } catch (error) {
      alert("Erreur lors de l'inscription.");
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-blue-900 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Nos Formations Taxi</h1>
            <p className="text-xl">Découvrez nos programmes de formation certifiants</p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher une formation..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchParams.title}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="flex gap-4">
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchParams.type}
                    onChange={handleTypeChange}
                >
                  <option value="">Type de formation</option>
                  <option value="initial">Formation Initiale</option>
                  <option value="continuous">Formation Continue</option>
                  <option value="mobility">Formation Mobilité</option>
                </select>
              </div>
            </form>
          </div>

          {/* Grille des formations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations && formations.length > 0 ? (
                formations.map((formation) => (
                    <div key={formation.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="p-6">
                        <Link to={`/formations/${formation.slug || formation.id}`}>
                          <h3 className="text-xl font-bold mb-2 hover:text-blue-700 transition-colors">
                            {formation.title}
                          </h3>
                        </Link>                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-5 w-5 mr-2" />
                            <span>{formation.duration}h</span>
                          </div>
                          {formation.startDate && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-2" />
                                <span>{new Date(formation.startDate).toLocaleDateString()}</span>
                              </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{formation.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-900">{formation.price}€</span>
                          <button
                              onClick={() => handleShowSessions(formation)}
                              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
                          >
                            S'inscrire
                          </button>
                        </div>
                      </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500">Aucune formation disponible.</div>
            )}
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
        {showRegistrationForm ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                 onClick={handleCloseModal}>
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Inscription</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={handleCloseModal}>✕</button>
                </div>
                <form onSubmit={handleRegistrationSubmit}>
                  <input type="text" placeholder="Nom" className="bg-white text-black border p-2 w-full mb-2"
                         onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})} required/>
                  <input type="email" placeholder="Email" className="border p-2 w-full mb-2"
                         onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})} required/>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 w-full">Envoyer</button>
                </form>
              </div>
            </div>
        ) : null}

        {showSessionModal && selectedFormation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{selectedFormation.title} - Sessions disponibles</h3>
                  <button className="text-gray-500 hover:text-gray-700" onClick={handleCloseModal}>✕</button>
                </div>

                {sessions.length > 0 ? (
                    <div className="space-y-4">
                      {sessions.map(session => (
                          <div key={session.id} className="border p-4 rounded-lg">
                            <div className="flex items-center text-gray-600 mb-2">
                              <Calendar className="h-5 w-5 mr-2" />
                              <span>Du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}</span>
                            </div>
                            <button
                                className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                                onClick={() => handleRegisterForSession(session.id)}
                            >
                              Réserver cette session
                            </button>
                          </div>
                      ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">Aucune session disponible actuellement</p>
                )}
              </div>
            </div>
        )}
      </div>
  );
};
// const handleRegisterForSession = (sessionId: number) => {
//   // Vérifier si l'utilisateur est connecté
//   const token = localStorage.getItem('token');
//   if (!token) {
//     // Rediriger vers la page de connexion
//     window.location.href = `/login?redirect=/reservation/${sessionId}`;
//     return;
//   }
//
//   // Si connecté, rediriger vers une page de confirmation d'inscription
//   window.location.href = `/reservation/${sessionId}`;
// };
export default FormationsPage;