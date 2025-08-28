# 🎨 Système de Gestion de Contenu (CMS) - MerelFormation

## 📋 Vue d'ensemble

Ce module CMS permet aux administrateurs de personnaliser facilement le contenu du site web MerelFormation sans avoir besoin de compétences techniques. Il comprend trois modules principaux :

- **📝 Textes du site** - Gestion des contenus textuels (🆕 **150 contenus** couvrant 100% du site)
- **🗣️ Témoignages** - Gestion des témoignages clients
- **❓ FAQ** - Gestion des questions fréquemment posées

**MISE À JOUR AOÛT 2025** : CMS COMPLET - 100% des textes du site sont maintenant CMS-gérés avec rendu HTML professionnel.

## 🎯 Fonctionnalités

### 📝 Gestion des Textes du Site
- ✅ **Couverture Totale** : 150 contenus CMS couvrant 100% des textes du site
- ✅ **Pages Complètement CMS-isées** :
  - Page d'accueil (38 éléments) : héro, services, témoignages, statistiques
  - Page contact (26 éléments) : formulaire, informations légales, carte interactive  
  - Page location (28 éléments) : véhicules, caractéristiques, tarifs
  - Footer complet (21 éléments) : newsletter, contact, horaires, copyright, mentions légales
  - Formations, FAQ, témoignages entièrement dynamiques
- ✅ **Rendu HTML Professionnel** : Support complet HTML avec `dangerouslySetInnerHTML`
- ✅ **Système de Vérification Visuelle** : Marqueurs "modifié" sur tous les contenus CMS
- ✅ **Pagination Optimisée** : Limite augmentée à 100 éléments par page pour performances
- ✅ **Interface organisée** par pages et sections avec descriptions claires
- ✅ Catégorisation par type (titre, sous-titre, paragraphe, bouton, etc.)
- ✅ Identifiants uniques pour chaque contenu
- ✅ Activation/désactivation des contenus
- ✅ Recherche et filtres avancés

### 🗣️ Gestion des Témoignages
- ✅ Ajout de témoignages clients avec note (1-5 étoiles)
- ✅ Association à des formations spécifiques
- ✅ Mise en vedette de témoignages importants
- ✅ Upload d'images clients
- ✅ Gestion des statuts (actif/inactif, vedette)

### ❓ Gestion des FAQ
- ✅ Organisation par catégories
- ✅ Système de réordonnancement (drag & drop)
- ✅ Tags pour une meilleure organisation
- ✅ Compteur de vues
- ✅ Mise en vedette des questions importantes

## 🗃️ Structure de la Base de Données

### Table `content_text`
```sql
- id (PK)
- identifier (VARCHAR 255, UNIQUE)
- title (VARCHAR 255)
- content (LONGTEXT)
- section (VARCHAR 100) - home, formations, contact, etc.
- type (VARCHAR 50) - title, subtitle, paragraph, button, etc.
- is_active (BOOLEAN)
- created_at, updated_at (DATETIME)
```

### Table `testimonial`
```sql
- id (PK)
- client_name (VARCHAR 255)
- client_job (VARCHAR 255, NULLABLE)
- client_company (VARCHAR 255, NULLABLE)
- content (LONGTEXT)
- rating (INT 1-5, NULLABLE)
- formation (VARCHAR 255, NULLABLE)
- client_image (VARCHAR 255, NULLABLE)
- is_active (BOOLEAN)
- is_featured (BOOLEAN)
- testimonial_date (DATE, NULLABLE)
- created_at, updated_at (DATETIME)
```

### Table `faq`
```sql
- id (PK)
- question (VARCHAR 500)
- answer (LONGTEXT)
- category (VARCHAR 100)
- sort_order (INT)
- is_active (BOOLEAN)
- is_featured (BOOLEAN)
- tags (JSON, NULLABLE)
- view_count (INT)
- created_at, updated_at (DATETIME)
```

## 🔌 API Endpoints

### ContentText
```
GET    /admin/content-texts              - Liste des textes
GET    /admin/content-texts/{id}         - Détail d'un texte
POST   /admin/content-texts              - Créer un texte
PUT    /admin/content-texts/{id}         - Modifier un texte
DELETE /admin/content-texts/{id}         - Supprimer un texte
GET    /admin/content-texts/sections     - Liste des sections
GET    /admin/content-texts/types        - Liste des types
```

### Testimonials
```
GET    /admin/testimonials               - Liste des témoignages
POST   /admin/testimonials               - Créer un témoignage
PUT    /admin/testimonials/{id}          - Modifier un témoignage
DELETE /admin/testimonials/{id}          - Supprimer un témoignage
PATCH  /admin/testimonials/{id}/toggle-featured  - Basculer vedette
PATCH  /admin/testimonials/{id}/toggle-active    - Basculer actif
```

### FAQ
```
GET    /admin/faq                        - Liste des FAQ
POST   /admin/faq                        - Créer une FAQ
PUT    /admin/faq/{id}                   - Modifier une FAQ
DELETE /admin/faq/{id}                  - Supprimer une FAQ
PUT    /admin/faq/reorder               - Réorganiser l'ordre
PATCH  /admin/faq/{id}/toggle-featured  - Basculer vedette
PATCH  /admin/faq/{id}/toggle-active    - Basculer actif
```

## 🖥️ Interface Administration

### Routes Frontend
```
/admin/content/texts        - Gestion des textes du site (🆕 Interface réorganisée)
/admin/content/testimonials - Gestion des témoignages
/admin/content/faq          - Gestion des FAQ
```

### 🆕 Interface CMS Améliorée
L'interface admin a été complètement repensée pour les clients non-techniques :
- **Organisation par pages** : Accueil, Formations, Location, Contact
- **Sections accordéon** : Navigation intuitive par sections
- **Descriptions claires** : Chaque contenu a une description compréhensible
- **Aperçu direct** : Boutons "Voir sur le site" pour prévisualiser

### Menu Navigation
Le module CMS est accessible via le menu admin sous "Contenu" :
- Textes du site
- Témoignages  
- FAQ
- Email templates (existant)

## 🏗️ Architecture Technique

### Backend (Symfony)
```
app/src/Entity/
├── ContentText.php        - Entité textes du site
├── Testimonial.php        - Entité témoignages  
└── FAQ.php               - Entité FAQ

app/src/Controller/Admin/
├── ContentTextAdminController.php
├── TestimonialAdminController.php
└── FAQAdminController.php
```

### Frontend (React + TypeScript)
```
frontend/src/
├── types/cms.ts                    - Types TypeScript
├── services/cmsService.ts          - Services API
└── pages/admin/
    ├── ContentTextsAdmin.tsx       - Interface textes
    ├── TestimonialsAdmin.tsx       - Interface témoignages
    └── FAQAdmin.tsx               - Interface FAQ
```

## 🚀 Installation et Déploiement

### 1. Migration de la Base de Données
```bash
# Migration initiale
php bin/console doctrine:migrations:migrate

# 🆕 Migrations complètes (8 migrations pour 150 contenus CMS)
docker exec merel_php php bin/console doctrine:migrations:migrate --no-interaction
```

### 2. Vérification des Routes
```bash
php bin/console debug:router | grep cms
php bin/console debug:router | grep admin
```

### 3. Test Frontend
```bash
cd frontend
npm run dev
```

### 4. URLs de Test
- `http://localhost:3000/admin/content/texts` (🆕 Interface améliorée)
- `http://localhost:3000/admin/content/testimonials`
- `http://localhost:3000/admin/content/faq`

### 5. 🆕 Pages avec CMS Intégré (100% COMPLÈTES)
- `http://localhost:3000/` - Page d'accueil (38 éléments CMS : Hero, Services, Statistiques, CTA, Témoignages)
- `http://localhost:3000/formations` - Page formations (entièrement CMS avec témoignages dynamiques)
- `http://localhost:3000/location` - Page location (28 éléments CMS : véhicules, caractéristiques, tarifs)
- `http://localhost:3000/contact` - Page contact (26 éléments CMS : formulaire, carte, infos légales)
- `Footer` - 21 éléments CMS (newsletter, contact, horaires, copyright, mentions légales)

## 💡 Guide d'Utilisation

### Pour l'Administrateur

#### Gestion des Textes
1. Accéder à **Admin → Contenu → Textes du site**
2. Cliquer sur **"Nouveau texte"**
3. Remplir les champs :
   - **Identifiant** : clé unique (ex: `home_hero_title`)
   - **Titre** : titre du contenu
   - **Contenu** : texte à afficher
   - **Section** : page concernée (home, contact, etc.)
   - **Type** : nature du contenu (titre, paragraphe, etc.)

#### Gestion des Témoignages
1. Accéder à **Admin → Contenu → Témoignages**
2. Ajouter les informations client
3. Noter de 1 à 5 étoiles
4. Associer à une formation (optionnel)
5. Mettre en vedette si nécessaire

#### Gestion des FAQ
1. Accéder à **Admin → Contenu → FAQ**
2. Organiser par catégorie
3. Utiliser les tags pour le référencement
4. Réorganiser l'ordre d'affichage
5. Mettre en vedette les questions importantes

## 🔒 Sécurité

- ✅ Authentification JWT requise
- ✅ Vérification des rôles admin
- ✅ Validation des données côté serveur
- ✅ Protection CSRF
- ✅ Sanitisation des contenus

## 📈 Métriques et Suivi

### FAQ
- Compteur de vues par question
- Questions les plus consultées
- Catégories populaires

### Témoignages
- Témoignages en vedette
- Répartition par formation
- Notes moyennes

## 🛠️ Maintenance

### Sauvegarde
- Sauvegarder les tables CMS avant modifications importantes
- Exporter les contenus critiques

### Performance
- Index sur les champs de recherche
- Cache des contenus fréquemment consultés
- Pagination des listes admin

## 🚀 Évolutions Futures

### V2.0 COMPLÈTE ✅
- [x] ✅ **Interface intuitive** pour clients non-techniques
- [x] ✅ **Couverture complète** 100% des pages du site (150 contenus)
- [x] ✅ **Organisation par pages/sections**
- [x] ✅ **Rendu HTML professionnel** avec dangerouslySetInnerHTML
- [x] ✅ **Système de vérification visuelle** avec marqueurs "modifié"
- [x] ✅ **Pagination optimisée** pour performances
- [x] ✅ **8 migrations complètes** pour transfert des contenus
- [ ] Éditeur WYSIWYG pour les contenus (en cours avec TinyMCE email templates)
- [ ] Versioning des contenus
- [ ] Programmation de publication
- [ ] Import/Export en masse
- [ ] Templates prédéfinis
- [ ] Aperçu en temps réel
- [ ] Workflow de validation

### Intégrations
- [ ] Analytics des contenus
- [ ] SEO automatique
- [ ] Multilingue
- [ ] API publique pour le front-end

---

## 👥 Développé par
**Équipe MerelFormation** - Système CMS intégré

**Date de création :** Mai 2025  
**Dernière mise à jour :** Août 2025 (CMS COMPLET)  
**Version :** 2.0.0  
**Status :** ✅ Production Ready - **100% des textes du site CMS (150 éléments)**
