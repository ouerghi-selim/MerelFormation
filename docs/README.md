# MerelFormation — Documentation condensée & réorganisée

> _Source of truth_ compacte issue du nettoyage de la documentation (suppression de redites, harmonisation des noms, regroupement par thèmes).  
> **Dernière mise à jour** : 26 août 2025

## Sommaire
- [Aperçu & Pile technique](docs/overview.md)
- [Architecture fonctionnelle & Modèle de données](docs/architecture.md)
- [Workflows & Règles métiers](docs/workflows.md)
- [API (extraits utiles)](docs/api.md)
- [Mise en place & Environnement](docs/setup.md)
- [Cartographie des interfaces](docs/ui.md)
- [Journal des changements](docs/changelog.md)
- [Roadmap](docs/roadmap.md)
- [Annexes](docs/annexes.md)
- [Bugfixes & Corrections détaillées](docs/bugfixes-details.md)
- [Controllers & Routes Map](docs/controllers-routes.md)

## Démarrage rapide
```bash
# Clone
git clone https://github.com/ouerghi-selim/MerelFormation
cd MerelFormation

# Docker
docker-compose up -d

# Backend
cd app && composer install

# Frontend
cd ../frontend && npm install

# Base de données
php ../app/bin/console doctrine:migrations:migrate

# Données de démonstration
php ../app/bin/console doctrine:fixtures:load
```

## Contribuer
- Ajouter les nouveautés dans **docs/changelog.md** (mensuel), éviter les sections dupliquées.
- Lorsque vous modifiez des libellés ou statuts, mettez à jour **docs/workflows.md** et **docs/annexes.md** (le cas échéant).
- Favoriser des PR petites et atomiques.

---

© MerelFormation. Ce dépôt rassemble la documentation nettoyée au 02 September 2025.