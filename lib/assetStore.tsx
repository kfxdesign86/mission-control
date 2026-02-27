'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset } from './mockData';
import { assetsStorage } from './localStorage';

interface AssetContextType {
  assets: Asset[];
  netWorth: number;
  isLoading: boolean;
  addAsset: (asset: Omit<Asset, 'allocation'>) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, partial: Partial<Asset>) => void;
  getAssets: () => Asset[];
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load assets from localStorage first, fallback to seed data
  useEffect(() => {
    async function loadAssets() {
      try {
        setIsLoading(true);
        
        // Try to load from localStorage first
        const storedAssets = assetsStorage.get();
        
        if (storedAssets && Array.isArray(storedAssets) && storedAssets.length > 0) {
          // Use existing localStorage data
          console.log('Loading assets from localStorage:', storedAssets.length, 'assets');
          const assetsWithAllocation = storedAssets.map(asset => ({
            ...asset,
            allocation: asset.allocation || 0 // Temporary - will be recalculated
          }));
          setAssets(assetsWithAllocation);
        } else {
          // First time load - fetch seed data and save to localStorage
          console.log('No localStorage data found, loading seed data...');
          const response = await fetch('/api/seed-data');
          if (response.ok) {
            const data = await response.json();
            const seedAssets = data.assets;
            if (Array.isArray(seedAssets)) {
              console.log('Loaded seed data:', seedAssets.length, 'assets');
              const assetsWithAllocation = seedAssets.map(asset => ({
                ...asset,
                allocation: asset.allocation || 0
              }));
              setAssets(assetsWithAllocation);
              // Save to localStorage immediately
              assetsStorage.save(seedAssets);
            }
          } else {
            console.error('Failed to load seed data:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAssets();
  }, []);

  // Save assets to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isLoading && assets.length > 0) {
      const assetsToSave = assets.map(({ allocation, ...asset }) => asset);
      assetsStorage.save(assetsToSave);
    }
  }, [assets, isLoading]);

  // Calculate net worth dynamically
  const netWorth = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate allocations dynamically
  const assetsWithAllocations = assets.map(asset => ({
    ...asset,
    allocation: netWorth > 0 ? (asset.value / netWorth * 100) : 0,
  }));

  const addAsset = (asset: Omit<Asset, 'allocation'>) => {
    // Check if an asset with the same ID already exists, OR by name+category for non-crypto/non-stock assets
    let existingAssetIndex = assets.findIndex(a => a.id === asset.id);
    
    // If not found by ID, try matching by name + category (but NOT for crypto/stocks which have stable IDs)
    if (existingAssetIndex === -1 && !asset.id.startsWith('crypto-') && !asset.id.startsWith('stock-')) {
      existingAssetIndex = assets.findIndex(a => 
        a.name === asset.name && a.category === asset.category
      );
    }
    
    if (existingAssetIndex !== -1) {
      // Asset exists - update it instead of creating a new one
      const existingAsset = assets[existingAssetIndex];
      
      // For assets with quantity (crypto, stocks), add quantities and recalculate value
      if (asset.qty && asset.price) {
        // Handle case where existing asset might not have qty field yet
        const existingQty = existingAsset.qty || 0;
        const newQty = existingQty + asset.qty;
        const newValue = newQty * asset.price;
        const newChange24h = asset.changePercent ? (asset.changePercent / 100) * newValue : 0;
        
        updateAsset(existingAsset.id, {
          qty: newQty,
          value: newValue,
          change24h: newChange24h,
          price: asset.price, // Update to latest price
          changePercent: asset.changePercent, // Update to latest price change
        });
      } else {
        // For assets without quantity, just update the value
        updateAsset(existingAsset.id, {
          value: existingAsset.value + asset.value,
        });
      }
    } else {
      // Asset doesn't exist - create new one
      const newAsset: Asset = {
        ...asset,
        allocation: 0,
      };
      setAssets(prev => [...prev, newAsset]);
    }
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, partial: Partial<Asset>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...partial } : asset
    ));
  };

  const getAssets = () => assetsWithAllocations;

  return (
    <AssetContext.Provider 
      value={{
        assets: assetsWithAllocations,
        netWorth,
        isLoading,
        addAsset,
        removeAsset,
        updateAsset,
        getAssets,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
}