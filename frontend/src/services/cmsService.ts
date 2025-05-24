import axios from 'axios';
import { 
  ContentText, 
  Testimonial, 
  FAQ,
  CreateContentTextRequest,
  UpdateContentTextRequest,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  CMSApiResponse,
  CMSListResponse,
  ContentTextFilters,
  TestimonialFilters,
  FAQFilters
} from '../types/cms';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configuration Axios avec token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ========== CONTENT TEXT SERVICES ==========
export const contentTextService = {
  // Récupérer tous les textes avec filtres
  getAll: async (filters: ContentTextFilters = {}): Promise<CMSListResponse<ContentText>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/content-texts?${params}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer un texte par ID
  getById: async (id: number): Promise<CMSApiResponse<ContentText>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/content-texts/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Créer un nouveau texte
  create: async (data: CreateContentTextRequest): Promise<CMSApiResponse<ContentText>> => {
    const response = await axios.post(
      `${API_BASE_URL}/admin/content-texts`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Modifier un texte
  update: async (id: number, data: UpdateContentTextRequest): Promise<CMSApiResponse<ContentText>> => {
    const response = await axios.put(
      `${API_BASE_URL}/admin/content-texts/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Supprimer un texte
  delete: async (id: number): Promise<CMSApiResponse<void>> => {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/content-texts/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les sections disponibles
  getSections: async (): Promise<CMSApiResponse<string[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/content-texts/sections`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les types disponibles
  getTypes: async (): Promise<CMSApiResponse<string[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/content-texts/types`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les textes par section
  getBySection: async (section: string): Promise<CMSApiResponse<ContentText[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/content-texts/by-section/${section}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

// ========== TESTIMONIAL SERVICES ==========
export const testimonialService = {
  // Récupérer tous les témoignages avec filtres
  getAll: async (filters: TestimonialFilters = {}): Promise<CMSListResponse<Testimonial>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/testimonials?${params}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer un témoignage par ID
  getById: async (id: number): Promise<CMSApiResponse<Testimonial>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/testimonials/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Créer un nouveau témoignage
  create: async (data: CreateTestimonialRequest): Promise<CMSApiResponse<Testimonial>> => {
    const response = await axios.post(
      `${API_BASE_URL}/admin/testimonials`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Modifier un témoignage
  update: async (id: number, data: UpdateTestimonialRequest): Promise<CMSApiResponse<Testimonial>> => {
    const response = await axios.put(
      `${API_BASE_URL}/admin/testimonials/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Supprimer un témoignage
  delete: async (id: number): Promise<CMSApiResponse<void>> => {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/testimonials/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Basculer le statut "featured"
  toggleFeatured: async (id: number): Promise<CMSApiResponse<Testimonial>> => {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/testimonials/${id}/toggle-featured`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Basculer le statut "active"
  toggleActive: async (id: number): Promise<CMSApiResponse<Testimonial>> => {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/testimonials/${id}/toggle-active`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les témoignages en vedette
  getFeatured: async (): Promise<CMSApiResponse<Testimonial[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/testimonials/featured`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les formations disponibles
  getFormations: async (): Promise<CMSApiResponse<string[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/testimonials/formations`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

// ========== FAQ SERVICES ==========
export const faqService = {
  // Récupérer toutes les FAQ avec filtres
  getAll: async (filters: FAQFilters = {}): Promise<CMSListResponse<FAQ>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/faq?${params}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer une FAQ par ID
  getById: async (id: number): Promise<CMSApiResponse<FAQ>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/faq/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Créer une nouvelle FAQ
  create: async (data: CreateFAQRequest): Promise<CMSApiResponse<FAQ>> => {
    const response = await axios.post(
      `${API_BASE_URL}/admin/faq`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Modifier une FAQ
  update: async (id: number, data: UpdateFAQRequest): Promise<CMSApiResponse<FAQ>> => {
    const response = await axios.put(
      `${API_BASE_URL}/admin/faq/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Supprimer une FAQ
  delete: async (id: number): Promise<CMSApiResponse<void>> => {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/faq/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Basculer le statut "featured"
  toggleFeatured: async (id: number): Promise<CMSApiResponse<FAQ>> => {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/faq/${id}/toggle-featured`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Basculer le statut "active"
  toggleActive: async (id: number): Promise<CMSApiResponse<FAQ>> => {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/faq/${id}/toggle-active`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Réorganiser les FAQ
  reorder: async (items: { id: number; sortOrder: number }[]): Promise<CMSApiResponse<void>> => {
    const response = await axios.put(
      `${API_BASE_URL}/admin/faq/reorder`,
      { items },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les catégories disponibles
  getCategories: async (): Promise<CMSApiResponse<string[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/faq/categories`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les FAQ en vedette
  getFeatured: async (): Promise<CMSApiResponse<FAQ[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/faq/featured`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Récupérer les FAQ par catégorie
  getByCategory: async (category: string): Promise<CMSApiResponse<FAQ[]>> => {
    const response = await axios.get(
      `${API_BASE_URL}/admin/faq/by-category/${category}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

// Export par défaut avec tous les services
export default {
  contentText: contentTextService,
  testimonial: testimonialService,
  faq: faqService
};
