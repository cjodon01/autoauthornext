import { Metadata } from 'next';
import BlogGeneratorClient from './BlogGeneratorClient';

export const metadata: Metadata = {
  title: 'Blog Generator | AutoAuthor',
  description: 'Generate full blog posts with AI-powered content creation.',
};

export default function BlogGeneratorPage() {
  return <BlogGeneratorClient />;
}