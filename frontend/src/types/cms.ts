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
  'tracking_footer'
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
