import api from './api';

export interface VehicleRentalTracking {
  id: number;
  trackingToken: string;
  vehicle: {
    model: string;
    plate: string;
    category: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  examTime?: string;
  notes?: string;
  adminNotes?: string;
  statusHistory: StatusHistoryItem[];
  driverLicense: {
    frontFile?: string;
    backFile?: string;
  };
}

export interface StatusHistoryItem {
  status: string;
  label: string;
  date: string;
  description: string;
}

export const trackRental = async (trackingToken: string): Promise<VehicleRentalTracking> => {
  const response = await api.get(`/vehicle-rental-tracking/${trackingToken}`);
  return response.data;
};

export const getStatusColor = (status: string): string => {
  // Mapping des statuts unifiés avec couleurs
  switch (status) {
    // Phase 1 : Demande Initiale
    case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
    
    // Phase 2 : Vérifications Administratives
    case 'awaiting_documents': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'documents_pending': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'documents_rejected': return 'bg-red-100 text-red-800 border-red-200';
    
    // Phase 3 : Validation Financière
    case 'awaiting_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'payment_pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    
    // Phase 4 : Confirmation
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
    
    // Phase 5 : Location en Cours
    case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    
    // Phase 6 : Finalisation
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
    
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: string): string => {
  // Labels des statuts unifiés
  switch (status) {
    // Phase 1 : Demande Initiale
    case 'submitted': return 'Demande soumise';
    case 'under_review': return 'En cours d\'examen';
    
    // Phase 2 : Vérifications Administratives
    case 'awaiting_documents': return 'En attente de documents';
    case 'documents_pending': return 'Documents en cours de validation';
    case 'documents_rejected': return 'Documents refusés';
    
    // Phase 3 : Validation Financière
    case 'awaiting_payment': return 'En attente de paiement';
    case 'payment_pending': return 'Paiement en cours';
    
    // Phase 4 : Confirmation
    case 'confirmed': return 'Réservation confirmée';
    
    // Phase 5 : Location en Cours
    case 'in_progress': return 'Location en cours';
    
    // Phase 6 : Finalisation
    case 'completed': return 'Location terminée';
    case 'cancelled': return 'Réservation annulée';
    case 'refunded': return 'Remboursement effectué';
    
    default: return status;
  }
};

export const getStatusIcon = (status: string): string => {
  // Icônes pour le système unifié
  switch (status) {
    // Phase 1 : Demande Initiale
    case 'submitted': return '📝';
    case 'under_review': return '🔍';
    
    // Phase 2 : Vérifications Administratives
    case 'awaiting_documents': return '📋';
    case 'documents_pending': return '⏳';
    case 'documents_rejected': return '❌';
    
    // Phase 3 : Validation Financière
    case 'awaiting_payment': return '💳';
    case 'payment_pending': return '💰';
    
    // Phase 4 : Confirmation
    case 'confirmed': return '✅';
    
    // Phase 5 : Location en Cours
    case 'in_progress': return '🚗';
    
    // Phase 6 : Finalisation
    case 'completed': return '🎉';
    case 'cancelled': return '❌';
    case 'refunded': return '💸';
    
    default: return '📋';
  }
};

// Définition des phases pour la progression visuelle
export interface ProgressPhase {
  id: number;
  title: string;
  description: string;
  statuses: string[];
  icon: string;
  color: string;
}

export const getProgressPhases = (): ProgressPhase[] => [
  {
    id: 1,
    title: 'Demande Initiale',
    description: 'Votre demande a été reçue et est en cours d\'examen',
    statuses: ['submitted', 'under_review'],
    icon: '📝',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Vérifications',
    description: 'Validation de vos documents et informations',
    statuses: ['awaiting_documents', 'documents_pending', 'documents_rejected'],
    icon: '📋',
    color: 'orange'
  },
  {
    id: 3,
    title: 'Paiement',
    description: 'Traitement du paiement de votre réservation',
    statuses: ['awaiting_payment', 'payment_pending'],
    icon: '💳',
    color: 'yellow'
  },
  {
    id: 4,
    title: 'Confirmation',
    description: 'Votre réservation est confirmée',
    statuses: ['confirmed'],
    icon: '✅',
    color: 'green'
  },
  {
    id: 5,
    title: 'Location Active',
    description: 'Votre véhicule est en cours de location',
    statuses: ['in_progress'],
    icon: '🚗',
    color: 'indigo'
  },
  {
    id: 6,
    title: 'Finalisation',
    description: 'Location terminée ou traitement final',
    statuses: ['completed', 'cancelled', 'refunded'],
    icon: '🏁',
    color: 'green'
  }
];

// Obtenir la phase actuelle basée sur le statut
export const getCurrentPhase = (status: string): number => {
  const phases = getProgressPhases();
  for (let phase of phases) {
    if (phase.statuses.includes(status)) {
      return phase.id;
    }
  }
  return 1; // Par défaut, phase 1
};

// Obtenir les étapes suivantes
export const getNextSteps = (status: string): string[] => {
  switch (status) {
    case 'submitted':
      return ['Examen de votre demande par notre équipe', 'Validation de vos informations'];
    case 'under_review':
      return ['Réception de nos instructions par email', 'Envoi des documents requis'];
    case 'awaiting_documents':
      return ['Upload de vos documents via le lien reçu', 'Validation sous 48h'];
    case 'documents_pending':
      return ['Validation de vos documents par notre équipe', 'Réception du devis personnalisé'];
    case 'documents_rejected':
      return ['Correction des documents', 'Nouveau dépôt via le lien reçu'];
    case 'awaiting_payment':
      return ['Règlement via le lien de paiement', 'Confirmation automatique'];
    case 'payment_pending':
      return ['Validation du paiement sous 24h', 'Confirmation de votre réservation'];
    case 'confirmed':
      return ['Préparation de votre véhicule', 'Contact avant le jour J'];
    case 'in_progress':
      return ['Profiter de votre location', 'Restitution à l\'heure convenue'];
    case 'completed':
      return ['Téléchargement de votre facture', 'Évaluation de notre service'];
    case 'cancelled':
      return ['Traitement du remboursement si applicable', 'Nouvelle réservation possible'];
    case 'refunded':
      return ['Réception du remboursement sous 3-5 jours', 'Nouvelle réservation possible'];
    default:
      return ['Suivez les instructions reçues par email'];
  }
};

export const generateTrackingUrl = (trackingToken: string): string => {
  return `${window.location.origin}/track/${trackingToken}`;
};