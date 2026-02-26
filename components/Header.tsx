'use client';

import { Search, Calendar, Bell, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, showSearch = true, action }: HeaderProps) {
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dubai',
    hour12: true,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="border-b border-white/[0.04] bg-background/80 backdrop-blur-xl px-8 py-6 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
            <motion.div
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-success/10 border border-success/20"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-3 w-3 text-success" />
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Live</span>
            </motion.div>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </motion.div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Action slot */}
          {action}

          {/* Search */}
          {showSearch && (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent" />
              <input
                type="text"
                placeholder="Search assets, tasks..."
                className="h-11 w-80 rounded-xl border border-white/[0.06] bg-card/50 pl-11 pr-4 text-sm text-white placeholder-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200 hover:border-white/[0.1] hover:bg-card"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted bg-white/[0.04] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </div>
          )}

          {/* Time and date */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="font-medium">{currentTime}</span>
          </div>

          {/* Notifications */}
          <motion.button 
            className="relative rounded-xl p-3 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-white shadow-glow-sm">
              3
            </span>
          </motion.button>
        </motion.div>
      </div>
    </header>
  );
}
