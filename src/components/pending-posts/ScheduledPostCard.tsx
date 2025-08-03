'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Tag,
  Image,
  ExternalLink
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduledAt: string;
  status: 'scheduled' | 'processing' | 'published' | 'failed' | 'paused';
  brandId: string;
  brandName: string;
  mediaUrls?: string[];
  campaignId?: string;
  campaignName?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  selected: boolean;
  onSelect: (postId: string, selected: boolean) => void;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (postId: string) => void;
}

const ScheduledPostCard: React.FC<ScheduledPostCardProps> = ({
  post,
  selected,
  onSelect,
  onEdit,
  onDelete
}) => {
  const scheduledDate = new Date(post.scheduledAt);
  const isOverdue = isPast(scheduledDate) && post.status === 'scheduled';
  
  const getStatusIcon = () => {
    switch (post.status) {
      case 'scheduled':
        return isOverdue ? 
          <AlertTriangle className="h-4 w-4 text-amber-400" /> :
          <Clock className="h-4 w-4 text-blue-400" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-purple-400 animate-pulse" />;
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (post.status) {
      case 'scheduled':
        return isOverdue ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10';
      case 'processing':
        return 'text-purple-400 bg-purple-400/10';
      case 'published':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'paused':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPlatformIcon = () => {
    const iconClass = "h-4 w-4";
    switch (post.platform) {
      case 'twitter':
        return <div className={`${iconClass} bg-blue-400 rounded`} />;
      case 'facebook':
        return <div className={`${iconClass} bg-blue-600 rounded`} />;
      case 'linkedin':
        return <div className={`${iconClass} bg-blue-700 rounded`} />;
      case 'instagram':
        return <div className={`${iconClass} bg-pink-500 rounded`} />;
      default:
        return <ExternalLink className={iconClass} />;
    }
  };

  const getDateLabel = () => {
    if (isToday(scheduledDate)) return 'Today';
    if (isTomorrow(scheduledDate)) return 'Tomorrow';
    if (isPast(scheduledDate)) return 'Overdue';
    return format(scheduledDate, 'MMM dd');
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      className={`
        bg-dark-card border rounded-xl p-4 transition-all duration-200 hover:shadow-lg
        ${selected 
          ? 'border-primary shadow-primary/20' 
          : isOverdue && post.status === 'scheduled'
            ? 'border-amber-400/30'
            : 'border-dark-border hover:border-dark-border-hover'
        }
      `}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-4">
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(post.id, e.target.checked)}
            className="h-4 w-4 rounded border-dark-border bg-dark-lighter text-primary focus:ring-primary/50"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Status */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusIcon()}
                {post.status === 'scheduled' && isOverdue ? 'Overdue' : post.status}
              </div>

              {/* Platform */}
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                {getPlatformIcon()}
                <span className="capitalize">{post.platform}</span>
              </div>

              {/* Brand */}
              <div className="flex items-center gap-1 text-white/60 text-sm">
                <Tag className="h-3 w-3" />
                <span>{post.brandName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(post)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Edit post"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-white/90 text-sm leading-relaxed">
              {truncateContent(post.content)}
            </p>
            
            {/* Media indicator */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-white/60 text-xs">
                <Image className="h-3 w-3" />
                <span>{post.mediaUrls.length} media file{post.mediaUrls.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Schedule Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/60">
                <Calendar className="h-3 w-3" />
                <span>{getDateLabel()}</span>
                <span className="text-white/40">at {format(scheduledDate, 'h:mm a')}</span>
              </div>

              {/* Campaign */}
              {post.campaignName && (
                <div className="text-white/50 text-xs">
                  Campaign: {post.campaignName}
                </div>
              )}
            </div>

            {/* Error or Retry Count */}
            {post.status === 'failed' && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                {post.retryCount > 0 && (
                  <span>Retries: {post.retryCount}</span>
                )}
                {post.error && (
                  <span title={post.error} className="truncate max-w-32">
                    {post.error}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions for Failed Posts */}
          {post.status === 'failed' && (
            <div className="mt-3 pt-3 border-t border-dark-border">
              <button className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-dark-lighter hover:bg-dark-border px-2 py-1 rounded transition-colors">
                <RotateCcw className="h-3 w-3" />
                Retry Now
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduledPostCard;