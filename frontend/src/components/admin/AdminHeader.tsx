import React, { useState } from 'react';
import { Bell, Search, Menu, X, User } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

interface AdminHeaderProps {
  title: string;
  breadcrumbItems?: Array<{ label: string; path?: string }>;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, breadcrumbItems }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications fictives pour la démo
  const notifications = [
    { id: 1, message: 'Nouvelle réservation de véhicule', time: 'Il y a 5 minutes' },
    { id: 2, message: 'Jean Dupont s\'est inscrit à la Formation Initiale', time: 'Il y a 30 minutes' },
    { id: 3, message: 'Rappel: Session de formation demain', time: 'Il y a 2 heures' }
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
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                  type="text"
                  placeholder="Rechercher..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 animate-fadeIn">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 animate-fadeIn">
                    <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon profil
                    </a>
                    <a href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </a>
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

        {/* Ajout des breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Menu mobile */}
        {showMobileMenu && (
            <div className="md:hidden bg-white border-t border-gray-200 py-2 animate-fadeIn">
              <div className="px-4 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      type="text"
                      placeholder="Rechercher..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
        )}
      </header>
  );
};

export default AdminHeader;