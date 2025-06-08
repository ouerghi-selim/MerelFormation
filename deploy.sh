#!/bin/bash

# Script de déploiement pour MerelFormation - Version SÉCURISÉE avec préservation des données

echo "🚀 Démarrage du déploiement MerelFormation..."

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

# Vérifier que les fichiers ont été générés
echo "✅ Vérification des fichiers frontend..."
if [ ! -f "app/public/build/index.html" ]; then
  echo "❌ ERREUR: Le build frontend n'a pas généré index.html"
  ls -la app/public/build
  exit 1
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

# ✅ AMÉLIORATION: Attente plus longue pour MySQL et vérifications
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30

# ✅ AMÉLIORATION: Vérification avec timeout pour MySQL
echo "🔄 Vérification de l'état de MySQL..."
MYSQL_MAX_ATTEMPTS=12
MYSQL_ATTEMPT=0

while [ $MYSQL_ATTEMPT -lt $MYSQL_MAX_ATTEMPTS ]; do
    if docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost --silent; then
        echo "✅ MySQL est prêt !"
        break
    else
        MYSQL_ATTEMPT=$((MYSQL_ATTEMPT + 1))
        echo "⏳ En attente de MySQL... (tentative $MYSQL_ATTEMPT/$MYSQL_MAX_ATTEMPTS)"
        
        # Afficher les logs MySQL si problème persistant
        if [ $MYSQL_ATTEMPT -eq 6 ]; then
            echo "🔍 Logs MySQL pour diagnostic:"
            docker-compose -f docker-compose.prod.yml logs --tail=10 mysql
        fi
        
        sleep 10
    fi
done

# Vérifier si MySQL a finalement démarré
if [ $MYSQL_ATTEMPT -eq $MYSQL_MAX_ATTEMPTS ]; then
    echo "❌ ERREUR: MySQL n'a pas pu démarrer après $((MYSQL_MAX_ATTEMPTS * 10)) secondes"
    echo "📋 Logs MySQL complets:"
    docker-compose -f docker-compose.prod.yml logs mysql
    echo ""
    echo "🔧 Solutions possibles SANS PERTE DE DONNÉES:"
    echo "   1. Vérifier les permissions: ls -la data/"
    echo "   2. Corriger les permissions: sudo chown -R 999:999 data/mysql && sudo chmod -R 755 data/mysql"
    echo "   3. Redémarrer: docker-compose -f docker-compose.prod.yml restart mysql"
    echo ""
    echo "⚠️ ATTENTION: NE PAS supprimer data/mysql - vos données sont là !"
    echo "💡 Si vraiment nécessaire, faire une sauvegarde d'abord:"
    echo "   sudo tar -czf mysql_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/mysql"
    exit 1
fi

# ✅ AJOUT: Vérifier que MailHog est aussi démarré
echo "📧 Vérification de MailHog..."
if docker-compose -f docker-compose.prod.yml ps mailhog | grep -q "Up"; then
    echo "✅ MailHog est opérationnel"
else
    echo "⚠️ MailHog a un problème, mais on continue..."
fi

echo "📦 Installation des dépendances..."

# Installer les dépendances Symfony
echo "📦 Installation des dépendances Composer..."
docker-compose -f docker-compose.prod.yml exec php composer install --no-dev --optimize-autoloader

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

# Vider le cache Symfony
echo "🗑️ Vidage du cache..."
docker-compose -f docker-compose.prod.yml exec php php bin/console cache:clear --env=prod --no-debug

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

# Redémarrer PHP pour s'assurer que tout est correct
echo "🔄 Redémarrage de PHP..."
docker-compose -f docker-compose.prod.yml restart php

# Attendre un peu après redémarrage
sleep 5

# Afficher l'état des conteneurs
echo "📊 État des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

# Test de l'API
echo "🧪 Test de l'API..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/login_check -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' || echo "000")
if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ API fonctionne (401 attendu pour mauvais credentials)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API fonctionne parfaitement"
else
    echo "⚠️ API retourne: $HTTP_CODE (vérifiez les logs si nécessaire)"
fi

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Votre application est accessible sur: http://193.108.53.178"
echo "🔧 Admin: http://193.108.53.178/admin"
echo "📧 MailHog: http://193.108.53.178:8025"
echo ""
echo "💾 VOS DONNÉES MYSQL SONT PRÉSERVÉES"
echo "📊 Taille des données: $(du -sh data/mysql 2>/dev/null | cut -f1 || echo 'N/A')"
echo ""
echo "📋 Pour vérifier les logs en cas de problème:"
echo "   docker-compose -f docker-compose.prod.yml logs php"
echo "   docker-compose -f docker-compose.prod.yml logs nginx"
echo "   docker-compose -f docker-compose.prod.yml logs mailhog"
echo "   docker-compose -f docker-compose.prod.yml logs mysql"
