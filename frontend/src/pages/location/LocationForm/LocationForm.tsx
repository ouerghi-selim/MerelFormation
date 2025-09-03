import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LocationFormProvider } from './LocationFormContext';
import FormStepper from './FormStepper';
import StepPersonalInfo from './StepPersonalInfo';
import StepAddress from './StepAddress';
import StepExam from './StepExam';
import StepPayment from './StepPayment';
import Alert from '../../../components/common/Alert';
import { vehicleRentalsApi } from "@/services/api.ts";

interface LocationFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNextStep = () => {
        setStep(prev => prev + 1);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    };

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const formDataToSend = new FormData();

            // Convertir les dates pour l'API
            const examDateObj = formData.examDate ? new Date(formData.examDate) : null;
            const birthDateObj = formData.birthDate ? new Date(formData.birthDate) : null;

            // Informations de base
            formDataToSend.append('rentalType', 'exam');
            formDataToSend.append('status', 'submitted');
            formDataToSend.append('notes', formData.observations || '');

            // Dates d'examen
            if (examDateObj) {
                formDataToSend.append('startDate', examDateObj.toISOString());
                formDataToSend.append('endDate', examDateObj.toISOString());
            }

            // Lieux
            formDataToSend.append('pickupLocation', formData.examCenter);
            formDataToSend.append('returnLocation', formData.examCenter);

            // Infos personnelles
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            if (birthDateObj) {
                formDataToSend.append('birthDate', birthDateObj.toISOString().split('T')[0]);
            }
            formDataToSend.append('birthPlace', formData.birthPlace);

            // Adresse
            formDataToSend.append('address', formData.address);
            formDataToSend.append('postalCode', formData.postalCode);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('facturation', formData.facturation);

            // Examen
            formDataToSend.append('examCenter', formData.examCenter);
            formDataToSend.append('formula', formData.formula);
            formDataToSend.append('examTime', formData.examTime);

            // Entreprise (optionnel)
            if (formData.isLinkedToCompany && formData.companyId) {
                formDataToSend.append('companyId', formData.companyId.toString());
            }

            // Paiement
            formDataToSend.append('financing', formData.financing);
            formDataToSend.append('paymentMethod', formData.paymentMethod);

            // Fichiers
            if (formData.driverLicenseFront) {
                formDataToSend.append('driverLicenseFront', formData.driverLicenseFront);
            }
            if (formData.driverLicenseBack) {
                formDataToSend.append('driverLicenseBack', formData.driverLicenseBack);
            }

            // Envoyer à l'API
            await vehicleRentalsApi.create(formDataToSend);

            // Succès
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
                setStep(1);
            }, 3000);
        } catch (err: any) {
            console.error('Erreur lors de l\'envoi de la réservation:', err);
            setErrorMessage(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div id="modal-content" className="bg-white rounded-xl shadow-2xl max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>

                <div className="bg-blue-900 text-white px-6 py-8 rounded-t-xl">
                    <h2 className="text-2xl font-bold text-center">Réservation de véhicule pour examen</h2>
                    <p className="text-center text-blue-100 mt-2">Remplissez ce formulaire pour réserver votre véhicule</p>

                    <LocationFormProvider>
                        {/* Indicateur de progression */}
                        <FormStepper currentStep={step} totalSteps={4} />

                        <div className="p-8">
                            {showSuccess && (
                                <Alert
                                    type="success"
                                    message="Votre demande de réservation a été envoyée. Nous vous contacterons avec un devis personnalisé."
                                    onClose={() => setShowSuccess(false)}
                                />
                            )}

                            {errorMessage && (
                                <Alert
                                    type="error"
                                    message={errorMessage}
                                    onClose={() => setErrorMessage(null)}
                                />
                            )}

                            {!showSuccess && (
                                <>
                                    {step === 1 && <StepPersonalInfo onNext={handleNextStep} />}
                                    {step === 2 && <StepAddress onNext={handleNextStep} onPrev={handlePrevStep} />}
                                    {step === 3 && <StepExam onNext={handleNextStep} onPrev={handlePrevStep} />}
                                    {step === 4 && <StepPayment onSubmit={handleSubmit} onPrev={handlePrevStep} isSubmitting={isSubmitting} />}
                                </>
                            )}
                        </div>
                    </LocationFormProvider>
                </div>
            </div>
        </div>
    );
};

export default LocationForm;