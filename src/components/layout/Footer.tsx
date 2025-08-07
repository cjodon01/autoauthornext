'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Twitter, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const router = useRouter();

  return (
    <footer className="bg-dark-lighter py-12 mt-16 border-t border-dark-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/images/favicon.svg"
                alt="AutoAuthor logo"
                className="h-6 w-6"
              />
              <span className="text-lg font-display font-semibold">AutoAuthor.cc</span>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Turn ideas into blogs, newsletters, emails, social media posts, and more. Publish in seconds, or set it and forget it.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61576993028386" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#features" 
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/tools')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Tools
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/pricing')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/roadmap')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Roadmap
                  </button>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => router.push('/blog')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:support@autoauthor.cc" 
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => router.push('/about')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/careers')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/terms')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/privacy')} 
                    className="text-white/60 hover:text-white text-sm transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-dark-border mt-12 pt-8 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} AutoAuthor.cc All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;