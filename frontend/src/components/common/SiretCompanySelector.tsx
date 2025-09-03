import React, { useState, useEffect } from 'react';
import { Building2, Check, AlertCircle, Loader2, Edit2, X } from 'lucide-react';
import axios from 'axios';
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

interface SiretCompanySelectorProps {
  selectedCompanyId?: number | null;
  onCompanySelect: (companyId: number | null) => void;
  onCompanyData?: (company: Company | null) => void;
  required?: boolean;
  label?: string;
  existingCompanyData?: Company | null;
}

const SiretCompanySelector: React.FC<SiretCompanySelectorProps> = ({
  selectedCompanyId,
  onCompanySelect,
  onCompanyData,
  required = false,
  label = "Entreprise",
  existingCompanyData = null
}) => {
  const [siret, setSiret] = useState('');
  const [existingCompany, setExistingCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [isEditingExistingCompany, setIsEditingExistingCompany] = useState(false);

  // État pour l'édition de l'entreprise existante
  const [editedExistingCompany, setEditedExistingCompany] = useState({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    responsableName: '',
    email: '',
    phone: ''
  });

  // État pour le formulaire de nouvelle entreprise
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    responsableName: '',
    email: '',
    phone: ''
  });

  // Initialiser avec les données existantes si fournies
  useEffect(() => {
    if (existingCompanyData && !siret) {
      setSiret(existingCompanyData.siret);
      setExistingCompany(existingCompanyData);
      setShowNewCompanyForm(false);
      if (onCompanyData) {
        onCompanyData(existingCompanyData);
      }
    }
  }, [existingCompanyData, onCompanyData, siret]);

  // Vérifier le SIRET quand il change (debounced)
  useEffect(() => {
    if (siret.length === 14) {
      checkSiret(siret);
    } else if (siret.length > 0 && siret.length !== 14) {
      setError('Le SIRET doit contenir exactement 14 chiffres');
      setExistingCompany(null);
      setShowNewCompanyForm(false);
    } else {
      setError(null);
      setExistingCompany(null);
      setShowNewCompanyForm(false);
    }
  }, [siret]);

  const checkSiret = async (siretValue: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/public/companies/check-siret/${siretValue}`);
      
      if (response.data.exists) {
        // Entreprise existe déjà
        const company = response.data.company;
        setExistingCompany(company);
        setShowNewCompanyForm(false);
        onCompanySelect(company.id);
        if (onCompanyData) {
          onCompanyData(company);
        }
      } else {
        // Entreprise n'existe pas, proposer de la créer
        setExistingCompany(null);
        setShowNewCompanyForm(true);
        onCompanySelect(null);
        if (onCompanyData) {
          onCompanyData(null);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Format SIRET invalide');
      } else {
        setError('Erreur lors de la vérification du SIRET');
      }
      setExistingCompany(null);
      setShowNewCompanyForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSiretChange = (value: string) => {
    // Autoriser seulement les chiffres et limiter à 14 caractères
    const cleanValue = value.replace(/\D/g, '').slice(0, 14);
    setSiret(cleanValue);
  };

  const formatSiret = (value: string) => {
    // Formater le SIRET avec des espaces pour la lisibilité (XXX XXX XXX XXXXX)
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
  };

  const isNewCompanyValid = () => {
    return newCompany.name && newCompany.address && newCompany.postalCode && 
           newCompany.city && newCompany.responsableName && newCompany.email && 
           newCompany.phone && siret.length === 14;
  };

  // Commencer l'édition de l'entreprise existante
  const handleEditExistingCompany = () => {
    if (existingCompany) {
      setEditedExistingCompany({
        name: existingCompany.name,
        address: existingCompany.address,
        postalCode: existingCompany.postalCode,
        city: existingCompany.city,
        responsableName: existingCompany.responsableName,
        email: existingCompany.email,
        phone: existingCompany.phone
      });
      setIsEditingExistingCompany(true);
    }
  };

  // Annuler l'édition de l'entreprise existante
  const handleCancelEditExistingCompany = () => {
    setIsEditingExistingCompany(false);
    setEditedExistingCompany({
      name: '',
      address: '',
      postalCode: '',
      city: '',
      responsableName: '',
      email: '',
      phone: ''
    });
  };

  // Sauvegarder les modifications de l'entreprise existante
  const handleSaveExistingCompany = async () => {
    if (!existingCompany) return;

    try {
      setLoading(true);
      setError(null);

      // Mettre à jour l'entreprise via l'API admin
      const response = await adminCompaniesApi.update(existingCompany.id, {
        ...editedExistingCompany,
        siret: existingCompany.siret // Garder le même SIRET
      });

      const updatedCompany = response.data;
      
      // Mettre à jour les données locales
      setExistingCompany(updatedCompany);
      setIsEditingExistingCompany(false);
      
      // Callback optionnel
      if (onCompanyData) {
        onCompanyData(updatedCompany);
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const isEditedCompanyValid = () => {
    return editedExistingCompany.name && editedExistingCompany.address && 
           editedExistingCompany.postalCode && editedExistingCompany.city && 
           editedExistingCompany.responsableName && editedExistingCompany.email && 
           editedExistingCompany.phone;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Champ SIRET */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Numéro SIRET *
        </label>
        <div className="relative">
          <input
            type="text"
            value={siret}
            onChange={(e) => handleSiretChange(e.target.value)}
            placeholder="Saisissez le SIRET de l'entreprise (14 chiffres)"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={14}
          />
          <Building2 className="absolute left-3 top-3 text-gray-400" />
          
          {loading && (
            <Loader2 className="absolute right-3 top-3 text-blue-500 animate-spin" />
          )}
          
          {existingCompany && (
            <Check className="absolute right-3 top-3 text-green-500" />
          )}
          
          {error && (
            <AlertCircle className="absolute right-3 top-3 text-red-500" />
          )}
        </div>
        
        {siret.length > 0 && siret.length < 14 && (
          <p className="text-sm text-gray-500">
            SIRET formaté : {formatSiret(siret)}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>

      {/* Affichage de l'entreprise existante */}
      {existingCompany && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          {!isEditingExistingCompany ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Entreprise trouvée</span>
                </div>
                <button
                  onClick={handleEditExistingCompany}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                  title="Modifier les informations de l'entreprise"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-gray-900">{existingCompany.name}</div>
                <div className="text-gray-600">
                  {existingCompany.address}, {existingCompany.postalCode} {existingCompany.city}
                </div>
                <div className="text-gray-600">
                  Responsable : {existingCompany.responsableName}
                </div>
                <div className="text-gray-600">
                  Contact : {existingCompany.email} • {existingCompany.phone}
                </div>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Cette entreprise sera automatiquement liée à votre réservation.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Edit2 className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Modifier l'entreprise</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={editedExistingCompany.name}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du responsable *
                  </label>
                  <input
                    type="text"
                    value={editedExistingCompany.responsableName}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, responsableName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={editedExistingCompany.address}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={editedExistingCompany.postalCode}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={editedExistingCompany.city}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editedExistingCompany.email}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={editedExistingCompany.phone}
                    onChange={(e) => setEditedExistingCompany(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={handleCancelEditExistingCompany}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveExistingCompany}
                  disabled={loading || !isEditedCompanyValid()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-1" size={16} />
                  ) : (
                    <Check size={16} className="mr-1" />
                  )}
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Formulaire de nouvelle entreprise */}
      {showNewCompanyForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center mb-4">
            <Building2 className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Nouvelle entreprise</span>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Cette entreprise n'existe pas encore. Veuillez remplir les informations ci-dessous.
          </p>

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
                onChange={(e) => setNewCompany(prev => ({ ...prev, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
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

          {!isNewCompanyValid() && (
            <p className="text-sm text-amber-600 mt-3">
              Veuillez remplir tous les champs pour continuer.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SiretCompanySelector;