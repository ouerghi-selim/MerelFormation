#!/usr/bin/env php
<?php

/**
 * 🧹 Script de nettoyage des documents directs orphelins
 * 
 * Ce script identifie et soft-delete les documents directs qui pointent
 * vers des utilisateurs qui ont été soft-deleted.
 * 
 * Problème résolu: Les documents directs avec uploadedBy pointant vers
 * des utilisateurs supprimés causent des erreurs 500 dans l'API.
 * 
 * Usage: php cleanup_orphaned_documents.php [--dry-run] [--force]
 */

require_once __DIR__ . '/app/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;
use Doctrine\ORM\EntityManagerInterface;
use App\Kernel;
use App\Entity\Document;
use App\Entity\User;

// Chargement de l'environnement
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

// Arguments en ligne de commande
$dryRun = in_array('--dry-run', $argv);
$force = in_array('--force', $argv);

if (!$force && !$dryRun) {
    echo "⚠️  ATTENTION: Ce script va modifier les données de production.\n";
    echo "Usage:\n";
    echo "  --dry-run : Simulation sans modification\n";
    echo "  --force   : Exécution réelle\n";
    exit(1);
}

// Initialisation de Symfony
$kernel = new Kernel($_ENV['APP_ENV'], (bool) $_ENV['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();

/** @var EntityManagerInterface $em */
$em = $container->get('doctrine.orm.entity_manager');

echo "🧹 " . ($dryRun ? "SIMULATION" : "NETTOYAGE") . " des documents directs orphelins\n";
echo "=====================================\n\n";

// Désactiver temporairement le filtre Gedmo pour voir les utilisateurs soft-deleted
$filters = $em->getFilters();
if ($filters->has('softdeleteable')) {
    $filters->disable('softdeleteable');
    echo "✅ Filtre Gedmo SoftDeleteable désactivé temporairement\n";
}

try {
    // 1. Identifier les documents directs avec uploadedBy soft-deleted
    echo "🔍 Recherche des documents avec uploadedBy soft-deleted...\n";
    
    $orphanedDocsQuery = $em->createQuery('
        SELECT d FROM App\\Entity\\Document d
        JOIN d.uploadedBy u
        WHERE u.deletedAt IS NOT NULL
        AND d.deletedAt IS NULL
        AND d.source = :directSource
    ');
    $orphanedDocsQuery->setParameter('directSource', 'direct');
    
    $orphanedDocs = $orphanedDocsQuery->getResult();
    
    echo "📊 Trouvé: " . count($orphanedDocs) . " documents directs orphelins\n\n";
    
    if (count($orphanedDocs) === 0) {
        echo "✅ Aucun document orphelin trouvé. Base de données propre !\n";
        exit(0);
    }
    
    // 2. Afficher les détails
    echo "📋 Détails des documents orphelins:\n";
    echo "------------------------------------\n";
    
    $userStats = [];
    foreach ($orphanedDocs as $doc) {
        /** @var Document $doc */
        $uploadedBy = $doc->getUploadedBy();
        $userId = $uploadedBy ? $uploadedBy->getId() : 'NULL';
        $userEmail = $uploadedBy ? $uploadedBy->getEmail() : 'N/A';
        $deletedAt = $uploadedBy && $uploadedBy->getDeletedAt() ? 
            $uploadedBy->getDeletedAt()->format('Y-m-d H:i:s') : 'N/A';
        
        echo sprintf(
            "  📄 Document #%d: %s\n      👤 Uploadé par: %s (ID: %s, supprimé le: %s)\n\n",
            $doc->getId(),
            $doc->getTitle(),
            $userEmail,
            $userId,
            $deletedAt
        );
        
        if (!isset($userStats[$userId])) {
            $userStats[$userId] = [
                'email' => $userEmail,
                'deletedAt' => $deletedAt,
                'count' => 0
            ];
        }
        $userStats[$userId]['count']++;
    }
    
    // 3. Statistiques par utilisateur
    echo "📈 Statistiques par utilisateur supprimé:\n";
    echo "----------------------------------------\n";
    foreach ($userStats as $userId => $stats) {
        echo sprintf(
            "  👤 %s (ID: %s) - %d documents - supprimé le: %s\n",
            $stats['email'],
            $userId,
            $stats['count'],
            $stats['deletedAt']
        );
    }
    echo "\n";
    
    // 4. Nettoyage (ou simulation)
    if ($dryRun) {
        echo "🔍 MODE SIMULATION - Aucune modification effectuée\n";
        echo "Pour exécuter le nettoyage: php cleanup_orphaned_documents.php --force\n";
    } else {
        echo "🧹 NETTOYAGE EN COURS...\n";
        
        $cleanedCount = 0;
        foreach ($orphanedDocs as $doc) {
            /** @var Document $doc */
            // Soft-delete le document avec la même date que l'utilisateur
            $uploadedBy = $doc->getUploadedBy();
            $deletedAt = $uploadedBy ? $uploadedBy->getDeletedAt() : new \DateTime();
            
            $doc->setDeletedAt($deletedAt);
            $em->persist($doc);
            $cleanedCount++;
            
            echo sprintf(
                "  ✅ Document #%d '%s' soft-deleted\n",
                $doc->getId(),
                $doc->getTitle()
            );
        }
        
        $em->flush();
        
        echo "\n🎉 NETTOYAGE TERMINÉ !\n";
        echo "📊 {$cleanedCount} documents directs orphelins ont été soft-deleted\n";
        echo "💡 Ces documents seront automatiquement restaurés si les utilisateurs sont restaurés\n";
    }

} catch (\Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
} finally {
    // Réactiver le filtre Gedmo
    if ($filters->has('softdeleteable')) {
        $filters->enable('softdeleteable');
        echo "\n✅ Filtre Gedmo SoftDeleteable réactivé\n";
    }
}

echo "\n✨ Script terminé avec succès !\n";