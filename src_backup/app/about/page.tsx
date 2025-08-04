import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us - AutoAuthor | AI-Powered Content Creation Platform',
  description: 'Learn about AutoAuthor\'s mission to democratize content creation through AI-powered automation. Discover our story, values, and cutting-edge technology.',
  keywords: 'about autoauthor, content creation platform, AI automation, social media management, brand voice, content marketing',
  openGraph: {
    title: 'About AutoAuthor - AI Content Creation Made Simple',
    description: 'Discover how AutoAuthor is revolutionizing content creation with AI-powered automation for creators and businesses worldwide.',
    url: 'https://autoauthor.cc/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://autoauthor.cc/about',
  },
};

export default function About() {
  return <AboutClient />;
}