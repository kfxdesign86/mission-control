'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import AssetCard from '@/components/AssetCard';
import AddTransactionModal from '@/components/AddTransactionModal';
import { useAssets } from '@/lib/assetStore';
import { useCryptoPrices } from '@/lib/cryptoPriceService';
import { useStockPrices } from '@/lib/stockPriceService';
import { TrendingUp, Wallet, Building2, Coins, Banknote, Car, Gem, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Category icons and colors
type CategoryInfo = { icon: React.ComponentType<{ className?: string }>; color: string; label: string };
const categoryConfig: Record<string, CategoryInfo> = {
  cash: { icon: Banknote, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', label: 'Cash' },
  crypto: { icon: Coins, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'Cryptocurrency' },
  stocks: { icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Stocks & Equities' },
  'real-estate': { icon: Building2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Real Estate' },
  cars: { icon: Car, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Cars' },
  valuables: { icon: Gem, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Valuables' },
};

// Tab categories for asset filtering
const assetCategories = [
  { key: 'crypto', label: 'Crypto', icon: Coins },
  { key: 'stocks', label: 'Equities', icon: TrendingUp }, // Display as "Equities" but filter by "stocks"
  { key: 'real-estate', label: 'Real Estate', icon: Building2 },
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'cars', label: 'Cars', icon: Car },
  { key: 'valuables', label: 'Valuables', icon: Gem },
];

export default function FinancePage() {
  const { assets, netWorth, isLoading } = useAssets();
  const { getChartData } = useCryptoPrices();
  const { getChartData: getStockChartData } = useStockPrices();
  const [activeCategory, setActiveCategory] = useState('crypto');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter assets based on active category and deduplicate by ID
  const filteredAssets = assets
    .filter(asset => asset.category === activeCategory)
    .reduce((acc, asset) => {
      const existingIndex = acc.findIndex(existing => existing.id === asset.id);
      if (existingIndex === -1) {
        // New unique asset
        acc.push(asset);
      } else {
        // Duplicate - keep the one with higher value
        const existing = acc[existingIndex];
        if (asset.value > existing.value) {
          acc[existingIndex] = asset;
        }
      }
      return acc;
    }, [] as typeof assets);

  // Calculate category totals and 24h changes
  const cashTotal = assets
    .filter(a => a.category === 'cash')
    .reduce((sum, a) => sum + a.value, 0);
  
  const cryptoTotal = assets
    .filter(a => a.category === 'crypto')
    .reduce((sum, a) => sum + a.value, 0);
  
  const cryptoChange24h = assets
    .filter(a => a.category === 'crypto')
    .reduce((sum, a) => sum + a.change24h, 0);
  
  const stocksTotal = assets
    .filter(a => a.category === 'stocks')
    .reduce((sum, a) => sum + a.value, 0);
  
  const stocksChange24h = assets
    .filter(a => a.category === 'stocks')
    .reduce((sum, a) => sum + a.change24h, 0);
  
  const realEstateTotal = assets
    .filter(a => a.category === 'real-estate')
    .reduce((sum, a) => sum + a.value, 0);
  
  const carsTotal = assets
    .filter(a => a.category === 'cars')
    .reduce((sum, a) => sum + a.value, 0);
  
  const valuablesTotal = assets
    .filter(a => a.category === 'valuables')
    .reduce((sum, a) => sum + a.value, 0);

  // Calculate daily change (mock calculation)
  const dailyChange = assets.reduce((sum, a) => sum + a.change24h, 0);
  const dailyChangePercent = (dailyChange / netWorth) * 100;

  const categoryData = [
    { key: 'cash', value: cashTotal, change24h: 0 },
    { key: 'crypto', value: cryptoTotal, change24h: cryptoChange24h },
    { key: 'stocks', value: stocksTotal, change24h: stocksChange24h },
    { key: 'real-estate', value: realEstateTotal, change24h: 0 },
    { key: 'cars', value: carsTotal, change24h: 0 },
    { key: 'valuables', value: valuablesTotal, change24h: 0 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${formatCurrency(amount)}`;
  };

  return (
    <div className="flex-1 page-enter">
      <Header 
        title="Finance Dashboard" 
        subtitle="Track your net worth across all asset classes"
      />
      
      <div className="p-8 space-y-10">
        {/* Add Transaction Modal */}
        <AddTransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

        {isLoading ? (
          /* Loading State */
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading your portfolio...</p>
          </motion.div>
        ) : netWorth === 0 ? (
          /* Empty State - No Assets */
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8 p-6 rounded-3xl bg-white/[0.04] border border-white/[0.08]">
              <Wallet className="h-12 w-12 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">No assets yet</h2>
            <p className="text-muted-foreground mb-8 max-w-lg text-lg">
              Add your first asset to start tracking your portfolio and watch your wealth grow over time.
            </p>
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors duration-200 shadow-[0_0_25px_rgba(249,115,22,0.3)] text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              Add Transaction
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Hero Net Worth Section */}
            <section>
              <BalanceCard
                title="Total Net Worth"
                value={netWorth}
                change={dailyChange}
                changePercent={dailyChangePercent}
                size="lg"
              />
            </section>

            {/* Category Breakdown */}
            <section>
              <motion.div 
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Portfolio Breakdown</h2>
                  <p className="text-sm text-muted-foreground mt-1">Asset allocation by category</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Wallet className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">6 categories</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryData.map((cat, index) => {
                  const config = categoryConfig[cat.key];
                  const Icon = config.icon;
                  const percentage = ((cat.value / netWorth) * 100).toFixed(2);
                  
                  return (
                    <motion.div
                  key={cat.key}
                  className={cn(
                    'relative p-5 rounded-2xl border bg-card/50 backdrop-blur-sm',
                    'hover:bg-card transition-all duration-300 cursor-pointer',
                    'hover:-translate-y-1 hover:shadow-card-hover',
                    'border-white/[0.04] hover:border-white/[0.08]'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'p-2.5 rounded-xl border',
                      config.color
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      'text-sm font-semibold font-numbers',
                      config.color.split(' ')[0]
                    )}>
                      {percentage}%
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {config.label}
                  </h3>
                  <p className="text-2xl font-bold text-white font-numbers tracking-tight">
                    {formatCurrency(cat.value)}
                  </p>

                  {/* 24h change indicator - only for crypto and stocks */}
                  {(cat.key === 'crypto' || cat.key === 'stocks') && cat.change24h !== 0 && (
                    <div className="text-sm text-muted font-numbers mt-2">
                      24h: <span className={cat.change24h >= 0 ? 'text-success' : 'text-danger'}>
                        {formatChange(cat.change24h)}
                      </span>
                    </div>
                  )}

                  {/* Progress bar showing allocation */}
                  <div className="mt-4 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        cat.key === 'cash' && 'bg-slate-500',
                        cat.key === 'crypto' && 'bg-orange-500',
                        cat.key === 'stocks' && 'bg-blue-500',
                        cat.key === 'real-estate' && 'bg-emerald-500',
                        cat.key === 'cars' && 'bg-red-500',
                        cat.key === 'valuables' && 'bg-purple-500',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Individual Assets */}
        <section>
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Asset Holdings</h2>
              <p className="text-sm text-muted-foreground mt-1">Individual positions and performance</p>
            </div>
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Transaction
            </motion.button>
          </motion.div>

          {/* Category Filter Tabs */}
          <motion.div 
            className="flex items-center gap-2 mb-8 overflow-x-auto pb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {assetCategories.map((category, index) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.key;
              const assetCount = assets.filter(asset => asset.category === category.key).length;
              
              return (
                <motion.button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                    'border transition-all duration-300 whitespace-nowrap',
                    isActive
                      ? 'nav-item-active text-white border-accent/20'
                      : 'text-muted-foreground hover:text-white hover:bg-white/[0.04] border-border hover:border-border-hover'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={cn(
                    'h-4 w-4 transition-colors duration-300',
                    isActive ? 'text-accent' : 'text-muted group-hover:text-white'
                  )} />
                  <span>{category.label}</span>
                  {assetCount > 0 && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-md font-medium transition-colors duration-300',
                      isActive 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-white/[0.06] text-muted-foreground'
                    )}>
                      {assetCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Asset Cards Grid */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssets.map((asset, index) => {
                // Get real chart data for crypto and stock assets, fallback to asset.history
                let chartData = asset.history;
                if (asset.category === 'crypto') {
                  chartData = getChartData(asset.id);
                } else if (asset.category === 'stocks') {
                  chartData = getStockChartData(asset.id);
                }
                
                const assetWithChart = { 
                  ...asset, 
                  history: chartData && chartData.length > 0 ? chartData : asset.history 
                };
                
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  >
                    <AssetCard asset={assetWithChart} index={index} />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <Coins className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No {assetCategories.find(cat => cat.key === activeCategory)?.label.toLowerCase()} assets yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Add your first {assetCategories.find(cat => cat.key === activeCategory)?.label.toLowerCase()} asset to start tracking your portfolio performance.
              </p>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors duration-200 shadow-[0_0_20px_rgba(249,115,22,0.25)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </motion.button>
            </motion.div>
          )}
        </section>
          </>
        )}
      </div>
    </div>
  );
}
