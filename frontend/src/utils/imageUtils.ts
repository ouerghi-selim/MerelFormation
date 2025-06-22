import React from 'react';
import { mediaBaseURL } from '@/services/api';

/**
 * Convertit un chemin d'image relatif en URL complète
 * @param imagePath - Chemin de l'image (ex: "/uploads/images/image.jpg")
 * @returns URL complète de l'image
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // Si l'URL est déjà complète, la retourner telle quelle
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construire l'URL complète
  return `${mediaBaseURL}${imagePath}`;
};

/**
 * Composant d'image avec fallback automatique
 */
export const ImageWithFallback: React.FC<{
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}> = ({ src, alt, className, fallbackSrc, onError }) => {
  const imageUrl = getImageUrl(src);
  
  return React.createElement('img', {
    src: imageUrl || fallbackSrc,
    alt: alt,
    className: className,
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallbackSrc && imageUrl !== fallbackSrc) {
        (e.target as HTMLImageElement).src = fallbackSrc;
      } else {
        (e.target as HTMLImageElement).style.display = 'none';
      }
      onError?.();
    }
  });
};