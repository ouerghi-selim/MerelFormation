/**
 * Fonction utilitaire pour traiter et retourner le contenu CMS avec HTML
 * Cette fonction remplace l'ancienne getContent et gère automatiquement le HTML
 */
export const getHTMLContent = (cmsContent: { [key: string]: string }, identifier: string, fallback: string): string => {
  return cmsContent[identifier] || fallback;
};

/**
 * Props pour le rendu HTML inline
 */
export const getHTMLProps = (cmsContent: { [key: string]: string }, identifier: string, fallback: string) => {
  return {
    dangerouslySetInnerHTML: { __html: getHTMLContent(cmsContent, identifier, fallback) }
  };
};