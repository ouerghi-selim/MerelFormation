import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Car, 
  Clock, 
  DollarSign, 
  Phone, 
  User, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Home,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  X
} from 'lucide-react';
import { FileDisplay } from '../components/common/FileDisplay';
import { 
  trackRental, 
  getStatusColor, 
  getStatusText, 
  getStatusIcon,
  getProgressPhases,
  getCurrentPhase,
  getNextSteps,
  VehicleRentalTracking,
  ProgressPhase
} from '../services/vehicleRentalTrackingService';
import { vehicleRentalDocumentsApi, adminContentTextApi } from '../services/api';

// Interface pour les documents
interface RentalDocument {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  downloadUrl: string;
}

// Interface pour le contenu CMS
interface CMSContent {
  [key: string]: string;
}

const RentalTrackingPage: React.FC = () => {
  const { trackingToken } = useParams<{ trackingToken: string }>();
  const [rental, setRental] = useState<VehicleRentalTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour la gestion des documents
  const [documents, setDocuments] = useState<RentalDocument[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tempDocuments, setTempDocuments] = useState<{tempId: string, document: any}[]>([]);

  // États pour le contenu CMS
  const [cmsContent, setCmsContent] = useState<CMSContent>({});

  // Fonction pour récupérer le contenu CMS
  const fetchCMSContent = async () => {
    try {
      // Récupérer tous les contenus texte pour les sections de tracking
      const contentResponse = await adminContentTextApi.getAll({
        section: ['tracking_header', 'tracking_progress', 'tracking_history', 'tracking_documents', 'tracking_invoice', 'tracking_status', 'tracking_footer'].join(','),
        limit: 100
      });
      
      // Transformer en objet avec identifiants comme clés
      const contentMap: CMSContent = {};
      if (contentResponse.data?.data) {
        contentResponse.data.data.forEach((item: any) => {
          contentMap[item.identifier] = item.content;
        });
      }
      setCmsContent(contentMap);
    } catch (err) {
      console.error('Erreur lors du chargement du contenu CMS:', err);
      // En cas d'erreur, utiliser les valeurs par défaut
      setCmsContent({
        'tracking_header_title': 'Suivi de réservation',
        'tracking_header_description': 'Suivez l\'évolution de votre demande de réservation en temps réel',
        'tracking_progress_title': 'Progression de votre réservation',
        'tracking_invoice_title': 'Facture disponible',
        'tracking_invoice_description': 'Votre facture est prête et peut être téléchargée',
        'tracking_invoice_download_button': 'Télécharger la facture',
        'tracking_documents_title': 'Documents de votre réservation',
        'tracking_history_title': 'Historique détaillé',
        'tracking_status_awaiting_docs': 'Veuillez fournir les documents demandés pour continuer le traitement de votre réservation',
        'tracking_status_no_docs': 'Aucun document complémentaire n\'est associé à cette réservation',
        'tracking_footer_note': 'Conservez ce lien pour suivre l\'évolution de votre demande',
        'tracking_footer_brand': 'MerelFormation'
      });
    }
  };

  // Fonction pour vérifier si l'upload de documents est autorisé
  const canUploadDocuments = (status: string): boolean => {
    return status === 'awaiting_documents';
  };

  // Fonction pour vérifier si la suppression de documents est autorisée
  const canDeleteDocuments = (status: string): boolean => {
    return status === 'awaiting_documents';
  };

  // Fonction pour récupérer les documents associés à la réservation
  const fetchDocuments = async (rentalId: number) => {
    try {
      const response = await vehicleRentalDocumentsApi.getByRental(rentalId);
      const documentsData = response.data.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
        downloadUrl: vehicleRentalDocumentsApi.getDownloadUrl(doc.id)
      }));
      setDocuments(documentsData);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // En cas d'erreur, laisser documents vide
      setDocuments([]);
    }
  };

  // Fonction pour uploader un document
  const handleDocumentUpload = async (file: File, title: string) => {
    if (!rental) return;

    try {
      setUploading(true);
      setUploadError(null);

      // Étape 1: Upload temporaire
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('vehicleRentalId', rental.id.toString());

      const tempResponse = await vehicleRentalDocumentsApi.tempUpload(formData);
      const tempId = tempResponse.data.tempId;
      
      // Ajouter au state des documents temporaires
      setTempDocuments(prev => [...prev, {
        tempId,
        document: tempResponse.data.document
      }]);

      // Étape 2: Finaliser immédiatement (pour les documents de réservation de véhicule)
      const finalizeResponse = await vehicleRentalDocumentsApi.finalizeDocuments({
        tempIds: [tempId],
        vehicleRentalId: rental.id
      });

      // Retirer des documents temporaires
      setTempDocuments(prev => prev.filter(temp => temp.tempId !== tempId));
      
      // Recharger la liste des documents
      await fetchDocuments(rental.id);
      
      setUploadSuccess('Document uploadé avec succès !');
      setShowUploadModal(false);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setUploadSuccess(null), 3000);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'upload du document';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour supprimer un document
  const handleDocumentDelete = async (documentId: number) => {
    try {
      await vehicleRentalDocumentsApi.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setUploadSuccess('Document supprimé avec succès !');
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression du document';
      setUploadError(errorMessage);
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  const fetchRental = async () => {
    if (!trackingToken) return;
    
    try {
      setRefreshing(true);
      const data = await trackRental(trackingToken);
      setRental(data);
      setError(null);
      
      // Récupérer les documents associés pour toutes les réservations
      if (data) {
        await fetchDocuments(data.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      console.error('Error tracking rental:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRental();
    fetchCMSContent();
  }, [trackingToken]);

  const handleRefresh = () => {
    fetchRental();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chargement du suivi...</h3>
          <p className="mt-2 text-gray-500">Récupération des informations de votre réservation</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Réservation introuvable
            </h3>
            <p className="text-gray-500 mb-6">
              {error || 'Le lien de suivi est invalide ou a expiré.'}
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleRefresh}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
              <Link 
                to="/" 
                className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900"
                    dangerouslySetInnerHTML={{__html: cmsContent['tracking_header_title'] || 'Suivi de réservation'}}>
                </h1>
                <p className="text-gray-500">
                  Réservation #{rental.id} • {rental.customerName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <Link 
                to="/" 
                className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Link>
            </div>
          </div>

          {/* Status principal */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(rental.status)}`}>
            <span className="text-2xl mr-2">{getStatusIcon(rental.status)}</span>
            <span className="font-medium text-lg">{getStatusText(rental.status)}</span>
          </div>
        </div>

        {/* Progression visuelle par phases */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            <span dangerouslySetInnerHTML={{__html: cmsContent['tracking_progress_title'] || 'Progression de votre réservation'}} />
          </h2>
          
          <div className="relative">
            {/* Barre de progression */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
            <div 
              className="absolute top-6 left-6 h-0.5 bg-blue-600 transition-all duration-500"
              style={{ width: `${(getCurrentPhase(rental.status) - 1) * 20}%` }}
            ></div>
            
            {/* Phases */}
            <div className="grid grid-cols-6 gap-2">
              {getProgressPhases().map((phase) => {
                const isActive = phase.statuses.includes(rental.status);
                const isCompleted = getCurrentPhase(rental.status) > phase.id;
                const isCurrentPhase = getCurrentPhase(rental.status) === phase.id;
                
                return (
                  <div key={phase.id} className="text-center">
                    {/* Icône de phase */}
                    <div className={`
                      relative mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : isCurrentPhase 
                          ? `bg-${phase.color}-100 border-${phase.color}-500 text-${phase.color}-700` 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}>
                      {isCompleted ? '✓' : phase.icon}
                      {isCurrentPhase && (
                        <div className="absolute -inset-1 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>
                    
                    {/* Titre de phase */}
                    <h3 className={`
                      text-xs font-medium mb-1
                      ${isCompleted || isCurrentPhase ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {phase.title}
                    </h3>
                    
                    {/* Description */}
                    <p className={`
                      text-xs leading-4
                      ${isCompleted || isCurrentPhase ? 'text-gray-600' : 'text-gray-400'}
                    `}>
                      {phase.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Prochaines étapes */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Prochaines étapes
            </h3>
            <ul className="space-y-1">
              {getNextSteps(rental.status).map((step, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Timeline des statuts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            <span dangerouslySetInnerHTML={{__html: cmsContent['tracking_history_title'] || 'Historique détaillé'}} />
          </h2>
          <div className="space-y-4">
            {rental.statusHistory.map((item, index) => {
              const isCurrentStatus = item.status === rental.status;
              const statusColor = getStatusColor(item.status);
              
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isCurrentStatus 
                      ? 'bg-blue-500 text-white border-2 border-blue-300 animate-pulse' 
                      : statusColor.replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-') + ' border'
                  }`}>
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        isCurrentStatus ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {getStatusText(item.status)}
                      </p>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description || 'Mise à jour du statut de votre réservation'}
                    </p>
                    
                    {/* Badge de statut actuel */}
                    {isCurrentStatus && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          <span className="mr-1">●</span>
                          Statut actuel
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Message si aucun historique */}
            {rental.statusHistory.length === 0 && (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun historique disponible</h3>
                <p className="mt-1 text-sm text-gray-500">
                  L'historique des changements apparaîtra ici au fur et à mesure.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du véhicule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Car className="mr-2 h-5 w-5 text-blue-600" />
              Véhicule réservé
            </h2>
            {rental.vehicle.model || rental.vehicle.plate || rental.vehicle.category ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Modèle</label>
                  <p className="text-lg font-medium text-gray-900">
                    {rental.vehicle.model || <span className="text-gray-400 italic">En cours d'attribution</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Plaque d'immatriculation</label>
                  <p className="text-gray-900 font-mono">
                    {rental.vehicle.plate || <span className="text-gray-400 italic">Non attribuée</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Catégorie</label>
                  <p className="text-gray-900">
                    {rental.vehicle.category || <span className="text-gray-400 italic">À définir</span>}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Véhicule en cours d'attribution</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Le véhicule sera attribué après validation de votre demande
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates et prix */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Détails de la réservation
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Début de location</label>
                <p className="text-gray-900">
                  {new Date(rental.startDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fin de location</label>
                <p className="text-gray-900">
                  {new Date(rental.endDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Prix total</label>
                {parseFloat(rental.totalPrice) > 0 ? (
                  <p className="text-2xl font-bold text-green-600">{rental.totalPrice}€</p>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-400 italic">En cours de calcul</p>
                    <Clock className="ml-2 h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-purple-600" />
            Vos informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Nom</label>
                <p className="text-gray-900">{rental.customerName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{rental.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-gray-900">{rental.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations examen */}
        {rental.examTime && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
              <FileText className="mr-2 h-5 w-5" />
              Réservation pour examen
            </h2>
            <div className="bg-white rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-600 mb-1">Date d'examen</label>
                  <p className="text-lg font-medium text-purple-900">
                    {new Date(rental.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-600 mb-1">Heure d'examen</label>
                  <p className="text-lg font-medium text-purple-900">
                    {rental.examTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {(rental.notes || rental.adminNotes) && (
          <div className="space-y-4 mt-6">
            {rental.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-amber-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Vos notes
                </h3>
                <p className="text-amber-900 bg-white rounded p-3">{rental.notes}</p>
              </div>
            )}
            
            {rental.adminNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Informations de l'équipe
                </h3>
                <p className="text-blue-900 bg-white rounded p-3">{rental.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Section Documents - Toujours visible */}
        {rental && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-orange-600" />
                <span dangerouslySetInnerHTML={{__html: cmsContent['tracking_documents_title'] || 'Documents de votre réservation'}} />
              </h2>
              {canUploadDocuments(rental.status) && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Ajouter un document
                </button>
              )}
            </div>

            {/* Documents de permis de conduire */}
            {(rental.driverLicense?.frontFile || rental.driverLicense?.backFile) && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Votre permis de conduire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rental.driverLicense.frontFile && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="p-3 bg-blue-100 border-b border-blue-200">
                        <h4 className="text-sm font-medium text-blue-900 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Permis - Recto
                        </h4>
                      </div>
                      <div className="p-3">
                        <FileDisplay
                          fileName={rental.driverLicense.frontFile}
                          baseUrl="/uploads/licenses"
                          title="Permis de conduire - Recto"
                        />
                      </div>
                    </div>
                  )}
                  {rental.driverLicense.backFile && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="p-3 bg-green-100 border-b border-green-200">
                        <h4 className="text-sm font-medium text-green-900 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Permis - Verso
                        </h4>
                      </div>
                      <div className="p-3">
                        <FileDisplay
                          fileName={rental.driverLicense.backFile}
                          baseUrl="/uploads/licenses"
                          title="Permis de conduire - Verso"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages de succès/erreur */}
            {uploadSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                <p className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {uploadSuccess}
                </p>
              </div>
            )}

            {uploadError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p className="flex items-center">
                  <XCircle className="mr-2 h-4 w-4" />
                  {uploadError}
                </p>
              </div>
            )}

            {/* Section Facture - Mise en avant */}
            {(() => {
              const invoice = documents.find(doc => 
                doc.title.startsWith('INVOICE_') || doc.title.startsWith('[FACTURE]')
              );
              
              return invoice ? (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 flex items-center"
                          dangerouslySetInnerHTML={{__html: cmsContent['tracking_invoice_title'] || 'Facture disponible'}}>
                      </h3>
                      <p className="text-sm text-green-700"
                         dangerouslySetInnerHTML={{__html: cmsContent['tracking_invoice_description'] || 'Votre facture est prête et peut être téléchargée'}}>
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-900">{invoice.title}</p>
                          <p className="text-sm text-green-700">
                            {invoice.fileType.toUpperCase()} • {invoice.fileSize} • 
                            Généré le {new Date(invoice.uploadedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={invoice.downloadUrl}
                          download
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span dangerouslySetInnerHTML={{__html: cmsContent['tracking_invoice_download_button'] || 'Télécharger la facture'}} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Séparateur et titre pour autres documents */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-orange-600" />
                Autres documents
              </h3>
            </div>

            {/* Instructions selon le statut - seulement si upload possible */}
            {canUploadDocuments(rental.status) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">Documents en attente</h3>
                    <p className="text-sm text-orange-700 mt-1"
                       dangerouslySetInnerHTML={{__html: cmsContent['tracking_status_awaiting_docs'] || 'Veuillez fournir les documents demandés pour continuer le traitement de votre réservation.'}}>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des documents (exclure les factures) */}
            {documents.filter(doc => !doc.title.startsWith('INVOICE_') && !doc.title.startsWith('[FACTURE]')).length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Documents soumis</h3>
                {documents.filter(doc => !doc.title.startsWith('INVOICE_') && !doc.title.startsWith('[FACTURE]')).map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{document.title}</p>
                        <p className="text-xs text-gray-500">
                          {document.fileType.toUpperCase()} • {document.fileSize} • 
                          Uploadé le {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={document.downloadUrl}
                        download
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger
                      </a>
                      {canDeleteDocuments(rental.status) && (
                        <button
                          onClick={() => handleDocumentDelete(document.id)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
                {canUploadDocuments(rental.status) ? (
                  <p className="mt-1 text-sm text-gray-500">
                    Aucun document complémentaire n'a encore été uploadé pour cette réservation.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500"
                     dangerouslySetInnerHTML={{__html: cmsContent['tracking_status_no_docs'] || "Aucun document complémentaire n'est associé à cette réservation."}}>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Réservation créée le {new Date(rental.createdAt).toLocaleDateString('fr-FR')} à {new Date(rental.createdAt).toLocaleTimeString('fr-FR')}
          </p>
          <p className="text-xs text-gray-400">
            <span dangerouslySetInnerHTML={{__html: cmsContent['tracking_footer_note'] || 'Conservez ce lien pour suivre l\'évolution de votre demande'}} />
            {' • '}
            <span dangerouslySetInnerHTML={{__html: cmsContent['tracking_footer_brand'] || 'MerelFormation'}} />
          </p>
        </div>

        {/* Modal d'upload de documents */}
        {showUploadModal && (
          <DocumentUploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              setUploadError(null);
            }}
            onUpload={handleDocumentUpload}
            uploading={uploading}
          />
        )}
      </div>
    </div>
  );
};

// Composant Modal d'Upload de Documents
interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string) => void;
  uploading: boolean;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  uploading
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      // Auto-générer le titre basé sur le nom du fichier
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Enlever l'extension
      setTitle(fileName);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) {
      return;
    }

    onUpload(selectedFile, title.trim());
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setDragActive(false);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Ajouter un document</h3>
          <button
            onClick={handleClose}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: Permis de conduire, Carte professionnelle..."
                required
                disabled={uploading}
              />
            </div>

            {/* Zone de drop de fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier *
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-orange-400 bg-orange-50' 
                    : selectedFile 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm font-medium text-green-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                      disabled={uploading}
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Cliquez pour choisir</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </p>
                  </label>
                )}
                
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !title.trim() || uploading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

export default RentalTrackingPage;