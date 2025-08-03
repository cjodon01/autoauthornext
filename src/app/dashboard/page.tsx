import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your AutoAuthor dashboard for managing campaigns and content.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}