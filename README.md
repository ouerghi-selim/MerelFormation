# MerelFormation

**Plateforme complète de gestion de formations taxi avec système de location de véhicules intégré.**

**Status: 99.9% fonctionnel** - Prêt pour la production avec éditeur d'emails professionnel et système de suppression forcée.

**Développeur**: Selim OUERGHI (ouerghi-selim)  
**Repository**: https://github.com/ouerghi-selim/MerelFormation  
**Dernière MAJ**: Septembre 2025

## 🏗️ Architecture Technique

### Stack Technologique
- **Backend**: Symfony 7.2 LTS + API Platform 4.0 (PHP 8.2+)
- **Frontend**: React 18 + TypeScript + Vite 6.0
- **Base de données**: MySQL 8.0 + Doctrine ORM 3.3
- **Infrastructure**: Docker avec Docker Compose
- **Authentification**: JWT (Lexik JWT Bundle) + Refresh Tokens
- **Styling**: Tailwind CSS 3.4
- **WYSIWYG**: 🆕 TinyMCE React (Self-hosted Community Edition)
- **Fonctionnalités**: Google Maps API, React Big Calendar, Recharts

### Architecture Duale
- `/app/` - Backend API Symfony
- `/frontend/` - Frontend SPA React

## 🎯 Fonctionnalités Métier

### Formation et Gestion Pédagogique
- **Formations complètes** : 140h initial, 14h mobilité, recyclage
- **Sessions programmées** avec calendrier intégré
- **Inscriptions étudiants** avec suivi complet
- **Modules pédagogiques** structurés avec objectifs
- **Prérequis automatisés** et validation
- **Certificats PDF** générés automatiquement
- **🆕 Parties pratiques dynamiques** avec contenu riche et images

### Système de Location de Véhicules
- **Gestion de flotte complète**
- **Réservations en ligne** (sans compte requis)
- **Calendrier de disponibilité**
- **Gestion des prix** et facturation automatique
- **Notifications de maintenance** avec alternatives

### Gestion Utilisateurs Avancée
- **Système à 3 rôles** : Admin, Étudiant, Instructeur
- **Authentification JWT sécurisée**
- **🆕 Suppression progressive RGPD** (3 niveaux)
- **🆕 Suppression forcée** pour cas exceptionnels
- **Emails de bienvenue** avec mots de passe temporaires

### Dashboard Administratif
- **Statistiques temps réel** avec graphiques
- **Planning visuel intégré** avec différenciation session/examen
- **🆕 Multiple instructeurs par session**
- **Gestion complète des réservations**
- **Facturation et paiements**
- **🆕 Système CMS intégré**

### Système CMS Intégré
- **🆕 Gestion dynamique des contenus** du site web
- **🆕 Témoignages clients** avec système d'étoiles
- **🆕 FAQ interactive** organisée par catégories
- **Interface intuitive** sans compétences techniques

### Système de Documents Avancé
- **Upload par formation/session** avec organisation
- **Système temporaire stateless** pour API Platform
- **Finalisation automatique** et nettoyage
- **Téléchargement sécurisé** basé sur les inscriptions
- **Filtrage avancé** côté étudiant

### 🆕 Système d'Emails Professionnel (24 Templates)
- **🆕 Éditeur WYSIWYG TinyMCE** self-hosted
- **🆕 Système de variables intelligent** par type d'événement
- **🆕 Prévisualisation intelligente** avec données d'exemple
- **🆕 Coloration syntaxique** des variables {{}}
- **18 types d'événements** couvrant toutes les opérations
- **Emails HTML professionnels** avec CSS inline
- **Notifications automatiques** pour toutes les actions CRUD

## 🛡️ Sécurité et Conformité

### Système de Suppression Progressive RGPD
- **Niveau 1 (Désactivé)** : Récupérable 30 jours
- **Niveau 2 (Anonymisé)** : Données anonymisées, suppression dans 1 an
- **Niveau 3 (Permanent)** : Suppression définitive
- **🆕 Suppression forcée** : Bypass des délais pour cas exceptionnels

### Fonctionnalités de Sécurité
- ✅ **Double confirmation** pour actions critiques
- ✅ **Logs d'audit complets** pour traçabilité
- ✅ **Gestion des contraintes FK** en base
- ✅ **Variables contrôlées** par les développeurs
- ✅ **Fallbacks sécurisés** en cas d'erreur

## 🆕 Nouvelles Fonctionnalités (Septembre 2025)

### Système de Suppression Forcée d'Utilisateurs
Nouveau système permettant aux administrateurs de forcer la suppression définitive d'un utilisateur archivé en contournant les délais de sécurité RGPD dans des cas exceptionnels.

**Fonctionnalités principales :**
- Interface intégrée dans `/admin/users/students` → onglet "Élèves supprimés"
- Double confirmation sécurisée avec saisie du nom complet
- Gestion complète des contraintes FK et relations en cascade
- Logs d'audit complets pour conformité RGPD

📋 **Documentation complète** : `/docs/docs/force-delete-system.md`

### Système de Reset de Mot de Passe
- **Interface complète** : `/forgot-password` et `/reset-password`
- **Sécurité renforcée** : tokens expiration 1h, rate limiting
- **Emails professionnels** : template HTML avec variables dynamiques
- **UX moderne** : design glassmorphism cohérent

### Améliorations Login et Navigation
- **Page de connexion redesignée** : gradient background, glassmorphism
- **Header dynamique** : largeur adaptable selon contexte
- **Footer intégré** : données CMS dynamiques
- **Messages de succès** : gestion des redirections après reset

## 🚀 Installation et Configuration

### Prérequis
- Docker et Docker Compose
- Git

### Installation
```bash
# Cloner le projet
git clone https://github.com/ouerghi-selim/MerelFormation.git
cd MerelFormation

# Configurer les répertoires de données
chmod +x setup-data-directories.sh
./setup-data-directories.sh

# Lancer l'environnement de développement
docker-compose up -d
```

## 📊 Gestion des Données MySQL

### ✅ Persistance des Données
Les données MySQL sont **automatiquement persistées** grâce au volume configuré :
```yaml
volumes:
  - ./data/mysql:/var/lib/mysql
```

### 🔄 Commandes Docker importantes

#### Arrêter sans perdre les données
```bash
docker-compose down
# ✅ Les données MySQL sont conservées
```

#### Redémarrer l'application
```bash
docker-compose up -d
# ✅ Vos données seront toujours là
```

#### ⚠️ ATTENTION : Supprimer TOUTES les données
```bash
docker-compose down -v
# ❌ Cette commande supprime TOUS les volumes (données perdues)
```

### 🧪 Comment tester la persistance

1. **Démarrer l'application :**
   ```bash
   docker-compose up -d
   ```

2. **Accéder à phpMyAdmin :** http://localhost:8081
   - Serveur : `mysql`
   - Utilisateur : `merel_user`
   - Mot de passe : `merel_pass`

3. **Créer des données de test** dans la base `merel_db`

4. **Arrêter l'application :**
   ```bash
   docker-compose down
   ```

5. **Redémarrer :**
   ```bash
   docker-compose up -d
   ```

6. **Vérifier** que vos données sont toujours présentes dans phpMyAdmin

## 🌐 Accès aux Services

- **Application principale :** http://localhost:8082
- **Frontend (dev) :** http://localhost:5173  
- **phpMyAdmin :** http://localhost:8081 (user: `merel_user`, pass: `merel_pass`)
- **MailHog :** http://localhost:8025

## 👥 Comptes de Test

### Comptes par défaut (disponibles en développement)
- **Admin** : `admin@merelformation.fr` 
- **Étudiant** : `student@merelformation.fr`
- **Instructeur** : `instructor@merelformation.fr`

*Note : Ces comptes sont visibles dans l'interface de login en mode développement uniquement.*

## 🛠️ Commandes de Développement

### Docker & Infrastructure
```bash
# Utiliser le Makefile pour les opérations courantes
make docker-up              # Démarrer tous les conteneurs
make docker-down            # Arrêter conteneurs (preserve données)
make docker-build           # Construire les images
make docker-logs            # Voir tous les logs
make docker-php             # Accéder au conteneur PHP
make docker-node            # Accéder au conteneur Node
```

### Backend (Symfony)
```bash
# Exécuter dans le conteneur PHP ou via make
make symfony-console cmd="doctrine:migrations:migrate"
make symfony-console cmd="doctrine:fixtures:load"
make symfony-console cmd="cache:clear"
make symfony-composer cmd="install"

# Générer les migrations
make symfony-console cmd="doctrine:migrations:diff"

# Charger les fixtures
make fixtures
```

### Frontend (React)
```bash
# Exécuter dans le conteneur Node ou via make
make node-install           # Installer les dépendances
make node-dev              # Démarrer le serveur dev
make node-build            # Build de production

# Commandes directes dans le répertoire frontend
cd frontend
npm run dev                # Serveur de développement
npm run build              # Build de production
npm run lint               # ESLint
```

### Tests
```bash
# Tests backend (dans le conteneur PHP)
docker exec -it merel_php php bin/phpunit

# Tests frontend (dans le conteneur Node)
docker exec -it merel_node npm test
```

## 📁 Structure des Données

```
data/
└── mysql/          # Données MySQL persistées
    ├── ibdata1
    ├── mysql/
    └── merel_db/    # Votre base de données
```

## 🛠️ Dépannage

### Les données disparaissent ?
- Vérifiez que le répertoire `./data/mysql` existe
- Assurez-vous d'utiliser `docker-compose down` (sans `-v`)
- Vérifiez les permissions du répertoire `data/`

### Réinitialiser complètement la base
```bash
# Attention : supprime TOUTES les données
docker-compose down -v
rm -rf data/mysql
./setup-data-directories.sh
docker-compose up -d
```

## 🚀 Déploiement Production

Pour la production, utilisez :
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Architecture et Données

### Entités Principales (26 entités)
**Système de Formation :**
- `User`: Étudiants, instructeurs et admins avec gestion de rôles
- `Formation`: Cours de formation (140h initial, 14h mobilité, recyclage)
- `Session`: Sessions programmées avec calendrier intégré
- `Reservation`: Réservations étudiants avec système de confirmation
- `Module`: Modules pédagogiques avec contenu structuré
- `ModulePoint`: Objectifs d'apprentissage détaillés
- `Prerequisite`: Gestion des prérequis de cours
- `PracticalInfo`: 🆕 Parties pratiques dynamiques avec images
- `Category`: Catégorisation des cours de formation

**Système de Location :**
- `Vehicle`: Gestion de la flotte de formation
- `VehicleRental`: Réservations de location avec calendrier
- `ExamCenter`: Centres d'examen
- `Payment`: Transactions financières
- `Invoice`: Système de facturation

**Gestion de Documents :**
- `Document`: Stockage de fichiers avec traçage source
- `TempDocument`: Système d'upload stateless pour API Platform
- `Media`: Gestion des assets

**CMS & Communication :**
- `ContentText`: Gestion dynamique du contenu du site web
- `Testimonial`: Avis clients avec système d'étoiles
- `Faq`: FAQ organisées avec catégories
- `EmailTemplate`: Templates d'emails personnalisables (24 templates)
- `Notification`: Notifications système
- `ActivityLog`: Piste d'audit

**Systèmes Support :**
- `Settings`: Configuration système
- `CalendarEvent`: Planification et programmation
- `RefreshToken`: Gestion des tokens JWT

### API et Intégrations
- **API RESTful** : Endpoints complets avec documentation OpenAPI
- **Authentification JWT** : Avec refresh tokens pour sécurité
- **Upload de fichiers** : Système temporaire avec finalisation
- **Calendrier** : Intégration React Big Calendar
- **PDF** : Génération de certificats avec KnpSnappyBundle
- **Email** : Mailer Symfony avec templates WYSIWYG

## 🔧 Statut du Projet

### Fonctionnalités Complètes ✅
- ✅ **Système de formation complet** (99.9% fonctionnel)
- ✅ **Location de véhicules** avec réservations en ligne
- ✅ **Gestion utilisateurs** avec authentification JWT
- ✅ **Dashboard administratif** avec statistiques temps réel
- ✅ **🆕 Système CMS** pour gestion de contenu
- ✅ **🆕 Emails professionnels** avec éditeur WYSIWYG
- ✅ **🆕 Suppression forcée** avec conformité RGPD
- ✅ **🆕 Reset de mot de passe** sécurisé
- ✅ **🆕 Multiple instructeurs** par session
- ✅ **🆕 Parties pratiques dynamiques** avec images

### Améliorations Récentes (Septembre 2025)
- 🆕 **Système de suppression forcée** : Bypass des délais RGPD pour cas exceptionnels
- 🆕 **Gestion des contraintes FK** : Nettoyage complet des relations
- 🆕 **Modal de confirmation** : Double sécurité avec composants réutilisés
- 🆕 **Reset password complet** : Interface moderne avec sécurité renforcée
- 🆕 **Login redesigné** : Design glassmorphism cohérent
- 🆕 **Navigation améliorée** : Header adaptatif et footer dynamique

## 📝 Notes importantes

- **Base de données** : 26 entités avec relations complexes gérées
- **Sécurité** : Authentification JWT + système de suppression RGPD conforme
- **Performance** : Lazy loading optimisé + cache Symfony
- **Maintenance** : Logs d'audit complets pour traçabilité
- **Production** : Prêt pour déploiement avec Docker
- **Sauvegardez régulièrement** le répertoire `data/mysql`
- N'utilisez **jamais** `docker-compose down -v` en production
- Les données sont stockées localement dans `./data/mysql`

## 🚀 Déploiement et Contact

### Production
```bash
# Déploiement production
docker-compose -f docker-compose.prod.yml up -d

# Build frontend optimisé
cd frontend && npm run build:prod
```

### Développeur
**Selim OUERGHI** - Développeur Full-Stack  
📧 Contact: [GitHub](https://github.com/ouerghi-selim)  
🔗 Repository: https://github.com/ouerghi-selim/MerelFormation

---

*MerelFormation v2.0 - Septembre 2025 - Plateforme complète de gestion de formations taxi avec système de suppression forcée RGPD*
