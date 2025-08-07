import { mediaBaseURL } from '../services/api';
import { FileText, FileImage, File, FileCheck, FileX } from 'lucide-react';

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
  
  // Construire l'URL complète avec le mediaBaseURL
  const fullPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${mediaBaseURL}${fullPath}`;
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

/**
 * Interface pour les informations de type de fichier
 */
export interface FileTypeInfo {
  isImage: boolean;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

/**
 * Détermine le type d'un fichier et retourne les informations d'affichage appropriées
 * @param fileName - Nom du fichier avec extension
 * @returns Informations de type de fichier pour l'affichage
 */
export const getFileTypeInfo = (fileName: string | null | undefined): FileTypeInfo => {
  if (!fileName) {
    return {
      isImage: false,
      icon: FileX,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Fichier inconnu'
    };
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return {
        isImage: true,
        icon: FileImage,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Image'
      };

    case 'pdf':
      return {
        isImage: false,
        icon: FileText,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Document PDF'
      };

    case 'doc':
    case 'docx':
      return {
        isImage: false,
        icon: FileText,
        color: 'text-blue-800',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Document Word'
      };

    case 'txt':
      return {
        isImage: false,
        icon: FileText,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        description: 'Document texte'
      };

    case 'xls':
    case 'xlsx':
      return {
        isImage: false,
        icon: FileCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Feuille Excel'
      };

    default:
      return {
        isImage: false,
        icon: File,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        description: `Fichier ${extension.toUpperCase()}`
      };
  }
};

/**
 * Formate une taille de fichier en octets en format lisible
 * @param bytes - Taille en octets
 * @returns Taille formatée (ex: "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extrait l'extension d'un fichier en majuscules
 * @param fileName - Nom du fichier
 * @returns Extension en majuscules
 */
export const getFileExtension = (fileName: string | null | undefined): string => {
  if (!fileName) return 'INCONNU';
  return fileName.split('.').pop()?.toUpperCase() || 'INCONNU';
};

// Le composant FileDisplay a été déplacé vers components/common/FileDisplay.tsx