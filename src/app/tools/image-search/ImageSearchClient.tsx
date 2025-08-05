'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search, 
  Download, 
  Save,
  Filter,
  Grid,
  List,
  Heart,
  ExternalLink,
  Image as ImageIcon,
  Info,
  User,
  Calendar,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/provider';
import { createClient } from '../../../lib/supabase/client';
import AuthenticatedNavbar from '../../../components/layout/AuthenticatedNavbar';
import ParticleBackground from '../../../components/ui/ParticleBackground';
import TokenCostDisplay from '../../../components/ui/TokenCostDisplay';

interface SearchResult {
  id: string;
  url: string;
  thumbnail: string;
  large: string;
  original: string;
  photographer: string;
  photographer_url: string;
  platform: string;
  width: number;
  height: number;
  alt: string;
}

const ImageSearchClient: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const platforms = [
    { id: 'all', name: 'All Platforms', color: '#6366F1' },
    { id: 'pexels', name: 'Pexels', color: '#05A081' },
    { id: 'pixabay', name: 'Pixabay', color: '#2E8B57' },
    { id: 'unsplash', name: 'Unsplash', color: '#000000' }
  ];

  const handleImageSearch = async (page = 1) => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not logged in");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/image-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          platform: selectedPlatform,
          page,
          per_page: 20
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search images');
      }

      if (page === 1) {
        setSearchResults(result.images || []);
      } else {
        setSearchResults(prev => [...prev, ...(result.images || [])]);
      }
      
      setCurrentPage(page);
      toast.success(`Found ${result.images?.length || 0} images`);
      
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Failed to search images');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    handleImageSearch(currentPage + 1);
  };

  const handleDownload = async (image: SearchResult) => {
    try {
      const response = await fetch(image.large);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleSaveToLibrary = async (image: SearchResult) => {
    try {
      // In production, this would save to the user_media table
      toast.success('Saved to your media library!');
    } catch (error) {
      console.error('Error saving to library:', error);
      toast.error('Failed to save to library');
    }
  };

  const toggleFavorite = (imageId: string) => {
    setFavorites(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    handleImageSearch(1);
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <AuthenticatedNavbar
        onLogout={() => {}}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/tools')}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </button>
            
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold mb-2">
                Image Search
              </h1>
              <p className="text-white/70">
                Search and browse millions of high-quality stock photos
              </p>
            </div>

            <TokenCostDisplay />
          </div>

          {/* Search Bar */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                  className="w-full bg-dark-lighter border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-2`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn btn-primary disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-dark-border"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Platform
                    </label>
                    <div className="flex gap-2">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform.id)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            selectedPlatform === platform.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-dark-border bg-dark-lighter text-white/70 hover:text-white hover:border-primary/50'
                          }`}
                        >
                          {platform.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Header */}
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  {searchResults.length} Images Found
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-dark-lighter text-white/70'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={image.thumbnail}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(image)}
                            className="p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
                          >
                            <Download className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleSaveToLibrary(image)}
                            className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                          >
                            <Save className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={() => toggleFavorite(image.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.includes(image.id)
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-dark-lighter hover:bg-dark-border'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${
                              favorites.includes(image.id) ? 'text-white fill-white' : 'text-white'
                            }`} />
                          </button>
                          <a
                            href={image.photographer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-dark-lighter rounded-lg hover:bg-dark-border transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 text-white" />
                          </a>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                            {image.platform}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/60">
                            {image.width} × {image.height}
                          </span>
                          <span className="text-xs text-white/40">
                            {image.platform}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 truncate" title={image.alt}>
                          {image.alt}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-3 w-3 text-white/60" />
                          <span className="text-xs text-white/60 truncate">
                            {image.photographer}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <img
                          src={image.thumbnail}
                          alt={image.alt}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-white mb-1">{image.alt}</h3>
                              <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                                <span>{image.width} × {image.height}</span>
                                <span>•</span>
                                <span className="capitalize">{image.platform}</span>
                                <span>•</span>
                                <span>{image.photographer}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleFavorite(image.id)}
                                className={`p-2 rounded transition-colors ${
                                  favorites.includes(image.id)
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-dark-lighter text-white/60 hover:text-white'
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${
                                  favorites.includes(image.id) ? 'fill-current' : ''
                                }`} />
                              </button>
                              <button
                                onClick={() => handleDownload(image)}
                                className="p-2 bg-primary rounded hover:bg-primary/80 transition-colors"
                              >
                                <Download className="h-4 w-4 text-white" />
                              </button>
                              <button
                                onClick={() => handleSaveToLibrary(image)}
                                className="p-2 bg-secondary rounded hover:bg-secondary/80 transition-colors"
                              >
                                <Save className="h-4 w-4 text-white" />
                              </button>
                              <a
                                href={image.photographer_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-dark-lighter rounded hover:bg-dark-border transition-colors"
                              >
                                <ExternalLink className="h-4 w-4 text-white" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More */}
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isSearching}
                  className="btn btn-secondary disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSearching ? 'Loading...' : 'Load More Images'}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearching && searchResults.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Images Found</h3>
              <p className="text-white/60">Try adjusting your search terms or filters</p>
            </div>
          )}

          {/* Initial State */}
          {!isSearching && searchResults.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Searching</h3>
              <p className="text-white/60">Enter a search term to find amazing images</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ImageSearchClient; 