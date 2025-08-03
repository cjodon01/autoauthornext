import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog - AutoAuthor | Content Creation Tips & AI Insights',
  description: 'Discover expert tips, strategies, and insights on AI-powered content creation, social media marketing, and automation best practices.',
  keywords: 'content creation blog, AI marketing tips, social media automation, content strategy, digital marketing insights',
  openGraph: {
    title: 'AutoAuthor Blog - Expert Content Creation Tips',
    description: 'Get the latest insights on AI-powered content creation and social media automation from the AutoAuthor team.',
    url: 'https://autoauthor.cc/blog',
    type: 'website',
  },
  alternates: {
    canonical: 'https://autoauthor.cc/blog',
  },
};

export default function Blog() {
  return <BlogClient />;
}