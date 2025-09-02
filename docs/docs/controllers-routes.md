# Annexe — Controllers & Routes Map

> Cartographie des contrôleurs et endpoints *connus* (selon la doc nettoyée).  
> Objectif : aider un nouveau dev à trouver rapidement **qui gère quoi** côté backend.

## Vue d’ensemble
- **Namespaces** : `Api\`, `Admin\`, `Student\`, `CMS\`
- **Styles** : API REST/JSON (API Platform + contrôleurs dédiés), endpoints admin/étudiant spécifiques.

---

## A. API publique & utilitaires

```http
GET  /api/formations                     # Liste des formations
GET  /api/vehicles                       # Liste des véhicules
POST /api/reservations                   # Créer une réservation
POST /api/contact                        # Formulaire de contact (emails automatiques)
```
**Probables contrôleurs** : `Api\FormationController`, `Api\VehicleController`, `Api\ReservationController`, `Api\ContactController` (selon structure).

---

## B. Statuts & transitions (Réservations de formation)

```http
GET  /api/admin/reservation-statuses           # 19 statuts (métadonnées)
GET  /api/admin/reservation-transitions        # Transitions possibles
PUT  /api/admin/session-reservations/{id}/status   # MAJ statut (validation serveur)
```
**Contrôleurs** : `Admin\SessionReservationController` (MAJ statut), exposition via ressources/API dédiées.

---

## C. Documents (formation / session / inscription)

```http
# Gestion documents formation/session
POST   /admin/formations/{id}/documents
DELETE /admin/formations/{id}/documents/{documentId}
POST   /admin/sessions/{id}/documents
PUT    /admin/sessions/{id}                     # Mise à jour session (JSON)

# Documents d'inscription (centralisé)
GET /api/admin/users/inscription-documents      # Vue admin centralisée (+filtres)

# Étudiant (accès & téléchargement)
GET /student/documents?source=formation|session|inscription
GET /student/documents/{id}/download

# Admin (documents d'un utilisateur)
GET /api/admin/users/{id}/documents

# Validation / Rejet (workflow)
PUT /api/admin/documents/{id}/validate
PUT /api/admin/documents/{id}/reject
```
**Contrôleurs** :  
- `Admin\DocumentController` (validate/reject),  
- `Admin\UserAdminController` (documents d’un utilisateur, liste inscription-documents),  
- `Student\DocumentStudentController` (accès étudiant),  
- `Api\AuthController` (sauvegarde documents inscription lors de la finalisation).

---

## D. Inscription par étapes & Entreprise (Company)

```http
POST /api/registration                         # Demande (status: pending)
POST /api/auth/validate-setup-token            # Vérification token finalisation
POST /api/auth/complete-registration           # Finalisation (infos + docs + entreprise)
PUT  /admin/session-reservations/{id}/status   # Confirmation admin (pending→confirmed)
GET  /admin/users/students                     # Liste étudiants (+entreprise)
```
**Contrôleurs** :  
- `Api\AuthController` (validate-setup-token, complete-registration, gestion Company),  
- `Admin\UserAdminController` (liste étudiants enrichie).

---

## E. Utilisateurs supprimés (RGPD)

```http
DELETE /admin/users/{id}       # Suppression niveau 1 (désactivation 30j)
POST   /admin/users/{id}/restore
GET    /admin/users/deleted
```
**Contrôleur** : `Admin\UserAdminController` (+ commande CRON pour progression niveaux).

---

## F. Dashboards

```http
GET /admin/dashboard/stats     # Statistiques admin
GET /student/dashboard         # Statistiques étudiant
```
**Contrôleurs** : `Admin\DashboardAdminController`, `Student\DashboardStudentController`.

---

## G. CMS

```http
GET /admin/content/texts
GET /admin/testimonials
GET /admin/faq
```
**Contrôleurs** : `CMS\ContentTextAdminController`, `CMS\TestimonialAdminController`, `CMS\FAQAdminController`.

---

## H. Réservations véhicule (rappels)
- **Workflow 12 statuts / 6 phases** avec emails et page de suivi client.  
- Contrôleur **`Admin\ReservationAdminController`** : appels vers `NotificationService::notifyVehicleRentalStatusChange()` selon type d’entité (cohérence formations vs véhicules).

> ⚠️ Si vous ajoutez un nouveau domaine, dupliquez le style ci‑dessus : *liste brute des endpoints* + *contrôleur responsable*.