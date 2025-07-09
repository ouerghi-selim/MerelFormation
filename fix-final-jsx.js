#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixJSXErrors(content) {
  let fixed = content;

  // 1. Fixer les balises h2/h3 avec dangerouslySetInnerHTML mais pas auto-fermantes
  fixed = fixed.replace(
    /(<h[1-6] [^>]*dangerouslySetInnerHTML=\{[^}]+\}\}[^>]*>)\s*<\/h[1-6]>/g,
    (match, openTag) => openTag.replace('>', ' />')
  );

  // 2. Fixer les éléments avec dangerouslySetInnerHTML suivis de / /
  fixed = fixed.replace(
    /dangerouslySetInnerHTML=\{[^}]+\}\} \/ \/\s*<\/[^>]+>/g,
    (match) => {
      const dangAttr = match.match(/dangerouslySetInnerHTML=\{[^}]+\}\}/)[0];
      return dangAttr + ' />';
    }
  );

  // 3. Fixer les span avec dangerouslySetInnerHTML mal formés
  fixed = fixed.replace(
    /<span dangerouslySetInnerHTML=\{[^}]+\}\} \/>\s*<\/span>/g,
    (match) => {
      const dangAttr = match.match(/dangerouslySetInnerHTML=\{[^}]+\}\}/)[0];
      return `<span ${dangAttr} />`;
    }
  );

  // 4. Fixer les balises span sans fermeture appropriée dans les labels
  fixed = fixed.replace(
    /<span dangerouslySetInnerHTML=\{[^}]+\}\} \/(?!\>)/g,
    (match) => match.replace(' /', ' />')
  );

  // 5. Fixer les éléments avec des structures cassées après les scripts
  fixed = fixed.replace(
    /dangerouslySetInnerHTML=\{[^}]+\}\}\s*\/\s*\/>\s*<\/[^>]+>/g,
    (match) => {
      const dangAttr = match.match(/dangerouslySetInnerHTML=\{[^}]+\}\}/)[0];
      return dangAttr + ' />';
    }
  );

  // 6. Nettoyer les balises de fermeture orphelines
  fixed = fixed.replace(
    /\s+<\/[^>]+>\s*\/\s*\/>\s*<\/[^>]+>/g,
    ' />'
  );

  // 7. Fixer les fermetures de balises manquantes dans les labels
  fixed = fixed.replace(
    /(<span className="flex items-center">\s*<[^>]+\/>\s*<span dangerouslySetInnerHTML=\{[^}]+\}\} \/>)\s*(<input|<\/label>)/g,
    '$1\n                                            </span>\n                                $2'
  );

  return fixed;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixJSXErrors(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`  ✅ Fixed JSX errors in ${filePath}`);
    } else {
      console.log(`  ⏭️  No fixes needed in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

// Liste des fichiers à traiter
const filesToProcess = [
  'frontend/src/pages/contact-page.tsx'
];

console.log('🚀 Starting final JSX fix...\n');

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

console.log('✅ Final JSX fix completed!');