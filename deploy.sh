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

# Attendre le démarrage des conteneurs MySQL (temps augmenté)
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

# Afficher l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

echo "Déploiement terminé avec succès!"