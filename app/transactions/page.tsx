'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useAssets } from '@/lib/assetStore';
import { Calendar, Filter, Search, TrendingUp, TrendingDown, Banknote, Coins, Building2, Car, Gem, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionData {
  id: string;
  date: string;
  rawDate: string; // ISO string for sorting
  assetName: string;
  category: string;
  type?: 'Credit' | 'Debit' | 'Transfer';
  quantity?: number;
  usdValue: number;
  notes?: string;
  bankName?: string;
  accountType?: string;
  recipientBank?: string;
}

const categoryConfig = {
  cash: { icon: Banknote, color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20', label: 'Cash' },
  crypto: { icon: Coins, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', label: 'Crypto' },
  stocks: { icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', label: 'Stocks' },
  'real-estate': { icon: Building2, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', label: 'Real Estate' },
  cars: { icon: Car, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', label: 'Cars' },
  valuables: { icon: Gem, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', label: 'Valuables' },
};

export default function TransactionsPage() {
  const { assets, isLoading } = useAssets();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [transferRecords, setTransferRecords] = useState<any[]>([]);

  // Load transfer records from API
  useEffect(() => {
    async function loadTransfers() {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setTransferRecords(data);
        }
      } catch (e) {
        console.error('Error loading transfers:', e);
      }
    }
    loadTransfers();
  }, []);

  // Convert assets to transactions and merge with transfer records
  const transactions: TransactionData[] = useMemo(() => {
    const assetTransactions = assets.map(asset => {
      // Try to extract creation date from asset (createdAt field if it exists)
      let transactionDate = 'N/A';
      if ((asset as any).createdAt) {
        try {
          transactionDate = format(new Date((asset as any).createdAt), 'MMM dd, yyyy HH:mm');
        } catch {
          transactionDate = 'N/A';
        }
      }

      const transaction: TransactionData = {
        id: asset.id,
        date: transactionDate,
        rawDate: (asset as any).createdAt || '',
        assetName: asset.name,
        category: asset.category,
        usdValue: asset.value,
        notes: (asset as any).notes || '',
      };

      // Add category-specific fields
      if (asset.category === 'cash') {
        transaction.bankName = (asset as any).bankName || '';
        transaction.type = (asset as any).accountType as 'Credit' | 'Debit' | 'Transfer';
        
        // For transfers, include recipient bank info
        if ((asset as any).accountType === 'Transfer' && (asset as any).recipientBank) {
          transaction.recipientBank = (asset as any).recipientBank;
        }
      } else if (asset.category === 'crypto' || asset.category === 'stocks') {
        transaction.quantity = (asset as any).qty || 0;
      }

      return transaction;
    });

    // Add transfer records
    const transfers: TransactionData[] = transferRecords.map(t => ({
      id: t.id,
      date: t.createdAt ? format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A',
      rawDate: t.createdAt || '',
      assetName: `${t.sourceBank} → ${t.recipientBank}`,
      category: 'cash',
      type: 'Transfer' as const,
      usdValue: t.value,
      notes: t.notes || '',
      bankName: t.sourceBank,
      recipientBank: t.recipientBank,
    }));

    return [...assetTransactions, ...transfers];
  }, [assets, transferRecords]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchMatch = 
          transaction.assetName.toLowerCase().includes(searchLower) ||
          transaction.category.toLowerCase().includes(searchLower) ||
          transaction.bankName?.toLowerCase().includes(searchLower) ||
          transaction.notes?.toLowerCase().includes(searchLower);
        
        if (!searchMatch) return false;
      }

      // Category filter
      if (selectedCategory && transaction.category !== selectedCategory) {
        return false;
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        if (transaction.date === 'N/A') return false;
        
        try {
          const transactionDate = new Date(transaction.date);
          if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            if (transactionDate < fromDate) return false;
          }
          if (dateRange.to) {
            const toDate = new Date(dateRange.to + 'T23:59:59'); // End of day
            if (transactionDate > toDate) return false;
          }
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchTerm, selectedCategory, dateRange]);

  // Sort transactions by date (newest first, N/A at the end)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (!a.rawDate && !b.rawDate) return 0;
      if (!a.rawDate) return 1;
      if (!b.rawDate) return -1;
      return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
    });
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setDateRange({ from: '', to: '' });
  };

  const hasActiveFilters = searchTerm || selectedCategory || dateRange.from || dateRange.to;

  return (
    <div className="flex-1 page-enter">
      <Header 
        title="Transactions" 
        subtitle="Complete history of all your asset transactions"
      />
      
      <div className="p-8 space-y-6">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Top Row - Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/[0.06] transition-all duration-200"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all duration-200"
              >
                Clear Filters
              </button>
            )}

            {/* Results Count */}
            <div className="text-sm text-white/60">
              {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Bottom Row - Category and Date Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/60 font-medium">Category:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                    !selectedCategory
                      ? 'bg-accent/10 border-accent/20 text-accent'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  All
                </button>
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                        selectedCategory === key
                          ? `${config.bgColor} ${config.borderColor} ${config.color}`
                          : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08]'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/60 font-medium">Date:</span>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent/50"
              />
              <span className="text-white/40">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading transactions...</p>
          </motion.div>
        ) : sortedTransactions.length === 0 ? (
          /* Empty State */
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8 p-6 rounded-3xl bg-white/[0.04] border border-white/[0.08]">
              <Eye className="h-12 w-12 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg text-lg">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more transactions.'
                : 'Add your first asset to start tracking your transaction history.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors duration-200 shadow-[0_0_25px_rgba(249,115,22,0.3)]"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          /* Transactions Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Date</div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Asset / Bank</div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Category</div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Type</div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Quantity</div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider text-right">USD Value</div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Notes</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/[0.04]">
              {sortedTransactions.map((transaction, index) => {
                const config = categoryConfig[transaction.category as keyof typeof categoryConfig];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="grid grid-cols-7 gap-4 p-4 hover:bg-white/[0.02] transition-all duration-200"
                  >
                    {/* Date */}
                    <div className="flex items-center text-sm text-white/80">
                      {transaction.date}
                    </div>

                    {/* Asset Name / Bank Name */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn('p-1.5 rounded-lg', config.bgColor, config.borderColor, 'border')}>
                        <Icon className={cn('h-3 w-3', config.color)} />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {transaction.type === 'Transfer' && transaction.recipientBank 
                            ? `${transaction.bankName} → ${transaction.recipientBank}`
                            : transaction.assetName
                          }
                        </div>
                        {transaction.bankName && transaction.type !== 'Transfer' && (
                          <div className="text-xs text-white/60">{transaction.bankName}</div>
                        )}
                        {transaction.type === 'Transfer' && (
                          <div className="text-xs text-white/60">Bank Transfer</div>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-lg border',
                        config.bgColor,
                        config.borderColor,
                        config.color
                      )}>
                        {config.label}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="flex items-center text-sm">
                      {transaction.type ? (
                        <span className={cn(
                          'flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg',
                          transaction.type === 'Credit' 
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : transaction.type === 'Transfer'
                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        )}>
                          {transaction.type === 'Credit' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : transaction.type === 'Transfer' ? (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {transaction.type}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center text-sm text-white/80 font-numbers">
                      {transaction.quantity ? transaction.quantity.toLocaleString() : '—'}
                    </div>

                    {/* USD Value */}
                    <div className="flex items-center justify-end text-sm font-semibold text-white font-numbers">
                      {formatCurrency(transaction.usdValue)}
                    </div>

                    {/* Notes */}
                    <div className="flex items-center text-sm text-white/60 truncate">
                      {transaction.notes || '—'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}