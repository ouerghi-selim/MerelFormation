import axios from 'axios';

// Configuration de l'API
const baseURL = import.meta.env.VITE_API_URL || '/api';

// Configuration pour les fichiers statiques (images, documents, etc.)
export const mediaBaseURL = import.meta.env.VITE_MEDIA_URL || '';

// Log de configuration (uniquement en mode développement)
if (import.meta.env.DEV) {
    console.log('🌍 API Configuration:', {
        environment: import.meta.env.MODE,
        baseURL,
        mediaBaseURL
    });
}

// Créer une instance axios avec la configuration de base
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Gérer les erreurs 401 (non authentifié)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const sessionRegistrationApi = {
    register: (registrationData: { firstName: string; lastName: string; email: string; sessionId: number | null }) =>
        api.post('/registration', registrationData),
};

// Services API pour le dashboard administrateur
export const adminDashboardApi = {
    getStats: () => api.get('/admin/dashboard/stats'),
    getRecentInscriptions: () => api.get('/admin/dashboard/recent-inscriptions'),
    getRevenueData: () => api.get('/admin/dashboard/revenue-data'),
    getSuccessRateData: () => api.get('/admin/dashboard/success-rate-data'),
};

// Services API pour les formations administrateur
export const adminFormationsApi = {
    getAll: () => api.get('/admin/formations'),
    getById: (id: number) => api.get(`/admin/formations/${id}`),
    create: (data: any) => api.post('/admin/formations', data),
    update: (id: number, data: any) => api.put(`/admin/formations/${id}`, data),
    delete: (id: number) => api.delete(`/admin/formations/${id}`),
    getSessions: () => api.get('/admin/formations/sessions'),
    // Méthodes documents (ancienne API - à remplacer par le système temporaire)
    uploadDocument: (formationId: number, formData: FormData) =>
        api.post(`/admin/formations/${formationId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    deleteDocument: (formationId: number, documentId: number) =>
        api.delete(`/admin/formations/${formationId}/documents/${documentId}`),
    // Méthodes pour la partie pratique
    createPracticalInfo: (formationId: number, data: any) => {
        const payload = { ...data, formation: formationId };
        return api.post('/admin/practical-infos', payload);
    },
    updatePracticalInfo: (practicalInfoId: number, data: any) => api.put(`/admin/practical-infos/${practicalInfoId}`, data),
    deletePracticalInfo: (practicalInfoId: number) => api.delete(`/admin/practical-infos/${practicalInfoId}`),
    getInstructors: () => api.get('/admin/users?role=ROLE_INSTRUCTOR&status=active'),
};

// Services API pour les réservations administrateur
export const adminReservationsApi = {
    getAll: (queryParams = '') => api.get(`/admin/reservations${queryParams ? '?' + queryParams : ''}`),
    getById: (id: number) => api.get(`/admin/reservations/${id}`),
    updateStatus: (id: number, status: string, customMessage?: string) => api.put(`/admin/reservations/${id}/status`, { status, customMessage }),
    assignVehicle: (id: number, vehicleModel: string) => api.put(`/admin/reservations/${id}/assign-vehicle`, { vehicleModel }),
    getAvailableVehicles: (date: string) => api.get(`/admin/vehicles/available?date=${date}`),
    delete: (id: number) => api.delete(`/admin/reservations/${id}`), // ✅ Ajout suppression véhicule
    getSessionReservations: (queryParams = '') => api.get(`/admin/session-reservations${queryParams ? '?' + queryParams : ''}`),
    updateSessionReservationStatus: (id: number, status: string, customMessage?: string) => api.put(`/admin/session-reservations/${id}/status`, { status, customMessage }),
    getSessionReservationById: (id: number) => api.get(`/admin/session-reservations/${id}`),
    deleteSessionReservation: (id: number) => api.delete(`/admin/session-reservations/${id}`),
    // Nouveaux endpoints pour les statuts unifiés
    getReservationStatuses: () => api.get('/admin/reservation-statuses'),
    getReservationTransitions: () => api.get('/admin/reservation-transitions'),
    getVehicleRentalStatuses: () => api.get('/admin/vehicle-rental-statuses'),
    getVehicleRentalTransitions: () => api.get('/admin/vehicle-rental-transitions'),
};

// Services API pour le dashboard étudiant
export const studentDashboardApi = {
    getIndex: () => api.get('/student/dashboard'),
    getProfile: () => api.get('/student/profile'),
};

// Services API pour les formations étudiant
export const studentFormationsApi = {
    getAll: () => api.get('/student/formations'),
    getById: (id: number) => api.get(`/student/formations/${id}`),
};

// Services API pour les documents étudiant
export const studentDocumentsApi = {
    getAll: () => api.get('/student/documents'),
    getById: (id: number) => api.get(`/student/documents/${id}`),
    download: (id: number) => api.get(`/student/documents/${id}/download`, {
        responseType: 'blob' // Important pour les fichiers !
    }),
    upload: (formData: FormData) => 
        api.post('/student/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
};

// 🆕 Services API pour l'envoi de documents directs aux étudiants
export const adminDirectDocumentsApi = {
    getStudents: () => api.get('/admin/direct-documents/students'),
    sendDocument: (formData: FormData) => api.post('/admin/direct-documents/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadToUser: (studentId: number, formData: FormData) => {
        // Ajouter l'ID de l'étudiant aux données du formulaire
        formData.append('studentId', studentId.toString());
        return api.post('/admin/direct-documents/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getSentDocuments: () => api.get('/admin/direct-documents/sent'),
    delete: (id: number) => api.delete(`/admin/direct-documents/${id}`)
};

// Service d'authentification
export const authApi = {
    login: (credentials: { username: string; password: string }) =>
        api.post('/api/login_check', credentials),
    refreshToken: (refreshToken: string) =>
        api.post('/api/token/refresh', { refresh_token: refreshToken }),
    // Valider le token de setup
    validateSetupToken: (token: string, email: string) =>
        api.post('/auth/validate-setup-token', { token, email }),

    // Compléter l'inscription
    completeRegistration: (formData: FormData) =>
        api.post('/auth/complete-registration', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Vérifier si une entreprise existe avec ce SIRET
    checkCompanySiret: (siret: string) =>
        api.post('/auth/check-company-siret', { siret })
};

export const adminSessionsApi = {
    getAll: (queryParams = '') => api.get(`/admin/sessions${queryParams ? '?' + queryParams : ''}`),
    get: (id:number) => api.get(`/admin/sessions/${id}`),
    create: (sessionData:any) => {
        // S'assurer que les données sont au bon format
        const formattedData = {
            formation: { id: sessionData.formation?.id || sessionData.formationId },
            startDate: sessionData.startDate,
            endDate: sessionData.endDate,
            maxParticipants: parseInt(sessionData.maxParticipants?.toString() || '0'),
            location: sessionData.location,
            status: sessionData.status || 'scheduled',
            notes: sessionData.notes || null,
            instructor: sessionData.instructor || null
        };
        return api.post('/admin/sessions', formattedData);
    },
    update: (id:number, sessionData:any) => api.put(`/admin/sessions/${id}`, sessionData),
    delete: (id:number) => api.delete(`/admin/sessions/${id}`),
    getInstructors: () => api.get('/admin/users?role=ROLE_INSTRUCTOR&status=active'),
    // Méthodes documents
    uploadDocument: (sessionId: number, formData: FormData) =>
        api.post(`/admin/sessions/${sessionId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    deleteDocument: (sessionId: number, documentId: number) =>
        api.delete(`/admin/sessions/${sessionId}/documents/${documentId}`),
};

export const adminVehiclesApi = {
    getAll: () => api.get('/admin/vehicles'),
    get: (id:number) => api.get(`/admin/vehicles/${id}`),
    create: (vehicleData:any) => api.post('/admin/vehicles', vehicleData),
    update: (id:number, vehicleData:any) => api.put(`/admin/vehicles/${id}`, vehicleData),
    delete: (id:number) => api.delete(`/admin/vehicles/${id}`)
};

export const adminUsersApi = {
    getAll: (queryParams = '') => api.get(`/admin/users${queryParams ? '?' + queryParams : ''}`),
    get: (id: number) => api.get(`/admin/users/${id}`),
    create: (userData: any) => api.post('/admin/users', userData),
    update: (id: number, userData: any) => api.put(`/admin/users/${id}`, userData),
    updateStatus: (id: number, isActive: boolean) => api.put(`/admin/users/${id}/status`, { isActive }),
    delete: (id: number) => api.delete(`/admin/users/${id}`),
    restore: (id: number) => api.post(`/admin/users/${id}/restore`),
    getFormations: (userId: number) => api.get(`/admin/users/${userId}/formations`),
    getStudents: (queryParams = '') => api.get(`/admin/users/students${queryParams ? '?' + queryParams : ''}`),
    getDeleted: () => api.get('/admin/users/deleted'),
    getSessions: (userId: number) => api.get(`/admin/users/${userId}/sessions`),
    getDocuments: (userId: number) => api.get(`/admin/users/${userId}/documents`),
    // Nouvelles méthodes pour la gestion complète depuis le modal
    getCompany: (userId: number) => api.get(`/admin/users/${userId}/company`),
    createCompany: (userId: number, companyData: any) => api.post(`/admin/users/${userId}/company`, companyData),
    updateCompany: (userId: number, companyData: any) => api.put(`/admin/users/${userId}/company`, companyData),
    // Gestion des documents d'inscription
    getInscriptionDocuments: (queryParams = '') => api.get(`/admin/users/inscription-documents${queryParams ? '?' + queryParams : ''}`),
    uploadDocument: (formData: FormData) => {
        return api.post('/admin/direct-documents/send', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    deleteDocument: (documentId: number) => api.delete(`/admin/direct-documents/${documentId}`),
};

export const adminPlanningApi = {
    getEvents: (startDate: string, endDate: string) =>
        api.get(`/admin/sessions?startDate=${startDate}&endDate=${endDate}`),
    getEvent: (id: number) =>
        api.get(`/admin/sessions/${id}`),
    createEvent: (eventData: any) =>
        api.post('/admin/sessions', eventData),
    updateEvent: (id: number, eventData: any) =>
        api.put(`/admin/sessions/${id}`, eventData),
    deleteEvent: (id: number) =>
        api.delete(`/admin/sessions/${id}`),
    getInstructors: () =>
        api.get('/admin/users?role=ROLE_INSTRUCTOR&status=active'),
    getLocations: () =>
        api.get('/admin/locations')
};

// Services API pour les centres
export const centersApi = {
    getAll: () => api.get('/api/centers'),
    getById: (id: number) => api.get(`/api/centers/${id}`),
    getForFormations: () => api.get('/api/centers?type=formation'),
    getForExams: () => api.get('/api/centers?type=exam'),
    getByCity: (city: string) => api.get(`/api/centers/by-city/${city}`),
};

// Services API admin pour les centres  
export const adminCentersApi = {
    getAll: () => api.get('/admin/centers'),
    getById: (id: number) => api.get(`/admin/centers/${id}`),
    getForFormations: () => api.get('/admin/centers/formation'),
    getForExams: () => api.get('/admin/centers/exam'),
    create: (data: any) => api.post('/admin/centers', data),
    update: (id: number, data: any) => api.put(`/admin/centers/${id}`, data),
    delete: (id: number) => api.delete(`/admin/centers/${id}`),
};

export const vehicleRentalsApi = {
    create: (formData: FormData) =>
        api.post('/vehicle-rentals', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    getAvailable: (date: string) =>
        api.get(`/vehicles/available?date=${date}`),
    // Admin endpoints for vehicle rental management
    update: (id: number, data: any) => 
        api.put(`/admin/vehicle-rentals/${id}`, data),
};

export const adminEmailTemplatesApi = {
    getAll: () => api.get('/admin/email-templates'),
    get: (id: number) => api.get(`/admin/email-templates/${id}`),
    create: (data: any) => api.post('/admin/email-templates', data),
    update: (id: number, data: any) => api.put(`/admin/email-templates/${id}`, data),
    delete: (id: number) => api.delete(`/admin/email-templates/${id}`),
    duplicate: (id: number, data: { name: string }) => api.post(`/admin/email-templates/${id}/duplicate`, data),
    preview: (id: number, testData: {[key: string]: string}) => api.post(`/admin/email-templates/${id}/preview`, testData)
};

// ========== CMS SERVICES ==========

// Services API pour la gestion de contenu texte
export const adminContentTextApi = {
    // Récupérer tous les textes avec filtres
    getAll: (filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
        const queryString = params.toString();
        return api.get(`/admin/content-texts${queryString ? '?' + queryString : ''}`);
    },
    // Récupérer un texte par ID
    getById: (id: number) => api.get(`/admin/content-texts/${id}`),
    // Créer un nouveau texte
    create: (data: any) => api.post('/admin/content-texts', data),
    // Modifier un texte
    update: (id: number, data: any) => api.put(`/admin/content-texts/${id}`, data),
    // Supprimer un texte
    delete: (id: number) => api.delete(`/admin/content-texts/${id}`),
    // Récupérer les sections disponibles
    getSections: () => api.get('/admin/content-texts/sections'),
    // Récupérer les types disponibles
    getTypes: () => api.get('/admin/content-texts/types'),
    // Récupérer les textes par section
    getBySection: (section: string) => api.get(`/admin/content-texts/by-section/${section}`)
};

// Services API pour la gestion des témoignages
export const adminTestimonialApi = {
    // Récupérer tous les témoignages avec filtres
    getAll: (filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
        const queryString = params.toString();
        return api.get(`/admin/testimonials${queryString ? '?' + queryString : ''}`);
    },
    // Récupérer un témoignage par ID
    getById: (id: number) => api.get(`/admin/testimonials/${id}`),
    // Créer un nouveau témoignage
    create: (data: any) => api.post('/admin/testimonials', data),
    // Modifier un témoignage
    update: (id: number, data: any) => api.put(`/admin/testimonials/${id}`, data),
    // Supprimer un témoignage
    delete: (id: number) => api.delete(`/admin/testimonials/${id}`),
    // Basculer le statut "featured"
    toggleFeatured: (id: number) => api.patch(`/admin/testimonials/${id}/toggle-featured`),
    // Basculer le statut "active"
    toggleActive: (id: number) => api.patch(`/admin/testimonials/${id}/toggle-active`),
    // Récupérer les témoignages en vedette
    getFeatured: () => api.get('/admin/testimonials/featured'),
    // Récupérer les formations disponibles
    getFormations: () => api.get('/admin/testimonials/formations')
};

// Services API pour la gestion des FAQ
export const adminFaqApi = {
    // Récupérer toutes les FAQ avec filtres
    getAll: (filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
        const queryString = params.toString();
        return api.get(`/admin/faq${queryString ? '?' + queryString : ''}`);
    },
    // Récupérer une FAQ par ID
    getById: (id: number) => api.get(`/admin/faq/${id}`),
    // Créer une nouvelle FAQ
    create: (data: any) => api.post('/admin/faq', data),
    // Modifier une FAQ
    update: (id: number, data: any) => api.put(`/admin/faq/${id}`, data),
    // Supprimer une FAQ
    delete: (id: number) => api.delete(`/admin/faq/${id}`),
    // Basculer le statut "featured"
    toggleFeatured: (id: number) => api.patch(`/admin/faq/${id}/toggle-featured`),
    // Basculer le statut "active"
    toggleActive: (id: number) => api.patch(`/admin/faq/${id}/toggle-active`),
    // Réorganiser les FAQ
    reorder: (items: { id: number; sortOrder: number }[]) =>
        api.put('/admin/faq/reorder', { items }),
    // Récupérer les catégories disponibles
    getCategories: () => api.get('/admin/faq/categories'),
    // Récupérer les FAQ en vedette
    getFeatured: () => api.get('/admin/faq/featured'),
    // Récupérer les FAQ par catégorie
    getByCategory: (category: string) => api.get(`/admin/faq/by-category/${category}`)
};
// ========== EXAM CENTERS & FORMULAS SERVICES ==========

// Services API pour la gestion des centres d'examen (Admin)
export const adminExamCentersApi = {
    // Récupérer tous les centres d'examen
    getAll: (params: { search?: string; page?: number; limit?: number } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const queryString = queryParams.toString();
        return api.get(`/admin/centers${queryString ? '?' + queryString : ''}`);
    },

    // Récupérer un centre d'examen par ID
    getById: (id: number) => api.get(`/admin/centers/${id}`),

    // Créer un nouveau centre d'examen
    create: (data: {
        name: string;
        code: string;
        city: string;
        departmentCode: string;
        address?: string;
        isActive: boolean;
    }) => api.post('/admin/centers', data),

    // Modifier un centre d'examen
    update: (id: number, data: {
        name?: string;
        code?: string;
        city?: string;
        departmentCode?: string;
        address?: string;
        isActive?: boolean;
    }) => api.put(`/admin/centers/${id}`, data),

    // Supprimer un centre d'examen
    delete: (id: number) => api.delete(`/admin/centers/${id}`),

    // Récupérer les centres d'examen actifs
    getActive: () => api.get('/admin/centers/active'),

    // Récupérer les centres avec leurs formules
    getWithFormulas: () => api.get('/admin/centers/with-formulas'),

    // Récupérer les statistiques
    getStats: () => api.get('/admin/centers/stats')
};

// Alias pour la nouvelle API des centres (compatibilité)
//export const adminCentersApi = adminExamCentersApi;

// Services API pour la gestion des formules (Admin)
export const adminFormulasApi = {
    // Récupérer toutes les formules
    getAll: (params: { search?: string; examCenter?: number; page?: number; limit?: number } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });
        const queryString = queryParams.toString();
        return api.get(`/admin/formulas${queryString ? '?' + queryString : ''}`);
    },

    // Récupérer une formule par ID
    getById: (id: number) => api.get(`/admin/formulas/${id}`),

    // Créer une nouvelle formule
    create: (data: {
        name: string;
        description: string;
        price?: number;
        type: string;
        additionalInfo?: string;
        isActive: boolean;
        examCenterId: number;
    }) => api.post('/admin/formulas', data),

    // Modifier une formule
    update: (id: number, data: {
        name?: string;
        description?: string;
        price?: number;
        type?: string;
        additionalInfo?: string;
        isActive?: boolean;
        examCenterId?: number;
    }) => api.put(`/admin/formulas/${id}`, data),

    // Supprimer une formule
    delete: (id: number) => api.delete(`/admin/formulas/${id}`),

    // Récupérer les formules actives
    getActive: () => api.get('/admin/formulas/active'),

    // Récupérer les formules d'un centre d'examen
    getByCenter: (centerId: number) => api.get(`/admin/formulas/by-center/${centerId}`),

    // Récupérer les formules groupées par centre
    getGroupedByCenter: () => api.get('/admin/formulas/grouped-by-center'),

    // Récupérer les statistiques
    getStats: () => api.get('/admin/formulas/stats')
};

// Services API publiques pour les centres (sans authentification)
export const publicCentersApi = {
    // Récupérer les centres actifs
    getActiveCenters: () => api.get('/api/centers'),

    // Récupérer les centres actifs avec leurs formules
    getActiveCentersWithFormulas: () => api.get('/api/centers/with-formulas'),

    // Récupérer les formules actives
    getActiveFormulas: () => api.get('/api/formulas'),

    // Récupérer les formules groupées par centre
    getFormulasGroupedByCenter: () => api.get('/api/formulas/grouped-by-center'),

    // Récupérer les formules d'un centre spécifique
    getCenterFormulas: (centerId: number) => api.get(`/api/centers/${centerId}/formulas`)
};

// Alias pour compatibilité - À supprimer progressivement
export const publicExamCentersApi = publicCentersApi;

// Services API pour le contact (public)
export const contactApi = {
    // Envoyer une demande de contact
    submit: (contactData: {
        name: string;
        email: string;
        phone?: string;
        subject: string;
        message: string;
    }) => api.post('/contact', contactData)
};

// Services API pour les témoignages (public)
export const publicTestimonialsApi = {
    // Récupérer les témoignages en vedette
    getFeatured: () => api.get('/testimonials/featured'),
    
    // Récupérer tous les témoignages actifs
    getAll: () => api.get('/testimonials')
};

// Services API pour la gestion des documents (nouveau système)
export const documentsApi = {
    // Upload temporaire de document
    tempUpload: (formData: FormData) =>
        api.post('/admin/documents/temp-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Supprimer un document temporaire
    deleteTempDocument: (tempId: string) =>
        api.delete(`/admin/documents/temp/${tempId}`),
    
    // Finaliser les documents lors de la sauvegarde
    finalizeDocuments: (data: {
        tempIds: string[];
        entityType: 'formation' | 'session';
        entityId: number;
    }) => api.post('/admin/documents/finalize', data),
    
    // Nettoyer les fichiers temporaires anciens
    cleanupTemp: () => api.post('/admin/documents/cleanup-temp'),
    
    // Valider un document d'inscription
    validateDocument: (documentId: number) =>
        api.put(`/admin/documents/${documentId}/validate`),
    
    // Rejeter un document d'inscription
    rejectDocument: (documentId: number, reason: string) =>
        api.put(`/admin/documents/${documentId}/reject`, { reason })
};

// Services API pour l'upload d'images
export const imageUploadApi = {
    // Upload d'image
    upload: (formData: FormData) =>
        api.post('/admin/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Supprimer une image
    delete: (filename: string) =>
        api.delete(`/admin/images/${encodeURIComponent(filename)}`)
};

// Services API pour l'upload d'images CMS
export const adminImageUploadApi = {
    // Upload d'image CMS
    uploadCms: (formData: FormData) =>
        api.post('/admin/images/upload-cms', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Supprimer une image CMS
    deleteCms: (filename: string) =>
        api.delete(`/admin/images/cms/${encodeURIComponent(filename)}`)
};

// Services API pour les documents de réservation de véhicules
export const vehicleRentalDocumentsApi = {
    // Upload temporaire de document pour réservation de véhicule
    tempUpload: (formData: FormData) =>
        api.post('/vehicle-rental-documents/temp-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    
    // Finaliser les documents pour une réservation de véhicule
    finalizeDocuments: (data: {
        tempIds: string[];
        vehicleRentalId: number;
    }) => api.post('/vehicle-rental-documents/finalize', data),
    
    // Récupérer les documents d'une réservation de véhicule
    getByRental: (vehicleRentalId: number) =>
        api.get(`/vehicle-rental-documents/${vehicleRentalId}`),
    
    // Supprimer un document
    deleteDocument: (documentId: number) =>
        api.delete(`/vehicle-rental-documents/${documentId}`),
    
    // URL de téléchargement (ne nécessite pas d'appel API direct)
    getDownloadUrl: (documentId: number) => 
        `${baseURL}/vehicle-rental-documents/download/${documentId}`
};

// Services API pour la gestion des entreprises
export const adminCompaniesApi = {
    // Récupérer toutes les entreprises
    getAll: (params?: { 
        page?: number; 
        limit?: number; 
        search?: string;
        isActive?: boolean;
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return api.get(`/admin/companies${queryString ? '?' + queryString : ''}`);
    },

    // Récupérer une entreprise par ID
    getById: (id: number) => api.get(`/admin/companies/${id}`),

    // Créer une nouvelle entreprise
    create: (data: {
        name: string;
        siret: string;
        address: string;
        postalCode: string;
        city: string;
        responsableName: string;
        email: string;
        phone: string;
    }) => api.post('/admin/companies', data),

    // Modifier une entreprise
    update: (id: number, data: {
        name?: string;
        siret?: string;
        address?: string;
        postalCode?: string;
        city?: string;
        responsableName?: string;
        email?: string;
        phone?: string;
        isActive?: boolean;
    }) => api.put(`/admin/companies/${id}`, data),

    // Supprimer/désactiver une entreprise
    delete: (id: number) => api.delete(`/admin/companies/${id}`),

    // Récupérer les entreprises actives seulement
    getActive: () => api.get('/companies?isActive=true'),

    // Vérifier si un SIRET existe déjà
    checkSiret: (siret: string, excludeId?: number) => {
        const params = new URLSearchParams({ siret });
        if (excludeId) {
            params.append('excludeId', excludeId.toString());
        }
        return api.get(`/companies/check-siret?${params.toString()}`);
    }
};

// ✨ NOUVEAU : Services API pour servir les images uploads
export const uploadsApi = {
    // Construire l'URL pour une image CMS
    getCmsImageUrl: (filename: string) => 
        `${baseURL}/uploads/cms/${encodeURIComponent(filename)}`,
    
    // Construire l'URL pour une image générale
    getImageUrl: (filename: string) => 
        `${baseURL}/uploads/images/${encodeURIComponent(filename)}`,
    
    // Construire l'URL pour un document
    getDocumentUrl: (filename: string) => 
        `${baseURL}/uploads/documents/${encodeURIComponent(filename)}`,
    
    // Construire l'URL pour n'importe quel type d'upload
    getUploadUrl: (type: string, filename: string) =>
        `${baseURL}/uploads/${type}/${encodeURIComponent(filename)}`,

    // Helper pour transformer les URLs relatives en URLs API
    transformImageUrl: (relativePath: string) => {
        if (!relativePath || relativePath.startsWith('http') || relativePath.startsWith('/assets/')) {
            // Déjà une URL absolue ou un asset static - ne pas transformer
            return relativePath;
        }
        
        if (relativePath.startsWith('/uploads/')) {
            // Transformer /uploads/type/file.ext en /api/uploads/type/file.ext
            return `${baseURL}${relativePath}`;
        }
        
        return relativePath;
    }
};

export default api;