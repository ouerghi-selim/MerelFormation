# Workflows & Règles métiers

## Réservations formation — 19 statuts / 6 phases

**Phases (vision métier)**  
1. **Demande initiale** : `submitted`, `under_review`  
2. **Vérifications** : `awaiting_documents`, `documents_pending`, `documents_rejected`, `awaiting_prerequisites`  
3. **Financement** : `awaiting_funding`, `funding_approved`, `awaiting_payment`, `payment_pending`  
4. **Confirmation** : `confirmed`, `awaiting_start`  
5. **Formation** : `in_progress`, `attendance_issues`, `suspended`  
6. **Finalisation** : `completed`, `failed`, `cancelled`, `refunded`

**Règles**  
- Enum `ReservationStatus` en backend, transitions contrôlées par le serveur.  
- E‑mails automatiques par statut (templates + variables).  
- Espace étudiant : composant **ReservationStatusProgress** (compact & complet), filtrage par phase.

## Réservations véhicule — 12 statuts / 6 phases
Pipeline unifié de `submitted` → `refunded`, page de suivi client (timeline + prochaines étapes) et e‑mails dédiés.

## Inscription par étapes (+ employeur)
- Page `/setup-password` en 2 étapes : infos obligatoires → documents optionnels selon type de formation.  
- **Entreprise (optionnelle)** : création/réutilisation par **SIRET**, relation `User → Company (ManyToOne)`.

## Gestion documentaire (formations, sessions, inscription)
- **Upload temporaire** (`TempDocument`) → **finalisation** sur sauvegarde → **nettoyage auto** (>24h).  
- **Validation admin** : `en_attente` · `valide` · `rejete` (avec raison), blocage modification côté étudiant, e‑mails automatiques.  
- Page admin centralisée (vue globale, filtres, actions en masse, stats temps réel).

## RGPD & Archivage SoftDelete (Gedmo)
- Filtre `SoftDeleteableFilter` activé globalement (entités clés).  
- Restauration en cascade, logs, index `deletedAt`.

> Voir **Annexes** pour les extraits de configuration (YAML) et mapping de phases (TypeScript).