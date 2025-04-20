import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
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
  const { addToast } = useNotification();
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [updating, setUpdating] = useState(false);

  // Utiliser le hook personnalisé pour charger les données
  const { data: formations, loading, error, refetch, setData: setFormations } = useDataFetching<Formation>({
    fetchFn: adminFormationsApi.getAll
  });

  const formatType = (type: string): string => {
    const types: { [key: string]: string } = {
      'initial': 'Formation Initiale',
      'continuous': 'Formation Continue',
      'mobility': 'Formation Mobilité'
    };
    return types[type] || type;
  };

  const openEditModal = (formation: Formation) => {
    setSelectedFormation({...formation});
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (formation: Formation) => {
    setSelectedFormation(formation);
    setShowDeleteModal(true);
  };

  const validateForm = (formation: Formation) => {
    const errors: {[key: string]: string} = {};

    if (!formation.title.trim())
      errors.title = 'Le titre est requis';
    else if (formation.title.length < 5)
      errors.title = 'Le titre doit contenir au moins 5 caractères';

    if (!formation.duration || formation.duration <= 0)
      errors.duration = 'La durée doit être un nombre positif';

    if (!formation.price || formation.price <= 0)
      errors.price = 'Le prix doit être un nombre positif';

    if (!formation.type)
      errors.type = 'Le type de formation est requis';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFormation || !validateForm(selectedFormation)) {
      return;
    }

    try {
      setUpdating(true);
      await adminFormationsApi.update(selectedFormation.id, selectedFormation);

      // Mettre à jour la liste des formations
      setFormations({
        ...formations,
        data: formations.data.map(f =>
            f.id === selectedFormation.id ? selectedFormation : f
        )
      });

      setShowEditModal(false);
      addToast('Formation mise à jour avec succès', 'success');
    } catch (err) {
      console.error('Error updating formation:', err);
      addToast('Erreur lors de la mise à jour de la formation', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteFormation = async () => {
    if (!selectedFormation) return;

    try {
      setUpdating(true);
      await adminFormationsApi.delete(selectedFormation.id);

      // Mettre à jour la liste des formations
      setFormations({ ...formations, data: formations.data.filter(f => f.id !== selectedFormation.id) });
      setShowDeleteModal(false);
      addToast('Formation supprimée avec succès', 'success');
    } catch (err) {
      console.error('Error deleting formation:', err);
      addToast('Erreur lors de la suppression de la formation', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Configuration des colonnes pour le DataTable
  const columns = [
    {
      title: 'Titre',
      field: 'title' as keyof Formation,
      sortable: true
    },
    {
      title: 'Type',
      field: (row: Formation) => formatType(row.type),
      sortable: false
    },
    {
      title: 'Durée',
      field: (row: Formation) => `${row.duration}h`,
      sortable: true
    },
    {
      title: 'Prix',
      field: (row: Formation) => `${row.price}€`,
      sortable: true
    },
    {
      title: 'Statut',
      field: (row: Formation) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              row.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
          }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: false
    }
  ];

  // Rendu des actions pour chaque ligne
  const renderActions = (formation: Formation) => (
      <div className="flex justify-end space-x-2">
        <button
            onClick={() => openEditModal(formation)}
            className="text-blue-700 hover:text-blue-900"
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
            onClick={() => openDeleteModal(formation)}
            className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
  );

  // Rendu du pied de page pour les modals
  const editModalFooter = (
      <div className="flex justify-end space-x-3">
        <Button
            variant="outline"
            onClick={() => setShowEditModal(false)}
        >
          Annuler
        </Button>
        <Button
            type="submit"
            loading={updating}
            disabled={updating}
            onClick={handleEditFormSubmit}
        >
          Enregistrer
        </Button>
      </div>
  );

  const deleteModalFooter = (
      <div className="flex justify-end space-x-3">
        <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
        >
          Annuler
        </Button>
        <Button
            variant="danger"
            loading={updating}
            disabled={updating}
            onClick={handleDeleteFormation}
        >
          Supprimer
        </Button>
      </div>
  );

  return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader title="Gestion des formations" />

          <div className="p-6">
            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="flex justify-between items-center mb-6">
              <Link
                  to="/admin/formations/new"
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouvelle formation
              </Link>
            </div>

            <DataTable<Formation>
                data={formations.data || []}
                columns={columns}
                keyField="id"
                loading={loading}
                actions={renderActions}
                searchFields={['title']}
                emptyMessage="Aucune formation trouvée"
            />

            {/* Section des sessions à venir */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sessions programmées</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 text-center text-gray-500">
                  Fonctionnalité à implémenter
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal d'édition */}
        <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Modifier la formation"
            footer={editModalFooter}
            maxWidth="max-w-2xl"
        >
          {selectedFormation && (
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
                        value={selectedFormation.title}
                        onChange={(e) => setSelectedFormation({...selectedFormation, title: e.target.value})}
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
                        value={selectedFormation.price}
                        onChange={(e) => setSelectedFormation({...selectedFormation, price: parseFloat(e.target.value) || 0})}
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
                        value={selectedFormation.duration}
                        onChange={(e) => setSelectedFormation({...selectedFormation, duration: parseInt(e.target.value) || 0})}
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
                      value={selectedFormation.type}
                      onChange={(e) => setSelectedFormation({...selectedFormation, type: e.target.value})}
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
                        checked={selectedFormation.isActive}
                        onChange={(e) => setSelectedFormation({...selectedFormation, isActive: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                    Formation active
                  </span>
                  </div>
                </div>
              </div>
            </form>
            )}
            </Modal>

          {/* Modal de confirmation de suppression */}
          <Modal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              title="Confirmer la suppression"
              footer={deleteModalFooter}
          >
            <p>
              Êtes-vous sûr de vouloir supprimer la formation "{selectedFormation?.title}" ?
              Cette action est irréversible.
            </p>
          </Modal>
      </div>
);
};

export default FormationsAdmin;