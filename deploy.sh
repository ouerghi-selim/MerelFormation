#!/bin/bash

# Script de déploiement pour MerelFormation
# À exécuter sur le serveur de production

# Créer les répertoires de données
mkdir -p data/mysql
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# Copier le fichier .env.prod vers .env
cp app/.env.prod app/.env

# Lancer les conteneurs
docker-compose -f docker-compose.prod.yml up -d

# Attendre le démarrage des conteneurs
echo "Attente du démarrage des conteneurs..."
sleep 10

# Installer les dépendances Symfony
docker-compose -f docker-compose.prod.yml exec php composer install --no-dev --optimize-autoloader

# Vider le cache Symfony
docker-compose -f docker-compose.prod.yml exec php php bin/console cache:clear --env=prod

# Exécuter les migrations
docker-compose -f docker-compose.prod.yml exec php php bin/console doctrine:migrations:migrate --no-interaction

# Afficher l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

echo "Déploiement terminé avec succès!"