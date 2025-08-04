#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build optimization...\n');

// Step 1: Clean previous builds
console.log('1️⃣ Cleaning previous builds...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Previous builds cleaned\n');
} catch (error) {
  console.log('⚠️ No previous builds to clean\n');
}

// Step 2: Type checking
console.log('2️⃣ Running TypeScript type checking...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checking passed\n');
} catch (error) {
  console.error('❌ Type checking failed');
  process.exit(1);
}

// Step 3: Linting
console.log('3️⃣ Running ESLint...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.warn('⚠️ Linting warnings detected, continuing...\n');
}

// Step 4: Production build
console.log('4️⃣ Building for production...');
const startTime = Date.now();
try {
  execSync('npm run build', { stdio: 'inherit' });
  const buildTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`✅ Production build completed in ${buildTime}s\n`);
} catch (error) {
  console.error('❌ Production build failed');
  process.exit(1);
}

// Step 5: Analyze bundle size
console.log('5️⃣ Analyzing bundle size...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  try {
    const { execSync } = require('child_process');
    
    // Get build info
    const buildManifest = path.join(nextDir, 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
      console.log('📊 Build Analysis:');
      console.log(`- Pages: ${Object.keys(manifest.pages).length}`);
      console.log(`- Static files generated`);
    }

    // Check for static directory
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(path.join(staticDir, 'chunks')).filter(f => f.endsWith('.js'));
      console.log(`- JavaScript chunks: ${chunks.length}`);
      
      // Calculate total bundle size
      let totalSize = 0;
      chunks.forEach(chunk => {
        const filePath = path.join(staticDir, 'chunks', chunk);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });
      
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`- Total JS bundle size: ${totalSizeMB}MB`);
      
      if (totalSize > 5 * 1024 * 1024) {
        console.warn('⚠️ Bundle size is large (>5MB). Consider code splitting.');
      }
    }
    
    console.log('✅ Bundle analysis completed\n');
  } catch (error) {
    console.warn('⚠️ Bundle analysis failed, but build succeeded\n');
  }
}

// Step 6: Performance recommendations
console.log('6️⃣ Performance Recommendations:');
console.log('📈 To improve performance:');
console.log('   - Use dynamic imports for large components');
console.log('   - Implement image optimization with next/image');
console.log('   - Add service worker for caching');
console.log('   - Use code splitting for route-based chunks');
console.log('   - Monitor Core Web Vitals in production\n');

console.log('🎉 Production build optimization completed successfully!');
console.log('💡 Run `npm run build:analyze` to see detailed bundle analysis');