import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'AI-Powered Social Media Automation',
  description: 'Automate your social media content creation and publishing with AI-powered tools. Create, schedule, and manage posts across multiple platforms.',
  openGraph: {
    title: 'AutoAuthor - AI-Powered Social Media Automation',
    description: 'Automate your social media content creation and publishing with AI-powered tools.',
    url: 'https://autoauthor.cc',
    type: 'website',
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}