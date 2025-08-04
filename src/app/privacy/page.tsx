import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy - AutoAuthor | Data Protection & Privacy Rights',
  description: 'AutoAuthor\'s Privacy Policy explains how we collect, use, and protect your personal data. Learn about your privacy rights, data security measures, and how we handle your information.',
  keywords: 'privacy policy, data protection, GDPR compliance, personal data, data security, user privacy, AutoAuthor privacy, data rights, information security',
  openGraph: {
    title: 'Privacy Policy - AutoAuthor Data Protection',
    description: 'Learn how AutoAuthor protects your privacy and personal data. Comprehensive privacy policy covering data collection, usage, and your rights.',
    url: 'https://autoauthor.cc/privacy',
    type: 'website',
    siteName: 'AutoAuthor',
  },
  twitter: {
    card: 'summary',
    title: 'AutoAuthor Privacy Policy',
    description: 'How AutoAuthor protects your privacy and handles your personal data.',
  },
  alternates: {
    canonical: 'https://autoauthor.cc/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return <PrivacyClient />;
}