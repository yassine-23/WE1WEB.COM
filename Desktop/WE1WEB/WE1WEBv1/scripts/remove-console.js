#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTORIES_TO_CLEAN = [
  path.join(__dirname, '../client/src'),
  path.join(__dirname, '../server')
];

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

let filesProcessed = 0;
let consolesRemoved = 0;

function removeConsoleStatements(content) {
  let modifiedContent = content;
  let localConsolesRemoved = 0;

  // Pattern to match console.log, console.error, console.warn, console.debug, console.info
  const consolePatterns = [
    /console\.(log|error|warn|debug|info)\([^)]*\);?/g,
    /console\.(log|error|warn|debug|info)\([^}]*\);?/g,
    /console\.(log|error|warn|debug|info)\s*\([^)]*\)[^;]*;/g
  ];

  consolePatterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      localConsolesRemoved += matches.length;
      modifiedContent = modifiedContent.replace(pattern, '// [REMOVED_CONSOLE]');
    }
  });

  return { modifiedContent, localConsolesRemoved };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { modifiedContent, localConsolesRemoved } = removeConsoleStatements(content);
    
    if (localConsolesRemoved > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      consolesRemoved += localConsolesRemoved;
      console.log(`✓ Processed ${path.relative(process.cwd(), filePath)} - Removed ${localConsolesRemoved} console statements`);
    }
    
    filesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(directory) {
  try {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          walkDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (FILE_EXTENSIONS.includes(ext)) {
          processFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.error(`✗ Error walking directory ${directory}:`, error.message);
  }
}

console.log('🧹 Starting console statement removal for production build...\n');

DIRECTORIES_TO_CLEAN.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Processing directory: ${path.relative(process.cwd(), dir)}`);
    walkDirectory(dir);
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Console removal complete!`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Console statements removed: ${consolesRemoved}`);
console.log('='.repeat(50));

if (consolesRemoved === 0) {
  console.log('ℹ️  No console statements found to remove. Code is already clean!');
}