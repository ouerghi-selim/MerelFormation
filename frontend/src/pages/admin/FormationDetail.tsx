import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  Plus,
  Trash2,
  Upload,
  Download,
  FileText,
  Calendar,
  Users,
  MapPin,
  ChevronUp,
  ChevronDown,
  Car,
  CreditCard,
  Image
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import { adminFormationsApi, documentsApi } from '@/services/api.ts';
import WysiwygEditor from '../../components/common/WysiwygEditor';

interface Formation {
  id: number;
  title: string;
  description?: string;
  type: string;
  duration: number;
  price: number;
  isActive: boolean;
  modules?: ModuleInput[];
  prerequisites?: PrerequisiteInput[];
  practicalInfo?: PracticalInfoInput;
  documents?: DocumentInput[];
  sessions?: SessionInput[];
}

interface ModuleInput {
  id?: number;
  title: string;
  duration: number;
  position: number;
  points: ModulePointInput[];
}

interface ModulePointInput {
  id?: number;
  content: string;
}

interface PrerequisiteInput {
  id?: number;
  description: string;
}

interface DocumentInput {
  id: number;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: String;
  downloadUrl: string;
}

interface SessionInput {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  maxParticipants: number;
  participantsCount: number;
}

interface PracticalInfoInput {
  id?: number;
  title: string;
  description: string;
  image?: string;
}

const FormationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  // États principaux
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  // États pour les modules
  const [modules, setModules] = useState<ModuleInput[]>([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleInput | null>(null);

  // États pour les prérequis
  const [prerequisites, setPrerequisites] = useState<PrerequisiteInput[]>([]);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [editingPrerequisite, setEditingPrerequisite] = useState<PrerequisiteInput | null>(null);

  // États pour la partie pratique
  const [practicalInfo, setPracticalInfo] = useState<PracticalInfoInput | null>(null);
  const [showPracticalModal, setShowPracticalModal] = useState(false);

  // États pour les documents
  const [documents, setDocuments] = useState<DocumentInput[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // États pour les documents temporaires (nouveau système)
  const [tempDocuments, setTempDocuments] = useState<{tempId: string, document: any}[]>([]);
  const [pendingTempIds, setPendingTempIds] = useState<string[]>([]);

  // Validation des erreurs
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Charger les données de la formation
  useEffect(() => {
    const fetchFormation = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await adminFormationsApi.getById(parseInt(id));
        const formationData = response.data;

        setFormation(formationData);
        setModules(formationData.modules || []);
        setPrerequisites(formationData.prerequisites || []);
        setPracticalInfo(formationData.practicalInfo || null);
        setDocuments(formationData.documents || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching formation:', err);
        setError('Erreur lors du chargement de la formation');
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!formation) return false;

    const errors: {[key: string]: string} = {};

    if (!formation.title?.trim()) {
      errors.title = 'Le titre est requis';
    }
    if (!formation.description?.trim()) {
      errors.description = 'La description est requise';
    }
    if (!formation.price || formation.price <= 0) {
      errors.price = 'Le prix doit être positif';
    }
    if (!formation.duration || formation.duration <= 0) {
      errors.duration = 'La durée doit être positive';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!formation || !validateForm()) return;

    try {
      setUpdating(true);
      const updatedFormation = {
        ...formation,
        modules: modules.map((module, index) => ({
          ...module,
          position: index + 1
        })),
        prerequisites,
        practicalInfo
      };

      // 1. Mettre à jour la formation
      await adminFormationsApi.update(formation.id, updatedFormation);

      // 2. Finaliser les documents temporaires s'il y en a
      if (pendingTempIds.length > 0) {
        try {
          const response = await documentsApi.finalizeDocuments({
            tempIds: pendingTempIds,
            entityType: 'formation',
            entityId: formation.id
          });

          // Ajouter les nouveaux documents à la liste
          if (response.data.documents) {
            setDocuments(prev => [...prev, ...response.data.documents]);
          }

          // Nettoyer les documents temporaires
          setTempDocuments([]);
          setPendingTempIds([]);
          
          addToast('Formation et documents mis à jour avec succès', 'success');
        } catch (docErr) {
          console.error('Error finalizing documents:', docErr);
          addToast('Formation mise à jour, mais erreur lors de la finalisation des documents', 'warning');
        }
      } else {
        addToast('Formation mise à jour avec succès', 'success');
      }

      setEditMode(false);
    } catch (err) {
      console.error('Error updating formation:', err);
      addToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Gestion des modules
  const addModule = () => {
    setEditingModule({
      title: '',
      duration: 0,
      position: modules.length + 1,
      points: []
    });
    setShowModuleModal(true);
  };

  const editModule = (module: ModuleInput) => {
    setEditingModule({ ...module });
    setShowModuleModal(true);
  };

  const saveModule = () => {
    if (!editingModule) return;

    if (editingModule.id) {
      // Modification
      setModules(modules.map(m => m.id === editingModule.id ? editingModule : m));
    } else {
      // Ajout
      setModules([...modules, { ...editingModule, id: Date.now() }]);
    }

    setShowModuleModal(false);
    setEditingModule(null);
  };

  const deleteModule = (moduleId: number) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const moveModuleUp = (index: number) => {
    if (index === 0) return;
    const newModules = [...modules];
    [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];
    setModules(newModules);
  };

  const moveModuleDown = (index: number) => {
    if (index === modules.length - 1) return;
    const newModules = [...modules];
    [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
    setModules(newModules);
  };

  // Gestion des prérequis
  const addPrerequisite = () => {
    setEditingPrerequisite({ description: '' });
    setShowPrerequisiteModal(true);
  };

  const editPrerequisite = (prerequisite: PrerequisiteInput) => {
    setEditingPrerequisite({ ...prerequisite });
    setShowPrerequisiteModal(true);
  };

  const savePrerequisite = () => {
    if (!editingPrerequisite) return;

    if (editingPrerequisite.id) {
      setPrerequisites(prerequisites.map(p => p.id === editingPrerequisite.id ? editingPrerequisite : p));
    } else {
      setPrerequisites([...prerequisites, { ...editingPrerequisite, id: Date.now() }]);
    }

    setShowPrerequisiteModal(false);
    setEditingPrerequisite(null);
  };

  const deletePrerequisite = (prerequisiteId: number) => {
    setPrerequisites(prerequisites.filter(p => p.id !== prerequisiteId));
  };

  // Gestion de la partie pratique
  const createPracticalInfo = () => {
    const newPracticalInfo: PracticalInfoInput = {
      title: 'Formation Pratique',
      description: '<p>Décrivez ici la formation pratique...</p>',
      image: ''
    };
    setPracticalInfo(newPracticalInfo);
    setShowPracticalModal(true);
  };

  const editPracticalInfo = () => {
    if (practicalInfo) {
      setShowPracticalModal(true);
    }
  };

  const savePracticalInfo = async () => {
    if (!practicalInfo || !formation) return;

    try {
      setUpdating(true);
      
      // Si la partie pratique a un ID, on la met à jour, sinon on la crée
      if (practicalInfo.id) {
        await adminFormationsApi.updatePracticalInfo(practicalInfo.id, practicalInfo);
        addToast('Partie pratique mise à jour avec succès', 'success');
      } else {
        const response = await adminFormationsApi.createPracticalInfo(formation.id, practicalInfo);
        setPracticalInfo({...practicalInfo, id: response.data.id});
        addToast('Partie pratique créée avec succès', 'success');
      }
      
      setShowPracticalModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast('Erreur lors de la sauvegarde de la partie pratique', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const deletePracticalInfo = async () => {
    if (!practicalInfo?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette partie pratique ?')) {
      return;
    }

    try {
      setUpdating(true);
      await adminFormationsApi.deletePracticalInfo(practicalInfo.id);
      setPracticalInfo(null);
      addToast('Partie pratique supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addToast('Erreur lors de la suppression de la partie pratique', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Gestion des documents avec système temporaire
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setUploadingDocument(true);

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('category', 'support');

        // Upload temporaire
        const response = await documentsApi.tempUpload(formData);
        const { tempId, document: tempDoc } = response.data;

        // Ajouter aux documents temporaires pour preview
        setTempDocuments(prev => [...prev, { tempId, document: tempDoc }]);
        setPendingTempIds(prev => [...prev, tempId]);
      }

      addToast('Document(s) ajouté(s) temporairement. Sauvegardez pour finaliser.', 'info');
    } catch (err: any) {
      console.error('Error uploading temporary document:', err);
      
      // ✅ CORRECTION : Gestion spécifique de l'erreur 413 (fichier trop volumineux)
      if (err.response?.status === 413) {
        addToast('Fichier trop volumineux. La taille maximale autorisée est de 100 Mo.', 'error');
      } else if (err.response?.status >= 400 && err.response?.status < 500) {
        addToast('Erreur lors de l\'upload: ' + (err.response?.data?.message || 'Format de fichier non autorisé'), 'error');
      } else {
        addToast('Erreur lors de l\'upload temporaire', 'error');
      }
    } finally {
      setUploadingDocument(false);
      event.target.value = '';
    }
  };

  // Supprimer un document temporaire
  const deleteTempDocument = async (tempId: string) => {
    try {
      await documentsApi.deleteTempDocument(tempId);
      setTempDocuments(prev => prev.filter(td => td.tempId !== tempId));
      setPendingTempIds(prev => prev.filter(id => id !== tempId));
      addToast('Document temporaire supprimé', 'success');
    } catch (err) {
      console.error('Error deleting temporary document:', err);
      addToast('Erreur lors de la suppression temporaire', 'error');
    }
  };

  const deleteDocument = async (documentId: number) => {
    if (!formation) return;

    try {
      await adminFormationsApi.deleteDocument(formation.id, documentId);
      setDocuments(documents.filter(d => d.id !== documentId));
      addToast('Document supprimé avec succès', 'success');
    } catch (err) {
      console.error('Error deleting document:', err);
      addToast('Erreur lors de la suppression', 'error');
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

    if (!dateString) {
      return 'Date non disponible';
    }
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string): string => {
    const classes: { [key: string]: string } = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'ongoing': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string): string => {
    const statuses: { [key: string]: string } = {
      'scheduled': 'Programmée',
      'ongoing': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return statuses[status] || status;
  };

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

  if (error || !formation) {
    return (
        <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar />
          <div className="flex-1">
            <AdminHeader title="Erreur" />
            <div className="p-6">
              <Alert type="error" message={error || "Formation non trouvée"} />
              <Button
                  variant="outline"
                  onClick={() => navigate('/admin/formations')}
                  className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
            </div>
          </div>
        </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Informations', icon: FileText },
    { id: 'modules', label: 'Modules', icon: Users },
    { id: 'prerequisites', label: 'Prérequis', icon: FileText },
    { id: 'practical', label: 'Partie Pratique', icon: Car },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'sessions', label: 'Sessions', icon: Calendar }
  ];

  return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title={`Formation: ${formation.title}`} />

          <div className="p-6">
            {/* En-tête avec actions */}
            <div className="flex justify-between items-center mb-6">
              <Button
                  variant="outline"
                  onClick={() => navigate('/admin/formations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>

              <div className="flex space-x-3">
                {editMode ? (
                    <>
                      <Button
                          variant="outline"
                          onClick={() => setEditMode(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                          onClick={handleSave}
                          loading={updating}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </>
                ) : (
                    <Button onClick={() => setEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                )}
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
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
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                  formErrors.title ? 'border-red-500' : ''
                              } ${!editMode ? 'bg-gray-50' : ''}`}
                              value={formation.title}
                              onChange={(e) => setFormation({...formation, title: e.target.value})}
                              disabled={!editMode}
                          />
                          {formErrors.title && (
                              <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type*
                          </label>
                          <select
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                  !editMode ? 'bg-gray-50' : ''
                              }`}
                              value={formation.type}
                              onChange={(e) => setFormation({...formation, type: e.target.value})}
                              disabled={!editMode}
                          >
                            <option value="initial">Formation Initiale</option>
                            <option value="continuous">Formation Continue</option>
                            <option value="mobility">Formation Mobilité</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prix (€)*
                          </label>
                          <input
                              type="number"
                              step="0.01"
                              min="0"
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                  formErrors.price ? 'border-red-500' : ''
                              } ${!editMode ? 'bg-gray-50' : ''}`}
                              value={formation.price}
                              onChange={(e) => setFormation({...formation, price: parseFloat(e.target.value) || 0})}
                              disabled={!editMode}
                          />
                          {formErrors.price && (
                              <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durée (heures)*
                          </label>
                          <input
                              type="number"
                              min="1"
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                  formErrors.duration ? 'border-red-500' : ''
                              } ${!editMode ? 'bg-gray-50' : ''}`}
                              value={formation.duration}
                              onChange={(e) => setFormation({...formation, duration: parseInt(e.target.value) || 0})}
                              disabled={!editMode}
                          />
                          {formErrors.duration && (
                              <p className="mt-1 text-sm text-red-500">{formErrors.duration}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description*
                          </label>
                          <textarea
                              rows={4}
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                  formErrors.description ? 'border-red-500' : ''
                              } ${!editMode ? 'bg-gray-50' : ''}`}
                              value={formation.description || ''}
                              onChange={(e) => setFormation({...formation, description: e.target.value})}
                              disabled={!editMode}
                          />
                          {formErrors.description && (
                              <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                          </label>
                          <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={formation.isActive}
                                onChange={(e) => setFormation({...formation, isActive: e.target.checked})}
                                disabled={!editMode}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                          Formation active
                        </span>
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Onglet Modules */}
                {activeTab === 'modules' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Modules de formation</h3>
                        {editMode && (
                            <Button onClick={addModule}>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un module
                            </Button>
                        )}
                      </div>

                      {modules.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">Aucun module ajouté</p>
                      ) : (
                          <div className="space-y-4">
                            {modules.map((module, index) => (
                                <div key={module.id || index} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Module {index + 1}: {module.title}</h4>
                                    {editMode && (
                                        <div className="flex space-x-2">
                                          <button
                                              onClick={() => moveModuleUp(index)}
                                              disabled={index === 0}
                                              className={`p-1 rounded ${index === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-100'}`}
                                          >
                                            <ChevronUp className="h-4 w-4" />
                                          </button>
                                          <button
                                              onClick={() => moveModuleDown(index)}
                                              disabled={index === modules.length - 1}
                                              className={`p-1 rounded ${index === modules.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-100'}`}
                                          >
                                            <ChevronDown className="h-4 w-4" />
                                          </button>
                                          <button
                                              onClick={() => editModule(module)}
                                              className="text-blue-600 hover:text-blue-900"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </button>
                                          <button
                                              onClick={() => deleteModule(module.id!)}
                                              className="text-red-600 hover:text-red-900"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">Durée: {module.duration}h</p>
                                  {module.points && module.points.length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Points du module:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                          {module.points.map((point, pointIndex) => (
                                              <li key={pointIndex}>{point.content}</li>
                                          ))}
                                        </ul>
                                      </div>
                                  )}
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                )}

                {/* Onglet Prérequis */}
                {activeTab === 'prerequisites' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Prérequis de formation</h3>
                        {editMode && (
                            <Button onClick={addPrerequisite}>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un prérequis
                            </Button>
                        )}
                      </div>

                      {prerequisites.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">Aucun prérequis ajouté</p>
                      ) : (
                          <div className="space-y-4">
                            {prerequisites.map((prerequisite, index) => (
                                <div key={prerequisite.id || index} className="flex items-center space-x-2">
                                  <div className="flex-1 p-3 bg-gray-50 rounded-md">
                                    {prerequisite.description}
                                  </div>
                                  {editMode && (
                                      <div className="flex space-x-2">
                                        <button
                                            onClick={() => editPrerequisite(prerequisite)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deletePrerequisite(prerequisite.id!)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                  )}
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                )}

                {/* Onglet Partie Pratique */}
                {activeTab === 'practical' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Partie Pratique</h3>
                        {editMode && !practicalInfo && (
                            <Button onClick={createPracticalInfo}>
                              <Plus className="h-4 w-4 mr-2" />
                              Créer la partie pratique
                            </Button>
                        )}
                      </div>

                      {!practicalInfo ? (
                          <p className="text-gray-500 text-sm italic">Aucune partie pratique définie</p>
                      ) : (
                          <div className="space-y-6">
                            {/* Informations générales */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{practicalInfo.title}</h4>
                                  {practicalInfo.image && (
                                      <div className="mb-3">
                                        <p className="text-sm text-gray-500 mb-1">Image:</p>
                                        <div className="flex items-center text-sm text-blue-600">
                                          <Image className="h-4 w-4 mr-1" />
                                          {practicalInfo.image}
                                        </div>
                                      </div>
                                  )}
                                </div>
                                {editMode && (
                                    <div className="flex space-x-2">
                                      <button
                                          onClick={editPracticalInfo}
                                          className="text-blue-600 hover:text-blue-900"
                                          title="Modifier les informations"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                          onClick={deletePracticalInfo}
                                          className="text-red-600 hover:text-red-900"
                                          title="Supprimer la partie pratique"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                )}
                              </div>

                              {/* Contenu WYSIWYG */}
                              <div className="space-y-3">
                                <h5 className="text-md font-medium text-gray-800">Contenu de la formation pratique</h5>
                                <div className="bg-white rounded border p-4">
                                  <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: practicalInfo.description }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                )}

                {/* Onglet Documents */}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Documents de formation</h3>
                        <div className="relative">
                          <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                              disabled={uploadingDocument}
                          />
                          <label
                              htmlFor="file-upload"
                              className={`inline-flex items-center px-4 py-2 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 cursor-pointer ${
                                  uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingDocument ? 'Upload en cours...' : 'Ajouter des documents'}
                          </label>
                        </div>
                      </div>

                      {/* Documents existants (sauvegardés) */}
                      {documents.length > 0 && (
                          <div className="bg-white overflow-hidden shadow rounded-lg mb-4">
                            <div className="px-4 py-2 bg-green-50 border-b">
                              <h4 className="text-sm font-medium text-green-800">Documents sauvegardés</h4>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Document
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date d'ajout
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                              {documents.map((document) => (
                                  <tr key={document.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-green-500 mr-3" />
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">{document.title}</div>
                                          <div className="text-sm text-gray-500">{document.fileName}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {document.type && typeof document.type === 'string'
                                          ? document.type.toUpperCase()
                                          : 'N/A'
                                      }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatDate(document.uploadedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <a
                                            href={document.downloadUrl}
                                            download
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                          <Download className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={() => deleteDocument(document.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      )}

                      {/* Documents temporaires (en attente de sauvegarde) */}
                      {tempDocuments.length > 0 && (
                          <div className="bg-white overflow-hidden shadow rounded-lg mb-4">
                            <div className="px-4 py-2 bg-yellow-50 border-b">
                              <h4 className="text-sm font-medium text-yellow-800">Documents temporaires (Sauvegardez pour finaliser)</h4>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Document
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Taille
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                              {tempDocuments.map(({ tempId, document: tempDoc }) => (
                                  <tr key={tempId} className="bg-yellow-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-yellow-500 mr-3" />
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">{tempDoc.title}</div>
                                          <div className="text-sm text-yellow-600">Temporaire - {tempDoc.originalName}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {tempDoc.type?.toUpperCase() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {tempDoc.size ? Math.round(tempDoc.size / 1024) + ' KB' : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                          onClick={() => deleteTempDocument(tempId)}
                                          className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      )}

                      {/* Message si aucun document */}
                      {documents.length === 0 && tempDocuments.length === 0 && (
                          <p className="text-gray-500 text-sm italic">Aucun document ajouté</p>
                      )}
                    </div>
                )}

                {/* Onglet Sessions */}
                {activeTab === 'sessions' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Sessions programmées</h3>
                      </div>

                      {!formation.sessions || formation.sessions.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">Aucune session programmée</p>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {formation.sessions.map((session) => (
                                <div key={session.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                  <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(session.status)}`}>
                              {formatStatus(session.status)}
                            </span>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Du {formatDate(session.startDate)} au {formatDate(session.endDate)}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      {session.location}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                      <Users className="h-4 w-4 mr-2" />
                                      {session.participantsCount} / {session.maxParticipants} participants
                                    </div>
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Module */}
        <Modal
            isOpen={showModuleModal}
            onClose={() => setShowModuleModal(false)}
            title={editingModule?.id ? "Modifier le module" : "Ajouter un module"}
            maxWidth="max-w-2xl"
            footer={
              <div className="flex justify-end space-x-3">
                <Button
                    variant="outline"
                    onClick={() => setShowModuleModal(false)}
                >
                  Annuler
                </Button>
                <Button onClick={saveModule}>
                  Sauvegarder
                </Button>
              </div>
            }
        >
          {editingModule && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du module*
                  </label>
                  <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={editingModule.title}
                      onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (heures)*
                  </label>
                  <input
                      type="number"
                      min="1"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={editingModule.duration}
                      onChange={(e) => setEditingModule({...editingModule, duration: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Points du module
                    </label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPoints = [...(editingModule.points || []), { content: '' }];
                          setEditingModule({...editingModule, points: newPoints});
                        }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {editingModule.points?.map((point, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            value={point.content}
                            onChange={(e) => {
                              const newPoints = [...editingModule.points];
                              newPoints[index].content = e.target.value;
                              setEditingModule({...editingModule, points: newPoints});
                            }}
                            placeholder="Contenu du point"
                        />
                        <button
                            onClick={() => {
                              const newPoints = editingModule.points.filter((_, i) => i !== index);
                              setEditingModule({...editingModule, points: newPoints});
                            }}
                            className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </Modal>

        {/* Modal Prérequis */}
        <Modal
            isOpen={showPrerequisiteModal}
            onClose={() => setShowPrerequisiteModal(false)}
            title={editingPrerequisite?.id ? "Modifier le prérequis" : "Ajouter un prérequis"}
            footer={
              <div className="flex justify-end space-x-3">
                <Button
                    variant="outline"
                    onClick={() => setShowPrerequisiteModal(false)}
                >
                  Annuler
                </Button>
                <Button onClick={savePrerequisite}>
                  Sauvegarder
                </Button>
              </div>
            }
        >
          {editingPrerequisite && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description du prérequis*
                </label>
                <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={editingPrerequisite.description}
                    onChange={(e) => setEditingPrerequisite({...editingPrerequisite, description: e.target.value})}
                    placeholder="Décrivez le prérequis nécessaire"
                />
              </div>
          )}
        </Modal>

        {/* Modal Partie Pratique */}
        <Modal
            isOpen={showPracticalModal}
            onClose={() => setShowPracticalModal(false)}
            title="Informations Partie Pratique"
            maxWidth="max-w-2xl"
            footer={
              <div className="flex justify-end space-x-3">
                <Button
                    variant="outline"
                    onClick={() => setShowPracticalModal(false)}
                >
                  Annuler
                </Button>
                <Button onClick={savePracticalInfo} disabled={updating}>
                  {updating ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            }
        >
          {practicalInfo && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre*
                  </label>
                  <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={practicalInfo.title}
                      onChange={(e) => setPracticalInfo({...practicalInfo, title: e.target.value})}
                      placeholder="Formation Pratique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description* (Contenu HTML)
                  </label>
                  <WysiwygEditor
                      value={practicalInfo.description}
                      onChange={(content) => setPracticalInfo({...practicalInfo, description: content})}
                      height={400}
                      placeholder="Décrivez la formation pratique avec des listes, images, mise en forme..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image (optionnel)
                  </label>
                  <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={practicalInfo.image || ''}
                      onChange={(e) => setPracticalInfo({...practicalInfo, image: e.target.value})}
                      placeholder="/images/practical.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Chemin vers l'image (ex: /images/practical.jpg)
                  </p>
                </div>
              </div>
          )}
        </Modal>

      </div>
  );
};

export default FormationDetail;