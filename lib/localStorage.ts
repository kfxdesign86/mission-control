/**
 * Local Storage utilities for client-side data persistence
 * Used to replace server-side filesystem operations on Vercel
 */

const STORAGE_KEYS = {
  ASSETS: 'mission-control-assets',
  BANKS: 'mission-control-banks', 
  TRANSACTIONS: 'mission-control-transactions',
} as const;

export function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

export function saveToStorage<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
}

// Specific storage functions
export const assetsStorage = {
  get: () => getFromStorage<any[]>(STORAGE_KEYS.ASSETS),
  save: (assets: any[]) => saveToStorage(STORAGE_KEYS.ASSETS, assets),
  clear: () => removeFromStorage(STORAGE_KEYS.ASSETS),
};

export const banksStorage = {
  get: () => getFromStorage<string[]>(STORAGE_KEYS.BANKS),
  save: (banks: string[]) => saveToStorage(STORAGE_KEYS.BANKS, banks),
  clear: () => removeFromStorage(STORAGE_KEYS.BANKS),
};

export const transactionsStorage = {
  get: () => getFromStorage<any[]>(STORAGE_KEYS.TRANSACTIONS),
  save: (transactions: any[]) => saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions),
  clear: () => removeFromStorage(STORAGE_KEYS.TRANSACTIONS),
};