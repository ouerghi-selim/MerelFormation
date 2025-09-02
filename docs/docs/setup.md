# Mise en place & Environnement

## Démarrage rapide
1. `git clone`  
2. Docker : `docker-compose up -d`  
3. Backend : `cd app && composer install`  
4. Frontend : `cd frontend && npm install`  
5. Base : `php bin/console doctrine:migrations:migrate`  
6. Données démo : `php bin/console doctrine:fixtures:load`

## Arborescence (résumé)
- `app/` (Symfony) : `src/` (Controller, Entity, Repository, Service) · `config/` · `migrations/`
- `frontend/` (React) : `src/` (components, pages, services, contexts, types)
- `docker/` · `docker-compose.yml` · `deploy.sh`

## Branches
`main` · `develop` · `feature/cms-content-management` · `feature/notification-system` · `feature/api-controllers`

## Comptes de test
- **Admin** : `admin@merelformation.com`
- **Student** : `student@merelformation.com`
- **Instructor** : `instructor@merelformation.com`

## URLs CMS
- `/admin/content/texts`
- `/admin/content/testimonials`
- `/admin/content/faq`