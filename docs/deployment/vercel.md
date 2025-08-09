# Vercel Deployment Guide

## 🚀 **Production Deployment**

AutoAuthor is optimized for deployment on Vercel with Next.js 15.4.5 and includes production-ready configurations for performance, security, and scalability.

---

## 📋 **Pre-Deployment Checklist**

### **✅ Required Environment Variables**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Analytics & Monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Optional: External APIs
OPENAI_API_KEY=your-openai-key
```

### **✅ Build Verification**
```bash
# Verify build succeeds
npm run build

# Check bundle analysis
npm run build:analyze

# Test production server locally
npm run start
```

### **✅ Performance Checks**
- [ ] Lighthouse score > 90
- [ ] Bundle size < 2MB total
- [ ] Image optimization enabled
- [ ] Core Web Vitals optimized

---

## 🌐 **Vercel Configuration**

### **Project Settings**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "regions": ["iad1"],
  "functions": {
    "app/**": {
      "maxDuration": 30
    }
  }
}
```

### **Build Configuration**
```typescript
// next.config.ts production settings
const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 31536000
  }
};
```

---

## 🔄 **Deployment Process**

### **1. Automatic Deployment (Recommended)**
```bash
# Connect GitHub repository to Vercel
# Push to main branch triggers automatic deployment

git add .
git commit -m "feat: production updates"
git push origin main
```

### **2. Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel inspect [deployment-url]
```

### **3. Environment Variables Setup**
```bash
# Set via Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Or via Vercel Dashboard:
# https://vercel.com/[team]/[project]/settings/environment-variables
```

---

## 🛡️ **Security Configuration**

### **Security Headers**
```typescript
// next.config.ts security headers
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ];
}
```

### **Environment Security**
- ✅ Service role keys in secure environment variables
- ✅ API keys not exposed to client
- ✅ CORS properly configured
- ✅ Supabase RLS policies enabled

---

## 📊 **Performance Optimization**

### **Vercel Edge Functions**
```typescript
// edge-runtime configuration for API routes
export const config = {
  runtime: 'edge',
  regions: ['iad1'] // Washington DC for optimal US performance
};
```

### **Caching Strategy**
```typescript
// Static asset caching
export default function page() {
  return (
    <div>
      {/* Cached for 1 year */}
      <Image 
        src="/logo.png" 
        alt="Logo"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

// API route caching
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
    }
  });
}
```

### **Bundle Optimization**
```bash
# Analyze bundle size
npm run build:analyze

# Check for unnecessary dependencies
npx depcheck

# Optimize images
npx @next/codemod new-link ./
```

---

## 🔍 **Monitoring & Analytics**

### **Vercel Analytics**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### **Performance Monitoring**
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### **Error Tracking**
```typescript
// Error boundary for production
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}) {
  // Log error to monitoring service
  console.error('Production error:', error);
  
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
```

---

## 🌍 **Domain & DNS Configuration**

### **Custom Domain Setup**
1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Configure DNS Records**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Includes Let's Encrypt SSL
   - Auto-renewal enabled

### **Subdomain Configuration**
```bash
# API subdomain for edge functions
api.yourdomain.com → [project].vercel.app/api

# CDN subdomain for assets
cdn.yourdomain.com → [project].vercel.app/_next/static
```

---

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Integration**
```yml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### **Branch Previews**
- **Feature Branches**: Automatic preview deployments
- **Pull Requests**: Preview URLs for testing
- **Main Branch**: Production deployment

---

## 📈 **Scaling Considerations**

### **Function Limits**
```typescript
// Vercel function configuration
export const config = {
  maxDuration: 30, // seconds
  memory: 1024,    // MB
  regions: ['iad1'] // Single region for consistency
};
```

### **Database Connection Pooling**
```typescript
// Supabase connection optimization
const supabase = createClient(url, anonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
```

### **Edge Function Distribution**
- Deployed to Vercel's global edge network
- Automatic region selection based on user location
- Sub-200ms response times globally

---

## 🚨 **Production Troubleshooting**

### **Common Deployment Issues**

1. **Build Failures**
   ```bash
   # Check build logs
   vercel logs [deployment-url]
   
   # Local build test
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # List current env vars
   vercel env ls
   
   # Pull env vars locally for testing
   vercel env pull .env.local
   ```

3. **Function Timeouts**
   ```typescript
   // Optimize long-running functions
   export const config = {
     maxDuration: 30
   };
   ```

4. **Memory Limits**
   ```bash
   # Monitor function memory usage
   vercel inspect [deployment-url]
   ```

### **Performance Issues**
- Check Vercel Analytics for Core Web Vitals
- Monitor function execution times
- Analyze bundle size with `npm run build:analyze`
- Use Vercel Speed Insights for real user metrics

---

## 📊 **Post-Deployment Verification**

### **Health Checks**
```bash
# Test main routes
curl https://yourdomain.com/
curl https://yourdomain.com/api/ping
curl https://yourdomain.com/dashboard

# Check response times
curl -w "@curl-format.txt" -s -o /dev/null https://yourdomain.com/
```

### **Performance Verification**
- **Lighthouse CI**: Automated performance testing
- **WebPageTest**: Real device testing
- **Vercel Analytics**: Real user monitoring

### **Security Verification**
```bash
# Check security headers
curl -I https://yourdomain.com/

# SSL certificate check
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

---

*Last Updated: August 8, 2025*
*Deployment Status: Production Ready ✅*