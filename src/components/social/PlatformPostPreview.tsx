'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  MessageSquare, 
  Linkedin, 
  Globe,
  Heart,
  MessageCircle,
  Share,
  Repeat2,
  ThumbsUp,
  Send
} from 'lucide-react';

interface PlatformPostPreviewProps {
  platform: string;
  content: string;
  accountName?: string;
  accountHandle?: string;
  profileImage?: string;
  mediaUrl?: string;
  className?: string;
}

const PlatformPostPreview: React.FC<PlatformPostPreviewProps> = ({
  platform,
  content,
  accountName = 'Your Account',
  accountHandle = '@yourhandle',
  profileImage,
  mediaUrl,
  className = ''
}) => {
  const formatContent = (text: string, platform: string) => {
    // Platform-specific content formatting
    switch (platform.toLowerCase()) {
      case 'twitter':
        // Twitter has 280 character limit
        return text.length > 280 ? text.substring(0, 277) + '...' : text;
      case 'linkedin':
        // LinkedIn supports longer content
        return text;
      case 'facebook':
        // Facebook supports long content but truncates in feed
        return text.length > 300 ? text.substring(0, 297) + '...' : text;
      case 'instagram':
        // Instagram supports captions with hashtags
        return text + '\n\n#instagram #content #socialmedia';
      default:
        return text;
    }
  };

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return Facebook;
      case 'twitter':
        return Twitter;
      case 'instagram':
        return MessageSquare;
      case 'linkedin':
        return Linkedin;
      case 'website':
        return Globe;
      default:
        return MessageSquare;
    }
  };

  const getPlatformColor = () => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '#1877F2';
      case 'twitter':
        return '#1DA1F2';
      case 'instagram':
        return '#E4405F';
      case 'linkedin':
        return '#0A66C2';
      case 'website':
        return '#00BFFF';
      default:
        return '#6B7280';
    }
  };

  const renderTwitterPreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black text-sm">{accountName}</span>
              <span className="text-gray-500 text-sm">{accountHandle}</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">now</span>
            </div>
            <div className="mt-2 text-black text-sm whitespace-pre-wrap">
              {formatContent(content, 'twitter')}
            </div>
            {mediaUrl && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img src={mediaUrl} alt="Post media" className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between mt-4 text-gray-500 max-w-md">
              <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Reply</span>
              </div>
              <div className="flex items-center gap-2 hover:text-green-500 cursor-pointer">
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">Retweet</span>
              </div>
              <div className="flex items-center gap-2 hover:text-red-500 cursor-pointer">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Like</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer">
                <Share className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacebookPreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600"></div>
            )}
          </div>
          <div>
            <div className="font-semibold text-black text-sm">{accountName}</div>
            <div className="text-gray-500 text-xs">Just now · 🌍</div>
          </div>
        </div>
        <div className="text-black text-sm whitespace-pre-wrap mb-3">
          {formatContent(content, 'facebook')}
        </div>
        {mediaUrl && (
          <div className="rounded-lg overflow-hidden mb-3">
            <img src={mediaUrl} alt="Post media" className="w-full h-64 object-cover" />
          </div>
        )}
        <div className="border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Like</span>
              </div>
              <div className="flex items-center gap-2 hover:text-gray-800 cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Comment</span>
              </div>
              <div className="flex items-center gap-2 hover:text-gray-800 cursor-pointer">
                <Share className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinkedInPreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-700"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-black text-sm">{accountName}</span>
              <span className="text-gray-500 text-sm">• 1st</span>
            </div>
            <div className="text-gray-500 text-xs">Professional Title</div>
            <div className="text-gray-500 text-xs">Just now</div>
          </div>
        </div>
        <div className="mt-3 text-black text-sm whitespace-pre-wrap">
          {formatContent(content, 'linkedin')}
        </div>
        {mediaUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={mediaUrl} alt="Post media" className="w-full h-48 object-cover" />
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2 hover:text-blue-700 cursor-pointer">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">Like</span>
            </div>
            <div className="flex items-center gap-2 hover:text-gray-800 cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Comment</span>
            </div>
            <div className="flex items-center gap-2 hover:text-gray-800 cursor-pointer">
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm">Repost</span>
            </div>
            <div className="flex items-center gap-2 hover:text-gray-800 cursor-pointer">
              <Send className="h-4 w-4" />
              <span className="text-sm">Send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstagramPreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-sm">
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-black text-sm">{accountHandle.replace('@', '')}</div>
        </div>
      </div>
      
      {/* Media */}
      <div className="aspect-square bg-gray-100">
        {mediaUrl ? (
          <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <MessageSquare className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-3">
          <Heart className="h-6 w-6 hover:text-red-500 cursor-pointer" />
          <MessageCircle className="h-6 w-6 hover:text-gray-600 cursor-pointer" />
          <Send className="h-6 w-6 hover:text-gray-600 cursor-pointer" />
        </div>
        <div className="text-black text-sm">
          <span className="font-semibold">{accountHandle.replace('@', '')}</span>
          <span className="ml-2">{formatContent(content, 'instagram')}</span>
        </div>
      </div>
    </div>
  );

  const renderWebsitePreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-800">Blog Post</span>
        </div>
        <h3 className="text-lg font-bold text-black mb-3">
          {content.split('\n')[0] || 'Generated Blog Post Title'}
        </h3>
        <div className="text-gray-700 text-sm whitespace-pre-wrap">
          {content}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          Published on your website • Just now
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return renderTwitterPreview();
      case 'facebook':
        return renderFacebookPreview();
      case 'linkedin':
        return renderLinkedInPreview();
      case 'instagram':
        return renderInstagramPreview();
      case 'website':
        return renderWebsitePreview();
      default:
        return renderTwitterPreview();
    }
  };

  const Icon = getPlatformIcon();

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon 
          className="h-5 w-5" 
          style={{ color: getPlatformColor() }}
        />
        <span className="font-medium text-white capitalize">{platform} Preview</span>
      </div>
      
      <div className="transform scale-90 origin-top-left">
        {renderPreview()}
      </div>
    </motion.div>
  );
};

export default PlatformPostPreview;