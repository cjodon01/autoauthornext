import type { Metadata } from 'next';
import CampaignManagementClient from './CampaignManagementClient';

export const metadata: Metadata = {
  title: 'Campaign Management',
  description: 'Manage and monitor your automated content campaigns.',
};

export default function CampaignManagementPage() {
  return <CampaignManagementClient />;
}