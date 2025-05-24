// Types pour la gestion du contenu CMS

export interface ContentText {
  id: number;
  identifier: string;
  title: string;
  content: string;
  section: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  clientName: string;
  clientJob?: string;
  clientCompany?: string;
  content: string;
  rating?: number;
  formation?: string;
  clientImage?: string;
  isActive: boolean;
  isFeatured: boolean;
  testimonialDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Types pour les formulaires
export interface CreateContentTextRequest {
  identifier: string;
  title: string;
  content: string;
  section: string;
  type: string;
  isActive?: boolean;
}

export interface UpdateContentTextRequest extends Partial<CreateContentTextRequest> {}

export interface CreateTestimonialRequest {
  clientName: string;
  clientJob?: string;
  clientCompany?: string;
  content: string;
  rating?: number;
  formation?: string;
  clientImage?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  testimonialDate?: string;
}

export interface UpdateTestimonialRequest extends Partial<CreateTestimonialRequest> {}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface UpdateFAQRequest extends Partial<CreateFAQRequest> {}

// Types pour les réponses API
export interface CMSApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface CMSListResponse<T> extends CMSApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Types pour les filtres
export interface ContentTextFilters {
  page?: number;
  limit?: number;
  section?: string;
  type?: string;
  search?: string;
}

export interface TestimonialFilters {
  page?: number;
  limit?: number;
  formation?: string;
  rating?: number;
  featured?: boolean;
  active?: boolean;
  search?: string;
}

export interface FAQFilters {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  active?: boolean;
  search?: string;
}

// Types pour les constantes
export const CONTENT_SECTIONS = [
  'home',
  'formations',
  'contact',
  'about',
  'vehicle-rental',
  'footer'
] as const;

export const CONTENT_TYPES = [
  'title',
  'subtitle', 
  'paragraph',
  'button',
  'description',
  'slogan'
] as const;

export const FAQ_CATEGORIES = [
  'general',
  'formation',
  'payment',
  'location',
  'registration',
  'certificate'
] as const;

export type ContentSection = typeof CONTENT_SECTIONS[number];
export type ContentType = typeof CONTENT_TYPES[number];
export type FAQCategory = typeof FAQ_CATEGORIES[number];
