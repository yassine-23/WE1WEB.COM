#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');

console.log('🚀 WE1WEB Production Deployment Checklist\n');
console.log('=' . repeat(50));

let errors = [];
let warnings = [];
let success = [];

// Check 1: Environment variables
console.log('\n📋 Checking environment configuration...');
const envFile = path.join(ROOT_DIR, '.env.production');
const envExampleFile = path.join(ROOT_DIR, '.env.production.example');

if (!fs.existsSync(envFile)) {
  warnings.push('⚠️  No .env.production file found. Make sure to set environment variables in your deployment platform.');
} else {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Check for placeholder values
  if (envContent.includes('your_') || envContent.includes('change_this')) {
    errors.push('❌ Production environment file contains placeholder values!');
  } else {
    success.push('✅ Production environment file configured');
  }
  
  // Check critical variables
  const criticalVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  criticalVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      errors.push(`❌ Missing critical environment variable: ${varName}`);
    }
  });
}

// Check 2: Build output
console.log('\n📦 Checking build output...');
const distDir = path.join(ROOT_DIR, 'dist');
if (!fs.existsSync(distDir)) {
  warnings.push('⚠️  No dist directory found. Run "npm run build" first.');
} else {
  const distFiles = fs.readdirSync(distDir);
  if (distFiles.length === 0) {
    errors.push('❌ Dist directory is empty!');
  } else {
    success.push(`✅ Build output found (${distFiles.length} files)`);
    
    // Check for index.html
    if (!fs.existsSync(path.join(distDir, 'index.html'))) {
      errors.push('❌ No index.html in build output!');
    }
  }
}

// Check 3: Security audit
console.log('\n🔒 Running security audit...');
try {
  const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditResult);
  
  if (audit.metadata.vulnerabilities.critical > 0) {
    errors.push(`❌ ${audit.metadata.vulnerabilities.critical} critical vulnerabilities found!`);
  }
  if (audit.metadata.vulnerabilities.high > 0) {
    warnings.push(`⚠️  ${audit.metadata.vulnerabilities.high} high severity vulnerabilities found`);
  }
  if (audit.metadata.vulnerabilities.critical === 0 && audit.metadata.vulnerabilities.high === 0) {
    success.push('✅ No critical or high vulnerabilities');
  }
} catch (error) {
  // npm audit returns non-zero exit code if vulnerabilities found
  if (error.stdout) {
    try {
      const audit = JSON.parse(error.stdout);
      if (audit.metadata.vulnerabilities.critical > 0) {
        errors.push(`❌ ${audit.metadata.vulnerabilities.critical} critical vulnerabilities found!`);
      }
      if (audit.metadata.vulnerabilities.high > 0) {
        warnings.push(`⚠️  ${audit.metadata.vulnerabilities.high} high severity vulnerabilities found`);
      }
    } catch {
      warnings.push('⚠️  Could not parse security audit results');
    }
  }
}

// Check 4: Console statements
console.log('\n🧹 Checking for console statements...');
const sourceFiles = [];
function findSourceFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !['node_modules', 'dist', '.git'].includes(file)) {
      findSourceFiles(fullPath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx|mjs)$/.test(file)) {
      sourceFiles.push(fullPath);
    }
  });
}

findSourceFiles(path.join(ROOT_DIR, 'client/src'));
findSourceFiles(path.join(ROOT_DIR, 'server'));

let consoleCount = 0;
sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/console\.(log|error|warn|debug|info)/g);
  if (matches) {
    consoleCount += matches.length;
  }
});

if (consoleCount > 0) {
  warnings.push(`⚠️  Found ${consoleCount} console statements in source code. Run "npm run clean:console" to remove them.`);
} else {
  success.push('✅ No console statements in source code');
}

// Check 5: TypeScript errors
console.log('\n📝 Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { cwd: ROOT_DIR, stdio: 'ignore' });
  success.push('✅ No TypeScript errors');
} catch (error) {
  warnings.push('⚠️  TypeScript compilation has errors. Fix them for better stability.');
}

// Check 6: Package.json
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));

if (!packageJson.engines) {
  warnings.push('⚠️  No Node.js version specified in package.json');
} else {
  success.push(`✅ Node.js version specified: ${packageJson.engines.node || 'not set'}`);
}

// Check 7: Git status
console.log('\n🔍 Checking Git status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8', cwd: ROOT_DIR });
  if (gitStatus.trim()) {
    warnings.push('⚠️  Uncommitted changes detected. Commit all changes before deployment.');
  } else {
    success.push('✅ All changes committed');
  }
} catch (error) {
  warnings.push('⚠️  Could not check Git status');
}

// Check 8: SSL and HTTPS
console.log('\n🔐 Checking SSL configuration...');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('http://') && !envContent.includes('localhost')) {
    errors.push('❌ Non-HTTPS URLs found in production config!');
  } else {
    success.push('✅ All URLs use HTTPS');
  }
}

// Final Report
console.log('\n' + '='.repeat(50));
console.log('📊 DEPLOYMENT READINESS REPORT\n');

if (success.length > 0) {
  console.log('✅ PASSED CHECKS:');
  success.forEach(s => console.log('   ' + s));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(w => console.log('   ' + w));
}

if (errors.length > 0) {
  console.log('\n❌ CRITICAL ERRORS:');
  errors.forEach(e => console.log('   ' + e));
}

console.log('\n' + '='.repeat(50));

if (errors.length === 0) {
  console.log('🎉 READY FOR DEPLOYMENT! All critical checks passed.');
  console.log(`   ✅ ${success.length} checks passed`);
  console.log(`   ⚠️  ${warnings.length} warnings (non-critical)`);
  process.exit(0);
} else {
  console.log('🚫 NOT READY FOR DEPLOYMENT!');
  console.log(`   ❌ ${errors.length} critical errors must be fixed`);
  console.log(`   ⚠️  ${warnings.length} warnings to review`);
  process.exit(1);
}