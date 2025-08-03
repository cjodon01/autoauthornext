'use client';

import { usePathname, useRouter } from 'next/navigation';

export interface NavItem {
  label: string;
  onClick: () => void;
  href?: string;
}

export const useNavigationItems = (): NavItem[] => {
  const pathname = usePathname();
  const router = useRouter();
  
  const allNavItems: NavItem[] = [
    { label: 'Dashboard', onClick: () => router.push('/dashboard') },
    { label: 'Brands', onClick: () => router.push('/brand-management') },
    { label: 'Campaigns', onClick: () => router.push('/campaign-management') },
    { label: 'Analytics', onClick: () => router.push('/analytics') },
    { label: 'Scheduled Posts', onClick: () => router.push('/pending-posts') },
    { label: 'Profile', onClick: () => router.push('/profile') },
  ];

  // Filter out the current page
  const filteredNavItems = allNavItems.filter(item => {
    if (pathname === '/dashboard' && item.label === 'Dashboard') return false;
    if (pathname === '/brand-management' && item.label === 'Brands') return false;
    if (pathname === '/campaign-management' && item.label === 'Campaigns') return false;
    if (pathname === '/analytics' && item.label === 'Analytics') return false;
    if (pathname === '/pending-posts' && item.label === 'Scheduled Posts') return false;
    if (pathname === '/profile' && item.label === 'Profile') return false;
    return true;
  });

  return filteredNavItems;
};

export const useCurrentPageLabel = (): string => {
  const pathname = usePathname();
  
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/brand-management':
      return 'Brands';
    case '/campaign-management':
      return 'Campaigns';
    case '/analytics':
      return 'Analytics';
    case '/pending-posts':
      return 'Scheduled Posts';
    case '/profile':
      return 'Profile';
    default:
      return '';
  }
};