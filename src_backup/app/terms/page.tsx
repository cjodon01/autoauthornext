import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service - AutoAuthor | User Agreement & Legal Terms',
  description: 'AutoAuthor\'s Terms of Service outline user agreements, acceptable use policies, and legal terms for our AI-powered content automation platform.',
  keywords: 'terms of service, user agreement, legal terms, acceptable use policy, AutoAuthor terms, service agreement, user responsibilities, platform rules',
  openGraph: {
    title: 'Terms of Service - AutoAuthor Platform Agreement',
    description: 'Review AutoAuthor\'s Terms of Service, including user agreements, acceptable use policies, and legal terms for our content automation platform.',
    url: 'https://autoauthor.cc/terms',
    type: 'website',
    siteName: 'AutoAuthor',
  },
  twitter: {
    card: 'summary',
    title: 'AutoAuthor Terms of Service',
    description: 'Legal terms and user agreements for the AutoAuthor content automation platform.',
  },
  alternates: {
    canonical: 'https://autoauthor.cc/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfService() {
  return <TermsClient />;
}