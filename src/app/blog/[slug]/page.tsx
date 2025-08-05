import { Metadata } from 'next';
import { createClient } from '../../../lib/supabase/server';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  preview_text: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  status: 'published' | 'draft';
  ai_provider: string | null;
  ai_model: string | null;
  embed_url: string | null;
  content_html: string;
  content_markdown: string | null;
}

interface Props {
  params: { slug: string };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('brand_id', '87e05ae7-8f83-4c89-afcc-450fc1572e2c')
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(await params.slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found - AutoAuthor',
      description: 'The requested blog post could not be found.'
    };
  }

  const publishedTime = new Date(post.created_at).toISOString();
  const modifiedTime = new Date(post.updated_at).toISOString();

  return {
    title: `${post.title} - AutoAuthor Blog`,
    description: post.preview_text || `Read ${post.title} on the AutoAuthor blog.`,
    openGraph: {
      title: post.title,
      description: post.preview_text || `Read ${post.title} on the AutoAuthor blog.`,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: ['AutoAuthor'],
      images: post.image_url ? [
        {
          url: post.image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      siteName: 'AutoAuthor',
      url: `https://autoauthor.ai/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.preview_text || `Read ${post.title} on the AutoAuthor blog.`,
      images: post.image_url ? [post.image_url] : [],
      creator: '@AutoAuthor',
      site: '@AutoAuthor',
    },
    alternates: {
      canonical: `https://autoauthor.ai/blog/${post.slug}`,
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
    authors: [{ name: 'AutoAuthor' }],
    category: 'Technology',
    keywords: [
      'AI content creation',
      'social media automation',
      'digital marketing',
      'content strategy',
      'artificial intelligence',
      'blog automation',
      ...(post.ai_provider ? [`${post.ai_provider} AI`] : [])
    ],
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(await params.slug);

  if (!post) {
    notFound();
  }

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.preview_text || `Read ${post.title} on the AutoAuthor blog.`,
    image: post.image_url ? [post.image_url] : [],
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'AutoAuthor',
      url: 'https://autoauthor.ai'
    },
    publisher: {
      '@type': 'Organization',
      name: 'AutoAuthor',
      url: 'https://autoauthor.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://autoauthor.ai/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://autoauthor.ai/blog/${post.slug}`
    },
    articleSection: 'Technology',
    keywords: [
      'AI content creation',
      'social media automation',
      'digital marketing',
      'content strategy',
      'artificial intelligence',
      'blog automation'
    ].join(', '),
    wordCount: post.content_html.replace(/<[^>]*>/g, '').split(/\s+/).length,
    url: `https://autoauthor.ai/blog/${post.slug}`,
    isPartOf: {
      '@type': 'Blog',
      name: 'AutoAuthor Blog',
      url: 'https://autoauthor.ai/blog'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}