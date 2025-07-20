<?php

namespace App\Enum;

class ReservationStatus
{
    // Phase 1 : Demande Initiale
    public const SUBMITTED = 'submitted';
    public const UNDER_REVIEW = 'under_review';
    
    // Phase 2 : Vérifications Administratives
    public const AWAITING_DOCUMENTS = 'awaiting_documents';
    public const DOCUMENTS_PENDING = 'documents_pending';
    public const DOCUMENTS_REJECTED = 'documents_rejected';
    public const AWAITING_PREREQUISITES = 'awaiting_prerequisites';
    
    // Phase 3 : Validation Financière
    public const AWAITING_FUNDING = 'awaiting_funding';
    public const FUNDING_APPROVED = 'funding_approved';
    public const AWAITING_PAYMENT = 'awaiting_payment';
    public const PAYMENT_PENDING = 'payment_pending';
    
    // Phase 4 : Finalisation
    public const CONFIRMED = 'confirmed';
    public const AWAITING_START = 'awaiting_start';
    
    // Phase 5 : Formation en Cours
    public const IN_PROGRESS = 'in_progress';
    public const ATTENDANCE_ISSUES = 'attendance_issues';
    public const SUSPENDED = 'suspended';
    
    // Phase 6 : Finalisation
    public const COMPLETED = 'completed';
    public const FAILED = 'failed';
    public const CANCELLED = 'cancelled';
    public const REFUNDED = 'refunded';

    /**
     * Retourne tous les statuts disponibles
     */
    public static function getAllStatuses(): array
    {
        return [
            // Phase 1
            self::SUBMITTED,
            self::UNDER_REVIEW,
            
            // Phase 2
            self::AWAITING_DOCUMENTS,
            self::DOCUMENTS_PENDING,
            self::DOCUMENTS_REJECTED,
            self::AWAITING_PREREQUISITES,
            
            // Phase 3
            self::AWAITING_FUNDING,
            self::FUNDING_APPROVED,
            self::AWAITING_PAYMENT,
            self::PAYMENT_PENDING,
            
            // Phase 4
            self::CONFIRMED,
            self::AWAITING_START,
            
            // Phase 5
            self::IN_PROGRESS,
            self::ATTENDANCE_ISSUES,
            self::SUSPENDED,
            
            // Phase 6
            self::COMPLETED,
            self::FAILED,
            self::CANCELLED,
            self::REFUNDED,
        ];
    }

    /**
     * Retourne les statuts par phase
     */
    public static function getStatusesByPhase(): array
    {
        return [
            'Demande Initiale' => [
                self::SUBMITTED => 'Demande soumise',
                self::UNDER_REVIEW => 'En cours d\'examen',
            ],
            'Vérifications Administratives' => [
                self::AWAITING_DOCUMENTS => 'En attente de documents',
                self::DOCUMENTS_PENDING => 'Documents en cours de validation',
                self::DOCUMENTS_REJECTED => 'Documents refusés',
                self::AWAITING_PREREQUISITES => 'En attente de prérequis',
            ],
            'Validation Financière' => [
                self::AWAITING_FUNDING => 'En attente de financement',
                self::FUNDING_APPROVED => 'Financement approuvé',
                self::AWAITING_PAYMENT => 'En attente de paiement',
                self::PAYMENT_PENDING => 'Paiement en cours',
            ],
            'Confirmation' => [
                self::CONFIRMED => 'Inscription confirmée',
                self::AWAITING_START => 'En attente du début',
            ],
            'Formation en Cours' => [
                self::IN_PROGRESS => 'Formation en cours',
                self::ATTENDANCE_ISSUES => 'Problèmes d\'assiduité',
                self::SUSPENDED => 'Inscription suspendue',
            ],
            'Finalisation' => [
                self::COMPLETED => 'Formation terminée',
                self::FAILED => 'Échec de formation',
                self::CANCELLED => 'Inscription annulée',
                self::REFUNDED => 'Remboursement effectué',
            ],
        ];
    }

    /**
     * Retourne le libellé d'un statut
     */
    public static function getStatusLabel(string $status): string
    {
        $labels = [
            self::SUBMITTED => 'Demande soumise',
            self::UNDER_REVIEW => 'En cours d\'examen',
            self::AWAITING_DOCUMENTS => 'En attente de documents',
            self::DOCUMENTS_PENDING => 'Documents en cours de validation',
            self::DOCUMENTS_REJECTED => 'Documents refusés',
            self::AWAITING_PREREQUISITES => 'En attente de prérequis',
            self::AWAITING_FUNDING => 'En attente de financement',
            self::FUNDING_APPROVED => 'Financement approuvé',
            self::AWAITING_PAYMENT => 'En attente de paiement',
            self::PAYMENT_PENDING => 'Paiement en cours',
            self::CONFIRMED => 'Inscription confirmée',
            self::AWAITING_START => 'En attente du début',
            self::IN_PROGRESS => 'Formation en cours',
            self::ATTENDANCE_ISSUES => 'Problèmes d\'assiduité',
            self::SUSPENDED => 'Inscription suspendue',
            self::COMPLETED => 'Formation terminée',
            self::FAILED => 'Échec de formation',
            self::CANCELLED => 'Inscription annulée',
            self::REFUNDED => 'Remboursement effectué',
        ];

        return $labels[$status] ?? $status;
    }

    /**
     * Retourne la couleur du badge pour un statut
     */
    public static function getStatusColor(string $status): string
    {
        return match($status) {
            self::SUBMITTED, self::UNDER_REVIEW => 'blue',
            self::AWAITING_DOCUMENTS, self::DOCUMENTS_PENDING, self::AWAITING_PREREQUISITES => 'orange',
            self::DOCUMENTS_REJECTED => 'red',
            self::AWAITING_FUNDING, self::FUNDING_APPROVED, self::AWAITING_PAYMENT, self::PAYMENT_PENDING => 'yellow',
            self::CONFIRMED, self::AWAITING_START => 'green',
            self::IN_PROGRESS => 'indigo',
            self::ATTENDANCE_ISSUES, self::SUSPENDED => 'red',
            self::COMPLETED => 'green',
            self::FAILED, self::CANCELLED => 'red',
            self::REFUNDED => 'gray',
            default => 'gray'
        };
    }

    /**
     * Retourne les transitions autorisées depuis un statut donné
     */
    public static function getAllowedTransitions(string $fromStatus): array
    {
        return match($fromStatus) {
            self::SUBMITTED => [self::UNDER_REVIEW, self::CANCELLED],
            self::UNDER_REVIEW => [self::AWAITING_DOCUMENTS, self::AWAITING_FUNDING, self::CONFIRMED, self::CANCELLED],
            self::AWAITING_DOCUMENTS => [self::DOCUMENTS_PENDING, self::CANCELLED],
            self::DOCUMENTS_PENDING => [self::DOCUMENTS_REJECTED, self::AWAITING_FUNDING, self::CONFIRMED],
            self::DOCUMENTS_REJECTED => [self::AWAITING_DOCUMENTS, self::CANCELLED],
            self::AWAITING_PREREQUISITES => [self::CONFIRMED, self::CANCELLED],
            self::AWAITING_FUNDING => [self::FUNDING_APPROVED, self::AWAITING_PAYMENT, self::CANCELLED],
            self::FUNDING_APPROVED => [self::CONFIRMED, self::AWAITING_START],
            self::AWAITING_PAYMENT => [self::PAYMENT_PENDING, self::CANCELLED],
            self::PAYMENT_PENDING => [self::CONFIRMED, self::CANCELLED],
            self::CONFIRMED => [self::AWAITING_START, self::CANCELLED],
            self::AWAITING_START => [self::IN_PROGRESS, self::CANCELLED],
            self::IN_PROGRESS => [self::ATTENDANCE_ISSUES, self::SUSPENDED, self::COMPLETED, self::FAILED],
            self::ATTENDANCE_ISSUES => [self::IN_PROGRESS, self::SUSPENDED, self::FAILED],
            self::SUSPENDED => [self::IN_PROGRESS, self::CANCELLED],
            self::COMPLETED => [], // État final
            self::FAILED => [self::REFUNDED],
            self::CANCELLED => [self::REFUNDED],
            self::REFUNDED => [], // État final
            default => []
        };
    }
}