import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as BsIcons from 'react-icons/bs';
import { Clock } from 'lucide-react';

interface DynamicIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

// Mapping de toutes les icônes disponibles
const getAllIcons = () => {
  const allIcons: Record<string, React.ComponentType<any>> = {};
  
  // FontAwesome Icons
  Object.entries(FaIcons).forEach(([name, component]) => {
    if (typeof component === 'function' && name !== 'IconContext') {
      allIcons[name] = component as React.ComponentType<any>;
    }
  });

  // Material Design Icons
  Object.entries(MdIcons).forEach(([name, component]) => {
    if (typeof component === 'function' && name !== 'IconContext') {
      allIcons[name] = component as React.ComponentType<any>;
    }
  });

  // Bootstrap Icons
  Object.entries(BsIcons).forEach(([name, component]) => {
    if (typeof component === 'function' && name !== 'IconContext') {
      allIcons[name] = component as React.ComponentType<any>;
    }
  });

  return allIcons;
};

// Cache pour éviter de recalculer à chaque render
let cachedIcons: Record<string, React.ComponentType<any>> | null = null;

const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, className = "h-6 w-6", size }) => {
  // Initialiser le cache une seule fois
  if (!cachedIcons) {
    cachedIcons = getAllIcons();
  }

  // Récupérer le composant d'icône
  const IconComponent = cachedIcons[iconName];

  // Si l'icône n'existe pas, utiliser Clock comme fallback
  if (!IconComponent) {
    console.warn(`Icône "${iconName}" non trouvée, utilisation du fallback Clock`);
    return <Clock className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon;