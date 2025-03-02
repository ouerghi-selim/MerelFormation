import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@assets/images/logo/merel-logo.png';


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="hover:opacity-90 transition-opacity duration-300">
                            <img
                                src={logo}
                                alt="MerelFormation"
                                className="h-12 md:h-14"
                            />
                        </Link>
                    </div>
                        {/* Navigation Desktop */}
                        <nav className="hidden md:flex space-x-8 items-center">
                            <Link to="/formations" className="font-medium relative group">
                                Formations
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link to="/location" className="font-medium relative group">
                                Location
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link to="/contact" className="font-medium relative group">
                                Contact
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link to="/login"
                                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                                Connexion
                            </Link>
                        </nav>

                        {/* Menu Button Mobile */}
                        <button
                            className="md:hidden focus:outline-none"
                            onClick={toggleMenu}
                            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        >
                            {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-blue-800 animate-fadeIn">
                            <nav className="flex flex-col space-y-4 pb-5">
                                <Link
                                    to="/formations"
                                    className="py-2 px-4 hover:bg-blue-800 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Formations
                                </Link>
                                <Link
                                    to="/location"
                                    className="py-2 px-4 hover:bg-blue-800 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Location
                                </Link>
                                <Link
                                    to="/contact"
                                    className="py-2 px-4 hover:bg-blue-800 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Contact
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-lg font-medium text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Connexion
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
        </header>
);
};

export default Header;