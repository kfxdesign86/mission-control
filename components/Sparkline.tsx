'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { HistoryPoint } from '@/lib/mockData';

interface SparklineProps {
  data: HistoryPoint[];
  positive?: boolean;
  height?: number;
  className?: string;
}

export default function Sparkline({ 
  data, 
  positive = true, 
  height = 48,
  className = ''
}: SparklineProps) {
  // Determine trend from actual data if not specified
  const isPositive = useMemo(() => {
    if (data.length < 2) return positive;
    return data[data.length - 1].value >= data[0].value;
  }, [data, positive]);

  // Colors based on performance
  const colors = useMemo(() => {
    if (isPositive) {
      return {
        stroke: '#22c55e',
        gradientStart: 'rgba(34, 197, 94, 0.3)',
        gradientEnd: 'rgba(34, 197, 94, 0)',
      };
    }
    return {
      stroke: '#ef4444',
      gradientStart: 'rgba(239, 68, 68, 0.3)',
      gradientEnd: 'rgba(239, 68, 68, 0)',
    };
  }, [isPositive]);

  // Generate unique gradient ID (deterministic from data to avoid hydration mismatch)
  const gradientId = useMemo(() => 
    `sparkline-gradient-${data.length > 0 ? data[0].value : 0}-${data.length}`,
    [data]
  );

  if (!data || data.length === 0) {
    return (
      <div 
        className={`bg-white/[0.02] rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground">No chart data</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.04] ${className}`}>
      {/* Subtle background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(to top, ${colors.gradientStart}, transparent)`
        }}
      />
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={data} 
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.gradientStart} />
              <stop offset="100%" stopColor={colors.gradientEnd} />
            </linearGradient>
          </defs>
          
          {/* Hidden YAxis just to calculate domain */}
          <YAxis 
            domain={['dataMin', 'dataMax']} 
            hide 
            padding={{ top: 4, bottom: 4 }}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Current value dot indicator */}
      <div 
        className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ 
          backgroundColor: colors.stroke,
          boxShadow: `0 0 8px ${colors.stroke}`
        }}
      />
    </div>
  );
}
