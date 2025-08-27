#!/bin/bash

# Script de migration vers Gedmo SoftDelete
# Usage: ./migrate_gedmo.sh

echo "🚀 Migration vers Gedmo SoftDelete"

# Liste des entités à migrer (ordre d'importance)
ENTITIES=(
    "Vehicle"
    "Formation" 
    "Company"
    "Invoice"
    "VehicleRental"
    "Session"
    "Reservation"
    "User"
)

# Fonction pour ajouter Gedmo à une entité
migrate_entity() {
    local entity=$1
    local file="/home/seoue/web/perso/MerelFormation/app/src/Entity/${entity}.php"
    
    echo "📄 Migration de l'entité: $entity"
    
    if [ ! -f "$file" ]; then
        echo "❌ Fichier non trouvé: $file"
        return 1
    fi
    
    # Backup
    cp "$file" "${file}.backup"
    
    # Ajouter les imports Gedmo si pas déjà présents
    if ! grep -q "use Gedmo" "$file"; then
        sed -i '/use Doctrine\\ORM\\Mapping as ORM;/a use Gedmo\\Mapping\\Annotation as Gedmo;\nuse Gedmo\\SoftDeleteable\\Traits\\SoftDeleteableEntity;' "$file"
    fi
    
    # Ajouter l'annotation SoftDeleteable si pas déjà présente
    if ! grep -q "SoftDeleteable" "$file"; then
        sed -i '/^class /i #[Gedmo\\SoftDeleteable(fieldName: '\''deletedAt'\'', timeAware: false, hardDelete: true)]' "$file"
    fi
    
    # Ajouter le trait si pas déjà présent
    if ! grep -q "use SoftDeleteableEntity" "$file"; then
        sed -i '/^class.*{/a \    use SoftDeleteableEntity; // ✅ Trait Gedmo SoftDelete' "$file"
    fi
    
    echo "✅ $entity migré"
}

# Migrer chaque entité
for entity in "${ENTITIES[@]}"; do
    migrate_entity "$entity"
done

echo ""
echo "🔄 Génération de la migration..."
docker exec merel_php php bin/console doctrine:migrations:diff

echo ""
echo "✅ Migration Gedmo terminée !"
echo "📝 Prochaines étapes:"
echo "   1. Vérifier les fichiers modifiés"
echo "   2. Exécuter: docker exec merel_php php bin/console doctrine:migrations:migrate"
echo "   3. Tester le fonctionnement"