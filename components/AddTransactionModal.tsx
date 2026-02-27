'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, Coins, TrendingUp, Building2, Car, Gem, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssets } from '@/lib/assetStore';
import { useStockPrices } from '@/lib/stockPriceService';
import { banksStorage, transactionsStorage } from '@/lib/localStorage';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

interface CoinSearchResponse {
  coins: CoinSearchResult[];
}

interface CoinPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface SelectedCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  price?: number;
  priceChange24h?: number;
}

interface StockSearchResult {
  symbol: string;
  instrument_name: string;
  exchange: string;
  mic_code: string;
  exchange_timezone: string;
  instrument_type: string;
  country: string;
}

interface SelectedStock {
  symbol: string;
  name: string;
  exchange: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

const categories = [
  { key: 'crypto', label: 'Cryptocurrency', icon: Coins, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { key: 'stocks', label: 'Stocks & Equities', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { key: 'real-estate', label: 'Real Estate', icon: Building2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { key: 'cash', label: 'Cash', icon: Banknote, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  { key: 'cars', label: 'Cars', icon: Car, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { key: 'valuables', label: 'Valuables', icon: Gem, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
];

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { addAsset, removeAsset, updateAsset, assets } = useAssets();
  const { searchStocks, fetchStockQuote } = useStockPrices();
  const [category, setCategory] = useState('crypto');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [value, setValue] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');

  // Cash category specific fields
  const [selectedBank, setSelectedBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [usdValue, setUsdValue] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [banks, setBanks] = useState<string[]>([]);
  const [showBankInput, setShowBankInput] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{show: boolean, bankName: string}>({show: false, bankName: ''});
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  // Transfer-specific fields
  const [recipientBank, setRecipientBank] = useState('');
  const [showRecipientBankInput, setShowRecipientBankInput] = useState(false);
  const [newRecipientBankName, setNewRecipientBankName] = useState('');
  const [showRecipientBankDropdown, setShowRecipientBankDropdown] = useState(false);
  const recipientBankDropdownRef = useRef<HTMLDivElement>(null);

  // Crypto autocomplete state
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [cryptoResults, setCryptoResults] = useState<CoinSearchResult[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin | null>(null);
  const [quantity, setQuantity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPriceLabel, setCurrentPriceLabel] = useState('Current Value (USD)');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Stock autocomplete state
  const [stockSearch, setStockSearch] = useState('');
  const [stockResults, setStockResults] = useState<StockSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [showStockDropdown, setShowStockDropdown] = useState(false);
  const [isStockSearching, setIsStockSearching] = useState(false);
  const [currentStockPriceLabel, setCurrentStockPriceLabel] = useState('Current Value (USD)');
  const stockSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stockDropdownRef = useRef<HTMLDivElement>(null);

  // Real Estate specific state
  const [propertyType, setPropertyType] = useState<'off-plan' | 'ready'>('ready');
  const [initialPayment, setInitialPayment] = useState('');
  const [admTaxFee, setAdmTaxFee] = useState('');
  const [numberOfPayments, setNumberOfPayments] = useState('');
  const [payments, setPayments] = useState<Array<{ percentage: string, dueDate: string }>>([]);

  // Debounced search for crypto
  const debouncedSearch = useCallback(
    (query: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (query.length < 2) {
        setCryptoResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
          const data: CoinSearchResponse = await response.json();
          setCryptoResults(data.coins.slice(0, 8));
          setShowDropdown(true);
        } catch (error) {
          console.error('Error searching coins:', error);
          setCryptoResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    []
  );

  // Debounced search for stocks
  const debouncedStockSearch = useCallback(
    (query: string) => {
      if (stockSearchTimeoutRef.current) {
        clearTimeout(stockSearchTimeoutRef.current);
      }
      
      if (query.length < 2) {
        setStockResults([]);
        setShowStockDropdown(false);
        setIsStockSearching(false);
        return;
      }

      setIsStockSearching(true);
      stockSearchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchStocks(query);
          setStockResults(results);
          setShowStockDropdown(true);
        } catch (error) {
          console.error('Error searching stocks:', error);
          setStockResults([]);
        } finally {
          setIsStockSearching(false);
        }
      }, 300);
    },
    [searchStocks]
  );

  // Fetch current price for selected coin
  const fetchCoinPrice = async (coinId: string) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
      const data: CoinPriceResponse = await response.json();
      const priceData = data[coinId];
      if (priceData) {
        return {
          price: priceData.usd,
          priceChange24h: priceData.usd_24h_change,
        };
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
    return null;
  };

  // Handle coin selection
  const handleCoinSelect = async (coin: CoinSearchResult) => {
    const newSelectedCoin: SelectedCoin = {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.thumb,
    };

    // Fetch price data
    const priceData = await fetchCoinPrice(coin.id);
    if (priceData) {
      newSelectedCoin.price = priceData.price;
      newSelectedCoin.priceChange24h = priceData.priceChange24h;
      setCurrentPriceLabel(`Current price: $${priceData.price.toLocaleString()}`);
    }

    setSelectedCoin(newSelectedCoin);
    setCryptoSearch('');
    setShowDropdown(false);
    setCryptoResults([]);
  };

  // Handle stock selection
  const handleStockSelect = async (stock: StockSearchResult) => {
    const newSelectedStock: SelectedStock = {
      symbol: stock.symbol,
      name: stock.instrument_name,
      exchange: stock.exchange,
    };

    // Fetch quote data
    const quoteData = await fetchStockQuote(stock.symbol);
    if (quoteData && quoteData.close) {
      newSelectedStock.price = quoteData.close;
      newSelectedStock.change = quoteData.change;
      newSelectedStock.changePercent = quoteData.percent_change;
      setCurrentStockPriceLabel(`Current price: $${quoteData.close.toLocaleString()}`);
    }

    setSelectedStock(newSelectedStock);
    setStockSearch('');
    setShowStockDropdown(false);
    setStockResults([]);
  };

  // Calculate total value when quantity or price changes
  useEffect(() => {
    if (selectedCoin?.price) {
      if (quantity) {
        const total = parseFloat(quantity) * selectedCoin.price;
        setValue(total.toString());
      } else {
        // Show unit price even when quantity is not entered
        setValue(selectedCoin.price.toString());
      }
    }
  }, [quantity, selectedCoin?.price]);

  // Calculate total value when stock quantity or price changes
  useEffect(() => {
    if (selectedStock?.price) {
      if (stockQuantity) {
        const total = parseFloat(stockQuantity) * selectedStock.price;
        setValue(total.toString());
      } else {
        // Show unit price even when quantity is not entered
        setValue(selectedStock.price.toString());
      }
    }
  }, [stockQuantity, selectedStock?.price]);

  // Generate payment rows when numberOfPayments changes
  useEffect(() => {
    const numPayments = parseInt(numberOfPayments) || 0;
    if (numPayments > 0 && numPayments <= 6) { // Cap at 6 payments
      const newPayments = Array(numPayments).fill(null).map((_, index) => ({
        percentage: payments[index]?.percentage || '',
        dueDate: payments[index]?.dueDate || ''
      }));
      setPayments(newPayments);
    } else {
      setPayments([]);
    }
  }, [numberOfPayments]);

  // Handle crypto search input
  const handleCryptoSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCryptoSearch(query);
    debouncedSearch(query);
  };

  // Handle stock search input
  const handleStockSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setStockSearch(query);
    debouncedStockSearch(query);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(event.target as Node)) {
        setShowStockDropdown(false);
      }
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
      if (recipientBankDropdownRef.current && !recipientBankDropdownRef.current.contains(event.target as Node)) {
        setShowRecipientBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (stockSearchTimeoutRef.current) {
        clearTimeout(stockSearchTimeoutRef.current);
      }
    };
  }, []);

  // Load banks when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBanks();
    }
  }, [isOpen]);

  // Load banks from localStorage or seed data
  const loadBanks = async () => {
    try {
      // Try localStorage first
      const storedBanks = banksStorage.get();
      
      if (storedBanks && Array.isArray(storedBanks)) {
        setBanks(storedBanks);
      } else {
        // Load seed data if localStorage is empty
        const response = await fetch('/api/seed-data');
        if (response.ok) {
          const data = await response.json();
          const seedBanks = data.banks;
          if (Array.isArray(seedBanks)) {
            setBanks(seedBanks);
            banksStorage.save(seedBanks);
          }
        }
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  // Add new bank
  const handleAddBank = async () => {
    const bankName = newBankName.trim();
    if (!bankName) return;

    try {
      const updatedBanks = [...banks];
      if (!updatedBanks.includes(bankName)) {
        updatedBanks.push(bankName);
        setBanks(updatedBanks);
        banksStorage.save(updatedBanks);
      }
      setSelectedBank(bankName);
      setNewBankName('');
      setShowBankInput(false);
    } catch (error) {
      console.error('Error adding bank:', error);
      alert('Failed to add bank. Please try again.');
    }
  };

  // Delete bank and all associated assets
  const handleDeleteBank = async (bankName: string) => {
    try {
      // Delete the bank from the banks list
      const updatedBanks = banks.filter(bank => bank !== bankName);
      setBanks(updatedBanks);
      banksStorage.save(updatedBanks);

      // If this was the selected bank, clear selection
      if (selectedBank === bankName) {
        setSelectedBank('');
      }

      // Remove all assets associated with this bank from the asset store
      const assetsToRemove = assets.filter(asset => 
        asset.category === 'cash' && (asset as any).bankName === bankName
      );
      assetsToRemove.forEach(asset => removeAsset(asset.id));

      setDeleteConfirmation({show: false, bankName: ''});
    } catch (error) {
      console.error('Error deleting bank:', error);
      alert('Failed to delete bank and its assets. Please try again.');
      setDeleteConfirmation({show: false, bankName: ''});
    }
  };

  // Add new recipient bank
  const handleAddRecipientBank = async () => {
    const bankName = newRecipientBankName.trim();
    if (!bankName) return;

    try {
      const updatedBanks = [...banks];
      if (!updatedBanks.includes(bankName)) {
        updatedBanks.push(bankName);
        setBanks(updatedBanks);
        banksStorage.save(updatedBanks);
      }
      setRecipientBank(bankName);
      setNewRecipientBankName('');
      setShowRecipientBankInput(false);
    } catch (error) {
      console.error('Error adding recipient bank:', error);
      alert('Failed to add recipient bank. Please try again.');
    }
  };

  const resetForm = () => {
    setCategory('crypto');
    setName('');
    setSymbol('');
    setValue('');
    setPurchasePrice('');
    setNotes('');
    setCryptoSearch('');
    setCryptoResults([]);
    setSelectedCoin(null);
    setQuantity('');
    setShowDropdown(false);
    setIsSubmitting(false);
    setCurrentPriceLabel('Current Value (USD)');
    // Stock specific fields
    setStockSearch('');
    setStockResults([]);
    setSelectedStock(null);
    setStockQuantity('');
    setShowStockDropdown(false);
    setIsStockSearching(false);
    setCurrentStockPriceLabel('Current Value (USD)');
    // Cash specific fields
    setSelectedBank('');
    setAccountType('');
    setUsdValue('');
    setCashNotes('');
    setShowBankInput(false);
    setNewBankName('');
    setShowBankDropdown(false);
    setDeleteConfirmation({show: false, bankName: ''});
    // Transfer specific fields
    setRecipientBank('');
    setShowRecipientBankInput(false);
    setNewRecipientBankName('');
    setShowRecipientBankDropdown(false);
    // Real estate specific fields
    setPropertyType('ready');
    setInitialPayment('');
    setAdmTaxFee('');
    setNumberOfPayments('');
    setPayments([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (stockSearchTimeoutRef.current) {
      clearTimeout(stockSearchTimeoutRef.current);
    }
  };

  // Generate fallback chart data based on current price and 24h change
  const generateFallbackChartData = (currentPrice: number, priceChange24h: number, quantity: number) => {
    const now = Date.now();
    const hoursBack = 24;
    const dataPoints = 8;
    const intervalMs = (hoursBack * 60 * 60 * 1000) / dataPoints;
    
    const changePerHour = priceChange24h / hoursBack / 100; // Convert percentage to decimal per hour
    const startPrice = currentPrice / (1 + priceChange24h / 100); // Price 24h ago
    
    const chartData = [];
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now - (dataPoints - 1 - i) * intervalMs;
      const priceAtTime = startPrice * (1 + changePerHour * (i * hoursBack / dataPoints));
      const valueAtTime = Math.round(priceAtTime * quantity);
      
      chartData.push({
        timestamp,
        value: valueAtTime
      });
    }
    
    return chartData;
  };

  // Fetch 24h chart data for a crypto asset
  const fetchCryptoChartData = async (coinId: string, quantity: number, currentPrice?: number, priceChange24h?: number) => {
    try {
      // Try the chart API first (without interval parameter to avoid rate limits)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.prices && data.prices.length > 0) {
          // Ensure we get exactly 8 data points for aesthetic charts
          const totalPoints = data.prices.length;
          const targetPoints = 8;
          const step = Math.max(1, Math.floor(totalPoints / targetPoints));
          
          const reducedPrices = data.prices.filter((_: any, index: number) => index % step === 0).slice(0, targetPoints);
          
          // Convert to HistoryPoint format with portfolio value (price * quantity)
          const chartData = reducedPrices.map(([timestamp, price]: [number, number]) => ({
            timestamp,
            value: Math.round(price * quantity), // Portfolio value, not just price
          }));

          return chartData;
        }
      }
    } catch (error) {
      console.warn(`CoinGecko chart API failed for ${coinId}:`, error);
    }
    
    // Fallback: Generate mock chart data based on current price and 24h change
    if (currentPrice && priceChange24h !== undefined) {
      console.log(`Using fallback chart data for ${coinId} based on price: $${currentPrice}, change: ${priceChange24h}%`);
      return generateFallbackChartData(currentPrice, priceChange24h, quantity);
    }
    
    console.warn(`No chart data available for ${coinId}`);
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for crypto category
    if (category === 'crypto' && selectedCoin && !quantity) {
      alert('Please enter a quantity for your crypto holding');
      return;
    }
    
    // Validation for stocks category
    if (category === 'stocks' && selectedStock && !stockQuantity) {
      alert('Please enter a quantity for your stock holding');
      return;
    }
    
    // Validation for cash category
    if (category === 'cash') {
      if (!selectedBank) {
        alert('Please select a bank');
        return;
      }
      if (!accountType) {
        alert('Please select an account type');
        return;
      }
      if (accountType === 'Transfer' && !recipientBank) {
        alert('Please select a recipient bank for transfer');
        return;
      }
      if (accountType === 'Transfer' && selectedBank === recipientBank) {
        alert('Source and recipient banks must be different');
        return;
      }
      if (!usdValue) {
        alert('Please enter the USD value');
        return;
      }
    }

    // Validation for real estate category
    if (category === 'real-estate') {
      if (!name) {
        alert('Please enter the property name');
        return;
      }
      if (!purchasePrice) {
        alert('Please enter the purchase price');
        return;
      }
      if (!admTaxFee) {
        alert('Please enter the ADM tax fee');
        return;
      }
      if (propertyType === 'off-plan') {
        if (!initialPayment) {
          alert('Please enter the initial payment');
          return;
        }
        if (!numberOfPayments) {
          alert('Please enter the number of remaining payments');
          return;
        }
        if (parseInt(numberOfPayments) > 6) {
          alert('Maximum 6 remaining payments allowed');
          return;
        }
        if (payments.length === 0) {
          alert('Please set up the payment schedule');
          return;
        }
        // Validate that all payment fields are filled
        for (let i = 0; i < payments.length; i++) {
          if (!payments[i].percentage || !payments[i].dueDate) {
            alert(`Please complete payment ${i + 1} details (percentage and due date)`);
            return;
          }
        }
        // Validate that percentages add up to reasonable amount (warn if not 100%)
        const totalPercentage = payments.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0);
        const initialPercentage = (parseFloat(initialPayment) / parseFloat(purchasePrice)) * 100;
        const expectedTotal = totalPercentage + initialPercentage;
        if (Math.abs(expectedTotal - 100) > 0.1) {
          const proceed = confirm(`Initial payment (${initialPercentage.toFixed(1)}%) + remaining payments (${totalPercentage.toFixed(1)}%) = ${expectedTotal.toFixed(1)}% instead of 100%. Continue anyway?`);
          if (!proceed) return;
        }
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate unique ID
      const id = category === 'crypto' && selectedCoin 
        ? `crypto-${selectedCoin.id}`
        : category === 'stocks' && selectedStock
          ? `stock-${selectedStock.symbol}`
          : `${category}-${Date.now()}`;
      
      // Fetch chart data for crypto and stock assets immediately
      let history = [];
      if (category === 'crypto' && selectedCoin && quantity) {
        history = await fetchCryptoChartData(
          selectedCoin.id, 
          parseFloat(quantity), 
          selectedCoin.price, 
          selectedCoin.priceChange24h
        );
      } else if (category === 'stocks' && selectedStock && stockQuantity) {
        // Note: Stock chart data will be fetched by the stockPriceService hook
        // We'll leave history empty for now and let the service populate it
        history = [];
      }
      
      // Create asset object based on category
      let newAsset: any;

      // Add timestamp to all new assets
      const createdAt = new Date().toISOString();

      if (category === 'cash') {
        // Cash category specific asset structure
        newAsset = {
          id: `cash-${selectedBank.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          name: accountType === 'Transfer' ? `${selectedBank} → ${recipientBank}` : selectedBank,
          symbol: 'USD',
          value: parseFloat(usdValue),
          category: 'cash',
          bankName: selectedBank,
          accountType,
          recipientBank: accountType === 'Transfer' ? recipientBank : undefined,
          notes: cashNotes,
          change24h: 0,
          changePercent: 0,
          history: [], // Cash doesn't have price history
          createdAt, // Add timestamp
        };
      } else {
        // Original logic for other categories (crypto, stocks, etc.)
        if (category === 'crypto' && selectedCoin) {
          newAsset = {
            id,
            name: selectedCoin.name,
            symbol: selectedCoin.symbol.toUpperCase(),
            value: parseFloat(value),
            price: selectedCoin.price,
            qty: quantity ? parseFloat(quantity) : undefined,
            change24h: selectedCoin.priceChange24h ? (selectedCoin.priceChange24h / 100) * parseFloat(value) : 0,
            changePercent: selectedCoin.priceChange24h || 0,
            category: category as any,
            history, // Chart data for crypto assets
            createdAt,
          };
        } else if (category === 'stocks' && selectedStock) {
          newAsset = {
            id,
            name: selectedStock.name,
            symbol: selectedStock.symbol.toUpperCase(),
            value: parseFloat(value),
            price: selectedStock.price,
            qty: stockQuantity ? parseFloat(stockQuantity) : undefined,
            change24h: selectedStock.change && stockQuantity ? selectedStock.change * parseFloat(stockQuantity) : 0,
            changePercent: selectedStock.changePercent || 0,
            category: category as any,
            history, // Chart data will be populated by stockPriceService
            createdAt,
          };
        } else if (category === 'real-estate') {
          // Calculate current value based on property type
          let currentValue: number;
          
          if (propertyType === 'ready') {
            // For ready properties: value = Purchase Price + ADM Tax Fee
            currentValue = parseFloat(purchasePrice) + parseFloat(admTaxFee);
          } else {
            // For off-plan properties: value = Initial Payment + ADM Tax Fee + past-due payments
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            
            const pastDuePayments = payments.filter(payment => {
              const dueDate = new Date(payment.dueDate);
              return dueDate <= today;
            });
            
            const pastDueAmount = pastDuePayments.reduce((sum, payment) => {
              return sum + (parseFloat(payment.percentage) / 100) * parseFloat(purchasePrice);
            }, 0);
            
            currentValue = parseFloat(initialPayment) + parseFloat(admTaxFee) + pastDueAmount;
          }
          
          // Real Estate specific asset structure
          newAsset = {
            id,
            name,
            symbol: '', // No symbol for real estate
            value: currentValue,
            price: undefined,
            qty: undefined,
            change24h: 0,
            changePercent: 0,
            category: category as any,
            history: [],
            createdAt,
            // Real estate specific fields
            propertyType,
            purchasePrice: parseFloat(purchasePrice),
            initialPayment: propertyType === 'off-plan' ? parseFloat(initialPayment) : undefined,
            admTaxFee: parseFloat(admTaxFee),
            payments: propertyType === 'off-plan' ? payments.map(p => ({
              percentage: parseFloat(p.percentage) || 0,
              dueDate: p.dueDate
            })) : undefined,
            notes,
          };
        } else {
          // Other categories (cars, valuables)
          newAsset = {
            id,
            name,
            symbol: symbol.toUpperCase(),
            value: parseFloat(value),
            price: undefined,
            qty: undefined,
            change24h: 0,
            changePercent: 0,
            category: category as any,
            history: [],
            createdAt,
          };
        }
      }
      
      // For transfers, update balances and log transaction — no new asset
      if (category === 'cash' && accountType === 'Transfer') {
        const transferAmount = parseFloat(usdValue);
        
        // Debit source bank
        const sourceAsset = assets.find(a => a.category === 'cash' && (a as any).bankName === selectedBank);
        if (sourceAsset) {
          updateAsset(sourceAsset.id, { value: sourceAsset.value - transferAmount });
        }
        
        // Credit recipient bank
        const recipientAsset = assets.find(a => a.category === 'cash' && (a as any).bankName === recipientBank);
        if (recipientAsset) {
          updateAsset(recipientAsset.id, { value: recipientAsset.value + transferAmount });
        }
        
        // Log the transfer as a transaction record
        const currentTransactions = transactionsStorage.get() || [];
        const newTransaction = {
          id: `transfer-${Date.now()}`,
          type: 'Transfer',
          category: 'cash',
          sourceBank: selectedBank,
          recipientBank: recipientBank,
          value: transferAmount,
          notes: cashNotes,
          createdAt: new Date().toISOString(),
        };
        currentTransactions.push(newTransaction);
        transactionsStorage.save(currentTransactions);
        
        resetForm();
        onClose();
        return; // Don't create a new asset entry
      }
      
      addAsset(newAsset);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.06] transition-all duration-200';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-visible"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.04]">
              <div>
                <h2 className="text-lg font-bold text-white">Add Transaction</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add a new asset to your portfolio</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category Selector */}
              <div>
                <label className={labelClass}>Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200',
                          isActive
                            ? 'border-accent/40 bg-accent/10 text-white'
                            : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white'
                        )}
                      >
                        <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-accent' : '')} />
                        <span className="truncate">{cat.key === 'real-estate' ? 'Real Estate' : cat.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category-specific fields */}
              {category === 'cash' ? (
                <>
                  {/* Bank Name Dropdown */}
                  <div>
                    <label className={labelClass}>Bank Name</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative" ref={bankDropdownRef}>
                        {/* Custom dropdown trigger */}
                        <button
                          type="button"
                          onClick={() => setShowBankDropdown(!showBankDropdown)}
                          className={cn(
                            inputClass, 
                            'text-left flex items-center justify-between',
                            !selectedBank && 'text-white/20'
                          )}
                        >
                          <span>{selectedBank || 'Select a bank'}</span>
                          <motion.div
                            animate={{ rotate: showBankDropdown ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </button>

                        {/* Custom dropdown menu */}
                        <AnimatePresence>
                          {showBankDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl max-h-64 overflow-y-auto z-20"
                            >
                              {banks.length > 0 ? (
                                <>
                                  {/* Empty selection option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedBank('');
                                      setShowBankDropdown(false);
                                    }}
                                    className={cn(
                                      'w-full text-left px-3 py-2.5 hover:bg-white/[0.06] transition-all duration-200 border-b border-white/[0.04] text-white/40',
                                      !selectedBank && 'bg-white/[0.04]'
                                    )}
                                  >
                                    Select a bank
                                  </button>
                                  
                                  {/* Bank options with delete buttons */}
                                  {banks.map((bank) => (
                                    <div
                                      key={bank}
                                      className="flex items-center group hover:bg-white/[0.06] transition-all duration-200 border-b border-white/[0.04] last:border-b-0"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedBank(bank);
                                          setShowBankDropdown(false);
                                        }}
                                        className={cn(
                                          'flex-1 text-left px-3 py-2.5 text-white text-sm',
                                          selectedBank === bank && 'bg-white/[0.04]'
                                        )}
                                      >
                                        {bank}
                                      </button>
                                      
                                      {/* Delete button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirmation({show: true, bankName: bank});
                                        }}
                                        className="p-2 mr-1 rounded-lg text-white/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                        title={`Delete ${bank}`}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <div className="p-3 text-center text-white/40 text-sm">
                                  No banks available
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Always visible + button for adding new banks */}
                      <button
                        type="button"
                        onClick={() => setShowBankInput(!showBankInput)}
                        className={cn(
                          "px-3 py-3 rounded-xl flex items-center transition-all duration-200 shrink-0",
                          showBankInput 
                            ? "bg-accent/20 border border-accent/40 text-accent" 
                            : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                        )}
                        title={showBankInput ? "Close add bank" : "Add new bank"}
                      >
                        <Plus className={cn("h-4 w-4 transition-transform duration-200", showBankInput && "rotate-45")} />
                      </button>
                    </div>
                    
                    {/* Add new bank input */}
                    <AnimatePresence>
                      {showBankInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 flex gap-2"
                        >
                          <input
                            type="text"
                            value={newBankName}
                            onChange={(e) => setNewBankName(e.target.value)}
                            placeholder="Enter new bank name"
                            className={cn(inputClass, 'flex-1')}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddBank();
                              }
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleAddBank}
                            disabled={!newBankName.trim()}
                            className={cn(
                              "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                              newBankName.trim() 
                                ? "bg-accent hover:bg-accent/90 text-white" 
                                : "bg-white/[0.04] border border-white/[0.08] text-white/40 cursor-not-allowed"
                            )}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowBankInput(false);
                              setNewBankName('');
                            }}
                            className="px-3 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Transaction Type (only show after bank is selected) */}
                  {selectedBank && (
                    <div>
                      <label className={labelClass}>Transaction Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Credit', 'Debit', 'Transfer'].map((type) => {
                          const isActive = accountType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setAccountType(type);
                                // Clear recipient bank when switching away from Transfer
                                if (type !== 'Transfer') {
                                  setRecipientBank('');
                                }
                              }}
                              className={cn(
                                'px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200',
                                isActive
                                  ? 'border-accent/40 bg-accent/10 text-white'
                                  : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white'
                              )}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recipient Bank (only show when Transfer is selected) */}
                  <AnimatePresence>
                    {selectedBank && accountType === 'Transfer' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className=""
                      >
                        <div>
                          <label className={labelClass}>Recipient</label>
                          <div className="flex gap-2">
                            <div className="flex-1 relative" ref={recipientBankDropdownRef}>
                              {/* Custom dropdown trigger */}
                              <button
                                type="button"
                                onClick={() => setShowRecipientBankDropdown(!showRecipientBankDropdown)}
                                className={cn(
                                  inputClass, 
                                  'text-left flex items-center justify-between',
                                  !recipientBank && 'text-white/20'
                                )}
                              >
                                <span>{recipientBank || 'Select recipient bank'}</span>
                                <motion.div
                                  animate={{ rotate: showRecipientBankDropdown ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </motion.div>
                              </button>

                              {/* Custom dropdown menu */}
                              <AnimatePresence>
                                {showRecipientBankDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl max-h-64 overflow-y-auto z-20"
                                  >
                                    {banks.length > 0 ? (
                                      <>
                                        {/* Empty selection option */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRecipientBank('');
                                            setShowRecipientBankDropdown(false);
                                          }}
                                          className={cn(
                                            'w-full text-left px-3 py-2.5 hover:bg-white/[0.06] transition-all duration-200 border-b border-white/[0.04] text-white/40',
                                            !recipientBank && 'bg-white/[0.04]'
                                          )}
                                        >
                                          Select recipient bank
                                        </button>
                                        
                                        {/* Bank options (excluding the source bank) */}
                                        {banks.filter(bank => bank !== selectedBank).map((bank) => (
                                          <button
                                            key={bank}
                                            type="button"
                                            onClick={() => {
                                              setRecipientBank(bank);
                                              setShowRecipientBankDropdown(false);
                                            }}
                                            className={cn(
                                              'w-full text-left px-3 py-2.5 text-white text-sm hover:bg-white/[0.06] transition-all duration-200 border-b border-white/[0.04] last:border-b-0',
                                              recipientBank === bank && 'bg-white/[0.04]'
                                            )}
                                          >
                                            {bank}
                                          </button>
                                        ))}
                                      </>
                                    ) : (
                                      <div className="p-3 text-center text-white/40 text-sm">
                                        No other banks available
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            {/* Always visible + button for adding new banks */}
                            <button
                              type="button"
                              onClick={() => setShowRecipientBankInput(!showRecipientBankInput)}
                              className={cn(
                                "px-3 py-3 rounded-xl flex items-center transition-all duration-200 shrink-0",
                                showRecipientBankInput 
                                  ? "bg-accent/20 border border-accent/40 text-accent" 
                                  : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                              )}
                              title={showRecipientBankInput ? "Close add bank" : "Add new recipient bank"}
                            >
                              <Plus className={cn("h-4 w-4 transition-transform duration-200", showRecipientBankInput && "rotate-45")} />
                            </button>
                          </div>
                          
                          {/* Add new recipient bank input */}
                          <AnimatePresence>
                            {showRecipientBankInput && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 flex gap-2"
                              >
                                <input
                                  type="text"
                                  value={newRecipientBankName}
                                  onChange={(e) => setNewRecipientBankName(e.target.value)}
                                  placeholder="Enter new recipient bank name"
                                  className={cn(inputClass, 'flex-1')}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddRecipientBank();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={handleAddRecipientBank}
                                  disabled={!newRecipientBankName.trim()}
                                  className={cn(
                                    "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    newRecipientBankName.trim() 
                                      ? "bg-accent hover:bg-accent/90 text-white" 
                                      : "bg-white/[0.04] border border-white/[0.08] text-white/40 cursor-not-allowed"
                                  )}
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowRecipientBankInput(false);
                                    setNewRecipientBankName('');
                                  }}
                                  className="px-3 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* USD Value (only show after account type is selected) */}
                  {selectedBank && accountType && (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>USD Value</label>
                        <span className="text-xs text-white/40">
                          Available: <span className="text-white/60 font-medium">${assets.filter(a => a.category === 'cash' && (a as any).bankName === selectedBank).reduce((sum, a) => sum + a.value, 0).toLocaleString()}</span>
                        </span>
                      </div>
                      <input
                        type="number"
                        value={usdValue}
                        onChange={(e) => setUsdValue(e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* Notes (only show after USD value is entered) */}
                  {selectedBank && accountType && usdValue && (
                    <div>
                      <label className={labelClass}>Notes <span className="text-white/20">(optional)</span></label>
                      <textarea
                        value={cashNotes}
                        onChange={(e) => setCashNotes(e.target.value)}
                        placeholder="Any additional details about this account..."
                        className={cn(inputClass, 'resize-none h-20')}
                      />
                    </div>
                  )}
                </>
              ) : category === 'crypto' ? (
                <div>
                  <label className={labelClass}>Search Cryptocurrency</label>
                  {selectedCoin ? (
                    // Selected coin chip
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 flex items-center gap-3">
                      <img
                        src={selectedCoin.thumb}
                        alt={selectedCoin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{selectedCoin.name}</div>
                        <div className="text-white/60 text-xs uppercase">{selectedCoin.symbol}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCoin(null);
                          setQuantity('');
                          setValue('');
                          setCurrentPriceLabel('Current Value (USD)');
                        }}
                        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.1] transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Search input with dropdown
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        value={cryptoSearch}
                        onChange={handleCryptoSearchChange}
                        placeholder="Search for Bitcoin, Ethereum, etc..."
                        className={inputClass}
                        autoComplete="off"
                      />
                      
                      {/* Loading indicator */}
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
                        </div>
                      )}

                      {/* Dropdown */}
                      {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl max-h-64 overflow-y-auto z-10">
                          {cryptoResults.length > 0 ? (
                            cryptoResults.map((coin) => (
                              <button
                                key={coin.id}
                                type="button"
                                onClick={() => handleCoinSelect(coin)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.06] transition-all duration-200 border-b border-white/[0.04] last:border-b-0"
                              >
                                <img
                                  src={coin.thumb}
                                  alt={coin.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <div className="flex-1 text-left">
                                  <div className="text-white text-sm font-medium">{coin.name}</div>
                                  <div className="text-white/60 text-xs flex items-center gap-2">
                                    <span className="uppercase">{coin.symbol}</span>
                                    {coin.market_cap_rank && (
                                      <span className="text-white/40">#{coin.market_cap_rank}</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : cryptoSearch.length >= 2 && !isSearching ? (
                            <div className="p-4 text-center text-white/40 text-sm">
                              No coins found
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : category === 'stocks' ? (
                <div>
                  <label className={labelClass}>Search Stock Symbol</label>
                  {selectedStock ? (
                    // Selected stock chip
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{selectedStock.name}</div>
                        <div className="text-white/60 text-xs flex items-center gap-2">
                          <span className="uppercase">{selectedStock.symbol}</span>
                          <span className="text-white/40">{selectedStock.exchange}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStock(null);
                          setStockQuantity('');
                          setValue('');
                          setCurrentStockPriceLabel('Current Value (USD)');
                        }}
                        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.1] transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Search input with dropdown
                    <div className="relative" ref={stockDropdownRef}>
                      <input
                        type="text"
                        value={stockSearch}
                        onChange={handleStockSearchChange}
                        placeholder="Search for AAPL, TSLA, MSFT, etc..."
                        className={inputClass}
                        autoComplete="off"
                      />
                      
                      {/* Loading indicator */}
                      {isStockSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
                        </div>
                      )}

                      {/* Dropdown */}
                      {showStockDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl max-h-64 overflow-y-auto z-10">
                          {stockResults.length > 0 ? (
                            stockResults.map((stock) => (
                              <button
                                key={`${stock.symbol}-${stock.exchange}`}
                                type="button"
                                onClick={() => handleStockSelect(stock)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.06] transition-all duration-200 border-b border-white/[0.04] last:border-b-0"
                              >
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                                  <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="text-white text-sm font-medium">{stock.instrument_name}</div>
                                  <div className="text-white/60 text-xs flex items-center gap-2">
                                    <span className="uppercase">{stock.symbol}</span>
                                    <span className="text-white/40">{stock.exchange}</span>
                                    <span className="text-white/40">{stock.country}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : stockSearch.length >= 2 && !isStockSearching ? (
                            <div className="p-4 text-center text-white/40 text-sm">
                              No stocks found
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : category === 'real-estate' ? (
                <>
                  {/* Asset Name for Real Estate */}
                  <div>
                    <label className={labelClass}>Asset Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marina Vista Tower, Downtown Apartment"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Property Type Dropdown */}
                  <div>
                    <label className={labelClass}>Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Ready', 'Off-Plan'].map((type) => {
                        const isActive = propertyType === type.toLowerCase().replace('-', '-');
                        const typeKey = type === 'Ready' ? 'ready' : 'off-plan';
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPropertyType(typeKey as 'ready' | 'off-plan')}
                            className={cn(
                              'px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200',
                              propertyType === typeKey
                                ? 'border-accent/40 bg-accent/10 text-white'
                                : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white'
                            )}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchase Price and Initial Payment */}
                  {propertyType === 'off-plan' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Purchase Price</label>
                        <input
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          placeholder="0.00"
                          className={inputClass}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Initial Payment</label>
                        <input
                          type="number"
                          value={initialPayment}
                          onChange={(e) => setInitialPayment(e.target.value)}
                          placeholder="0.00"
                          className={inputClass}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Purchase Price</label>
                      <input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* ADM Tax Fee */}
                  <div>
                    <label className={labelClass}>ADM Tax Fee</label>
                    <input
                      type="number"
                      value={admTaxFee}
                      onChange={(e) => setAdmTaxFee(e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Off-Plan Specific Fields */}
                  <AnimatePresence>
                    {propertyType === 'off-plan' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {/* Remaining Payments */}
                        <div>
                          <label className={labelClass}>Remaining Payments</label>
                          <input
                            type="number"
                            value={numberOfPayments}
                            onChange={(e) => setNumberOfPayments(e.target.value)}
                            placeholder="e.g. 3, 6"
                            className={inputClass}
                            required
                            min="1"
                            max="6"
                            step="1"
                          />
                          <p className="text-xs text-white/40 mt-1">Maximum 6 payments allowed</p>
                        </div>

                        {/* Payment Schedule */}
                        {payments.length > 0 && (
                          <div>
                            <label className={labelClass}>Payment Schedule</label>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-3 text-xs text-white/60 px-1">
                                <span>% of Purchase Price</span>
                                <span>Due Date</span>
                              </div>
                              {payments.map((payment, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="grid grid-cols-2 gap-3"
                                >
                                  <div>
                                    <input
                                      type="number"
                                      value={payment.percentage}
                                      onChange={(e) => {
                                        const newPayments = [...payments];
                                        newPayments[index].percentage = e.target.value;
                                        setPayments(newPayments);
                                      }}
                                      placeholder="0.0"
                                      className={inputClass}
                                      required
                                      min="0"
                                      max="100"
                                      step="0.1"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="date"
                                      value={payment.dueDate}
                                      onChange={(e) => {
                                        const newPayments = [...payments];
                                        newPayments[index].dueDate = e.target.value;
                                        setPayments(newPayments);
                                      }}
                                      className={inputClass}
                                      required
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notes for Real Estate */}
                  <div>
                    <label className={labelClass}>Notes <span className="text-white/20">(optional)</span></label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional details about this property..."
                      className={cn(inputClass, 'resize-none h-20')}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Asset Name for other categories */}
                  <div>
                    <label className={labelClass}>Asset Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rolex Watch, Classic Car"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Symbol / Ticker for other categories */}
                  <div>
                    <label className={labelClass}>Symbol / Ticker <span className="text-white/20">(optional)</span></label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      placeholder="e.g. RLX, BMW"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Quantity (for crypto) */}
              {category === 'crypto' && selectedCoin && (
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 0.5, 10, 1000"
                    className={inputClass}
                    required
                    min="0"
                    step="any"
                  />
                </div>
              )}

              {/* Quantity (for stocks) */}
              {category === 'stocks' && selectedStock && (
                <div>
                  <label className={labelClass}>Number of Shares</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="e.g. 10, 100, 500"
                    className={inputClass}
                    required
                    min="0"
                    step="1"
                  />
                </div>
              )}

              {/* Value & Purchase Price (not for cash or real-estate categories) */}
              {category !== 'cash' && category !== 'real-estate' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      {category === 'stocks' ? currentStockPriceLabel : currentPriceLabel}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                      required={
                        !(category === 'crypto' && !!selectedCoin) &&
                        !(category === 'stocks' && !!selectedStock)
                      }
                      min="0"
                      step="0.01"
                      readOnly={
                        (category === 'crypto' && !!selectedCoin && !!selectedCoin.price) ||
                        (category === 'stocks' && !!selectedStock && !!selectedStock.price)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Purchase Price <span className="text-white/20">(opt)</span></label>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {/* Notes (not for cash or real-estate categories - they have their own notes fields) */}
              {category !== 'cash' && category !== 'real-estate' && (
                <div>
                  <label className={labelClass}>Notes <span className="text-white/20">(optional)</span></label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details..."
                    className={cn(inputClass, 'resize-none h-20')}
                  />
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Adding...' : 'Add Transaction'}
              </motion.button>
            </form>
          </motion.div>

          {/* Delete Confirmation Dialog */}
          <AnimatePresence>
            {deleteConfirmation.show && (
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-6 max-w-md mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                      <X className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Delete Bank</h3>
                    <p className="text-sm text-white/70 mb-6">
                      Delete <span className="font-medium text-white">{deleteConfirmation.bankName}</span> and all its entries? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmation({show: false, bankName: ''})}
                        className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg hover:bg-white/[0.08] transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(deleteConfirmation.bankName)}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
