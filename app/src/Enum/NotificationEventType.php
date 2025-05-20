<?php
// src/Enum/NotificationEventType.php
namespace App\Enum;

class NotificationEventType
{
    public const REGISTRATION_CONFIRMATION = 'registration_confirmation';
    public const VEHICLE_RENTAL = 'vehicle_rental';
    public const PASSWORD_RESET = 'password_reset';
    // Ajoutez d'autres types d'événements au besoin
}