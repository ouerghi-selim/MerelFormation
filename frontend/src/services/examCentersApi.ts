// services/examCentersApi.ts
import axios from 'axios';
import React from 'react';

const API_BASE_URL = '/admin';

export interface ExamCenter {
    id: number;
    name: string;
    code: string;
    city: string;
    departmentCode: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    formulas?: Formula[];
}

export interface Formula {
    id: number;
    name: string;
    description: string;
    price?: number;
    type: string;
    isActive: boolean;
    additionalInfo?: string;
    createdAt: string;
    updatedAt: string;
    examCenter: ExamCenter;
    fullText: string;
    formattedPrice: string;
}

export interface CreateExamCenterData {
    name: string;
    code: string;
    city: string;
    departmentCode: string;
    address?: string;
    isActive: boolean;
}

export interface UpdateExamCenterData extends Partial<CreateExamCenterData> {}

export interface CreateFormulaData {
    name: string;
    description: string;
    price?: number;
    type: string;
    additionalInfo?: string;
    isActive: boolean;
    examCenterId: number;
}

export interface UpdateFormulaData extends Partial<CreateFormulaData> {}

// Configuration Axios avec token
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
});

// =========================
// EXAM CENTERS API
// =========================
export const examCentersApi = {
    // Récupérer tous les centres d'examen
    getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/exam-centers`, {
            headers: getAuthHeaders(),
            params
        });
        return response.data;
    },

    // Récupérer un centre d'examen par ID
    getById: async (id: number): Promise<ExamCenter> => {
        const response = await axios.get(`${API_BASE_URL}/exam-centers/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Créer un nouveau centre d'examen
    create: async (data: CreateExamCenterData): Promise<ExamCenter> => {
        const response = await axios.post(`${API_BASE_URL}/exam-centers`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Modifier un centre d'examen
    update: async (id: number, data: UpdateExamCenterData): Promise<ExamCenter> => {
        const response = await axios.put(`${API_BASE_URL}/exam-centers/${id}`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Supprimer un centre d'examen
    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/exam-centers/${id}`, {
            headers: getAuthHeaders()
        });
    },

    // Récupérer les centres d'examen actifs
    getActive: async (): Promise<ExamCenter[]> => {
        const response = await axios.get(`${API_BASE_URL}/exam-centers/active`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Récupérer les centres avec leurs formules
    getWithFormulas: async (): Promise<ExamCenter[]> => {
        const response = await axios.get(`${API_BASE_URL}/exam-centers/with-formulas`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Récupérer les statistiques
    getStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/exam-centers/stats`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

// =========================
// FORMULAS API
// =========================
export const formulasApi = {
    // Récupérer toutes les formules
    getAll: async (params?: { search?: string; examCenter?: number; page?: number; limit?: number }) => {
        const response = await axios.get(`${API_BASE_URL}/formulas`, {
            headers: getAuthHeaders(),
            params
        });
        return response.data;
    },

    // Récupérer une formule par ID
    getById: async (id: number): Promise<Formula> => {
        const response = await axios.get(`${API_BASE_URL}/formulas/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Créer une nouvelle formule
    create: async (data: CreateFormulaData): Promise<Formula> => {
        const response = await axios.post(`${API_BASE_URL}/formulas`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Modifier une formule
    update: async (id: number, data: UpdateFormulaData): Promise<Formula> => {
        const response = await axios.put(`${API_BASE_URL}/formulas/${id}`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Supprimer une formule
    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/formulas/${id}`, {
            headers: getAuthHeaders()
        });
    },

    // Récupérer les formules actives
    getActive: async (): Promise<Formula[]> => {
        const response = await axios.get(`${API_BASE_URL}/formulas/active`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Récupérer les formules d'un centre d'examen
    getByCenter: async (centerId: number): Promise<Formula[]> => {
        const response = await axios.get(`${API_BASE_URL}/formulas/by-center/${centerId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Récupérer les formules groupées par centre (pour frontend public)
    getGroupedByCenter: async () => {
        const response = await axios.get(`${API_BASE_URL}/formulas/grouped-by-center`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    // Récupérer les statistiques
    getStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/formulas/stats`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

// =========================
// API PUBLIC POUR FORMULAIRE DE LOCATION
// =========================
export const publicExamCentersApi = {
    // Récupérer les centres actifs avec leurs formules (sans auth)
    getActiveCentersWithFormulas: async (): Promise<ExamCenter[]> => {
        const response = await axios.get('/api/exam-centers/with-formulas');
        return response.data;
    },

    // Récupérer les formules groupées par centre (sans auth)
    getFormulasGroupedByCenter: async () => {
        const response = await axios.get('/api/formulas/grouped-by-center');
        return response.data;
    }
};

// =========================
// HOOKS PERSONNALISÉS
// =========================
export const useExamCenters = () => {
    const [centers, setCenters] = React.useState<ExamCenter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchCenters = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await examCentersApi.getAll();
            setCenters(data.data || []);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des centres');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCenters();
    }, []);

    return { centers, loading, error, refetch: fetchCenters };
};

export const useFormulas = (examCenterId?: number) => {
    const [formulas, setFormulas] = React.useState<Formula[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchFormulas = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = examCenterId 
                ? await formulasApi.getByCenter(examCenterId)
                : await formulasApi.getAll();
            setFormulas(Array.isArray(data) ? data : data.data || []);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des formules');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchFormulas();
    }, [examCenterId]);

    return { formulas, loading, error, refetch: fetchFormulas };
};

// Hook pour l'API publique (formulaire de location)
export const usePublicExamCenters = () => {
    const [centersWithFormulas, setCentersWithFormulas] = React.useState<ExamCenter[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await publicExamCentersApi.getActiveCentersWithFormulas();
            setCentersWithFormulas(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    return { centersWithFormulas, loading, error, refetch: fetchData };
};