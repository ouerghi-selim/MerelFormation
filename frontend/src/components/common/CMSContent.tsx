import React from 'react';

interface CMSContentProps {
  identifier: string;
  fallback: string;
  cmsContent: { [key: string]: string };
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * Composant pour afficher du contenu CMS avec rendu HTML automatique
 * Remplace la logique getContent + dangerouslySetInnerHTML
 */
const CMSContent: React.FC<CMSContentProps> = ({ 
  identifier, 
  fallback, 
  cmsContent, 
  className = '', 
  tag: Tag = 'div' 
}) => {
  const content = cmsContent[identifier] || fallback;
  
  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default CMSContent;