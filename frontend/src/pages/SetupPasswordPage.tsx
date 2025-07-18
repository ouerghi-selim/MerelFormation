import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Phone, Mail, ChevronRight, ChevronLeft, CheckCircle, Lock, Upload, FileText, X, Building2 } from 'lucide-react';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { authApi } from '../services/api';

interface SetupFormData {
    email: string;
    password: string;
    confirmPassword: string;
    birthDate: string;
    birthPlace: string;
    address: string;
    postalCode: string;
    city: string;
    // Entreprise/Employeur (optionnel)
    hasEmployer: boolean;
    companyName?: string;
    companyAddress?: string;
    companyPostalCode?: string;
    companyCity?: string;
    companySiret?: string;
    companyResponsableName?: string;
    companyEmail?: string;
    companyPhone?: string;
    // Documents optionnels
    driverLicense?: File | null;
    professionalCard?: File | null;
    registrationFile?: File | null;
    attestationInscription?: File | null;
    convocation?: File | null;
}

const SetupPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formationType, setFormationType] = useState<string | null>(null);
    const [isExistingCompany, setIsExistingCompany] = useState(false);
    const [companyCheckLoading, setCompanyCheckLoading] = useState(false);
    
    const [formData, setFormData] = useState<SetupFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        birthPlace: '',
        address: '',
        postalCode: '',
        city: '',
        hasEmployer: false,
        companyName: '',
        companyAddress: '',
        companyPostalCode: '',
        companyCity: '',
        companySiret: '',
        companyResponsableName: '',
        companyEmail: '',
        companyPhone: '',
        driverLicense: null,
        professionalCard: null,
        registrationFile: null,
        attestationInscription: null,
        convocation: null
    });

    const [errors, setErrors] = useState<Partial<SetupFormData>>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    useEffect(() => {
        if (!token || !emailParam) {
            setError('Lien de finalisation invalide ou expiré');
            setIsLoading(false);
            return;
        }

        // Décoder l'email
        const decodedEmail = decodeURIComponent(emailParam);
        setFormData(prev => ({ ...prev, email: decodedEmail }));
        
        // Vérifier la validité du token et récupérer les informations de formation
        validateToken();
    }, [token, emailParam]);

    const validateToken = async () => {
        try {
            const response = await authApi.validateSetupToken(token!, decodeURIComponent(emailParam!));
            
            if (response.data.valid) {
                setFormationType(response.data.formationType);
                setIsLoading(false);
            } else {
                setError('Lien de finalisation invalide ou expiré');
                setIsLoading(false);
            }
        } catch (err: any) {
            setError('Erreur lors de la validation du lien');
            setIsLoading(false);
        }
    };

    const updateFormData = (updates: Partial<SetupFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        // Supprimer les erreurs des champs modifiés
        const updatedFields = Object.keys(updates);
        setErrors(prev => {
            const newErrors = { ...prev };
            updatedFields.forEach(field => {
                delete newErrors[field as keyof SetupFormData];
            });
            return newErrors;
        });
    };

    const setFieldTouched = (field: string) => {
        setTouchedFields(prev => new Set(prev).add(field));
    };

    // Vérifier si une entreprise existe avec ce SIRET
    const checkCompanySiret = async (siret: string) => {
        if (siret.length !== 14) {
            setIsExistingCompany(false);
            return;
        }

        setCompanyCheckLoading(true);
        try {
            const response = await authApi.checkCompanySiret(siret);
            
            if (response.data.exists) {
                // Auto-remplir avec les données de l'entreprise existante
                const company = response.data.company;
                setFormData(prev => ({
                    ...prev,
                    companyName: company.name,
                    companyAddress: company.address,
                    companyPostalCode: company.postalCode,
                    companyCity: company.city,
                    companyResponsableName: company.responsableName,
                    companyEmail: company.email,
                    companyPhone: company.phone,
                }));
                setIsExistingCompany(true);
                
                // Effacer les erreurs des champs entreprise
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.companyName;
                    delete newErrors.companyAddress;
                    delete newErrors.companyPostalCode;
                    delete newErrors.companyCity;
                    delete newErrors.companyResponsableName;
                    delete newErrors.companyEmail;
                    delete newErrors.companyPhone;
                    return newErrors;
                });
            } else {
                setIsExistingCompany(false);
            }
        } catch (err) {
            console.error('Erreur lors de la vérification du SIRET:', err);
            setIsExistingCompany(false);
        } finally {
            setCompanyCheckLoading(false);
        }
    };

    // Gérer le changement de SIRET
    const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const siret = e.target.value.replace(/\D/g, ''); // Garder seulement les chiffres
        if (siret.length <= 14) {
            updateFormData({ companySiret: siret });
            
            // Vérifier si SIRET complet
            if (siret.length === 14) {
                checkCompanySiret(siret);
            } else {
                setIsExistingCompany(false);
            }
        }
    };

    const validateStep1 = (): boolean => {
        const newErrors: Partial<SetupFormData> = {};
        
        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        
        if (!formData.birthDate) {
            newErrors.birthDate = 'La date de naissance est requise';
        }
        
        if (!formData.birthPlace) {
            newErrors.birthPlace = 'Le lieu de naissance est requis';
        }
        
        if (!formData.address) {
            newErrors.address = 'L\'adresse est requise';
        }
        
        if (!formData.postalCode) {
            newErrors.postalCode = 'Le code postal est requis';
        }
        
        if (!formData.city) {
            newErrors.city = 'La ville est requise';
        }

        // Validation des champs entreprise si activés
        if (formData.hasEmployer) {
            if (!formData.companyName) {
                newErrors.companyName = 'Le nom de l\'entreprise est requis';
            }
            
            if (!formData.companyAddress) {
                newErrors.companyAddress = 'L\'adresse de l\'entreprise est requise';
            }
            
            if (!formData.companyPostalCode) {
                newErrors.companyPostalCode = 'Le code postal est requis';
            }
            
            if (!formData.companyCity) {
                newErrors.companyCity = 'La ville est requise';
            }
            
            if (!formData.companySiret) {
                newErrors.companySiret = 'Le numéro SIRET est requis';
            } else if (!/^[0-9]{14}$/.test(formData.companySiret)) {
                newErrors.companySiret = 'Le numéro SIRET doit contenir 14 chiffres';
            }
            
            if (!formData.companyResponsableName) {
                newErrors.companyResponsableName = 'Le nom du responsable est requis';
            }
            
            if (!formData.companyEmail) {
                newErrors.companyEmail = 'L\'email de l\'entreprise est requis';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
                newErrors.companyEmail = 'L\'email n\'est pas valide';
            }
            
            if (!formData.companyPhone) {
                newErrors.companyPhone = 'Le téléphone de l\'entreprise est requis';
            } else if (!/^[0-9\s\+\-\.]{10,20}$/.test(formData.companyPhone)) {
                newErrors.companyPhone = 'Le numéro de téléphone n\'est pas valide';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        // Marquer tous les champs comme touchés
        const fieldsToValidate = ['password', 'confirmPassword', 'birthDate', 'birthPlace', 'address', 'postalCode', 'city'];
        
        // Ajouter les champs entreprise si activés
        if (formData.hasEmployer) {
            fieldsToValidate.push(
                'companyName', 'companyAddress', 'companyPostalCode', 'companyCity', 
                'companySiret', 'companyResponsableName', 'companyEmail', 'companyPhone'
            );
        }
        
        fieldsToValidate.forEach(field => setFieldTouched(field));

        if (validateStep1()) {
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const handleFileChange = (field: keyof SetupFormData, file: File | null) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = async () => {
        if (step === 1 && !validateStep1()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const formDataToSend = new FormData();
            
            // Données de base
            formDataToSend.append('token', token!);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('birthDate', formData.birthDate);
            formDataToSend.append('birthPlace', formData.birthPlace);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('postalCode', formData.postalCode);
            formDataToSend.append('city', formData.city);
            
            // Données entreprise si activées
            if (formData.hasEmployer) {
                formDataToSend.append('hasEmployer', 'true');
                formDataToSend.append('companyName', formData.companyName || '');
                formDataToSend.append('companyAddress', formData.companyAddress || '');
                formDataToSend.append('companyPostalCode', formData.companyPostalCode || '');
                formDataToSend.append('companyCity', formData.companyCity || '');
                formDataToSend.append('companySiret', formData.companySiret || '');
                formDataToSend.append('companyResponsableName', formData.companyResponsableName || '');
                formDataToSend.append('companyEmail', formData.companyEmail || '');
                formDataToSend.append('companyPhone', formData.companyPhone || '');
            }
            
            // Documents optionnels (si étape 2)
            if (step === 2) {
                if (formData.driverLicense) {
                    formDataToSend.append('driverLicense', formData.driverLicense);
                }
                if (formData.professionalCard) {
                    formDataToSend.append('professionalCard', formData.professionalCard);
                }
                if (formData.registrationFile) {
                    formDataToSend.append('registrationFile', formData.registrationFile);
                }
                if (formData.attestationInscription) {
                    formDataToSend.append('attestationInscription', formData.attestationInscription);
                }
                if (formData.convocation) {
                    formDataToSend.append('convocation', formData.convocation);
                }
            }

            await authApi.completeRegistration(formDataToSend);

            setSuccess(true);
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Votre inscription a été finalisée avec succès. Vous pouvez maintenant vous connecter.' 
                    }
                });
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la finalisation de votre inscription');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRequiredDocuments = () => {
        if (formationType === 'initiale') {
            return [
                { key: 'driverLicense', label: 'Permis de conduire (recto/verso)', required: false },
                { key: 'registrationFile', label: 'Dossier d\'inscription', required: false },
                { key: 'attestationInscription', label: 'Attestation d\'inscription', required: false },
                { key: 'convocation', label: 'Convocation', required: false }
            ];
        } else if (formationType === 'mobilite' || formationType === 'continue') {
            return [
                { key: 'professionalCard', label: 'Carte professionnelle', required: false },
                { key: 'registrationFile', label: 'Dossier d\'inscription', required: false },
                { key: 'attestationInscription', label: 'Attestation d\'inscription', required: false },
                { key: 'convocation', label: 'Convocation', required: false }
            ];
        }
        return [];
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Vérification du lien...</p>
                </div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <X className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Erreur</h3>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <Button
                            onClick={() => navigate('/')}
                            variant="primary"
                            className="mt-6"
                        >
                            Retour à l'accueil
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-900 text-white py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center">Finalisation de votre inscription</h1>
                    <p className="text-center text-blue-100 mt-2">Complétez vos informations pour accéder à votre espace personnel</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Progress Stepper */}
                    <div className="bg-blue-900 text-white p-6">
                        <div className="flex items-center justify-between max-w-md mx-auto">
                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    step >= 1 ? 'bg-blue-700 border-white' : 'bg-blue-800 border-blue-700'
                                } mb-2`}>
                                    {step > 1 ? (
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    ) : (
                                        <span className="text-white font-bold">1</span>
                                    )}
                                </div>
                                <span className={`text-sm ${step === 1 ? 'text-white font-medium' : 'text-blue-200'}`}>
                                    Informations
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    step === 2 ? 'bg-blue-700 border-white' : 'bg-blue-800 border-blue-700'
                                } mb-2`}>
                                    <span className="text-white font-bold">2</span>
                                </div>
                                <span className={`text-sm ${step === 2 ? 'text-white font-medium' : 'text-blue-200'}`}>
                                    Documents
                                </span>
                            </div>
                        </div>

                        {/* Progress Line */}
                        <div className="mt-4 relative max-w-md mx-auto">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700 rounded-full"></div>
                            <div
                                className="absolute top-0 left-0 h-1 bg-white rounded-full transition-all duration-300"
                                style={{ width: `${(step / 2) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="p-8">
                        {success && (
                            <Alert
                                type="success"
                                message="Votre inscription a été finalisée avec succès ! Redirection vers la page de connexion..."
                                onClose={() => {}}
                            />
                        )}

                        {error && (
                            <Alert
                                type="error"
                                message={error}
                                onClose={() => setError(null)}
                            />
                        )}

                        {!success && (
                            <>
                                {/* Étape 1: Informations personnelles et mot de passe */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <User className="mr-2 text-blue-900" />
                                            Vos informations personnelles
                                        </h3>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Adresse email</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                                    disabled
                                                />
                                                <Mail className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        value={formData.password}
                                                        className={`w-full pl-10 pr-4 py-3 border ${
                                                            errors.password && touchedFields.has('password') 
                                                                ? 'border-red-500 bg-red-50' 
                                                                : 'border-gray-300'
                                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                        onChange={(e) => updateFormData({ password: e.target.value })}
                                                        onBlur={() => setFieldTouched('password')}
                                                        placeholder="Minimum 8 caractères"
                                                        required
                                                    />
                                                    <Lock className="absolute left-3 top-3 text-gray-400" />
                                                </div>
                                                {errors.password && touchedFields.has('password') && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        value={formData.confirmPassword}
                                                        className={`w-full pl-10 pr-4 py-3 border ${
                                                            errors.confirmPassword && touchedFields.has('confirmPassword') 
                                                                ? 'border-red-500 bg-red-50' 
                                                                : 'border-gray-300'
                                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                        onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                                                        onBlur={() => setFieldTouched('confirmPassword')}
                                                        placeholder="Confirmez votre mot de passe"
                                                        required
                                                    />
                                                    <Lock className="absolute left-3 top-3 text-gray-400" />
                                                </div>
                                                {errors.confirmPassword && touchedFields.has('confirmPassword') && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Date de naissance *</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={formData.birthDate}
                                                        className={`w-full pl-10 pr-4 py-3 border ${
                                                            errors.birthDate && touchedFields.has('birthDate') 
                                                                ? 'border-red-500 bg-red-50' 
                                                                : 'border-gray-300'
                                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                        onChange={(e) => updateFormData({ birthDate: e.target.value })}
                                                        onBlur={() => setFieldTouched('birthDate')}
                                                        required
                                                    />
                                                    <Calendar className="absolute left-3 top-3 text-gray-400" />
                                                </div>
                                                {errors.birthDate && touchedFields.has('birthDate') && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Lieu de naissance *</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formData.birthPlace}
                                                        className={`w-full pl-10 pr-4 py-3 border ${
                                                            errors.birthPlace && touchedFields.has('birthPlace') 
                                                                ? 'border-red-500 bg-red-50' 
                                                                : 'border-gray-300'
                                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                        onChange={(e) => updateFormData({ birthPlace: e.target.value })}
                                                        onBlur={() => setFieldTouched('birthPlace')}
                                                        placeholder="Ville de naissance"
                                                        required
                                                    />
                                                    <MapPin className="absolute left-3 top-3 text-gray-400" />
                                                </div>
                                                {errors.birthPlace && touchedFields.has('birthPlace') && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.birthPlace}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Adresse *</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    className={`w-full pl-10 pr-4 py-3 border ${
                                                        errors.address && touchedFields.has('address') 
                                                            ? 'border-red-500 bg-red-50' 
                                                            : 'border-gray-300'
                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                    onChange={(e) => updateFormData({ address: e.target.value })}
                                                    onBlur={() => setFieldTouched('address')}
                                                    placeholder="Votre adresse complète"
                                                    required
                                                />
                                                <MapPin className="absolute left-3 top-3 text-gray-400" />
                                            </div>
                                            {errors.address && touchedFields.has('address') && (
                                                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Code postal *</label>
                                                <input
                                                    type="text"
                                                    value={formData.postalCode}
                                                    className={`w-full px-4 py-3 border ${
                                                        errors.postalCode && touchedFields.has('postalCode') 
                                                            ? 'border-red-500 bg-red-50' 
                                                            : 'border-gray-300'
                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                    onChange={(e) => updateFormData({ postalCode: e.target.value })}
                                                    onBlur={() => setFieldTouched('postalCode')}
                                                    placeholder="Code postal"
                                                    pattern="[0-9]{5}"
                                                    maxLength={5}
                                                    required
                                                />
                                                {errors.postalCode && touchedFields.has('postalCode') && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Ville *</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    className={`w-full px-4 py-3 border ${
                                                        errors.city && touchedFields.has('city') 
                                                            ? 'border-red-500 bg-red-50' 
                                                            : 'border-gray-300'
                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                    onChange={(e) => updateFormData({ city: e.target.value })}
                                                    onBlur={() => setFieldTouched('city')}
                                                    placeholder="Votre ville"
                                                    required
                                                />
                                                {errors.city && touchedFields.has('city') && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Section Employeur */}
                                        <div className="border-t pt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        id="hasEmployer"
                                                        type="checkbox"
                                                        checked={formData.hasEmployer}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            updateFormData({ hasEmployer: checked });
                                                            
                                                            // Réinitialiser les données entreprise si décoché
                                                            if (!checked) {
                                                                setIsExistingCompany(false);
                                                                updateFormData({
                                                                    companySiret: '',
                                                                    companyName: '',
                                                                    companyAddress: '',
                                                                    companyPostalCode: '',
                                                                    companyCity: '',
                                                                    companyResponsableName: '',
                                                                    companyEmail: '',
                                                                    companyPhone: '',
                                                                });
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="hasEmployer" className="text-sm font-medium text-gray-700 flex items-center">
                                                        <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                                                        Ajouter une partie employeur
                                                    </label>
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 ml-7">
                                                    Cochez cette case si votre formation est prise en charge par une entreprise
                                                </p>

                                                {formData.hasEmployer && (
                                                    <div className="ml-7 space-y-6 bg-gray-50 p-6 rounded-lg border">
                                                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                                            <Building2 className="mr-2 text-blue-600" />
                                                            Informations de l'entreprise
                                                        </h4>

                                                        {/* SIRET en premier */}
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                N° SIRET *
                                                                {companyCheckLoading && <span className="text-blue-600 text-xs ml-2">Vérification...</span>}
                                                                {isExistingCompany && <span className="text-green-600 text-xs ml-2">✓ Entreprise trouvée</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.companySiret || ''}
                                                                className={`w-full px-4 py-3 border ${
                                                                    errors.companySiret && touchedFields.has('companySiret') 
                                                                        ? 'border-red-500 bg-red-50' 
                                                                        : isExistingCompany 
                                                                            ? 'border-green-500 bg-green-50'
                                                                            : 'border-gray-300'
                                                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                                onChange={handleSiretChange}
                                                                onBlur={() => setFieldTouched('companySiret')}
                                                                placeholder="14 chiffres"
                                                                pattern="[0-9]{14}"
                                                                maxLength={14}
                                                                required
                                                            />
                                                            {errors.companySiret && touchedFields.has('companySiret') && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.companySiret}</p>
                                                            )}
                                                            {isExistingCompany && (
                                                                <p className="text-green-600 text-sm mt-1">
                                                                    <span className="font-medium">Entreprise trouvée !</span> Les champs ci-dessous ont été remplis automatiquement.
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise / société *</label>
                                                            <input
                                                                type="text"
                                                                value={formData.companyName || ''}
                                                                className={`w-full px-4 py-3 border ${
                                                                    errors.companyName && touchedFields.has('companyName') 
                                                                        ? 'border-red-500 bg-red-50' 
                                                                        : isExistingCompany 
                                                                            ? 'border-gray-300 bg-gray-100'
                                                                            : 'border-gray-300'
                                                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                    isExistingCompany ? 'cursor-not-allowed' : ''
                                                                }`}
                                                                onChange={(e) => !isExistingCompany && updateFormData({ companyName: e.target.value })}
                                                                onBlur={() => setFieldTouched('companyName')}
                                                                placeholder="Nom de l'entreprise"
                                                                disabled={isExistingCompany}
                                                                required
                                                            />
                                                            {errors.companyName && touchedFields.has('companyName') && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">Adresse postale *</label>
                                                            <input
                                                                type="text"
                                                                value={formData.companyAddress || ''}
                                                                className={`w-full px-4 py-3 border ${
                                                                    errors.companyAddress && touchedFields.has('companyAddress') 
                                                                        ? 'border-red-500 bg-red-50' 
                                                                        : isExistingCompany 
                                                                            ? 'border-gray-300 bg-gray-100'
                                                                            : 'border-gray-300'
                                                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                    isExistingCompany ? 'cursor-not-allowed' : ''
                                                                }`}
                                                                onChange={(e) => !isExistingCompany && updateFormData({ companyAddress: e.target.value })}
                                                                onBlur={() => setFieldTouched('companyAddress')}
                                                                placeholder="Adresse de l'entreprise"
                                                                disabled={isExistingCompany}
                                                                required
                                                            />
                                                            {errors.companyAddress && touchedFields.has('companyAddress') && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.companyAddress}</p>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">Code postal *</label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.companyPostalCode || ''}
                                                                    className={`w-full px-4 py-3 border ${
                                                                        errors.companyPostalCode && touchedFields.has('companyPostalCode') 
                                                                            ? 'border-red-500 bg-red-50' 
                                                                            : isExistingCompany 
                                                                                ? 'border-gray-300 bg-gray-100'
                                                                                : 'border-gray-300'
                                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                        isExistingCompany ? 'cursor-not-allowed' : ''
                                                                    }`}
                                                                    onChange={(e) => !isExistingCompany && updateFormData({ companyPostalCode: e.target.value })}
                                                                    onBlur={() => setFieldTouched('companyPostalCode')}
                                                                    placeholder="Code postal"
                                                                    pattern="[0-9]{5}"
                                                                    maxLength={5}
                                                                    disabled={isExistingCompany}
                                                                    required
                                                                />
                                                                {errors.companyPostalCode && touchedFields.has('companyPostalCode') && (
                                                                    <p className="text-red-500 text-sm mt-1">{errors.companyPostalCode}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">Ville *</label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.companyCity || ''}
                                                                    className={`w-full px-4 py-3 border ${
                                                                        errors.companyCity && touchedFields.has('companyCity') 
                                                                            ? 'border-red-500 bg-red-50' 
                                                                            : isExistingCompany 
                                                                                ? 'border-gray-300 bg-gray-100'
                                                                                : 'border-gray-300'
                                                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                        isExistingCompany ? 'cursor-not-allowed' : ''
                                                                    }`}
                                                                    onChange={(e) => !isExistingCompany && updateFormData({ companyCity: e.target.value })}
                                                                    onBlur={() => setFieldTouched('companyCity')}
                                                                    placeholder="Ville de l'entreprise"
                                                                    disabled={isExistingCompany}
                                                                    required
                                                                />
                                                                {errors.companyCity && touchedFields.has('companyCity') && (
                                                                    <p className="text-red-500 text-sm mt-1">{errors.companyCity}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">Nom du responsable *</label>
                                                            <input
                                                                type="text"
                                                                value={formData.companyResponsableName || ''}
                                                                className={`w-full px-4 py-3 border ${
                                                                    errors.companyResponsableName && touchedFields.has('companyResponsableName') 
                                                                        ? 'border-red-500 bg-red-50' 
                                                                        : isExistingCompany 
                                                                            ? 'border-gray-300 bg-gray-100'
                                                                            : 'border-gray-300'
                                                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                    isExistingCompany ? 'cursor-not-allowed' : ''
                                                                }`}
                                                                onChange={(e) => !isExistingCompany && updateFormData({ companyResponsableName: e.target.value })}
                                                                onBlur={() => setFieldTouched('companyResponsableName')}
                                                                placeholder="Nom et prénom du responsable"
                                                                disabled={isExistingCompany}
                                                                required
                                                            />
                                                            {errors.companyResponsableName && touchedFields.has('companyResponsableName') && (
                                                                <p className="text-red-500 text-sm mt-1">{errors.companyResponsableName}</p>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="email"
                                                                        value={formData.companyEmail || ''}
                                                                        className={`w-full pl-10 pr-4 py-3 border ${
                                                                            errors.companyEmail && touchedFields.has('companyEmail') 
                                                                                ? 'border-red-500 bg-red-50' 
                                                                                : isExistingCompany 
                                                                                    ? 'border-gray-300 bg-gray-100'
                                                                                    : 'border-gray-300'
                                                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                            isExistingCompany ? 'cursor-not-allowed' : ''
                                                                        }`}
                                                                        onChange={(e) => !isExistingCompany && updateFormData({ companyEmail: e.target.value })}
                                                                        onBlur={() => setFieldTouched('companyEmail')}
                                                                        placeholder="email@entreprise.com"
                                                                        disabled={isExistingCompany}
                                                                        required
                                                                    />
                                                                    <Mail className="absolute left-3 top-3 text-gray-400" />
                                                                </div>
                                                                {errors.companyEmail && touchedFields.has('companyEmail') && (
                                                                    <p className="text-red-500 text-sm mt-1">{errors.companyEmail}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="tel"
                                                                        value={formData.companyPhone || ''}
                                                                        className={`w-full pl-10 pr-4 py-3 border ${
                                                                            errors.companyPhone && touchedFields.has('companyPhone') 
                                                                                ? 'border-red-500 bg-red-50' 
                                                                                : isExistingCompany 
                                                                                    ? 'border-gray-300 bg-gray-100'
                                                                                    : 'border-gray-300'
                                                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                                            isExistingCompany ? 'cursor-not-allowed' : ''
                                                                        }`}
                                                                        onChange={(e) => !isExistingCompany && updateFormData({ companyPhone: e.target.value })}
                                                                        onBlur={() => setFieldTouched('companyPhone')}
                                                                        placeholder="0X XX XX XX XX"
                                                                        disabled={isExistingCompany}
                                                                        required
                                                                    />
                                                                    <Phone className="absolute left-3 top-3 text-gray-400" />
                                                                </div>
                                                                {errors.companyPhone && touchedFields.has('companyPhone') && (
                                                                    <p className="text-red-500 text-sm mt-1">{errors.companyPhone}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-6">
                                            <div></div>
                                            <Button
                                                onClick={handleNextStep}
                                                variant="primary"
                                                className="flex items-center"
                                                icon={<ChevronRight className="ml-2" />}
                                            >
                                                Continuer vers les documents
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Étape 2: Documents optionnels */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <FileText className="mr-2 text-blue-900" />
                                            Documents (Optionnel)
                                        </h3>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <p className="text-blue-800 text-sm">
                                                <strong>Ces documents sont optionnels.</strong> Vous pouvez les uploader maintenant ou plus tard depuis votre espace personnel. 
                                                Si vous ne les avez pas maintenant, cliquez sur "Finaliser" pour terminer votre inscription.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {getRequiredDocuments().map((doc) => (
                                                <div key={doc.key} className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        {doc.label}
                                                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => handleFileChange(doc.key as keyof SetupFormData, e.target.files?.[0] || null)}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                        {formData[doc.key as keyof SetupFormData] && (
                                                            <div className="text-green-600 text-sm">
                                                                ✓ Fichier sélectionné
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between pt-6">
                                            <Button
                                                onClick={handlePrevStep}
                                                variant="secondary"
                                                className="flex items-center"
                                                icon={<ChevronLeft className="mr-2" />}
                                            >
                                                Retour
                                            </Button>
                                            <Button
                                                onClick={handleSubmit}
                                                variant="primary"
                                                disabled={isSubmitting}
                                                className="flex items-center"
                                            >
                                                {isSubmitting ? 'Finalisation...' : 'Finaliser mon inscription'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Bouton de finalisation directe depuis l'étape 1 */}
                                {step === 1 && (
                                    <div className="text-center pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            variant="secondary"
                                            disabled={isSubmitting}
                                            className="text-sm"
                                        >
                                            {isSubmitting ? 'Finalisation...' : 'Finaliser sans uploader de documents'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupPasswordPage;