import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {Plus, Edit, Trash2, Eye} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import ActionMenu from '../../components/common/ActionMenu';
import { useNotification } from '../../contexts/NotificationContext';
import useDataFetching from '../../hooks/useDataFetching';
import { adminFormationsApi } from '../../services/api';

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
}

interface ModulePointInput {
  id?: number;
  content: string;
}

interface ModuleInput {
  id?: number;
  title: string;
  duration: number;
  position: number;
  points: ModulePointInput[];
}

interface PrerequisiteInput {
  id?: number;
  description: string;
}

const FormationsAdmin: React.FC = () => {
  const { addToast } = useNotification();
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [updating, setUpdating] = useState(false);
  const [modules, setModules] = useState<ModuleInput[]>([]);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteInput[]>([]);

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

  // Dans FormationsAdmin.tsx, remplacer la fonction openEditModal par celle-ci:

  const openEditModal = async (formation: Formation) => {
    try {
      setUpdating(true);

      // Récupérer les détails complets de la formation
      const formationDetails = await adminFormationsApi.getById(formation.id);
      console.log("Formation details:", formationDetails);

      // Initialiser directement les états avec les données reçues
      setSelectedFormation(formationDetails.data);
      setModules(formationDetails.data.modules || []);
      setPrerequisites(formationDetails.data.prerequisites || []);

      setFormErrors({});
      setShowEditModal(true);
    } catch (err) {
      console.error('Error fetching formation details:', err);
      addToast('Erreur lors de la récupération des détails de la formation', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (formation: Formation) => {
    setSelectedFormation(formation);
    setShowDeleteModal(true);
  };

  const validateForm = (formation: Formation) => {
    const errors: {[key: string]: string} = {};

    if (!formation.title?.trim())
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

      // Préparer les données pour la mise à jour
      const updatedFormation = {
        ...selectedFormation,
        modules: modules.map((module, index) => ({
          ...module,
          position: index + 1
        })),
        prerequisites: prerequisites.map(prerequisite => ({
          description: prerequisite.description
        }))
      };

      await adminFormationsApi.update(selectedFormation.id, updatedFormation);

      // Mettre à jour la liste des formations
      await refetch();

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
      setFormations(formations.filter(f => f.id !== selectedFormation.id));
      setShowDeleteModal(false);
      addToast('Formation supprimée avec succès', 'success');
    } catch (err) {
      console.error('Error deleting formation:', err);
      addToast('Erreur lors de la suppression de la formation', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Fonctions pour gérer les modules
  const addModule = () => {
    setModules([...modules, {
      title: '',
      duration: 0,
      position: modules.length + 1,
      points: []
    }]);
  };

  const removeModule = (index: number) => {
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    setModules(updatedModules);
  };

  const updateModule = (index: number, field: keyof ModuleInput, value: any) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setModules(updatedModules);
  };

  // Fonctions pour gérer les points d'un module
  const addModulePoint = (moduleIndex: number) => {
    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].points) {
      updatedModules[moduleIndex].points = [];
    }
    updatedModules[moduleIndex].points.push({ content: '' });
    setModules(updatedModules);
  };

  const removeModulePoint = (moduleIndex: number, pointIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].points.splice(pointIndex, 1);
    setModules(updatedModules);
  };

  const updateModulePoint = (moduleIndex: number, pointIndex: number, content: string) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].points[pointIndex].content = content;
    setModules(updatedModules);
  };

  // Fonctions pour gérer les prérequis
  const addPrerequisite = () => {
    setPrerequisites([...prerequisites, { description: '' }]);
  };

  const removePrerequisite = (index: number) => {
    const updatedPrerequisites = [...prerequisites];
    updatedPrerequisites.splice(index, 1);
    setPrerequisites(updatedPrerequisites);
  };

  const updatePrerequisite = (index: number, value: string) => {
    const updatedPrerequisites = [...prerequisites];
    updatedPrerequisites[index] = { description: value };
    setPrerequisites(updatedPrerequisites);
  };

  const moveModuleUp = (index: number) => {
    if (index === 0) return; // Impossible de monter le premier module

    const updatedModules = [...modules];
    // Échanger le module avec celui au-dessus
    [updatedModules[index], updatedModules[index - 1]] = [updatedModules[index - 1], updatedModules[index]];

    // Mettre à jour l'ordre
    updatedModules.forEach((module, idx) => {
      module.position = idx + 1;
    });

    setModules(updatedModules);
  };

  const moveModuleDown = (index: number) => {
    if (index === modules.length - 1) return; // Impossible de descendre le dernier module

    const updatedModules = [...modules];
    // Échanger le module avec celui en-dessous
    [updatedModules[index], updatedModules[index + 1]] = [updatedModules[index + 1], updatedModules[index]];

    // Mettre à jour l'ordre
    updatedModules.forEach((module, idx) => {
      module.position = idx + 1;
    });

    setModules(updatedModules);
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

  // Rendu des actions pour chaque ligne avec menu dropdown
  const renderActions = (formation: Formation) => {
    const actions = [
      {
        label: 'Voir les détails',
        icon: <Eye className="h-4 w-4" />,
        onClick: () => window.location.href = `/admin/formations/${formation.id}`
      },
      {
        label: 'Supprimer',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => openDeleteModal(formation),
        variant: 'danger' as const
      }
    ];

    return <ActionMenu actions={actions} className="flex justify-end" />;
  };

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
    <AdminLayout title="Gestion des formations">

            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => {/* TODO: Handle error closure */}}
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
                data={formations || []}
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

        {/* Modal d'édition */}
        <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Modifier la formation"
            footer={editModalFooter}
            maxWidth="max-w-4xl"
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                        rows={4}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            formErrors.description ? 'border-red-500' : ''
                        }`}
                        value={selectedFormation.description || ''}
                        onChange={(e) => setSelectedFormation({...selectedFormation, description: e.target.value})}
                    />
                    {formErrors.description && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
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

                {/* Modules section */}
                <div className="mt-8 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Modules</h3>
                    <button
                        type="button"
                        onClick={addModule}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un module
                    </button>
                  </div>

                  {modules.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">Aucun module ajouté</p>
                  ) : (
                      <div className="space-y-4">
                        {modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <h4 className="font-medium">Module {moduleIndex + 1}</h4>
                                  <div className="ml-4 flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => moveModuleUp(moduleIndex)}
                                        disabled={moduleIndex === 0}
                                        className={`p-1 rounded ${moduleIndex === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-100'}`}
                                        title="Monter ce module"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                           fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                              clipRule="evenodd"/>
                                      </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveModuleDown(moduleIndex)}
                                        disabled={moduleIndex === modules.length - 1}
                                        className={`p-1 rounded ${moduleIndex === modules.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-100'}`}
                                        title="Descendre ce module"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                           fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeModule(moduleIndex)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4"/>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre
                                  </label>
                                  <input
                                      type="text"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      value={module.title}
                                      onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Durée (heures)
                                  </label>
                                  <input
                                      type="number"
                                      min="1"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      value={module.duration}
                                      onChange={(e) => updateModule(moduleIndex, 'duration', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </div>

                              {/* Points du module */}
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-sm font-medium text-gray-700">Points du module</h5>
                                  <button
                                      type="button"
                                      onClick={() => addModulePoint(moduleIndex)}
                                      className="inline-flex items-center px-2 py-1 text-xs border border-blue-700 rounded text-blue-700 bg-white hover:bg-blue-50"
                                  >
                                    <Plus className="h-3 w-3 mr-1"/>
                                    Ajouter un point
                                  </button>
                                </div>

                                {module.points?.length === 0 ? (
                                    <p className="text-gray-500 text-xs italic">Aucun point ajouté</p>
                                ) : (
                                    <div className="space-y-2">
                                      {module.points?.map((point, pointIndex) => (
                                          <div key={pointIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                value={point.content}
                                                onChange={(e) => updateModulePoint(moduleIndex, pointIndex, e.target.value)}
                                                placeholder="Contenu du point"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeModulePoint(moduleIndex, pointIndex)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                              <Trash2 className="h-4 w-4"/>
                                            </button>
                                          </div>
                                      ))}
                                    </div>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>

                {/* Prérequis section */}
                <div className="mt-8 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Prérequis</h3>
                    <button
                        type="button"
                        onClick={addPrerequisite}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-700 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1"/>
                      Ajouter un prérequis
                    </button>
                  </div>

                  {prerequisites.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">Aucun prérequis ajouté</p>
                  ) : (
                      <div className="space-y-4">
                        {prerequisites.map((prerequisite, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                  type="text"
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  value={prerequisite.description}
                                  onChange={(e) => updatePrerequisite(index, e.target.value)}
                                  placeholder="Description du prérequis"
                              />
                              <button
                                  type="button"
                                  onClick={() => removePrerequisite(index)}
                                  className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                        ))}
                      </div>
                  )}
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
    </AdminLayout>
  );
};

export default FormationsAdmin;