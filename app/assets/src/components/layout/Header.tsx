import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-blue-900 text-white">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-xl font-bold">MerelFormation</Link>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/formations" className="hover:text-blue-200">Formations</Link>
                        <Link to="/location" className="hover:text-blue-200">Location</Link>
                        <Link to="/contact" className="hover:text-blue-200">Contact</Link>
                        <a href="#" className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-lg font-medium">
                            Connexion
                        </a>
                    </nav>
                    <button className="md:hidden">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;