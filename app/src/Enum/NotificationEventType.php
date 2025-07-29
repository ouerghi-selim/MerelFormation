<?php
// src/Enum/NotificationEventType.php
namespace App\Enum;

class NotificationEventType
{
    public const REGISTRATION_REQUEST = 'registration_request';
    public const REGISTRATION_CONFIRMATION = 'registration_confirmation';
    public const VEHICLE_RENTAL = 'vehicle_rental';
    
    // Événements unifiés pour réservations
    public const RESERVATION_SUBMITTED = 'reservation_submitted';
    public const RESERVATION_STATUS_UPDATED = 'reservation_status_updated';
    public const RESERVATION_CONFIRMED = 'reservation_confirmed';
    public const RESERVATION_COMPLETED = 'reservation_completed';
    public const RESERVATION_CANCELLED = 'reservation_cancelled';
    public const PASSWORD_RESET = 'password_reset';
    
    // Formation events
    public const FORMATION_CREATED = 'formation_created';
    public const FORMATION_UPDATED = 'formation_updated';
    public const FORMATION_DELETED = 'formation_deleted';
    
    // Session events
    public const SESSION_CREATED = 'session_created';
    public const SESSION_UPDATED = 'session_updated';
    public const SESSION_CANCELLED = 'session_cancelled';
    
    // User events
    public const USER_WELCOME = 'user_welcome';
    public const USER_UPDATED = 'user_updated';
    public const USER_DEACTIVATED = 'user_deactivated';
    public const USER_REACTIVATED = 'user_reactivated';
    
    // Vehicle events
    public const VEHICLE_ADDED = 'vehicle_added';
    public const VEHICLE_MAINTENANCE = 'vehicle_maintenance';
    public const VEHICLE_REMOVED = 'vehicle_removed';
    
    // Vehicle rental status events (unified system)
    public const VEHICLE_RENTAL_STATUS_UPDATED = 'vehicle_rental_status_updated';
    
    // Reservation events
    public const RESERVATION_UPDATED = 'reservation_updated';
    
    // Document events
    public const DOCUMENT_ADDED = 'document_added';
    public const DOCUMENT_REMOVED = 'document_removed';
    public const DOCUMENTS_ADDED = 'documents_added';
    public const DOCUMENTS_ADDED_BY_INSTRUCTOR = 'documents_added_by_instructor';
    public const DIRECT_DOCUMENT_SENT = 'direct_document_sent';
    public const DOCUMENT_VALIDATED = 'document_validated';
    public const DOCUMENT_REJECTED = 'document_rejected';
    
    // Payment events
    public const PAYMENT_RECEIVED = 'payment_received';
    public const PAYMENT_DUE = 'payment_due';
    public const PAYMENT_REFUNDED = 'payment_refunded';
    
    // Contact events
    public const CONTACT_REQUEST = 'contact_request';
    public const CONTACT_RESPONSE = 'contact_response';
}