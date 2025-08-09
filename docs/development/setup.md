# Development Setup Guide

## 🛠️ **Prerequisites**

### **System Requirements**
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **VS Code**: Recommended editor

### **Required Environment Variables**
Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

---

## 🚀 **Installation**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd nextjs-migration
```

### **2. Install Dependencies**
```bash
# Install all dependencies
npm install

# Verify installation
npm run type-check
```

### **3. Database Setup**
```bash
# Run Supabase migrations (if needed)
npx supabase db reset

# Verify database connection
npm run db:check
```

---

## 💻 **Development Commands**

### **Core Commands**
```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:watch
```

### **Build Commands**
```bash
# Development build
npm run build

# Optimized production build
npm run build:optimized

# Bundle analysis
npm run build:analyze

# Start production server
npm start
```

---

## 🔧 **Development Tools**

### **VS Code Extensions** (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### **VS Code Settings**
Add to `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)",
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## 🌐 **Development Server**

### **Starting Development**
```bash
npm run dev
```

The development server will start on:
- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000

### **Hot Reload Features**
- ✅ **React Fast Refresh** - Instant component updates
- ✅ **CSS Hot Reload** - Live Tailwind updates
- ✅ **TypeScript Incremental** - Fast type checking
- ✅ **API Route Updates** - Backend changes without restart

---

## 🔍 **Debugging**

### **Browser DevTools**
1. **React Developer Tools** - Component inspection
2. **Next.js DevTools** - Performance profiling
3. **Network Tab** - API request monitoring
4. **Console** - Error logging and debugging

### **Debug Configuration**
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## 📊 **Performance Monitoring**

### **Development Metrics**
```bash
# Bundle analysis
npm run build:analyze

# Performance profiling
npm run dev -- --profile

# Memory usage monitoring
npm run dev -- --inspect
```

### **Key Performance Indicators**
- **Build Time**: < 15 seconds
- **Hot Reload Time**: < 200ms
- **Initial Page Load**: < 1 second
- **Memory Usage**: < 512MB

---

## 🚨 **Common Development Issues**

### **Node.js Version Issues**
```bash
# Check Node version
node --version

# Use Node Version Manager
nvm use 18
nvm install 18.17.0
```

### **Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Use different port
npm run dev -- -p 3001
```

### **TypeScript Errors**
```bash
# Clear TypeScript cache
rm -rf .next/cache
rm tsconfig.tsbuildinfo

# Restart TypeScript server in VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### **Module Resolution Issues**
```bash
# Clear all caches
rm -rf .next node_modules package-lock.json
npm install
```

---

## 🔧 **Development Workflow**

### **Recommended Workflow**
1. **Pull Latest Changes**
   ```bash
   git pull origin main
   npm install
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Process**
   ```bash
   npm run dev         # Start development
   npm run type-check  # Verify types
   npm run lint        # Check code quality
   npm run test        # Run tests
   ```

4. **Pre-commit Checks**
   ```bash
   npm run build       # Ensure build works
   npm run lint:fix    # Fix linting issues
   git add .
   git commit -m "feat: your feature description"
   ```

---

## 📝 **Code Standards**

### **File Naming Conventions**
- **Components**: `PascalCase.tsx`
- **Pages**: `kebab-case/page.tsx`
- **Utilities**: `camelCase.ts`
- **Constants**: `UPPER_SNAKE_CASE.ts`

### **Import Organization**
```typescript
// 1. External libraries
import React from 'react';
import { motion } from 'framer-motion';

// 2. Internal utilities
import { createClient } from '../lib/supabase/client';

// 3. Components
import Button from './Button';

// 4. Types
import type { User } from '../lib/supabase/types';
```

---

## 📱 **Mobile Development**

### **Testing Responsive Design**
```bash
# Start with network access
npm run dev -- --hostname 0.0.0.0

# Test on mobile devices
# Navigate to: http://[your-ip]:3000
```

### **Device Testing Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

---

*Last Updated: August 8, 2025*
*Development Status: Production Ready ✅*