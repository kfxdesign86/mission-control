'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { format, subDays, subYears, startOfYear, parse, isValid } from 'date-fns';

interface BalanceCardProps {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ChartDataPoint {
  date: Date;
  dateLabel: string;
  value: number;
  percentGain: number;
}

// Generate 2 years of mock time series data
const generateFullTimeSeriesData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date(2026, 1, 8); // Feb 8, 2026
  const startDate = subYears(today, 2); // 2 years ago
  
  // Start around $5.5M and grow to ~$8M over 2 years
  const initialValue = 5500000;
  let currentValue = initialValue;
  
  // Calculate total days
  const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Add realistic volatility with upward trend (seeded for deterministic output)
    const trendFactor = 0.0003; // ~0.03% daily growth on average
    const seed = ((i * 16807 + 7) % 2147483647);
    const volatility = ((seed / 2147483646) - 0.5) * 0.008; // +/- 0.4% daily volatility
    currentValue = currentValue * (1 + trendFactor + volatility);
    
    // Keep within reasonable bounds
    currentValue = Math.max(currentValue, initialValue * 0.9);
    currentValue = Math.min(currentValue, initialValue * 1.8);
    
    const percentGain = ((currentValue - initialValue) / initialValue) * 100;
    
    data.push({
      date,
      dateLabel: format(date, 'MMM d'),
      value: Math.round(currentValue),
      percentGain: parseFloat(percentGain.toFixed(2)),
    });
  }
  
  return data;
};

// Generated lazily on client only to avoid hydration mismatch
let _cachedChartData: ChartDataPoint[] | null = null;
function getFullChartData() {
  if (!_cachedChartData) _cachedChartData = generateFullTimeSeriesData();
  return _cachedChartData;
}

const timeFilters = [
  { key: '1D', label: '1D', days: 1 },
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '1Y', label: '1Y', days: 365 },
  { key: 'ALL', label: 'ALL', days: 'all' },
];

const displayOptions = [
  { key: 'net-worth', label: 'Net Worth' },
  { key: 'percent-gain', label: '% Gain' },
];

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format currency with cents for tooltip
const formatCurrencyFull = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format Y-axis values as $7.5M, $8.0M, etc.
const formatYAxis = (value: number) => {
  const millions = value / 1000000;
  return `$${millions.toFixed(1)}M`;
};

// Format Y-axis for percentage
const formatYAxisPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export default function BalanceCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  subtitle,
  size = 'md' 
}: BalanceCardProps) {
  const [activeFilter, setActiveFilter] = useState('1M');
  const [displayType, setDisplayType] = useState('net-worth');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const fullChartData = useMemo(() => mounted ? getFullChartData() : [], [mounted]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    if (fullChartData.length === 0) return [];
    const today = fullChartData[fullChartData.length - 1].date;
    
    // If custom range is active
    if (activeFilter === 'custom' && customRange) {
      return fullChartData.filter(d => d.date >= customRange.start && d.date <= customRange.end);
    }
    
    const filter = timeFilters.find(f => f.key === activeFilter);
    
    let cutoffDate: Date;
    if (filter?.days === 'all') {
      return fullChartData;
    } else if (filter?.days === 'ytd') {
      cutoffDate = startOfYear(today);
    } else {
      cutoffDate = subDays(today, filter?.days as number || 30);
    }
    
    return fullChartData.filter(d => d.date >= cutoffDate);
  }, [activeFilter, customRange, fullChartData]);

  // Calculate stats for the filtered period
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { startValue: 0, endValue: 0, change: 0, changePercent: 0 };
    
    const startValue = filteredData[0].value;
    const endValue = filteredData[filteredData.length - 1].value;
    const change = endValue - startValue;
    const changePercent = (change / startValue) * 100;
    
    return { startValue, endValue, change, changePercent };
  }, [filteredData]);

  // Prepare chart data based on display type
  const chartDisplayData = useMemo(() => {
    if (displayType === 'percent-gain') {
      // Recalculate percent gain relative to start of filtered period
      const startValue = filteredData[0]?.value || 1;
      return filteredData.map(d => ({
        ...d,
        displayValue: ((d.value - startValue) / startValue) * 100,
      }));
    }
    return filteredData.map(d => ({ ...d, displayValue: d.value }));
  }, [filteredData, displayType]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const values = chartDisplayData.map(d => d.displayValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.15;
    
    if (displayType === 'percent-gain') {
      return [
        Math.floor(min - padding),
        Math.ceil(max + padding)
      ];
    }
    
    return [
      Math.floor((min - padding) / 100000) * 100000,
      Math.ceil((max + padding) / 100000) * 100000
    ];
  }, [chartDisplayData, displayType]);

  const isPositive = stats.change >= 0;
  const isHero = size === 'lg';

  // Handle custom date range apply
  const handleApplyCustomRange = () => {
    const start = parse(customStartDate, 'yyyy-MM-dd', new Date());
    const end = parse(customEndDate, 'yyyy-MM-dd', new Date());
    
    if (isValid(start) && isValid(end) && start <= end) {
      setCustomRange({ start, end });
      setActiveFilter('custom');
      setShowDatePicker(false);
    }
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const dataPoint = chartDisplayData.find(d => d.dateLabel === label);
    const dateStr = dataPoint ? format(dataPoint.date, 'MMM d, yyyy') : '';
    const displayValue = payload[0].value;
    
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-xl min-w-[180px]">
        <div className="text-xs text-muted-foreground mb-2">
          {dateStr}
        </div>
        <div className="text-xl font-bold text-white font-numbers">
          {displayType === 'percent-gain' 
            ? `${displayValue >= 0 ? '+' : ''}${displayValue.toFixed(2)}%`
            : formatCurrencyFull(displayValue)
          }
        </div>
      </div>
    );
  };

  // For non-hero cards, use the passed-in change values
  const displayChange = isHero ? stats.change : change;
  const displayChangePercent = isHero ? stats.changePercent : changePercent;
  const displayIsPositive = (displayChange ?? 0) >= 0;

  // Get period label for display
  const getPeriodLabel = () => {
    if (activeFilter === 'custom' && customRange) {
      return `${format(customRange.start, 'MMM d')} - ${format(customRange.end, 'MMM d')}`;
    }
    switch (activeFilter) {
      case '1D': return '1 day';
      case '1W': return '1 week';
      case '1M': return '1 month';
      case '3M': return '3 month';
      case '1Y': return '1 year';
      case 'ALL': return 'all time';
      default: return '';
    }
  };

  if (!isHero) {
    // Compact version for smaller cards
    return (
      <motion.div 
        className={clsx(
          'relative overflow-hidden rounded-2xl border transition-all duration-300 card',
          size === 'sm' ? 'p-4' : 'p-6'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm text-muted font-medium">{title}</h3>
            <div className={clsx(
              'font-bold mt-2 font-numbers text-white',
              size === 'md' ? 'text-3xl' : 'text-2xl'
            )}>
              {formatCurrency(value)}
            </div>
            {subtitle && (
              <p className="text-xs text-muted mt-1">{subtitle}</p>
            )}
          </div>
          {displayChange !== undefined && displayChangePercent !== undefined && (
            <div className={clsx(
              'text-right px-2 py-1 rounded-lg',
              displayIsPositive ? 'bg-success/10' : 'bg-danger/10'
            )}>
              <div className={clsx(
                'text-sm font-semibold font-numbers',
                displayIsPositive ? 'text-success' : 'text-danger'
              )}>
                {displayIsPositive ? '+' : ''}{displayChangePercent.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Hero version with full chart
  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-card/80 border-accent/20 shadow-[0_0_60px_-15px_rgba(249,115,22,0.15)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-1/2 h-32 bg-accent/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-1/3 h-24 bg-accent/5 blur-3xl rounded-full" />

      {/* Header Section */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between">
          {/* Left side - Net Worth info */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Net Worth
            </h3>
            <motion.div 
              className="text-4xl md:text-5xl font-bold text-white font-numbers tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              key={stats.endValue}
              suppressHydrationWarning
            >
              {formatCurrency(mounted ? stats.endValue : value)}
            </motion.div>
            <div className="flex items-center gap-2 mt-2" suppressHydrationWarning>
              <span className={clsx(
                'text-sm font-semibold font-numbers',
                isPositive ? 'text-success' : 'text-danger'
              )} suppressHydrationWarning>
                {mounted ? `${isPositive ? '+' : ''}${formatCurrency(stats.change)} (${isPositive ? '+' : ''}${stats.changePercent.toFixed(2)}%)` : ''}
              </span>
              <span className="text-sm text-muted-foreground">{getPeriodLabel()} change</span>
            </div>
          </div>

          {/* Right side - Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Display Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-sm text-muted-foreground hover:text-white transition-colors"
              >
                {displayOptions.find(o => o.key === displayType)?.label}
                <ChevronDown className="h-4 w-4" />
              </button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-10 min-w-[140px]">
                  {displayOptions.map(option => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setDisplayType(option.key);
                        setShowDropdown(false);
                      }}
                      className={clsx(
                        'w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors',
                        displayType === option.key ? 'text-accent' : 'text-muted-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Period Selector */}
            <div className="flex items-center bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
              {timeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    setActiveFilter(filter.key);
                    setCustomRange(null);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                    activeFilter === filter.key
                      ? 'bg-accent text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Calendar Icon for Custom Date Range */}
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={clsx(
                  'p-2 rounded-lg border transition-all duration-200',
                  activeFilter === 'custom'
                    ? 'bg-accent text-white border-accent shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-muted-foreground hover:text-white'
                )}
              >
                <Calendar className="h-4 w-4" />
              </button>
              
              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-20 p-4 min-w-[280px]">
                  <div className="text-sm font-medium text-white mb-4">Custom Date Range</div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-accent/50"
                        min="2024-02-08"
                        max="2026-02-08"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-accent/50"
                        min="2024-02-08"
                        max="2026-02-08"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 px-3 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCustomRange}
                      className="flex-1 px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <motion.div 
        className="px-2 pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartDisplayData} 
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradientHero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="50%" stopColor="#f97316" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke="rgba(255,255,255,0.06)"
              />
              
              <XAxis 
                dataKey="dateLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#737373', fontSize: 11 }}
                tickMargin={10}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              
              <YAxis 
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#737373', fontSize: 11 }}
                tickFormatter={displayType === 'percent-gain' ? formatYAxisPercent : formatYAxis}
                tickMargin={8}
                width={60}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(249,115,22,0.3)', strokeWidth: 1 }}
              />
              
              <Area
                type="monotone"
                dataKey="displayValue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#areaGradientHero)"
                animationDuration={800}
                animationBegin={100}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
