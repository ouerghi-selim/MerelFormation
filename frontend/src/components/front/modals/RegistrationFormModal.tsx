import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { sessionRegistrationApi } from '../../../services/api';
import Alert from '../../../components/common/Alert';

interface RegistrationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number | null;
}

const RegistrationFormModal: React.FC<RegistrationFormModalProps> = ({
         isOpen,
         onClose,
         sessionId
     }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        sessionId: sessionId
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(prevData => ({
            ...prevData,
            sessionId: sessionId
        }));
    }, [sessionId]);


    const handleRegistrationSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Vérifier que le sessionId n'est pas null avant d'envoyer
        if (!formData.sessionId) {
            alert("Erreur: Aucune session sélectionnée");
            return;
        }
        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            await sessionRegistrationApi.register(formData);
            setShowSuccess(true);

            // Fermer le modal automatiquement après 3 secondes
            setTimeout(() => {
                onClose();
            }, 3000);
        }  catch (error: any) {
            setErrorMessage(error.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
             onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-blue-900">Inscription à la formation</h3>
                    <button className="text-gray-500 hover:text-gray-700 p-1" onClick={onClose}>
                        <X className="h-6 w-6"/>
                    </button>
                </div>
                {showSuccess && (
                    <Alert
                        type="success"
                        message="Inscription réussie ! Vous recevrez un email de confirmation dans quelques instants."
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
                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1" htmlFor="name">Nom et prénom</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Votre nom complet"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Adresse email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="votre.email@exemple.com"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="mr-2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }}></div>
                                    Traitement en cours...
                                </>
                            ) : (
                                "Confirmer l'inscription"
                            )}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default RegistrationFormModal;