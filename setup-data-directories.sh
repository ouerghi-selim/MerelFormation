#!/bin/bash

# Script pour vérifier et créer les répertoires de données nécessaires
# Utilisation: ./setup-data-directories.sh

echo "🗂️ Configuration des répertoires de données pour MerelFormation..."

# Créer les répertoires de données s'ils n'existent pas
mkdir -p data/mysql
echo "✅ Répertoire data/mysql créé/vérifié"

# Vérifier les permissions
echo "🔍 Vérification des permissions..."

# Afficher les informations sur le répertoire
if [ -d "data/mysql" ]; then
    echo "📁 Répertoire data/mysql existe et est prêt"
    ls -la data/
else
    echo "❌ Erreur : Répertoire data/mysql non créé"
    exit 1
fi

echo ""
echo "🎉 Configuration terminée avec succès !"
echo ""
echo "📋 Instructions pour tester la persistance des données :"
echo "   1. Démarrer : docker-compose up -d"
echo "   2. Créer des données de test dans la base"
echo "   3. Arrêter : docker-compose down"
echo "   4. Redémarrer : docker-compose up -d"
echo "   5. Vérifier que les données sont toujours présentes"
echo ""
echo "⚠️ Note importante :"
echo "   - docker-compose down : Garde les données (volume conservé)"
echo "   - docker-compose down -v : Supprime TOUT (volumes supprimés)"
echo ""
