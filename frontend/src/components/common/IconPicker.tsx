import React, { useState, useEffect, useMemo } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as BsIcons from 'react-icons/bs';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

interface IconInfo {
  name: string;
  component: React.ComponentType<any>;
  family: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  // Découverte automatique de toutes les icônes disponibles
  const allIcons = useMemo(() => {
    const icons: IconInfo[] = [];
    
    // FontAwesome Icons
    Object.entries(FaIcons).forEach(([name, component]) => {
      if (typeof component === 'function' && name !== 'IconContext') {
        icons.push({
          name,
          component: component as React.ComponentType<any>,
          family: 'FontAwesome'
        });
      }
    });

    // Material Design Icons
    Object.entries(MdIcons).forEach(([name, component]) => {
      if (typeof component === 'function' && name !== 'IconContext') {
        icons.push({
          name,
          component: component as React.ComponentType<any>,
          family: 'Material Design'
        });
      }
    });

    // Bootstrap Icons
    Object.entries(BsIcons).forEach(([name, component]) => {
      if (typeof component === 'function' && name !== 'IconContext') {
        icons.push({
          name,
          component: component as React.ComponentType<any>,
          family: 'Bootstrap'
        });
      }
    });

    return icons;
  }, []);

  // Filtrage des icônes
  const filteredIcons = useMemo(() => {
    return allIcons.filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFamily = selectedFamily === 'all' || icon.family === selectedFamily;
      return matchesSearch && matchesFamily;
    });
  }, [allIcons, searchTerm, selectedFamily]);

  // Groupement par famille pour le header
  const iconsByFamily = useMemo(() => {
    return allIcons.reduce((acc, icon) => {
      acc[icon.family] = (acc[icon.family] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allIcons]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Choisir une icône ({filteredIcons.length} disponibles)
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher une icône..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Family Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFamily('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFamily === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({allIcons.length})
            </button>
            {Object.entries(iconsByFamily).map(([family, count]) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFamily === family
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {family} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredIcons.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucune icône trouvée pour "{searchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-3">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component;
                const isSelected = value === icon.name;
                
                return (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-3 rounded-lg border-2 transition-all hover:shadow-md group ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={icon.name}
                  >
                    <IconComponent 
                      className={`h-6 w-6 mx-auto transition-colors ${
                        isSelected ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-800'
                      }`} 
                    />
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {icon.name.replace(/^(Fa|Md|Bs)/, '')}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 text-center">
            Sélectionnez une icône pour l'utiliser dans votre badge
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;