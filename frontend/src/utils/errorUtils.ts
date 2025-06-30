/**
 * Utilitaires pour la gestion des erreurs API
 */

/**
 * Extrait le message d'erreur de la réponse API
 * @param error - L'erreur capturée
 * @param defaultMessage - Message par défaut si aucun message spécifique n'est trouvé
 * @returns Le message d'erreur à afficher
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'Une erreur est survenue'): string => {
    // Essayer d'extraire le message de l'erreur dans l'ordre de priorité :
    // 1. Message de l'API dans response.data.message
    // 2. Message de l'API dans response.data.error
    // 3. Message d'erreur JavaScript natif
    // 4. Message par défaut
    
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error?.response?.data?.error) {
        return error.response.data.error;
    }
    
    if (error?.message) {
        return error.message;
    }
    
    return defaultMessage;
};

/**
 * Extrait les erreurs de validation spécifiques aux champs
 * @param error - L'erreur capturée
 * @returns Objet avec les erreurs par champ ou null
 */
export const getValidationErrors = (error: any): Record<string, string> | null => {
    if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
        return error.response.data.errors;
    }
    
    return null;
};

/**
 * Détermine le type d'erreur pour le toast
 * @param error - L'erreur capturée
 * @returns Type de toast approprié
 */
export const getErrorType = (error: any): 'error' | 'warning' => {
    // Erreurs de validation = warning
    if (error?.response?.status === 400) {
        return 'warning';
    }
    
    // Autres erreurs = error
    return 'error';
};

/**
 * Gère une erreur de manière complète (message + validation)
 * @param error - L'erreur capturée
 * @param defaultMessage - Message par défaut
 * @param setFormErrors - Fonction pour définir les erreurs de formulaire (optionnel)
 * @returns Objet avec le message d'erreur et le type
 */
export const handleApiError = (
    error: any, 
    defaultMessage: string,
    setFormErrors?: (errors: Record<string, string>) => void
) => {
    const message = getErrorMessage(error, defaultMessage);
    const type = getErrorType(error);
    const validationErrors = getValidationErrors(error);
    
    // Définir les erreurs de validation si une fonction est fournie
    if (setFormErrors && validationErrors) {
        setFormErrors(validationErrors);
    } else if (setFormErrors) {
        setFormErrors({});
    }
    
    return { message, type };
};