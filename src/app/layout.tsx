import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { AuthProvider } from "../lib/auth/provider";
import { Toaster } from "sonner";
import ErrorBoundary from "../components/ErrorBoundary";
import PerformanceMonitor from "../components/PerformanceMonitor";
import { monitoring } from "../lib/monitoring";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: '%s | AutoAuthor',
    default: 'AutoAuthor - AI-Powered Social Media Automation',
  },
  description: "Automate your social media content creation and publishing with AI-powered tools. Create, schedule, and manage posts across multiple platforms.",
  keywords: ["social media", "automation", "AI", "content creation", "marketing", "scheduling"],
  authors: [{ name: "AutoAuthor Team" }],
  creator: "AutoAuthor",
  metadataBase: new URL('https://autoauthor.cc'),
  icons: {
    icon: '/images/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://autoauthor.cc',
    siteName: 'AutoAuthor',
    title: 'AutoAuthor - AI-Powered Social Media Automation',
    description: 'Automate your social media content creation and publishing with AI-powered tools.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AutoAuthor - AI-Powered Social Media Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoAuthor - AI-Powered Social Media Automation',
    description: 'Automate your social media content creation and publishing with AI-powered tools.',
    images: ['/images/twitter-card.jpg'],
    creator: '@autoauthor',
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster 
              theme="dark" 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  color: '#ffffff',
                },
              }}
            />
            <PerformanceMonitor />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}