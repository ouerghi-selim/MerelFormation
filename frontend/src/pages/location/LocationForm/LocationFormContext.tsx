import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FormData {
    // Informations personnelles
    name: string;
    firstName: string;
    birthDate: string;
    birthPlace: string;
    phone: string;
    email: string;

    // Adresse
    address: string;
    postalCode: string;
    city: string;
    facturation: string;

    // Entreprise (optionnel)
    isLinkedToCompany: boolean;
    companyId: number | null;

    // Examen
    examCenter: string;
    formula: string;
    examDate: string;
    examTime: string;

    // Paiement
    financing: string;
    paymentMethod: string;
    driverLicenseFront: File | null;
    driverLicenseBack: File | null;
    observations: string;
}

interface FormErrors {
    [key: string]: string;
}

interface LocationFormContextType {
    formData: FormData;
    updateFormData: (newData: Partial<FormData>) => void;
    errors: FormErrors;
    validateField: (fieldName: keyof FormData) => boolean;
    isFieldTouched: (fieldName: keyof FormData) => boolean;
    setFieldTouched: (fieldName: keyof FormData) => void;
    touchedFields: Set<keyof FormData>;
    isStepValid: (step: number) => boolean;
}

const defaultFormData: FormData = {
    name: '',
    firstName: '',
    birthDate: '',
    birthPlace: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    facturation: '',
    isLinkedToCompany: false,
    companyId: null,
    examCenter: '',
    formula: '',
    examDate: '',
    examTime: '',
    financing: '',
    paymentMethod: '',
    driverLicenseFront: null,
    driverLicenseBack: null,
    observations: '',
};

const LocationFormContext = createContext<LocationFormContextType | undefined>(undefined);

export const LocationFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touchedFields, setTouchedFields] = useState<Set<keyof FormData>>(new Set());

    const updateFormData = (newData: Partial<FormData>) => {
        setFormData(prevData => ({ ...prevData, ...newData }));

        // Valider automatiquement les champs mis à jour
        Object.keys(newData).forEach(fieldName => {
            validateField(fieldName as keyof FormData);
        });
    };

    const validateField = (fieldName: keyof FormData) => {
        let isValid = true;
        let errorMessage = '';

        const value = formData[fieldName];

        // Règles de validation spécifiques par champ
        switch (fieldName) {
            case 'name':
            case 'firstName':
                if (!value || typeof value !== 'string' || value.trim() === '') {
                    isValid = false;
                    errorMessage = 'Ce champ est obligatoire';
                }
                break;
            case 'email':
                if (!value || typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Email invalide';
                }
                break;
            case 'phone':
                if (!value || typeof value !== 'string' || !/^[0-9+\s]{8,15}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Numéro de téléphone invalide';
                }
                break;
            case 'birthDate':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Date de naissance obligatoire';
                }
                break;
            case 'postalCode':
                if (!value || typeof value !== 'string' || !/^\d{5}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Code postal invalide (5 chiffres)';
                }
                break;
            case 'examDate':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Date d\'examen obligatoire';
                }
                break;
            case 'birthPlace':
                if (!value || typeof value !== 'string' || value.trim() === '') {
                    isValid = false;
                    errorMessage = 'Lieu de naissance obligatoire';
                }
                break;
            case 'address':
                if (!value || typeof value !== 'string' || value.trim() === '') {
                    isValid = false;
                    errorMessage = 'Adresse obligatoire';
                }
                break;
            case 'city':
                if (!value || typeof value !== 'string' || value.trim() === '') {
                    isValid = false;
                    errorMessage = 'Ville obligatoire';
                }
                break;
            case 'facturation':
                if (!value || typeof value !== 'string' || value.trim() === '') {
                    isValid = false;
                    errorMessage = 'Information de facturation obligatoire';
                }
                break;
            case 'examCenter':
                if (!value || value === '') {
                    isValid = false;
                    errorMessage = 'Centre d\'examen obligatoire';
                }
                break;
            case 'formula':
                if (!value || value === '') {
                    isValid = false;
                    errorMessage = 'Formule obligatoire';
                }
                break;
            case 'examTime':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Heure d\'examen obligatoire';
                }
                break;
            case 'financing':
                if (!value || value === '') {
                    isValid = false;
                    errorMessage = 'Mode de financement obligatoire';
                }
                break;
            case 'paymentMethod':
                if (!value || value === '') {
                    isValid = false;
                    errorMessage = 'Méthode de paiement obligatoire';
                }
                break;
            case 'driverLicenseFront':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Permis recto obligatoire';
                }
                break;
            case 'driverLicenseBack':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Permis verso obligatoire';
                }
                break;
            case 'companyId':
                // Valider seulement si l'utilisateur est rattaché à une entreprise
                if (formData.isLinkedToCompany && (!value || value === null)) {
                    isValid = false;
                    errorMessage = 'Entreprise obligatoire';
                }
                break;
        }

        // Mettre à jour l'état des erreurs
        setErrors(prev => ({
            ...prev,
            [fieldName]: isValid ? '' : errorMessage
        }));

        return isValid;
    };

    const isFieldTouched = (fieldName: keyof FormData) => {
        return touchedFields.has(fieldName);
    };

    const setFieldTouched = (fieldName: keyof FormData) => {
        setTouchedFields(prev => new Set(prev).add(fieldName));
        validateField(fieldName);
    };

    // Vérifier si une étape est valide
    const isStepValid = (step: number) => {
        let fieldsToValidate: Array<keyof FormData> = [];

        // Définir les champs à valider pour chaque étape
        switch (step) {
            case 1:
                fieldsToValidate = ['name', 'firstName', 'birthDate', 'birthPlace', 'phone', 'email'];
                // Ajouter la validation d'entreprise si rattaché
                if (formData.isLinkedToCompany) {
                    fieldsToValidate.push('companyId');
                }
                break;
            case 2:
                fieldsToValidate = ['address', 'postalCode', 'city', 'facturation'];
                break;
            case 3:
                fieldsToValidate = ['examCenter', 'formula', 'examDate', 'examTime'];
                break;
            case 4:
                fieldsToValidate = ['financing', 'paymentMethod', 'driverLicenseFront', 'driverLicenseBack'];
                break;
        }

        // Valider tous les champs de l'étape
        return fieldsToValidate.every(field => validateField(field));
    };

    return (
        <LocationFormContext.Provider value={{
            formData,
            updateFormData,
            errors,
            validateField,
            isFieldTouched,
            setFieldTouched,
            touchedFields,
            isStepValid
        }}>
            {children}
        </LocationFormContext.Provider>
    );
};

export const useLocationForm = () => {
    const context = useContext(LocationFormContext);
    if (context === undefined) {
        throw new Error('useLocationForm must be used within a LocationFormProvider');
    }
    return context;
};