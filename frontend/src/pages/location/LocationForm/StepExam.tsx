import React, { useState, useEffect } from 'react';
import { Calendar, Building, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useLocationForm } from './LocationFormContext';
import Button from '../../../components/common/Button';

interface ExamCenter {
    id: number;
    name: string;
    code: string;
    city: string;
    isActive: boolean;
    formulas: Formula[];
}

interface Formula {
    id: number;
    name: string;
    description: string;
    price?: number;
    type: string;
    isActive: boolean;
    additionalInfo?: string;
    fullText: string;
    formattedPrice: string;
}

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

    const [examCenters, setExamCenters] = useState<ExamCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null);

    useEffect(() => {
        fetchExamCentersWithFormulas();
    }, []);

    useEffect(() => {
        // Mettre à jour le centre sélectionné quand formData.examCenter change
        if (formData.examCenter && examCenters.length > 0) {
            const center = examCenters.find(c => c.name === formData.examCenter);
            setSelectedCenter(center || null);
        }
    }, [formData.examCenter, examCenters]);

    const fetchExamCentersWithFormulas = async () => {
        try {
            setLoading(true);
            setError(null);

            // Appel API public pour récupérer les centres avec leurs formules
            const response = await fetch('/api/exam-centers/with-formulas');

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des centres d\'examen');
            }

            const data = await response.json();
            setExamCenters(data);
        } catch (err: any) {
            console.error('Erreur lors du chargement des centres d\'examen:', err);
            setError('Impossible de charger les centres d\'examen. Veuillez réessayer.');

        } finally {
            setLoading(false);
        }
    };

    const handleCenterChange = (centerName: string) => {
        updateFormData({ examCenter: centerName });

        // Réinitialiser la formule sélectionnée quand on change de centre
        updateFormData({ formula: '' });

        const center = examCenters.find(c => c.name === centerName);
        setSelectedCenter(center || null);
    };

    const getAvailableFormulas = (): Formula[] => {
        if (!selectedCenter) return [];
        return selectedCenter.formulas.filter(f => f.isActive);
    };

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

    if (error) {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white-800 mb-6 flex items-center">
                    <Calendar className="mr-2 text-blue-900" />
                    Informations d'examen
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Erreur de chargement</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchExamCentersWithFormulas}
                            className="text-red-700 text-sm underline mt-2 hover:text-red-900"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        onChange={(e) => handleCenterChange(e.target.value)}
                        onBlur={() => setFieldTouched('examCenter')}
                        required
                    >
                        <option value="">Sélectionnez un centre</option>
                        {examCenters.map((center) => (
                            <option key={center.id} value={center.name}>
                                {center.name}
                            </option>
                        ))}
                    </select>
                    <Building className="absolute left-3 top-3 text-gray-400" />
                    <ChevronRight className="absolute right-3 top-3 text-gray-400" />
                </div>
                {errors.examCenter && isFieldTouched('examCenter') && (
                    <p className="text-red-500 text-sm mt-1">{errors.examCenter}</p>
                )}
            </div>

            {selectedCenter && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Type de formule</label>
                    <div className="space-y-4">
                        {getAvailableFormulas().length > 0 ? (
                            getAvailableFormulas().map((formula) => (
                                <label
                                    key={formula.id}
                                    className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="formula"
                                        value={formula.fullText}
                                        className="mt-1 mr-3"
                                        checked={formData.formula === formula.fullText}
                                        onChange={(e) => updateFormData({ formula: e.target.value })}
                                        onBlur={() => setFieldTouched('formula')}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-600 block">
                                                    {selectedCenter.name}: {formula.name}
                                                    {formula.price ? ` (${formula.formattedPrice})` : ' (nous consulter)'}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {formula.description}
                                                </span>
                                                {formula.additionalInfo && (
                                                    <span className="text-sm text-gray-500 block mt-1">
                                                        {formula.additionalInfo}
                                                    </span>
                                                )}
                                            </div>
                                            {formula.price && (
                                                <div className="text-right ml-4">
                                                    <span className="text-lg font-bold text-green-600">
                                                        {formula.formattedPrice}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <p>Aucune formule disponible pour ce centre d'examen.</p>
                                <p className="text-sm">Veuillez nous contacter pour plus d'informations.</p>
                            </div>
                        )}
                    </div>
                    {errors.formula && isFieldTouched('formula') && (
                        <p className="text-red-500 text-sm mt-1">{errors.formula}</p>
                    )}
                </div>
            )}

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
                            min={new Date().toISOString().split('T')[0]} // Date minimale = aujourd'hui
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

            {/* Informations supplémentaires */}
            {selectedCenter && getAvailableFormulas().length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Informations importantes</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Le véhicule sera disponible 30 minutes avant votre heure de convocation</li>
                        <li>• Merci d'apporter vos documents d'identité et permis de conduire</li>
                        <li>• En cas d'empêchement, prévenez-nous au minimum 48h à l'avance</li>
                        {selectedCenter.name === '35 Rennes (Bruz)' && (
                            <li>• Centre situé à Bruz - Prévoyez le temps de trajet</li>
                        )}
                    </ul>
                </div>
            )}

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