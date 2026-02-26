'use client';

import { Calendar, Tag, Lightbulb } from 'lucide-react';
import { clsx } from 'clsx';
import { Idea } from '@/lib/mockData';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
}

export default function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'raw':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'researching':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ready':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'business':
        return 'bg-accent/20 text-accent';
      case 'investment':
        return 'bg-green-500/20 text-green-400';
      case 'personal':
        return 'bg-purple-500/20 text-purple-400';
      case 'technology':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  return (
    <div 
      className="card p-6 hover:bg-card/80 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          <span className={clsx(
            'inline-block px-2 py-1 rounded text-xs font-medium',
            getCategoryColor(idea.category)
          )}>
            {idea.category}
          </span>
        </div>
        
        <span className={clsx(
          'inline-block px-2 py-1 rounded text-xs font-medium border',
          getStatusColor(idea.status)
        )}>
          {idea.status.toUpperCase()}
        </span>
      </div>

      {/* Title and Description */}
      <h3 className="font-semibold text-white mb-3 group-hover:text-accent transition-colors">
        {idea.title}
      </h3>
      <p className="text-sm text-muted mb-4 line-clamp-3">
        {idea.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-muted">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(idea.createdAt)}</span>
        </div>

        {idea.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-muted" />
            <div className="flex space-x-1">
              {idea.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {idea.tags.length > 2 && (
                <span className="text-xs text-muted">
                  +{idea.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}