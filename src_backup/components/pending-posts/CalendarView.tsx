'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pause,
  ExternalLink,
  Plus,
  Filter
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isPast
} from 'date-fns';

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

interface CalendarViewProps {
  posts: ScheduledPost[];
  onPostSelect: (post: ScheduledPost) => void;
  onPostUpdate: (post: ScheduledPost) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  posts,
  onPostSelect,
  onPostUpdate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, ScheduledPost[]> = {};
    
    posts.forEach(post => {
      const dateKey = format(new Date(post.scheduledAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });
    
    return grouped;
  }, [posts]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getStatusIcon = (status: ScheduledPost['status']) => {
    const iconClass = "h-3 w-3";
    switch (status) {
      case 'scheduled':
        return <Clock className={`${iconClass} text-blue-400`} />;
      case 'processing':
        return <Clock className={`${iconClass} text-purple-400 animate-pulse`} />;
      case 'published':
        return <CheckCircle className={`${iconClass} text-green-400`} />;
      case 'failed':
        return <XCircle className={`${iconClass} text-red-400`} />;
      case 'paused':
        return <Pause className={`${iconClass} text-gray-400`} />;
      default:
        return <Clock className={`${iconClass} text-gray-400`} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-400';
      case 'facebook':
        return 'bg-blue-600';
      case 'linkedin':
        return 'bg-blue-700';
      case 'instagram':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDayPosts = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return postsByDate[dateKey] || [];
  };

  const getPostsCountByStatus = (posts: ScheduledPost[]) => {
    return posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-border bg-dark/30">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayPosts = getDayPosts(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const isOverdue = isPast(day) && dayPosts.some(post => post.status === 'scheduled');

            return (
              <motion.div
                key={index}
                className={`
                  min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all duration-200
                  ${isCurrentMonth 
                    ? isSelected
                      ? 'border-primary bg-primary/10'
                      : isDayToday
                        ? 'border-primary/50 bg-primary/5'
                        : isOverdue
                          ? 'border-amber-400/30 bg-amber-400/5'
                          : 'border-dark-border hover:border-dark-border-hover'
                    : 'border-transparent bg-dark/20'
                  }
                `}
                onClick={() => setSelectedDate(day)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Day Number */}
                <div className={`
                  text-sm font-medium mb-2 flex items-center justify-between
                  ${isCurrentMonth 
                    ? isDayToday 
                      ? 'text-primary font-bold' 
                      : 'text-white' 
                    : 'text-white/40'
                  }
                `}>
                  <span>{format(day, 'd')}</span>
                  {dayPosts.length > 0 && (
                    <span className="text-xs text-white/60 bg-dark-lighter rounded-full px-1.5 py-0.5">
                      {dayPosts.length}
                    </span>
                  )}
                </div>

                {/* Posts */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post, postIndex) => (
                    <motion.div
                      key={post.id}
                      className="group flex items-center gap-2 p-1.5 bg-dark-lighter hover:bg-dark-border rounded text-xs cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPostSelect(post);
                      }}
                      whileHover={{ x: 2 }}
                    >
                      <div className={`w-2 h-2 rounded-full ${getPlatformColor(post.platform)}`} />
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {getStatusIcon(post.status)}
                        <span className="truncate text-white/80 group-hover:text-white">
                          {post.content.substring(0, 20)}...
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-white/60 text-center py-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add Post Button (on hover) */}
                {isCurrentMonth && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
                    <button className="p-1 text-white/60 hover:text-primary hover:bg-primary/10 rounded">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-dark-border bg-dark/30"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  {isToday(selectedDate) && (
                    <span className="ml-2 text-sm text-primary">(Today)</span>
                  )}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>

              {(() => {
                const dayPosts = getDayPosts(selectedDate);
                const statusCounts = getPostsCountByStatus(dayPosts);

                if (dayPosts.length === 0) {
                  return (
                    <div className="text-center py-8 text-white/60">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No posts scheduled for this date</p>
                      <button className="mt-2 text-sm text-primary hover:text-primary/80">
                        Schedule a post
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/70">
                        {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''}
                      </span>
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <span key={status} className="flex items-center gap-1 text-white/60">
                          {getStatusIcon(status as ScheduledPost['status'])}
                          {count} {status}
                        </span>
                      ))}
                    </div>

                    {/* Post List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dayPosts
                        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                        .map(post => (
                          <div
                            key={post.id}
                            className="flex items-center gap-3 p-3 bg-dark-lighter hover:bg-dark-border rounded-lg cursor-pointer transition-colors"
                            onClick={() => onPostSelect(post)}
                          >
                            <div className={`w-3 h-3 rounded-full ${getPlatformColor(post.platform)}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(post.status)}
                                <span className="text-sm text-white/80 capitalize">{post.platform}</span>
                                <span className="text-xs text-white/60">
                                  {format(new Date(post.scheduledAt), 'h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm text-white/90 truncate">
                                {post.content}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;