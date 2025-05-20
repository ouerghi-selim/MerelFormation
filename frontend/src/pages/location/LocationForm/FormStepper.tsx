import React from 'react';
import { CheckCircle, User, MapPin, Calendar, CreditCard } from 'lucide-react';

interface FormStepperProps {
    currentStep: number;
    totalSteps: number;
}

const FormStepper: React.FC<FormStepperProps> = ({ currentStep, totalSteps }) => {
    const steps = [
        { name: 'Identité', icon: <User className="h-4 w-4" /> },
        { name: 'Adresse', icon: <MapPin className="h-4 w-4" /> },
        { name: 'Examen', icon: <Calendar className="h-4 w-4" /> },
        { name: 'Paiement', icon: <CreditCard className="h-4 w-4" /> }
    ];

    return (
        <div className="mt-8 pb-4">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            currentStep > index + 1
                                ? 'bg-green-500 border-green-500'
                                : currentStep === index + 1
                                    ? 'bg-blue-700 border-white'
                                    : 'bg-blue-800 border-blue-700'
                        } mb-2`}>
                            {currentStep > index + 1 ? (
                                <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                                <span className="text-white font-bold">{index + 1}</span>
                            )}
                        </div>
                        <span className={`text-sm ${currentStep === index + 1 ? 'text-white font-medium' : 'text-blue-200'}`}>
              {step.name}
            </span>
                    </div>
                ))}
            </div>

            {/* Ligne de progression */}
            <div className="mt-4 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700 rounded-full"></div>
                <div
                    className="absolute top-0 left-0 h-1 bg-white rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};

export default FormStepper;