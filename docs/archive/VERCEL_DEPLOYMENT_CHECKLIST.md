# Vercel Deployment Debug Checklist

## 🚨 **Current Issue**
The "tools" and "new onboarding form" are not showing up when deployed to Vercel, despite successful local builds.

## 🔍 **Debugging Steps**

### 1. **Environment Variables Check**
Verify these environment variables are set in your Vercel project settings:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for edge functions)
- `OPENAI_API_KEY` - Your OpenAI API key (for AI features)

**How to check:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify all variables are set correctly
5. Redeploy after adding/updating variables

### 2. **Test the Debug Page**
After deploying, visit: `https://your-domain.vercel.app/tools/debug`

This will show you:
- Which environment variables are set
- System information
- Test links to other pages

### 3. **Check Browser Console**
1. Open your deployed site
2. Open Developer Tools (F12)
3. Check the Console tab for errors
4. Check the Network tab for failed requests

### 4. **Check Vercel Function Logs**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Functions tab
4. Check for any failed function executions

### 5. **Verify Routes**
Test these URLs on your deployed site:
- `/` - Home page
- `/tools` - Tools page
- `/tools/debug` - Debug page
- `/dashboard` - Dashboard (should redirect if not logged in)

## 🛠️ **Common Fixes**

### **Fix 1: Environment Variables**
If environment variables are missing:
```bash
# Add to Vercel dashboard → Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

### **Fix 2: Clear Vercel Cache**
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → General
4. Click "Clear Build Cache"
5. Redeploy

### **Fix 3: Check Build Output**
1. Go to Vercel dashboard
2. Select your project
3. Go to Deployments
4. Click on the latest deployment
5. Check the build logs for any errors

### **Fix 4: Force Redeploy**
```bash
# Add a small change to trigger redeploy
git add .
git commit -m "Force redeploy for debugging"
git push
```

## 🔧 **Code Changes Made**

### **1. Updated `next.config.ts`**
- Added `output: 'standalone'` for better Vercel compatibility
- Added `remotePatterns` for image optimization
- Added better webpack fallbacks
- Disabled telemetry

### **2. Updated `src/middleware.ts`**
- Added explicit handling for `/tools` route
- Improved error handling
- Better route protection logic

### **3. Updated `src/lib/supabase/client.ts`**
- Added environment variable validation
- Better error handling for missing variables

### **4. Added Error Boundaries**
- Wrapped tools page with ErrorBoundary
- Created debug page for troubleshooting

## 🧪 **Testing Steps**

### **Step 1: Local Testing**
```bash
# Test production build locally
npm run build
npm start
```

### **Step 2: Environment Variable Test**
Visit `/tools/debug` to verify environment variables are loaded.

### **Step 3: Route Testing**
Test each route manually:
1. `/` - Should show landing page
2. `/tools` - Should show tools page (with login prompt if not authenticated)
3. `/dashboard` - Should redirect to home if not logged in

### **Step 4: Authentication Test**
1. Try to log in
2. Check if onboarding wizard appears for new users
3. Verify tools are accessible after login

## 📋 **Checklist**

- [ ] Environment variables set in Vercel
- [ ] Debug page accessible at `/tools/debug`
- [ ] No console errors in browser
- [ ] No failed network requests
- [ ] Routes responding correctly
- [ ] Authentication working
- [ ] Onboarding wizard appearing for new users
- [ ] Tools page accessible after login

## 🆘 **If Still Not Working**

### **Option 1: Check Vercel Runtime Logs**
1. Go to Vercel dashboard
2. Select your project
3. Go to Functions tab
4. Check for runtime errors

### **Option 2: Enable Debug Mode**
Add this to your `next.config.ts`:
```typescript
// Add to nextConfig
env: {
  DEBUG: 'true',
},
```

### **Option 3: Contact Vercel Support**
If the issue persists, contact Vercel support with:
- Your project URL
- Build logs
- Runtime logs
- Environment variable status

## 📞 **Next Steps**

1. **Deploy the updated code**
2. **Check the debug page** at `/tools/debug`
3. **Verify environment variables** are set
4. **Test all routes** manually
5. **Check browser console** for errors
6. **Report back** with findings from debug page

The debug page will help us identify exactly what's going wrong on Vercel. 