import React from 'react';
import { Calendar, Building, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocationForm } from './LocationFormContext';
import Button from '../../../components/common/Button';

interface StepExamProps {
    onNext: () => void;
    onPrev: () => void;
}

const StepExam: React.FC<StepExamProps> = ({ onNext, onPrev }) => {
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
        ['examCenter', 'formula', 'examDate', 'examTime'].forEach(
            field => setFieldTouched(field as keyof typeof formData)
        );

        // Vérifier la validité avant de passer à l'étape suivante
        if (isStepValid(3)) {
            onNext();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white-800 mb-6 flex items-center">
                <Calendar className="mr-2 text-blue-900" />
                Informations d'examen
            </h3>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Centre d'examen</label>
                <div className="relative">
                    <select
                        value={formData.examCenter}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.examCenter && isFieldTouched('examCenter') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                        onChange={(e) => updateFormData({ examCenter: e.target.value })}
                        onBlur={() => setFieldTouched('examCenter')}
                        required
                    >
                        <option value="">Sélectionnez un centre</option>
                        <option value="35 Rennes (Bruz)">35 Rennes (Bruz)</option>
                        <option value="22 Saint Brieuc">22 Saint Brieuc</option>
                        <option value="56 Vannes">56 Vannes</option>
                        <option value="44 Nantes">44 Nantes</option>
                    </select>
                    <Building className="absolute left-3 top-3 text-gray-400" />
                    <ChevronRight className="absolute right-3 top-3 text-gray-400" />
                </div>
                {errors.examCenter && isFieldTouched('examCenter') && (
                    <p className="text-red-500 text-sm mt-1">{errors.examCenter}</p>
                )}
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700">Type de formule</label>
                <div className="space-y-4">
                    {formData.examCenter === "35 Rennes (Bruz)" ? (
                        <>
                            <label
                                className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="formula"
                                    value="Centre examen Rennes: Formule simple: ( 120€ TTC) Location Véhicule Taxi-Ecole"
                                    className="mt-1 mr-3"
                                    checked={formData.formula === "Centre examen Rennes: Formule simple: ( 120€ TTC) Location Véhicule Taxi-Ecole"}
                                    onChange={(e) => updateFormData({ formula: e.target.value })}
                                    onBlur={() => setFieldTouched('formula')}
                                />
                                <div>
                                    <span className="font-medium text-gray-600 block">Centre examen Rennes: Formule simple (120€ TTC)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole</span>
                                </div>
                            </label>
                            <label
                                className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="formula"
                                    value="Centre examen Rennes: Formule intégrale: (240 € TTC) Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel de Prise en main du véhicule, Conduite"
                                    className="mt-1 mr-3"
                                    checked={formData.formula === "Centre examen Rennes: Formule intégrale: (240 € TTC) Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel de Prise en main du véhicule, Conduite"}
                                    onChange={(e) => updateFormData({ formula: e.target.value })}
                                    onBlur={() => setFieldTouched('formula')}
                                />
                                <div>
                                    <span className="font-medium text-gray-600 block">Centre examen Rennes: Formule intégrale (240€ TTC)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel de Prise en main du véhicule, Conduite</span>
                                </div>
                            </label>
                        </>
                    ) : (
                        <>
                            <label
                                className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="formula"
                                    value="Centre examen Autres: Formule simple: (nous consulter) Location Véhicule Taxi-Ecole"
                                    className="mt-1 mr-3"
                                    checked={formData.formula === "Centre examen Autres: Formule simple: (nous consulter) Location Véhicule Taxi-Ecole"}
                                    onChange={(e) => updateFormData({ formula: e.target.value })}
                                    onBlur={() => setFieldTouched('formula')}
                                />
                                <div>
                                    <span className="font-medium text-gray-600 block">Centre examen Autres: Formule simple (nous consulter)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole</span>
                                </div>
                            </label>
                            <label
                                className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="formula"
                                    value="Centre examen autres: Formule intégrale: (nous consulter) Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel Prise en main du véhicule, Conduite"
                                    className="mt-1 mr-3"
                                    checked={formData.formula === "Centre examen autres: Formule intégrale: (nous consulter) Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel Prise en main du véhicule, Conduite"}
                                    onChange={(e) => updateFormData({ formula: e.target.value })}
                                    onBlur={() => setFieldTouched('formula')}
                                />
                                <div>
                                    <span className="font-medium text-gray-600 block">Centre examen autres: Formule intégrale (nous consulter)</span>
                                    <span className="text-sm text-gray-600">Location Véhicule Taxi-Ecole pour votre passage + 1H30 En individuel Prise en main du véhicule, Conduite</span>
                                </div>
                            </label>
                        </>
                    )}
                </div>
                {errors.formula && isFieldTouched('formula') && (
                    <p className="text-red-500 text-sm mt-1">{errors.formula}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-white-700">Date et Heure de la convocation par la CMA</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.examDate}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.examDate && isFieldTouched('examDate') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ examDate: e.target.value })}
                            onBlur={() => setFieldTouched('examDate')}
                            required
                        />
                        <Calendar className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <div className="relative">
                        <input
                            type="time"
                            value={formData.examTime}
                            className={`w-full pl-10 pr-4 py-3 border ${errors.examTime && isFieldTouched('examTime') ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            onChange={(e) => updateFormData({ examTime: e.target.value })}
                            onBlur={() => setFieldTouched('examTime')}
                            required
                        />
                        <Clock className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>
                {errors.examDate && isFieldTouched('examDate') && (
                    <p className="text-red-500 text-sm mt-1">{errors.examDate}</p>
                )}
                {errors.examTime && isFieldTouched('examTime') && (
                    <p className="text-red-500 text-sm mt-1">{errors.examTime}</p>
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

export default StepExam;