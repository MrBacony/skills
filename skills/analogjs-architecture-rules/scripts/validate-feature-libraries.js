#!/usr/bin/env node

/**
 * validate-feature-libraries.js
 * 
 * Validates feature library internal structure:
 * - Required public API files (index.ts, server.ts)
 * - Directory structure (data-access, ui, store, pages, etc.)
 * - Proper exports from public APIs
 * 
 * Usage: node scripts/validate-feature-libraries.js [--strict]
 * Exit code: 0 (pass), 1 (warnings), 2 (errors)
 */

import fs from 'fs';
import path from 'path';

// Use process.cwd() instead of __dirname for better portability
const rootDir = process.cwd();
const strict = process.argv.includes('--strict');
const libsDir = path.join(rootDir, 'libs');

let errors = [];
let warnings = [];
let info = [];

const RECOMMENDED_DIRS = [
  'data-access',
  'store',
  'ui',
  'pages',
  'models',
  'types',
  'validation',
  'dialogs',
  'backend',
];

const REQUIRED_FILES = {
  'src/index.ts': 'Frontend public API (should export components, services, stores, types)',
  'src/server.ts': 'Backend public API (should export repositories, validators, DTOs)',
};

function validateIndexExports(filePath, featureName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for basic export patterns
    const hasExports = content.includes('export');
    if (!hasExports) {
      warnings.push(`Feature "${featureName}" index.ts has no exports`);
    }

    // Check for internal path exports (should use relative imports)
    if (content.includes('export * from')) {
      info.push(`Feature "${featureName}" uses star exports`);
    }

    // Check for proper component exports
    const hasComponentExport = content.includes('export') && content.includes('Component');
    const hasServiceExport = content.includes('export') && content.includes('Service');
    const hasStoreExport = content.includes('export') && (content.includes('store') || content.includes('Store'));

    if (!hasComponentExport && !hasServiceExport && !hasStoreExport) {
      warnings.push(`Feature "${featureName}" may be missing expected exports (components, services, or stores)`);
    }

  } catch (err) {
    errors.push(`Feature "${featureName}" unable to read index.ts: ${err.message}`);
  }
}

function validateServerExports(filePath, featureName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasExports = content.includes('export');
    if (!hasExports) {
      warnings.push(`Feature "${featureName}" server.ts has no exports`);
    }

  } catch (err) {
    warnings.push(`Feature "${featureName}" unable to read server.ts: ${err.message}`);
  }
}

function validateFeatureLibrary(featureName, featurePath) {
  const srcPath = path.join(featurePath, 'src');
  const libPath = path.join(srcPath, 'lib');

  // Check required files
  Object.entries(REQUIRED_FILES).forEach(([file, description]) => {
    const filePath = path.join(srcPath, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Feature "${featureName}" missing required file "${file}"\n    → ${description}`);
    } else {
      if (file === 'src/index.ts') {
        validateIndexExports(filePath, featureName);
      } else if (file === 'src/server.ts') {
        validateServerExports(filePath, featureName);
      }
    }
  });

  // Check directory structure
  if (fs.existsSync(libPath)) {
    const libContents = fs.readdirSync(libPath).filter(f => {
      const fullPath = path.join(libPath, f);
      return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
    });

    libContents.forEach(dir => {
      if (!RECOMMENDED_DIRS.includes(dir)) {
        warnings.push(`Feature "${featureName}" has unexpected directory "lib/${dir}" (expected: ${RECOMMENDED_DIRS.join(', ')})`);
      }
    });

    // Check if has at least some recommended structure
    const hasRecommendedStructure = libContents.some(dir => RECOMMENDED_DIRS.includes(dir));
    if (libContents.length > 0 && !hasRecommendedStructure) {
      warnings.push(`Feature "${featureName}" lib directory does not follow recommended structure`);
    } else if (libContents.length > 0) {
      info.push(`Feature "${featureName}" structure validated (${libContents.join(', ')})`);
    }
  }

  // Check for pages directory
  const pagesPath = path.join(srcPath, 'pages');
  if (fs.existsSync(pagesPath)) {
    const pageFiles = fs.readdirSync(pagesPath).filter(f => f.endsWith('.page.ts'));
    if (pageFiles.length > 0) {
      info.push(`Feature "${featureName}" has ${pageFiles.length} page routes`);
    }
  }
}

function validateFeatureLibraries() {
  const featuresDir = path.join(libsDir, 'features');
  
  if (!fs.existsSync(featuresDir)) {
    info.push('No libs/features directory found');
    return;
  }

  const features = fs.readdirSync(featuresDir).filter(f => {
    const fullPath = path.join(featuresDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  if (features.length === 0) {
    info.push('No feature libraries found in libs/features');
    return;
  }

  features.forEach(featureName => {
    const featurePath = path.join(featuresDir, featureName);
    validateFeatureLibrary(featureName, featurePath);
  });
}

function checkCircularDependencies() {
  const featuresDir = path.join(libsDir, 'features');
  if (!fs.existsSync(featuresDir)) return;

  const features = fs.readdirSync(featuresDir).filter(f => {
    const fullPath = path.join(featuresDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  const importMap = {};

  features.forEach(featureName => {
    const indexPath = path.join(featuresDir, featureName, 'src', 'index.ts');
    if (!fs.existsSync(indexPath)) return;

    const content = fs.readFileSync(indexPath, 'utf-8');
    const imports = content.match(/@feature\/\w+/g) || [];
    importMap[featureName] = imports.map(imp => imp.replace('@feature/', ''));
  });

  // Check for circular dependencies
  features.forEach(featureName => {
    const imports = importMap[featureName] || [];
    imports.forEach(importedFeature => {
      const importedImports = importMap[importedFeature] || [];
      if (importedImports.includes(featureName)) {
        errors.push(`Circular dependency detected: "${featureName}" ↔ "${importedFeature}"`);
      }
    });
  });

  if (Object.keys(importMap).length > 0) {
    info.push(`✓ Checked ${Object.keys(importMap).length} features for circular dependencies`);
  }
}

// Main execution
console.log('\n📋 Feature Library Validation\n');

validateFeatureLibraries();
checkCircularDependencies();

// Output results
if (info.length > 0) {
  console.log('ℹ️  Info:');
  info.forEach(msg => console.log('  ' + msg));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(msg => console.log('  ' + msg));
  console.log();
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(msg => console.log('  ' + msg));
  console.log();
}

// Summary
const summary = {
  errors: errors.length,
  warnings: warnings.length,
  info: info.length,
  timestamp: new Date().toISOString(),
};

console.log(`📊 Summary: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} checks passed\n`);

// Exit codes
if (errors.length > 0 || (strict && warnings.length > 0)) {
  process.exit(2);
} else if (warnings.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
