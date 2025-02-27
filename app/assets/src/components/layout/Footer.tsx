import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-bold text-xl mb-4 text-blue-900">MerelFormation</h4>
                        <p className="text-gray-600 mb-4">
                            Formation professionnelle et location de véhicules pour chauffeurs de taxi
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-900 hover:text-blue-700 transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-blue-900 hover:text-blue-700 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-blue-900 hover:text-blue-700 transition-colors">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-xl mb-4 text-blue-900">Formations</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li>
                                <Link to="/formations" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Formation Initiale
                                </Link>
                            </li>
                            <li>
                                <Link to="/formations" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Formation Continue
                                </Link>
                            </li>
                            <li>
                                <Link to="/formations" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Mobilité
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-xl mb-4 text-blue-900">Location</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li>
                                <Link to="/location" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Nos Véhicules
                                </Link>
                            </li>
                            <li>
                                <Link to="/location" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Tarifs
                                </Link>
                            </li>
                            <li>
                                <Link to="/location" className="hover:text-blue-900 transition-colors flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mr-2"></span>
                                    Réservation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-xl mb-4 text-blue-900">Contact</h4>
                        <ul className="text-gray-600 space-y-3">
                            <li className="flex items-start">
                                <Mail className="h-5 w-5 text-blue-900 mr-2 mt-0.5" />
                                <a href="mailto:contact@merelformation.fr" className="hover:text-blue-900 transition-colors">
                                    contact@merelformation.fr
                                </a>
                            </li>
                            <li className="flex items-start">
                                <Phone className="h-5 w-5 text-blue-900 mr-2 mt-0.5" />
                                <a href="tel:0123456789" className="hover:text-blue-900 transition-colors">
                                    01 23 45 67 89
                                </a>
                            </li>
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-blue-900 mr-2 mt-0.5" />
                                <span>Paris, France</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-10 pt-8 text-center text-gray-600">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p>&copy; {currentYear} MerelFormation. Tous droits réservés.</p>
                        <div className="mt-4 md:mt-0 space-x-4">
                            <Link to="/mentions-legales" className="hover:text-blue-900 transition-colors">Mentions légales</Link>
                            <Link to="/cgv" className="hover:text-blue-900 transition-colors">CGV</Link>
                            <Link to="/politique-confidentialite" className="hover:text-blue-900 transition-colors">Politique de confidentialité</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;