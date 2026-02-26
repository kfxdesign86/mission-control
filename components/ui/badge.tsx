import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-accent/15 text-accent border border-accent/20',
        secondary: 'bg-white/[0.04] text-white border border-white/[0.08]',
        destructive: 'bg-red-500/15 text-red-400 border border-red-500/20',
        success: 'bg-green-500/15 text-green-400 border border-green-500/20',
        warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
        info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        outline: 'border border-white/[0.08] text-muted-foreground',
        // Asset category variants with premium styling
        crypto: 'bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20',
        stocks: 'bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20',
        'real-estate': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20',
        cash: 'bg-slate-500/15 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20',
        // Priority variants with glow
        high: 'bg-red-500/15 text-red-400 border border-red-500/25 shadow-[0_0_10px_-3px_rgba(239,68,68,0.3)]',
        medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 shadow-[0_0_10px_-3px_rgba(234,179,8,0.3)]',
        low: 'bg-green-500/15 text-green-400 border border-green-500/25 shadow-[0_0_10px_-3px_rgba(34,197,94,0.3)]',
        // Live indicator
        live: 'bg-green-500/15 text-green-400 border border-green-500/25 animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
