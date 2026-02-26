'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Sparkline from '@/components/Sparkline';
import { cn } from '@/lib/utils';
import { Asset } from '@/lib/mockData';

interface AssetCardProps {
  asset: Asset;
  index?: number;
}

// Category styling config
const categoryConfig: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  crypto: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)]'
  },
  stocks: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]'
  },
  'real-estate': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]'
  },
  cash: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(100,116,139,0.3)]'
  }
};

export default function AssetCard({ asset, index = 0 }: AssetCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 10 ? 2 : 0,
      maximumFractionDigits: price < 10 ? 2 : 0,
    }).format(price);
  };

  const formatChange = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${formatCurrency(amount)}`;
  };

  const isPositive = asset.changePercent >= 0;
  const config = categoryConfig[asset.category] || categoryConfig.cash;

  return (
    <div
      className="group"
    >
      <Card 
        glow 
        className={cn(
          'cursor-pointer overflow-hidden',
          'transition-all duration-300',
          config.glow
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-semibold text-white text-base">{asset.name}</h3>
                {asset.price && (
                  <span className="text-xs text-muted/70 font-numbers">@ {formatPrice(asset.price)}</span>
                )}
              </div>
              
              {/* Category pill */}
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider',
                config.bg,
                config.text,
                config.border,
                'border'
              )}>
                {asset.category.replace('-', ' ')}
              </span>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted font-medium">Allocation</div>
              <div className="font-semibold text-white font-numbers text-lg">{asset.allocation.toFixed(2)}%</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Value and change */}
            <div className="flex items-end justify-between">
              <div>
                <motion.span 
                  className="text-2xl font-bold text-white font-numbers tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.2 }}
                >
                  {formatCurrency(asset.value)}
                </motion.span>
                {/* Quantity display */}
                {asset.qty && (
                  <motion.div 
                    className="text-sm text-muted-foreground mt-1 font-numbers"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.08 + 0.25 }}
                  >
                    {asset.qty.toLocaleString()} {asset.symbol}
                  </motion.div>
                )}
              </div>
              
              <div className={cn(
                'flex items-center space-x-1.5 px-2 py-1 rounded-lg text-sm font-medium',
                isPositive 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span className="font-numbers">{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
              </div>
            </div>

            {asset.change24h !== 0 && (
              <motion.div 
                className="text-sm text-muted font-numbers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.08 + 0.3 }}
              >
                24h: <span className={isPositive ? 'text-success' : 'text-danger'}>{formatChange(asset.change24h)}</span>
              </motion.div>
            )}

            {/* Premium Recharts Sparkline - Only show for crypto and stocks */}
            {(asset.category === 'crypto' || asset.category === 'stocks') && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.8 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: index * 0.08 + 0.4, duration: 0.5 }}
              >
                <Sparkline 
                  data={asset.history} 
                  positive={isPositive}
                  height={52}
                />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
