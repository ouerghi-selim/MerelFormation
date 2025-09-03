import React from 'react';
import { FileX } from 'lucide-react';
import { getFileTypeInfo, getFileExtension, formatFileSize } from '../../utils/imageUtils';

/**
 * Composant pour afficher un fichier avec le bon rendu selon son type
 */
export const FileDisplay: React.FC<{
  fileName: string | null | undefined;
  baseUrl: string;
  title?: string;
  size?: number;
  className?: string;
  imageClassName?: string;
  onPreview?: (url: string) => void;
  showDownload?: boolean;
  // Nouvelles props pour l'API
  useApiRoute?: boolean;
  userId?: number;
  fileType?: 'front' | 'back';
}> = ({ 
  fileName, 
  baseUrl, 
  title, 
  size, 
  className = '',
  imageClassName = 'w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity',
  onPreview,
  showDownload = true,
  useApiRoute = false,
  userId,
  fileType
}) => {
  // Validation renforcée : vérifier que fileName existe et n'est pas une chaîne vide
  if (!fileName || fileName.trim() === '') {
    return (
      <div className={`border border-dashed border-gray-300 rounded-lg p-6 text-center ${className}`}>
        <FileX className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Aucun fichier</p>
      </div>
    );
  }

  const fileTypeInfo = getFileTypeInfo(fileName);
  
  // Construire l'URL selon le mode (API ou lien direct)
  const fileUrl = useApiRoute && userId && fileType 
    ? `/api/admin/users/${userId}/license/${fileType}/download`
    : `${baseUrl}/${fileName}`;
    
  const IconComponent = fileTypeInfo.icon;

  const handlePreview = () => {
    if (onPreview) {
      onPreview(fileUrl);
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className={className}>
      {fileTypeInfo.isImage ? (
        // Affichage pour les images
        <div>
          <img
            src={fileUrl}
            alt={title || fileName}
            className={imageClassName}
            onClick={handlePreview}
          />
          {showDownload && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (useApiRoute && userId && fileType) {
                    // Téléchargement sécurisé avec JWT
                    const token = localStorage.getItem('token');
                    fetch(fileUrl, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(response => {
                      if (response.ok) {
                        return response.blob();
                      }
                      throw new Error('Échec du téléchargement');
                    })
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = fileName || 'document';
                      link.click();
                      window.URL.revokeObjectURL(url);
                    })
                    .catch(error => {
                      console.error('Erreur de téléchargement:', error);
                      alert('Erreur lors du téléchargement du fichier');
                    });
                  } else {
                    // Téléchargement direct pour les fichiers publics
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = fileName || 'document';
                    link.click();
                  }
                }}
                className="inline-flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger
              </button>
            </div>
          )}
        </div>
      ) : (
        // Affichage pour les autres types de fichiers
        <div 
          className={`border ${fileTypeInfo.borderColor} ${fileTypeInfo.bgColor} rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
          onClick={handlePreview}
        >
          <div className="p-6 text-center">
            <IconComponent className={`h-16 w-16 mx-auto mb-4 ${fileTypeInfo.color}`} />
            <h4 className={`font-medium ${fileTypeInfo.color} mb-1`}>
              {fileTypeInfo.description}
            </h4>
            <p className="text-sm text-gray-600 mb-2 break-all">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">
              {getFileExtension(fileName)}
              {size && ` • ${formatFileSize(size)}`}
            </p>
            {showDownload && (
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (useApiRoute && userId && fileType) {
                      // Téléchargement sécurisé avec JWT
                      const token = localStorage.getItem('token');
                      fetch(fileUrl, {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      })
                      .then(response => {
                        if (response.ok) {
                          return response.blob();
                        }
                        throw new Error('Échec du téléchargement');
                      })
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName || 'document';
                        link.click();
                        window.URL.revokeObjectURL(url);
                      })
                      .catch(error => {
                        console.error('Erreur de téléchargement:', error);
                        alert('Erreur lors du téléchargement du fichier');
                      });
                    } else {
                      // Téléchargement direct pour les fichiers publics
                      const link = document.createElement('a');
                      link.href = fileUrl;
                      link.download = fileName || 'document';
                      link.click();
                    }
                  }}
                  className={`inline-flex items-center px-3 py-1 text-xs ${fileTypeInfo.color} ${fileTypeInfo.bgColor} border ${fileTypeInfo.borderColor} rounded hover:bg-opacity-80 transition-colors`}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDisplay;