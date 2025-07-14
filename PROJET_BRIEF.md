# MerelFormation - Brief Projet Complet

## 🏅 Informations Générales

**Développeur Principal :** Selim OUERGHI (ouerghi-selim)  
**Repository :** https://github.com/ouerghi-selim/MerelFormation  
**Type :** Application de gestion de formations taxi + location de véhicules  
**Status :** ✅ 100% FONCTIONNEL - Projet complet avec améliorations UX/UI avancées  
**Dernière mise à jour :** 14 Juillet 2025 - Système d'icônes dynamique + UX améliorée

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

## 🗄️ Structure de la Base de Données (27 Entités)

### Entités Principales
- **User** - Utilisateurs (admins, étudiants, instructeurs)
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
- **EmailTemplate** - Templates d'emails
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
- **AuthController** - Authentification JWT
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
- **DocumentStudentController** - Documents étudiants
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
- **StudentsAdmin.tsx** - Gestion étudiants
- **InstructorsAdmin.tsx** - Gestion instructeurs
- **AdminsAdmin.tsx** - Gestion admins
- **VehiclesAdmin.tsx** - Gestion véhicules
- **ReservationsAdmin.tsx** - Gestion réservations
- **EmailTemplatesAdmin.tsx** - Templates emails
- **EmailTemplateEdit.tsx** 🆕 WYSIWYG PRO - Éditeur avancé avec variables intelligentes
- **EmailTemplateNew.tsx** 🆕 WYSIWYG PRO - Création avec système de variables
- **UsersAdmin.tsx** - Vue utilisateurs

### Planning Admin (/frontend/src/pages/planning/)
- **index.tsx** ✅ COMPLET - Planning calendrier intégré
- **EventForm.tsx** ✅ COMPLET - Formulaire événements avec gestion examens
- **usePlanningData.ts** ✅ COMPLET - Hook de gestion des données planning
- **types.ts** - Types TypeScript pour le planning
- **calendarConfig.ts** - Configuration du calendrier

### 🆕 CMS Admin (Nouvelles Pages)
- **ContentTextsAdmin.tsx** ✅ COMPLET - Gestion des textes du site
- **TestimonialsAdmin.tsx** ✅ COMPLET - Gestion des témoignages
- **FAQAdmin.tsx** ✅ COMPLET - Gestion des FAQ

### Dashboard Student (/frontend/src/pages/student/)
- **DashboardStudent.tsx** ✅ COMPLET
- **FormationsStudent.tsx** - Formations étudiant
- **FormationDetailStudent.tsx** - Détail formation
- **DocumentsStudent.tsx** ✅ OPTIMISÉ - Documents organisés par source (formation/session) avec filtrage avancé

### Composants Organisés
```
/frontend/src/components/
├── admin/          # Composants admin
├── student/        # Composants étudiant
├── common/         # Composants partagés
│   ├── WysiwygEditor.tsx      # Éditeur WYSIWYG TinyMCE
│   ├── 🆕 IconPicker.tsx      # Sélecteur d'icônes dynamique 1000+
│   ├── 🆕 DynamicIcon.tsx     # Affichage sécurisé d'icônes
│   └── DataTable.tsx          # Table de données avancée
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
- **🆕 Badges dynamiques avec icônes** - Système d'icônes intelligent 1000+ options
- **🆕 Notifications emails automatiques** pour toutes les actions CRUD

### ✅ Location de Véhicules
- Parc automobile complet
- Réservation en ligne (public)
- Calendrier de disponibilité
- Gestion des tarifs
- Facturation automatique
- **🆕 Notifications de maintenance** avec alternatives automatiques

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
- **24 Templates d'emails professionnels** - HTML avec CSS inline pour compatibilité maximale
- **18 Event Types** - Couvrant formations, sessions, utilisateurs, véhicules, documents, contacts
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
- **🆕 Système d'Icônes Dynamique Révolutionnaire**: 
  - Découverte automatique de 1000+ icônes (FontAwesome, Material Design, Bootstrap)
  - Interface moderne avec recherche et filtres par famille 
  - Zéro maintenance - plus de listes manuelles à maintenir
  - Zéro erreur d'import - vérification automatique de l'existence
  - Composants IconPicker et DynamicIcon pour UX optimale
  - Remplacement de l'interface complexe par bouton simple "Choisir une icône"
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

🆕 Emails Automatiques (NOUVEAU):
Tous les endpoints CRUD déclenchent maintenant des emails automatiques:
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

**💡 CONSEIL POUR FUTURES CONVERSATIONS :**
Copiez-collez ce brief au début de nouvelles conversations avec Claude pour qu'il comprenne immédiatement le contexte et l'état du projet sans avoir à refaire toute l'analyse.

**Dernière mise à jour :** Juillet 2025 par Selim OUERGHI

**🎯 NOUVELLES FONCTIONNALITÉS AJOUTÉES (Juillet 2025) :**
- **Système d'Icônes Dynamique** - Découverte automatique de 1000+ icônes avec interface moderne
- **Documents publics** - Accès aux documents de formation sans authentification
- **Sessions enrichies** - Affichage conditionnel avec toutes les informations (lieu, instructeurs, participants)
- **UX améliorée** - Interface plus riche et informative avec sélecteur d'icônes intuitif
- **APIs cohérentes** - Formats de données harmonisés entre public et admin

## 🆕 NOUVEAU : Système d'Emails Automatiques & WYSIWYG Complet

**FONCTIONNALITÉS MAJEURES AJOUTÉES (Janvier 2025) :**

Le projet MerelFormation dispose maintenant d'un **système d'emails automatiques complet et professionnel** + **éditeur WYSIWYG avancé** qui transforment l'expérience utilisateur :

### 📧 **24 Templates d'Emails Professionnels**
- **Design HTML responsive** avec CSS inline
- **Charte graphique cohérente** MerelFormation
- **Variables dynamiques** personnalisées (`{{userName}}`, `{{formationTitle}}`, etc.)
- **Notifications ciblées** par rôle (Admin, Étudiant, Instructeur)

### 🚀 **Déclencheurs Automatiques**
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