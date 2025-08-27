import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

// Interface pour une phase de progression
interface ProgressPhase {
  id: number;
  title: string;
  description: string;
  statuses: string[];
  icon: string;
  color: string;
}

// Interface pour les props du composant
interface ReservationStatusProgressProps {
  reservationStatus: string;
  sessionStartDate?: string;
  showNextSteps?: boolean;
  compact?: boolean;
}

// Définition des phases pour les réservations de formation
const getProgressPhases = (): ProgressPhase[] => [
  {
    id: 1,
    title: 'Demande Initiale',
    description: 'Votre inscription a été reçue et est en cours d\'examen',
    statuses: ['submitted', 'under_review'],
    icon: '📝',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Vérifications',
    description: 'Validation de vos documents et informations',
    statuses: ['awaiting_documents', 'documents_pending', 'documents_rejected', 'awaiting_prerequisites'],
    icon: '📋',
    color: 'orange'
  },
  {
    id: 3,
    title: 'Financement',
    description: 'Traitement du financement de votre formation',
    statuses: ['awaiting_funding', 'funding_approved', 'awaiting_payment', 'payment_pending'],
    icon: '💳',
    color: 'yellow'
  },
  {
    id: 4,
    title: 'Confirmation',
    description: 'Votre inscription est confirmée',
    statuses: ['confirmed', 'awaiting_start'],
    icon: '✅',
    color: 'green'
  },
  {
    id: 5,
    title: 'Formation',
    description: 'Formation en cours de déroulement',
    statuses: ['in_progress', 'attendance_issues', 'suspended'],
    icon: '🎓',
    color: 'indigo'
  },
  {
    id: 6,
    title: 'Finalisation',
    description: 'Formation terminée ou traitement final',
    statuses: ['completed', 'failed', 'cancelled', 'refunded', 'user_archived'],
    icon: '🏁',
    color: 'green'
  }
];

// Obtenir la phase actuelle basée sur le statut
const getCurrentPhase = (status: string): number => {
  const phases = getProgressPhases();
  for (let phase of phases) {
    if (phase.statuses.includes(status)) {
      return phase.id;
    }
  }
  return 1; // Par défaut, phase 1
};

// Obtenir le texte du statut en français
const getStatusText = (status: string): string => {
  const statusLabels: { [key: string]: string } = {
    'submitted': 'Demande soumise',
    'under_review': 'En cours d\'examen',
    'awaiting_documents': 'En attente de documents',
    'documents_pending': 'Documents en cours de validation',
    'documents_rejected': 'Documents refusés',
    'awaiting_prerequisites': 'En attente de prérequis',
    'awaiting_funding': 'En attente de financement',
    'funding_approved': 'Financement approuvé',
    'awaiting_payment': 'En attente de paiement',
    'payment_pending': 'Paiement en cours',
    'confirmed': 'Inscription confirmée',
    'awaiting_start': 'En attente du début',
    'in_progress': 'Formation en cours',
    'attendance_issues': 'Problèmes d\'assiduité',
    'suspended': 'Inscription suspendue',
    'completed': 'Formation terminée',
    'failed': 'Échec de formation',
    'cancelled': 'Inscription annulée',
    'refunded': 'Remboursement effectué',
    'user_archived': 'Utilisateur archivé'
  };
  
  return statusLabels[status] || status;
};

// Obtenir l'icône du statut
const getStatusIcon = (status: string): string => {
  const statusIcons: { [key: string]: string } = {
    'submitted': '📝',
    'under_review': '🔍',
    'awaiting_documents': '📋',
    'documents_pending': '⏳',
    'documents_rejected': '❌',
    'awaiting_prerequisites': '📚',
    'awaiting_funding': '🏦',
    'funding_approved': '✅',
    'awaiting_payment': '💳',
    'payment_pending': '💰',
    'confirmed': '✅',
    'awaiting_start': '⏰',
    'in_progress': '🎓',
    'attendance_issues': '⚠️',
    'suspended': '⏸️',
    'completed': '🎉',
    'failed': '❌',
    'cancelled': '❌',
    'refunded': '💸',
    'user_archived': '📦'
  };
  
  return statusIcons[status] || '📋';
};

// Obtenir la couleur du statut
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'submitted':
    case 'under_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'awaiting_documents':
    case 'documents_pending':
    case 'awaiting_prerequisites':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'documents_rejected':
    case 'attendance_issues':
    case 'suspended':
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'awaiting_funding':
    case 'funding_approved':
    case 'awaiting_payment':
    case 'payment_pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
    case 'awaiting_start':
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'refunded':
    case 'user_archived':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Obtenir les classes CSS pour les phases (fix pour Tailwind dynamic classes)
const getPhaseColorClasses = (color: string): string => {
  switch (color) {
    case 'blue': return 'bg-blue-100 border-blue-500 text-blue-700';
    case 'orange': return 'bg-orange-100 border-orange-500 text-orange-700';
    case 'yellow': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    case 'green': return 'bg-green-100 border-green-500 text-green-700';
    case 'indigo': return 'bg-indigo-100 border-indigo-500 text-indigo-700';
    default: return 'bg-gray-100 border-gray-300 text-gray-400';
  }
};

// Obtenir les prochaines étapes
const getNextSteps = (status: string): string[] => {
  switch (status) {
    case 'submitted':
      return ['Examen de votre demande par notre équipe', 'Validation de vos informations'];
    case 'under_review':
      return ['Réception de nos instructions par email', 'Envoi des documents requis'];
    case 'awaiting_documents':
      return ['Soumission de vos documents requis', 'Validation sous 48h'];
    case 'documents_pending':
      return ['Validation de vos documents par notre équipe', 'Traitement du financement'];
    case 'documents_rejected':
      return ['Correction des documents', 'Nouveau dépôt des documents'];
    case 'awaiting_prerequisites':
      return ['Validation des prérequis', 'Confirmation de l\'inscription'];
    case 'awaiting_funding':
      return ['Traitement du dossier de financement', 'Validation par l\'organisme financeur'];
    case 'funding_approved':
      return ['Finalisation des modalités', 'Confirmation de votre place'];
    case 'awaiting_payment':
      return ['Règlement via le lien de paiement', 'Confirmation automatique'];
    case 'payment_pending':
      return ['Validation du paiement sous 24h', 'Confirmation de votre inscription'];
    case 'confirmed':
      return ['Préparation du planning de formation', 'Contact avant le début'];
    case 'awaiting_start':
      return ['Démarrage de la formation', 'Accueil et première séance'];
    case 'in_progress':
      return ['Suivre assidûment les cours', 'Préparer les évaluations'];
    case 'attendance_issues':
      return ['Régulariser votre assiduité', 'Contact avec votre formateur'];
    case 'suspended':
      return ['Résolution des problèmes identifiés', 'Reprise de la formation'];
    case 'completed':
      return ['Réception de votre certificat', 'Évaluation de la formation'];
    case 'failed':
      return ['Possibilité de rattrapage', 'Contact avec l\'administration'];
    case 'cancelled':
      return ['Traitement du remboursement si applicable', 'Nouvelle inscription possible'];
    case 'refunded':
      return ['Réception du remboursement sous 3-5 jours', 'Nouvelle inscription possible'];
    default:
      return ['Suivez les instructions reçues par email'];
  }
};

const ReservationStatusProgress: React.FC<ReservationStatusProgressProps> = ({
  reservationStatus,
  sessionStartDate,
  showNextSteps = true,
  compact = false
}) => {
  const currentPhase = getCurrentPhase(reservationStatus);
  const phases = getProgressPhases();

  if (compact) {
    // Version compacte pour les cartes
    return (
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Statut d'inscription</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservationStatus)}`}>
            <span className="mr-1">{getStatusIcon(reservationStatus)}</span>
            {getStatusText(reservationStatus)}
          </div>
        </div>
        
        {/* Barre de progression simplifiée */}
        <div className="relative">
          <div className="absolute top-2 left-2 right-2 h-0.5 bg-gray-200"></div>
          <div 
            className="absolute top-2 left-2 h-0.5 bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.max(0, (currentPhase - 1) / (phases.length - 1)) * 100}%` }}
          ></div>
          
          <div className="flex justify-between">
            {phases.map((phase, index) => {
              const isCompleted = currentPhase > phase.id;
              const isCurrentPhase = currentPhase === phase.id;
              
              return (
                <div key={phase.id} className="flex flex-col items-center relative group">
                  <div className={`
                    w-4 h-4 rounded-full flex items-center justify-center text-xs border transition-all duration-300 cursor-help
                    ${isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : isCurrentPhase 
                        ? getPhaseColorClasses(phase.color) 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? '✓' : phase.icon}
                  </div>
                  
                  {/* Tooltip au survol */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">{phase.title}</div>
                    <div className="text-gray-300">{phase.description}</div>
                    {/* Flèche du tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Version complète pour les pages de détail
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center">
        <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
        Progression de votre inscription
      </h2>
      
      {/* Status principal */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(reservationStatus)}`}>
          <span className="text-xl mr-2">{getStatusIcon(reservationStatus)}</span>
          <span className="font-medium text-lg">{getStatusText(reservationStatus)}</span>
        </div>
        {sessionStartDate && (
          <p className="text-sm text-gray-600 mt-2">
            Début de formation: {new Date(sessionStartDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>
      
      <div className="relative">
        {/* Barre de progression */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
        <div 
          className="absolute top-6 left-6 h-0.5 bg-blue-600 transition-all duration-500"
          style={{ width: `${Math.max(0, (currentPhase - 1) / (phases.length - 1)) * 100}%` }}
        ></div>
        
        {/* Phases */}
        <div className="grid grid-cols-6 gap-2">
          {phases.map((phase) => {
            const isActive = phase.statuses.includes(reservationStatus);
            const isCompleted = currentPhase > phase.id;
            const isCurrentPhase = currentPhase === phase.id;
            
            return (
              <div key={phase.id} className="text-center relative group">
                {/* Icône de phase */}
                <div className={`
                  relative mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 border-2 transition-all duration-300 cursor-help
                  ${isCompleted 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : isCurrentPhase 
                      ? getPhaseColorClasses(phase.color) 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? '✓' : phase.icon}
                  {isCurrentPhase && (
                    <div className="absolute -inset-1 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  )}
                </div>
                
                {/* Tooltip au survol pour la version complète */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                  <div className="font-semibold text-center">{phase.title}</div>
                  <div className="text-gray-300 text-xs text-center mt-1">{phase.description}</div>
                  {/* Détails supplémentaires selon la phase */}
                  <div className="text-gray-400 text-xs text-center mt-2">
                    {phase.statuses.length > 1 ? `${phase.statuses.length} étapes` : '1 étape'}
                  </div>
                  {/* Flèche du tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
                
                {/* Titre de phase */}
                <h3 className={`
                  text-xs font-medium mb-1
                  ${isCompleted || isCurrentPhase ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {phase.title}
                </h3>
                
                {/* Description */}
                <p className={`
                  text-xs leading-4
                  ${isCompleted || isCurrentPhase ? 'text-gray-600' : 'text-gray-400'}
                `}>
                  {phase.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Prochaines étapes */}
      {showNextSteps && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Prochaines étapes
          </h3>
          <ul className="space-y-1">
            {getNextSteps(reservationStatus).map((step, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReservationStatusProgress;