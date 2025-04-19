import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, X, User } from 'lucide-react';

const StudentHeader: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  // Notifications fictives pour la démo
  const notifications = [
    { id: 1, message: 'Nouvelle session programmée', time: 'Il y a 5 minutes' },
    { id: 2, message: 'Document ajouté à votre formation', time: 'Il y a 2 heures' },
    { id: 3, message: 'Rappel: Session de formation demain', time: 'Il y a 1 jour' }
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3 lg:px-6">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/student" className="text-xl font-bold text-blue-700">Merel Formation</Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/student" className="text-gray-700 hover:text-blue-700">Tableau de bord</Link>
          <Link to="/student/formations" className="text-gray-700 hover:text-blue-700">Mes formations</Link>
          <Link to="/student/documents" className="text-gray-700 hover:text-blue-700">Documents</Link>
          {/*<Link to="/student/planning" className="text-gray-700 hover:text-blue-700">Planning</Link>*/}
          <Link to="/student/payments" className="text-gray-700 hover:text-blue-700">Paiements</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map(notification => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <Link to="/student/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mon profil
                </Link>
                <Link to="/student/password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Changer mot de passe
                </Link>
                <div className="border-t border-gray-100"></div>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <nav className="flex flex-col">
            <Link to="/student" className="px-4 py-2 text-gray-700 hover:bg-gray-100">Tableau de bord</Link>
            <Link to="/student/formations" className="px-4 py-2 text-gray-700 hover:bg-gray-100">Mes formations</Link>
            <Link to="/student/documents" className="px-4 py-2 text-gray-700 hover:bg-gray-100">Documents</Link>
            <Link to="/student/planning" className="px-4 py-2 text-gray-700 hover:bg-gray-100">Planning</Link>
            <Link to="/student/payments" className="px-4 py-2 text-gray-700 hover:bg-gray-100">Paiements</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default StudentHeader;
