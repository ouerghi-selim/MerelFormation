import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Filter, Users, Book, ChevronRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from "react-router-dom";
import SessionSelectionModal from '../components/front/modals/SessionSelectionModal';
import RegistrationFormModal from '../components/front/modals/RegistrationFormModal';
import { adminContentTextApi } from '../services/api';
import PageContainer from '../components/layout/PageContainer';
import DynamicIcon from '../components/common/DynamicIcon';

interface Badge {
  icon?: string;
  text?: string;
}

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
  badges?: Badge[];
}

interface CMSContent {
  [key: string]: string;
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
  
  // État pour le contenu CMS
  const [cmsContent, setCmsContent] = useState<CMSContent>({});

  // Fonction pour récupérer le contenu CMS
  const fetchCMSContent = async () => {
    try {
      const contentResponse = await adminContentTextApi.getAll({
        section: ['formations_hero', 'formations_advantages'].join(',')
      });
      
      const contentMap: CMSContent = {};
      if (contentResponse.data?.data) {
        contentResponse.data.data.forEach((item: any) => {
          contentMap[item.identifier] = item.content;
        });
      }
      setCmsContent(contentMap);
    } catch (err) {
      console.error('Erreur lors du chargement du contenu CMS:', err);
    }
  };

  // Fonction helper pour récupérer du contenu CMS avec fallback
  const getContent = (identifier: string, fallback: string) => {
    return cmsContent[identifier] || fallback;
  };

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
  const handleSelectSession = (sessionId: number) => {
    setRegistrationData(prev => ({ ...prev, sessionId }));
    setShowSessionModal(false);
    setShowRegistrationForm(true);
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

    // Récupérer les formations et le contenu CMS en parallèle
    Promise.all([
      fetchFormations(),
      fetchCMSContent()
    ]);
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
      await axios.post('/registration', registrationData);
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
          <PageContainer>
            <h1 className="text-4xl md:text-5xl font-bold mb-6"
                dangerouslySetInnerHTML={{__html: getContent('formations_hero_title', 'Nos Formations Taxi')}} />

            <p className="text-xl"
               dangerouslySetInnerHTML={{__html: getContent('formations_hero_description', 'Découvrez nos programmes de formation certifiants pour devenir chauffeur de taxi professionnel. Des formations adaptées à tous les niveaux pour réussir dans le métier.')}} />
          </PageContainer>
        </div>

        {/* Barre de recherche et filtres */}
        <PageContainer className="py-8">
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
                      <div className="p-6 flex flex-col h-full">
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
                          {/* Badge durée - toujours affiché */}
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-5 w-5 mr-2 text-blue-900"/>
                            <span>{formation.duration} heures</span>
                          </div>

                          {/* Badges dynamiques */}
                          {formation.badges && formation.badges.length > 0 ? (
                            formation.badges.map((badge, index) => {
                              // Ne pas afficher les badges vides
                              if (!badge.text && !badge.icon) return null;
                              
                              return (
                                <div key={index} className="flex items-center text-gray-600">
                                  {badge.icon && <DynamicIcon iconName={badge.icon} className="h-5 w-5 mr-2 text-blue-900"/>}
                                  {badge.text && <span>{badge.text}</span>}
                                </div>
                              );
                            })
                          ) : (
                            // Fallback si pas de badges dynamiques
                            <>
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
                            </>
                          )}
                        </div>

                        {/* Description avec flex-grow pour occuper l'espace disponible */}
                        <div className="flex-grow">
                          <div 
                            className="text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: formation.description }}
                          />
                        </div>

                        {/* Section prix et boutons - collée en bas */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
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
        </PageContainer>

        {/* Section des avantages */}
        <div className="bg-white py-16">
          <PageContainer>
            <h2 className="text-3xl font-bold text-center mb-12"
                dangerouslySetInnerHTML={{__html: getContent('formations_advantages_title', 'Pourquoi choisir nos formations ?')}} />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="bg-blue-900 text-white h-14 w-14 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7"/>
                </div>
                <div className="text-blue-900 font-bold text-xl mb-4"
                     dangerouslySetInnerHTML={{__html: getContent('advantage_certification_title', 'Formation Certifiante')}}/>
                <p className="text-gray-700"
                    dangerouslySetInnerHTML={{__html: getContent('advantage_certification_description', 'Nos formations sont reconnues par l\'État et vous permettent d\'obtenir votre carte professionnelle de chauffeur de taxi.')}} />
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="bg-blue-900 text-white h-14 w-14 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-7 w-7"/>
                </div>
                <div className="text-blue-900 font-bold text-xl mb-4"
                     dangerouslySetInnerHTML={{__html: getContent('advantage_trainers_title', 'Formateurs Expérimentés')}} />
                  <p className="text-gray-700"
                    dangerouslySetInnerHTML={{__html: getContent('advantage_trainers_description', 'Notre équipe de formateurs possède une solide expérience du métier de chauffeur de taxi et connaît parfaitement les exigences de l\'examen.')}} />
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="bg-blue-900 text-white h-14 w-14 rounded-full flex items-center justify-center mb-6">
                  <Book className="h-7 w-7"/>
                </div>
                <div className="text-blue-900 font-bold text-xl mb-4"
                     dangerouslySetInnerHTML={{__html: getContent('advantage_support_title', 'Accompagnement Personnalisé')}} />
                <p className="text-gray-700"
                    dangerouslySetInnerHTML={{__html: getContent('advantage_support_description', 'Un suivi individuel tout au long de votre formation pour garantir votre réussite et vous aider à préparer efficacement l\'examen.')}} />
              </div>
        </div>

            <div className="text-center mt-12">
              <Link to="/contact"
                    className="bg-blue-900 text-white px-8 py-3 rounded-lg inline-flex items-center hover:bg-blue-800 transition">
                Contactez-nous <ChevronRight className="ml-2 h-5 w-5"/>
              </Link>
            </div>
          </PageContainer>
        </div>

        {/* Modaux */}
        <SessionSelectionModal
            isOpen={showSessionModal}
            onClose={handleCloseModal}
            title={selectedFormation?.title || 'Formation'}
            sessions={sessions}
            onSelectSession={handleSelectSession}
        />

        <RegistrationFormModal
            isOpen={showRegistrationForm}
            onClose={handleCloseModal}
            sessionId={registrationData.sessionId}
        />
      </div>
  );
};

export default FormationsPage;