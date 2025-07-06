import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Calendar, Car, Book, CheckCircle, ArrowRight } from 'lucide-react';
import { adminContentTextApi, adminTestimonialApi } from '../services/api';
import heroImage from '@assets/images/hero/classroom.jpg';

interface FormationStats {
  totalFormations: number;
  upcomingSessions: number;
  totalSessions: number;
  averageSuccessRate?: number;
}

interface VehicleStats {
  totalVehicles: number;
  activeRentals: number;
  maintenanceCount: number;
  averageDailyRate: number;
}

interface CMSContent {
  [key: string]: string;
}

interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  formationName: string;
}

const Loader = () => (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      <p className="text-blue-900 mt-4 font-medium">Chargement des données...</p>
    </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-lg">
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{message}</p>
        </div>
        <p className="mt-2 text-sm">Essayez de rafraîchir la page ou contactez-nous si le problème persiste.</p>
      </div>
    </div>
);

// Component de comptage animé pour les statistiques
const AnimatedCounter = ({ value, label, suffix = '' }: { value: number | string, label: string, suffix?: string }) => {
  return (
      <div className="text-center transform hover:scale-105 transition-transform duration-300">
        <div className="text-4xl font-bold mb-2 animate-fadeIn">
          {value}{suffix}
        </div>
        <div className="text-blue-200">{label}</div>
      </div>
  );
};

// Component de carte de service avec animation au survol
const ServiceCard = ({ icon, title, description, items, linkTo, linkText }: any) => {
  return (
      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3 mb-6">
          {items.map((item: string, i: number) => (
              <li key={i} className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
          ))}
        </ul>
        <Link to={linkTo}
              className="text-blue-900 font-medium flex items-center hover:text-blue-700 transition-colors group">
          {linkText} <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
  );
};

const TestimonialCard = ({ stars = 5, content, name, info }: any) => {
  return (
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(stars)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
        </div>
        <p className="text-gray-600 mb-4">"{content}"</p>
        <div className="font-medium">{name}</div>
        <div className="text-gray-500 text-sm">{info}</div>
      </div>
  );
};

const HomePage = () => {
  const [formationStats, setFormationStats] = useState<FormationStats | null>(null);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le contenu CMS
  const [cmsContent, setCmsContent] = useState<CMSContent>({});
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Fonction pour récupérer le contenu CMS
  const fetchCMSContent = async () => {
    try {
      // Récupérer tous les contenus texte
      const contentResponse = await adminContentTextApi.getAll({
        section: ['home_hero', 'home_services', 'home_cta', 'home_testimonials', 'home_statistics'].join(',')
      });
      
      // Transformer en objet avec identifiants comme clés
      const contentMap: CMSContent = {};
      if (contentResponse.data?.data) {
        contentResponse.data.data.forEach((item: any) => {
          contentMap[item.identifier] = item.content;
        });
      }
      setCmsContent(contentMap);

      // Récupérer les témoignages en vedette
      const testimonialsResponse = await adminTestimonialApi.getFeatured();
      if (testimonialsResponse.data?.data) {
        setTestimonials(testimonialsResponse.data.data);
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement du contenu CMS:', err);
      // En cas d'erreur, on peut continuer avec les valeurs par défaut
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques et le contenu CMS en parallèle
        await Promise.all([
          fetchCMSContent(),
          // Garder les appels de statistiques existants
          (async () => {
            try {
              const [formationsResponse, vehiclesResponse] = await Promise.all([
                import('axios').then(axios => axios.default.get('/api/formations/statistics')),
                import('axios').then(axios => axios.default.get('/api/vehicles/statistics'))
              ]);
              setFormationStats(formationsResponse.data);
              setVehicleStats(vehiclesResponse.data);
            } catch (statsErr) {
              console.error('Erreur statistiques:', statsErr);
              // Continuer même si les stats échouent
            }
          })()
        ]);
        
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fonction helper pour récupérer du contenu CMS avec fallback
  const getContent = (identifier: string, fallback: string) => {
    return cmsContent[identifier] || fallback;
  };

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay message={error} />;

  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {getContent('home_hero_title', 'Devenez Chauffeur de Taxi Professionnel')}
                </h1>
                <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                  {getContent('home_hero_description', 'Formation certifiante et location de véhicules pour réussir dans le métier de taxi. Plus de 500 professionnels formés avec 95% de réussite.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/formations"
                        className="bg-yellow-500 text-blue-900 px-6 py-3 rounded-lg font-medium text-center hover:bg-yellow-400 transition-colors transform hover:scale-105 hover:shadow-lg inline-flex justify-center items-center">
                    {getContent('home_hero_cta_formations', 'Découvrir nos formations')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/location"
                        className="bg-white text-blue-900 px-6 py-3 rounded-lg font-medium text-center hover:bg-gray-100 transition-colors transform hover:scale-105 hover:shadow-lg">
                    {getContent('home_hero_cta_location', 'Location de véhicules')}
                  </Link>
                </div>
                <div className="mt-8 flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-9 h-9 rounded-full bg-blue-800 border-2 border-blue-900 shadow-md transform hover:translate-y-1 transition-transform duration-300"
                             style={{ zIndex: 5 - i }}
                        />
                    ))}
                  </div>
                  <p className="text-blue-200">{getContent('home_hero_community', 'Rejoignez plus de 500 chauffeurs formés')}</p>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8 animate-slideInRight">
                <img
                    src={heroImage}
                    alt="Formation taxi professionnelle"
                    className="rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 object-cover w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fadeIn">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                {getContent('home_services_title', 'Nos Services Complets')}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {getContent('home_services_description', 'Une offre complète pour votre réussite professionnelle, de la formation à la mise en route.')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <ServiceCard
                  icon={<Book className="text-blue-900 h-8 w-8" />}
                  title={getContent('service_formation_title', 'Formation Taxi')}
                  description={getContent('service_formation_description', 'Formation initiale et continue pour les chauffeurs de taxi. Programme complet et certifiant.')}
                  items={[
                    "Formation initiale de 140h",
                    "Formation continue",
                    "Certification officielle"
                  ]}
                  linkTo="/formations"
                  linkText="En savoir plus"
              />

              <ServiceCard
                  icon={<Car className="text-blue-900 h-8 w-8" />}
                  title={getContent('service_location_title', 'Location Véhicules')}
                  description={getContent('service_location_description', 'Location de véhicules équipés et adaptés pour l\'activité de taxi.')}
                  items={[
                    vehicleStats ? `${vehicleStats.totalVehicles} véhicules disponibles` : 'Véhicules récents',
                    "Entretien inclus",
                    "Assurance professionnelle"
                  ]}
                  linkTo="/location"
                  linkText="Découvrir les véhicules"
              />

              <ServiceCard
                  icon={<Calendar className="text-blue-900 h-8 w-8" />}
                  title={getContent('service_planning_title', 'Planning Flexible')}
                  description={getContent('service_planning_description', 'Des sessions de formation adaptées à vos disponibilités.')}
                  items={[
                    formationStats ? `${formationStats.upcomingSessions} sessions à venir` : 'Sessions régulières',
                    "Horaires adaptés",
                    "Support personnalisé"
                  ]}
                  linkTo="/planning"
                  linkText="Voir le planning"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <AnimatedCounter
                  value={formationStats ? formationStats.totalSessions : getContent('home_stats_students_value', '500+')}
                  label={getContent('home_stats_students_label', 'Stagiaires Formés')}
              />
              <AnimatedCounter
                  value={formationStats ? formationStats.averageSuccessRate || getContent('home_stats_success_value', '95') : getContent('home_stats_success_value', '95')}
                  label={getContent('home_stats_success_label', 'Taux de Réussite')}
                  suffix="%"
              />
              <AnimatedCounter
                  value={vehicleStats ? vehicleStats.totalVehicles : getContent('home_stats_vehicles_value', '20+')}
                  label={getContent('home_stats_vehicles_label', 'Véhicules')}
              />
              <AnimatedCounter
                  value={getContent('home_stats_experience_value', '15+')}
                  label={getContent('home_stats_experience_label', 'Années d\'Expérience')}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {getContent('home_testimonials_title', 'Ils nous font confiance')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    stars={testimonial.rating}
                    content={testimonial.content}
                    name={testimonial.name}
                    info={testimonial.formationName}
                  />
                ))
              ) : (
                // Fallback vers les témoignages par défaut si pas de données CMS
                <>
                  <TestimonialCard
                      content="Formation excellente et très professionnelle. Les formateurs sont à l'écoute et le contenu est parfaitement adapté."
                      name="Sarah M."
                      info="Chauffeur de taxi depuis 2023"
                  />
                  <TestimonialCard
                      content="Le service de location est impeccable. Véhicules toujours en parfait état et une équipe très réactive."
                      name="Thomas R."
                      info="Client depuis 2022"
                  />
                  <TestimonialCard
                      content="Une formation complète qui m'a permis d'obtenir ma certification du premier coup. Je recommande vivement."
                      name="Michel P."
                      info="Diplômé en 2024"
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {getContent('home_cta_title', 'Prêt à démarrer votre carrière ?')}
              </h2>
              <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                {getContent('home_cta_description', 'Inscrivez-vous à nos formations et lancez-vous dans l\'aventure du taxi professionnel.')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/contact"
                      className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors transform hover:scale-105 hover:shadow-lg inline-flex items-center justify-center">
                  <span>{getContent('home_cta_contact', 'Nous contacter')}</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/formations"
                      className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors transform hover:scale-105 hover:shadow-lg">
                  {getContent('home_cta_formations', 'Voir les formations')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

// Ajout d'animations CSS
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 1s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 1s ease-out;
}
`;

// Ajouter ce style au document si nécessaire
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default HomePage;