import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Award, 
  Car,
  CheckCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import heroImage from '@assets/images/hero/classroom.jpg';

const LoginSidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-12 flex-col justify-center">
      <div className="max-w-lg mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <img 
              src={heroImage} 
              alt="Formation MerelFormation" 
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h3 className="text-2xl font-bold mb-2">Bienvenue chez MerelFormation</h3>
            <p className="text-blue-100">
              Votre centre de formation taxi de référence depuis plus de 15 ans
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-blue-200">Étudiants formés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-blue-200">Taux de réussite</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Car className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">20+</div>
            <div className="text-sm text-blue-200">Véhicules</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">15+</div>
            <div className="text-sm text-blue-200">Années d'expérience</div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h4 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-yellow-400" />
            Nos services
          </h4>
          <div className="space-y-3">
            <div className="flex items-center text-blue-100">
              <ArrowRight className="h-4 w-4 mr-2 text-yellow-400" />
              Formation initiale 140h
            </div>
            <div className="flex items-center text-blue-100">
              <ArrowRight className="h-4 w-4 mr-2 text-yellow-400" />
              Formation continue 14h
            </div>
            <div className="flex items-center text-blue-100">
              <ArrowRight className="h-4 w-4 mr-2 text-yellow-400" />
              Location de véhicules
            </div>
            <div className="flex items-center text-blue-100">
              <ArrowRight className="h-4 w-4 mr-2 text-yellow-400" />
              Préparation examens
            </div>
          </div>
        </div>

        {/* Informations pratiques */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h4 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-6 w-6 mr-2 text-yellow-400" />
            Besoin d'aide ?
          </h4>
          <div className="space-y-3">
            <div className="flex items-center text-blue-100">
              <Phone className="h-4 w-4 mr-3 text-yellow-400 flex-shrink-0" />
              <div>
                <div className="font-medium">01 23 45 67 89</div>
                <div className="text-sm">Lun-Ven 9h-18h</div>
              </div>
            </div>
            <div className="flex items-center text-blue-100">
              <Mail className="h-4 w-4 mr-3 text-yellow-400 flex-shrink-0" />
              <div>
                <div className="font-medium">contact@merelformation.com</div>
                <div className="text-sm">Réponse sous 24h</div>
              </div>
            </div>
            <div className="flex items-start text-blue-100">
              <MapPin className="h-4 w-4 mr-3 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">123 Avenue de la Formation</div>
                <div className="text-sm">75001 Paris</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="text-center space-y-4">
          <div className="text-sm text-blue-200 mb-3">
            Découvrez nos services sans vous connecter
          </div>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/formations" 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Voir nos formations
            </Link>
            <Link 
              to="/location" 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Location de véhicules
            </Link>
            <Link 
              to="/" 
              className="text-blue-200 hover:text-white transition-colors underline"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSidebar;