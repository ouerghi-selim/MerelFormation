import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, ChevronDown, ChevronUp, ExternalLink, Upload, X, Image as ImageIcon } from 'lucide-react';
import { adminContentTextApi, adminImageUploadApi } from '../../services/api.ts';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  ContentText, 
  CMS_PAGES, 
  CONTENT_DESCRIPTIONS, 
  getContentDescription 
} from '../../types/cms';
import Alert from "@/components/common/Alert.tsx";
import WysiwygEditor from '../../components/common/WysiwygEditor';

interface GroupedContent {
  [page: string]: {
    [section: string]: ContentText[];
  };
}

const ContentTextsAdmin: React.FC = () => {
  const [contentTexts, setContentTexts] = useState<ContentText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContentText, setSelectedContentText] = useState<ContentText | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPages, setExpandedPages] = useState<{ [key: string]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // États pour le formulaire
  const [formData, setFormData] = useState({
    identifier: '',
    title: '',
    content: '',
    section: '',
    type: '',
    isActive: true
  });

  // États pour l'upload d'images
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchContentTexts();
    // Ouvrir la page d'accueil par défaut
    setExpandedPages({ 'home': true });
  }, []);

  const fetchContentTexts = async () => {
    try {
      setLoading(true);
      const response = await adminContentTextApi.getAll({
        limit: 200 // Récupérer tous les contenus
      });

      if (response.data.success && response.data) {
        setContentTexts(response.data.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des textes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Grouper les contenus par page et section
  const groupContentByPageAndSection = (): GroupedContent => {
    const grouped: GroupedContent = {};

    // Filtrer par recherche si nécessaire
    const filteredContent = searchTerm 
      ? contentTexts.filter(content => 
          getContentDescription(content.identifier).label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getContentDescription(content.identifier).description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : contentTexts;

    filteredContent.forEach(content => {
      const desc = getContentDescription(content.identifier);
      const page = desc.page;
      const section = desc.section;

      if (!grouped[page]) {
        grouped[page] = {};
      }
      if (!grouped[page][section]) {
        grouped[page][section] = [];
      }
      grouped[page][section].push(content);
    });

    return grouped;
  };

  const togglePage = (page: string) => {
    setExpandedPages(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminContentTextApi.create(formData);
      if (response.data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchContentTexts();
        setSuccessMessage('Texte créé avec succès !');
      }
    } catch (err) {
      setError('Erreur lors de la création du texte');
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentText) return;

    try {
      const response = await adminContentTextApi.update(selectedContentText.id, formData);
      if (response.data.success) {
        setShowEditModal(false);
        setSelectedContentText(null);
        resetForm();
        fetchContentTexts();
        setSuccessMessage('Texte modifié avec succès !');
      }
    } catch (err) {
      setError('Erreur lors de la modification du texte');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce texte ?')) return;

    try {
      const response = await adminContentTextApi.delete(id);
      if (response.data.success) {
        fetchContentTexts();
        setSuccessMessage('Texte supprimé avec succès !');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du texte');
      console.error(err);
    }
  };

  const openEditModal = (contentText: ContentText) => {
    setSelectedContentText(contentText);
    setFormData({
      identifier: contentText.identifier,
      title: contentText.title,
      content: contentText.content,
      section: contentText.section,
      type: contentText.type,
      isActive: contentText.isActive
    });
    
    // Si c'est un type image_upload et qu'il y a une URL, l'afficher en preview
    if (contentText.type === 'image_upload' && contentText.content) {
      setImagePreview(contentText.content);
    } else {
      setImagePreview(null);
    }
    
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      identifier: '',
      title: '',
      content: '',
      section: '',
      type: '',
      isActive: true
    });
    setImagePreview(null);
  };

  const getPreviewUrl = (identifier: string) => {
    const desc = getContentDescription(identifier);
    if (desc.page.includes('accueil')) {
      return '/?preview=' + identifier;
    } else if (desc.page.includes('formations')) {
      return '/formations?preview=' + identifier;
    }
    return '/';
  };

  // Fonctions pour l'upload d'images
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WebP');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max pour CMS
      setError('Fichier trop volumineux. Taille maximale: 2MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await adminImageUploadApi.uploadCms(formData);
      
      if (response.data.success) {
        const imageUrl = response.data.url;
        setFormData(prev => ({ ...prev, content: imageUrl }));
        setImagePreview(imageUrl);
        setSuccessMessage('Image uploadée avec succès!');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'upload de l\'image';
      setError(errorMessage);
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.content || !formData.content.startsWith('/uploads/cms/')) {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, content: '' }));
      return;
    }

    const filename = formData.content.split('/').pop();
    if (!filename) return;

    try {
      await adminImageUploadApi.deleteCms(filename);
      setImagePreview(null);
      setFormData(prev => ({ ...prev, content: '' }));
      setSuccessMessage('Image supprimée avec succès!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de l\'image';
      setError(errorMessage);
      console.error(err);
    }
  };

  // Composant ImageUploadInterface
  const ImageUploadInterface: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };

    return (
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="w-full max-w-md h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleImageDelete}
              disabled={disabled || uploadingImage}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 disabled:opacity-50"
              title="Supprimer l'image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Aucune image sélectionnée
              </p>
              <p className="text-xs text-gray-500">
                Formats acceptés: JPG, PNG, GIF, WebP - Taille max: 2MB
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              disabled={disabled || uploadingImage}
              className="hidden"
            />
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50">
              {uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {imagePreview ? 'Changer l\'image' : 'Choisir une image'}
                </>
              )}
            </div>
          </label>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedContent = groupContentByPageAndSection();

  return (
    <AdminLayout title="Gestion du contenu du site">
      <div className="space-y-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
            />
          )}
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contenu du site</h1>
                <p className="text-gray-600">Modifiez facilement les textes affichés sur votre site web</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={20} />
                Ajouter un texte
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un texte..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Organisation par pages */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <div className="w-full table table-fixed">
                  <div className="divide-y divide-gray-200 table-row-group">
              {Object.entries(groupedContent).map(([page, sections]) => {
                const isPageExpanded = expandedPages[page];
                
                return (
                  <div key={page} className="table-row w-full">
                    {/* En-tête de page */}
                    <button
                      onClick={() => togglePage(page)}
                      className="w-full px-6 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-l-4 border-blue-500">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 text-left">
                            {page}
                          </h3>
                          <p className="text-sm text-gray-500 text-left">
                            {Object.keys(sections).length} section(s) • {
                              Object.values(sections).reduce((total, sectionContents) => total + sectionContents.length, 0)
                            } texte(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {isPageExpanded ? <ChevronUp size={24} className="text-blue-600" /> : <ChevronDown size={24} className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Contenu de la page */}
                    {isPageExpanded && (
                      <div className="border-t">
                        {Object.entries(sections).map(([section, contents]) => {
                          const sectionKey = `${page}-${section}`;
                          const isSectionExpanded = expandedSections[sectionKey]; // Ouvert par défaut

                          return (
                            <div key={section} className="border-b last:border-b-0">
                              {/* En-tête de section */}
                              <button
                                onClick={() => toggleSection(sectionKey)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gray-25 border-l-2 border-gray-300"
                              >
                                <div className="flex items-center justify-between w-full mr-4">
                                  <div className="flex items-center space-x-4">
                                    <span className="font-semibold text-gray-800 text-base">{section}</span>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                      {contents.length} texte{contents.length > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                  {isSectionExpanded ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                              </button>

                              {/* Contenus de la section */}
                              {isSectionExpanded && (
                                <div className="px-6 pb-6">
                                  <div className="space-y-4">
                                    {contents.map((content) => {
                                      const desc = getContentDescription(content.identifier);
                                      
                                      return (
                                        <div key={content.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                                            <div className="lg:col-span-4 space-y-4">
                                              <div className="flex items-center space-x-3 mb-3">
                                                <h4 className="font-semibold text-gray-900 text-base">{desc.label}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                  content.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                  {content.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-600 leading-relaxed">{desc.description}</p>
                                              <div className="bg-white p-4 rounded-lg border text-sm text-gray-700">
                                                {content.type === 'image_upload' ? (
                                                  <div className="space-y-2">
                                                    {content.content ? (
                                                      <div>
                                                        <img
                                                          src={content.content}
                                                          alt={content.title}
                                                          className="w-full max-w-sm h-32 object-cover rounded border"
                                                          onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                          }}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                                                          {content.content}
                                                        </p>
                                                      </div>
                                                    ) : (
                                                      <div className="text-gray-500 italic">
                                                        Aucune image uploadée
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className="whitespace-pre-wrap break-words">
                                                    {content.content.length > 200 
                                                      ? content.content.substring(0, 200) + '...'
                                                      : content.content
                                                    }
                                                  </div>
                                                )}
                                              </div>
                                              <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded inline-block">
                                                ID: {content.identifier}
                                              </div>
                                            </div>
                                            
                                            <div className="lg:col-span-1 flex lg:flex-col flex-row lg:justify-start justify-end space-x-2 lg:space-x-0 lg:space-y-2">
                                              <button
                                                onClick={() => window.open(getPreviewUrl(content.identifier), '_blank')}
                                                className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition-colors"
                                                title="Voir sur le site"
                                              >
                                                <ExternalLink size={18} />
                                              </button>
                                              <button
                                                onClick={() => openEditModal(content)}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                                                title="Modifier"
                                              >
                                                <Edit size={18} />
                                              </button>
                                              <button
                                                onClick={() => handleDelete(content.id)}
                                                className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                                                title="Supprimer"
                                              >
                                                <Trash2 size={18} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Création */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">Ajouter un nouveau texte</h2>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Identifiant technique *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.identifier}
                        onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="ex: home_hero_title"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Cet identifiant sera utilisé par le système pour afficher le texte
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du texte *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="ex: Titre principal de la page d'accueil"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.type === 'image_upload' ? 'Image *' : 'Contenu du texte *'}
                      </label>
                      {formData.type === 'image_upload' ? (
                        <ImageUploadInterface />
                      ) : (
                        <WysiwygEditor
                          value={formData.content}
                          onChange={(content) => setFormData({...formData, content})}
                          height={300}
                          placeholder="Le texte qui sera affiché sur le site..."
                          eventType="content_management"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section *
                        </label>
                        <select
                          required
                          value={formData.section}
                          onChange={(e) => setFormData({...formData, section: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Choisir...</option>
                          <option value="home_hero">Page d'accueil - En-tête</option>
                          <option value="home_services">Page d'accueil - Services</option>
                          <option value="home_cta">Page d'accueil - Appel à l'action</option>
                          <option value="formations_hero">Page formations - En-tête</option>
                          <option value="formations_advantages">Page formations - Avantages</option>
                          <option value="location_hero">Page location - En-tête</option>
                          <option value="location_info">Page location - Informations</option>
                          <option value="location_services">Page location - Services</option>
                          <option value="location_booking">Page location - Réservation</option>
                          <option value="location_vehicles">Page location - Véhicules</option>
                          <option value="location_cta">Page location - Appel à l'action</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type *
                        </label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Choisir...</option>
                          <option value="title">Titre</option>
                          <option value="description">Description</option>
                          <option value="paragraph">Paragraphe</option>
                          <option value="feature">Caractéristique/Fonctionnalité</option>
                          <option value="button_text">Texte de bouton</option>
                          <option value="text">Texte simple</option>
                          <option value="image_upload">Image (avec upload)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Activer ce texte (il sera visible sur le site)
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Créer le texte
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Édition */}
            {showEditModal && selectedContentText && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">Modifier le texte</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Vous modifiez :</strong> {getContentDescription(selectedContentText.identifier).label}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {getContentDescription(selectedContentText.identifier).description}
                    </p>
                  </div>
                  
                  <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.type === 'image_upload' ? 'Image *' : 'Contenu du texte *'}
                      </label>
                      {formData.type === 'image_upload' ? (
                        <ImageUploadInterface />
                      ) : (
                        <WysiwygEditor
                          value={formData.content}
                          onChange={(content) => setFormData({...formData, content})}
                          height={350}
                          placeholder="Le texte qui sera affiché sur le site..."
                          eventType="content_management"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du texte
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Actif (visible sur le site)
                      </label>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Paramètres techniques</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">ID:</span>
                          <span className="ml-2 font-mono text-xs">{formData.identifier}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Section:</span>
                          <span className="ml-2">{formData.section}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedContentText(null);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(getPreviewUrl(selectedContentText.identifier), '_blank')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Voir sur le site
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
                  </div>
                </div>
              </div>

      </div>
    </AdminLayout>
  );
};

export default ContentTextsAdmin;