# 🚀 Guide de Déploiement MerelFormation

## Utilisation du script deploy.sh

### 🔧 Déploiement Local/Développement
```bash
# Mode par défaut (développement)
./deploy.sh

# Équivalent explicite
DEPLOY_ENV=dev API_HOST=localhost ./deploy.sh
```

### 🌐 Déploiement Production
```bash
# Production avec votre domaine
DEPLOY_ENV=prod API_HOST=votre-domaine.com ./deploy.sh

# Production avec IP
DEPLOY_ENV=prod API_HOST=193.108.53.178 ./deploy.sh

# Production avec port personnalisé
DEPLOY_ENV=prod API_HOST=example.com API_PORT=8080 ./deploy.sh
```

## 📋 Variables d'Environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `DEPLOY_ENV` | `dev` | Mode déploiement (`dev` ou `prod`) |
| `API_HOST` | `localhost` | Nom de domaine ou IP |
| `API_PORT` | `80` | Port de l'application |

## 🔍 Modes de Déploiement

### Mode Développement (`dev`)
- ✅ Vérifications minimales
- ✅ Timeouts courts (plus rapide)
- ✅ Pas de tests API externes
- ✅ Logs simplifiés

### Mode Production (`prod`)
- ✅ Tests API complets
- ✅ Vérifications de santé
- ✅ Timeouts adaptés à la production
- ✅ Validation complète

## 🛠️ Prérequis

1. **Docker et Docker Compose** installés
2. **Fichiers de configuration** présents :
   - `docker-compose.prod.yml`
   - `app/.env.prod`
   - `docker/php/www.conf`
   - `docker/nginx/default.prod.conf`

## 🔧 Dépannage

### Problèmes courants

1. **Erreur 502**
   ```bash
   # Vérifier la configuration PHP-FPM
   grep "listen" docker/php/www.conf
   # Doit contenir: listen = 0.0.0.0:9000
   ```

2. **MySQL ne démarre pas**
   ```bash
   # Corriger les permissions
   sudo chown -R 999:999 data/mysql
   sudo chmod -R 755 data/mysql
   ```

3. **Frontend non accessible**
   ```bash
   # Vérifier le build
   ls -la app/public/build/
   # Doit contenir index.html et assets/
   ```

### Commandes de debug

```bash
# Logs des services
docker-compose -f docker-compose.prod.yml logs [service]

# État des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Accès shell
docker-compose -f docker-compose.prod.yml exec [service] bash

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart [service]
```

## 📊 Structure des Données

```
data/
├── mysql/          # Base de données (persistante)
├── certbot/        # Certificats SSL
│   ├── conf/
│   └── www/
└── backups/        # Sauvegardes automatiques
```

## 🚀 Workflow de Déploiement

1. **Préparation**
   - Vérification des prérequis
   - Nettoyage des anciens builds

2. **Build**
   - Frontend (Node.js/Vite)
   - Images Docker

3. **Déploiement**
   - Arrêt/Redémarrage des services
   - Configuration de l'application

4. **Vérification**
   - Tests de santé
   - Validation des services

5. **Finalisation**
   - Rapport de déploiement
   - Instructions post-déploiement

## 💡 Bonnes Pratiques

### Avant le déploiement
- [ ] Tester en local avec `DEPLOY_ENV=dev`
- [ ] Vérifier les fichiers `.env.prod`
- [ ] Sauvegarder les données importantes

### Après le déploiement
- [ ] Vérifier les logs : `docker-compose logs`
- [ ] Tester l'application
- [ ] Surveiller les performances

### Pour la production
- [ ] Utiliser HTTPS (certificats SSL)
- [ ] Configurer les sauvegardes automatiques
- [ ] Mettre en place la surveillance
- [ ] Documenter la configuration

## 🔒 Sécurité

- ✅ Données MySQL préservées lors des redéploiements
- ✅ Variables d'environnement séparées dev/prod
- ✅ Logs sécurisés (pas de données sensibles)
- ✅ Permissions correctes pour les fichiers uploadés