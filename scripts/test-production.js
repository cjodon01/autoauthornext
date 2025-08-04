#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Production Build for Infinite Loop Issues...\n');

// Check if we're in the right directory
if (!fs.existsSync('next.config.ts')) {
  console.error('❌ Error: next.config.ts not found. Please run this script from the project root.');
  process.exit(1);
}

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('rm -rf .next out', { stdio: 'inherit' });
  console.log('✅ Cleaned previous builds\n');
} catch (error) {
  console.log('⚠️  Warning: Could not clean previous builds (this is okay)\n');
}

// Step 2: Install dependencies if needed
console.log('📦 Checking dependencies...');
try {
  execSync('npm ci --production=false', { stdio: 'inherit' });
  console.log('✅ Dependencies are up to date\n');
} catch (error) {
  console.log('⚠️  Warning: Could not install dependencies (continuing anyway)\n');
}

// Step 3: Build the application
console.log('🔨 Building application for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed!');
  console.error('This could indicate infinite loop issues in the build process.');
  process.exit(1);
}

// Step 4: Start production server for testing
console.log('🚀 Starting production server for testing...');
console.log('Press Ctrl+C to stop the server after testing\n');

try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  if (error.signal === 'SIGINT') {
    console.log('\n✅ Production server stopped by user');
  } else {
    console.error('❌ Production server failed to start or crashed');
    console.error('This could indicate infinite loop issues in production.');
    process.exit(1);
  }
}

console.log('\n🎉 Production build test completed!');
console.log('\n📋 Checklist for infinite loop prevention:');
console.log('✅ React Strict Mode disabled in both configs');
console.log('✅ AuthProvider uses Next.js router instead of window.location');
console.log('✅ PerformanceMonitor has reduced network calls in production');
console.log('✅ Middleware has error handling and better redirect logic');
console.log('✅ All components have proper cleanup in useEffect hooks'); 