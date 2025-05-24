# MerelFormation - Brief Projet Complet

## 📋 Informations Générales

**Développeur Principal :** Selim OUERGHI (ouerghi-selim)  
**Repository :** https://github.com/ouerghi-selim/MerelFormation  
**Type :** Application de gestion de formations taxi + location de véhicules  
**Status :** 95% fonctionnel - Projet très avancé  
**Dernière mise à jour :** Mai 2025

## 🏗️ Architecture Technique

### Backend (Symfony 7.2)
```
- Framework : Symfony 7.2 LTS
- API : API Platform 4.0 
- Base de données : MySQL/PostgreSQL + Doctrine ORM 3.3
- Authentification : JWT (Lexik JWT Bundle) + Refresh Tokens
- Upload : VichUploaderBundle
- PDF : KnpSnappyBundle 
- Cache : Symfony HTTP Cache
- Mail : Symfony Mailer
- Calendrier : Tattali Calendar Bundle
- CORS : NelmioCorsBundle
- Tests : PHPUnit
```

### Frontend (React + TypeScript)
```
- Framework : React 18.3 + TypeScript
- Build : Vite 6.0
- Styling : Tailwind CSS 3.4
- Routing : React Router 6.22
- HTTP : Axios 1.6
- Icons : Lucide React
- Charts : Recharts 2.15
- Calendar : React Big Calendar
- Maps : Google Maps API
- Editor : TinyMCE React
- State : Context API + React Hooks
```

### Infrastructure
```
- Conteneurisation : Docker + Docker Compose
- Reverse Proxy : Nginx
- Environnements : dev, prod, test
- Déploiement : Scripts automatisés
- Monitoring : Logs configurés
```

## 🗄️ Structure de la Base de Données (22 Entités)

### Entités Principales
- **User** - Utilisateurs (admins, étudiants, instructeurs)
- **Formation** - Formations taxi (140h, 14h, recyclage)
- **Session** - Sessions de formation avec planning
- **Vehicle** - Véhicules du parc automobile
- **VehicleRental** - Réservations de véhicules
- **Payment** - Gestion des paiements
- **Invoice** - Facturation
- **Document** - Gestion documentaire

### Entités Support
- **Category** - Catégories de formations
- **Module** - Modules pédagogiques
- **ModulePoint** - Points de formation
- **Prerequisite** - Prérequis formations
- **Reservation** - Réservations génériques
- **CalendarEvent** - Événements calendrier
- **Notification** - Système de notifications
- **EmailTemplate** - Templates d'emails
- **Media** - Gestion des médias
- **Settings** - Configuration système
- **ActivityLog** - Logs d'activité
- **RefreshToken** - Tokens de rafraîchissement

## 🎛️ Contrôleurs Backend Existants

### API Controllers (/app/src/Controller/Api/)
- **AuthController** - Authentification JWT
- **FormationController** - CRUD formations
- **UserController** - Gestion utilisateurs
- **VehicleController** - CRUD véhicules
- **VehicleRentalController** - Gestion locations
- **ReservationController** - Système de réservation
- **StatisticsController** - Statistiques et métriques

### Admin Controllers (/app/src/Controller/Admin/)
- **DashboardAdminController** ✅ COMPLET
- **FormationAdminController** - Gestion formations
- **SessionAdminController** - Gestion sessions
- **UserAdminController** - Gestion utilisateurs
- **VehicleAdminController** - Gestion véhicules
- **ReservationAdminController** - Gestion réservations
- **EmailTemplateController** - Templates emails
- **SessionReservationController** - Réservations sessions

### Student Controllers (/app/src/Controller/Student/)
- **DashboardStudentController** ✅ COMPLET
- **FormationStudentController** - Formations étudiants
- **DocumentStudentController** - Documents étudiants
- **SessionStudentController** - Sessions étudiants

## 🖥️ Interface Frontend Existante

### Pages Publiques (/frontend/src/pages/)
- **home-page.tsx** - Page d'accueil
- **formations-page.tsx** - Catalogue formations
- **formation-detail-page.tsx** - Détails formation
- **location-page.tsx** - Location véhicules
- **contact-page.tsx** - Contact
- **login-page.tsx** - Connexion

### Dashboard Admin (/frontend/src/pages/admin/)
- **DashboardAdmin.tsx** ✅ COMPLET
- **FormationsAdmin.tsx** - Gestion formations
- **FormationNew.tsx** - Nouvelle formation
- **SessionsAdmin.tsx** - Gestion sessions
- **SessionNew.tsx** - Nouvelle session
- **StudentsAdmin.tsx** - Gestion étudiants
- **InstructorsAdmin.tsx** - Gestion instructeurs
- **AdminsAdmin.tsx** - Gestion admins
- **VehiclesAdmin.tsx** - Gestion véhicules
- **ReservationsAdmin.tsx** - Gestion réservations
- **EmailTemplatesAdmin.tsx** - Templates emails
- **EmailTemplateEdit.tsx** - Édition template
- **EmailTemplateNew.tsx** - Nouveau template
- **UsersAdmin.tsx** - Vue utilisateurs

### Dashboard Student (/frontend/src/pages/student/)
- **DashboardStudent.tsx** ✅ COMPLET
- **FormationsStudent.tsx** - Formations étudiant
- **FormationDetailStudent.tsx** - Détail formation
- **DocumentsStudent.tsx** - Documents étudiant

### Composants Organisés
```
/frontend/src/components/
├── admin/          # Composants admin
├── student/        # Composants étudiant
├── common/         # Composants partagés
├── charts/         # Graphiques
├── layout/         # Layouts
├── front/          # Interface publique
└── planning/       # Gestion planning
```

## 🌟 Fonctionnalités Implémentées

### ✅ Système de Formation
- Catalogue de formations taxi (Initiale 140h, Mobilité 14h, Recyclage)
- Gestion des sessions avec planning
- Inscription et suivi des étudiants
- Modules pédagogiques structurés
- Système de prérequis
- Génération de documents PDF
- Attestations de formation

### ✅ Location de Véhicules
- Parc automobile complet
- Réservation en ligne (public)
- Calendrier de disponibilité
- Gestion des tarifs
- Facturation automatique

### ✅ Gestion Utilisateurs
- Système de rôles (Admin, Student, Instructor)
- Authentification JWT sécurisée
- Profils utilisateurs
- Gestion des permissions

### ✅ Administration
- Dashboard avec statistiques
- Gestion complète des formations
- Suivi des réservations
- Gestion financière (factures, paiements)
- Système de notifications
- Templates d'emails personnalisables

### ✅ Interface Publique
- Site vitrine responsive
- Catalogue formations
- Système de contact
- Réservation véhicules sans compte

## 🔧 Environnement de Développement

### Structure des Dossiers
```
MerelFormation/
├── app/                    # Backend Symfony
│   ├── src/
│   │   ├── Controller/     # Contrôleurs
│   │   ├── Entity/         # Entités Doctrine
│   │   ├── Repository/     # Repositories
│   │   ├── Service/        # Services métier
│   │   └── ...
│   ├── config/             # Configuration
│   ├── migrations/         # Migrations DB
│   └── composer.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages
│   │   ├── services/       # Services API
│   │   ├── contexts/       # Context API
│   │   └── types/          # Types TypeScript
│   └── package.json
├── docker/                 # Configuration Docker
├── docker-compose.yml      # Orchestration
└── deploy.sh              # Script déploiement
```

### Branches Git Actives
- **main** - Branche principale
- **develop** - Développement
- **feature/add-dashboard-admin-student** - Dashboards
- **feature/notification-system** - Notifications
- **feature/api-controllers** - Contrôleurs API

## 🎯 État Actuel du Projet

### ✅ COMPLETEMENT FONCTIONNEL (95%)
- Architecture complète
- Backend API complet
- Dashboards admin et student opérationnels
- Interface publique complète
- Système d'authentification
- Gestion des formations
- Gestion des véhicules
- Système de réservation
- Facturation et paiements

### 🔄 EN COURS D'OPTIMISATION
- Performance frontend/backend
- UI/UX avancée
- Tests automatisés
- Documentation

### 💡 PROCHAINES ÉTAPES POSSIBLES
- Système de messagerie interne
- Notifications push temps réel
- Analytics avancés
- Intégrations tierces (CPF, Pôle Emploi)
- Mobile app
- Optimisations SEO

## 🚀 Comment Commencer

### Pour un Nouveau Développeur
1. **Cloner le repository :** `git clone https://github.com/ouerghi-selim/MerelFormation.git`
2. **Lancer Docker :** `docker-compose up -d`
3. **Backend :** `cd app && composer install`
4. **Frontend :** `cd frontend && npm install`
5. **Base de données :** `php bin/console doctrine:migrations:migrate`
6. **Fixtures :** `php bin/console doctrine:fixtures:load`

### APIs Principales
```
- GET /api/formations - Liste des formations
- GET /api/vehicles - Liste des véhicules  
- POST /api/reservations - Créer réservation
- GET /admin/dashboard/stats - Stats admin
- GET /student/dashboard - Stats étudiant
```

### Comptes de Test
- **Admin :** admin@merelformation.com
- **Student :** student@merelformation.com
- **Instructor :** instructor@merelformation.com

---

**💡 CONSEIL POUR FUTURES CONVERSATIONS :**
Copiez-collez ce brief au début de nouvelles conversations avec Claude pour qu'il comprenne immédiatement le contexte et l'état du projet sans avoir à refaire toute l'analyse.

**Dernière mise à jour :** Mai 2025 par Selim OUERGHI