# Variables
DOCKER_COMPOSE = docker compose
PHP_CONTAINER = merel_php
MYSQL_CONTAINER = merel_mysql
NGINX_CONTAINER = merel_nginx
NODE_CONTAINER = merel_node

.PHONY: help install docker-* symfony-* node-*

help: ## Afficher l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# Docker commands
docker-up: ## Démarrer tous les conteneurs
	$(DOCKER_COMPOSE) up -d

docker-down: ## Arrêter tous les conteneurs
	$(DOCKER_COMPOSE) down

docker-build: ## Construire les images
	$(DOCKER_COMPOSE) build

docker-logs: ## Afficher les logs de tous les conteneurs
	$(DOCKER_COMPOSE) logs -f

# Conteneur PHP
docker-php: ## Accéder au conteneur PHP
	docker exec -it $(PHP_CONTAINER) bash

docker-php-logs: ## Logs du conteneur PHP
	docker logs -f $(PHP_CONTAINER)

# Conteneur MySQL
docker-mysql: ## Accéder au conteneur MySQL
	docker exec -it $(MYSQL_CONTAINER) bash

docker-mysql-logs: ## Logs du conteneur MySQL
	docker logs -f $(MYSQL_CONTAINER)

# Conteneur Node
docker-node: ## Accéder au conteneur Node
	docker exec -it $(NODE_CONTAINER) bash

docker-node-logs: ## Logs du conteneur Node
	docker logs -f $(NODE_CONTAINER)

# Commandes Symfony
symfony-console: ## Exécuter une commande Symfony console
	docker exec -it $(PHP_CONTAINER) php bin/console $(cmd)

symfony-composer: ## Exécuter une commande Composer
	docker exec -it $(PHP_CONTAINER) composer $(cmd)

symfony-cache-clear: ## Nettoyer le cache Symfony
	docker exec -it $(PHP_CONTAINER) php bin/console cache:clear

symfony-migrate: ## Exécuter les migrations
	docker exec -it $(PHP_CONTAINER) php bin/console doctrine:migrations:migrate --no-interaction

symfony-diff: ## Exécuter les migrations
	docker exec -it $(PHP_CONTAINER) php bin/console doctrine:migrations:diff --no-interaction

fixtures:
	docker exec -it $(PHP_CONTAINER) php bin/console doctrine:fixtures:load

# Commandes Node/NPM
node-install: ## Installer les dépendances Node
	docker exec -it $(NODE_CONTAINER) npm install

node-dev: ## Démarrer le serveur de développement
	docker exec -it $(NODE_CONTAINER) npm run dev

node-build: ## Construire pour la production
	docker exec -it $(NODE_CONTAINER) npm run build

# Utilitaires
logs: ## Voir les logs d'un conteneur spécifique (usage: make logs service=php)
	docker logs -f merel_$(service)

restart: ## Redémarrer un conteneur spécifique (usage: make restart service=php)
	docker restart merel_$(service)

ps: ## Voir l'état des conteneurs
	$(DOCKER_COMPOSE) ps

# Default
.DEFAULT_GOAL := help