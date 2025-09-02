# API (extraits utiles)

## Public / Front
- `GET /api/formations`
- `GET /api/vehicles`
- `POST /api/reservations`
- `POST /api/contact`

## Admin / Gestion
- **Réservations (formations)** :  
  `GET /api/admin/reservation-statuses` · `GET /api/admin/reservation-transitions` · `PUT /api/admin/session-reservations/{id}/status`
- **Documents** :  
  `POST /admin/formations/{id}/documents` · `DELETE /admin/formations/{id}/documents/{documentId}` · `POST /admin/sessions/{id}/documents`  
  `PUT /api/admin/documents/{id}/validate` · `PUT /api/admin/documents/{id}/reject`  
  Centralisation : `GET /api/admin/users/inscription-documents`
- **Utilisateurs supprimés (RGPD)** :  
  `DELETE /admin/users/{id}` (niveau 1) · `POST /admin/users/{id}/restore` · `GET /admin/users/deleted`

## Étudiant
- `GET /student/dashboard`
- `GET /student/documents?source=formation|session|inscription`
- `GET /student/documents/{id}/download`

## CMS
- `GET /admin/content/texts`
- `GET /admin/testimonials`
- `GET /admin/faq`