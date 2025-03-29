import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, ChevronDown } from 'lucide-react';
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
                            <Link 
                              to={`/admin/formations/${formation.id}/edit`}
                              className="text-blue-700 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button 
                              onClick={() => confirmDelete(formation)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
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
    </div>
  );
};

export default FormationsAdmin;
