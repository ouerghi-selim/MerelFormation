<?php
// src/Enum/NotificationEventType.php
namespace App\Enum;

class NotificationEventType
{
    public const REGISTRATION_CONFIRMATION = 'registration_confirmation';
    public const VEHICLE_RENTAL = 'vehicle_rental';
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
    
    // Vehicle events
    public const VEHICLE_ADDED = 'vehicle_added';
    public const VEHICLE_MAINTENANCE = 'vehicle_maintenance';
    public const VEHICLE_REMOVED = 'vehicle_removed';
    
    // Reservation events
    public const RESERVATION_UPDATED = 'reservation_updated';
    public const RESERVATION_CANCELLED = 'reservation_cancelled';
    
    // Document events
    public const DOCUMENT_ADDED = 'document_added';
    public const DOCUMENT_REMOVED = 'document_removed';
    
    // Payment events
    public const PAYMENT_RECEIVED = 'payment_received';
    public const PAYMENT_DUE = 'payment_due';
    public const PAYMENT_REFUNDED = 'payment_refunded';
    
    // Contact events
    public const CONTACT_REQUEST = 'contact_request';
    public const CONTACT_RESPONSE = 'contact_response';
}