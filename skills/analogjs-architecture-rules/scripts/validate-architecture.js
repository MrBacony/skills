#!/usr/bin/env node

/**
 * validate-architecture.js
 * 
 * Validates AnalogJS application and feature library architecture.
 * Checks:
 * - Apps contain only bootstrap files (main.ts, app.config.ts, etc.)
 * - Feature libraries follow the recommended directory structure
 * - No business logic in apps
 * 
 * Usage: node scripts/validate-architecture.js [--strict]
 * Exit code: 0 (pass), 1 (warnings), 2 (errors)
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const appsDir = path.join(rootDir, 'apps');
const libsDir = path.join(rootDir, 'libs');
const strict = process.argv.includes('--strict');

let errors = [];
let warnings = [];
let info = [];

const ALLOWED_APP_FILES = [
  'main.ts',
  'main.server.ts',
  'app.config.ts',
  'app.config.server.ts',
  'app.component.ts',
  'index.html',
  'styles.css',
  'styles.scss',
  'test-setup.ts',
  'vite-env.d.ts',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'project.json',
  '.eslintrc.json',
  'eslint.config.js',
  'README.md',
  'tailwind.config.ts',
  'postcss.config.cjs',
  'nx.json',
];

const ALLOWED_APP_DIRECTORIES = [
  'src',
  'dist',
  'public',
  'styles',
  'assets',
  'node_modules',
  '.nx',
  '.eslintrc.json',
];

// Allowed directories inside src/app/ (AnalogJS structure)
const ALLOWED_APP_SRC_DIRECTORIES = [
  'app',
  'environments',
  'assets',
  'styles',
];

const FEATURE_LIBRARY_STRUCTURE = [
  'lib/data-access',
  'lib/store',
  'lib/ui',
  'lib/pages',
  'lib/models',
  'lib/types',
  'lib/validation',
  'lib/dialogs',
  'lib/backend',
];

const REQUIRED_FEATURE_EXPORTS = ['index.ts', 'server.ts'];

// Check apps
function validateApps() {
  if (!fs.existsSync(appsDir)) {
    info.push('✓ No apps directory found');
    return;
  }

  const apps = fs.readdirSync(appsDir).filter(f => {
    const fullPath = path.join(appsDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  apps.forEach(appName => {
    const appPath = path.join(appsDir, appName);
    const srcPath = path.join(appPath, 'src');

    if (!fs.existsSync(srcPath)) {
      info.push(`⚠ App "${appName}" has no src directory`);
      return;
    }

    // Check for forbidden directories in app src/app/
    const appDir = path.join(srcPath, 'app');
    const forbiddenDirs = ['lib', 'services', 'components', 'models', 'store', 'features'];
    
    if (fs.existsSync(appDir)) {
      forbiddenDirs.forEach(dir => {
        const dirPath = path.join(appDir, dir);
        if (fs.existsSync(dirPath)) {
          errors.push(`✗ App "${appName}" contains forbidden directory "src/app/${dir}" (business logic belongs in feature libraries)`);
        }
      });
    }
    
    // Also check directly under src/ for backwards compat
    forbiddenDirs.forEach(dir => {
      const dirPath = path.join(srcPath, dir);
      if (fs.existsSync(dirPath)) {
        errors.push(`✗ App "${appName}" contains forbidden directory "src/${dir}" (business logic belongs in feature libraries)`);
      }
    });

    // Check app structure
    const srcContents = fs.readdirSync(srcPath);
    srcContents.forEach(file => {
      const fullPath = path.join(srcPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile()) {
        if (!ALLOWED_APP_FILES.includes(file) && !file.startsWith('.')) {
          warnings.push(`⚠ App "${appName}" contains unexpected file "src/${file}"`);
        }
      }
    });

    info.push(`✓ App "${appName}" structure validated`);
  });
}

// Check feature libraries
function validateFeatureLibraries() {
  if (!fs.existsSync(libsDir)) {
    info.push('✓ No libs directory found');
    return;
  }

  const featuresDir = path.join(libsDir, 'features');
  if (!fs.existsSync(featuresDir)) {
    info.push('⚠ No libs/features directory found');
    return;
  }

  const features = fs.readdirSync(featuresDir).filter(f => {
    const fullPath = path.join(featuresDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  features.forEach(featureName => {
    const featurePath = path.join(featuresDir, featureName);
    const srcPath = path.join(featurePath, 'src');
    const libPath = path.join(srcPath, 'lib');

    if (!fs.existsSync(srcPath)) {
      warnings.push(`⚠ Feature "${featureName}" has no src directory`);
      return;
    }

    // Check for required public API files
    REQUIRED_FEATURE_EXPORTS.forEach(file => {
      const filePath = path.join(srcPath, file);
      if (!fs.existsSync(filePath)) {
        errors.push(`✗ Feature "${featureName}" missing required file "src/${file}"`);
      }
    });

    // Check for lib structure
    if (fs.existsSync(libPath)) {
      const libContents = fs.readdirSync(libPath);
      const hasRecommendedStructure = libContents.some(dir =>
        FEATURE_LIBRARY_STRUCTURE.some(struct => struct.startsWith('lib/' + dir))
      );

      if (libContents.length > 0 && !hasRecommendedStructure) {
        warnings.push(`⚠ Feature "${featureName}" does not follow recommended directory structure`);
      }

      info.push(`✓ Feature "${featureName}" structure validated (${libContents.length} subdirectories)`);
    } else {
      warnings.push(`⚠ Feature "${featureName}" has no lib directory`);
    }
  });
}

// Check no circular structure issues
function validateStructure() {
  if (!fs.existsSync(libsDir)) return;

  // Check that features are in features/ and not directly in libs/
  const libContents = fs.readdirSync(libsDir).filter(f => {
    const fullPath = path.join(libsDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  libContents.forEach(name => {
    if (!['features', 'shared', 'pages', 'config'].includes(name)) {
      warnings.push(`⚠ Unexpected directory "libs/${name}" (expected to be in libs/features/ or similar)`);
    }
  });
}

// Main execution
console.log('\n📋 AnalogJS Architecture Validation\n');

validateApps();
validateFeatureLibraries();
validateStructure();

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
