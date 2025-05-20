export interface ValidationRule {
    validate: (value: any) => boolean;
    errorMessage: string;
}

export const required: ValidationRule = {
    validate: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
    },
    errorMessage: 'Ce champ est obligatoire'
};

export const email: ValidationRule = {
    validate: (value) => {
        if (!value) return false;
        if (typeof value !== 'string') return false;
        // Validation basique d'email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    errorMessage: 'Format d\'email invalide'
};

export const phone: ValidationRule = {
    validate: (value) => {
        if (!value) return false;
        if (typeof value !== 'string') return false;
        // Format français: 10 chiffres pouvant commencer par 0 ou +33
        return /^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/.test(value.replace(/\s/g, ''));
    },
    errorMessage: 'Numéro de téléphone invalide (format français attendu)'
};

export const postalCode: ValidationRule = {
    validate: (value) => {
        if (!value) return false;
        if (typeof value !== 'string') return false;
        // Code postal français: 5 chiffres
        return /^\d{5}$/.test(value);
    },
    errorMessage: 'Code postal invalide (5 chiffres)'
};

export const dateNotInPast: ValidationRule = {
    validate: (value) => {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(value);
        return date >= today;
    },
    errorMessage: 'La date ne peut pas être dans le passé'
};

export const maxFileSize = (maxSize: number): ValidationRule => ({
    validate: (file) => {
        if (!file || !(file instanceof File)) return true;
        return file.size <= maxSize;
    },
    errorMessage: `La taille du fichier ne doit pas dépasser ${Math.round(maxSize / (1024 * 1024))} MB`
});

export const allowedFileTypes = (types: string[]): ValidationRule => ({
    validate: (file) => {
        if (!file || !(file instanceof File)) return true;
        return types.includes(file.type);
    },
    errorMessage: `Type de fichier non supporté. Types acceptés: ${types.join(', ')}`
});

// Fonction d'aide pour valider une valeur avec plusieurs règles
export const validateValue = (value: any, rules: ValidationRule[]): string => {
    for (const rule of rules) {
        if (!rule.validate(value)) {
            return rule.errorMessage;
        }
    }
    return '';
};