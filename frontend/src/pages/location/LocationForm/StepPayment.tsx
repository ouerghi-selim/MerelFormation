import React from 'react';
import { CreditCard, FileText, ChevronLeft } from 'lucide-react';
import { useLocationForm } from './LocationFormContext';
import Button from '../../../components/common/Button';

interface StepPaymentProps {
    onSubmit: (formData: any) => void;
    onPrev: () => void;
    isSubmitting: boolean;
}

const StepPayment: React.FC<StepPaymentProps> = ({ onSubmit, onPrev, isSubmitting }) => {
    const {
        formData,
        updateFormData,
        errors,
        isFieldTouched,
        setFieldTouched,
        isStepValid
    } = useLocationForm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Marquer tous les champs comme touchés pour afficher les erreurs
        ['financing', 'paymentMethod', 'driverLicenseFront', 'driverLicenseBack'].forEach(
            field => setFieldTouched(field as keyof typeof formData)
        );

        // Vérifier la validité avant de soumettre
        if (isStepValid(4)) {
            onSubmit(formData);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white-800 mb-6 flex items-center">
                <CreditCard className="mr-2 text-blue-900" />
                Paiement et documents
            </h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Financement</label>
                <div className="relative">
                    <select
                        value={formData.financing}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.financing && isFieldTouched('financing') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                        onChange={(e) => updateFormData({ financing: e.target.value })}
                        onBlur={() => setFieldTouched('financing')}
                        required
                    >
                        <option value="">Sélectionnez une option</option>
                        <option value="Personnel">Personnel</option>
                    </select>
                    <CreditCard className="absolute left-3 top-3 text-gray-400" />
                    <ChevronLeft className="absolute right-3 top-3 text-gray-400" />
                </div>
                {errors.financing && isFieldTouched('financing') && (
                    <p className="text-red-500 text-sm mt-1">{errors.financing}</p>
                )}
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-white-700">Modalités de paiement</label>

                <div className="space-y-4">
                    <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="Virement bancaire IBAN: FR76 13606 00087 46302523169 63 BIC AGRIFRPP 836"
                            className="mt-1 mr-3"
                            checked={formData.paymentMethod === "Virement bancaire IBAN: FR76 13606 00087 46302523169 63 BIC AGRIFRPP 836"}
                            onChange={(e) => updateFormData({ paymentMethod: e.target.value })}
                            onBlur={() => setFieldTouched('paymentMethod')}
                        />
                        <div>
                            <span className="font-medium text-gray-600 block">Virement bancaire</span>
                            <span className="text-sm text-gray-600">IBAN: FR76 13606 00087 46302523169 63 BIC AGRIFRPP 836</span>
                        </div>
                    </label>

                    <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="Carte bancaire (lien de paiement par sms)"
                            className="mt-1 mr-3"
                            checked={formData.paymentMethod === "Carte bancaire (lien de paiement par sms)"}
                            onChange={(e) => updateFormData({ paymentMethod: e.target.value })}
                            onBlur={() => setFieldTouched('paymentMethod')}
                        />
                        <div>
                            <span className="font-medium text-gray-600 block">Carte bancaire</span>
                            <span className="text-sm text-gray-600">Lien de paiement par SMS</span>
                        </div>
                    </label>
                </div>
                {errors.paymentMethod && isFieldTouched('paymentMethod') && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                )}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Permis de conduire recto</label>
                    <div
                        className={`relative border-2 border-dashed ${formData.driverLicenseFront ? 'border-green-500 bg-green-50' : errors.driverLicenseFront && isFieldTouched('driverLicenseFront') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer`}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (file && file.size > 10 * 1024 * 1024) {
                                    alert("Le fichier est trop volumineux. La taille maximale est de 10 MB.");
                                    return;
                                }
                                updateFormData({ driverLicenseFront: file });
                            }}
                            onBlur={() => setFieldTouched('driverLicenseFront')}
                        />
                        <FileText
                            className={`mx-auto h-8 w-8 ${formData.driverLicenseFront ? 'text-green-500' : 'text-gray-400'}`}
                        />
                        {formData.driverLicenseFront ? (
                            <>
                                <p className="mt-2 text-sm text-green-600 font-medium">Fichier sélectionné:</p>
                                <p className="text-sm text-green-600">{formData.driverLicenseFront.name}</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-2 text-sm text-white-600">Cliquez pour sélectionner un fichier ou
                                    glissez-déposez</p>
                                <p className="text-xs text-white-500">PDF ou image (10 MB max)</p>
                            </>
                        )}
                    </div>
                    {errors.driverLicenseFront && isFieldTouched('driverLicenseFront') && (
                        <p className="text-red-500 text-sm mt-1">{errors.driverLicenseFront}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white-700">Permis de conduire verso</label>
                    <div
                        className={`relative border-2 border-dashed ${formData.driverLicenseBack ? 'border-green-500 bg-green-50' : errors.driverLicenseBack && isFieldTouched('driverLicenseBack') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer`}
                    >
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (file && file.size > 10 * 1024 * 1024) {
                                    alert("Le fichier est trop volumineux. La taille maximale est de 10 MB.");
                                    return;
                                }
                                updateFormData({ driverLicenseBack: file });
                            }}
                            onBlur={() => setFieldTouched('driverLicenseBack')}
                        />
                        <FileText
                            className={`mx-auto h-8 w-8 ${formData.driverLicenseBack ? 'text-green-500' : 'text-gray-400'}`}
                        />
                        {formData.driverLicenseBack ? (
                            <>
                                <p className="mt-2 text-sm text-green-600 font-medium">Fichier sélectionné:</p>
                                <p className="text-sm text-green-600">{formData.driverLicenseBack.name}</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-2 text-sm text-white-600">Cliquez pour sélectionner un fichier ou
                                    glissez-déposez</p>
                                <p className="text-xs text-white-500">PDF ou image (10 MB max)</p>
                            </>
                        )}
                    </div>
                    {errors.driverLicenseBack && isFieldTouched('driverLicenseBack') && (
                        <p className="text-red-500 text-sm mt-1">{errors.driverLicenseBack}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Observations</label>
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    value={formData.observations}
                    onChange={(e) => updateFormData({ observations: e.target.value })}
                    placeholder="Ajoutez vos commentaires ou questions ici..."
                ></textarea>
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
                    onClick={handleSubmit}
                    variant="primary"
                    className="flex items-center justify-center"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                >
                    Envoyer
                </Button>
            </div>
        </div>
    );
};

export default StepPayment;