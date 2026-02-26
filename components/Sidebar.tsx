'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Building2,
  CheckSquare, 
  User, 
  Lightbulb, 
  Settings,
  Bell,
  LogOut,
  Command,
  Receipt,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Finance', href: '/finance', icon: BarChart3 },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Off Plan', href: '/off-plan', icon: Building2 },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Personal', href: '/personal', icon: User },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col sidebar-glass">
      {/* Logo / Branding */}
      <div className="flex h-20 items-center px-6 border-b border-white/[0.04]">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Logo with glow */}
            <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg" />
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-glow">
              <Command className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">Mission Control</span>
            <span className="text-[10px] uppercase tracking-widest text-muted font-medium">Command Center</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="mb-2 px-3">
          <span className="text-[10px] uppercase tracking-widest text-muted font-semibold">Navigation</span>
        </div>
        <ul className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/finance');
            return (
              <motion.li 
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={clsx(
                    'group relative flex items-center space-x-3 rounded-xl px-3 py-3 text-sm font-medium',
                    'transition-all duration-300 ease-out',
                    isActive
                      ? 'nav-item-active text-white'
                      : 'text-muted-foreground hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon className={clsx(
                    'h-5 w-5 transition-all duration-300',
                    isActive ? 'text-accent' : 'text-muted group-hover:text-white'
                  )} />
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Hover indicator */}
                  {!isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-accent/50 rounded-full"
                      whileHover={{ height: '40%' }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Settings and notifications */}
      <div className="border-t border-white/[0.04] px-3 py-4">
        <div className="flex items-center justify-center space-x-1 mb-4">
          <motion.button 
            className="flex items-center justify-center h-10 w-10 rounded-xl text-muted hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-[18px] w-[18px]" />
          </motion.button>
          <motion.button 
            className="flex items-center justify-center h-10 w-10 rounded-xl text-muted hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-[18px] w-[18px]" />
          </motion.button>
        </div>

        {/* User profile */}
        <motion.div 
          className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group"
          whileHover={{ scale: 1.01 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center ring-2 ring-accent/20">
              <span className="text-white font-semibold text-sm">JE</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Jared Esguerra</p>
            <p className="text-xs text-muted truncate flex items-center">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
              Dubai, UAE
            </p>
          </div>
          <button className="text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <LogOut className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
