import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Calendar, Car, Book, CheckCircle } from 'lucide-react';
import axios from 'axios';
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

const HomePage = () => {
  console.log("Fetching stats...");
  const [formationStats, setFormationStats] = useState<FormationStats | null>(null);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      console.log("Fetching stats...");
      try {
        setLoading(true);
        console.log("Fetching stats...");
        const [formationsResponse, vehiclesResponse] = await Promise.all([
          axios.get('/api/formations/statistics'),
          axios.get('/api/vehicles/statistics')
        ]);
        console.log("Stats received:", formationsResponse.data, vehiclesResponse.data);
        setFormationStats(formationsResponse.data);
        setVehicleStats(vehiclesResponse.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Devenez Chauffeur de Taxi Professionnel
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Formation certifiante et location de véhicules pour réussir dans le métier de taxi. Plus de 500 professionnels formés avec 95% de réussite.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/formations"
                  className="bg-yellow-500 text-blue-900 px-6 py-3 rounded-lg font-medium text-center hover:bg-yellow-400 transition-colors">
                  Découvrir nos formations
                </Link>
                <Link to="/location"
                  className="bg-white text-blue-900 px-6 py-3 rounded-lg font-medium text-center hover:bg-gray-100 transition-colors">
                  Location de véhicules
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-blue-800 border-2 border-blue-900"/>
                  ))}
                </div>
                <p className="text-blue-200">Rejoignez plus de 500 chauffeurs formés</p>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <img
                src={heroImage}
                alt="Formation taxi professionnelle"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nos Services Complets</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une offre complète pour votre réussite professionnelle, de la formation à la mise en route.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formation Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Book className="text-blue-900 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Formation Taxi</h3>
              <p className="text-gray-600 mb-6">
                Formation initiale et continue pour les chauffeurs de taxi. Programme complet et certifiant.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Formation initiale de 140h
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Formation continue
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Certification officielle
                </li>
              </ul>
              <Link to="/formations"
                className="text-blue-900 font-medium flex items-center hover:text-blue-700 transition-colors">
                En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Location Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Car className="text-blue-900 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Location Véhicules</h3>
              <p className="text-gray-600 mb-6">
                Location de véhicules équipés et adaptés pour l'activité de taxi.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  {vehicleStats ? `${vehicleStats.totalVehicles} véhicules disponibles` : 'Véhicules récents'}
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Entretien inclus
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Assurance professionnelle
                </li>
              </ul>
              <Link to="/location"
                className="text-blue-900 font-medium flex items-center hover:text-blue-700 transition-colors">
                Découvrir les véhicules <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* Planning Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="text-blue-900 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Planning Flexible</h3>
              <p className="text-gray-600 mb-6">
                Des sessions de formation adaptées à vos disponibilités.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  {formationStats ? `${formationStats.upcomingSessions} sessions à venir` : 'Sessions régulières'}
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Horaires adaptés
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Support personnalisé
                </li>
              </ul>
              <Link to="/planning"
                className="text-blue-900 font-medium flex items-center hover:text-blue-700 transition-colors">
                Voir le planning <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">
                {formationStats ? formationStats.totalSessions : '500+'}
              </div>
              <div className="text-blue-200">Stagiaires Formés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {formationStats ? `${formationStats.averageSuccessRate || 95}%` : '95%'}
              </div>
              <div className="text-blue-200">Taux de Réussite</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {vehicleStats ? vehicleStats.totalVehicles : '20+'}
              </div>
              <div className="text-blue-200">Véhicules</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-200">Années d'Expérience</div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ils nous font confiance</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Formation excellente et très professionnelle. Les formateurs sont à l'écoute et le contenu est parfaitement adapté."
              </p>
              <div className="font-medium">Sarah M.</div>
              <div className="text-gray-500 text-sm">Chauffeur de taxi depuis 2023</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Le service de location est impeccable. Véhicules toujours en parfait état et une équipe très réactive."
              </p>
              <div className="font-medium">Thomas R.</div>
              <div className="text-gray-500 text-sm">Client depuis 2022</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Une formation complète qui m'a permis d'obtenir ma certification du premier coup. Je recommande vivement."
              </p>
              <div className="font-medium">Michel P.</div>
              <div className="text-gray-500 text-sm">Diplômé en 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-blue-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à démarrer votre carrière ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Inscrivez-vous à nos formations et lancez-vous dans l'aventure du taxi professionnel.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact"
                    className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                Nous contacter
              </Link>
              <Link to="/formations"
                    className="bg-white text-blue-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Voir les formations
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;