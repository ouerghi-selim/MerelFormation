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
  'home_statistics',
  'formations_hero',
  'formations_advantages',
  'location_hero',
  'location_info',
  'location_booking',
  'location_vehicles',
  'location_cta',
  'contact_hero',
  'contact_info',
  'contact_map',
  'contact_form',
  'contact_legal',
  'tracking_header',
  'tracking_progress',
  'tracking_history',
  'tracking_documents',
  'tracking_invoice',
  'tracking_status',
  'tracking_footer',
  'footer'
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
  'advantage_description',
  'image_url',
  'image_alt',
  'image_upload'
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
    sections: ['home_hero', 'home_services', 'home_cta', 'home_testimonials', 'home_statistics']
  },
  {
    id: 'formations',
    name: '📚 Page formations',
    description: 'Contenu de la page des formations',
    icon: '📚',
    sections: ['formations_hero', 'formations_advantages']
  },
  {
    id: 'location',
    name: '🚗 Page location',
    description: 'Contenu de la page de location de véhicules',
    icon: '🚗',
    sections: ['location_hero', 'location_info', 'location_booking', 'location_vehicles', 'location_cta']
  },
  {
    id: 'contact',
    name: '📞 Page contact',
    description: 'Contenu de la page de contact',
    icon: '📞',
    sections: ['contact_hero', 'contact_info', 'contact_map', 'contact_form', 'contact_legal']
  },
  {
    id: 'tracking',
    name: '🔍 Page suivi réservation',
    description: 'Contenu de la page de suivi des réservations de véhicules',
    icon: '🔍',
    sections: ['tracking_header', 'tracking_progress', 'tracking_history', 'tracking_documents', 'tracking_invoice', 'tracking_status', 'tracking_footer']
  },
  {
    id: 'footer',
    name: '🦶 Footer (toutes pages)',
    description: 'Contenu du footer affiché sur toutes les pages',
    icon: '🦶',
    sections: ['footer']
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
  'home_hero_image_url': {
    label: 'Image principale - URL',
    description: 'URL de l\'image d\'illustration de la section principale',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },
  'home_hero_image_alt': {
    label: 'Image principale - Alt',
    description: 'Texte alternatif de l\'image d\'illustration (pour l\'accessibilité)',
    page: '🏠 Page d\'accueil',
    section: '🎯 Section principale'
  },
  'home_hero_image': {
    label: 'Image principale',
    description: 'Image d\'illustration de la section principale avec upload intégré',
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

  // Page d'accueil - Services - Fonctionnalités
  'service_formation_feature_1': {
    label: 'Formation - Caractéristique 1',
    description: 'Première caractéristique du service de formation (ex: Formation initiale de 140h)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_formation_feature_2': {
    label: 'Formation - Caractéristique 2', 
    description: 'Deuxième caractéristique du service de formation (ex: Formation continue)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_formation_feature_3': {
    label: 'Formation - Caractéristique 3',
    description: 'Troisième caractéristique du service de formation (ex: Certification officielle)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_location_feature_1': {
    label: 'Location - Caractéristique 1',
    description: 'Première caractéristique du service de location (ex: Entretien inclus)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_location_feature_2': {
    label: 'Location - Caractéristique 2',
    description: 'Deuxième caractéristique du service de location (ex: Assurance professionnelle)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_planning_feature_1': {
    label: 'Planning - Caractéristique 1',
    description: 'Première caractéristique du service de planning (ex: Horaires adaptés)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_planning_feature_2': {
    label: 'Planning - Caractéristique 2',
    description: 'Deuxième caractéristique du service de planning (ex: Support personnalisé)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },

  // Page d'accueil - Services - Liens d'action
  'service_formation_link_text': {
    label: 'Formation - Texte du lien',
    description: 'Texte du lien d\'action pour le service formation (ex: En savoir plus)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_location_link_text': {
    label: 'Location - Texte du lien',
    description: 'Texte du lien d\'action pour le service location (ex: Découvrir les véhicules)',
    page: '🏠 Page d\'accueil',
    section: '🏢 Nos services'
  },
  'service_planning_link_text': {
    label: 'Planning - Texte du lien',
    description: 'Texte du lien d\'action pour le service planning (ex: Voir le planning)',
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

  // Page d'accueil - Statistiques
  'home_stats_students_label': {
    label: 'Libellé "Stagiaires Formés"',
    description: 'Texte affiché sous le nombre de stagiaires formés',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_students_value': {
    label: 'Nombre de stagiaires formés',
    description: 'Valeur affichée pour les stagiaires formés (ex: 500+)',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_success_label': {
    label: 'Libellé "Taux de Réussite"',
    description: 'Texte affiché sous le taux de réussite',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_success_value': {
    label: 'Pourcentage de réussite',
    description: 'Valeur du taux de réussite (ex: 95)',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_vehicles_label': {
    label: 'Libellé "Véhicules"',
    description: 'Texte affiché sous le nombre de véhicules',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_vehicles_value': {
    label: 'Nombre de véhicules',
    description: 'Valeur affichée pour les véhicules (ex: 20+)',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_experience_label': {
    label: 'Libellé "Années d\'Expérience"',
    description: 'Texte affiché sous les années d\'expérience',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
  },
  'home_stats_experience_value': {
    label: 'Nombre d\'années d\'expérience',
    description: 'Valeur affichée pour l\'expérience (ex: 15+)',
    page: '🏠 Page d\'accueil',
    section: '📊 Statistiques'
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
  },

  // Page Location - Hero
  'location_hero_title': {
    label: 'Titre principal',
    description: 'Titre principal de la page location',
    page: '🚗 Page location',
    section: '🎯 En-tête'
  },
  'location_hero_subtitle': {
    label: 'Sous-titre',
    description: 'Description sous le titre principal',
    page: '🚗 Page location',
    section: '🎯 En-tête'
  },
  'location_hero_cta': {
    label: 'Bouton principal',
    description: 'Texte du bouton de réservation',
    page: '🚗 Page location',
    section: '🎯 En-tête'
  },

  // Page Location - Informations
  'location_info_title': {
    label: 'Titre "Examen TAXI-VTC"',
    description: 'Titre de la section informations',
    page: '🚗 Page location',
    section: '📋 Informations'
  },
  'location_info_description': {
    label: 'Description examen',
    description: 'Texte d\'introduction sur l\'examen',
    page: '🚗 Page location',
    section: '📋 Informations'
  },
  'location_info_taxi_requirements': {
    label: 'Exigences TAXI',
    description: 'Texte sur les exigences pour l\'examen TAXI',
    page: '🚗 Page location',
    section: '📋 Informations'
  },
  'location_info_vtc_requirements': {
    label: 'Exigences VTC',
    description: 'Texte sur les exigences pour l\'examen VTC',
    page: '🚗 Page location',
    section: '📋 Informations'
  },
  'location_info_footer': {
    label: 'Conclusion informations',
    description: 'Texte de conclusion sur les services proposés',
    page: '🚗 Page location',
    section: '📋 Informations'
  },

  // Page Location - Réservation
  'location_booking_title': {
    label: 'Titre "Comment réserver"',
    description: 'Titre de la section réservation',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },
  'location_booking_step1_title': {
    label: 'Étape 1 - Titre',
    description: 'Titre de la première étape de réservation',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },
  'location_booking_step1_description': {
    label: 'Étape 1 - Description',
    description: 'Description de la première étape',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },
  'location_booking_step2_title': {
    label: 'Étape 2 - Titre',
    description: 'Titre de la deuxième étape de réservation',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },
  'location_booking_step2_description': {
    label: 'Étape 2 - Description',
    description: 'Description de la deuxième étape',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },
  'location_booking_step3_title': {
    label: 'Étape 3 - Titre',
    description: 'Titre de la troisième étape de réservation',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },
  'location_booking_step3_description': {
    label: 'Étape 3 - Description',
    description: 'Description de la troisième étape',
    page: '🚗 Page location',
    section: '📅 Réservation'
  },

  // Page Location - Véhicules
  'location_vehicles_title': {
    label: 'Titre "Nos véhicules"',
    description: 'Titre de la section véhicules',
    page: '🚗 Page location',
    section: '🚙 Véhicules'
  },
  'location_vehicles_model': {
    label: 'Modèle véhicule',
    description: 'Nom du modèle de véhicule proposé',
    page: '🚗 Page location',
    section: '🚙 Véhicules'
  },
  'location_vehicles_features': {
    label: 'Caractéristiques',
    description: 'Liste des caractéristiques du véhicule',
    page: '🚗 Page location',
    section: '🚙 Véhicules'
  },
  'location_vehicles_pricing': {
    label: 'Information tarifs',
    description: 'Texte sur les tarifs et options',
    page: '🚗 Page location',
    section: '🚙 Véhicules'
  },

  // Page Location - Caractéristiques véhicule détaillées
  'location_vehicle_feature_1': {
    label: 'Caractéristique véhicule 1',
    description: 'Première caractéristique du véhicule (ex: Boîte automatique)',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },
  'location_vehicle_feature_2': {
    label: 'Caractéristique véhicule 2',
    description: 'Deuxième caractéristique du véhicule (ex: Équipements taxi obligatoires)',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },
  'location_vehicle_feature_3': {
    label: 'Caractéristique véhicule 3',
    description: 'Troisième caractéristique du véhicule (ex: Système auto-école double commande)',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },
  'location_vehicle_feature_4': {
    label: 'Caractéristique véhicule 4',
    description: 'Quatrième caractéristique du véhicule (ex: 3 rétroviseurs supplémentaires)',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },
  'location_vehicle_feature_5': {
    label: 'Caractéristique véhicule 5',
    description: 'Cinquième caractéristique du véhicule (ex: Module électrique)',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },
  'location_vehicle_image_alt': {
    label: 'Image véhicule - Texte alternatif',
    description: 'Texte alternatif de l\'image du véhicule pour l\'accessibilité',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },
  'location_vehicle_image': {
    label: 'Image véhicule (Upload)',
    description: 'Image du véhicule avec possibilité d\'upload direct',
    page: '🚗 Page location',
    section: '🚙 Caractéristiques véhicule'
  },

  // Page Location - CTA Final
  'location_cta_title': {
    label: 'Titre appel à l\'action',
    description: 'Titre de la section finale',
    page: '🚗 Page location',
    section: '🎯 Appel à l\'action'
  },
  'location_cta_description': {
    label: 'Description appel à l\'action',
    description: 'Description de l\'appel à l\'action final',
    page: '🚗 Page location',
    section: '🎯 Appel à l\'action'
  },

  // Page Contact - Hero
  'contact_hero_title': {
    label: 'Titre principal',
    description: 'Titre principal de la page contact',
    page: '📞 Page contact',
    section: '🎯 En-tête'
  },
  'contact_hero_description': {
    label: 'Description principale',
    description: 'Description sous le titre principal',
    page: '📞 Page contact',
    section: '🎯 En-tête'
  },

  // Page Contact - Informations
  'contact_info_phone_label': {
    label: 'Libellé "Téléphone"',
    description: 'Texte affiché pour la section téléphone',
    page: '📞 Page contact',
    section: '📋 Informations'
  },
  'contact_info_phone_value': {
    label: 'Numéro de téléphone',
    description: 'Numéro de téléphone à afficher',
    page: '📞 Page contact',
    section: '📋 Informations'
  },
  'contact_info_address_label': {
    label: 'Libellé "Adresse"',
    description: 'Texte affiché pour la section adresse',
    page: '📞 Page contact',
    section: '📋 Informations'
  },
  'contact_info_address_value': {
    label: 'Adresse complète',
    description: 'Adresse complète à afficher',
    page: '📞 Page contact',
    section: '📋 Informations'
  },
  'contact_info_hours_label': {
    label: 'Libellé "Horaires"',
    description: 'Texte affiché pour la section horaires',
    page: '📞 Page contact',
    section: '📋 Informations'
  },
  'contact_info_hours_value': {
    label: 'Horaires d\'ouverture',
    description: 'Horaires d\'ouverture à afficher',
    page: '📞 Page contact',
    section: '📋 Informations'
  },
  'contact_info_director_name': {
    label: 'Nom du directeur',
    description: 'Nom du directeur à afficher',
    page: '📞 Page contact',
    section: '📋 Informations'
  },

  // Page Contact - Carte
  'contact_map_title': {
    label: 'Titre "Nous situer"',
    description: 'Titre de la section carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },
  'contact_map_description': {
    label: 'Description localisation',
    description: 'Texte descriptif sous la carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },

  // Page Contact - Formulaire
  'contact_form_title': {
    label: 'Titre du formulaire',
    description: 'Titre de la section formulaire',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_firstname_label': {
    label: 'Libellé "Prénom"',
    description: 'Texte du champ prénom',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_lastname_label': {
    label: 'Libellé "Nom"',
    description: 'Texte du champ nom',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_email_label': {
    label: 'Libellé "Email"',
    description: 'Texte du champ email',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_phone_label': {
    label: 'Libellé "Téléphone"',
    description: 'Texte du champ téléphone',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_subject_label': {
    label: 'Libellé "Sujet"',
    description: 'Texte du champ sujet',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_message_label': {
    label: 'Libellé "Message"',
    description: 'Texte du champ message',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_submit_button': {
    label: 'Bouton "Envoyer"',
    description: 'Texte du bouton d\'envoi',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_gdpr_text': {
    label: 'Texte RGPD',
    description: 'Texte de conformité RGPD sous le formulaire',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_success_message': {
    label: 'Message de succès',
    description: 'Message affiché après envoi réussi',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },
  'contact_form_error_message': {
    label: 'Message d\'erreur',
    description: 'Message affiché en cas d\'erreur',
    page: '📞 Page contact',
    section: '📝 Formulaire'
  },

  // Page Contact - Informations légales
  'contact_legal_title': {
    label: 'Titre "Informations légales"',
    description: 'Titre de la section informations légales',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_mediation_title': {
    label: 'Titre "Médiation"',
    description: 'Titre de la section médiation',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_company_info': {
    label: 'Informations entreprise',
    description: 'Informations légales de l\'entreprise',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_mediation_info': {
    label: 'Informations médiation',
    description: 'Informations sur la médiation',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },

  // Page Tracking - En-tête
  'tracking_header_title': {
    label: 'Titre principal',
    description: 'Titre principal de la page de suivi',
    page: '🔍 Page suivi réservation',
    section: '🎯 En-tête'
  },
  'tracking_header_description': {
    label: 'Description principale',
    description: 'Description sous le titre principal',
    page: '🔍 Page suivi réservation',
    section: '🎯 En-tête'
  },

  // Page Tracking - Progression
  'tracking_progress_title': {
    label: 'Titre progression',
    description: 'Titre de la section progression de la réservation',
    page: '🔍 Page suivi réservation',
    section: '📈 Progression'
  },
  'tracking_progress_description': {
    label: 'Description progression',
    description: 'Description de la progression de la réservation',
    page: '🔍 Page suivi réservation',
    section: '📈 Progression'
  },

  // Page Tracking - Historique
  'tracking_history_title': {
    label: 'Titre historique',
    description: 'Titre de la section historique détaillé',
    page: '🔍 Page suivi réservation',
    section: '📜 Historique'
  },
  'tracking_history_description': {
    label: 'Description historique',
    description: 'Description de la section historique',
    page: '🔍 Page suivi réservation',
    section: '📜 Historique'
  },

  // Page Tracking - Documents
  'tracking_documents_title': {
    label: 'Titre documents',
    description: 'Titre de la section documents de la réservation',
    page: '🔍 Page suivi réservation',
    section: '📄 Documents'
  },
  'tracking_documents_description': {
    label: 'Description documents',
    description: 'Description de la section documents',
    page: '🔍 Page suivi réservation',
    section: '📄 Documents'
  },

  // Page Tracking - Facture
  'tracking_invoice_title': {
    label: 'Titre facture',
    description: 'Titre de la section facture disponible',
    page: '🔍 Page suivi réservation',
    section: '💰 Facture'
  },
  'tracking_invoice_description': {
    label: 'Description facture',
    description: 'Description de la disponibilité de la facture',
    page: '🔍 Page suivi réservation',
    section: '💰 Facture'
  },
  'tracking_invoice_download_button': {
    label: 'Bouton téléchargement facture',
    description: 'Texte du bouton pour télécharger la facture',
    page: '🔍 Page suivi réservation',
    section: '💰 Facture'
  },

  // Page Tracking - Messages de statut
  'tracking_status_awaiting_docs': {
    label: 'Message attente documents',
    description: 'Message affiché quand des documents sont attendus',
    page: '🔍 Page suivi réservation',
    section: '⚠️ Messages de statut'
  },
  'tracking_status_no_docs': {
    label: 'Message aucun document',
    description: 'Message affiché quand aucun document n\'est associé',
    page: '🔍 Page suivi réservation',
    section: '⚠️ Messages de statut'
  },

  // Page Tracking - Footer
  'tracking_footer_note': {
    label: 'Note du footer',
    description: 'Note explicative en bas de page',
    page: '🔍 Page suivi réservation',
    section: '🔻 Pied de page'
  },
  'tracking_footer_brand': {
    label: 'Marque du footer',
    description: 'Nom de la marque affiché en footer',
    page: '🔍 Page suivi réservation',
    section: '🔻 Pied de page'
  },

  // Page Contact - Informations légales détaillées
  'contact_legal_company_name': {
    label: 'Nom de l\'entreprise',
    description: 'Nom officiel de l\'entreprise',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_siret': {
    label: 'Numéro SIRET',
    description: 'Numéro SIRET de l\'entreprise',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_agreement_35': {
    label: 'Agrément Ille-et-Vilaine (35)',
    description: 'Numéro d\'agrément préfectoral pour le département 35',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_agreement_22': {
    label: 'Agrément Côtes-d\'Armor (22)',
    description: 'Numéro d\'agrément préfectoral pour le département 22',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_agreement_56': {
    label: 'Agrément Morbihan (56)',
    description: 'Numéro d\'agrément préfectoral pour le département 56',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_legal_agreement_44': {
    label: 'Agrément Loire-Atlantique (44)',
    description: 'Numéro d\'agrément préfectoral pour le département 44',
    page: '📞 Page contact',
    section: '⚖️ Informations légales'
  },
  'contact_mediation_center_name': {
    label: 'Nom du centre de médiation',
    description: 'Nom complet du centre de médiation et arbitrage',
    page: '📞 Page contact',
    section: '⚖️ Médiation'
  },
  'contact_mediation_address': {
    label: 'Adresse médiation',
    description: 'Adresse du centre de médiation',
    page: '📞 Page contact',
    section: '⚖️ Médiation'
  },
  'contact_mediation_email': {
    label: 'Email médiation',
    description: 'Adresse email du centre de médiation',
    page: '📞 Page contact',
    section: '⚖️ Médiation'
  },
  'contact_mediation_website': {
    label: 'Site web médiation',
    description: 'URL du site web du centre de médiation',
    page: '📞 Page contact',
    section: '⚖️ Médiation'
  },

  // Footer - Newsletter
  'footer_newsletter_title': {
    label: 'Titre newsletter',
    description: 'Titre de la section inscription newsletter',
    page: '🦶 Footer (toutes pages)',
    section: '📧 Newsletter'
  },
  'footer_newsletter_description': {
    label: 'Description newsletter',
    description: 'Description de l\'inscription à la newsletter',
    page: '🦶 Footer (toutes pages)',
    section: '📧 Newsletter'
  },
  'footer_newsletter_placeholder': {
    label: 'Placeholder email',
    description: 'Texte d\'exemple dans le champ email',
    page: '🦶 Footer (toutes pages)',
    section: '📧 Newsletter'
  },
  'footer_agreements': {
    label: 'Agréments footer',
    description: 'Liste des agréments préfectoraux affichés',
    page: '🦶 Footer (toutes pages)',
    section: '📧 Newsletter'
  },

  // Footer - Contact
  'footer_contact_title': {
    label: 'Titre contact footer',
    description: 'Titre de la section contact dans le footer',
    page: '🦶 Footer (toutes pages)',
    section: '📞 Contact'
  },
  'footer_contact_email': {
    label: 'Email footer',
    description: 'Adresse email de contact affichée dans le footer',
    page: '🦶 Footer (toutes pages)',
    section: '📞 Contact'
  },
  'footer_contact_phone': {
    label: 'Téléphone footer',
    description: 'Numéro de téléphone affiché dans le footer',
    page: '🦶 Footer (toutes pages)',
    section: '📞 Contact'
  },
  'footer_contact_address': {
    label: 'Adresse footer',
    description: 'Adresse complète affichée dans le footer',
    page: '🦶 Footer (toutes pages)',
    section: '📞 Contact'
  },

  // Footer - Horaires
  'footer_hours_title': {
    label: 'Titre horaires footer',
    description: 'Titre de la section horaires dans le footer',
    page: '🦶 Footer (toutes pages)',
    section: '🕐 Horaires'
  },
  'footer_hours_days': {
    label: 'Jours d\'ouverture',
    description: 'Jours de la semaine d\'ouverture',
    page: '🦶 Footer (toutes pages)',
    section: '🕐 Horaires'
  },
  'footer_hours_time': {
    label: 'Heures d\'ouverture',
    description: 'Plages horaires d\'ouverture détaillées',
    page: '🦶 Footer (toutes pages)',
    section: '🕐 Horaires'
  },
  'footer_social_title': {
    label: 'Titre réseaux sociaux',
    description: 'Titre de la section réseaux sociaux',
    page: '🦶 Footer (toutes pages)',
    section: '📱 Réseaux sociaux'
  },

  // Page Contact - Éléments Hero additionnels
  'contact_hero_company_info': {
    label: 'Informations entreprise (Hero)',
    description: 'Nom et adresse de l\'entreprise affichés dans la section hero',
    page: '📞 Page contact',
    section: '🎯 En-tête'
  },
  'contact_hero_phone_button': {
    label: 'Bouton téléphone (Hero)',
    description: 'Texte du bouton de téléphone dans la section hero',
    page: '📞 Page contact',
    section: '🎯 En-tête'
  },
  'contact_hero_email_button': {
    label: 'Bouton email (Hero)',
    description: 'Texte du bouton email dans la section hero',
    page: '📞 Page contact',
    section: '🎯 En-tête'
  },

  // Page Contact - Informations contact détaillées
  'contact_info_phone_number': {
    label: 'Numéro de téléphone affiché',
    description: 'Numéro de téléphone affiché dans la section informations',
    page: '📞 Page contact',
    section: '📋 Informations'
  },

  // Page Contact - Informations carte
  'contact_map_company_name': {
    label: 'Nom entreprise (Carte)',
    description: 'Nom de l\'entreprise affiché dans la popup de carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },
  'contact_map_company_type': {
    label: 'Type d\'entreprise (Carte)',
    description: 'Type d\'activité affiché dans la popup de carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },
  'contact_map_address_street': {
    label: 'Adresse rue (Carte)',
    description: 'Nom de rue affiché dans la popup de carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },
  'contact_map_address_city': {
    label: 'Ville (Carte)',
    description: 'Code postal et ville affichés dans la popup de carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },
  'contact_map_phone_link': {
    label: 'Téléphone lien (Carte)',
    description: 'Numéro de téléphone cliquable dans la popup de carte',
    page: '📞 Page contact',
    section: '🗺️ Localisation'
  },

  // Footer - Copyright et mentions légales
  'footer_copyright_text': {
    label: 'Texte copyright',
    description: 'Nom de l\'entreprise et mention droits réservés',
    page: '🦶 Footer (toutes pages)',
    section: '⚖️ Copyright'
  },
  'footer_legal_siret': {
    label: 'SIRET footer',
    description: 'Numéro SIRET affiché dans le footer',
    page: '🦶 Footer (toutes pages)',
    section: '⚖️ Copyright'
  },
  'footer_legal_agreement': {
    label: 'Agrément préfectoral footer',
    description: 'Numéro d\'agrément préfectoral principal affiché',
    page: '🦶 Footer (toutes pages)',
    section: '⚖️ Copyright'
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
