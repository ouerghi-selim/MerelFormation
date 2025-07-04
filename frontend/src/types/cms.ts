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
  'home_hero',
  'home_services',
  'home_cta',
  'home_testimonials',
  'formations_hero',
  'formations_advantages'
] as const;

export const CONTENT_TYPES = [
  'title',
  'description',
  'cta_text',
  'text',
  'service_title',
  'service_description',
  'button_text',
  'advantage_title',
  'advantage_description'
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

// Mapping pour descriptions humaines
export interface PageSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: ContentSection[];
}

export const CMS_PAGES: PageSection[] = [
  {
    id: 'home',
    name: '🏠 Page d\'accueil',
    description: 'Contenu de la page principale du site',
    icon: '🏠',
    sections: ['home_hero', 'home_services', 'home_cta', 'home_testimonials']
  },
  {
    id: 'formations',
    name: '📚 Page formations',
    description: 'Contenu de la page des formations',
    icon: '📚',
    sections: ['formations_hero', 'formations_advantages']
  }
];

// Mapping des identifiants vers descriptions humaines
export const CONTENT_DESCRIPTIONS: { [key: string]: { label: string; description: string; page: string; section: string } } = {
  // Page d'accueil - Section principale
  'home_hero_title': {
    label: 'Titre principal',
    description: 'Le grand titre affiché en premier sur la page d\'accueil',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },
  'home_hero_description': {
    label: 'Description principale',
    description: 'Le texte de description sous le titre principal',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },
  'home_hero_cta_formations': {
    label: 'Bouton "Nos formations"',
    description: 'Texte du bouton pour accéder aux formations',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },
  'home_hero_cta_location': {
    label: 'Bouton "Location véhicule"',
    description: 'Texte du bouton pour la location de véhicules',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },
  'home_hero_community': {
    label: 'Texte communauté',
    description: 'Texte sur la communauté d\'étudiants',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },

  // Page d'accueil - Services
  'home_services_title': {
    label: 'Titre de la section services',
    description: 'Titre de la section présentant nos services',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'home_services_description': {
    label: 'Description des services',
    description: 'Description générale de nos services',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_formation_title': {
    label: 'Titre "Formation"',
    description: 'Titre du service de formation',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_formation_description': {
    label: 'Description formation',
    description: 'Description du service de formation',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_location_title': {
    label: 'Titre "Location"',
    description: 'Titre du service de location',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_location_description': {
    label: 'Description location',
    description: 'Description du service de location de véhicules',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_planning_title': {
    label: 'Titre "Planning"',
    description: 'Titre du service de planning',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_planning_description': {
    label: 'Description planning',
    description: 'Description du service de planning des cours',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },

  // Page d'accueil - CTA final
  'home_cta_title': {
    label: 'Titre appel à l\'action',
    description: 'Titre de la section d\'appel à l\'action finale',
    page: '🏠 Page d\'accueil',
    section: '🎯 Appel à l\'action'
  },
  'home_cta_description': {
    label: 'Description appel à l\'action',
    description: 'Description de l\'appel à l\'action finale',
    page: '🏠 Page d\'accueil',
    section: '🎯 Appel à l\'action'
  },
  'home_cta_contact': {
    label: 'Bouton "Contact"',
    description: 'Texte du bouton de contact',
    page: '🏠 Page d\'accueil',
    section: '🎯 Appel à l\'action'
  },
  'home_cta_formations': {
    label: 'Bouton "Formations"',
    description: 'Texte du bouton vers les formations',
    page: '🏠 Page d\'accueil',
    section: '🎯 Appel à l\'action'
  },

  // Page d'accueil - Témoignages
  'home_testimonials_title': {
    label: 'Titre des témoignages',
    description: 'Titre de la section témoignages',
    page: '🏠 Page d\'accueil',
    section: '💬 Témoignages'
  },

  // Page formations - Hero
  'formations_hero_title': {
    label: 'Titre de la page',
    description: 'Titre principal de la page formations',
    page: '📚 Page formations',
    section: '🎯 En-tête'
  },
  'formations_hero_description': {
    label: 'Description de la page',
    description: 'Description principale de la page formations',
    page: '📚 Page formations',
    section: '🎯 En-tête'
  },

  // Page formations - Avantages
  'formations_advantages_title': {
    label: 'Titre "Pourquoi nous choisir"',
    description: 'Titre de la section des avantages',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  },
  'advantage_certification_title': {
    label: 'Titre "Certification"',
    description: 'Titre de l\'avantage certification',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  },
  'advantage_certification_description': {
    label: 'Description certification',
    description: 'Description de l\'avantage certification',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  },
  'advantage_trainers_title': {
    label: 'Titre "Formateurs"',
    description: 'Titre de l\'avantage formateurs expérimentés',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  },
  'advantage_trainers_description': {
    label: 'Description formateurs',
    description: 'Description de l\'avantage formateurs expérimentés',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  },
  'advantage_support_title': {
    label: 'Titre "Accompagnement"',
    description: 'Titre de l\'avantage accompagnement personnalisé',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  },
  'advantage_support_description': {
    label: 'Description accompagnement',
    description: 'Description de l\'avantage accompagnement personnalisé',
    page: '📚 Page formations',
    section: '✨ Nos avantages'
  }
};

// Helper function pour obtenir la description humaine
export const getContentDescription = (identifier: string) => {
  return CONTENT_DESCRIPTIONS[identifier] || {
    label: identifier,
    description: 'Contenu personnalisé',
    page: 'Autre',
    section: 'Divers'
  };
};
