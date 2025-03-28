import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Send, CheckCircle,
    ChevronDown, HelpCircle, Clock, MessageSquare } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    // États pour les menus déroulants
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            console.log('Subscribed with:', email);
            setSubscribed(true);
            setEmail('');
            setTimeout(() => {
                setSubscribed(false);
            }, 3000);
        }
    };

    return (
        <footer className="bg-gray-100 border-t border-gray-200 pt-6 pb-4">
            <div className="container mx-auto px-4">
                {/* Top section with newsletter and contact info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                    {/* Newsletter signup - Compact version */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <h4 className="font-bold text-lg text-blue-900">Restez informé</h4>
                        </div>


                            <div className="mt-3 animate-fadeIn">
                                <p className="text-gray-600 text-sm mb-3">
                                    Recevez nos actualités et dates de sessions.
                                </p>
                                {subscribed ? (
                                    <div className="bg-green-100 border-l-4 border-green-500 p-2 flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                        <span className="text-green-700">Merci pour votre inscription !</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Votre adresse email"
                                            className="flex-grow px-3 py-1 text-sm rounded-l-lg border-gray-300 border focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                            required
                                        />
                                        <button type="submit" className="bg-blue-900 text-white px-3 py-1 rounded-r-lg hover:bg-blue-800 transition-colors flex items-center">
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                )}

                                <div className="mt-2 text-xs">
                                    <div className="flex items-center">
                                        <div className="p-1 bg-blue-100 rounded-full mr-1">
                                            <CheckCircle className="h-3 w-3 text-blue-900" />
                                        </div>
                                        <div className="text-gray-600">
                                            Agréments préfectoraux: 35, 22, 56, 44
                                        </div>
                                    </div>
                                </div>
                            </div>

                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-3 text-blue-900">Contactez-nous</h4>
                        <ul className="text-gray-600 space-y-2 text-sm">
                            <li className="flex items-center">
                                <Mail className="h-4 w-4 text-blue-900 mr-2" />
                                <a href="mailto:contact@merelformation.fr" className="hover:text-blue-900 transition-colors">
                                    contact@merelformation.fr
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-4 w-4 text-blue-900 mr-2" />
                                <a href="tel:0760861109" className="hover:text-blue-900 transition-colors">
                                    07 60 86 11 09
                                </a>
                            </li>
                            <li className="flex items-center">
                                <MapPin className="h-4 w-4 text-blue-900 mr-2" />
                                <span>7 RUE Georges Maillols, 35000 RENNES</span>
                            </li>
                        </ul>
                    </div>

                    {/* Hours and Social */}
                    <div>
                        <h4 className="font-bold text-lg mb-3 text-blue-900">Horaires</h4>
                        <div className="text-gray-600 text-sm mb-3">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 text-blue-900 mr-2" />
                                <div>
                                    <p>Lundi - Vendredi</p>
                                    <p>8h30 - 12h00 | 13h00 - 16h30</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3">
                            <h5 className="font-medium text-sm mb-2">Suivez-nous</h5>
                            <div className="flex space-x-3">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-blue-900 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                                    <Facebook size={16} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-blue-900 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                                    <Instagram size={16} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="bg-blue-900 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                                    <Twitter size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main links section - Collapsible on hover */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 text-sm">

                    {/* Services - Collapsible */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredMenu('services')}
                        onMouseLeave={() => setHoveredMenu(null)}
                    >
                        <h4 className="font-bold text-lg mb-2 text-blue-900 flex items-center cursor-pointer">
                            Nos Services
                            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${hoveredMenu === 'services' ? 'rotate-180' : ''}`} />
                        </h4>

                        {/* Dropdown menu */}
                        <ul className={`text-gray-600 space-y-1 overflow-hidden transition-all duration-300 ${
                            hoveredMenu === 'services' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <li>
                                <Link to="/formations" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Formations
                                </Link>
                            </li>
                            <li>
                                <Link to="/location" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Location Véhicules
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources - Collapsible */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredMenu('resources')}
                        onMouseLeave={() => setHoveredMenu(null)}
                    >
                        <h4 className="font-bold text-lg mb-2 text-blue-900 flex items-center cursor-pointer">
                            Ressources
                            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${hoveredMenu === 'resources' ? 'rotate-180' : ''}`} />
                        </h4>

                        {/* Dropdown menu */}
                        <ul className={`text-gray-600 space-y-1 overflow-hidden transition-all duration-300 ${
                            hoveredMenu === 'resources' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <li>
                                <Link to="/faq" className="hover:text-blue-900 transition-colors flex items-center">
                                    <HelpCircle className="h-3 w-3 text-blue-900 mr-2" />
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-blue-900 transition-colors flex items-center">
                                    <MessageSquare className="h-3 w-3 text-blue-900 mr-2" />
                                    Blog & Actualités
                                </Link>
                            </li>
                            <li>
                                <Link to="/planning" className="hover:text-blue-900 transition-colors flex items-center">
                                    <Clock className="h-3 w-3 text-blue-900 mr-2" />
                                    Planning des formations
                                </Link>
                            </li>
                            <li>
                                <Link to="/documents" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Documents utiles
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Informations - Collapsible */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredMenu('info')}
                        onMouseLeave={() => setHoveredMenu(null)}
                    >
                        <h4 className="font-bold text-lg mb-2 text-blue-900 flex items-center cursor-pointer">
                            Informations
                            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${hoveredMenu === 'info' ? 'rotate-180' : ''}`} />
                        </h4>

                        {/* Dropdown menu */}
                        <ul className={`text-gray-600 space-y-1 overflow-hidden transition-all duration-300 ${
                            hoveredMenu === 'info' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <li>
                                <Link to="/mentions-legales" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Mentions légales
                                </Link>
                            </li>
                            <li>
                                <Link to="/cgv" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    CGV
                                </Link>
                            </li>
                            <li>
                                <Link to="/politique-confidentialite" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link to="/accessibilite" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Accessibilité
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom copyright */}
                <div className="border-t border-gray-200 pt-4 text-center text-gray-600 text-xs">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <p>&copy; {currentYear} MerelFormation. Tous droits réservés.</p>
                            <p className="mt-1">SIRET : 800484222 | N° Agrément préfectorale 35: 23-002 23-003</p>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;