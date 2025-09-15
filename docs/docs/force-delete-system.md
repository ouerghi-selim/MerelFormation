# Système de Suppression Forcée d'Utilisateurs

## 🎯 Vue d'ensemble

Le système de suppression forcée permet aux administrateurs de supprimer définitivement un utilisateur archivé en contournant les délais de sécurité RGPD dans des cas exceptionnels.

## 🏗️ Architecture

### Backend (Symfony)

#### Contrôleur
- **Fichier** : `/app/src/Controller/Admin/UserAdminController.php`
- **Méthode** : `forceDelete(int $id): JsonResponse`
- **Route** : `POST /api/admin/users/{id}/force-delete`

#### API Resource
- **Fichier** : `/app/src/ApiResource/AdminUsers.php`
- **Configuration** : Route déclarée pour API Platform

### Frontend (React)

#### Composant Principal
- **Fichier** : `/frontend/src/components/admin/ForceDeleteConfirmModal.tsx`
- **Description** : Modal de confirmation avec double sécurité

#### Intégration
- **Fichier** : `/frontend/src/components/admin/DeletedUsersTable.tsx`
- **Bouton** : "Forcer suppression" conditionnel par niveau

#### Service API
- **Fichier** : `/frontend/src/services/api.ts`
- **Méthode** : `adminUsersApi.forceDelete(id)`

## 🛡️ Sécurités Implémentées

### Frontend
1. **Double confirmation obligatoire**
   - Saisie du nom complet de l'utilisateur
   - Validation en temps réel (case-insensitive)
   - Bouton désactivé jusqu'à confirmation valide

2. **Interface sécurisée**
   - Warning RGPD explicite avec Alert component
   - Zone de danger visuelle (border rouge)
   - Informations détaillées sur les conséquences

3. **Validation des permissions**
   - Bouton visible uniquement pour niveaux 1-2 (pas permanent)
   - Vérification du statut archivé

### Backend
1. **Vérifications de sécurité**
   ```php
   // Vérification admin
   if (!$this->security->isGranted('ROLE_ADMIN')) {
       return $this->json(['message' => 'Accès refusé'], 403);
   }

   // Vérification état supprimé
   if (!$user->getDeletedAt()) {
       return $this->json(['message' => 'Cet utilisateur n\'est pas supprimé'], 400);
   }

   // Vérification pas déjà permanent
   if ($user->getDeletionLevel() === 'permanent') {
       return $this->json(['message' => 'Cet utilisateur est déjà définitivement supprimé'], 400);
   }
   ```

2. **Logs d'audit complets**
   ```php
   error_log(sprintf(
       '[AUDIT] SUPPRESSION FORCÉE - Admin: %s | User ID: %d | Email: %s | Niveau: %s | Date: %s',
       $adminEmail, $user->getId(), $user->getEmail(), 
       $user->getDeletionLevel(), (new \DateTime())->format('Y-m-d H:i:s')
   ));
   ```

## 🔧 Gestion des Relations et Contraintes

### Problème des Contraintes FK
Les contraintes de clés étrangères empêchent la suppression directe d'un utilisateur ayant des données liées (réservations, documents, etc.).

### Solution Implémentée
1. **Désactivation temporaire des contraintes**
   ```php
   $connection = $this->entityManager->getConnection();
   $connection->executeStatement('SET FOREIGN_KEY_CHECKS = 0');
   ```

2. **Nettoyage complet des relations**
   ```php
   // Suppression des réservations
   foreach ($user->getReservations() as $reservation) {
       $this->entityManager->remove($reservation);
   }

   // Anonymisation des documents uploadés
   $uploadedDocuments = $this->documentRepository->findBy(['uploadedBy' => $user]);
   foreach ($uploadedDocuments as $document) {
       $document->setUploadedBy(null);
   }

   // Suppression des autres relations...
   ```

3. **Réactivation des contraintes**
   ```php
   $connection->executeStatement('SET FOREIGN_KEY_CHECKS = 1');
   ```

### Relations Gérées
- ✅ **Réservations** (`reservations`) : Suppression complète
- ✅ **Documents** (`documents`) : Suppression complète
- ✅ **Documents uploadés** (`uploadedBy`) : Anonymisation (null)
- ✅ **Locations véhicules** (`vehicleRentals`) : Suppression complète
- ✅ **Factures** (`invoices`) : Suppression complète
- ✅ **Notifications** (`notifications`) : Suppression complète
- ✅ **Sessions instructeur** (ManyToMany) : Retrait de la relation
- ✅ **Utilisateur** (`user`) : Suppression définitive

## 📋 Workflow d'Utilisation

### 1. Accès à l'Interface
1. Naviguer vers `/admin/users/students`
2. Cliquer sur l'onglet "Élèves supprimés"
3. Localiser l'utilisateur à supprimer définitivement

### 2. Initiation de la Suppression
1. Cliquer sur le bouton rouge "Forcer suppression"
2. Le modal `ForceDeleteConfirmModal` s'ouvre

### 3. Confirmation Sécurisée
1. Lire les warnings RGPD
2. Saisir le nom complet exact de l'utilisateur
3. Attendre que le bouton se déverrouille (✅ confirmation valide)
4. Cliquer sur "Supprimer Définitivement"

### 4. Exécution Backend
1. Vérifications de sécurité
2. Désactivation temporaire FK
3. Nettoyage des relations
4. Suppression utilisateur
5. Réactivation FK
6. Log d'audit
7. Retour de confirmation

### 5. Feedback Utilisateur
1. Toast de succès affiché
2. Rechargement automatique de la liste
3. Utilisateur disparu de l'interface

## 🧪 Tests et Validation

### Test de Base
```bash
# Créer utilisateur test
INSERT INTO user (...) VALUES (...);

# Créer réservation liée
INSERT INTO reservation (user_id, ...) VALUES (...);

# Archiver l'utilisateur
UPDATE user SET deleted_at = NOW(), deletion_level = 'deactivated' WHERE id = X;

# Tester suppression forcée
curl -X POST -H "Authorization: Bearer TOKEN" 
  "http://localhost:8082/api/admin/users/X/force-delete"
```

### Résultats Attendus
- ✅ Utilisateur supprimé de la base
- ✅ Réservations supprimées
- ✅ Aucune contrainte FK violée
- ✅ Log d'audit enregistré
- ✅ Interface mise à jour

## 🚨 Cas d'Usage et Précautions

### Quand Utiliser
- **Demande RGPD urgente** : Droit à l'effacement immédiat
- **Problème juridique** : Nécessité de suppression immédiate
- **Erreur de données** : Correction rapide requise
- **Audit de sécurité** : Nettoyage complet nécessaire

### Précautions
- ⚠️ **Action irréversible** : Aucune possibilité de récupération
- ⚠️ **Perte de données** : Toutes les données liées supprimées
- ⚠️ **Impact possible** : Vérifier l'impact sur les sessions en cours
- ⚠️ **Traçabilité** : Logs d'audit obligatoires pour conformité

## 📊 Monitoring et Logs

### Logs d'Audit
```
[AUDIT] SUPPRESSION FORCÉE - Admin: admin@merel.fr | User ID: 68 | Email: test@test.com | Niveau: deactivated | Date: 2025-09-15 20:30:45
```

### Logs d'Erreur
```
[ERREUR] SUPPRESSION FORCÉE ÉCHOUÉE - User ID: 68 | Erreur: Constraint violation | Date: 2025-09-15 20:30:45
```

### Surveillance Recommandée
- Surveiller les logs d'audit pour usage anormal
- Vérifier l'intégrité de la base après suppression
- Documenter les raisons des suppressions forcées

## 🔄 Intégration avec le Système RGPD

### Niveaux de Suppression
1. **Niveau 1 (deactivated)** : Récupérable 30 jours → **✅ Suppression forcée possible**
2. **Niveau 2 (anonymized)** : Anonymisé, suppression 1 an → **✅ Suppression forcée possible**
3. **Niveau 3 (permanent)** : Déjà supprimé → **❌ Suppression forcée impossible**

### Bypass des Délais
La suppression forcée permet de passer directement au niveau 3 sans attendre les délais automatiques, tout en respectant les obligations de traçabilité RGPD.

---

*Documentation technique - Système de suppression forcée - MerelFormation v2.0*