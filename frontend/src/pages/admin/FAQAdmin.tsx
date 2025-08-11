import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Star, StarOff, Eye, EyeOff, ArrowUp, ArrowDown, Hash } from 'lucide-react';
import { adminFaqApi } from '@/services/api.ts';
import { FAQ, FAQFilters, FAQ_CATEGORIES } from '@/types/cms.ts';
import AdminLayout from '@/components/layout/AdminLayout.tsx';
import Alert from "@/components/common/Alert.tsx";
import DataTable from '@/components/common/DataTable.tsx';
import ActionMenu from '@/components/common/ActionMenu.tsx';

const FAQAdmin: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [filters, setFilters] = useState<FAQFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    sortOrder: 0,
    isActive: true,
    isFeatured: false,
    tags: [] as string[],
    newTag: ''
  });

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, [currentPage, filters]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await adminFaqApi.getAll({
        ...filters,
        page: currentPage,
        limit: 10
      });
      
      if (response.data.success && response.data.data) {
        setFaqs(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement des FAQ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminFaqApi.getCategories();
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminFaqApi.create({
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      });
      if (response.data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchFAQs();
      }
    } catch (err) {
      setError('Erreur lors de la création de la FAQ');
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFAQ) return;

    try {
      const response = await adminFaqApi.update(selectedFAQ.id, {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      });
      if (response.data.success) {
        setShowEditModal(false);
        setSelectedFAQ(null);
        resetForm();
        fetchFAQs();
      }
    } catch (err) {
      setError('Erreur lors de la modification de la FAQ');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) return;

    try {
      const response = await adminFaqApi.delete(id);
      if (response.data.success) {
        fetchFAQs();
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la FAQ');
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await adminFaqApi.toggleFeatured(id);
      if (response.data.success) {
        fetchFAQs();
      }
    } catch (err) {
      setError('Erreur lors de la modification du statut');
      console.error(err);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await adminFaqApi.toggleActive(id);
      if (response.data.success) {
        fetchFAQs();
      }
    } catch (err) {
      setError('Erreur lors de la modification du statut');
      console.error(err);
    }
  };

  const handleReorder = async (faqId: number, direction: 'up' | 'down') => {
    const faq = faqs.find(f => f.id === faqId);
    if (!faq) return;

    const newSortOrder = direction === 'up' ? faq.sortOrder - 1 : faq.sortOrder + 1;
    
    try {
      const response = await adminFaqApi.reorder([
        { id: faqId, sortOrder: newSortOrder }
      ]);
      if (response.data.success) {
        fetchFAQs();
      }
    } catch (err) {
      setError('Erreur lors du réordonnancement');
      console.error(err);
    }
  };

  const openEditModal = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
      isFeatured: faq.isFeatured,
      tags: faq.tags || [],
      newTag: ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      sortOrder: 0,
      isActive: true,
      isFeatured: false,
      tags: [],
      newTag: ''
    });
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters({ ...filters, [key]: value === '' ? undefined : value });
    setCurrentPage(1);
  };

  const addTag = () => {
    if (formData.newTag && !formData.tags.includes(formData.newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag],
        newTag: ''
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const allCategories = [...new Set([...FAQ_CATEGORIES, ...categories])];

  // Configuration des colonnes pour le DataTable
  const columns = [
    {
      title: 'Question',
      field: (row: FAQ) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900 truncate" title={row.question}>
            {row.question}
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate" title={row.answer}>
            {row.answer}
          </div>
        </div>
      ),
      sortable: true,
      width: 'w-2/5'
    },
    {
      title: 'Catégorie',
      field: (row: FAQ) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs" title={row.category}>
          {row.category}
        </span>
      ),
      sortable: true,
      width: 'w-1/6',
      cellClassName: 'text-center'
    },
    {
      title: 'Ordre',
      field: (row: FAQ) => (
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium">{row.sortOrder}</span>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleReorder(row.id, 'up')}
              className="text-gray-400 hover:text-gray-600"
              title="Monter"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleReorder(row.id, 'down')}
              className="text-gray-400 hover:text-gray-600"
              title="Descendre"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      ),
      sortable: true,
      width: 'w-1/8',
      cellClassName: 'text-center'
    },
    {
      title: 'Tags',
      field: (row: FAQ) => (
        <div className="flex flex-wrap gap-1">
          {(row.tags || []).slice(0, 2).map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs">
              {tag}
            </span>
          ))}
          {(row.tags || []).length > 2 && (
            <span className="text-gray-500 text-xs">+{(row.tags || []).length - 2}</span>
          )}
        </div>
      ),
      sortable: false,
      width: 'w-1/8'
    },
    {
      title: 'Statut',
      field: (row: FAQ) => (
        <div className="flex flex-col space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {row.isActive ? 'Actif' : 'Inactif'}
          </span>
          {row.isFeatured && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              En vedette
            </span>
          )}
        </div>
      ),
      sortable: false,
      width: 'w-1/8',
      cellClassName: 'text-center'
    }
  ];

  // Fonction pour générer les actions
  const generateActions = (faq: FAQ) => {
    const actions = [
      {
        label: faq.isFeatured ? 'Retirer de la vedette' : 'Mettre en vedette',
        icon: faq.isFeatured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />,
        onClick: () => handleToggleFeatured(faq.id)
      },
      {
        label: faq.isActive ? 'Désactiver' : 'Activer',
        icon: faq.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
        onClick: () => handleToggleActive(faq.id)
      },
      {
        label: 'Modifier',
        icon: <Edit className="h-4 w-4" />,
        onClick: () => openEditModal(faq)
      },
      {
        label: 'Supprimer',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => handleDelete(faq.id),
        variant: 'danger' as const
      }
    ];

    return <ActionMenu actions={actions} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
      <AdminLayout title="Gestion des FAQ">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-gray-600">Gérez les questions fréquemment posées</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvelle FAQ
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg"
            value={filters.featured?.toString() || ''}
            onChange={(e) => handleFilterChange('featured', e.target.value === '' ? '' : e.target.value === 'true')}
          >
            <option value="">Tous</option>
            <option value="true">En vedette</option>
            <option value="false">Non en vedette</option>
          </select>

          <button
            onClick={() => {
              setFilters({});
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau */}
      <DataTable<FAQ>
        data={faqs}
        columns={columns}
        keyField="id"
        loading={loading}
        actions={generateActions}
        searchFields={['question', 'answer', 'category']}
        emptyMessage="Aucune FAQ trouvée"
        title="Liste des FAQ"
        searchPlaceholder="Rechercher par question, réponse ou catégorie..."
        showSearch={false} // On utilise les filtres personnalisés au-dessus
      />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nouvelle FAQ</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Quelle est votre question ?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réponse *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Voici la réponse détaillée..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choisir une catégorie</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData({...formData, newTag: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ajouter un tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Hash size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">Actif</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">Mettre en vedette</label>
                </div>
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
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Modifier la FAQ</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Quelle est votre question ?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réponse *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Voici la réponse détaillée..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choisir une catégorie</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData({...formData, newTag: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ajouter un tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Hash size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">Actif</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">Mettre en vedette</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFAQ(null);
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
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      )}
    </div>
      </AdminLayout>
  );
};

export default FAQAdmin;
