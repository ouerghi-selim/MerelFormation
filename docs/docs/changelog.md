# Journal des changements (2025)

## Septembre
### 🆕 Système de Suppression Forcée RGPD (Septembre 2025)
- **🚀 Suppression forcée d'utilisateurs** : bypass des délais RGPD pour cas exceptionnels
- **🛡️ Sécurité renforcée** : double confirmation avec saisie du nom complet
- **🔧 Gestion des contraintes FK** : désactivation temporaire pour éviter les erreurs SQL
- **📊 Nettoyage complet** : suppression cascade de toutes les relations (réservations, documents, factures)
- **📝 Logs d'audit** : traçabilité complète (admin, utilisateur, date, action)
- **🎨 Interface intégrée** : bouton conditionnel dans `/admin/users/students` → "Élèves supprimés"
- **⚙️ API Platform** : route `POST /api/admin/users/{id}/force-delete`
- **🧩 Composants réutilisés** : Modal, Button, Alert existants pour cohérence

### 🔐 Système de Reset de Mot de Passe
- **Interface complète** : pages `/forgot-password` et `/reset-password`
- **Sécurité avancée** : tokens expiration 1h, rate limiting, validation complexité
- **Emails professionnels** : template HTML avec variables dynamiques
- **Design moderne** : glassmorphism cohérent avec le site

### 🎨 Améliorations Login et Navigation
- **Page de connexion redesignée** : gradient background, glassmorphism
- **Header dynamique** : propriété `fullWidth` pour largeur adaptable
- **Footer intégré** : données CMS dynamiques pour cohérence
- **Messages de succès** : gestion des redirections après reset password

### 🏢 Système Entreprise (début septembre)
- **Système entreprise complet** : rattachement véhicules d'examen aux entreprises
- **Reconnaissance SIRET automatique** : API publique `/api/public/companies/check-siret/{siret}`
- **Interface admin entreprise** : section dédiée avec édition inline (bouton crayon)
- **Gestion des doublons** : évitement automatique des entreprises en double
- **Validation SIRET intelligente** : contrôleur custom permettant l'édition sans conflit
- **UX optimisée** : formulaires pré-remplis, reconnaissance instantanée, gestion d'erreurs

## Août
- Progression visuelle des statuts (Espace étudiant)
- Visualisation adaptative des documents
- Page admin « Documents d’inscription » (centralisée, actions en masse, stats)
- SoftDelete : unification du nom de filtre + tests complets
- Refonte édition réservation véhicule (données user centralisées)

## Juillet
- Statuts de réservations **(19)** + e‑mails associés
- Inscription en 2 étapes (tokens 64c, expiration 7j)
- Système **Entreprise/Employeur** (Company, SIRET)
- E‑mails véhicules **(12)**
- Icônes dynamiques (1000+)

## Juin
- Éditeur e‑mail WYSIWYG self‑hosted + variables intelligentes
- Refonte planning admin
- Corrections majeures uploads/documents/réservations
- RGPD 3 niveaux + interface utilisateurs supprimés