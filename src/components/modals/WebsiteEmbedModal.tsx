'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Code, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl?: string;
}

const WebsiteEmbedModal: React.FC<WebsiteEmbedModalProps> = ({
  isOpen,
  onClose,
  embedUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'embed'>('preview');

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;

  const responsiveEmbedCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
  <iframe 
    src="${embedUrl}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
    allowfullscreen>
  </iframe>
</div>`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl overflow-hidden z-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] bg-primary/40"></div>
            
            <div className="relative max-h-[90vh] flex flex-col">
              <div className="bg-dark-card border-b border-dark-border p-6">
                <button
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Your Blog is Ready to <span className="text-gradient">Embed</span>
                  </h2>
                  <p className="text-white/60">
                    Copy the embed code below to add this blog to your website
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-dark-lighter rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-primary text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('embed')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'embed'
                        ? 'bg-primary text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Embed Code
                  </button>
                </div>

                {activeTab === 'preview' ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        src={embedUrl}
                        className="w-full h-96"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary inline-flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </a>
                      
                      <button
                        onClick={() => handleCopy(embedUrl || '')}
                        className="btn btn-primary inline-flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy URL
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Embed Code */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">Basic Embed Code</h3>
                        <button
                          onClick={() => handleCopy(embedCode)}
                          className="btn btn-secondary inline-flex items-center gap-2 text-sm"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                        <pre className="text-sm text-white/80 overflow-x-auto">
                          <code>{embedCode}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Responsive Embed Code */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">Responsive Embed Code (Recommended)</h3>
                        <button
                          onClick={() => handleCopy(responsiveEmbedCode)}
                          className="btn btn-secondary inline-flex items-center gap-2 text-sm"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                        <pre className="text-sm text-white/80 overflow-x-auto">
                          <code>{responsiveEmbedCode}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">How to Embed</h4>
                      <ol className="text-sm text-white/70 space-y-1">
                        <li>1. Copy the embed code above</li>
                        <li>2. Paste it into your website&apos;s HTML where you want the blog to appear</li>
                        <li>3. The blog will automatically load and display on your site</li>
                        <li>4. Use the responsive code for better mobile experience</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-dark-card border-t border-dark-border p-6">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                  <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Blog
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WebsiteEmbedModal; 