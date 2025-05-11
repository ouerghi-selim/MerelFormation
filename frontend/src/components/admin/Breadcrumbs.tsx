import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
    items?: Array<{
        label: string;
        path?: string;
    }>;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [] }) => {
    const location = useLocation();

    // Générer automatiquement les breadcrumbs en fonction de l'URL si non fournis
    const generateItems = () => {
        if (items.length > 0) return items;

        const paths = location.pathname.split('/').filter(Boolean);
        return paths.map((path, index) => {
            // Construire le chemin cumulatif
            const url = `/${paths.slice(0, index + 1).join('/')}`;

            // Formater le label (première lettre en majuscule, remplacer les tirets par des espaces)
            let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

            return {
                label,
                path: url
            };
        });
    };

    const breadcrumbItems = generateItems();

    return (
        <nav className="flex py-3 px-5 text-sm">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link to="/admin/dashboard" className="inline-flex items-center text-gray-500 hover:text-blue-700">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                    </Link>
                </li>

                {breadcrumbItems.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                        {item.path && index < breadcrumbItems.length - 1 ? (
                            <Link to={item.path} className="text-gray-500 hover:text-blue-700">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-800 font-medium">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;