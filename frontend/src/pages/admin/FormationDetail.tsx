import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Trash2, Edit, FileText, Users, Settings, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import { adminFormationsApi } from '../../services/api';

interface Formation {
  id: number;
  title: string;
  description?: string;
  type: string;
  duration: number;
  price: number;
  isActive: boolean;
  modules?: Module[];
  prerequisites?: Prerequisite[];
  documents?: Document[];
  sessions?: Session[];
}

interface Module {
  id?: number;
  title: string;
  duration: number;
  position: number;
  points: ModulePoint[];
}

interface ModulePoint {
  id?: number;
  content: string;
}

interface Prerequisite {
  id?: number;
  description: string;
}

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  downloadUrl: string;
}

interface Session {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  status: string;
  instructor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const FormationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Form states pour l'édition
  const [formData, setFormData] = useState<Partial<Formation>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFormationDetails();
    }
  }, [id]);

  const fetchFormationDetails = async () => {
    try {
      setLoading(true);
      const response = await adminFormationsApi.getById(parseInt(id!));
      setFormation(response.data);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching formation details:', err);
      setError('Erreur lors du chargement des détails de la formation');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formation || !formData) return;

    try {
      setUpdating(true);
      await adminFormationsApi.update(formation.id, formData);
      setFormation({ ...formation, ...formData });
      setIsEditing(false);
      addToast('Formation mise à jour avec succès', 'success');
    } catch (err) {
      console.error('Error updating formation:', err);
      addToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUpdating(true);
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('documents[]', selectedFiles[i]);
      }

      await adminFormationsApi.uploadDocuments(formation!.id, formData);
      await fetchFormationDetails(); // Recharger les données
      setShowUploadModal(false);
      setSelectedFiles(null);
      addToast('Documents téléchargés avec succès', 'success');
    } catch (err) {
      console.error('Error uploading documents:', err);
      addToast('Erreur lors du téléchargement', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      setUpdating(true);
      await adminFormationsApi.deleteDocument(formation!.id, documentId);
      await fetchFormationDetails();
      addToast('Document supprimé avec succès', 'success');
    } catch (err) {
      console.error('Error deleting document:', err);
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const formatType = (type: string): string => {
    const types: { [key: string]: string } = {
      'initial': 'Formation Initiale',
      'continuous': 'Formation Continue',
      'mobility': 'Formation Mobilité'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'info', label: 'Informations', icon: Settings },
    { id: 'modules', label: 'Modules', icon: FileText },
    { id: 'prerequisites', label: 'Prérequis', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'sessions', label: 'Sessions', icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title="Chargement..." />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title="Formation introuvable" />
          <div className="p-6">
            <Alert type="error" message="Formation non trouvée" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader 
          title={`Formation: ${formation.title}`}
          breadcrumbItems={[
            { label: 'Admin', path: '/admin' },
            { label: 'Formations', path: '/admin/formations' },
            { label: formation.title }
          ]}
        />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Header avec boutons d'action */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/admin/formations')}
              className="flex items-center text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à la liste
            </button>

            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(formation);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={updating}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>

          {/* Système d'onglets */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Onglet Informations */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre*
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={isEditing ? formData.title || '' : formation.title}
                        onChange={(e) => isEditing && setFormData({...formData, title: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type*
                      </label>
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={isEditing ? formData.type || '' : formation.type}
                        onChange={(e) => isEditing && setFormData({...formData, type: e.target.value})}
                        disabled={!isEditing}
                      >
                        <option value="initial">Formation Initiale</option>
                        <option value="continuous">Formation Continue</option>
                        <option value="mobility">Formation Mobilité</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée (heures)*
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={isEditing ? formData.duration || '' : formation.duration}
                        onChange={(e) => isEditing && setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix (€)*
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={isEditing ? formData.price || '' : formation.price}
                        onChange={(e) => isEditing && setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={isEditing ? formData.description || '' : formation.description || ''}
                      onChange={(e) => isEditing && setFormData({...formData, description: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={isEditing ? formData.isActive ?? formation.isActive : formation.isActive}
                        onChange={(e) => isEditing && setFormData({...formData, isActive: e.target.checked})}
                        disabled={!isEditing}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Formation active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Documents de formation</h3>
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter des documents
                    </Button>
                  </div>

                  {formation.documents && formation.documents.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {formation.documents.map((document) => (
                          <li key={document.id} className="px-4 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{document.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {document.fileName} • {document.fileSize} • {formatDate(document.uploadedAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={document.downloadUrl}
                                  download
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Télécharger
                                </a>
                                <button
                                  onClick={() => handleDeleteDocument(document.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
                      <p className="text-gray-500 mb-4">
                        Aucun document n'a été ajouté à cette formation.
                      </p>
                      <Button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter le premier document
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Autres onglets - à compléter */}
              {activeTab === 'modules' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Gestion des modules - À implémenter</p>
                </div>
              )}

              {activeTab === 'prerequisites' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Gestion des prérequis - À implémenter</p>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Sessions liées - À implémenter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'upload de documents */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Ajouter des documents"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleFileUpload}
              loading={updating}
              disabled={!selectedFiles || selectedFiles.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner les fichiers
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedFiles.length} fichier(s) sélectionné(s)
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FormationDetail;