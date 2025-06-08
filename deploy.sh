#!/bin/bash

# Script de déploiement pour MerelFormation - Version corrigée

echo "🚀 Démarrage du déploiement MerelFormation..."

# Créer les répertoires de données
mkdir -p data/mysql
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# S'assurer que le répertoire de build existe
mkdir -p app/public/build
mkdir -p app/public/uploads/sessions
mkdir -p app/public/uploads/formations

# Nettoyer les anciens fichiers de build
echo "🧹 Nettoyage des fichiers précédents..."
rm -rf app/public/build/*

# Copier le fichier .env.prod vers .env
cp app/.env.prod app/.env

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

# Attendre le démarrage des conteneurs
echo "⏳ Attente du démarrage des services (20 secondes)..."
sleep 20

# Vérifier si MySQL est prêt
echo "🔄 Vérification de l'état de MySQL..."
until docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost --silent; do
    echo "⏳ En attente de MySQL..."
    sleep 5
done

echo "✅ MySQL est prêt !"

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
echo "🌐 Votre application est accessible sur: http://your-server-ip"
echo "🔧 Admin: http://your-server-ip/admin"
echo "📧 MailHog: http://your-server-ip:8025"
echo ""
echo "📋 Pour vérifier les logs en cas de problème:"
echo "   docker-compose -f docker-compose.prod.yml logs php"
echo "   docker-compose -f docker-compose.prod.yml logs nginx"
echo "   docker-compose -f docker-compose.prod.yml logs mailhog"
