import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, ChevronDown, Upload, Plus, X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import StudentHeader from '../../components/student/StudentHeader';
import { studentDocumentsApi } from '@/services/api.ts';

interface Document {
  id: number;
  title: string;
  type: string;
  source: string; // 'formation' | 'session' | 'inscription' | 'direct'
  sourceTitle: string;
  sourceId: number | null;
  date: string; // Format d/m/Y
  uploadedAt: string; // Format Y-m-d H:i:s
  fileName: string;
  fileSize: string; // Formaté (ex: "1.2 MB")
  fileType: string;
  downloadUrl: string;
  senderRole?: string; // Pour les documents directs
  validationStatus?: string;
  validatedAt?: string;
  validatedBy?: {
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
}

// Documents obligatoires définis comme dans le système d'inscription
const REQUIRED_DOCUMENTS = [
  { key: 'driverLicenseRecto', title: 'Permis de conduire (recto)', description: 'Recto de votre permis de conduire en cours de validité' },
  { key: 'driverLicenseVerso', title: 'Permis de conduire (verso)', description: 'Verso de votre permis de conduire en cours de validité' },
  { key: 'professionalCard', title: 'Carte professionnelle', description: 'Carte professionnelle VTC ou taxi' },
  { key: 'convocation', title: 'Convocation', description: 'Convocation à l\'examen ou formation' }
];

const DocumentsStudent: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadingDocumentType, setUploadingDocumentType] = useState<string | null>(null);

  // Fonction pour afficher le badge de statut de validation
  const getValidationStatusBadge = (document: Document) => {
    const status = document.validationStatus || 'en_attente';
    
    switch (status) {
      case 'valide':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'rejete':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
    }
  };

  // Fonction pour vérifier si un document peut être modifié/supprimé
  const canModifyDocument = (document: Document) => {
    return document.source === 'inscription' && document.validationStatus !== 'valide';
  };

  // Fonction pour vérifier si l'utilisateur peut uploader des documents d'inscription
  const canUploadRegistrationDocument = () => {
    const registrationDocs = documents.filter(doc => doc.source === 'inscription');
    // Autoriser l'upload s'il n'y a pas de documents d'inscription ou s'ils sont tous rejetés
    return registrationDocs.length === 0 || registrationDocs.every(doc => doc.validationStatus === 'rejete');
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);

        // Remplaçons le mock par l'appel API réel
        const response = await studentDocumentsApi.getAll();
        setDocuments(response.data);
        setFilteredDocuments(response.data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Erreur lors du chargement des documents');
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);


  useEffect(() => {
    let filtered = documents;

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(document => document.source === sourceFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(document =>
          document.title.toLowerCase().includes(query) ||
          document.sourceTitle.toLowerCase().includes(query)
      );
    }

    setFilteredDocuments(filtered);
  }, [sourceFilter, searchQuery, documents]); // Changer typeFilter en sourceFilter

  // Fonction pour vérifier si un document obligatoire existe
  const getRequiredDocumentStatus = () => {
    const inscriptionDocuments = documents.filter(doc => doc.source === 'inscription');
    
    return REQUIRED_DOCUMENTS.map(requiredDoc => {
      const existingDoc = inscriptionDocuments.find(doc => 
        doc.title.toLowerCase().includes(requiredDoc.title.toLowerCase()) ||
        doc.title === requiredDoc.title
      );
      
      return {
        ...requiredDoc,
        exists: !!existingDoc,
        document: existingDoc
      };
    });
  };

  const handleUpload = async (formData: FormData) => {
    try {
      setUploading(true);
      setError(null);
      
      const response = await studentDocumentsApi.upload(formData);
      
      setUploadSuccess('Document uploadé avec succès !');
      setShowUploadModal(false);
      
      // Recharger la liste des documents
      const documentsResponse = await studentDocumentsApi.getAll();
      setDocuments(documentsResponse.data);
      setFilteredDocuments(documentsResponse.data);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setUploadSuccess(null), 3000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'upload du document';
      setError(errorMessage);
    } finally {
      setUploading(false);
      setUploadingDocumentType(null);
    }
  };

  // Upload spécifique pour documents obligatoires
  const handleRequiredDocumentUpload = async (file: File, documentKey: string, documentTitle: string) => {
    try {
      setUploadingDocumentType(documentKey);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', documentTitle);
      formData.append('documentType', documentKey);
      
      const response = await studentDocumentsApi.upload(formData);
      
      setUploadSuccess(`${documentTitle} uploadé avec succès !`);
      
      // Recharger la liste des documents
      const documentsResponse = await studentDocumentsApi.getAll();
      setDocuments(documentsResponse.data);
      setFilteredDocuments(documentsResponse.data);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setUploadSuccess(null), 3000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Erreur lors de l'upload de ${documentTitle}`;
      setError(errorMessage);
    } finally {
      setUploadingDocumentType(null);
    }
  };

  const getTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'text-red-600';
      case 'doc':
      case 'docx':
        return 'text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'text-green-600';
      case 'ppt':
      case 'pptx':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <StudentHeader />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Mes documents
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-3 text-gray-400"/>
              <select
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">Toutes les sources</option>
                <option value="formation">Formations</option>
                <option value="session">Sessions</option>
                <option value="inscription">Documents d'inscription</option>
                <option value="direct">Documents directs</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400"/>
            </div>

            {canUploadRegistrationDocument() ? (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Ajouter un document
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  Ajouter un document
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    Documents d'inscription en cours de validation
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
        )}

        {uploadSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p>{uploadSuccess}</p>
            </div>
        )}

        {/* Section des documents obligatoires */}
        <RequiredDocumentsSection 
          requiredDocuments={getRequiredDocumentStatus()}
          onUpload={handleRequiredDocumentUpload}
          uploadingDocumentType={uploadingDocumentType}
          getValidationStatusBadge={getValidationStatusBadge}
          canUploadRegistrationDocument={canUploadRegistrationDocument}
        />

        {/* Section de tous les documents */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Tous mes documents
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Parcourez et gérez tous vos documents par source
            </p>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-600 mb-4">
              {documents.length > 0
                ? "Aucun document ne correspond à vos critères de recherche."
                : "Vous n'avez aucun document disponible pour le moment."}
            </p>
            {documents.length > 0 && (
                <button
                    onClick={() => {
                      setSourceFilter('all');
                      setSearchQuery('');
                    }}
                    className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
            )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du document
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FileText className={`h-5 w-5 ${getTypeIcon(document.fileType)}`}/>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">{document.fileType.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        document.source === 'formation'
            ? 'bg-blue-100 text-blue-800'
            : document.source === 'session'
            ? 'bg-green-100 text-green-800'
            : document.source === 'direct'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
    }`}>
      {document.source === 'formation' ? 'Formation' : 
       document.source === 'session' ? 'Session' : 
       document.source === 'direct' ? 'Direct' : 'Autre'}
    </span>
                          <span className="ml-2 text-sm text-gray-900">{document.sourceTitle}</span>
                          {document.source === 'direct' && document.senderRole && (
                            <span className="ml-1 text-xs text-gray-500">({document.senderRole})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.fileSize}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {document.source === 'inscription' ? getValidationStatusBadge(document) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                          {/* Informations de validation pour les documents d'inscription */}
                          {document.source === 'inscription' && document.validatedAt && document.validatedBy && (
                            <p className="text-xs text-gray-500">
                              Par {document.validatedBy.firstName} {document.validatedBy.lastName}
                            </p>
                          )}
                          {/* Raison du rejet */}
                          {document.source === 'inscription' && document.validationStatus === 'rejete' && document.rejectionReason && (
                            <div className="max-w-xs">
                              <p className="text-xs text-red-600 bg-red-50 p-1 rounded border">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                {document.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <a
                            href={document.downloadUrl}
                            download
                            className="inline-flex items-center px-3 py-1 border border-blue-700 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1"/>
                          Télécharger
                        </a>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>

        {/* Modal d'upload */}
        {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} uploading={uploading} />}
      </main>
    </div>
  );
};

// Composant Modal d'Upload
interface UploadModalProps {
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  uploading: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, uploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        // Auto-générer le titre basé sur le nom du fichier
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Enlever l'extension
        setTitle(fileName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('documentType', 'libre'); // Type libre pour uploads personnalisés

    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Ajouter un document libre</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Titre du document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du document *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Document complémentaire, Justificatif..."
                required
                disabled={uploading}
              />
            </div>

            {/* Sélection du fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier *
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={uploading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Formats acceptés: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (max 10MB)
              </p>
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>Fichier sélectionné:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !title.trim() || uploading}
              className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Uploader
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant pour la section des documents obligatoires
interface RequiredDocumentsProps {
  requiredDocuments: Array<{
    key: string;
    title: string;
    description: string;
    exists: boolean;
    document?: Document;
  }>;
  onUpload: (file: File, documentKey: string, documentTitle: string) => void;
  uploadingDocumentType: string | null;
  getValidationStatusBadge: (document: Document) => React.ReactElement;
  canUploadRegistrationDocument: () => boolean;
}

const RequiredDocumentsSection: React.FC<RequiredDocumentsProps> = ({ 
  requiredDocuments, 
  onUpload, 
  uploadingDocumentType,
  getValidationStatusBadge,
  canUploadRegistrationDocument
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, documentKey: string, documentTitle: string) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, documentKey, documentTitle);
    }
    // Reset the input value
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Documents d'inscription obligatoires
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Vérifiez que vous avez fourni tous les documents requis pour votre inscription
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-4">
          {requiredDocuments.map((doc) => (
            <div 
              key={doc.key} 
              className={`flex items-center justify-between p-4 border rounded-lg ${
                doc.exists ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  doc.exists ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div>
                  <h3 className="font-medium text-gray-800">{doc.title}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  {doc.exists && doc.document && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Fourni le {doc.document.date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.exists ? (
                  <>
                    {doc.document && (
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.document.downloadUrl}
                          download
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger
                        </a>
                        {doc.document.validationStatus && getValidationStatusBadge(doc.document)}
                      </div>
                    )}
                    {!doc.document?.validationStatus && (
                      <span className="text-sm text-green-600 font-medium">Complet</span>
                    )}
                    {/* Message informatif si document validé */}
                    {doc.document?.validationStatus === 'valide' && (
                      <p className="text-xs text-green-600 mt-1">
                        Document validé - Modification non autorisée
                      </p>
                    )}
                    {/* Possibilité de re-upload si document rejeté */}
                    {doc.document?.validationStatus === 'rejete' && (
                      <>
                        <input
                          type="file"
                          id={`reupload-${doc.key}`}
                          onChange={(e) => handleFileUpload(e, doc.key, doc.title)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                          className="hidden"
                          disabled={uploadingDocumentType === doc.key}
                        />
                        <label
                          htmlFor={`reupload-${doc.key}`}
                          className={`cursor-pointer inline-flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                            uploadingDocumentType === doc.key 
                              ? 'bg-gray-100 text-gray-400' 
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          {uploadingDocumentType === doc.key ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                              Upload...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Remplacer
                            </>
                          )}
                        </label>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      id={`upload-${doc.key}`}
                      onChange={(e) => handleFileUpload(e, doc.key, doc.title)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                      className="hidden"
                      disabled={uploadingDocumentType === doc.key}
                    />
                    <label
                      htmlFor={`upload-${doc.key}`}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors cursor-pointer ${
                        uploadingDocumentType === doc.key ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingDocumentType === doc.key ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Upload...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Uploader
                        </>
                      )}
                    </label>
                    <span className="text-sm text-amber-600 font-medium">Manquant</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Formats acceptés:</strong> PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentsStudent;
