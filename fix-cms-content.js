#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour transformer une ligne avec getContent
function transformGetContentLine(line) {
  // Pattern pour détecter les lignes avec getContent dans du JSX
  const patterns = [
    // Pattern: {getContent('id', 'fallback')}
    {
      regex: /(\s*)\{getContent\(([^)]+)\)\}/g,
      replacement: (match, indent, params) => {
        return `${indent}dangerouslySetInnerHTML={{__html: getContent(${params})}}`;
      }
    },
    // Pattern: title={getContent('id', 'fallback')}
    {
      regex: /(\w+)=\{getContent\(([^)]+)\)\}/g,
      replacement: (match, prop, params) => {
        if (prop === 'dangerouslySetInnerHTML') return match; // Déjà transformé
        return `${prop}={{}} dangerouslySetInnerHTML={{__html: getContent(${params})}}`;
      }
    }
  ];

  let transformedLine = line;
  
  // Appliquer les transformations
  patterns.forEach(pattern => {
    transformedLine = transformedLine.replace(pattern.regex, pattern.replacement);
  });

  return transformedLine;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let hasChanges = false;
    
    const transformedLines = lines.map(line => {
      // Skip lines that already have dangerouslySetInnerHTML
      if (line.includes('dangerouslySetInnerHTML')) {
        return line;
      }
      
      // Skip lines that are imports or function definitions
      if (line.includes('import') || line.includes('const getContent =') || line.includes('getContentDescription')) {
        return line;
      }
      
      const transformedLine = transformGetContentLine(line);
      if (transformedLine !== line) {
        hasChanges = true;
        console.log(`  TRANSFORMED: ${line.trim()}`);
        console.log(`  TO:          ${transformedLine.trim()}`);
      }
      
      return transformedLine;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, transformedLines.join('\n'), 'utf8');
      console.log(`  ✅ Updated ${filePath}`);
    } else {
      console.log(`  ⏭️  No changes needed in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

// Fonction pour traiter manuellement les cas complexes
function processComplexCases(filePath) {
  console.log(`Manual processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Transformations spécifiques pour les cas complexes
    const complexTransformations = [
      // JSX avec getContent seul
      {
        from: />\s*\{getContent\(([^)]+)\)\}\s*</g,
        to: (match, params) => `><span dangerouslySetInnerHTML={{__html: getContent(${params})}}></span><`
      },
      // Labels dans les éléments
      {
        from: />\s*\{getContent\(([^)]+)\)\}\s*$/gm,
        to: (match, params) => ` dangerouslySetInnerHTML={{__html: getContent(${params})}}>`
      }
    ];

    complexTransformations.forEach(transform => {
      const newContent = content.replace(transform.from, transform.to);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Manual updates applied to ${filePath}`);
    } else {
      console.log(`  ⏭️  No manual changes needed in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error in manual processing ${filePath}:`, error.message);
  }
}

// Liste des fichiers à traiter
const filesToProcess = [
  'frontend/src/pages/contact-page.tsx',
  'frontend/src/pages/location/LocationPage.tsx'
];

console.log('🚀 Starting CMS content transformation...\n');

// Traiter chaque fichier
filesToProcess.forEach(relativePath => {
  const fullPath = path.join(__dirname, relativePath);
  
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
    // processComplexCases(fullPath);
    console.log('');
  } else {
    console.log(`❌ File not found: ${fullPath}\n`);
  }
});

console.log('✅ CMS content transformation completed!');
console.log('\n📝 Manual fixes may still be needed for:');
console.log('  - Complex JSX structures');
console.log('  - Nested getContent calls');
console.log('  - Component props that need special handling');
console.log('\n🧪 Please test the pages after running this script!');