#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour corriger les erreurs JSX dangerouslySetInnerHTML
function fixDangerouslySetInnerHTML(content) {
  // Pattern pour trouver les éléments avec dangerouslySetInnerHTML qui ont aussi du contenu
  const pattern = /(<[^>]+dangerouslySetInnerHTML=\{[^}]+\}\}[^>]*>)\s*(<\/[^>]+>)/g;
  
  // Remplacer par des éléments auto-fermants
  let fixedContent = content.replace(pattern, (match, openTag, closeTag) => {
    // Supprimer le > de fin et ajouter />
    const selfClosingTag = openTag.replace(/>$/, ' />');
    return selfClosingTag;
  });

  // Pattern plus spécifique pour les cas complexes avec plusieurs lignes
  const multilinePattern = /(<[^>]+\s+dangerouslySetInnerHTML=\{\{[^}]+\}\}[^>]*>)\s*\n?\s*(<\/[^>]+>)/gs;
  
  fixedContent = fixedContent.replace(multilinePattern, (match, openTag, closeTag) => {
    const selfClosingTag = openTag.replace(/>$/, '\n                    />');
    return selfClosingTag;
  });

  return fixedContent;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixDangerouslySetInnerHTML(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`  ✅ Fixed JSX syntax in ${filePath}`);
    } else {
      console.log(`  ⏭️  No fixes needed in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

// Liste des fichiers à traiter
const filesToProcess = [
  'frontend/src/pages/location/LocationPage.tsx',
  'frontend/src/pages/contact-page.tsx',
  'frontend/src/pages/formations-page.tsx',
  'frontend/src/pages/home-page.tsx'
];

console.log('🚀 Starting JSX syntax fix...\n');

// Traiter chaque fichier
filesToProcess.forEach(relativePath => {
  const fullPath = path.join(__dirname, relativePath);
  
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
    console.log('');
  } else {
    console.log(`❌ File not found: ${fullPath}\n`);
  }
});

console.log('✅ JSX syntax fix completed!');