import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Calendar,
  BookOpen, 
  Users, 
  Car,
  PhoneIcon,
  FileText, 
  Settings, 
  CreditCard,
  Bell,
  Edit,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import logo from '../../assets/images/logo/merel-logo.png';

interface AdminSidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isMobileMenuOpen = false, 
  onCloseMobileMenu 
}) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <Home size={20} />,
      path: '/admin/dashboard',
      exact: true
    },

    { title: 'Planning',
        icon: <Calendar size={20} />
    , path: '/admin/planning' },

    { title: 'Réservations',
       icon: <PhoneIcon size={20} />,
      path: '/admin/reservations' },

    {
      title: 'Formations',
      icon: <BookOpen size={20} />,
      path: '/admin/formations',
      submenu: [
        { title: 'Liste des formations', path: '/admin/formations' },
        { title: 'Sessions', path: '/admin/sessions' }
      ]
    },
    {
      title: 'Examens',
      icon: <Car size={20} />,
      submenu: [
        { title: 'Véhicules', path: '/admin/vehicles' },
        { title: 'Centers', path: '/admin/centers' },
        { title: 'Formules', path: '/admin/reservations/formules' }


      ]
    },
    {
      title: 'Utilisateurs',
      icon: <Users size={20} />,
      path: '/admin/users',
      submenu: [
        { title: 'Élèves', path: '/admin/users/students' },
        { title: 'Formateurs', path: '/admin/users/instructors' },
        { title: 'Administrateurs', path: '/admin/users/admins' },
        { title: 'All', path: '/admin/users' }
      ]
    },
    {
      title: 'Contenu',
      icon: <Edit size={20} />,
      path: '/admin/content',
      submenu: [
        { title: 'Textes du site', path: '/admin/content/texts' },
        { title: 'Témoignages', path: '/admin/content/testimonials' },
        { title: 'FAQ', path: '/admin/content/faq' },
        { title: 'email template', path: '/admin/email-templates' },
      ]
    },
    // {
    //   title: 'Finances',
    //   icon: <CreditCard size={20} />,
    //   path: '/admin/finances',
    //   submenu: [
    //     { title: 'Factures', path: '/admin/finances/invoices' },
    //     { title: 'Paiements', path: '/admin/finances/payments' },
    //     { title: 'Rapports', path: '/admin/finances/reports' }
    //   ]
    // },
    {
      title: 'Documents directs',
      icon: <FileText size={20} />,
      path: '/admin/direct-documents'
    },
    // {
    //   title: 'Notifications',
    //   icon: <Bell size={20} />,
    //   path: '/admin/notifications'
    // },
    // {
    //   title: 'Paramètres',
    //   icon: <Settings size={20} />,
    //   path: '/admin/settings'
    // }
  ];
  
  const toggleSubmenu = (title: string) => {
    if (expandedMenu === title) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(title);
    }
  };
  
  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <>
      {/* ✅ MOBILE: Overlay pour fermer le menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}
      
      {/* ✅ SIDEBAR RESPONSIVE */}
      <div className={`
        bg-gray-900 text-white w-64 min-h-screen flex-shrink-0 
        fixed md:static top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:block
      `}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center">
            <img src={logo} alt="Merel Formation" className="h-8 mr-2" />
            <span className="font-bold text-xl">Merel Admin</span>
          </div>
          
          {/* ✅ MOBILE: Bouton fermer */}
          <button 
            onClick={onCloseMobileMenu}
            className="md:hidden text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
      
      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <div className="px-3">
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`flex items-center w-full py-2 px-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-1 text-left">{item.title}</span>
                    {expandedMenu === item.title ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {expandedMenu === item.title && (
                    <ul className="pl-10 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            to={subItem.path}
                            className={`block py-2 px-3 rounded-lg transition-colors ${
                              location.pathname === subItem.path
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center py-2 px-6 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 border-t border-gray-800 p-4">
        <button
          className="flex items-center text-gray-300 hover:text-white w-full py-2"
          onClick={() => {
            // Fermer le menu mobile après déconnexion
            if (onCloseMobileMenu) onCloseMobileMenu();
            // Logique de déconnexion
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >
          <LogOut size={20} className="mr-3" />
          <span>Déconnexion</span>
        </button>
      </div>
      </div>
    </>
  );
};

export default AdminSidebar;
