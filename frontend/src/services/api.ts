import axios from 'axios';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://merelformation.localhost/api',
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
    register: (registrationData: { name: string; email: string; sessionId: number | null }) =>
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
};

// Services API pour les réservations administrateur
export const adminReservationsApi = {
  getAll: (queryParams = '') => api.get(`/admin/reservations${queryParams ? '?' + queryParams : ''}`),
  getById: (id: number) => api.get(`/admin/reservations/${id}`),
  updateStatus: (id: number, status: string) => api.put(`/admin/reservations/${id}/status`, { status }),
  assignVehicle: (id: number, vehicleModel: string) => api.put(`/admin/reservations/${id}/assign-vehicle`, { vehicleModel }),
  getAvailableVehicles: (date: string) => api.get(`/admin/vehicles/available?date=${date}`),
  getSessionReservations: (queryParams = '') => api.get(`/admin/session-reservations${queryParams ? '?' + queryParams : ''}`),
  updateSessionReservationStatus: (id: number, status: string) => api.put(`/admin/session-reservations/${id}/status`, { status }),
  getSessionReservationById: (id: number) => api.get(`/admin/session-reservations/${id}`)
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
  download: (id: number) => api.get(`/student/documents/${id}/download`),
};

// Service d'authentification
export const authApi = {
  login: (credentials: { username: string; password: string }) => 
    api.post('/api/login_check', credentials),
  refreshToken: (refreshToken: string) => 
    api.post('/api/token/refresh', { refresh_token: refreshToken }),
};

export const adminSessionsApi = {
    getAll: (queryParams = '') => api.get(`/admin/sessions${queryParams ? '?' + queryParams : ''}`),
    get: (id:number) => api.get(`/admin/sessions/${id}`),
    create: (sessionData:any) => api.post('/admin/sessions', sessionData),
    update: (id:number, sessionData:any) => api.put(`/admin/sessions/${id}`, sessionData),
    delete: (id:number) => api.delete(`/admin/sessions/${id}`),
    getInstructors: () => api.get('/admin/users?role=ROLE_INSTRUCTOR'),

}

// Dans votre fichier services/api.js ou services/api/adminVehiclesApi.js

export const adminVehiclesApi = {
    getAll: () => api.get('/admin/vehicles'),
    get: (id:number) => api.get(`/admin/vehicles/${id}`),
    create: (vehicleData:any) => api.post('/admin/vehicles', vehicleData),
    update: (id:number, vehicleData:any) => api.put(`/admin/vehicles/${id}`, vehicleData),
    delete: (id:number) => api.delete(`/admin/vehicles/${id}`)
}

export const adminUsersApi = {
    getAll: (queryParams = '') => api.get(`/admin/users${queryParams ? '?' + queryParams : ''}`),
    get: (id: number) => api.get(`/admin/users/${id}`),
    create: (userData: any) => api.post('/admin/users', userData),
    update: (id: number, userData: any) => api.put(`/admin/users/${id}`, userData),
    delete: (id: number) => api.delete(`/admin/users/${id}`),
    getFormations: (userId: number) => api.get(`/admin/users/${userId}/formations`),
    getStudents: (queryParams = '') => api.get(`/admin/users/students${queryParams ? '?' + queryParams : ''}`),
    getSessions: (userId: number) => api.get(`/admin/users/${userId}/sessions`),
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
        api.get('/admin/users?role=ROLE_INSTRUCTOR'),
    getLocations: () =>
        api.get('/admin/locations')
};

export const vehicleRentalsApi = {
    create: (formData: FormData) =>
        api.post('/vehicle-rentals', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    getAvailable: (date: string) =>
        api.get(`/vehicles/available?date=${date}`),
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

export default api;
