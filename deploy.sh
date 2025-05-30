#!/bin/bash

# Script de déploiement pour MerelFormation

# Créer les répertoires de données
mkdir -p data/mysql
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# S'assurer que le répertoire de build existe
mkdir -p app/public/build

# Nettoyer les anciens fichiers de build
echo "Nettoyage des fichiers précédents..."
rm -rf app/public/build/*

# Copier le fichier .env.prod vers .env
cp app/.env.prod app/.env

# Construction du frontend
echo "Construction du frontend..."
docker-compose -f docker-compose.prod.yml run --rm node

# Vérifier que les fichiers ont été générés
echo "Vérification des fichiers frontend..."
if [ ! -f "app/public/build/index.html" ]; then
  echo "ERREUR: Le build frontend n'a pas généré index.html"
  ls -la app/public/build
  exit 1
fi

# Vérifier que l'index.html fait référence aux bons fichiers
echo "Vérification des références dans index.html..."
grep -oE "assets/[^\"']*\.(js|css)" app/public/build/index.html

# Lister les fichiers dans le répertoire assets
echo "Fichiers assets générés:"
ls -la app/public/build/assets/

# Lancer les conteneurs
docker-compose -f docker-compose.prod.yml up -d nginx php mysql

# Attendre le démarrage des conteneurs MySQL (temps augmenté)
echo "Attente du démarrage de MySQL (10 secondes)..."
sleep 10

# Vérifier si MySQL est prêt
echo "Vérification de l'état de MySQL..."
until docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost --silent; do
    echo "En attente de MySQL..."
    sleep 5
done

echo "MySQL est prêt ! Installation des dépendances..."

# Installer les dépendances Symfony
docker-compose -f docker-compose.prod.yml exec php composer install --no-dev --optimize-autoloader

# Vider le cache Symfony
docker-compose -f docker-compose.prod.yml exec php php bin/console cache:clear --env=prod

# Exécuter les migrations
docker-compose -f docker-compose.prod.yml exec php php bin/console doctrine:migrations:migrate --no-interaction

# Charger les fixtures avec la commande personnalisée
echo "Chargement des fixtures de données de démonstration..."
docker-compose -f docker-compose.prod.yml exec php php bin/console app:fixtures:load --no-interaction

# Vérifier les permissions des fichiers statiques
docker-compose -f docker-compose.prod.yml exec nginx chmod -R 755 /var/www/public/build

# Afficher l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

echo "Déploiement terminé avec succès!"
echo "L'application est maintenant disponible avec des données de démonstration."