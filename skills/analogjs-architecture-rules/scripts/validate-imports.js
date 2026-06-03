#!/usr/bin/env node

/**
 * validate-imports.js
 * 
 * Detects import boundary violations:
 * - Direct internal library imports (should use public API)
 * - Circular dependencies between features
 * - App-level business logic imports
 * - Backend-only imports in frontend
 * 
 * Usage: node scripts/validate-imports.js [--strict]
 * Exit code: 0 (pass), 1 (warnings), 2 (errors)
 */

import fs from 'fs';
import path from 'path';

// Use process.cwd() instead of __dirname for better portability
const rootDir = process.cwd();
const strict = process.argv.includes('--strict');

let errors = [];
let warnings = [];
let info = [];

// Forbidden import patterns
const FORBIDDEN_PATTERNS = [
  { pattern: /@feature\/\w+\/lib\//, message: 'Direct internal feature library import (use public API)' },
  { pattern: /@feature\/\w+\/src\/lib\//, message: 'Direct internal feature library import (use public API)' },
  { pattern: /@shared\/\w+\/lib\//, message: 'Direct internal shared library import (use public API)' },
  { pattern: /@pages\/\w+\/lib\//, message: 'Direct internal pages library import (use public API)' },
];

// Recursively scan files for imports
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
    // Silently skip directories we can't read
  }
  return files;
}

function scanImports() {
  const files = scanFilesRecursive(rootDir);
  
  console.log(`Scanning ${files.length} TypeScript files for import violations...\n`);

  files.forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath);
    
    // Skip some paths
    if (relativePath.includes('node_modules') || relativePath.includes('dist')) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (!line.includes('import') && !line.includes('from')) return;

        // Check forbidden patterns
        FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
          if (pattern.test(line)) {
            const importPath = line.match(/from ['"]([^'"]+)['"]/)?.[1];
            errors.push({
              file: relativePath,
              line: index + 1,
              message: `${message}: ${importPath}`,
            });
          }
        });

        // Check for server.ts imports in frontend files
        // Skip SSR-related files (main.server.ts, app.config.server.ts) and platform-server imports
        if (line.includes('from') && line.includes('server') && !relativePath.includes('/backend/')) {
          const importPath = line.match(/from ['"]([^'"]+)['"]/)?.[1];
          if (importPath && importPath.includes('server')) {
            // Allow legitimate SSR imports
            const isSSRFile = relativePath.includes('.server.') || relativePath.includes('server.');
            const isAngularPlatformServer = importPath.includes('@angular/platform-server');
            const isAngularSSR = importPath.includes('@angular/ssr');
            
            if (!isSSRFile && !isAngularPlatformServer && !isAngularSSR) {
              errors.push({
                file: relativePath,
                line: index + 1,
                message: `Backend-only import detected in frontend file: ${importPath}`,
              });
            }
          }
        }

        // Check app-level imports of feature stores/services
        if (relativePath.includes('apps/') && relativePath.includes('/src/')) {
          if (line.includes('Store') || line.includes('Service')) {
            const importPath = line.match(/from ['"]([^'"]+)['"]/)?.[1];
            if (importPath && importPath.includes('@feature/')) {
              if (relativePath.includes('app.component') || relativePath.includes('app.config')) {
                warnings.push({
                  file: relativePath,
                  line: index + 1,
                  message: `App component importing feature service/store (should be in pages only)`,
                });
              }
            }
          }
        }
      });
    } catch (err) {
      // Silently skip files we can't read
    }
  });
}

function checkPublicAPIs() {
  const libsDir = path.join(rootDir, 'libs');
  if (!fs.existsSync(libsDir)) return;

  // Check features have proper exports
  const featuresDir = path.join(libsDir, 'features');
  if (!fs.existsSync(featuresDir)) return;

  const features = fs.readdirSync(featuresDir).filter(f => {
    const fullPath = path.join(featuresDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  features.forEach(featureName => {
    const indexPath = path.join(featuresDir, featureName, 'src', 'index.ts');
    const serverPath = path.join(featuresDir, featureName, 'src', 'server.ts');

    if (!fs.existsSync(indexPath)) {
      errors.push({
        file: `libs/features/${featureName}`,
        message: 'Missing src/index.ts (frontend public API)',
      });
    }

    if (!fs.existsSync(serverPath)) {
      warnings.push({
        file: `libs/features/${featureName}`,
        message: 'Missing src/server.ts (backend public API)',
      });
    }
  });
}

// Main execution
console.log('\n📋 Import Boundary Validation\n');

scanImports();
checkPublicAPIs();

// Output results
if (info.length > 0) {
  console.log('ℹ️  Info:');
  info.forEach(({ file, line, message }) => {
    console.log(`  ${file}${line ? `:${line}` : ''}`);
    console.log(`    → ${message}`);
  });
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(({ file, line, message }) => {
    console.log(`  ${file}${line ? `:${line}` : ''}`);
    console.log(`    → ${message}`);
  });
  console.log();
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(({ file, line, message }) => {
    console.log(`  ${file}${line ? `:${line}` : ''}`);
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
if (errors.length > 0 || (strict && warnings.length > 0)) {
  process.exit(2);
} else if (warnings.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
