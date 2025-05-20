import React from 'react';
import { MapPin, Building, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocationForm } from './LocationFormContext';
import Button from '../../../components/common/Button';

interface StepAddressProps {
    onNext: () => void;
    onPrev: () => void;
}

const StepAddress: React.FC<StepAddressProps> = ({ onNext, onPrev }) => {
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
        ['address', 'postalCode', 'city', 'facturation'].forEach(
            field => setFieldTouched(field as keyof typeof formData)
        );

        // Vérifier la validité avant de passer à l'étape suivante
        if (isStepValid(2)) {
            onNext();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white-800 mb-6 flex items-center">
                <MapPin className="mr-2 text-blue-900" />
                Votre adresse
            </h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Adresse postale</label>
                <div className="relative">
                    <input
                        type="text"
                        value={formData.address}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.address && isFieldTouched('address') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        onChange={(e) => updateFormData({ address: e.target.value })}
                        onBlur={() => setFieldTouched('address')}
                        required
                    />
                    <MapPin className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.address && isFieldTouched('address') && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Code postal</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.postalCode}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.postalCode && isFieldTouched('postalCode') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ postalCode: e.target.value })}
                            onBlur={() => setFieldTouched('postalCode')}
                            required
                        />
                        <MapPin className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {errors.postalCode && isFieldTouched('postalCode') && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Ville</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.city}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.city && isFieldTouched('city') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ city: e.target.value })}
                            onBlur={() => setFieldTouched('city')}
                            required
                        />
                        <Building className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {errors.city && isFieldTouched('city') && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Facturation à</label>
                <div className="relative">
                    <input
                        type="text"
                        value={formData.facturation}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.facturation && isFieldTouched('facturation') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        onChange={(e) => updateFormData({ facturation: e.target.value })}
                        onBlur={() => setFieldTouched('facturation')}
                        required
                    />
                    <FileText className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.facturation && isFieldTouched('facturation') && (
                    <p className="text-red-500 text-sm mt-1">{errors.facturation}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
                <Button
                    onClick={onPrev}
                    variant="secondary"
                    className="flex items-center justify-center"
                    icon={<ChevronLeft className="mr-2" />}
                >
                    Retour
                </Button>
                <Button
                    onClick={handleNext}
                    variant="primary"
                    className="flex items-center justify-center"
                    icon={<ChevronRight className="ml-2" />}
                >
                    Continuer
                </Button>
            </div>
        </div>
    );
};

export default StepAddress;