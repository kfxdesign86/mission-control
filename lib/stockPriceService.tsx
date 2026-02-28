'use client';

import { useEffect, useRef } from 'react';
import { useAssets } from './assetStore';

interface TwelveDataQuoteResponse {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previous_close: number;
  change: number;
  percent_change: number;
  average_volume: number;
  is_market_open: boolean;
  fifty_two_week: {
    low: number;
    high: number;
  };
}

interface TwelveDataTimeSeriesResponse {
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
  status: string;
}

interface TwelveDataSymbolSearchResponse {
  data: Array<{
    symbol: string;
    instrument_name: string;
    exchange: string;
    mic_code: string;
    exchange_timezone: string;
    instrument_type: string;
    country: string;
  }>;
  status: string;
}

// In-memory storage for chart data with cache expiration (not persisted to localStorage)
const chartDataCache: { 
  [assetId: string]: { 
    data: { timestamp: number; value: number }[], 
    lastFetched: number 
  } 
} = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

export function useStockPrices() {
  const { assets, updateAsset } = useAssets();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch optimized chart data for a stock asset - reduced data for faster loading
  const fetchChartData = async (symbol: string, quantity: number) => {
    if (!API_KEY) {
      console.error('Twelve Data API key not configured');
      return [];
    }

    try {
      // Use time_series endpoint with interval=4h to get fewer data points for faster loading
      const response = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=4h&outputsize=8&apikey=${API_KEY}`
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`Rate limit hit for ${symbol} chart data`);
          return [];
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data: TwelveDataTimeSeriesResponse = await response.json();
      
      if (data.status === 'error') {
        console.error(`Twelve Data API error for ${symbol}:`, data);
        return [];
      }

      if (!data.values || data.values.length === 0) {
        console.warn(`No chart data available for ${symbol}`);
        return [];
      }

      // Convert to HistoryPoint format with portfolio value (price * quantity)
      // Twelve Data returns most recent first, so reverse to get chronological order
      const chartData = data.values
        .reverse()
        .map((point) => ({
          timestamp: new Date(point.datetime).getTime(),
          value: Math.round(parseFloat(point.close) * quantity), // Portfolio value, not just price
        }));

      return chartData;
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return [];
    }
  };

  // Fetch current quotes for all stock assets
  const fetchPrices = async () => {
    const stockAssets = assets.filter(asset => 
      asset.category === 'stocks' && 
      asset.id.startsWith('stock-')
    );

    if (stockAssets.length === 0) return;

    // Extract symbols from asset IDs (format: stock-{symbol})
    const symbols = stockAssets
      .map(asset => asset.id.replace('stock-', '').toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0 || !API_KEY) return;

    try {
      // Twelve Data supports batch quotes by comma-separating symbols
      const symbolsString = symbols.join(',');
      const response = await fetch(
        `https://api.twelvedata.com/quote?symbol=${symbolsString}&apikey=${API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limit hit for stock price updates');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Check for API error response
      if ((data as any).status === 'error' || (data as any).code === 'error') {
        console.error('Twelve Data batch quote error:', data);
        return;
      }

      // Handle single vs multiple symbol responses
      const quotes = symbols.length === 1 ? [data] : Object.values(data || {});

      // Update each stock asset with new price data
      for (const asset of stockAssets) {
        const symbol = asset.id.replace('stock-', '').toUpperCase();
        const quote = Array.isArray(quotes) 
          ? quotes.find((q: any) => q && q.symbol === symbol)
          : quotes;

        if (quote && 
            quote.close !== undefined && 
            quote.close !== null && 
            typeof quote.close === 'number' && 
            !(quote as any).status && 
            !(quote as any).code) {
          // Calculate quantity from current value and price if not stored
          const currentPrice = parseFloat(quote.close);
          const quantity = asset.qty || (asset.price ? asset.value / asset.price : 1);
          const newValue = Math.round(quantity * currentPrice);
          const change24h = quote.change ? parseFloat(quote.change) * quantity : 0;
          const changePercent = quote.percent_change ? parseFloat(quote.percent_change) : 0;

          updateAsset(asset.id, {
            value: newValue,
            price: currentPrice,
            qty: quantity,
            change24h: Math.round(change24h),
            changePercent,
          });

          // Fetch and cache chart data for this asset (with expiration check)
          const cached = chartDataCache[asset.id];
          const now = Date.now();
          if (!cached || now - cached.lastFetched > CACHE_DURATION) {
            const chartData = await fetchChartData(symbol, quantity);
            chartDataCache[asset.id] = {
              data: chartData,
              lastFetched: now
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    }
  };

  // Search for stock symbols
  const searchStocks = async (query: string): Promise<TwelveDataSymbolSearchResponse['data']> => {
    if (!API_KEY || query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Rate limit hit for stock symbol search');
          return [];
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data: TwelveDataSymbolSearchResponse = await response.json();
      
      // Check for API error responses
      if ((data as any).status === 'error') {
        console.error('Twelve Data symbol search error:', data);
        return [];
      }

      // Defensive check: ensure data.data exists before filtering
      if (!data.data || !Array.isArray(data.data)) {
        console.warn('Twelve Data returned invalid data structure:', data);
        return [];
      }

      // Filter for common stock exchanges and limit results
      const filteredResults = data.data
        .filter(item => 
          item.instrument_type === 'Common Stock' ||
          item.instrument_type === 'ETF' ||
          item.instrument_type === 'Stock'
        )
        .slice(0, 8);

      return filteredResults;
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  };

  // Get current quote for a specific stock symbol
  const fetchStockQuote = async (symbol: string): Promise<TwelveDataQuoteResponse | null> => {
    if (!API_KEY) {
      console.error('Twelve Data API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`Rate limit hit for ${symbol} quote`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Check for various error response shapes
      if ((data as any).status === 'error' || 
          (data as any).code === 'error' || 
          data.error || 
          data.message?.toLowerCase().includes('error') ||
          !data.symbol ||
          data.close === undefined ||
          data.close === null) {
        console.error(`Twelve Data quote error for ${symbol}:`, data);
        return null;
      }

      // Verify this looks like a valid quote response
      if (typeof data.close !== 'number' || !data.symbol) {
        console.error(`Invalid quote data structure for ${symbol}:`, data);
        return null;
      }

      return data as TwelveDataQuoteResponse;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  };

  // Get chart data for an asset (from cache with expiration check)
  const getChartData = (assetId: string) => {
    const cached = chartDataCache[assetId];
    if (!cached) return [];
    
    const now = Date.now();
    if (now - cached.lastFetched > CACHE_DURATION) {
      // Cache expired, return empty to trigger refetch
      return [];
    }
    
    return cached.data;
  };

  // Start price polling - conservative frequency to respect API limits
  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up interval for every 60 seconds (respecting 8 calls/minute limit)
    intervalRef.current = setInterval(fetchPrices, 60000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [assets.length]); // Re-run when asset count changes

  // Fetch chart data for new stock assets
  useEffect(() => {
    const fetchChartDataForNewAssets = async () => {
      const now = Date.now();
      const stockAssets = assets.filter(asset => 
        asset.category === 'stocks' && 
        asset.id.startsWith('stock-') &&
        (!chartDataCache[asset.id] || now - chartDataCache[asset.id].lastFetched > CACHE_DURATION)
      );

      for (const asset of stockAssets) {
        const symbol = asset.id.replace('stock-', '').toUpperCase();
        const quantity = asset.qty || (asset.price ? asset.value / asset.price : 1);
        const chartData = await fetchChartData(symbol, quantity);
        chartDataCache[asset.id] = {
          data: chartData,
          lastFetched: now
        };
      }
    };

    fetchChartDataForNewAssets();
  }, [assets]);

  return {
    getChartData,
    fetchChartData,
    searchStocks,
    fetchStockQuote,
  };
}