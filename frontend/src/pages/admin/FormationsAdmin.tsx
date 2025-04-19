import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, ChevronDown, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { adminFormationsApi } from '../../services/api';

interface Formation {
  id: number;
  title: string;
  type: string;
  duration: number;
  price: number;
  isActive: boolean;
}

const FormationsAdmin: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formationToEdit, setFormationToEdit] = useState<Formation | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        
        // Utilisation des appels API réels
        const response = await adminFormationsApi.getAll();
        setFormations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching formations:', err);
        setError('Erreur lors du chargement des formations');
        setLoading(false);
        
        // Données de secours en cas d'erreur (pour le développement)
        const mockFormations: Formation[] = [
          { id: 1, title: 'Formation Initiale Taxi', type: 'initial', duration: 140, price: 1500, isActive: true },
          { id: 2, title: 'Formation Continue Taxi', type: 'continuous', duration: 21, price: 450, isActive: true },
          { id: 3, title: 'Formation Mobilité Taxi', type: 'mobility', duration: 14, price: 350, isActive: true },
          { id: 4, title: 'Formation VTC', type: 'initial', duration: 120, price: 1300, isActive: false },
          { id: 5, title: 'Remise à niveau', type: 'continuous', duration: 7, price: 200, isActive: true }
        ];
        
        setFormations(mockFormations);
      }
    };

    fetchFormations();
  }, [searchTerm, selectedType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche est déjà gérée par le useEffect via searchTerm
  };

  const confirmDelete = (formation: Formation) => {
    setFormationToDelete(formation);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!formationToDelete) return;
    
    try {
      await adminFormationsApi.delete(formationToDelete.id);
      setFormations(formations.filter(f => f.id !== formationToDelete.id));
      setShowDeleteModal(false);
      setFormationToDelete(null);
    } catch (err) {
      console.error('Error deleting formation:', err);
      setError('Erreur lors de la suppression de la formation');
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
  const openEditModal = (formation: Formation) => {
    setFormationToEdit({...formation});
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateForm = (formation: Formation) => {
    const errors: {[key: string]: string} = {};

    if (!formation.title.trim()) errors.title = 'Le titre est requis';
    else if (formation.title.length < 5) errors.title = 'Le titre doit contenir au moins 5 caractères';

    if (!formation.duration || formation.duration <= 0)
      errors.duration = 'La durée doit être un nombre positif';

    if (!formation.price || formation.price <= 0)
      errors.price = 'Le prix doit être un nombre positif';

    if (!formation.type) errors.type = 'Le type de formation est requis';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formationToEdit || !validateForm(formationToEdit)) {
      return;
    }

    try {
      setUpdating(true);
      await adminFormationsApi.update(formationToEdit.id, formationToEdit);

      // Mettre à jour la liste des formations
      setFormations(
          formations.map(f =>
              f.id === formationToEdit.id ? formationToEdit : f
          )
      );

      setShowEditModal(false);
      setFormationToEdit(null);
    } catch (err) {
      console.error('Error updating formation:', err);
      setError('Erreur lors de la mise à jour de la formation');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Gestion des formations" />
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Link 
              to="/admin/formations/new" 
              className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle formation
            </Link>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-3 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white w-full"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="initial">Formation Initiale</option>
                  <option value="continuous">Formation Continue</option>
                  <option value="mobility">Formation Mobilité</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400" />
              </div>
            </form>
          </div>
          
          {loading ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-700">Chargement des formations...</p>
            </div>
          ) : formations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-700">Aucune formation trouvée</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durée
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formations.map((formation) => (
                      <tr key={formation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formation.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatType(formation.type)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formation.duration}h</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formation.price}€</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            formation.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formation.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => openEditModal(formation)}
                                className="text-blue-700 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5"/>
                            </button>
                            <button
                                onClick={() => confirmDelete(formation)}
                                className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Section des sessions à venir */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sessions programmées</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Table des sessions à implémenter */}
              <div className="p-6 text-center text-gray-500">
                Fonctionnalité à implémenter
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer la formation "{formationToDelete?.title}" ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && formationToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Modifier la formation</h3>
                <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre*
                    </label>
                    <input
                        type="text"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.title ? 'border-red-500' : ''
                        }`}
                        value={formationToEdit.title}
                        onChange={(e) => setFormationToEdit({...formationToEdit, title: e.target.value})}
                    />
                    {formErrors.title && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                    )}
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
                        }`}
                        value={formationToEdit.price}
                        onChange={(e) => setFormationToEdit({...formationToEdit, price: parseFloat(e.target.value) || 0})}
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
                        }`}
                        value={formationToEdit.duration}
                        onChange={(e) => setFormationToEdit({...formationToEdit, duration: parseInt(e.target.value) || 0})}
                    />
                    {formErrors.duration && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de formation*
                    </label>
                    <select
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.type ? 'border-red-500' : ''
                        }`}
                        value={formationToEdit.type}
                        onChange={(e) => setFormationToEdit({...formationToEdit, type: e.target.value})}
                    >
                      <option value="initial">Formation Initiale</option>
                      <option value="continuous">Formation Continue</option>
                      <option value="mobility">Formation Mobilité</option>
                    </select>
                    {formErrors.type && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
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
                          checked={formationToEdit.isActive}
                          onChange={(e) => setFormationToEdit({...formationToEdit, isActive: e.target.checked})}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                Formation active
              </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end space-x-3">
                  <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center"
                  >
                    {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Mise à jour...
                        </>
                    ) : (
                        <>Enregistrer</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default FormationsAdmin;
