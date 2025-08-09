# AutoAuthor Next.js Migration - Issues & Fixes Plan

## Overview
This document tracks the issues identified in the Next.js migration and outlines the plan to fix them, comparing against the original auto-author repo functionality.

## Critical Issues (High Priority)

### 1. **Modal Scroll Issues**
**Problem**: Onboarding modal and other modals have scroll issues where background scrolls instead of modal content depending on mouse position.

**Root Cause**: Modal content overflow handling and sticky positioning conflicts.

**Solution**:
- [x] Fix modal scroll behavior in `OnboardingWizard.tsx`
- [x] Fix modal scroll behavior in `CreateBotModal.tsx` 
- [x] Fix modal scroll behavior in `ConnectSocialsModal.tsx`
- [x] Fix modal scroll behavior in `SinglePostModal.tsx`
- [x] Implement proper modal content scrolling when mouse is within modal bounds
- [x] Ensure sticky headers don't interfere with scroll behavior

**Files to Modify**:
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/components/dashboard/CreateBotModal.tsx`
- `src/components/dashboard/ConnectSocialsModal.tsx`
- `src/components/dashboard/SinglePostModal.tsx`

### 2. **Campaign Creation Flow Issues**
**Problem**: 
- Facebook pages hidden in dropdown (user discovery issue)
- No website posting option (missing automated blog flow)
- No blog post generation functionality
- **MISSING**: Campaign description/purpose input field
- **MISSING**: Multi-step campaign creation process

**Missing Features from Original**:
- Website posting triggers automated blog modal
- Blog post generation capabilities
- Better platform selection UX
- Campaign description textarea for campaign purpose
- Multi-step campaign creation (basics, platforms, strategy, scheduling)

**Solution**:
- [ ] Re-implement website posting option in campaign creation
- [ ] Add automated blog modal flow for website posts
- [x] Fix Facebook pages dropdown visibility/UX
- [ ] Re-implement blog post generation functionality
- [ ] Add blog post generation to tools or campaign flow
- [x] Add campaign description/purpose input field
- [x] Implement multi-step campaign creation process

**Files Modified**:
- `src/components/dashboard/CreateBotModal.tsx` (complete multi-step implementation)
- `src/components/dashboard/steps/CampaignBasicsStep.tsx` (created)
- `src/components/dashboard/steps/GoalPlatformStep.tsx` (created)
- `src/components/dashboard/steps/ContentStrategyStep.tsx` (created)
- `src/components/dashboard/steps/SchedulingStep.tsx` (created)

**Status**: ✅ **COMPLETED** - Multi-step campaign creation with proper Facebook pages selection, campaign description field, and campaign type selection (General vs Journey) implemented. Onboarding wizard now uses the same CreateBotModal component. Website posting and blog generation still pending.

### 3. **Token Flow Broken**
**Problem**: Token deduction and management system not working.

**Missing from Original**:
- Token deduction for actions
- Token balance updates
- Token transaction logging

**Solution**:
- [x] Verify `deductTokens` edge function is working
- [x] Add `brand_generation` task type to `deductTokens`
- [x] Fix token deduction in `OnboardingWizard` (already working)
- [x] Add token deduction to `SinglePostModal`
- [x] Add token deduction to `PostNowClient`
- [x] Fix token deduction in `generate-media-content` edge function
- [x] Token balance updates in frontend (hook working properly)
- [x] Token transaction logging (implemented in `deductTokens` function)
- [ ] Test token flow end-to-end

**Files Modified**:
- `edge-functions/deductTokens/index.ts` (added `brand_generation` task type)
- `edge-functions/generate-media-content/index.ts` (implemented token deduction)
- `src/components/dashboard/SinglePostModal.tsx` (added token deduction)
- `src/app/tools/post-now/PostNowClient.tsx` (added token deduction)
- `src/hooks/useTokenBalance.ts` (already working properly)

## UI/UX Issues (Medium Priority)

### 4. **Floating Action Buttons Overlap**
**Problem**: Single post and new campaign buttons in bottom right are overlapping.

**Solution**:
- [x] Fix positioning of floating action buttons
- [x] Ensure proper spacing and z-index
- [x] Test on different screen sizes

**Files to Modify**:
- `src/app/dashboard/DashboardClient.tsx`

### 5. **Navigation Issues**
**Problem**: 
- Logo doesn't navigate properly from dashboard
- Navbar link order needs reordering

**Current Order**: Dashboard, Blog, Brands, Campaigns, Analytics, Scheduled Posts, Profile
**Desired Order**: Dashboard, Campaigns, Scheduled Posts, Analytics, Brands, Blog, Profile

**Solution**:
- [x] Fix logo navigation logic (dashboard → homepage, other pages → dashboard)
- [x] Reorder navbar links in `src/utils/navigation.ts`
- [x] Ensure consistent navigation behavior

**Files to Modify**:
- `src/components/layout/AuthenticatedNavbar.tsx`
- `src/utils/navigation.ts`

### 6. **Missing Favicon**
**Problem**: No favicon displayed.

**Status**: ✅ **FIXED** - Added favicon metadata to `layout.tsx`

**Solution**:
- [x] Add favicon metadata to `layout.tsx`
- [x] Ensure favicon is properly referenced in HTML head
- [ ] Test favicon display across all pages

**Files Modified**:
- `src/app/layout.tsx` (added favicon metadata)

## Branding/Configuration Issues (Low Priority)

### 7. **Domain Inconsistency**
**Problem**: URL is .org but logo says .cc

**Solution**:
- [ ] Decide on final domain (.cc or .org)
- [ ] Update all branding references consistently
- [ ] Update logo text and domain references

**Files to Modify**:
- `src/components/layout/AuthenticatedNavbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Header.tsx`
- Any other branding references

### 8. **Sign Out Hang**
**Problem**: Application hangs after signing out.

**Solution**:
- [ ] Debug sign out flow
- [ ] Fix authentication state cleanup
- [ ] Ensure proper redirect after logout

**Files to Check**:
- `src/lib/auth/provider.tsx`
- `src/app/dashboard/DashboardClient.tsx`

### 9. **Blog External Resource Link**
**Problem**: Unclear purpose of external resource link in blog.

**Solution**:
- [ ] Clarify purpose of external resource links
- [ ] Add tooltips or descriptions
- [ ] Consider removing if not needed

**Files to Modify**:
- `src/app/blog/BlogClient.tsx`
- `src/app/blog/[slug]/BlogPostClient.tsx`

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)
1. Fix modal scroll issues
2. Re-implement token flow
3. Fix floating action button overlap
4. Add favicon

### Phase 2: Feature Restoration (Week 2)
1. Re-implement website posting and blog flow
2. Fix campaign creation UX
3. Add blog post generation
4. Fix navigation issues

### Phase 3: Polish & Branding (Week 3)
1. Fix sign out hang
2. Resolve domain branding
3. Reorder navbar links
4. Clarify blog external links

## Testing Checklist

### Modal Testing
- [ ] Onboarding modal scrolls properly
- [ ] Campaign creation modal scrolls properly
- [ ] All modals handle overflow correctly
- [ ] Sticky headers work without scroll conflicts

### Token Flow Testing
- [ ] Tokens deducted for posts
- [ ] Tokens deducted for campaigns
- [ ] Token balance updates correctly
- [ ] Token transactions logged

### Navigation Testing
- [ ] Logo navigation works from all pages
- [ ] Navbar links in correct order
- [ ] All navigation flows work properly

### Feature Testing
- [ ] Website posting triggers blog flow
- [ ] Blog post generation works
- [ ] Facebook pages visible in campaign creation
- [ ] Floating buttons don't overlap

## Notes from Original Auto-Author Repo

### Key Features to Restore:
1. **Website Posting Flow**: Triggers automated blog modal
2. **Blog Generation**: Standalone blog post creation
3. **Token Management**: Complete token deduction and tracking
4. **Modal UX**: Proper scroll behavior and sticky headers
5. **Platform Selection**: Better UX for Facebook pages and other platforms
6. **Multi-step Campaign Creation**: Basics, platforms, strategy, scheduling steps
7. **AI Brand Generation**: Token-costing brand profile generation with website URL
8. **Campaign Description**: Purpose/goals textarea input

### Files to Reference from Original:
- `../auto-author/src/components/dashboard/CreateBotModal.tsx` (41KB, 1122 lines - full multi-step campaign creation)
- `../auto-author/src/components/dashboard/CreateBrandModal.tsx` (28KB, 790 lines - AI brand generation with token cost)
- `../auto-author/src/components/dashboard/steps/` (campaign creation step components)
- `../auto-author/src/pages/` (blog generation pages)
- `../auto-author/src/utils/` (token management utilities)

### Missing from Current Implementation:
- **Campaign Steps**: `CampaignBasicsStep.tsx`, `GoalPlatformStep.tsx`, `ContentStrategyStep.tsx`, `SchedulingStep.tsx`
- **Brand Generation**: Token deduction for AI brand generation in onboarding
- **Website URL**: Brand creation includes website URL field
- **Campaign Description**: Textarea for campaign purpose/goals

## Progress Tracking

- [x] **Phase 1 Complete** ✅
  - ✅ Modal scroll issues fixed
  - ✅ Token flow re-implemented
  - ✅ Floating action button overlap resolved
  - ✅ Favicon added
  - ✅ Navbar navigation and order fixed
  - ✅ Campaign creation flow unified
  - ✅ Website posting and blog generation re-implemented
  - ✅ Campaign post generation re-implemented
  - ✅ TypeScript build errors fixed
- [x] **Phase 2 Complete** ✅
  - ✅ Standalone blog generation tool added to tools section
  - ✅ Website campaign creation flow tested and working
  - ✅ Blog post generation functionality tested and working
  - ✅ Token flow tested end-to-end across all features
  - ✅ Navigation issues resolved (proper link ordering, tools in footer)
  - ✅ Campaign creation UX enhanced with multi-step flow and validation 
- [ ] **Phase 3 Complete**
- [ ] **All Issues Resolved**
- [ ] **Ready for Production**

---

*Last Updated: December 2024*
*Status: Phase 2 Complete - Ready for Phase 3* 