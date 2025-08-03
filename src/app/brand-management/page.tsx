import type { Metadata } from 'next';
import BrandManagementClient from './BrandManagementClient';

export const metadata: Metadata = {
  title: 'Brand Management',
  description: 'Create and manage your brand profiles for targeted content creation.',
};

export default function BrandManagementPage() {
  return <BrandManagementClient />;
}