// StepPersonalInfo.tsx
import React from 'react';
import { User, Calendar, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { useLocationForm } from './LocationFormContext';
import Button from '../../../components/common/Button';

interface StepPersonalInfoProps {
    onNext: () => void;
}

const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({ onNext }) => {
    const {
        formData,
        updateFormData,
        errors,
        isFieldTouched,
        setFieldTouched,
        isStepValid
    } = useLocationForm();

    const handleNext = () => {
        // Marquer tous les champs comme touchés pour afficher les erreurs
        ['name', 'firstName', 'birthDate', 'birthPlace', 'phone', 'email'].forEach(
            field => setFieldTouched(field as keyof typeof formData)
        );

        // Vérifier la validité avant de passer à l'étape suivante
        if (isStepValid(1)) {
            onNext();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white-800 mb-6 flex items-center">
                <User className="mr-2 text-blue-900" />
                Vos informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Nom</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.name}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.name && isFieldTouched('name') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ name: e.target.value })}
                            onBlur={() => setFieldTouched('name')}
                            required
                        />
                        <User className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {errors.name && isFieldTouched('name') && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Prénom</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.firstName}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.firstName && isFieldTouched('firstName') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ firstName: e.target.value })}
                            onBlur={() => setFieldTouched('firstName')}
                            required
                        />
                        <User className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {errors.firstName && isFieldTouched('firstName') && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Date de naissance</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.birthDate}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.birthDate && isFieldTouched('birthDate') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ birthDate: e.target.value })}
                            onBlur={() => setFieldTouched('birthDate')}
                            required
                        />
                        <Calendar className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {errors.birthDate && isFieldTouched('birthDate') && (
                        <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Lieu de naissance</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.birthPlace}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.birthPlace && isFieldTouched('birthPlace') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ birthPlace: e.target.value })}
                            onBlur={() => setFieldTouched('birthPlace')}
                            required
                        />
                        <MapPin className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {errors.birthPlace && isFieldTouched('birthPlace') && (
                        <p className="text-red-500 text-sm mt-1">{errors.birthPlace}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Téléphone</label>
                <div className="relative">
                    <input
                        type="tel"
                        value={formData.phone}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.phone && isFieldTouched('phone') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        onBlur={() => setFieldTouched('phone')}
                        required
                    />
                    <Phone className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.phone && isFieldTouched('phone') && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Adresse email</label>
                <div className="relative">
                    <input
                        type="email"
                        value={formData.email}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.email && isFieldTouched('email') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        onBlur={() => setFieldTouched('email')}
                        required
                    />
                    <Mail className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.email && isFieldTouched('email') && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
            </div>

            <div className="pt-6">
                <Button
                    onClick={handleNext}
                    variant="primary"
                    className="w-full flex items-center justify-center"
                    icon={<ChevronRight className="ml-2" />}
                >
                    Continuer
                </Button>
            </div>
        </div>
    );
};

export default StepPersonalInfo;