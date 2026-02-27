'use client';

import { useEffect, useRef } from 'react';
import { useAssets } from './assetStore';

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface CoinGeckoChartResponse {
  prices: [number, number][]; // [timestamp, price]
}

// In-memory storage for chart data with cache expiration (not persisted to localStorage)
const chartDataCache: { 
  [assetId: string]: { 
    data: { timestamp: number; value: number }[], 
    lastFetched: number 
  } 
} = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function useCryptoPrices() {
  const { assets, updateAsset } = useAssets();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch optimized chart data for a crypto asset - reduced data for faster loading
  const fetchChartData = async (coinId: string, quantity: number) => {
    try {
      // Use interval=hourly to get fewer data points for faster loading
      const response = await fetch(
        `/api/crypto/chart?coinId=${coinId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: CoinGeckoChartResponse = await response.json();
      
      // Take only every 3rd data point for aesthetic charts (reduce from ~24 to ~8 points)
      const reducedPrices = data.prices.filter((_, index) => index % 3 === 0);
      
      // Convert to HistoryPoint format with portfolio value (price * quantity)
      const chartData = reducedPrices.map(([timestamp, price]) => ({
        timestamp,
        value: Math.round(price * quantity), // Portfolio value, not just price
      }));

      return chartData;
    } catch (error) {
      console.error(`Error fetching chart data for ${coinId}:`, error);
      return [];
    }
  };

  // Fetch current prices for all crypto assets
  const fetchPrices = async () => {
    const cryptoAssets = assets.filter(asset => 
      asset.category === 'crypto' && 
      asset.id.startsWith('crypto-')
    );

    if (cryptoAssets.length === 0) return;

    // Extract coin IDs from asset IDs (format: crypto-{coinId})
    const coinIds = cryptoAssets
      .map(asset => asset.id.replace('crypto-', ''))
      .filter(Boolean);

    if (coinIds.length === 0) return;

    try {
      const response = await fetch(
        `/api/crypto/price?ids=${coinIds.join(',')}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: CoinGeckoPriceResponse = await response.json();

      // Update each crypto asset with new price data
      for (const asset of cryptoAssets) {
        const coinId = asset.id.replace('crypto-', '');
        const priceData = data[coinId];

        if (priceData) {
          // Use stored quantity directly instead of calculating from value/price
          const currentPrice = priceData.usd;
          const quantity = asset.qty || 1; // Use actual quantity field
          const newValue = Math.round(quantity * currentPrice);
          const change24h = Math.round((priceData.usd_24h_change / 100) * newValue);

          updateAsset(asset.id, {
            value: newValue,
            price: currentPrice,
            change24h,
            changePercent: priceData.usd_24h_change || 0,
          });

          // Fetch and cache chart data for this asset (with expiration check)
          const cached = chartDataCache[asset.id];
          const now = Date.now();
          if (!cached || now - cached.lastFetched > CACHE_DURATION) {
            const chartData = await fetchChartData(coinId, quantity);
            chartDataCache[asset.id] = {
              data: chartData,
              lastFetched: now
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
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

  // Start price polling - reduced frequency for better performance
  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up interval for every 5 minutes (300 seconds) for better performance
    intervalRef.current = setInterval(fetchPrices, 300000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [assets.length]); // Re-run when asset count changes

  // Fetch chart data for new crypto assets
  useEffect(() => {
    const fetchChartDataForNewAssets = async () => {
      const now = Date.now();
      const cryptoAssets = assets.filter(asset => 
        asset.category === 'crypto' && 
        asset.id.startsWith('crypto-') &&
        (!chartDataCache[asset.id] || now - chartDataCache[asset.id].lastFetched > CACHE_DURATION)
      );

      for (const asset of cryptoAssets) {
        const coinId = asset.id.replace('crypto-', '');
        const quantity = asset.qty || 1; // Use actual quantity field
        const chartData = await fetchChartData(coinId, quantity);
        chartDataCache[asset.id] = {
          data: chartData,
          lastFetched: now
        };
      }
    };

    // Only run when the number of crypto assets changes, not on every asset update
    const cryptoCount = assets.filter(asset => 
      asset.category === 'crypto' && asset.id.startsWith('crypto-')
    ).length;
    
    if (cryptoCount > 0) {
      fetchChartDataForNewAssets();
    }
  }, [assets.length]); // Changed from [assets] to [assets.length] to prevent loops

  return {
    getChartData,
    fetchChartData,
  };
}