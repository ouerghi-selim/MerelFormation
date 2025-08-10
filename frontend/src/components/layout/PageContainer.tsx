import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  className?: string;
  noPadding?: boolean;
}

/**
 * Composant PageContainer - Système uniforme de layout pour toutes les pages
 * 
 * Variantes disponibles:
 * - default: max-w-7xl (1280px) - Pour la plupart des pages
 * - narrow: max-w-4xl (896px) - Pour formulaires et contenu étroit
 * - wide: max-w-screen-2xl (1536px) - Pour tableaux et dashboards
 * - full: w-full - Prend toute la largeur sans limite
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'default',
  className = '',
  noPadding = false
}) => {
  // Définition des variantes avec leurs largeurs max et breakpoints
  const getVariantClasses = () => {
    const baseClasses = 'mx-auto';
    const paddingClasses = noPadding ? '' : 'px-4 sm:px-6 lg:px-8';
    
    switch (variant) {
      case 'narrow':
        return `${baseClasses} max-w-4xl ${paddingClasses}`;
      case 'wide':
        return `${baseClasses} max-w-screen-2xl ${paddingClasses}`;
      case 'full':
        return `w-full ${paddingClasses}`;
      case 'default':
      default:
        return `${baseClasses} max-w-7xl ${paddingClasses}`;
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;