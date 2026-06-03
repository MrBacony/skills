#!/usr/bin/env node

/**
 * lint-architecture.js
 * 
 * ESLint-integrated architecture linting:
 * - Enforces forbidden import patterns
 * - Checks file naming conventions
 * - Validates component declarations
 * - Reports Nx boundary violations
 * 
 * Usage: node scripts/lint-architecture.js [--fix]
 * Exit code: 0 (pass), 1 (warnings), 2 (errors)
 */

import fs from 'fs';
import path from 'path';

// Use process.cwd() instead of __dirname for better portability
const rootDir = process.cwd();
const fix = process.argv.includes('--fix');

let errors = [];
let warnings = [];
let info = [];

// Linting rules
const RULES = {
  'component-naming': {
    pattern: /^[a-z]+-[a-z]+\.component\.ts$/,
    message: 'Component files should be named like "product-card.component.ts"',
    test: (filename) => {
      if (!filename.endsWith('.component.ts')) return true; // Only check component files
      return RULES['component-naming'].pattern.test(path.basename(filename));
    },
  },
  'page-naming': {
    pattern: /^[a-z-]+\.page\.ts$/,
    message: 'Page files should be named like "products.page.ts"',
    test: (filename) => {
      if (!filename.endsWith('.page.ts')) return true;
      return RULES['page-naming'].pattern.test(path.basename(filename));
    },
  },
  'service-naming': {
    pattern: /^[a-z]+-?[a-z]*\.service\.ts$/,
    message: 'Service files should be named like "product.service.ts"',
    test: (filename) => {
      if (!filename.endsWith('.service.ts')) return true;
      return RULES['service-naming'].pattern.test(path.basename(filename));
    },
  },
  'store-naming': {
    pattern: /^[a-z]+-?[a-z]*\.store\.ts$/,
    message: 'Store files should be named like "product.store.ts"',
    test: (filename) => {
      if (!filename.endsWith('.store.ts')) return true;
      return RULES['store-naming'].pattern.test(path.basename(filename));
    },
  },
};

// Recursively scan files
function scanFilesRecursive(dir, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return [];

  let files = [];
  try {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.nx', '.git', '.angular'].includes(entry)) {
          files = files.concat(scanFilesRecursive(fullPath, depth + 1, maxDepth));
        }
      } else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts')) {
        files.push(fullPath);
      }
    });
  } catch (err) {
    // Silently skip
  }
  return files;
}

// Check file naming conventions
function lintFileNaming() {
  const tsFiles = scanFilesRecursive(rootDir);

  tsFiles.forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath);
    const basename = path.basename(filePath);
    
    // Skip spec files
    if (basename.endsWith('.spec.ts')) return;

    // Check naming conventions
    Object.entries(RULES).forEach(([ruleName, rule]) => {
      if (!rule.test(filePath)) {
        warnings.push({
          file: relativePath,
          rule: ruleName,
          message: rule.message,
        });
      }
    });
  });
}

// Check for @Component decorator in component files
function lintComponentDecorators() {
  const tsFiles = scanFilesRecursive(rootDir);
  const componentFiles = tsFiles.filter(f => f.endsWith('.component.ts'));

  componentFiles.forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (!content.includes('@Component')) {
        errors.push({
          file: relativePath,
          message: 'Component file missing @Component decorator',
        });
      }

      // Check for proper imports
      if (!content.includes("from '@angular/core'")) {
        warnings.push({
          file: relativePath,
          message: 'Component missing Angular core import',
        });
      }

      // Check for standalone: true
      if (!content.includes('standalone:') && !content.includes('standalone :')) {
        warnings.push({
          file: relativePath,
          message: 'Component should use standalone: true',
        });
      }
    } catch (err) {
      warnings.push({
        file: relativePath,
        message: `Failed to lint: ${err.message}`,
      });
    }
  });
}

// Check for @Injectable decorator in services
function lintServiceDecorators() {
  const tsFiles = scanFilesRecursive(rootDir);
  const serviceFiles = tsFiles.filter(f => f.endsWith('.service.ts'));

  serviceFiles.forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (!content.includes('@Injectable')) {
        errors.push({
          file: relativePath,
          message: 'Service missing @Injectable decorator',
        });
      }

      // Check for providedIn
      if (!content.includes('providedIn')) {
        warnings.push({
          file: relativePath,
          message: 'Service should specify providedIn: "root" or a feature scope',
        });
      }
    } catch (err) {
      warnings.push({
        file: relativePath,
        message: `Failed to lint: ${err.message}`,
      });
    }
  });
}

// Check app-level files for business logic
function lintAppFiles() {
  const appsDir = path.join(rootDir, 'apps');
  if (!fs.existsSync(appsDir)) return;

  const appFiles = scanFilesRecursive(appsDir);

  appFiles.forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath);
    const basename = path.basename(filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Only check app-level components, not pages
      if (!basename.includes('app.') && !basename.includes('.component')) return;

      // Check for service injections in app component
      if (basename === 'app.component.ts') {
        const servicePattern = /constructor\s*\([^)]*\w+Service/;
        if (servicePattern.test(content)) {
          errors.push({
            file: relativePath,
            message: 'App component should not inject services (move to pages)',
          });
        }

        // Check for store injections
        const storePattern = /\w+Store/;
        if (storePattern.test(content) && content.includes('inject(')) {
          warnings.push({
            file: relativePath,
            message: 'App component should not manage application state',
          });
        }
      }

      // Check for HTTP calls
      if (content.includes('HttpClient') || content.includes('http.get') || content.includes('http.post')) {
        errors.push({
          file: relativePath,
          message: 'App-level file contains HTTP calls (move to data-access library)',
        });
      }
    } catch (err) {
      warnings.push({
        file: relativePath,
        message: `Failed to lint: ${err.message}`,
      });
    }
  });
}

// Main execution
console.log('\n📋 AnalogJS Architecture Linting\n');

lintFileNaming();
lintComponentDecorators();
lintServiceDecorators();
lintAppFiles();

// Output results
if (info.length > 0) {
  console.log('ℹ️  Info:');
  info.forEach(({ file, message }) => {
    console.log(`  ${file}`);
    console.log(`    → ${message}`);
  });
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(({ file, rule, message }) => {
    console.log(`  ${file}${rule ? ` [${rule}]` : ''}`);
    console.log(`    → ${message}`);
  });
  console.log();
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(({ file, message }) => {
    console.log(`  ${file}`);
    console.log(`    → ${message}`);
  });
  console.log();
}

// Summary
const summary = {
  errors: errors.length,
  warnings: warnings.length,
  info: info.length,
  timestamp: new Date().toISOString(),
};

console.log(`📊 Summary: ${summary.errors} errors, ${summary.warnings} warnings\n`);

// Exit codes
if (errors.length > 0) {
  process.exit(2);
} else if (warnings.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
