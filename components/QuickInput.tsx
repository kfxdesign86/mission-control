'use client';

import { useState } from 'react';
import { Plus, Send } from 'lucide-react';

interface QuickInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  className?: string;
}

export default function QuickInput({ placeholder, onSubmit, className = '' }: QuickInputProps) {
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!value.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`card p-4 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-3">
          <Plus className="h-5 w-5 text-accent flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-muted text-sm"
          />
          {isExpanded && (
            <button
              type="submit"
              disabled={!value.trim()}
              className="p-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between items-center text-xs text-muted">
              <span>Press Enter to add, Escape to cancel</span>
              <span>{value.length}/200</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}