#!/bin/bash

# Script de déploiement pour MerelFormation
# À exécuter sur le serveur de production

# Créer les répertoires de données
mkdir -p data/mysql
mkdir -p data/certbot/conf
mkdir -p data/certbot/www
mkdir -p app/public/build  # Créer le répertoire pour les fichiers frontend

# Copier le fichier .env.prod vers .env
cp app/.env.prod app/.env

# Construction du frontend
echo "Construction du frontend..."
docker-compose -f docker-compose.prod.yml run --rm node

# Vérifier que les fichiers ont été générés
echo "Vérification des fichiers frontend..."
if [ ! -f "app/public/build/index.html" ]; then
  echo "ERREUR: Le build frontend n'a pas généré index.html"
  echo "Contenu du répertoire build:"
  ls -la app/public/build
  exit 1
fi
echo "✅ Build frontend réussi!"

# Lancer les conteneurs
docker-compose -f docker-compose.prod.yml up -d nginx php mysql

# Attendre le démarrage des conteneurs MySQL
echo "Attente du démarrage de MySQL (30 secondes)..."
sleep 30

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

# Vérifier les permissions des fichiers statiques
docker-compose -f docker-compose.prod.yml exec nginx chmod -R 755 /var/www/public/build

# Afficher l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

echo "Déploiement terminé avec succès!"