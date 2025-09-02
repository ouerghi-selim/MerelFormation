# Architecture fonctionnelle & Modèle de données

## Modules
- **Formations & sessions** : catalogue, prérequis, modules, planning, inscriptions, attestations PDF
- **Réservations** : workflows (formations : 19 statuts / 6 phases · véhicules : 12 statuts / 6 phases) + e‑mails
- **Parc véhicules** : réservation publique, disponibilités, tarification, facturation
- **Gestion documentaire** : upload temporaire → finalisation → nettoyage auto (>24h), téléchargement sécurisé, validation admin
- **Utilisateurs & RGPD** : rôles, auth, suppression à 3 niveaux, **SoftDelete Gedmo** global, restauration en cascade
- **CMS** : textes / témoignages / FAQ éditables, fallback, perf & cache
- **Notifications & e‑mails** : >36 templates HTML, WYSIWYG, variables contextuelles
- **Planning admin** : calendrier (sessions, examens), vues & formulaires

## Modèle de données (principales entités)
User · Company (employeur) · Formation · Category · Module · ModulePoint · Prerequisite · Session · Reservation · Center · Formula · Vehicle · VehicleRental · Payment · Invoice · Document · TempDocument · CalendarEvent · Notification · EmailTemplate · Media · Settings · ActivityLog · RefreshToken · CMS (ContentText, Testimonial, FAQ)

> Remarque : l’ancienne entité _ExamCenter_ est unifiée dans **Center** (source de vérité unique).