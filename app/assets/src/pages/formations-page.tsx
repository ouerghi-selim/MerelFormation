import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Filter, Users, Book, ChevronRight, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from "react-router-dom";

interface Formation {
  slug: number;
  id: number;
  title: string;
  duration: string | number;
  startDate: string;
  price: string | number;
  places: string;
  description: string;
  type: string;
  isActive: boolean;
}

const FormationsPage = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    title: '',
    type: '',
  });
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
  const [totalFormations, setTotalFormations] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
        // Construire les paramètres dans le format attendu par l'API
        const apiParams: any = {
          'page': searchParams.page,
          'limit': searchParams.limit
        };
        // N'ajouter les filtres que s'ils ont une valeur
        if (searchParams.title) {
          apiParams['title'] = searchParams.title;
        }

        if (searchParams.type) {
          apiParams['type'] = searchParams.type;
        }

        console.log("Sending request with params:", apiParams);
        const response = await axios.get('/api/formations', {
          params: apiParams
        });
        console.log("Response received:", response.data);

        // Gérer le cas où les données sont retournées dans un format différent
        const formationsData = response.data.member || response.data.data || [];
        setFormations(Array.isArray(formationsData) ? formationsData : []);

        // Si le total est disponible dans la réponse
        setTotalFormations(response.data.total || formationsData.length);

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
    setSearchParams({
      ...searchParams,
      title: formValues.title,
      type: formValues.type,
      page: 1
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      title: event.target.value
    }));
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormValues(prev => ({
      ...prev,
      type: event.target.value
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

  const formatType = (type: string) => {
    const types = {
      'initial': 'Formation Initiale',
      'continuous': 'Formation Continue',
      'mobility': 'Formation Mobilité'
    };
    return types[type as keyof typeof types] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'initial': 'bg-blue-100 text-blue-800',
      'continuous': 'bg-green-100 text-green-800',
      'mobility': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePagination = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalFormations / searchParams.limit);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
              <div className="mr-3 flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Erreur</h3>
                <p>{error}</p>
                <button
                    className="mt-2 text-red-600 hover:text-red-800 font-medium"
                    onClick={() => window.location.reload()}
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos Formations Taxi</h1>
            <p className="text-xl max-w-2xl">
              Découvrez nos programmes de formation certifiants pour devenir chauffeur de taxi professionnel.
              Des formations adaptées à tous les niveaux pour réussir dans le métier.
            </p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 -mt-12 relative z-10">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400"/>
                <input
                    type="text"
                    placeholder="Rechercher une formation..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formValues.title}
                    onChange={handleTitleChange}
                />
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-3 text-gray-400"/>
                  <select
                      className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      value={formValues.type}
                      onChange={handleTypeChange}
                  >
                    <option value="">Tous les types</option>
                    <option value="initial">Formation Initiale</option>
                    <option value="continuous">Formation Continue</option>
                    <option value="mobility">Formation Mobilité</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-3 text-gray-400 transform rotate-90"/>
                </div>
                <button
                    type="submit"
                    className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition flex items-center"
                >
                  <Search className="h-5 w-5 mr-2"/> Rechercher
                </button>
              </div>
            </form>
          </div>

          {/* Résultats de recherche */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Nos formations disponibles</h2>
            <p className="text-gray-600">
              {totalFormations} formation{totalFormations > 1 ? 's' : ''} disponible{totalFormations > 1 ? 's' : ''}
              {searchParams.type && ` de type ${formatType(searchParams.type)}`}
              {searchParams.title && ` contenant "${searchParams.title}"`}
            </p>
          </div>

          {/* Grille des formations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {formations && formations.length > 0 ? (
                formations.map((formation) => (
                    <div
                        key={formation.id}
                        className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform ${hoveredCard === formation.id ? 'scale-[1.02]' : ''}`}
                        onMouseEnter={() => setHoveredCard(formation.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="border-b-4 border-blue-900 h-3"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Link to={`/formations/${formation.slug || formation.id}`} className="group">
                            <h3 className="text-xl font-bold mb-2 text-blue-900 group-hover:text-blue-700 transition-colors">
                              {formation.title}
                            </h3>
                          </Link>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(formation.type)}`}>
                            {formatType(formation.type)}
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-5 w-5 mr-2 text-blue-900"/>
                            <span>{formation.duration}h de formation</span>
                          </div>
                          {formation.startDate && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-2 text-blue-900"/>
                                <span>Prochaine session: {new Date(formation.startDate).toLocaleDateString()}</span>
                              </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Users className="h-5 w-5 mr-2 text-blue-900"/>
                            <span>8 à 12 participants par session</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-6 line-clamp-3">{formation.description}</p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <span className="text-2xl font-bold text-blue-900">{formation.price}€</span>
                          <div className="flex space-x-2">
                            <Link
                                to={`/formations/${formation.slug || formation.id}`}
                                className="bg-white text-blue-900 px-4 py-2 rounded-lg border border-blue-900 hover:bg-blue-50 transition"
                            >
                              Détails
                            </Link>
                            <button
                                onClick={() => handleShowSessions(formation)}
                                className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
                            >
                              S'inscrire
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                ))
            ) : (
                <div className="col-span-3 bg-white rounded-lg shadow p-8 text-center">
                  <Book className="h-12 w-12 text-blue-900 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold mb-2">Aucune formation disponible</h3>
                  <p className="text-gray-600 mb-4">
                    Nous n'avons pas trouvé de formations correspondant à vos critères de recherche.
                  </p>
                  <button
                      onClick={() => {
                        setFormValues({title: '', type: ''});
                        setSearchParams({page: 1, limit: 10, type: '', title: ''});
                      }}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                  >
                    Voir toutes les formations
                  </button>
                </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="flex justify-center mb-12">
                <nav className="flex items-center space-x-1">
                  <button
                      onClick={() => handlePagination(searchParams.page - 1)}
                      disabled={searchParams.page === 1}
                      className={`px-4 py-2 rounded-lg ${
                          searchParams.page === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-blue-900 hover:bg-blue-50'
                      }`}
                  >
                    Précédent
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                      <button
                          key={i}
                          onClick={() => handlePagination(i + 1)}
                          className={`w-10 h-10 rounded-lg ${
                              searchParams.page === i + 1
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-white text-blue-900 hover:bg-blue-50'
                          }`}
                      >
                        {i + 1}
                      </button>
                  ))}

                  <button
                      onClick={() => handlePagination(searchParams.page + 1)}
                      disabled={searchParams.page === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                          searchParams.page === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-blue-900 hover:bg-blue-50'
                      }`}
                  >
                    Suivant
                  </button>
                </nav>
              </div>
          )}
        </div>

        {/* Section des avantages */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir nos formations ?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="bg-blue-900 text-white h-14 w-14 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7"/>
                </div>
                <div className="text-blue-900 font-bold text-xl mb-4">Formation Certifiante</div>
                <p className="text-gray-700">
                  Nos formations sont reconnues par l'État et vous permettent d'obtenir votre carte professionnelle de
                  chauffeur de taxi.
                </p>
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="bg-blue-900 text-white h-14 w-14 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-7 w-7"/>
                </div>
                <div className="text-blue-900 font-bold text-xl mb-4">Formateurs Expérimentés</div>
                <p className="text-gray-700">
                  Notre équipe de formateurs possède une solide expérience du métier de chauffeur de taxi et connaît
                  parfaitement les exigences de l'examen.
                </p>
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="bg-blue-900 text-white h-14 w-14 rounded-full flex items-center justify-center mb-6">
                  <Book className="h-7 w-7"/>
                </div>
                <div className="text-blue-900 font-bold text-xl mb-4">Accompagnement Personnalisé</div>
                <p className="text-gray-700">
                  Un suivi individuel tout au long de votre formation pour garantir votre réussite et vous aider à
                  préparer efficacement l'examen.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link to="/contact"
                    className="bg-blue-900 text-white px-8 py-3 rounded-lg inline-flex items-center hover:bg-blue-800 transition">
                Contactez-nous <ChevronRight className="ml-2 h-5 w-5"/>
              </Link>
            </div>
          </div>
        </div>

        {/* Modaux */}
        {showRegistrationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
                 onClick={handleCloseModal}>
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-blue-900">Inscription à la formation</h3>
                  <button className="text-gray-500 hover:text-gray-700 p-1" onClick={handleCloseModal}>
                    <X className="h-6 w-6"/>
                  </button>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="name">Nom et prénom</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Votre nom complet"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                        required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Adresse email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="votre.email@exemple.com"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                        required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center"
                    >
                      Confirmer l'inscription
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {showSessionModal && selectedFormation && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
                 onClick={handleCloseModal}>
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                   onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-blue-900 text-white p-6 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{selectedFormation.title}</h3>
                    <button className="text-white hover:text-blue-200 p-1" onClick={handleCloseModal}>
                      <X className="h-6 w-6"/>
                    </button>
                  </div>
                  <p className="mt-2 text-blue-100">Choisissez une session ci-dessous</p>
                </div>

                <div className="p-6">
                  {sessions.length > 0 ? (
                      <div className="space-y-4">
                        {sessions.map(session => (
                            <div key={session.id}
                                 className="border border-gray-200 hover:border-blue-300 p-5 rounded-lg transition-all">
                              <div className="flex items-center text-gray-700 mb-3">
                                <Calendar className="h-5 w-5 mr-2 text-blue-900"/>
                                <span>Du <strong>{new Date(session.startDate).toLocaleDateString()}</strong> au <strong>{new Date(session.endDate).toLocaleDateString()}</strong></span>
                              </div>
                              <div className="flex items-center text-gray-700 mb-4">
                                <Users className="h-5 w-5 mr-2 text-blue-900"/>
                                <span><strong>{session.maxParticipants}</strong> places maximum</span>
                              </div>
                              <button
                                  className="w-full bg-blue-900 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition flex items-center justify-center"
                                  onClick={() => handleRegisterForSession(session.id)}
                              >
                                Réserver cette session
                              </button>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-blue-900 mx-auto mb-4"/>
                        <p className="text-gray-700 mb-2 font-medium">Aucune session disponible actuellement</p>
                        <p className="text-gray-600 mb-4">Contactez-nous pour connaître les prochaines dates</p>
                        <Link to="/contact"
                              className="inline-block bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                          Nous contacter
                        </Link>
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default FormationsPage;