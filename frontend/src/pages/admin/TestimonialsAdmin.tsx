import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Star, StarOff, Eye, EyeOff } from 'lucide-react';
import { testimonialService } from '../../services/cmsService';
import { Testimonial, TestimonialFilters } from '../../types/cms';

const TestimonialsAdmin: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [filters, setFilters] = useState<TestimonialFilters>({});
  const [formations, setFormations] = useState<string[]>([]);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    clientName: '',
    clientJob: '',
    clientCompany: '',
    content: '',
    rating: 5,
    formation: '',
    clientImage: '',
    isActive: true,
    isFeatured: false,
    testimonialDate: ''
  });

  useEffect(() => {
    fetchTestimonials();
    fetchFormations();
  }, [currentPage, filters]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialService.getAll({
        ...filters,
        page: currentPage,
        limit: 10
      });
      
      if (response.success && response.data) {
        setTestimonials(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement des témoignages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormations = async () => {
    try {
      const response = await testimonialService.getFormations();
      if (response.success && response.data) {
        setFormations(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des formations:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await testimonialService.create({
        ...formData,
        rating: formData.rating || undefined,
        clientJob: formData.clientJob || undefined,
        clientCompany: formData.clientCompany || undefined,
        formation: formData.formation || undefined,
        clientImage: formData.clientImage || undefined,
        testimonialDate: formData.testimonialDate || undefined
      });
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        fetchTestimonials();
      }
    } catch (err) {
      setError('Erreur lors de la création du témoignage');
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestimonial) return;

    try {
      const response = await testimonialService.update(selectedTestimonial.id, {
        ...formData,
        rating: formData.rating || undefined,
        clientJob: formData.clientJob || undefined,
        clientCompany: formData.clientCompany || undefined,
        formation: formData.formation || undefined,
        clientImage: formData.clientImage || undefined,
        testimonialDate: formData.testimonialDate || undefined
      });
      if (response.success) {
        setShowEditModal(false);
        setSelectedTestimonial(null);
        resetForm();
        fetchTestimonials();
      }
    } catch (err) {
      setError('Erreur lors de la modification du témoignage');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

    try {
      const response = await testimonialService.delete(id);
      if (response.success) {
        fetchTestimonials();
      }
    } catch (err) {
      setError('Erreur lors de la suppression du témoignage');
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await testimonialService.toggleFeatured(id);
      if (response.success) {
        fetchTestimonials();
      }
    } catch (err) {
      setError('Erreur lors de la modification du statut');
      console.error(err);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await testimonialService.toggleActive(id);
      if (response.success) {
        fetchTestimonials();
      }
    } catch (err) {
      setError('Erreur lors de la modification du statut');
      console.error(err);
    }
  };

  const openEditModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      clientName: testimonial.clientName,
      clientJob: testimonial.clientJob || '',
      clientCompany: testimonial.clientCompany || '',
      content: testimonial.content,
      rating: testimonial.rating || 5,
      formation: testimonial.formation || '',
      clientImage: testimonial.clientImage || '',
      isActive: testimonial.isActive,
      isFeatured: testimonial.isFeatured,
      testimonialDate: testimonial.testimonialDate || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientJob: '',
      clientCompany: '',
      content: '',
      rating: 5,
      formation: '',
      clientImage: '',
      isActive: true,
      isFeatured: false,
      testimonialDate: ''
    });
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilters({ ...filters, [key]: value === '' ? undefined : value });
    setCurrentPage(1);
  };

  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Témoignages</h1>
          <p className="text-gray-600">Gérez les témoignages clients affichés sur le site</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouveau témoignage
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            value={filters.formation || ''}
            onChange={(e) => handleFilterChange('formation', e.target.value)}
          >
            <option value="">Toutes les formations</option>
            {formations.map(formation => (
              <option key={formation} value={formation}>{formation}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg"
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
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
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {testimonial.clientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.clientJob && testimonial.clientCompany
                          ? `${testimonial.clientJob} chez ${testimonial.clientCompany}`
                          : testimonial.clientJob || testimonial.clientCompany || ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {testimonial.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testimonial.formation ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {testimonial.formation}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(testimonial.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        testimonial.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testimonial.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      {testimonial.isFeatured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          En vedette
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFeatured(testimonial.id)}
                        className={`${
                          testimonial.isFeatured 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={testimonial.isFeatured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                      >
                        <Star size={16} className={testimonial.isFeatured ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(testimonial.id)}
                        className={`${
                          testimonial.isActive 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={testimonial.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {testimonial.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => openEditModal(testimonial)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nouveau témoignage</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Métier
                  </label>
                  <input
                    type="text"
                    value={formData.clientJob}
                    onChange={(e) => setFormData({...formData, clientJob: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({...formData, clientCompany: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu du témoignage *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formation
                  </label>
                  <select
                    value={formData.formation}
                    onChange={(e) => setFormData({...formData, formation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choisir une formation</option>
                    {formations.map(formation => (
                      <option key={formation} value={formation}>{formation}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={5}>5 étoiles</option>
                    <option value={4}>4 étoiles</option>
                    <option value={3}>3 étoiles</option>
                    <option value={2}>2 étoiles</option>
                    <option value={1}>1 étoile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du témoignage
                </label>
                <input
                  type="date"
                  value={formData.testimonialDate}
                  onChange={(e) => setFormData({...formData, testimonialDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image du client
                </label>
                <input
                  type="url"
                  value={formData.clientImage}
                  onChange={(e) => setFormData({...formData, clientImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
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
      {showEditModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Modifier le témoignage</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Métier
                  </label>
                  <input
                    type="text"
                    value={formData.clientJob}
                    onChange={(e) => setFormData({...formData, clientJob: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({...formData, clientCompany: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu du témoignage *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formation
                  </label>
                  <select
                    value={formData.formation}
                    onChange={(e) => setFormData({...formData, formation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choisir une formation</option>
                    {formations.map(formation => (
                      <option key={formation} value={formation}>{formation}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={5}>5 étoiles</option>
                    <option value={4}>4 étoiles</option>
                    <option value={3}>3 étoiles</option>
                    <option value={2}>2 étoiles</option>
                    <option value={1}>1 étoile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du témoignage
                </label>
                <input
                  type="date"
                  value={formData.testimonialDate}
                  onChange={(e) => setFormData({...formData, testimonialDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image du client
                </label>
                <input
                  type="url"
                  value={formData.clientImage}
                  onChange={(e) => setFormData({...formData, clientImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
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
                    setSelectedTestimonial(null);
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
  );
};

export default TestimonialsAdmin;
