import axios from 'axios';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
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

// Services API pour le dashboard administrateur
export const adminDashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentInscriptions: () => api.get('/admin/dashboard/recent-inscriptions'),
  getRecentReservations: () => api.get('/admin/dashboard/recent-reservations'),
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
  getAll: () => api.get('/admin/reservations'),
  getById: (id: number) => api.get(`/admin/reservations/${id}`),
  updateStatus: (id: number, status: string) => api.put(`/admin/reservations/${id}/status`, { status }),
  assignVehicle: (id: number, vehicleId: number) => api.put(`/admin/reservations/${id}/assign-vehicle`, { vehicleId }),
  getAvailableVehicles: () => api.get('/admin/vehicles/available'),
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

export default api;
