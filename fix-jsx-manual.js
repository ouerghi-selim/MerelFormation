#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour corriger manuellement les erreurs JSX spécifiques
function fixSpecificJSXErrors(content) {
  let fixedContent = content;

  // Fixer les balises span malformées dans les éléments
  fixedContent = fixedContent.replace(
    /<span dangerouslySetInnerHTML=\{\{__html: ([^}]+)\}\} \/\s*\/>\s*<\/span>/g,
    '<span dangerouslySetInnerHTML={{__html: $1}} />'
  );

  // Fixer les éléments avec dangerouslySetInnerHTML malformés
  fixedContent = fixedContent.replace(
    /(\s+dangerouslySetInnerHTML=\{\{__html: [^}]+\}\}) \/\s*\/>\s*<\/[^>]+>/g,
    '$1 />'
  );

  // Fixer les éléments auto-fermants malformés
  fixedContent = fixedContent.replace(
    / \/\s*\/>\s*<\/[^>]+>/g,
    ' />'
  );

  // Fixer les cas où il y a du contenu entre les balises avec dangerouslySetInnerHTML
  fixedContent = fixedContent.replace(
    /(<[^>]+dangerouslySetInnerHTML=\{[^}]+\}\}[^>]*>)\s*\n?\s*dangerouslySetInnerHTML=\{[^}]+\}\}\s*\n?\s*(<\/[^>]+>)/g,
    '$1$2'
  );

  // Corriger les éléments div/p/h2/h3 avec des attributs dangerouslySetInnerHTML mais pas auto-fermants
  fixedContent = fixedContent.replace(
    /(<(h[1-6]|p|div) [^>]*dangerouslySetInnerHTML=\{[^}]+\}\}[^>]*>)\s*(<\/\2>)/g,
    (match, openTag, tagName, closeTag) => {
      return openTag.replace('>', ' />');
    }
  );

  return fixedContent;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixSpecificJSXErrors(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`  ✅ Fixed specific JSX errors in ${filePath}`);
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

console.log('🚀 Starting manual JSX fix...\n');

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

console.log('✅ Manual JSX fix completed!');