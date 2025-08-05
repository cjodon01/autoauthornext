import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../lib/auth/provider'
import ErrorBoundary from '../components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AutoAuthor - AI-Powered Content Creation & Social Media Automation',
    template: '%s | AutoAuthor'
  },
  description: 'Transform your content creation with AI-powered tools. Automate social media posts, generate engaging content, and scale your digital presence with AutoAuthor.',
  keywords: [
    'AI content creation',
    'social media automation',
    'content marketing',
    'digital marketing tools',
    'AI writing assistant',
    'social media management',
    'content automation',
    'marketing automation',
    'AI marketing',
    'content strategy'
  ],
  authors: [{ name: 'AutoAuthor Team' }],
  creator: 'AutoAuthor',
  publisher: 'AutoAuthor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://autoauthor.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://autoauthor.ai',
    title: 'AutoAuthor - AI-Powered Content Creation & Social Media Automation',
    description: 'Transform your content creation with AI-powered tools. Automate social media posts, generate engaging content, and scale your digital presence.',
    siteName: 'AutoAuthor',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AutoAuthor - AI-Powered Content Creation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoAuthor - AI-Powered Content Creation',
    description: 'Transform your content creation with AI-powered tools. Automate social media posts and scale your digital presence.',
    images: ['/og-image.jpg'],
    creator: '@AutoAuthor',
    site: '@AutoAuthor',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

// Organization structured data
const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AutoAuthor',
  url: 'https://autoauthor.ai',
  logo: 'https://autoauthor.ai/logo.png',
  description: 'AI-powered content creation and social media automation platform',
  sameAs: [
    'https://twitter.com/AutoAuthor',
    'https://linkedin.com/company/autoauthor',
    'https://facebook.com/AutoAuthor'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@autoauthor.ai'
  }
}

// Website structured data
const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AutoAuthor',
  url: 'https://autoauthor.ai',
  description: 'AI-powered content creation and social media automation platform',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://autoauthor.ai/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}