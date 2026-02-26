'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Asset } from './mockData';

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
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load assets from API on mount
  useEffect(() => {
    async function loadAssets() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/assets');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            // Ensure allocation property exists but will be recalculated dynamically
            const assetsWithAllocation = data.map(asset => ({
              ...asset,
              allocation: asset.allocation || 0 // Temporary - will be recalculated
            }));
            setAssets(assetsWithAllocation);
          }
        } else {
          console.error('Failed to load assets:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading assets from API:', error);
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    }

    loadAssets();
  }, []);

  // Track what we loaded from API so we only save actual user changes
  const loadedAssetsRef = useRef<string>('');
  const userHasModified = useRef(false);

  // After load completes, snapshot what came from the server
  useEffect(() => {
    if (hasLoaded && !isLoading) {
      loadedAssetsRef.current = JSON.stringify(assets.map(({ allocation, ...a }) => a));
    }
  }, [hasLoaded]); // Only run once after first load

  // Save assets to API only when user explicitly modifies (add/remove/update)
  useEffect(() => {
    if (!hasLoaded || isLoading || !userHasModified.current) return;
    
    const assetsToSave = assets.map(({ allocation, ...asset }) => asset);
    const currentJson = JSON.stringify(assetsToSave);
    
    // Don't save if nothing actually changed from what we loaded
    if (currentJson === loadedAssetsRef.current) return;
    
    (async () => {
      try {
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: currentJson,
        });
        if (response.ok) {
          loadedAssetsRef.current = currentJson; // Update snapshot
        } else {
          console.error('Failed to save assets:', response.statusText);
        }
      } catch (error) {
        console.error('Error saving assets to API:', error);
      }
    })();
  }, [assets, isLoading, hasLoaded]);

  // Calculate net worth dynamically
  const netWorth = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate allocations dynamically
  const assetsWithAllocations = assets.map(asset => ({
    ...asset,
    allocation: netWorth > 0 ? (asset.value / netWorth * 100) : 0,
  }));

  const addAsset = (asset: Omit<Asset, 'allocation'>) => {
    userHasModified.current = true;
    const newAsset: Asset = {
      ...asset,
      allocation: 0,
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const removeAsset = (id: string) => {
    userHasModified.current = true;
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, partial: Partial<Asset>) => {
    userHasModified.current = true;
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