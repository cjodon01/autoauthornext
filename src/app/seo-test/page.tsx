import type { Metadata } from 'next';
import { createClient } from '../../lib/supabase/server';

export const metadata: Metadata = {
  title: 'SEO Test Page - AutoAuthor',
  description: 'Test page to verify SEO implementation and structured data.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SEOTestPage() {
  const supabase = await createClient();
  
  // Get some sample blog posts for testing
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, created_at')
    .eq('status', 'published')
    .eq('user_id', '87e05ae7-8f83-4c89-afcc-450fc1572e2c')
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SEO Test Page</h1>
        
        <div className="space-y-8">
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">SEO Implementation Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900 p-4 rounded">
                <h3 className="font-semibold text-green-300">✅ Implemented</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Dynamic sitemap.xml</li>
                  <li>• robots.txt</li>
                  <li>• Meta tags (title, description, keywords)</li>
                  <li>• Open Graph tags</li>
                  <li>• Twitter Card tags</li>
                  <li>• Structured data (JSON-LD)</li>
                  <li>• Canonical URLs</li>
                  <li>• Web app manifest</li>
                  <li>• Blog post SEO optimization</li>
                </ul>
              </div>
              <div className="bg-yellow-900 p-4 rounded">
                <h3 className="font-semibold text-yellow-300">⚠️ To Configure</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Google Search Console verification</li>
                  <li>• Bing Webmaster Tools verification</li>
                  <li>• Social media profile URLs</li>
                  <li>• Analytics tracking codes</li>
                  <li>• Custom OG images</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sample Blog Posts</h2>
            <div className="space-y-4">
              {blogPosts?.map((post) => (
                <div key={post.slug} className="bg-gray-700 p-4 rounded">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-gray-300 text-sm">
                    Slug: /blog/{post.slug}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Created: {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">SEO Testing Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Google Tools</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a 
                      href="https://search.google.com/test/rich-results" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Rich Results Test
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://search.google.com/search-console" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Search Console
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://pagespeed.web.dev/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      PageSpeed Insights
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Social Media Tools</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a 
                      href="https://developers.facebook.com/tools/debug/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Facebook Sharing Debugger
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://cards-dev.twitter.com/validator" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Twitter Card Validator
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.linkedin.com/post-inspector/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      LinkedIn Post Inspector
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">SEO Checklist</h2>
            <div className="space-y-2">
              {[
                'Meta title and description for all pages',
                'Open Graph tags for social sharing',
                'Twitter Card tags for Twitter sharing',
                'Structured data (JSON-LD) for rich snippets',
                'Canonical URLs to prevent duplicate content',
                'XML sitemap for search engines',
                'Robots.txt file for crawler guidance',
                'Fast loading times (under 3 seconds)',
                'Mobile-friendly responsive design',
                'Secure HTTPS connection',
                'Clean URL structure',
                'Internal linking strategy',
                'Alt text for all images',
                'Proper heading hierarchy (H1, H2, H3)',
                'Meta robots tags for indexing control'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 