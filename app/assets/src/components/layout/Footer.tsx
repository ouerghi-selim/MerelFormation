import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-bold text-lg mb-4">MerelFormation</h4>
                        <p className="text-gray-600">
                            Formation professionnelle et location de véhicules pour chauffeurs de taxi
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Formations</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li><Link to="/formations" className="hover:text-blue-900">Formation Initiale</Link></li>
                            <li><Link to="/formations" className="hover:text-blue-900">Formation Continue</Link></li>
                            <li><Link to="/formations" className="hover:text-blue-900">Mobilité</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Location</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li><Link to="/location" className="hover:text-blue-900">Nos Véhicules</Link></li>
                            <li><Link to="/location" className="hover:text-blue-900">Tarifs</Link></li>
                            <li><Link to="/location" className="hover:text-blue-900">Réservation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Contact</h4>
                        <ul className="text-gray-600 space-y-2">
                            <li>contact@merelformation.fr</li>
                            <li>01 23 45 67 89</li>
                            <li>Paris, France</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
                    <p>&copy; 2024 MerelFormation. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;