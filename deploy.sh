#!/bin/bash

# Script de déploiement pour MerelFormation - Version OPTIMISÉE
# Configuration dynamique pour dev/prod

# Variables d'environnement (modifiables)
DEPLOY_ENV=${DEPLOY_ENV:-"dev"}
API_HOST=${API_HOST:-"localhost"}
API_PORT=${API_PORT:-"80"}

echo "🚀 Démarrage du déploiement MerelFormation..."
echo "📍 Environnement: $DEPLOY_ENV"
echo "🌐 Host: $API_HOST:$API_PORT"

# ✅ NOUVEAU : Vérification des corrections 502
echo "🔍 Vérification des corrections anti-502..."
if [ ! -f "docker/php/www.conf" ]; then
    echo "❌ ERREUR: docker/php/www.conf manquant !"
    echo "💡 Exécutez d'abord le script de correction des erreurs 502"
    exit 1
fi

if ! grep -q "listen = 0.0.0.0:9000" docker/php/www.conf; then
    echo "❌ ERREUR: Configuration PHP-FPM incorrecte dans docker/php/www.conf"
    echo "💡 Le fichier doit contenir 'listen = 0.0.0.0:9000'"
    exit 1
fi

echo "✅ Corrections anti-502 présentes"

# ✅ AJOUT: Arrêter tous les conteneurs d'abord pour éviter les conflits
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# ✅ AMÉLIORATION: Gestion SÉCURISÉE des répertoires de données
echo "📁 Préparation des répertoires de données..."

# Créer les répertoires de base
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# ✅ CORRECTION CRITIQUE: Préservation des données MySQL existantes
if [ -d "data/mysql" ]; then
    echo "📊 Données MySQL existantes détectées - PRÉSERVATION des données"

    # Vérifier et corriger seulement les permissions
    echo "🔧 Correction des permissions MySQL (sans suppression des données)..."
    sudo chown -R 999:999 data/mysql
    sudo chmod -R 755 data/mysql

    # Vérifier s'il y a des fichiers dans le répertoire
    if [ "$(ls -A data/mysql)" ]; then
        echo "✅ Données MySQL préservées ($(du -sh data/mysql | cut -f1))"
    else
        echo "ℹ️ Répertoire MySQL vide - première installation"
    fi
else
    echo "🆕 Première installation - création du répertoire MySQL..."
    mkdir -p data/mysql
    sudo chown -R 999:999 data/mysql
    sudo chmod -R 755 data/mysql
fi

# S'assurer que le répertoire de build existe
mkdir -p app/public/build
mkdir -p app/public/uploads/sessions
mkdir -p app/public/uploads/formations

# Nettoyer les anciens fichiers de build
echo "🧹 Nettoyage des fichiers précédents..."
rm -rf app/public/build/*

# Copier le fichier .env.prod vers .env
if [ -f "app/.env.prod" ]; then
    cp app/.env.prod app/.env
    echo "✅ Fichier .env.prod copié vers .env"
else
    echo "⚠️ Attention: app/.env.prod n'existe pas"
fi

# Construction du frontend
echo "🏗️ Construction du frontend..."
docker-compose -f docker-compose.prod.yml run --rm node

# Copier les fichiers TinyMCE dans le build
echo "📄 Copie des fichiers TinyMCE..."
if [ -d "frontend/dist/tinymce" ]; then
    cp -r frontend/dist/tinymce app/public/
    echo "✅ TinyMCE copié vers app/public/tinymce"
else
    echo "⚠️ TinyMCE non trouvé dans le build - vérifier la configuration Vite"
fi

# Vérifier que les fichiers ont été générés
echo "✅ Vérification des fichiers frontend..."
if [ ! -f "app/public/build/index.html" ]; then
  echo "❌ ERREUR: Le build frontend n'a pas généré index.html"
  ls -la app/public/build
  exit 1
fi

# ✅ OPTIMISÉ : Éviter rebuild si pas nécessaire (variable d'environnement)
if [ "$FORCE_REBUILD" = "true" ]; then
    echo "🏗️ Reconstruction forcée de l'image PHP..."
    docker-compose -f docker-compose.prod.yml build --no-cache php
else
    echo "⚡ Skip rebuild PHP (utilise FORCE_REBUILD=true pour forcer)"
fi

# Vérifier que l'index.html fait référence aux bons fichiers
echo "🔍 Vérification des références dans index.html..."
grep -oE "assets/[^\"']*\.(js|css)" app/public/build/index.html

# Lister les fichiers dans le répertoire assets
echo "📁 Fichiers assets générés:"
ls -la app/public/build/assets/ 2>/dev/null || echo "Pas de répertoire assets"

# ✅ CORRECTION: Lancer TOUS les services, y compris MailHog
echo "🐳 Lancement des conteneurs..."
docker-compose -f docker-compose.prod.yml up -d

# ✅ Attente optimisée pour le démarrage
echo "⏳ Attente du démarrage des services (10 secondes)..."
sleep 10

# ✅ Vérification simplifiée de PHP-FPM
echo "🔌 Vérification de PHP-FPM..."
PHP_ATTEMPTS=0
MAX_PHP_ATTEMPTS=6

while [ $PHP_ATTEMPTS -lt $MAX_PHP_ATTEMPTS ]; do
    PHP_ATTEMPTS=$((PHP_ATTEMPTS + 1))
    
    if docker-compose -f docker-compose.prod.yml exec nginx nc -z php 9000 2>/dev/null; then
        echo "✅ PHP-FPM opérationnel"
        break
    fi
    
    if [ $PHP_ATTEMPTS -eq $MAX_PHP_ATTEMPTS ]; then
        echo "❌ ERREUR: PHP-FPM non accessible après $((MAX_PHP_ATTEMPTS * 3)) secondes"
        docker-compose -f docker-compose.prod.yml logs --tail=5 php
        exit 1
    fi
    
    echo "⏳ Tentative $PHP_ATTEMPTS/$MAX_PHP_ATTEMPTS..."
    sleep 3
done

# ✅ Vérification simplifiée de MySQL
echo "🔄 Vérification de MySQL..."
MYSQL_MAX_ATTEMPTS=8
MYSQL_ATTEMPT=0

while [ $MYSQL_ATTEMPT -lt $MYSQL_MAX_ATTEMPTS ]; do
    if docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "✅ MySQL opérationnel"
        break
    fi
    
    MYSQL_ATTEMPT=$((MYSQL_ATTEMPT + 1))
    if [ $MYSQL_ATTEMPT -eq $MYSQL_MAX_ATTEMPTS ]; then
        echo "❌ ERREUR: MySQL non accessible après $((MYSQL_MAX_ATTEMPTS * 5)) secondes"
        docker-compose -f docker-compose.prod.yml logs --tail=5 mysql
        echo "💡 Solutions: sudo chown -R 999:999 data/mysql && ./deploy.sh"
        exit 1
    fi
    
    echo "⏳ MySQL en cours de démarrage... ($MYSQL_ATTEMPT/$MYSQL_MAX_ATTEMPTS)"
    sleep 5
done

# ✅ AJOUT: Vérifier que MailHog est aussi démarré
echo "📧 Vérification de MailHog..."
if docker-compose -f docker-compose.prod.yml ps mailhog | grep -q "Up"; then
    echo "✅ MailHog est opérationnel"
else
    echo "⚠️ MailHog a un problème, mais on continue..."
fi

echo "📦 Installation des dépendances..."

# Installer les dépendances Symfony (SANS auto-scripts pour éviter blocages)
echo "📦 Installation des dépendances Composer..."
docker-compose -f docker-compose.prod.yml exec php composer install --no-dev --optimize-autoloader --no-scripts

# Correction des permissions AVANT le cache
echo "🔧 Correction des permissions..."
docker-compose -f docker-compose.prod.yml exec php bash -c "
    # Créer les répertoires nécessaires
    mkdir -p /var/www/var/cache/prod/vich_uploader
    mkdir -p /var/www/var/cache/prod/jms_metadata
    mkdir -p /var/www/var/log
    mkdir -p /var/www/public/uploads/sessions
    mkdir -p /var/www/public/uploads/formations

    # Permissions complètes
    chown -R www-data:www-data /var/www/var
    chown -R www-data:www-data /var/www/public/uploads
    chmod -R 777 /var/www/var/cache
    chmod -R 777 /var/www/var/log
    chmod -R 755 /var/www/public/uploads
"

# Vider le cache Symfony (MÉTHODE HYBRIDE pour éviter blocages)
echo "🗑️ Vidage du cache Symfony..."
echo "⚠️ Si ça bloque, tapez Ctrl+C et relancez manuellement"
timeout 120 docker-compose -f docker-compose.prod.yml exec php php bin/console cache:clear --env=prod --no-debug || {
    echo "⚠️ cache:clear a échoué ou pris trop de temps"
    echo "🛠️ Utilisation de la méthode de fallback..."
    docker-compose -f docker-compose.prod.yml exec php rm -rf /var/www/var/cache/prod/* || true
    docker-compose -f docker-compose.prod.yml exec php php bin/console cache:warmup --env=prod --no-optional-warmers || true
    echo "⚠️ IMPORTANT: Vous devrez peut-être lancer manuellement:"
    echo "   docker-compose -f docker-compose.prod.yml exec php php bin/console cache:clear --env=prod"
}

# Re-correction des permissions après cache
echo "🔧 Re-correction des permissions après cache..."
docker-compose -f docker-compose.prod.yml exec php bash -c "
    chown -R www-data:www-data /var/www/var/cache
    chmod -R 777 /var/www/var/cache
"

# Exécuter les migrations
echo "🗄️ Exécution des migrations..."
docker-compose -f docker-compose.prod.yml exec php php bin/console doctrine:migrations:migrate --no-interaction

# Vérifier les permissions des fichiers statiques
echo "🔐 Vérification des permissions des fichiers statiques..."
docker-compose -f docker-compose.prod.yml exec nginx chmod -R 755 /var/www/public/build

# ✅ CORRECTION : Pas de redémarrage PHP inutile qui cause des problèmes de timing
echo "🔄 Stabilisation des services..."
sleep 10

# Afficher l'état des conteneurs
echo "📊 État des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

# ✅ Tests API optionnels (seulement si DEPLOY_ENV=prod)
if [ "$DEPLOY_ENV" = "prod" ]; then
    echo "🧪 Tests API en mode production..."
    
    # Test simple de l'API
    echo "🔍 Test API formations..."
    API_URL="http://$API_HOST:$API_PORT/api/formations"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" --max-time 10 || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ API accessible (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "502" ]; then
        echo "❌ ERREUR 502 - Problème de configuration"
        exit 1
    else
        echo "⚠️ API retourne HTTP $HTTP_CODE"
    fi
else
    echo "ℹ️ Tests API ignorés en mode développement"
fi

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "=================================="
echo "🌐 Application: http://$API_HOST:$API_PORT"
echo "🔧 Admin: http://$API_HOST:$API_PORT/admin"
echo "📧 MailHog: http://$API_HOST:8025"
echo ""
echo "📊 État des services:"
docker-compose -f docker-compose.prod.yml ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📋 Commandes utiles:"
echo "   • Logs: docker-compose -f docker-compose.prod.yml logs [service]"
echo "   • Restart: docker-compose -f docker-compose.prod.yml restart [service]"
echo "   • Stop: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "💾 Données MySQL: $(du -sh data/mysql 2>/dev/null | cut -f1 || echo 'Première installation')"
echo ""
if [ "$DEPLOY_ENV" = "dev" ]; then
    echo "ℹ️ Mode développement - Variables d'environnement disponibles:"
    echo "   DEPLOY_ENV=prod API_HOST=votre-domaine.com ./deploy.sh"
    echo "   FORCE_REBUILD=true ./deploy.sh  # Force rebuild PHP si problèmes"
fi

echo ""
echo "🆘 En cas de problème cache bloqué:"
echo "   docker-compose -f docker-compose.prod.yml exec php rm -rf /var/www/var/cache/prod/*"
echo "   docker-compose -f docker-compose.prod.yml restart php"