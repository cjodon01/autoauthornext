# Common Issues & Solutions

## 🚨 **Critical Issues Resolved**

### **1. AI Models Not Loading**
**Problem**: AI models stuck on "Loading..." in campaign creation modal
```
Error: aiModels.find is not a function
```

**Root Cause**: Overcomplicated useAiModels hook with complex fallback logic

**Solution**: 
```typescript
// BEFORE: Complex hook with 179 lines
const useAiModels = () => {
  // Complex error handling, fallbacks, etc.
}

// AFTER: Simple working implementation (28 lines)
export function useAiModels() {
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      const { data, error } = await supabase.from('ai_models').select('*');
      if (error) {
        console.error('[useAiModels] Error fetching models:', error);
      } else {
        setAiModels(data || []);
      }
      setLoading(false);
    };
    fetchModels();
  }, []);

  return { aiModels, loading };
}
```

**Files Fixed**: `src/hooks/useAiModels.ts`

---

### **2. Token Balance Not Clickable**
**Problem**: Token balance in navbar wasn't opening pricing modal

**Root Cause**: Missing onTokenClick handler in AuthenticatedNavbar usage

**Solution**:
```typescript
// BEFORE: Missing onTokenClick
<AuthenticatedNavbar
  onLogout={handleLogout}
  userEmail={user?.email}
/>

// AFTER: Added onTokenClick handler
<AuthenticatedNavbar
  onLogout={handleLogout}
  onTokenClick={() => setShowTokenModal(true)}
  userEmail={user?.email}
/>
```

**Files Fixed**: 
- `src/components/ui/TokenBalance.tsx`
- `src/app/dashboard/DashboardClient.tsx`
- All tool pages

---

### **3. Campaign Creation UUID Errors**
**Problem**: 
```
Error: invalid input syntax for type uuid: ""
```

**Root Cause**: Empty strings being passed as UUIDs to database

**Solution**:
```typescript
// BEFORE: Empty strings passed to database
const campaignData = {
  brand_id: formData.brandId, // Could be empty string
  ai_model_for_general_campaign: formData.ai_model_for_general_campaign // Could be empty string
};

// AFTER: Explicit null handling
const campaignData = {
  brand_id: formData.brandId && formData.brandId.trim() !== '' ? formData.brandId : null,
  ai_model_for_general_campaign: formData.ai_model_for_general_campaign && formData.ai_model_for_general_campaign.trim() !== '' ? formData.ai_model_for_general_campaign : null,
};
```

**Files Fixed**: `src/components/dashboard/CreateBotModal.tsx`

---

### **4. Account Names vs Account IDs**
**Problem**: Showing `account_id` instead of `account_name` for social connections

**Solution**:
```typescript
// BEFORE: Using account_id
<div>{connection.account_id}</div>

// AFTER: Using account_name with fallback
<div>{connection.account_name || connection.account_id || 'Personal Account'}</div>
```

**Files Fixed**: 
- `src/components/dashboard/steps/GoalPlatformStep.tsx`
- `src/lib/supabase/types.ts` (added account_name field)

---

## 🔧 **Build & Development Issues**

### **5. Build Compilation Errors**
**Problem**: Build failing due to old app directory inclusion

**Solution**:
```bash
# Remove old app directory from build
mv oldapp oldapp_reference
# Or completely remove it
rm -rf oldapp_reference
```

**Files Fixed**: 
- `next.config.ts` (excluded oldapp from webpack)
- `.nextignore` (added exclusion patterns)

---

### **6. TypeScript Errors**
**Problem**: Parameter type errors in array methods
```
Error: Parameter 'm' implicitly has an 'any' type
```

**Solution**:
```typescript
// BEFORE: Implicit typing
const selectedModel = aiModels.find(m => m.id === modelId);

// AFTER: Explicit typing
const selectedModel = aiModels.find((m: any) => m.id === modelId);
```

---

### **7. Module Resolution Issues**
**Problem**: Import path conflicts between Vite and Next.js

**Solution**:
```json
// tsconfig.json paths configuration
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🚨 **Runtime Issues**

### **8. Hydration Mismatches**
**Problem**: Server/client render differences causing hydration errors

**Solution**:
```typescript
// Proper SSR handling
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <LoadingSpinner />; // or null
}

return <ClientComponent />;
```

---

### **9. Environment Variables**
**Problem**: Vite env vars not working in Next.js

**Solution**:
```bash
# BEFORE (Vite)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# AFTER (Next.js)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### **10. Modal Scroll Issues**
**Problem**: Background scrolling when modal is open

**Solution**:
```typescript
// Lock body scroll when modal opens
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen]);
```

**Files Fixed**: All modal components

---

## 🔍 **Debugging Steps**

### **General Debugging Process**
1. **Check Console Logs**: Look for JavaScript errors
2. **Network Tab**: Verify API calls are working
3. **React DevTools**: Inspect component state
4. **Supabase Logs**: Check edge function execution

### **Common Debug Commands**
```bash
# Clear all caches
rm -rf .next node_modules package-lock.json
npm install

# Type checking
npm run type-check

# Lint checking
npm run lint

# Build test
npm run build
```

### **Browser DevTools Shortcuts**
- **F12**: Open DevTools
- **Ctrl+Shift+C**: Inspect element
- **Ctrl+Shift+I**: Toggle DevTools
- **Ctrl+Shift+J**: Console tab
- **Ctrl+Shift+E**: Network tab

---

## 📊 **Performance Issues**

### **11. Slow Page Loads**
**Problem**: Pages loading slowly in development

**Solution**:
- Use dynamic imports for heavy components
- Optimize image sizes
- Enable Next.js optimizations

```typescript
// Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

### **12. Bundle Size Issues**
**Problem**: Large bundle sizes affecting performance

**Solution**:
```bash
# Analyze bundle
npm run build:analyze

# Optimize imports
npm run build:optimized
```

---

## 🔄 **Database Issues**

### **13. Supabase Connection Issues**
**Problem**: Database queries failing or timing out

**Solution**:
1. Check environment variables
2. Verify database permissions
3. Test connection in Supabase dashboard

```typescript
// Test database connection
const testConnection = async () => {
  const { data, error } = await supabase.from('profiles').select('count');
  console.log('DB Connection:', error ? 'Failed' : 'Success');
};
```

### **14. RLS (Row Level Security) Issues**
**Problem**: Queries failing due to RLS policies

**Solution**:
1. Check RLS policies in Supabase dashboard
2. Verify user authentication
3. Ensure proper permissions

---

## 🛠️ **Quick Fixes Reference**

| Issue | Quick Fix |
|-------|-----------|
| Build failing | `rm -rf .next && npm run build` |
| Types broken | `rm tsconfig.tsbuildinfo && npm run type-check` |
| Imports not working | Check `tsconfig.json` paths |
| Modal not scrolling | Add proper overflow handling |
| API calls failing | Check environment variables |
| Images not loading | Use Next.js Image component |
| Styles not applying | Check Tailwind config |
| State not updating | Check useEffect dependencies |

---

*Last Updated: August 8, 2025*
*All critical issues resolved ✅*