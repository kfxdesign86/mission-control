'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Bell, Check, Clock, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock notification data
const notifications = [
  {
    id: 1,
    type: 'success' as const,
    title: 'Portfolio Performance',
    message: 'Your portfolio gained +2.3% today',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'info' as const,
    title: 'Task Reminder',
    message: 'You have 3 tasks due today',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning' as const,
    title: 'Market Alert',
    message: 'BTC volatility increased by 15%',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'info' as const,
    title: 'System Update',
    message: 'Mission Control updated to version 2.0',
    time: 'Yesterday',
    read: true,
  },
];

const typeConfig = {
  success: {
    icon: Check,
    color: 'text-success bg-success/10 border-success/20',
    bgColor: 'bg-success/5',
  },
  info: {
    icon: Info,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    bgColor: 'bg-blue-500/5',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    bgColor: 'bg-amber-500/5',
  },
  error: {
    icon: X,
    color: 'text-danger bg-danger/10 border-danger/20',
    bgColor: 'bg-danger/5',
  },
};

export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="flex-1 page-enter">
      <Header 
        title="Notifications" 
        subtitle="Stay updated with your latest activities and alerts"
      />
      
      <div className="p-8 space-y-8">
        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Activity Feed</h2>
              <p className="text-sm text-muted-foreground mt-1">Recent notifications and updates</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-muted-foreground">{unreadCount} unread</span>
              </div>
              <button className="text-sm text-accent hover:text-accent/80 font-medium transition-colors">
                Mark all as read
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div
              className="relative p-5 rounded-2xl border bg-card/50 backdrop-blur-sm border-white/[0.04]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                  <Bell className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-white font-numbers">{notifications.length}</p>
            </motion.div>

            <motion.div
              className="relative p-5 rounded-2xl border bg-card/50 backdrop-blur-sm border-white/[0.04]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">Unread</span>
              </div>
              <p className="text-2xl font-bold text-white font-numbers">{unreadCount}</p>
            </motion.div>

            <motion.div
              className="relative p-5 rounded-2xl border bg-card/50 backdrop-blur-sm border-white/[0.04]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-success/10 border border-success/20">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Read</span>
              </div>
              <p className="text-2xl font-bold text-white font-numbers">{notifications.length - unreadCount}</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Notifications List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    className={cn(
                      'relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer',
                      'hover:bg-card/70 hover:border-white/[0.08]',
                      notification.read 
                        ? 'bg-card/30 border-white/[0.04]' 
                        : 'bg-card/50 border-accent/20 shadow-[0_0_30px_-15px_rgba(249,115,22,0.1)]',
                      config.bgColor
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={cn('p-2.5 rounded-xl border', config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={cn(
                              'text-base font-semibold tracking-tight',
                              notification.read ? 'text-white/70' : 'text-white'
                            )}>
                              {notification.title}
                            </h3>
                            <p className={cn(
                              'text-sm mt-1',
                              notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
                            )}>
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {notification.time}
                            </span>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-accent" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gradient border for unread */}
                    {!notification.read && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 via-transparent to-transparent opacity-30 pointer-events-none" />
                    )}
                  </motion.div>
                );
              })
            ) : (
              // Empty state
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="max-w-sm mx-auto">
                  <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 w-fit mx-auto mb-6">
                    <Bell className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No new notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    When you have new updates, they&apos;ll appear here.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}