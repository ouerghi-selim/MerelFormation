# MerelFormation - Brief Projet Complet

## 🏅 Informations Générales

**Développeur Principal :** Selim OUERGHI (ouerghi-selim)  
**Repository :** https://github.com/ouerghi-selim/MerelFormation  
**Type :** Application de gestion de formations taxi + location de véhicules  
**Status :** ✅ 100% FONCTIONNEL - Projet complet avec système d'inscription par étapes + Affichage documents d'inscription + Système d'entreprise/employeur + Validation documents avec emails + **🆕 Système de statuts de réservation professionnel (19 statuts formations + 12 statuts véhicules) avec emails automatiques + Workflow complet d'inscription + 🆕 Système de visualisation adaptative des documents par type de fichier**  
**Dernière mise à jour :** 21 Août 2025 - Optimisation code et modal étudiant réutilisable + Gestion statuts réservations complète

## 🖗️ Architecture Technique

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
- WYSIWYG : 🆕 TinyMCE React (Self-hosted Community Edition)
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
- Icons : Lucide React + 🆕 React Icons (Système dynamique 1000+ icônes)
- Charts : Recharts 2.15
- Calendar : React Big Calendar
- Maps : Google Maps API
- WYSIWYG : 🆕 TinyMCE React (Self-hosted Community Edition)
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

## 🗄️ Structure de la Base de Données (28 Entités)

### Entités Principales
- **User** - Utilisateurs (admins, étudiants, instructeurs)
- **🆕 Company** - Entreprises/employeurs avec informations complètes (SIRET, responsable, contact)
- **Formation** - Formations taxi (140h, 14h, recyclage)
- **Session** - Sessions de formation avec planning
- **🆕 Center** - Centres de formation et d'examen avec gestion géographique
- **Vehicle** - Véhicules du parc automobile
- **VehicleRental** - Réservations de véhicules
- **Payment** - Gestion des paiements
- **Invoice** - Facturation
- **Document** - Gestion documentaire
- **🆕 TempDocument** - Documents temporaires (architecture stateless)

### Entités Support
- **Category** - Catégories de formations
- **Module** - Modules pédagogiques
- **ModulePoint** - Points de formation
- **Prerequisite** - Prérequis formations
- **Reservation** - Réservations génériques
- **CalendarEvent** - Événements calendrier
- **Notification** - Système de notifications
- **EmailTemplate** - Templates d'emails (36 templates : 24 formations + 12 véhicules)
- **Media** - Gestion des médias
- **Settings** - Configuration système
- **ActivityLog** - Logs d'activité
- **RefreshToken** - Tokens de rafraîchissement

### 🆕 Entités CMS (Nouvelles)
- **ContentText** - Textes du site (titres, descriptions, boutons)
- **Testimonial** - Témoignages clients avec notation
- **FAQ** - Questions fréquentes organisées

## 🎛️ Contrôleurs Backend Existants

### API Controllers (/app/src/Controller/Api/)
- **AuthController** - Authentification JWT + 🆕 Finalisation d'inscription par étapes + 🆕 Gestion entreprises dans l'inscription
- **FormationController** - CRUD formations
- **UserController** - Gestion utilisateurs
- **VehicleController** - CRUD véhicules
- **VehicleRentalController** - Gestion locations
- **ReservationController** - Système de réservation
- **StatisticsController** - Statistiques et métriques

### Admin Controllers (/app/src/Controller/Admin/)
- **DashboardAdminController**  COMPLET
- **FormationAdminController** - Gestion formations
- **🆕 CenterAdminController** - Gestion centres de formation et d'examen
- **PracticalInfoController** - 🆕 Gestion parties pratiques multiples formations
- **ImageUploadController** - 🆕 Upload et gestion d'images formations
- **SessionAdminController** - Gestion sessions
- **UserAdminController** - Gestion utilisateurs
- **VehicleAdminController** - Gestion véhicules
- **ReservationAdminController** - Gestion réservations
- - **VehicleReservationDetail.tsx**  Page de détails complets des réservations véhicules
- **EmailTemplateController** - Templates emails
- **SessionReservationController** - Réservations sessions

### 🆕 CMS Controllers (Nouveaux)
- **ContentTextAdminController** - Gestion des textes du site
- **TestimonialAdminController** - Gestion des témoignages
- **FAQAdminController** - Gestion des FAQ

### Student Controllers (/app/src/Controller/Student/)
- **DashboardStudentController**
- **FormationStudentController** - Formations étudiants
- **DocumentStudentController** - Documents étudiants avec support documents d'inscription
- **SessionStudentController** - Sessions étudiants

## 🖥️ Interface Frontend Existante

### Pages Publiques (/frontend/src/pages/)
- **home-page.tsx** ✅ OPTIMISÉ CMS - Page d'accueil dynamique
- **formations-page.tsx** ✅ OPTIMISÉ CMS - Catalogue formations dynamique
- **formation-detail-page.tsx** - Détails formation
- **contact-page.tsx** - Contact
- **login-page.tsx** - Connexion

### Dashboard Admin (/frontend/src/pages/admin/)
- **DashboardAdmin.tsx** ✅ COMPLET
- **FormationsAdmin.tsx** ✅ OPTIMISÉ - Gestion formations avec navigation simplifiée
- **FormationDetail.tsx** ✅ NOUVEAU - Page détails complète avec onglets (Infos, Modules, Prérequis, Documents, Sessions)
- **FormationNew.tsx** ✅ AMÉLIORÉ - Création avec upload de documents intégré
- **🆕 CentersAdmin.tsx** ✅ NOUVEAU - Gestion centres de formation et d'examen avec CRUD complet
- **🆕 FormulasAdmin.tsx** ✅ NOUVEAU - Gestion formules par centre avec tarification
- **SessionsAdmin.tsx** ✅ AMÉLIORÉ - Gestion sessions avec documents et inspection complète
- **SessionNew.tsx** ✅ COMPLET - Création sessions avec upload de documents
- **StudentsAdmin.tsx** - Gestion étudiants avec affichage documents d'inscription + 🆕 Informations entreprise/employeur
- **InstructorsAdmin.tsx** - Gestion instructeurs
- **AdminsAdmin.tsx** - Gestion admins
- **VehiclesAdmin.tsx** - Gestion véhicules
- **ReservationsAdmin.tsx** - Gestion réservations
- **EmailTemplatesAdmin.tsx** ✅ UNIFORMISÉ - Utilise DataTable avancé + ActionMenu space-efficient
- **EmailTemplateEdit.tsx** 🆕 WYSIWYG PRO - Éditeur avancé avec variables intelligentes
- **EmailTemplateNew.tsx** 🆕 WYSIWYG PRO - Création avec système de variables
- **UsersAdmin.tsx** - Vue utilisateurs

### Planning Admin (/frontend/src/pages/planning/)
- **index.tsx** ✅ COMPLET - Planning calendrier intégré
- **EventForm.tsx** ✅ COMPLET - Formulaire événements avec gestion examens
- **usePlanningData.ts** ✅ COMPLET - Hook de gestion des données planning
- **types.ts** - Types TypeScript pour le planning
- **calendarConfig.ts** - Configuration du calendrier

### 🆕 CMS Admin (Nouvelles Pages) - UNIFORMISÉES AOÛT 2025
- **ContentTextsAdmin.tsx** ✅ COMPLET - Gestion des textes du site avec largeur fixe max-w-7xl
- **TestimonialsAdmin.tsx** ✅ UNIFORMISÉ - Utilise DataTable avancé + ActionMenu space-efficient
- **FAQAdmin.tsx** ✅ UNIFORMISÉ - Utilise DataTable avancé + ActionMenu space-efficient

### Dashboard Student (/frontend/src/pages/student/)
- **DashboardStudent.tsx** ✅ COMPLET + 🆕 Affichage informations entreprise/employeur
- **FormationsStudent.tsx** - Formations étudiant
- **FormationDetailStudent.tsx** - Détail formation
- **DocumentsStudent.tsx** ✅ OPTIMISÉ - Documents organisés par source (formation/session/inscription) avec filtrage avancé et téléchargement direct

### Composants Organisés
```
/frontend/src/components/
├── admin/          # Composants admin
├── student/        # Composants étudiant
├── common/         # Composants partagés
│   ├── WysiwygEditor.tsx      # Éditeur WYSIWYG TinyMCE
│   ├── 🆕 IconPicker.tsx      # Sélecteur d'icônes dynamique 1000+
│   ├── 🆕 DynamicIcon.tsx     # Affichage sécurisé d'icônes
│   ├── DataTable.tsx          # 🆕 Table de données avancée avec title, showSearch, searchPlaceholder
│   └── ActionMenu.tsx         # 🆕 Menu dropdown space-efficient pour actions
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
- **🆕 Système de statuts de réservation professionnel** - 19 statuts organisés en 6 phases (Demande → Vérifications → Financement → Confirmation → Formation → Finalisation)
- **🆕 Workflow d'inscription complet** - De la demande initiale jusqu'à l'obtention du certificat
- **🆕 Emails automatiques par statut** - Notifications personnalisées à chaque étape du processus
- **🆕 Badges dynamiques avec icônes** - Système d'icônes intelligent 1000+ options
- **🆕 Notifications emails automatiques** pour toutes les actions CRUD

### ✅ Location de Véhicules
- Parc automobile complet
- Réservation en ligne (public)
- Calendrier de disponibilité
- Gestion des tarifs
- Facturation automatique
- **🆕 Notifications de maintenance** avec alternatives automatiques
- **🆕 Système de statuts unifié** - 12 statuts organisés en 6 phases (submitted → refunded)
- **🆕 Emails automatiques véhicules** - Templates personnalisés pour chaque statut
- **🆕 Page de suivi client améliorée** - Progression visuelle avec phases et prochaines étapes
- **🆕 Messages personnalisés admin** - Section message personnalisé dans tous les emails
- **🆕 Interface WYSIWYG intégrée** - Variables contextuelles pour personnalisation des templates

### ✅ Gestion Utilisateurs (RGPD COMPLIANT)
- Système de rôles (Admin, Student, Instructor)
- Authentification JWT sécurisée
- Profils utilisateurs
- Gestion des permissions
- **🆕 Système de suppression à 3 niveaux RGPD** :
  - **Niveau 1** : Désactivation (récupérable pendant 30 jours)
  - **Niveau 2** : Anonymisation automatique (après 30 jours)
  - **Niveau 3** : Suppression définitive (après 1 an)
- **🆕 Interface admin des utilisateurs supprimés** avec deadlines visuels
- **🆕 Fonction de restauration** pour utilisateurs niveau 1
- **🆕 Commande automatisée** pour progression des niveaux
- **🆕 Emails de bienvenue** avec mots de passe temporaires
- **🆕 Notifications complètes** : modification, désactivation, restauration

### ✅ Système d'Entreprise/Employeur (NOUVEAU - Juillet 2025)
- **Section Entreprise Optionnelle** : Checkbox lors de l'inscription pour ajouter un employeur
- **Entité Company Complète** : Nom, adresse, code postal, ville, SIRET, responsable, email, téléphone
- **Validation SIRET** : Contrôle format (14 chiffres) et validation Symfony
- **Réutilisation Intelligente** : Entreprises existantes réutilisées automatiquement par SIRET
- **Relation User-Company** : ManyToOne permettant plusieurs employés par entreprise
- **Affichage Dashboard Étudiant** : Section entreprise avec design professionnel et icône Building2
- **Interface Admin Complète** : Informations entreprise dans modal détails étudiant
- **API Dédiée** : Endpoint `/admin/users/students` incluant données entreprise
- **Intégration Inscription** : Gestion entreprise dans AuthController avec validation complète
- **UX Cohérente** : Interface identique côté étudiant et administrateur

### ✅ Administration
- Dashboard avec statistiques
- Gestion complète des formations
- **Planning intégré avec calendrier visuel** 🆕
- **Gestion différentielle sessions/examens** 🆕
- Suivi des réservations
- **Page de détails complets réservations véhicules** 🆕
- Interface détaillée avec sections (Client, Réservation, Examen, Financier, Notes)
- Actions rapides intégrées (confirmer, annuler, assigner véhicule)
- Gestion financière (factures, paiements)
- Système de notifications
- Templates d'emails personnalisables

### ✅ Interface Publique
- Site vitrine responsive
- Catalogue formations
- **🆕 Système de contact complet** avec notifications automatiques
- Réservation véhicules sans compte
- **🆕 Accusés de réception** pour toutes les demandes

### 🆕 ✅ Système d'Icônes Dynamique (Nouveau - Juillet 2025)
- **Découverte Automatique** : Plus de 1000 icônes détectées automatiquement (FontAwesome, Material Design, Bootstrap)
- **Interface Moderne** : Modal élégante avec recherche, filtres par famille et aperçu en temps réel
- **Zéro Maintenance** : Aucune liste manuelle à maintenir, nouvelles icônes ajoutées automatiquement
- **Zéro Erreur d'Import** : Système de vérification garantit l'existence des icônes avant affichage
- **Performance Optimisée** : Cache intelligent et fallbacks sécurisés vers icône Clock
- **UX Intuitive** : Bouton simple "Choisir une icône" remplace l'interface complexe
- **Support Universel** : Compatible avec toutes les familles d'icônes React Icons
- **Affichage Sécurisé** : Composant DynamicIcon avec gestion d'erreurs automatique

### 🆕 ✅ Système CMS Complet (Nouveau)
- **Gestion des Textes** : Modification de tous les contenus du site (titres, descriptions, boutons)
- **Témoignages Dynamiques** : Ajout/modification des avis clients avec notation 5 étoiles
- **FAQ Interactive** : Questions fréquentes organisées par catégories avec réordonnancement
- **Interface Admin Intuitive** : Pages dédiées pour gérer le contenu sans compétences techniques
- **Fallbacks Sécurisés** : Contenu par défaut si l'API CMS est indisponible
- **Performance Optimisée** : Récupération des données en parallèle avec mise en cache
- **Migration Automatique** : Transfert des contenus en dur vers la base de données

### ✅ Gestion Documentaire Formations/Sessions (NOUVEAU)
- **Upload de documents par formation** - Les admins peuvent ajouter des documents spécifiques à chaque formation
- **Upload de documents par session** - Documents spécifiques aux sessions de formation
- **🆕 Système d'upload temporaire** - Architecture stateless avec entité TempDocument
- **🆕 Finalisation automatique** - Documents temporaires convertis en définitifs lors de la sauvegarde
- **🆕 Nettoyage automatique** - Suppression des fichiers temporaires anciens (>24h)
- **Organisation par source** - Documents organisés et filtrés par formation ou session
- **API étudiants optimisée** - Accès aux documents avec informations source (sourceTitle, sourceId)
- **Interface admin complète** - Gestion centralisée des documents dans les pages détails
- **Modal inspection sessions** - Section Documents ajoutée dans SessionsAdmin.tsx
- **Téléchargement sécurisé** - Contrôle d'accès basé sur les inscriptions confirmées
- **Filtrage avancé étudiant** - Filtrage par formation/session côté étudiant
- **Gestion d'erreurs robuste** - Upload avec types étendus (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
- **Routes API complètes** - AdminSessions.php avec endpoint `/admin/sessions/{id}/documents`
- **🆕 Validation précoce** - Vérification fichiers avant traitement pour éviter les erreurs
- **🆕 Gestion stateless** - Compatible avec l'architecture API Platform sans sessions

## 🧠 Environnement de Développement

### Structure des Dossiers
```
MerelFormation/
├── app/                      # Backend Symfony
│   ├── src/
│   │   ├── Controller/       # Contrôleurs
│   │   ├── Entity/           # Entités Doctrine
│   │   ├── Repository/       # Repositories
│   │   ├── Service/          # Services métier
│   │   └── ...
│   ├── config/               # Configuration
│   ├── migrations/           # Migrations DB
│   └── composer.json
├── frontend/                 # Frontend React
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── pages/            # Pages
│   │   ├── services/         # Services API
│   │   ├── contexts/         # Context API
│   │   └── types/            # Types TypeScript
│   └── package.json
├── docker/                   # Configuration Docker
├── docker-compose.yml        # Orchestration
└── deploy.sh                 # Script déploiement
```

### Branches Git Actives
- **main** - Branche principale
- **develop** - Développement
- **feature/cms-content-management** ✅ COMPLET - Système CMS intégré
- **feature/notification-system** - Notifications
- **feature/api-controllers** - Contrôleurs API

## 🏆 État Actuel du Projet

### ✅ COMPLETEMENT FONCTIONNEL (100%) 🚀
- Architecture complète
- Backend API complet avec corrections critiques ✅
- Dashboards admin et student opérationnels
- Interface publique complète
- **Planning administrateur avancé avec calendrier** 🆕
- Système d'authentification
- Gestion des formations avec upload documents ✅
- Gestion des véhicules
- **Système de réservation avec confirmations API réelles** ✅ CORRIGÉ
- Facturation et paiements
- **🆕 Système CMS complet et opérationnel**
- **🆕 Gestion documentaire formations/sessions complète et debuggée** ✅ FINALISÉ
- **🆕 Système d'inscription en deux étapes** ✅ NOUVEAU (Juillet 2025)
- **🆕 25 templates email avec demande d'inscription** ✅ NOUVEAU (Juillet 2025)
- **🆕 Affichage des documents d'inscription** ✅ NOUVEAU (Juillet 2025)
- **🆕 Validation documents d'inscription avec emails** ✅ NOUVEAU (19 Juillet 2025)
- **🆕 Système de statuts de réservation professionnel** ✅ NOUVEAU (20 Juillet 2025) - 19 statuts en 6 phases avec emails automatiques

### 🆕 DERNIÈRES AMÉLIORATIONS CRITIQUES (Juin 2025) ✅ TERMINÉ
- **🆕 Éditeur Email WYSIWYG Professionnel** - Remplacement textarea HTML par TinyMCE React
- **🆕 Système Variables Intelligent** - Variables contextuelles par type d'événement
- **🆕 Interface Admin Avancée** - Bouton Variables, surbrillance, prévisualisation
- **🆕 TinyMCE Auto-hébergé** - Évite les frais d'abonnement, self-hosted gratuit
- **🆕 Prévisualisation Intelligente** - Affiche uniquement les variables réellement utilisées
- **🆕 Mapping Hybride** - Entité EmailTemplate + fallback mapping statique
- **Planning Admin** - Calendrier intégré avec React Big Calendar
- **Gestion Examens** - Différentiation sessions/examens dans le planning
- **Bug Fixes** - Corrections SessionAdminController pour mise à jour
- **UX Planning** - Interface intuitive avec gestion des événements
- **Refactoring** - Optimisation du code frontend planning
- **Page Détails Réservations** - Interface complète pour visualiser toutes les informations d'une réservation véhicule
- **Modal Amélioré** - Bouton "Voir détails complets" ajouté pour navigation fluide
- **UX Réservations** - Workflow optimisé avec vue rapide (modal) + vue complète (page dédiée)
- **Pages Admin Optimisées** - FormationDetail avec onglets, SessionNew complète
- **Upload Intégré** - Gestion documents dans création formations/sessions
- **Navigation Simplifiée** - Remplacement modals complexes par pages dédiées
- **UX Documents** - Interface étudiant repensée avec organisation par source
- **Filtrage Intelligent** - Recherche et filtres avancés côté étudiant
- **Sécurité Renforcée** - Contrôle d'accès documents basé sur inscriptions
- **🆕 Notifications d'ajout** - Emails automatiques lors d'ajout de documents
- **🆕 Système Upload Temporaire** - Architecture stateless avec entité TempDocument
- **🆕 Upload Robuste** - Validation précoce et gestion d'erreurs améliorée
- **🆕 Migration Automatique** - Base de données mise à jour automatiquement
- **🆕 Upload fichiers volumineux** - Support jusqu'à 100MB (Nginx + PHP + Symfony)
- **🆕 Système suppression RGPD 3 niveaux** - Conformité totale avec interface admin
- **🆕 Routes API corrigées** - Plus de conflits 404 sur endpoints critiques
- **🆕 Service notifications complet** - Toutes les méthodes implémentées

### 🆕 CORRECTIONS CRITIQUES (Juin 2025) ✅ TERMINÉ
- **🆕 Bug Réservations Corrigé** - ReservationsAdmin.tsx : Ajout appels API manquants dans `handleReservationStatusChange`
- **🆕 API Formations Complétée** - api.ts : Ajout `uploadDocument` et `deleteDocument` manquants dans `adminFormationsApi`
- **🆕 Routes Backend Ajoutées** - AdminFormations.php : uriTemplate `/admin/formations/{id}/documents` (POST/DELETE)
- **🆕 Format Date Corrigé** - FormationAdminController.php : Format ISO pour dates + gestion taille fichiers
- **🆕 Suppression Documents Robuste** - FormationAdminController.php : Try-catch avec `entityManager->clear()` anti-conflit
- **🆕 Upload Display Fix** - FormationDetail.tsx : Protection `document.type?.toUpperCase()` contre undefined
- **🆕 Système Documentaire Finalisé** - Upload formations/sessions avec validation complète
- **🆕 Interface Upload Intégrée** - FormData dans FormationNew.tsx et SessionNew.tsx
- **🆕 API Documents Sessions** - Endpoint POST `/admin/sessions/{id}/documents` ajouté
- **🆕 Contrôle Accès Documents** - Vérification basée sur réservations confirmées
- **🆕 Download Sécurisé** - Utilisation de `$this->file()` Symfony avec token
- **🆕 Modal Session Complet** - Section Documents dans inspection SessionsAdmin.tsx
- **🆕 Bug Fixes Documents** - Corrections DocumentStudentController accumulation
- **🆕 NOUVEAUX BUGS CRITIQUES CORRIGÉS (Juin 2025)** :
  - **Upload fichiers 100MB** - Limites Nginx (100M) + PHP (100M) + VichUploader (100M) + validation backend
  - **Suppression utilisateurs RGPD** - Système 3 niveaux : désactivation → anonymisation → suppression
  - **Interface utilisateurs supprimés** - Page admin avec deadlines, niveaux et fonction restauration
  - **Routes API conflictuelles** - `/api/admin/users/deleted` corrigé (plus de 404)
  - **Service notifications** - Méthode `notifyUserReactivated` ajoutée avec constante
  - **🆕 Bug Centres Inactifs** - CenterAdminController retourne maintenant tous les centres (actifs + inactifs)
  - **🆕 Bug Format Response** - Harmonisation format API pour éviter erreur `centers.filter is not a function`
  - **🆕 Bug Formules Modal** - Ajout groupes sérialisation `center:read` dans entité Formula
  - **🆕 Bug Controllers Formules** - Migration ExamCenter → Center dans FormulaAdminController et Repository
  - **🆕 Bug Notifications Formules** - Correction `addNotification` → `addToast` dans FormulasAdmin.tsx
  - **🆕 Bug Modal Fermeture** - Fermeture automatique modal formules après sauvegarde réussie

### 🆕 ✅ CORRECTIONS MAJEURES SYSTÈME SESSIONS & INSTRUCTEURS (Juin 2025 - DERNIÈRE MAJ)
- **🆕 Bug Suppression Sessions** - SessionAdminController.php : Suppression correcte des réservations et documents avant suppression session
- **🆕 Contraintes FK Résolues** - Gestion des contraintes de clés étrangères dans suppression sessions avec transaction
- **🆕 Champ Spécialisation Instructeurs** - Entity/User.php : Ajout champ `specialization` avec migration base de données
- **🆕 Retour API Instructeurs Complet** - UserAdminController.php : Retour des données complètes après création (plus de ligne vide)
- **🆕 Gestion Spécialisation Backend** - UserAdminController.php : Méthodes create/update/list incluent maintenant la spécialisation
- **🆕 Migration Base Données** - Version20250630210929.php : `ALTER TABLE user ADD specialization VARCHAR(255)`
- **🆕 Messages d'Erreur Précis** - InstructorsAdmin.tsx : Extraction des vrais messages API ("Cet email est déjà utilisé")
- **🆕 Utilitaire Gestion Erreurs** - errorUtils.ts : Fonction `getErrorMessage()` réutilisable pour extraction messages API
- **🆕 Interface Admin Améliorée** - Plus de rechargement de page requis après ajout instructeur
- **🆕 Spécialisations Fonctionnelles** - Sauvegarde et affichage des spécialisations instructeurs enfin opérationnels

### 🆕 ✅ SYSTÈME D'EMAILS AUTOMATIQUES & WYSIWYG COMPLET (Janvier 2025)
- **36 Templates d'emails professionnels** - HTML avec CSS inline pour compatibilité maximale (24 formations + 12 véhicules)
- **19 Event Types** - Couvrant formations, sessions, utilisateurs, véhicules, documents, contacts + vehicle_rental_status_updated
- **Notifications ciblées par rôle** - Admin, Étudiant, Instructeur selon le contexte
- **Variables dynamiques** - Personnalisation complète avec `{{nom}}`, `{{formation}}`, etc.
- **Contrôleurs mis à jour** - Tous les CRUD déclenchent les emails appropriés
- **Service de contact** - Système complet avec accusé de réception automatique
- **Emails de bienvenue** - Mots de passe temporaires pour nouveaux utilisateurs
- **Notifications de maintenance** - Véhicules indisponibles avec alternatives
- **Gestion d'erreurs robuste** - Fallbacks et logging complets
- **Design cohérent** - Charte graphique MerelFormation respectée
- **🆕 Éditeur WYSIWYG Professionnel** - TinyMCE React auto-hébergé (gratuit)
- **🆕 Système de variables intelligent** - Bouton Variables avec menu déroulant
- **🆕 Variables contextuelles** - Variables adaptées au type d'événement automatiquement
- **🆕 Prévisualisation intelligente** - Affichage uniquement des variables utilisées
- **🆕 Surbrillance automatique** - Variables {{}} mises en évidence dans l'éditeur
- **🆕 Mapping développeur** - Variables contrôlées par le code, pas par les admins
- **🆕 Système hybride** - Utilise les variables de l'entité en priorité + fallback mapping

### 🆕 Dernières Améliorations (Juillet 2025)

#### **🆕 Système d'Emails Véhicules Complet (29 Juillet 2025) - PRODUCTION READY**
- **12 Templates Email Véhicules** - Templates personnalisés pour chaque statut (submitted, under_review, awaiting_documents, documents_pending, documents_rejected, awaiting_payment, payment_pending, confirmed, in_progress, completed, cancelled, refunded)
- **Architecture Unifiée** - Séparation correcte entre `NotificationService::notifyReservationStatusChange()` (formations) et `NotificationService::notifyVehicleRentalStatusChange()` (véhicules)
- **Variables Contextuelles 40+** - Variables spécifiques véhicules : vehicleModel, examCenter, rentalDates, pickupLocation, totalPrice, trackingUrl, emergencyPhone, etc.
- **Page de Suivi Améliorée** - RentalTrackingPage.tsx avec progression visuelle 6 phases, timeline détaillée, prochaines étapes automatiques
- **Messages Personnalisés** - Section message conditionnel {{#if message}} dans tous les templates avec design professionnel
- **WYSIWYG Intégré** - Variables véhicules ajoutées à l'éditeur TinyMCE avec suggestions contextuelles pour event_type `vehicle_rental_status_updated`
- **Migration Automatique** - Migration `Version20250729235000.php` pour mise à jour des templates existants
- **Fixtures Corrigées** - VehicleRentalEmailTemplateFixtures.php avec variable 'message' pour nouveaux déploiements
- **Controller Unifié** - ReservationAdminController corrigé pour appeler la bonne méthode de notification selon le type d'entité
- **Email Automatique** - Envoi automatique lors des changements de statut via interface admin avec messages personnalisés optionnels

**Fichiers Clés Modifiés :**
- `app/src/DataFixtures/VehicleRentalEmailTemplateFixtures.php` - 12 nouveaux templates
- `app/src/Service/NotificationService.php` - Méthode notifyVehicleRentalStatusChange() + variable message
- `app/src/Controller/Admin/ReservationAdminController.php` - Correction appel méthode véhicules  
- `frontend/src/components/common/WysiwygEditor.tsx` - Variables véhicules + mapping vehicle_rental_status_updated
- `frontend/src/services/vehicleRentalTrackingService.ts` - Système progression 6 phases
- `frontend/src/pages/RentalTrackingPage.tsx` - Interface progression visuelle améliorée
- `app/migrations/Version20250729235000.php` - Migration ajout sections message existantes

**Architecture Finale :**
```php
// FORMATIONS : SessionReservationController
notifyReservationStatusChange(Reservation $reservation, ...)

// VÉHICULES : ReservationAdminController  
notifyVehicleRentalStatusChange(VehicleRental $rental, ...)
```

### 🆕 Améliorations Antérieures (Juillet 2025)

#### **🆕 Système d'Affichage Documents d'Inscription (17 Juillet 2025) - NOUVEAU**
- **Problème résolu**: Les documents uploadés pendant l'inscription étaient invisibles pour les utilisateurs et administrateurs
- **Backend AuthController**: Sauvegarde des documents comme entités Document avec catégorie 'attestation'
- **API DocumentStudentController**: Support source 'inscription' avec contrôle d'accès basé sur ownership
- **API UserAdminController**: Endpoint `/admin/users/{id}/documents` pour accès administrateur
- **Frontend DocumentsStudent**: Filtre "Documents d'inscription" ajouté avec affichage cohérent
- **Frontend StudentsAdmin**: Section documents dans modal détails utilisateur avec téléchargement
- **Téléchargement direct**: URLs `/uploads/documents/{fileName}` pour tous types d'utilisateurs
- **Sécurité**: Vérification ownership documents d'inscription (user === document.user && document.uploadedBy === user)
- **Architecture stateless**: Compatible avec système TempDocument et API Platform
- **UX cohérente**: Interface identique pour documents formation/session/inscription

**Fichiers clés modifiés:**
- `app/src/Controller/Api/AuthController.php` - Sauvegarde documents inscription
- `app/src/Controller/Student/DocumentStudentController.php` - Support source inscription + téléchargement direct
- `app/src/Controller/Admin/UserAdminController.php` - API admin documents utilisateur  
- `frontend/src/pages/student/DocumentsStudent.tsx` - Filtre inscription + URLs directes
- `frontend/src/pages/admin/StudentsAdmin.tsx` - Section documents modal
- `frontend/src/services/api.ts` - Endpoint admin documents utilisateur

#### **🆕 Système d'Inscription par Étapes avec Entreprise (15 Juillet 2025) - NOUVEAU**
- **Page de Finalisation `/setup-password`**: Interface professionnelle en 2 étapes inspirée du formulaire de réservation
- **Étape 1 - Informations Obligatoires**: Mot de passe (8+ chars), date/lieu naissance, adresse complète
- **🆕 Section Entreprise Optionnelle**: Checkbox "ajouter une partie employeur" avec tous les champs entreprise
- **Étape 2 - Documents Optionnels**: Upload selon type formation (INITIALE→permis, MOBILITÉ→carte pro, etc.)
- **Système de Tokens Sécurisés**: Tokens 64 chars stockés en base avec expiration 7 jours
- **Validation Multi-niveaux**: Token + email + expiration avec suppression après usage
- **🆕 Gestion Entreprise**: Création/réutilisation entreprises par SIRET avec validation complète
- **Workflow Complet**: Demande → Confirmation admin → Email lien → Finalisation → Connexion
- **UX Professionnel**: Stepper visuel, validation temps réel, bypass documents optionnels
- **API AuthController**: Routes `/auth/validate-setup-token` et `/auth/complete-registration` + gestion entreprise
- **Entité User Étendue**: Champs `setupToken` et `setupTokenExpiresAt` avec méthodes validation
- **🆕 Entité Company**: Relation ManyToOne avec User pour gestion employeurs
- **Intégration NotificationService**: Génération automatique tokens lors confirmation

#### **🆕 Système d'Icônes Dynamique Révolutionnaire**
- **Découverte automatique de 1000+ icônes** (FontAwesome, Material Design, Bootstrap)
- **Interface moderne** avec recherche et filtres par famille 
- **Zéro maintenance** - plus de listes manuelles à maintenir
- **Zéro erreur d'import** - vérification automatique de l'existence
- **Composants IconPicker et DynamicIcon** pour UX optimale
- **Remplacement interface complexe** par bouton simple "Choisir une icône"

#### **🆕 Autres Améliorations**
- **🆕 Système Parties Pratiques Dynamiques**: Parties pratiques multiples par formation avec contenu riche
- **🆕 Système Upload d'Images**: Upload professionnel avec validation et stockage
- **🆕 Correction Affichage Images**: Configuration Docker nginx pour servir les images correctement  
- **🆕 Affichage Parties Pratiques Multiples**: Interface publique avec design alterné
- **🆕 Unification Formulaires Sessions**: Formulaires calendrier et création unifiés
- **🆕 Système de Gestion des Centres**: Centres de formation et d'examen unifiés avec CRUD complet
- **🆕 Gestion Géographique**: Centres organisés par ville, département et type (formation/examen/mixte)
- **🆕 Système de Formules**: Gestion des formules centre par centre avec tarification
- **🆕 Integration Planning**: Centres intégrés dans le système de planning et sessions
- **🆕 Remplacement ExamCenter → Center**: Migration complète vers entité Center unifiée
- **🆕 Affichage Centres Inactifs**: Interface admin montre tous les centres (actifs et inactifs)
- **🆕 Formules dans Modal Centres**: Affichage correct des formules liées avec groupes de sérialisation
- **🆕 CRUD Formules Fonctionnel**: Correction des controllers et repositories pour Center
- **🆕 UX Modal Formules**: Fermeture automatique après sauvegarde avec notifications

### 🆕 Corrections Techniques Détaillées (Juin 2025 - Session Finale)

#### **Fichiers Backend Modifiés :**
- **app/src/Entity/User.php** : Ajout champ `specialization VARCHAR(255)` avec Groups de sérialisation
- **app/src/Controller/Admin/UserAdminController.php** : Gestion spécialisation dans create/update/list + retour API complet
- **app/src/Controller/Admin/SessionAdminController.php** : Suppression séquentielle réservations/documents avec transaction
- **app/migrations/Version20250630210929.php** : Migration `ALTER TABLE user ADD specialization`

#### **Fichiers Frontend Modifiés :**
- **frontend/src/pages/admin/InstructorsAdmin.tsx** : Messages d'erreur précis + gestion spécialisation
- **frontend/src/utils/errorUtils.ts** : 🆕 Utilitaire extraction messages API avec priorités
- **frontend/src/pages/admin/FormulasAdmin.tsx** : Correction messages erreur (déjà implémenté)

#### **Architecture Améliorée :**
- **Gestion Erreurs** : Fonction `getErrorMessage()` centralise l'extraction des messages API
- **Base Données** : Champ spécialisation ajouté avec migration automatique
- **API Cohérence** : Retour complet des données après création utilisateur
- **UX Sessions** : Suppression robuste avec gestion contraintes FK

### 🔧 EN COURS D'OPTIMISATION
- Performance frontend/backend
- UI/UX avancée
- Tests automatisés
- Documentation
- ~~Système documentaire avancé~~ ✅ **TERMINÉ**
- ~~Bugs critiques upload/réservations~~ ✅ **CORRIGÉS**

### 💡 PROCHAINES ÉTAPES POSSIBLES
- Système de messagerie interne
- Notifications push temps réel
- Analytics avancés
- Intégrations tierces (CPF, Pôle Emploi)
- Mobile app
- Optimisations SEO
- **Versioning documents** - Gestion des versions multiples
- **Recherche full-text** - Indexation contenu documents
- **Catégorisation avancée** - Tags et métadonnées documents

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

🆕 CMS APIs:
- GET /admin/content-texts - Gestion textes
- GET /admin/testimonials - Gestion témoignages
- GET /admin/faq - Gestion FAQ

🆕 Contact API (NOUVEAU):
- POST /api/contact - Soumission formulaire de contact avec emails automatiques

🆕 Gestion Documents (COMPLET et CORRIGÉ):
- POST /admin/formations/{id}/documents - Upload documents formation (FormData)
- DELETE /admin/formations/{id}/documents/{documentId} - Suppression robuste avec try-catch
- POST /admin/sessions/{id}/documents - Upload documents session avec validation  
- GET /student/documents?source=formation|session - Documents filtrés par source
- GET /student/documents/{id}/download - Téléchargement sécurisé Symfony
- PUT /admin/sessions/{id} - Mise à jour session (JSON)

🆕 Upload Temporaire (NOUVEAU):
- POST /admin/documents/temp-upload - Upload temporaire avec entité TempDocument
- DELETE /admin/documents/temp/{tempId} - Suppression document temporaire
- POST /admin/documents/finalize - Finalisation lors sauvegarde formation/session
- POST /admin/documents/cleanup-temp - Nettoyage automatique fichiers anciens

🆕 Gestion Utilisateurs RGPD (NOUVEAU):
- DELETE /admin/users/{id} - Suppression niveau 1 (désactivation récupérable 30j)
- POST /admin/users/{id}/restore - Restauration utilisateurs niveau 1
- GET /admin/users/deleted - Liste utilisateurs supprimés avec deadlines
- Commande automatique progression niveaux (anonymisation + suppression définitive)

🆕 Réservations API (CORRIGÉ):
- PUT /admin/reservations/{id}/status - Mise à jour statut (maintenant avec appel API réel)
- PUT /admin/session-reservations/{id}/status - Confirmation inscriptions sessions

🆕 Inscription par Étapes API (NOUVEAU - Juillet 2025):
- POST /api/registration - Demande d'inscription (status: pending, email: demande reçue)
- PUT /admin/session-reservations/{id}/status - Confirmation admin (pending→confirmed, email: inscription confirmée + URL)
- POST /api/auth/validate-setup-token - Validation token de finalisation (sécurité)
- POST /api/auth/complete-registration - Finalisation inscription avec informations + documents optionnels

🆕 Affichage Documents d'Inscription API (NOUVEAU - Juillet 2025):
- GET /student/documents?source=inscription - Documents d'inscription avec filtrage
- GET /admin/users/{id}/documents - Documents d'inscription d'un utilisateur (admin)
- Téléchargement direct via URLs: /uploads/documents/{fileName}

🆕 Système d'Entreprise/Employeur API (NOUVEAU - Juillet 2025):
- GET /admin/users/students - Liste étudiants avec données entreprise incluses
- POST /api/auth/complete-registration - Finalisation inscription avec données entreprise optionnelles
- Company Entity: Validation SIRET, réutilisation par SIRET, relation User ManyToOne
- Endpoints intégrés: Pas de CRUD séparé, gestion via inscription et affichage

🆕 Validation Documents d'Inscription API (NOUVEAU - 19 Juillet 2025):
- PUT /api/admin/documents/{id}/validate - Validation document avec email automatique
- PUT /api/admin/documents/{id}/reject - Rejet document avec raison obligatoire + email
- GET /api/admin/users/{id}/documents - Documents utilisateur avec statuts validation
- Email Templates: document_validated et document_rejected avec variables dynamiques
- Statuts: en_attente (défaut), valide (approuvé), rejete (refusé avec raison)

🆕 Emails Automatiques (NOUVEAU):
Tous les endpoints CRUD déclenchent maintenant des emails automatiques:
- 🆕 Inscriptions: Demande → Email "demande reçue" | Confirmation → Email "inscription confirmée" + URL finalisation
- 🆕 Finalisation: Page `/setup-password` sécurisée avec tokens expirables (7 jours)
- Formations: Création/Modification/Suppression → Notifications ciblées  
- Sessions: Création/Modification/Annulation → Participants concernés
- Utilisateurs: Création/Modification/Désactivation → Emails personnalisés
- Véhicules: Ajout/Maintenance → Notifications avec alternatives
- Documents: Ajout → Étudiants concernés par formation/session
```

### Comptes de Test
- **Admin :** admin@merelformation.com
- **Student :** student@merelformation.com
- **Instructor :** instructor@merelformation.com

### 🆕 URLs CMS (Nouvelles)
- **Textes du site :** `/admin/content/texts`
- **Témoignages :** `/admin/content/testimonials`
- **FAQ :** `/admin/content/faq`

---

## 🎊 NOUVEAU : Autonomie Complète de Contenu

Grâce au système CMS intégré, **les administrateurs peuvent désormais modifier tout le contenu du site** (textes, témoignages, FAQ) **sans intervention technique**, offrant une **autonomie totale** pour la gestion de contenu avec **fallbacks sécurisés** et **performances optimisées**.

Grâce au **système de détails complets des réservations**, **les administrateurs peuvent désormais visualiser et gérer toutes les informations** d'une réservation véhicule dans une **interface dédiée et intuitive**, offrant une **vue d'ensemble complète** avec **actions rapides intégrées** et **navigation fluide** entre vue rapide (modal) et vue détaillée (page).

**🔧 BUGS CRITIQUES RÉSOLUS (Juin 2025) :**
1. **Réservations** - Confirmations maintenant persistées en base de données
2. **Upload Documents** - API formations complètement fonctionnelle
3. **Suppression Documents** - Plus d'erreurs de validation après suppression
4. **Affichage Documents** - Plus d'erreurs JavaScript après upload
5. **Routes Backend** - Tous les endpoints documentaires opérationnels
6. **🆕 Architecture Stateless** - Système d'upload temporaire compatible API Platform
7. **🆕 Validation Précoce** - Plus d'erreurs "stat failed" lors de l'upload
8. **🆕 Migration Automatique** - Base de données mise à jour pour TempDocument
9. **🆕 SUPPRESSION RGPD 3 NIVEAUX** - Système professionnel de gestion utilisateurs supprimés
10. **🆕 UPLOAD FICHIERS VOLUMINEUX** - Support complet 100MB avec limites système harmonisées
11. **🆕 INTERFACE ADMIN SUPPRESSION** - Page dédiée avec deadlines et fonction restauration
12. **🆕 ROUTES API CORRIGÉES** - Plus d'erreurs 404 sur endpoints critiques
13. **🆕 NOTIFICATIONS COMPLÈTES** - Tous les services d'email implémentés
14. **🆕 SUPPRESSION SESSIONS FK** - Résolution contraintes clés étrangères avec suppression séquentielle
15. **🆕 SPÉCIALISATIONS INSTRUCTEURS** - Champ specialization ajouté + migration + frontend fonctionnel
16. **🆕 LIGNES VIDES INSTRUCTEURS** - Retour API complet après création (plus de rechargement requis)
17. **🆕 MESSAGES ERREUR PRÉCIS** - Extraction vrais messages API avec utilitaire errorUtils.ts
18. **🆕 AFFICHAGE DOCUMENTS INSCRIPTION** - Système complet de visualisation et téléchargement des documents uploadés pendant l'inscription
19. **🆕 SYSTÈME ENTREPRISE/EMPLOYEUR** - Section employeur optionnelle complète avec gestion SIRET et affichage intégré
20. **🆕 VALIDATION DOCUMENTS INSCRIPTION** - Système complet de validation/rejet des documents d'inscription avec emails automatiques

**💡 CONSEIL POUR FUTURES CONVERSATIONS :**
Copiez-collez ce brief au début de nouvelles conversations avec Claude pour qu'il comprenne immédiatement le contexte et l'état du projet sans avoir à refaire toute l'analyse.

**Dernière mise à jour :** 20 Juillet 2025 par Selim OUERGHI

## 🆕 NOUVEAU : Système de Statuts de Réservation Professionnel (20 Juillet 2025)

### 🎯 **Fonctionnalité Demandée**
Améliorer le système de statuts des réservations de formation qui était trop basique (pending, confirmed, cancelled, completed) pour un workflow professionnel d'inscription.

### 🚀 **Solution Implémentée**

#### **19 Statuts Organisés en 6 Phases**

**Phase 1 - Demande Initiale :**
- `submitted` - Demande soumise
- `under_review` - En cours d'examen

**Phase 2 - Vérifications Administratives :**
- `awaiting_documents` - En attente de documents
- `documents_pending` - Documents en cours de vérification
- `documents_rejected` - Documents refusés
- `awaiting_prerequisites` - En attente de prérequis

**Phase 3 - Validation Financière :**
- `awaiting_funding` - En attente de financement
- `funding_approved` - Financement approuvé
- `awaiting_payment` - En attente de paiement
- `payment_pending` - Paiement en cours

**Phase 4 - Confirmation :**
- `confirmed` - Confirmée
- `awaiting_start` - En attente de début

**Phase 5 - Formation en Cours :**
- `in_progress` - En cours
- `attendance_issues` - Problèmes d'assiduité
- `suspended` - Suspendue

**Phase 6 - Finalisation :**
- `completed` - Terminée
- `failed` - Échouée
- `cancelled` - Annulée
- `refunded` - Remboursée

#### **Architecture Backend (Symfony)**
- **Enum ReservationStatus** : 19 constantes avec méthodes utilitaires
- **Entity Reservation** : Validation Symfony avec les nouveaux statuts
- **Migration** : Mise à jour automatique des anciens statuts (`pending` → `submitted`)
- **Controllers** : Validation des transitions sans restrictions (changement libre)
- **API Resources** : Endpoints séparés pour statuts et transitions
- **Service Email** : Intégration avec système d'emails automatiques existant

#### **Interface Frontend (React + TypeScript)**
- **Utility reservationStatuses.ts** : Fonctions d'affichage et couleurs
- **ReservationsAdmin.tsx** : Dropdowns interactifs pour changement de statut
- **DashboardAdmin.tsx** : Affichage des nouveaux statuts dans les statistiques
- **API Integration** : Appels aux nouveaux endpoints pour récupérer statuts/transitions

### 🎨 **Fonctionnalités Clés**

#### **Gestion des Couleurs par Phase**
```typescript
// Codes couleur par phase
- Phase 1-2: Orange (en cours d'examen)
- Phase 3: Bleu (financier)
- Phase 4: Vert (confirmé)
- Phase 5: Violet (formation)
- Phase 6: Gris/Rouge (finalisé)
```

#### **Transitions Validées**
- **Système intelligent** de transitions logiques entre statuts
- **Validation côté serveur** pour éviter les incohérences
- **Endpoints dédiés** pour obtenir les transitions possibles

#### **Intégration Emails Automatiques**
- **Templates dédiés** pour chaque nouveau statut
- **Variables contextuelles** avec informations de réservation
- **Notifications ciblées** selon le destinataire (étudiant/admin)

### 🔧 **API Endpoints Ajoutés**
```php
// Nouveaux endpoints pour le système de statuts
GET /api/admin/reservation-statuses        // Liste des 19 statuts avec infos
GET /api/admin/reservation-transitions     // Transitions possibles par statut
PUT /api/admin/session-reservations/{id}/status  // Mise à jour avec validation
```

### 🎯 **Impact Business & UX**

#### **Avant (Problématique) :**
```
pending → confirmed → completed ❌
(Workflow trop simpliste pour un processus d'inscription complexe)
```

#### **Après (Professionnel) :**
```
submitted → under_review → awaiting_documents → documents_pending 
→ awaiting_funding → funding_approved → awaiting_payment 
→ confirmed → in_progress → completed ✅
(Workflow complet reflétant la réalité du processus)
```

### 📊 **Avantages**
- **Suivi précis** : Localisation exacte de chaque dossier dans le processus
- **Communication claire** : Étudiants informés de l'étape en cours
- **Gestion administrative** : Identification rapide des blocages
- **Professionnalisation** : Workflow digne d'un organisme de formation
- **Emails contextuels** : Notifications adaptées à chaque étape
- **Flexibilité** : Changement libre entre statuts pour situations exceptionnelles

### 🏆 **Résultats**
- **✅ Workflow Complet** : 19 statuts couvrant tout le processus d'inscription
- **✅ Interface Moderne** : Dropdowns colorés avec changement en temps réel
- **✅ Backend Robuste** : Validation et gestion d'erreurs complète
- **✅ Emails Automatiques** : Integration transparente avec système existant
- **✅ Migration Sans Risque** : Mise à jour automatique des données existantes
- **✅ API Documentée** : Endpoints clairs avec réponses structurées

Ce système transforme MerelFormation d'une application basique vers une **plateforme professionnelle de gestion des inscriptions** avec un suivi précis et une communication automatisée à chaque étape.

## 🆕 NOUVEAU : Système d'Entreprise/Employeur Complet (Juillet 2025)

### 🎯 **Fonctionnalité Demandée**
Permettre aux étudiants d'ajouter les informations de leur entreprise/employeur lors de l'inscription, car parfois les formations sont payées par l'entreprise.

### 🚀 **Solution Implémentée**

#### **Backend (Symfony)**
- **Entité Company** : Nom, adresse, code postal, ville, SIRET, responsable, email, téléphone
- **Validation SIRET** : Contrôle format 14 chiffres + validation Symfony
- **Relation User-Company** : ManyToOne avec Company (plusieurs employés par entreprise)
- **Réutilisation Intelligente** : Entreprises existantes réutilisées automatiquement par SIRET
- **Migration Base** : `Version20250718153XXX.php` - Création table company + foreign key
- **API AuthController** : Gestion entreprise dans finalisation inscription
- **API UserAdminController** : Endpoint `/admin/users/students` avec données entreprise
- **Repository Company** : Méthode `findBySiret()` pour recherche et réutilisation

#### **Frontend (React + TypeScript)**
- **Page SetupPasswordPage** : Section entreprise optionnelle avec checkbox
- **Validation Complète** : Tous les champs entreprise validés quand section activée
- **Dashboard Étudiant** : Section entreprise professionnelle avec icône Building2
- **Interface Admin** : Informations entreprise dans modal détails étudiant
- **API Service** : Utilisation endpoint `/admin/users/students` pour données complètes
- **TypeScript** : Interfaces Company et User étendues

### 🎨 **Interfaces Utilisateur**

#### **Inscription (SetupPasswordPage)**
```typescript
// Section optionnelle avec checkbox
{formData.hasEmployer && (
  <div className="ml-7 space-y-6 bg-gray-50 p-6 rounded-lg border">
    <h3 className="text-lg font-semibold text-gray-900">
      Informations de l'employeur
    </h3>
    // Tous les champs entreprise avec validation
  </div>
)}
```

#### **Dashboard Étudiant**
```typescript
// Section entreprise professionnelle
{dashboardData?.user?.company && (
  <div className="bg-white p-6 rounded-lg shadow mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
      <Building2 className="h-6 w-6 mr-2 text-blue-600" />
      Mon entreprise
    </h2>
    // Affichage en colonnes avec toutes les informations
  </div>
)}
```

#### **Interface Admin**
```typescript
// Modal détails étudiant
{selectedStudent.company && (
  <div className="border-t border-gray-200 mt-6 pt-6">
    <h4 className="font-medium mb-4 flex items-center">
      <Building2 className="h-5 w-5 mr-2 text-blue-600" />
      Entreprise / Employeur
    </h4>
    // Grid avec informations générales et contact responsable
  </div>
)}
```

### 🔧 **Architecture Technique**

#### **Base de Données**
```sql
-- Table company
CREATE TABLE company (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  siret VARCHAR(14) NOT NULL UNIQUE,
  responsable_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL
);

-- Foreign key dans user
ALTER TABLE user ADD COLUMN company_id INT,
ADD CONSTRAINT FK_user_company 
FOREIGN KEY (company_id) REFERENCES company(id);
```

#### **Workflow Inscription**
1. **Étudiant** coche "ajouter une partie employeur"
2. **Formulaire** affiche section entreprise avec tous les champs
3. **Validation** contrôle format SIRET et champs obligatoires
4. **Backend** vérifie si entreprise existe déjà par SIRET
5. **Création/Réutilisation** - Nouvelle entreprise ou liaison existante
6. **Affichage** - Informations visibles côté étudiant et admin

### 📊 **Impact Business**
- **Gestion Employeurs** : Suivi des entreprises qui financent les formations
- **Évite Duplications** : Réutilisation automatique des entreprises existantes
- **Visibilité Admin** : Informations entreprise dans interface de gestion
- **Simplicité UX** : Section optionnelle, pas de complexité supplémentaire
- **Données Complètes** : Toutes les informations nécessaires pour facturation

### 🎯 **Résultats**
- **✅ Système Complet** : Inscription, stockage, affichage, gestion
- **✅ Interface Intuitive** : Checkbox simple pour activer/désactiver
- **✅ Validation Robuste** : Contrôles SIRET et données obligatoires
- **✅ Réutilisation Intelligente** : Évite les doublons d'entreprises
- **✅ Affichage Professionnel** : Dashboard étudiant et interface admin
- **✅ API Cohérente** : Endpoints spécialisés avec données complètes

Ce système transforme MerelFormation en une solution complète de gestion des formations avec suivi des employeurs financeurs.

## 🆕 NOUVEAU : Système de Validation des Documents d'Inscription (Juillet 2025)

### 🎯 **Fonctionnalité Demandée**
Permettre aux administrateurs de valider ou rejeter les documents d'inscription uploadés par les étudiants, avec blocage de modification une fois validés et notifications email automatiques.

### 🚀 **Solution Implémentée**

#### **Backend (Symfony)**
- **Entity Document étendue** : Ajout champs `validationStatus`, `validatedAt`, `validatedBy`, `rejectionReason`
- **Migration Base** : `Version20250719104605.php` - Nouveaux champs de validation
- **DocumentController** : Endpoints `/api/admin/documents/{id}/validate` et `/api/admin/documents/{id}/reject`
- **NotificationService** : Méthodes `notifyDocumentValidated()` et `notifyDocumentRejected()`
- **Templates Email** : Migration `Version20250719203158.php` avec templates HTML professionnels
- **API UserAdminController** : Endpoint `/api/admin/users/{id}/documents` retourne statuts validation

#### **Frontend (React + TypeScript)**
- **Interface Admin** : Boutons validation/rejet dans StudentsAdmin.tsx avec modales
- **Statuts Visuels** : Badges colorés (orange: en attente, vert: validé, rouge: rejeté)
- **Blocage Étudiant** : Documents validés non modifiables côté étudiant
- **API Integration** : `documentsApi.validateDocument()` et `documentsApi.rejectDocument()`
- **UX Complète** : Modales de confirmation avec raison de rejet obligatoire

### 🎨 **Workflow de Validation**

#### **Statuts Disponibles**
```typescript
// Statuts possibles
'en_attente'  // Document uploadé, en attente de validation
'valide'      // Document approuvé par admin/instructeur  
'rejete'      // Document refusé avec raison détaillée
```

#### **Interface Admin (StudentsAdmin.tsx)**
```typescript
// Boutons conditionnels selon statut
{document.validationStatus === 'en_attente' && (
  <>
    <button onClick={() => validateDocument(document.id)} 
            className="bg-green-600 hover:bg-green-700">
      ✅ Valider
    </button>
    <button onClick={() => openRejectModal(document)}
            className="bg-red-600 hover:bg-red-700">
      ❌ Rejeter
    </button>
  </>
)}
```

#### **Restrictions Étudiants**
```typescript
// Blocage modification documents validés
const canUploadRegistrationDocument = () => {
  return !existingDocument || existingDocument.validationStatus !== 'valide';
};
```

### 📧 **Templates Email Automatiques**

#### **Template Validation (`document_validated`)**
- **Design** : Vert avec félicitations et confirmation officielle
- **Variables** : `{{studentName}}`, `{{documentTitle}}`, `{{validatedBy}}`, `{{validatedDate}}`, `{{loginUrl}}`
- **Contenu** : Message positif avec lien vers espace étudiant

#### **Template Rejet (`document_rejected`)**
- **Design** : Rouge avec explications et encouragements
- **Variables** : `{{studentName}}`, `{{documentTitle}}`, `{{rejectedBy}}`, `{{rejectedDate}}`, `{{rejectionReason}}`, `{{loginUrl}}`
- **Contenu** : Raison détaillée du rejet avec lien pour correction

### 🔧 **Architecture Technique**

#### **Base de Données (Entity Document)**
```sql
-- Nouveaux champs ajoutés
ALTER TABLE document ADD COLUMN validation_status VARCHAR(20) DEFAULT 'en_attente';
ALTER TABLE document ADD COLUMN validated_at DATETIME DEFAULT NULL;
ALTER TABLE document ADD COLUMN validated_by INT DEFAULT NULL;
ALTER TABLE document ADD COLUMN rejection_reason TEXT DEFAULT NULL;
```

#### **API Endpoints**
```php
// Validation d'un document
PUT /api/admin/documents/{id}/validate
// Headers: Authorization: Bearer {token}
// Response: Document avec statut mis à jour + email envoyé

// Rejet d'un document  
PUT /api/admin/documents/{id}/reject
// Body: {"reason": "Raison du rejet"}
// Response: Document avec statut rejeté + email envoyé
```

#### **Integration EmailService**
```php
// Utilisation du système existant
$this->emailService->sendTemplatedEmailByEventAndRole(
    $student->getEmail(),
    NotificationEventType::DOCUMENT_VALIDATED,
    'ROLE_STUDENT',
    $variables
);
```

### 🎯 **Impact Business & UX**

#### **Contrôle Qualité**
- **Validation manuelle** des documents par équipe pédagogique
- **Traçabilité complète** : qui a validé/rejeté et quand
- **Raisons détaillées** pour les rejets avec aide à la correction

#### **Expérience Utilisateur**
- **Statuts visuels clairs** pour étudiants et admins
- **Notifications automatiques** à chaque étape
- **Blocage intelligent** évite modifications accidentelles
- **Interface intuitive** avec actions contextuelles

#### **Efficacité Administrative**
- **Workflow structuré** pour validation en masse
- **Emails automatiques** réduisent charge administrative  
- **Historique complet** pour audits et suivi qualité

### 📊 **Résultats**
- **✅ Système Complet** : Validation, rejet, blocage, notifications
- **✅ Templates Professionnels** : Emails HTML avec charte graphique cohérente
- **✅ UX Optimale** : Interface admin intuitive avec actions rapides
- **✅ Intégration Parfaite** : Compatible avec système email existant
- **✅ Sécurité** : Validation côté backend avec contrôles d'accès
- **✅ Extensible** : Architecture prête pour d'autres types de documents

Ce système professionnalise la gestion des documents d'inscription en ajoutant un contrôle qualité rigoureux avec communication automatisée.

**🎯 NOUVELLES FONCTIONNALITÉS AJOUTÉES (Août 2025) :**
- **🆕 Système Page de Modification Réservation Véhicule Complet** - Interface administrative complète pour modifier tous les aspects d'une réservation véhicule
- **🆕 Données Centralisées User** - Réorganisation complète pour éliminer la duplication des données client (clientName/user.firstName)
- **🆕 Formulaires d'Édition Dynamiques** - Modification par section avec pré-remplissage automatique des données existantes
- **🆕 Système de Gestion de Factures** - Integration upload/téléchargement factures dans section financière comme document standard
- **🆕 API Backend Uniformisée** - Structure cohérente avec données client centralisées dans objet user uniquement
- **🆕 Centres d'Examen et Formules Dynamiques** - Remplacement listes statiques par données dynamiques depuis API `/api/centers/with-formulas`
- **🆕 Système d'Inscription par Étapes** - Interface professionnelle `/setup-password` en 2 étapes avec validation sécurisée
- **🆕 Tokens de Finalisation** - Système de tokens 64 chars avec expiration 7 jours et validation multi-niveaux
- **🆕 Documents Conditionnels** - Upload optionnel selon type formation (INITIALE→permis, MOBILITÉ→carte pro)
- **🆕 Workflow Complet** - Demande → Confirmation admin → Email lien → Finalisation → Connexion
- **🆕 API AuthController Étendue** - Routes validation token et completion registration avec gestion fichiers
- **Système d'Icônes Dynamique** - Découverte automatique de 1000+ icônes avec interface moderne
- **Documents publics** - Accès aux documents de formation sans authentification
- **Sessions enrichies** - Affichage conditionnel avec toutes les informations (lieu, instructeurs, participants)
- **UX améliorée** - Interface plus riche et informative avec sélecteur d'icônes intuitif
- **APIs cohérentes** - Formats de données harmonisés entre public et admin
- **Templates Email Avancés** - 25 templates avec nouveau template de demande d'inscription

## 🆕 NOUVEAU : Système d'Emails Automatiques & WYSIWYG Complet

**FONCTIONNALITÉS MAJEURES AJOUTÉES (Janvier 2025) :**

Le projet MerelFormation dispose maintenant d'un **système d'emails automatiques complet et professionnel** + **éditeur WYSIWYG avancé** qui transforment l'expérience utilisateur :

### 📧 **27 Templates d'Emails Professionnels** (Mis à jour 19 Juillet 2025 - Validation Documents)
- **Design HTML responsive** avec CSS inline
- **Charte graphique cohérente** MerelFormation
- **Variables dynamiques** personnalisées (`{{userName}}`, `{{formationTitle}}`, etc.)
- **Notifications ciblées** par rôle (Admin, Étudiant, Instructeur)

### 🚀 **Déclencheurs Automatiques** (Mis à jour Juillet 2025)
- **🆕 Inscriptions** : Demande → Email "demande reçue" | Confirmation admin → Email "inscription confirmée" + URL mot de passe
- **Formations** : Création → Admins + Instructeurs | Modification → Étudiants inscrits | Suppression → Étudiants avec alternatives
- **Sessions** : Création → Tous étudiants | Modification → Participants | Annulation → Participants avec reprogrammation
- **Utilisateurs** : Création → Email de bienvenue + mot de passe temporaire | Modification → Utilisateur | Désactivation → Utilisateur
- **Véhicules** : Ajout → Admins | Maintenance → Clients affectés avec alternatives
- **Documents** : Ajout → Étudiants concernés par formation/session
- **Contacts** : Demande → Admins + accusé de réception client

### 🎯 **Impact Business**
- **Communication automatisée** pour toutes les actions importantes
- **Réduction drastique** de la charge administrative
- **Expérience utilisateur** considérablement améliorée
- **Professionnalisation** des échanges avec les clients

### 🆕 **Éditeur WYSIWYG Professionnel**
- **TinyMCE React auto-hébergé** - Self-hosted Community Edition (gratuit)
- **Système de variables intelligent** - Bouton "Variables" avec menu déroulant contextuel
- **Variables par eventType** - 21 types d'événements avec variables spécifiques
- **Surbrillance automatique** - Variables {{}} mises en évidence en bleu
- **Prévisualisation intelligente** - Affiche uniquement les variables réellement utilisées
- **Système hybride** - Variables de l'entité + fallback mapping statique
- **Interface admin moderne** - Remplacement du textarea basique par un éditeur professionnel

### 🆕 **Impact UX/UI**
- **Facilité d'utilisation** drastiquement améliorée pour les admins
- **Prévention d'erreurs** - Variables contrôlées par le développeur
- **Interface moderne** - Passage de HTML brut à WYSIWYG professionnel
- **Gain de temps** - Insertion variables en 1 clic

Le système est **immédiatement opérationnel** après rechargement des fixtures et fonctionne de manière transparente avec l'infrastructure existante.

## 🆕 DERNIÈRES AMÉLIORATIONS (Juillet 2025)

### 📄 **Documents Publics sur Pages Formation**
- **Accès public aux documents** - Documents de formation accessibles sans authentification
- **API publique** - Endpoints `/api/formations/{id}/documents` et téléchargement direct
- **Affichage automatique** - Section "Documents de formation" sur pages publiques
- **Filtrage intelligent** - Seuls les documents non-privés sont affichés
- **UX améliorée** - Téléchargement en un clic avec informations détaillées

### 🎛️ **Section Sessions Enrichie (Admin)**
- **Affichage conditionnel intelligent** - Icônes n'apparaissent que si données disponibles
- **Informations complètes** - Location, participants, instructeurs avec spécialisations
- **API backend enrichie** - FormationAdminController retourne toutes les données nécessaires
- **Interface utilisateur améliorée** - Centres, instructeurs multiples, comptage participants
- **Badges instructeurs** - Spécialisations colorées avec support multiple instructeurs
- **Lieux intelligents** - Priorité centre d'examen/formation puis location manuelle

### 🎯 **Améliorations Techniques**
- **Données sessions complètes** - Location, participantsCount, center, instructors
- **Compatibilité maintenue** - Support ancien système instructeur unique
- **API cohérente** - Formats identiques entre API publique et admin
- **TypeScript enrichi** - Interfaces mises à jour avec propriétés optionnelles
- **Affichage conditionnel** - Plus d'icônes vides ou d'informations manquantes

### 📊 **Impact Business**
- **Transparence accrue** - Documents formation accessibles publiquement
- **Gestion avancée** - Visualisation complète des sessions en administration
- **Expérience utilisateur** - Interface plus riche et informative
- **Efficacité administrative** - Toutes les informations sessions en un coup d'œil

## 🆕 RÉVOLUTION UX : Système d'Icônes Dynamique (Juillet 2025)

### 🎯 **Problème Résolu**
L'ancien système d'icônes nécessitait :
- **Listes manuelles** de 100+ icônes à maintenir
- **Erreurs d'import fréquentes** (`BsBookOpen does not exist`)  
- **Maintenance constante** à chaque ajout d'icône
- **Interface complexe** avec catégories difficiles à gérer

### 🚀 **Solution Révolutionnaire**
**Composants Créés :**
- **`IconPicker.tsx`** - Sélecteur intelligent avec découverte automatique
- **`DynamicIcon.tsx`** - Affichage sécurisé avec cache et fallbacks

**Fonctionnalités Clés :**
- **Découverte automatique** via `Object.entries()` - 1000+ icônes détectées
- **Zéro maintenance** - nouvelles icônes ajoutées automatiquement
- **Zéro erreur d'import** - vérification d'existence garantie  
- **Interface moderne** - modal avec recherche, filtres, aperçu temps réel
- **Performance optimisée** - cache intelligent et fallbacks Clock

### 🎨 **Impact UX**
**Avant :**
```typescript
// Interface complexe avec listes manuelles et erreurs
const faIconNames = ['FaUser', 'FaUsers', 'FaBrokenIcon']; // Risque d'erreur !
```

**Après :**
```typescript
// Découverte automatique sans erreur possible
const allIcons = Object.entries(FaIcons).filter(([name, component]) => 
  typeof component === 'function'
);
```

**Interface Admin :**
- **Avant** : Grille complexe avec 4 familles à gérer manuellement
- **Après** : Bouton simple "Choisir une icône" → Modal professionnelle

### 🏆 **Résultats**
- **100% fiable** - Plus d'erreurs d'import possibles
- **Évolutif** - Support automatique nouvelles icônes React Icons
- **Maintenable** - Zéro code à maintenir pour les icônes
- **Moderne** - UX comparable aux standards professionnels (Figma, Notion)

Ce système transforme la gestion d'icônes de **corvée technique** en **expérience utilisateur fluide** tout en éliminant définitivement les erreurs d'import.

## 🆕 NOUVEAU : Système d'Inscription en Deux Étapes (Juillet 2025)

### 🎯 **Problème Résolu**
L'ancien système d'inscription envoyait immédiatement un email de confirmation, même si l'inscription devait être validée par un administrateur. Cela créait de la confusion pour les utilisateurs.

### 🚀 **Solution Professionnelle**
**Nouveau Workflow d'Inscription :**

#### **Étape 1 : Demande d'Inscription**
- Utilisateur remplit le formulaire d'inscription
- **Statut** : `pending` (en attente)
- **Email automatique** : "Demande d'inscription reçue" (`registration_request_student`)
- **Contenu** : Confirmation de réception + prochaines étapes + délai de traitement

#### **Étape 2 : Validation Administrateur**
- Admin/Instructeur examine la demande
- **Action** : Clic sur bouton "Confirmer l'inscription"
- **Statut** : `pending` → `confirmed`
- **Email automatique** : "Inscription confirmée" (`registration_confirmation_student`)
- **Contenu** : Confirmation officielle + **URL sécurisée** pour définir mot de passe

### 🛠️ **Implémentation Technique**

#### **Backend Modifié :**
- **`NotificationEventType.php`** : Nouveau type `REGISTRATION_REQUEST`
- **`SessionStudentController.php`** : Utilise `notifyAboutRegistrationRequest()`
- **`SessionReservationController.php`** : Envoie confirmation uniquement si statut change
- **`NotificationService.php`** : Nouvelles méthodes séparées pour demande/confirmation
- **`EmailTemplate` Entity** : Ajout champs `created_at` et `updated_at`

#### **Templates Email :**
- **`registration_request_student`** : Template demande d'inscription
- **`registration_confirmation_student`** : Template amélioré avec URL `{{passwordSetupUrl}}`

#### **Variables Email Enrichies :**
```php
// Template demande
['studentName', 'formationTitle', 'sessionDate', 'location', 'reservationId']

// Template confirmation  
['studentName', 'formationTitle', 'sessionDate', 'location', 'price', 'passwordSetupUrl']
```

### 🎯 **Impact Business & UX**

#### **Avant (Problématique) :**
```
Utilisateur s'inscrit → Email "Inscription confirmée" ❌
↓
Confusion : "Suis-je vraiment inscrit ?"
```

#### **Après (Professionnel) :**
```
Utilisateur s'inscrit → Email "Demande reçue" ✅
↓ (Admin valide)
Email "Inscription confirmée" + URL finalisation ✅
```

### 🔧 **Bénéfices**
- **Clarté totale** : Utilisateur sait exactement où il en est
- **Contrôle admin** : Validation manuelle des inscriptions
- **Expérience fluide** : URL directe pour finaliser l'inscription
- **Sécurité renforcée** : Token unique pour définition mot de passe
- **Communication transparente** : Emails explicites à chaque étape

### 📊 **Migrations Déployées**
- **`Version20250714154152.php`** : Ajout champs `created_at/updated_at` à `EmailTemplate`
- **`Version20250714151818.php`** : Création template demande + amélioration confirmation

Cette évolution professionnalise le processus d'inscription en alignant la communication avec le workflow réel de validation.

## 🆕 NOUVEAU : Unification Complète de l'Architecture Centers (Juillet 2025)

### 🎯 **Problème Résolu**
L'architecture avait une duplication entre les entités `ExamCenter` et `Center`, créant des conflits et une complexité de maintenance. Le système utilisait deux entités distinctes pour gérer les centres d'examen et de formation.

### 🚀 **Solution Implémentée**

#### **Migration Complète vers Architecture Unifiée**
- **Suppression définitive** de l'entité `ExamCenter` et `ExamCenterRepository`
- **Migration des données** : Conservation des centres d'examen dans `Center` avec `type='exam'`
- **Unification des contrôleurs** : Remplacement de `PublicExamCenterController` par `CenterController` + `FormulaController`
- **Nettoyage des endpoints** : Modernisation de `/api/exam-centers` vers `/api/centers`

#### **Architecture Backend Modernisée**
- **Entité Center Unifiée** : Support `type='formation'|'exam'|'both'`
- **CenterRepository Enrichi** : Toutes les méthodes de l'ancien `ExamCenterRepository` intégrées
- **FormulaController Dédié** : API spécialisée pour la gestion des formules
- **Migration Base de Données** : `Version20250729073248.php` - Suppression table `exam_center`

#### **API Cohérente et Moderne**
```php
// Nouveaux endpoints unifiés
GET /api/centers                    // Liste des centres
GET /api/centers/with-formulas      // Centres avec formules
GET /api/centers/{id}/formulas      // Formules d'un centre
GET /api/formulas                   // Liste des formules
GET /api/formulas/grouped-by-center // Formules groupées
```

#### **CenterRepository Complet**
Toutes les méthodes de l'ancien `ExamCenterRepository` préservées et améliorées :
- ✅ `findActive()` - Centres actifs
- ✅ `findExamCentersWithFormulas()` - Centres d'examen avec formules (+ filtrage formules actives)
- ✅ `findForAdmin()` - Interface admin avec recherche (+ paramètre type optionnel)
- ✅ `findOneByCode()` - Recherche par code
- ✅ `countTotal()` / `countActive()` - Statistiques (+ paramètre type optionnel)
- 🆕 Méthodes bonus : `findForFormations()`, `findByCity()`, `findByTypeAndDepartment()`

### 🔧 **Fichiers Supprimés**
- ❌ `app/src/Entity/ExamCenter.php`
- ❌ `app/src/Repository/ExamCenterRepository.php`
- ❌ `app/src/Controller/Api/PublicExamCenterController.php`
- ❌ `app/src/DataFixtures/ExamCenterFixtures.php`
- ❌ `app/src/ApiResource/PublicExamCenter.php`

### 🎯 **Impact Business & Technique**

#### **Simplification Architecturale**
- **31 entités** au lieu de 32 (ExamCenter supprimé)
- **Une seule source de vérité** pour les centres
- **Code plus maintenable** sans duplication
- **Performance améliorée** sans jointures entre tables dupliquées

#### **API Moderne et Cohérente** 
- **Endpoints logiques** : `/api/centers` et `/api/formulas`
- **Contrôleurs spécialisés** : Séparation claire centres/formules
- **Documentation API** mise à jour dans `PublicCenters.php`
- **Rétrocompatibilité** : Anciens endpoints maintenus temporairement

#### **Sécurité des Données**
- **Migration réversible** : Possibilité de rollback complet
- **Données préservées** : 9 formules toujours liées correctement
- **IDs conservés** : Aucune rupture de liens existants
- **Tests réussis** : Validation complète du schéma Doctrine

### 📊 **Résultats**
- **✅ Architecture Unifiée** : Une seule entité `Center` pour formation + examen
- **✅ API Moderne** : Endpoints cohérents et logiques
- **✅ Code Propre** : Suppression de tout le code legacy
- **✅ Fonctionnalités Préservées** : Aucune perte de fonctionnalité
- **✅ Performance Optimisée** : Requêtes simplifiées
- **✅ Maintenabilité** : Architecture claire et extensible

Cette unification transforme MerelFormation d'une architecture dupliquée vers une **solution moderne, cohérente et maintenable** tout en préservant toutes les fonctionnalités existantes.

## 🆕 NOUVEAU : Système de Visualisation Adaptative des Documents (Août 2025)

### 🎯 **Problème Résolu**
L'ancien système affichait tous les documents comme des images, causant des erreurs de visualisation pour les PDF, documents Word/Excel et autres formats non-images.

### 🚀 **Solution Implémentée**

#### **Architecture de Détection Intelligente**
- **`imageUtils.ts`** - Utilitaires de détection et configuration centralisée
- **`FileDisplay.tsx`** - Composant réutilisable pour affichage adaptatif
- **`api.ts`** - Configuration `mediaBaseURL` centralisée pour flexibilité environnements

#### **Détection Automatique par Extension**
```typescript
// Formats supportés avec icônes et couleurs spécifiques
- Images: JPG, JPEG, PNG, GIF, WEBP → Prévisualisation + miniature
- PDF: Icône rouge + "Document PDF"
- Word: DOC, DOCX → Icône bleue + "Document Word"  
- Excel: XLS, XLSX → Icône verte + "Feuille Excel"
- Texte: TXT → Icône grise + "Document texte"
- Autres: Extension détectée → Icône générique
```

### 🎨 **Interface Utilisateur**

#### **Pour les Images (JPEG, PNG, etc.)**
- ✅ **Miniature cliquable** : Aperçu visuel direct
- ✅ **Zoom interactif** : Clic → ouverture en plein écran
- ✅ **Bouton téléchargement** : Bleu avec icône

#### **Pour les PDF et Autres Documents**
- ✅ **Grande icône colorée** : Rouge pour PDF, bleu pour Word, etc.
- ✅ **Informations détaillées** : Type + nom du fichier + extension
- ✅ **Prévisualisation** : Clic → ouverture dans navigateur/lecteur approprié
- ✅ **Bouton téléchargement** : Couleur adaptée au type

### 🔧 **Configuration Technique**

#### **Gestion Environnements avec `mediaBaseURL`**
```bash
# Développement
VITE_MEDIA_URL="" → URLs relatives '/uploads/licenses/file.pdf'

# Production CDN
VITE_MEDIA_URL="https://cdn.merelformation.com" 
→ 'https://cdn.merelformation.com/uploads/licenses/file.pdf'
```

#### **Composant Réutilisable**
```typescript
<FileDisplay
  fileName="document.pdf"
  baseUrl="/uploads/licenses" 
  title="Permis de conduire - Recto"
  showDownload={true}
/>
```

### 🎯 **Intégration Pages Existantes**

#### **Page Admin (`VehicleReservationDetail.tsx`)**
- ✅ Documents de permis avec visualisation adaptative
- ✅ Section séparée "Documents de permis" vs "Autres documents"
- ✅ Interface cohérente avec design existant

#### **Page Tracking Public (`RentalTrackingPage.tsx`)**
- ✅ Documents de permis pour utilisateurs finaux
- ✅ Design attractif avec dégradés colorés conservés
- ✅ Fonctionnalité prévisualisation/téléchargement

### 📊 **Impact Business & UX**

#### **Avant (Problématique)**
```
❌ PDF affiché comme image cassée
❌ Documents Word/Excel non reconnus
❌ UX frustrante pour utilisateurs
❌ Pas de distinction visuelle entre formats
```

#### **Après (Solution Professionnelle)**
```
✅ PDF: Icône rouge claire avec type identifié
✅ Images: Prévisualisation parfaite
✅ Word/Excel: Icônes appropriées et informatives
✅ UX intuitive: Actions évidentes pour chaque type
✅ Cohérence visuelle: Même expérience partout
```

### 🏆 **Avantages Techniques**

#### **Architecture Propre**
- **Séparation des responsabilités** : Utilitaires `.ts` + Composants `.tsx`
- **Configuration centralisée** : `mediaBaseURL` dans `api.ts`
- **Réutilisabilité** : Composant `FileDisplay` utilisable partout
- **Maintenabilité** : Ajout facile de nouveaux formats

#### **Performance et Flexibilité**
- **Chargement conditionnel** : Miniatures uniquement pour images
- **URLs optimisées** : CDN-ready avec variables d'environnement
- **Fallbacks robustes** : Gestion gracieuse des fichiers manquants
- **TypeScript intégral** : Sécurité des types garantie

### 📁 **Fichiers Modifiés/Créés**

#### **Nouveaux Fichiers**
- **`/components/common/FileDisplay.tsx`** - Composant de visualisation adaptative
- **Fonctions ajoutées à `imageUtils.ts`** - `getFileTypeInfo()`, `formatFileSize()`, etc.

#### **Fichiers Mis à Jour**
- **`api.ts`** - Configuration `mediaBaseURL` centralisée
- **`VehicleReservationDetail.tsx`** - Intégration composant FileDisplay
- **`RentalTrackingPage.tsx`** - Remplacement affichage documents permis

### 🎊 **Résultats**
- **✅ UX Professionnelle** : Visualisation appropriée pour tous formats
- **✅ Architecture Évolutive** : Ajout facile nouveaux types de fichiers
- **✅ Configuration Flexible** : Compatible dev/production/CDN
- **✅ Code Maintenable** : Composants réutilisables et typés
- **✅ Performance Optimisée** : Chargement intelligent selon type
- **✅ Compatibilité Totale** : Intégration transparente avec existant

Ce système transforme l'expérience de visualisation des documents de **problématique technique** en **fonctionnalité professionnelle** adaptée aux besoins métier réels.

## 🆕 NOUVEAU : Uniformisation Complète Interface Admin (Août 2025)

### 🎯 **Problème Résolu**
L'interface admin présentait des incohérences majeures :
- **Largeurs variables** entre pages (certaines plein écran, d'autres trop étroites)
- **Tables différentes** avec styles non uniformisés (HTML brut vs composants)
- **Actions multiples** prenant trop d'espace dans les tableaux
- **ContentTextsAdmin** qui rétrécissait de manière inattendue quand les sections étaient fermées
- **Débordement horizontal** sur certains tableaux (ReservationsAdmin, SessionsAdmin)

### 🚀 **Solution Professionnelle Implémentée**

#### **Phase 1 : Standardisation des Largeurs**
- **AdminLayout.tsx** : Container `max-w-7xl mx-auto` appliqué uniformément
- **Correction ContentTextsAdmin** : Suppression de la structure `table table-fixed` inadéquate qui causait le rétrécissement
- **Largeur cohérente** : Toutes les pages admin utilisent maintenant la même largeur maximale

#### **Phase 2 : Optimisation CSS Table-Fixed**
- **Propriété `table-fixed`** appliquée aux tableaux débordants
- **Colonnes optimisées** avec largeurs spécifiques (`w-1/4`, `w-1/5`, `w-16` pour actions)
- **ReservationsAdmin et SessionsAdmin** : Résolution complète des chevauchements

#### **Phase 3 : ActionMenu Space-Efficient**
- **Nouveau composant `ActionMenu.tsx`** : Menu dropdown avec bouton "..." 
- **Gain d'espace 50%** : Remplacement de 2-4 boutons par un menu compact
- **Variantes supportées** : `default`, `danger` avec états disabled
- **Click-outside handling** : Fermeture automatique propre

#### **Phase 4 : DataTable Avancé**
- **Enhancement `DataTable.tsx`** : Nouvelles props `title`, `showSearch`, `searchPlaceholder`, `className`
- **Header moderne** : Titre + barre de recherche responsive
- **Table-fixed intégré** : Contrôle strict des largeurs colonnes
- **Configurations optimisées** : colonnes avec `cellClassName`, `width`, truncate + tooltips

### 🎨 **Pages Uniformisées**

#### **TestimonialsAdmin.tsx** ✅ TRANSFORMÉ
- **Avant** : 80+ lignes HTML table avec boutons multiples
- **Après** : 11 lignes configuration DataTable + ActionMenu
- **Actions** : Éditer, Supprimer dans menu dropdown compact
- **Colonnes** : Client (w-1/5), Commentaire (w-2/5) avec truncate, Note, Date, Actions (w-16)

#### **FAQAdmin.tsx** ✅ TRANSFORMÉ  
- **Avant** : HTML table complexe avec gestion manuelle réordonnancement
- **Après** : DataTable avec actions spéciales (featured toggle, réordonnement, édition, suppression)
- **ActionMenu spécialisé** : Actions FAQ-spécifiques avec icônes appropriées
- **Colonnes optimisées** : Question, Tags, Statut avec badges colorés

#### **EmailTemplatesAdmin.tsx** ✅ TRANSFORMÉ
- **Avant** : Table HTML standard avec boutons encombrants  
- **Après** : DataTable professionnel avec ActionMenu
- **Actions** : Éditer, Supprimer, Dupliquer dans menu compact
- **Colonnes** : Event Type, Subject, Variables avec largeurs optimisées

### 🔧 **Architecture Technique**

#### **Composants Créés/Améliorés**
```typescript
// ActionMenu.tsx - Menu dropdown space-efficient
interface ActionMenuProps {
  variant?: 'default' | 'danger';
  disabled?: boolean;
  children: React.ReactNode;
}

// DataTable.tsx - Enhanced avec nouvelles props  
interface DataTableProps<T> {
  title?: string;              // 🆕 Titre avec compteur
  showSearch?: boolean;        // 🆕 Afficher/masquer recherche  
  searchPlaceholder?: string;  // 🆕 Placeholder personnalisé
  className?: string;          // 🆕 Classes CSS personnalisées
  // ... props existantes
}
```

#### **AdminLayout Standardisé**
```typescript
// Structure uniformisée pour toutes les pages admin
<AdminLayout title="Page Title">
  <div className="space-y-6">
    {/* Contenu avec largeur max-w-7xl automatique */}
  </div>
</AdminLayout>
```

### 📊 **Métriques d'Amélioration**

#### **Réduction Code Frontend**
- **TestimonialsAdmin** : 80 lignes → 11 lignes (-86%)
- **FAQAdmin** : Configuration complexe → DataTable simple (-70%)
- **EmailTemplatesAdmin** : Table HTML → Configuration DataTable (-60%)

#### **Gain UX/UI**
- **Largeur cohérente** : 100% des pages admin uniformisées
- **Actions compactes** : Gain d'espace 50% dans colonnes Actions
- **Responsive parfait** : Plus de débordement horizontal sur mobile/tablette
- **Navigation fluide** : Expérience utilisateur homogène

#### **Maintenabilité**
- **Composants réutilisables** : DataTable + ActionMenu utilisables partout
- **Code centralisé** : Logique table dans composant unique
- **Évolutivité** : Nouvelles pages admin suivront automatiquement les standards

### 🎯 **Impact Business**

#### **Expérience Administrateur**
- **Interface professionnelle** : Cohérence visuelle totale
- **Efficacité accrue** : Actions rapides via menus dropdown  
- **Moins d'erreurs** : Largeurs fixes éliminent les problèmes d'affichage
- **Formation simplifiée** : Interface identique sur toutes les pages

#### **Performance Technique**
- **Code maintenu** : Réduction drastique duplication HTML
- **CSS optimisé** : Table-fixed élimine les recalculs de largeur
- **Composants réutilisables** : Développement futur accéléré

### 🏆 **Résultats Finaux**

#### **✅ Problèmes Résolus**
1. **Largeurs incohérentes** → Standardisation `max-w-7xl` uniforme
2. **Tables débordantes** → CSS `table-fixed` avec colonnes optimisées  
3. **Actions encombrantes** → ActionMenu compact (-50% espace)
4. **ContentTextsAdmin rétrécit** → Structure CSS corrigée
5. **Code dupliqué** → DataTable réutilisable centralisé

#### **✅ Architecture Moderne**
- **Composants standardisés** : DataTable + ActionMenu + AdminLayout  
- **Props configurables** : Flexibilité totale sans complexité
- **TypeScript intégral** : Sécurité des types garantie
- **Responsive natif** : Mobile-first avec breakpoints optimisés

#### **✅ Évolutivité Garantie**
- **Nouveau pages admin** : Suivront automatiquement les standards
- **Modifications futures** : Centralisées dans composants réutilisables
- **Maintenance réduite** : Code unifié et documenté

### 🎊 **Transformation Complète**

**Avant (Problématique) :**
```
❌ Largeurs variables selon pages
❌ Débordements horizontaux fréquents  
❌ Actions multiples encombrantes
❌ Code HTML dupliqué partout
❌ ContentTextsAdmin qui rétrécit inexplicablement
```

**Après (Solution Professionnelle) :**
```
✅ Largeur uniforme max-w-7xl sur toutes pages
✅ Table-fixed élimine tous débordements
✅ ActionMenu compact (-50% espace actions)
✅ DataTable réutilisable centralisé
✅ ContentTextsAdmin largeur stable et cohérente  
```

Cette uniformisation transforme MerelFormation d'une **interface admin incohérente** vers une **expérience professionnelle standardisée** avec une architecture moderne, maintenable et évolutive.

**Fichiers Clés Modifiés :**
- **`/components/common/DataTable.tsx`** - Enhanced avec title, showSearch, responsive header
- **`/components/common/ActionMenu.tsx`** - 🆕 Composant menu dropdown space-efficient
- **`/pages/admin/TestimonialsAdmin.tsx`** - Conversion complète vers DataTable
- **`/pages/admin/FAQAdmin.tsx`** - Conversion complète vers DataTable  
- **`/pages/admin/EmailTemplatesAdmin.tsx`** - Conversion complète vers DataTable
- **`/pages/admin/ContentTextsAdmin.tsx`** - Correction structure CSS problématique
- **`/components/layout/AdminLayout.tsx`** - Container max-w-7xl standardisé

---

## 🚀 **MISE À JOUR 21 AOÛT 2025 - Optimisation Code & Modal Étudiant Réutilisable**

### 🎯 **Objectifs Accomplis**

#### **1. Création Composant StudentDetailModal Réutilisable**
- **Extraction complète** du modal étudiant complexe en composant indépendant
- **Réutilisation** entre `StudentsAdmin.tsx` et `FormationReservationsAdmin.tsx`
- **Élimination** de ~800 lignes de code dupliqué
- **Architecture modulaire** avec props configurables

#### **2. Gestion Complète Statuts Réservations**
- **Dropdown interactif** pour changement de statut dans le modal étudiant
- **Modal de confirmation** avec email automatique et message personnalisé
- **19 statuts formations** disponibles avec workflow complet
- **Mise à jour temps réel** de l'interface après changement
- **Gestion d'erreurs** robuste avec notifications toast

#### **3. Optimisation Architecture Frontend**
- **Single Source of Truth** : Une seule implémentation du modal étudiant
- **Maintenabilité accrue** : Modifications centralisées
- **Cohérence UX** : Expérience identique sur toutes les pages
- **Performance** : Réduction significative du bundle JavaScript

### 🔧 **Détails Techniques Implémentés**

#### **StudentDetailModal.tsx (Nouveau Composant)**
```typescript
interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
  activeTab?: 'info' | 'company' | 'reservations' | 'documents';
}

// 4 onglets complets :
// - Informations personnelles + statut actif/inactif
// - Entreprise/employeur (si renseigné)
// - Réservations avec changement de statut interactif
// - Documents d'inscription avec validation/rejet
```

#### **Fonctionnalités Modal Étudiant**
- **Onglet Informations** : Données personnelles + changement statut étudiant
- **Onglet Entreprise** : Informations employeur complètes
- **Onglet Réservations** : Liste + modification statuts avec dropdown
- **Onglet Documents** : Gestion documents avec validation/rejet admin

#### **Gestion Statuts Réservations Intégrée**
```typescript
// États gestion statuts
const [showStatusDropdown, setShowStatusDropdown] = useState<Record<number, boolean>>({});
const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);

// Fonctions principales
const toggleStatusDropdown = (reservationId: number) => { /* ... */ };
const handleStatusChangeRequest = (reservationId: number, newStatus: string) => { /* ... */ };
const confirmStatusChange = async () => { /* ... */ };

// 19 statuts formations disponibles
const formationStatuses = [
  'submitted', 'under_review', 'awaiting_documents', 'documents_pending',
  'documents_rejected', 'awaiting_prerequisites', 'awaiting_funding',
  'funding_approved', 'awaiting_payment', 'payment_pending', 'confirmed',
  'awaiting_start', 'in_progress', 'attendance_issues', 'suspended',
  'completed', 'failed', 'cancelled', 'refunded'
];
```

#### **Interface Utilisateur Améliorée**
- **Dropdown statuts** : Badge cliquable avec icône ChevronDown
- **Z-index optimisé** : Dropdown s'affiche au-dessus de tous éléments
- **Modal confirmation** : Avertissement email + message personnalisé
- **Feedback temps réel** : Notifications toast pour succès/erreurs

### 📊 **Métriques d'Optimisation**

#### **Réduction Code**
- **StudentsAdmin.tsx** : 1605 lignes → 814 lignes (-49%)
- **Code dupliqué éliminé** : ~800 lignes de modal complexe
- **Imports simplifiés** : Suppression icônes/utilitaires inutilisés
- **États supprimés** : 15+ variables d'état consolidées

#### **Architecture Améliorée**
- **Composant réutilisable** : StudentDetailModal utilisé par 2+ pages
- **Props configurables** : activeTab personnalisable selon contexte
- **Separation of Concerns** : Logique modal séparée de la gestion liste
- **Type Safety** : Interfaces TypeScript complètes

#### **UX/UI Cohérente**
- **Expérience identique** : Modal étudiant identique partout
- **Workflow unifié** : Changement statuts même interface
- **Performance** : Chargement données optimisé
- **Responsive** : Mobile-friendly avec navigation tabs

### 🎯 **Impact Business & Technique**

#### **Maintenabilité**
- **Modifications futures** : Une seule implémentation à maintenir
- **Évolutivité** : Nouvelles pages réutiliseront composant automatiquement
- **Debug facilité** : Code centralisé = debugging plus simple
- **Tests** : Surface d'attaque réduite pour tests unitaires

#### **Expérience Administrateur**
- **Cohérence** : Interface identique sur StudentsAdmin et FormationReservationsAdmin
- **Efficacité** : Changement statuts réservations directement depuis modal
- **Workflow fluide** : Pas besoin de naviguer entre pages
- **Feedback clair** : Confirmations et notifications appropriées

#### **Architecture Technique**
- **Code Quality** : Élimination duplication = maintenance réduite
- **Bundle Size** : Réduction JavaScript côté client
- **Memory Usage** : Moins de composants dupliqués en mémoire
- **Development Speed** : Nouvelles fonctionnalités plus rapides à implémenter

### ✅ **Résultats Finaux**

#### **Avant (Problématique)**
```
❌ Modal étudiant dupliqué entre StudentsAdmin et FormationReservationsAdmin
❌ ~800 lignes de code identique maintenues en double
❌ Incohérences potentielles entre implémentations
❌ Modifications nécessaires sur 2+ fichiers
❌ Statuts réservations non modifiables dans modal étudiant StudentsAdmin
```

#### **Après (Solution Optimisée)**
```
✅ StudentDetailModal.tsx composant réutilisable unique
✅ Code consolidé = maintenance centralisée
✅ Expérience utilisateur parfaitement cohérente
✅ Modifications sur 1 seul fichier = efficacité développement
✅ Changement statuts réservations disponible partout
✅ Architecture modulaire extensible
```

### 🏆 **Transformation Architecture**

Cette optimisation transforme MerelFormation d'une **architecture avec duplication de code** vers une **architecture modulaire professionnelle** :

- **Pattern réutilisabilité** : Composants extraits et configurables
- **Single Responsibility** : Chaque composant a une responsabilité claire
- **Maintenance efficiency** : Modifications centralisées
- **Scalability** : Nouvelles pages bénéficient automatiquement des améliorations

**Fichiers Impactés :**
- **🆕 `/components/admin/StudentDetailModal.tsx`** - Nouveau composant réutilisable avec gestion statuts
- **📝 `/pages/admin/StudentsAdmin.tsx`** - Refactorisé pour utiliser composant réutilisable (-49% lignes)
- **📝 `/pages/admin/FormationReservationsAdmin.tsx`** - Utilise déjà le composant réutilisable
- **📝 `/components/common/Modal.tsx`** - Correction propriété maxWidth vs size

### 🚀 **Vision Future**²

Cette architecture modulaire prépare MerelFormation pour :
- **Extensibilité** : Nouveaux modals suivront le même pattern
- **Maintenance** : Code centralisé = évolutions facilitées  
- **Cohérence** : Interface uniforme garantie sur toute l'application
- **Performance** : Bundle optimisé et réutilisation composants