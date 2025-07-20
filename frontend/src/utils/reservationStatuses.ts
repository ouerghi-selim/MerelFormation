// utils/reservationStatuses.ts

export interface ReservationStatus {
  value: string;
  label: string;
  phase: string;
  color: string;
  allowedTransitions: string[];
}

export interface ReservationTransition {
  value: string;
  label: string;
  color: string;
}

// Fonction pour obtenir la classe CSS Tailwind pour les badges de statut
export const getStatusBadgeClass = (status: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  // Mapping des statuts vers leurs couleurs (fallback si l'API n'est pas disponible)
  const statusColorMap: Record<string, string> = {
    // Phase 1 : Demande Initiale
    submitted: 'blue',
    under_review: 'blue',
    
    // Phase 2 : Vérifications Administratives
    awaiting_documents: 'orange',
    documents_pending: 'orange',
    documents_rejected: 'red',
    awaiting_prerequisites: 'orange',
    
    // Phase 3 : Validation Financière
    awaiting_funding: 'yellow',
    funding_approved: 'yellow',
    awaiting_payment: 'yellow',
    payment_pending: 'yellow',
    
    // Phase 4 : Finalisation
    confirmed: 'green',
    awaiting_start: 'green',
    
    // Phase 5 : Formation en Cours
    in_progress: 'indigo',
    attendance_issues: 'red',
    suspended: 'red',
    
    // Phase 6 : Finalisation
    completed: 'green',
    failed: 'red',
    cancelled: 'red',
    refunded: 'gray',

    // Anciens statuts (pour compatibilité)
    pending: 'yellow',
  };

  const color = statusColorMap[status] || 'gray';
  return colorMap[color] || 'bg-gray-100 text-gray-800';
};

// Fonction pour obtenir le libellé d'un statut (fallback si l'API n'est pas disponible)
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    // Phase 1 : Demande Initiale
    submitted: 'Demande soumise',
    under_review: 'En cours d\'examen',
    
    // Phase 2 : Vérifications Administratives
    awaiting_documents: 'En attente de documents',
    documents_pending: 'Documents en cours de validation',
    documents_rejected: 'Documents refusés',
    awaiting_prerequisites: 'En attente de prérequis',
    
    // Phase 3 : Validation Financière
    awaiting_funding: 'En attente de financement',
    funding_approved: 'Financement approuvé',
    awaiting_payment: 'En attente de paiement',
    payment_pending: 'Paiement en cours',
    
    // Phase 4 : Finalisation
    confirmed: 'Inscription confirmée',
    awaiting_start: 'En attente du début',
    
    // Phase 5 : Formation en Cours
    in_progress: 'Formation en cours',
    attendance_issues: 'Problèmes d\'assiduité',
    suspended: 'Inscription suspendue',
    
    // Phase 6 : Finalisation
    completed: 'Formation terminée',
    failed: 'Échec de formation',
    cancelled: 'Inscription annulée',
    refunded: 'Remboursement effectué',

    // Anciens statuts (pour compatibilité)
    pending: 'En attente',
  };

  return statusLabels[status] || status;
};

// Grouper les statuts par phase pour l'affichage
export const getStatusesByPhase = (statuses: ReservationStatus[]) => {
  const phases: Record<string, ReservationStatus[]> = {};
  
  statuses.forEach(status => {
    if (!phases[status.phase]) {
      phases[status.phase] = [];
    }
    phases[status.phase].push(status);
  });
  
  return phases;
};

// Icônes pour chaque phase
export const getPhaseIcon = (phase: string): string => {
  const phaseIcons: Record<string, string> = {
    'Demande Initiale': '📝',
    'Vérifications Administratives': '📋',
    'Validation Financière': '💰',
    'Confirmation': '✅',
    'Formation en Cours': '📚',
    'Finalisation': '🎓',
  };
  
  return phaseIcons[phase] || '📄';
};