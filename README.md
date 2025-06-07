# MerelFormation

Plateforme de gestion de formations taxi avec système de location de véhicules.

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

- **Application principale :** http://localhost
- **phpMyAdmin :** http://localhost:8081
- **MailHog :** http://localhost:8025
- **Frontend (dev) :** http://localhost:5173

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

## 📝 Notes importantes

- **Sauvegardez régulièrement** le répertoire `data/mysql`
- N'utilisez **jamais** `docker-compose down -v` en production
- Les données sont stockées localement dans `./data/mysql`
