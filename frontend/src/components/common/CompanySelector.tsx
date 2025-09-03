import React, { useState, useEffect } from 'react';
import { Building2, Plus, X, Check } from 'lucide-react';
import { adminCompaniesApi } from '../../services/api';

interface Company {
  id: number;
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  responsableName: string;
  email: string;
  phone: string;
}

interface CompanySelectorProps {
  selectedCompanyId?: number | null;
  onCompanySelect: (companyId: number | null) => void;
  onCompanyCreate?: (company: Company) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  showCreateOption?: boolean;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  selectedCompanyId,
  onCompanySelect,
  onCompanyCreate,
  required = false,
  label = "Entreprise",
  placeholder = "Sélectionnez une entreprise",
  showCreateOption = true
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État pour le formulaire de création
  const [newCompany, setNewCompany] = useState({
    name: '',
    siret: '',
    address: '',
    postalCode: '',
    city: '',
    responsableName: '',
    email: '',
    phone: ''
  });

  // Charger les entreprises
  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminCompaniesApi.getAll();
      if (response.data?.data) {
        setCompanies(response.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des entreprises:', err);
      setError('Impossible de charger la liste des entreprises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Gérer la création d'une nouvelle entreprise
  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.siret || !newCompany.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      const response = await adminCompaniesApi.create(newCompany);
      const createdCompany = response.data;
      
      // Ajouter la nouvelle entreprise à la liste
      setCompanies(prev => [...prev, createdCompany]);
      
      // Sélectionner automatiquement la nouvelle entreprise
      onCompanySelect(createdCompany.id);
      
      // Callback optionnel
      if (onCompanyCreate) {
        onCompanyCreate(createdCompany);
      }
      
      // Réinitialiser le formulaire et fermer
      setNewCompany({
        name: '',
        siret: '',
        address: '',
        postalCode: '',
        city: '',
        responsableName: '',
        email: '',
        phone: ''
      });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'entreprise');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Sélecteur d'entreprise */}
      <div className="relative">
        <select
          value={selectedCompanyId || ''}
          onChange={(e) => onCompanySelect(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
          disabled={loading}
        >
          <option value="">{loading ? 'Chargement...' : placeholder}</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name} - {company.siret}
            </option>
          ))}
        </select>
        <Building2 className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Affichage des détails de l'entreprise sélectionnée */}
      {selectedCompany && (
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="font-medium">{selectedCompany.name}</div>
          <div className="text-gray-600">
            {selectedCompany.address}, {selectedCompany.postalCode} {selectedCompany.city}
          </div>
          <div className="text-gray-600">
            Responsable: {selectedCompany.responsableName} - {selectedCompany.phone}
          </div>
        </div>
      )}

      {/* Bouton pour créer une nouvelle entreprise */}
      {showCreateOption && !showCreateForm && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus size={16} className="mr-1" />
          Créer une nouvelle entreprise
        </button>
      )}

      {/* Formulaire de création d'entreprise */}
      {showCreateForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Nouvelle entreprise</h4>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setError(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={newCompany.name}
                onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET *
              </label>
              <input
                type="text"
                value={newCompany.siret}
                onChange={(e) => setNewCompany(prev => ({ ...prev, siret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={14}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                value={newCompany.address}
                onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal *
              </label>
              <input
                type="text"
                value={newCompany.postalCode}
                onChange={(e) => setNewCompany(prev => ({ ...prev, postalCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={5}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={newCompany.city}
                onChange={(e) => setNewCompany(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du responsable *
              </label>
              <input
                type="text"
                value={newCompany.responsableName}
                onChange={(e) => setNewCompany(prev => ({ ...prev, responsableName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newCompany.email}
                onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={newCompany.phone}
                onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setError(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isCreating}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleCreateCompany}
              disabled={isCreating || !newCompany.name || !newCompany.siret || !newCompany.email}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isCreating ? (
                'Création...'
              ) : (
                <>
                  <Check size={16} className="mr-1" />
                  Créer l'entreprise
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;