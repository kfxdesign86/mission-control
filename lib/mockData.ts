// Mock data for Mission Control 2.0
// DUMMY DATA - NOT REAL

export interface HistoryPoint {
  timestamp: number;
  value: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  value: number;
  price?: number; // Unit price (optional for real estate/cash)
  qty?: number; // Quantity of asset held (e.g., 24 BTC, 100 shares)
  change24h: number;
  changePercent: number;
  allocation: number;
  category: 'crypto' | 'stocks' | 'real-estate' | 'cash' | 'cars' | 'valuables';
  history: HistoryPoint[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  project: 'Tag Markets' | 'Bit1' | 'BIX' | 'Personal';
  tags: string[];
}

export interface Reminder {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'raw' | 'researching' | 'ready' | 'active' | 'archived';
  createdAt: string;
  tags: string[];
}

// Seeded PRNG for deterministic history (avoids hydration mismatch)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate realistic-looking price history (deterministic) - optimized for 24h aesthetic charts
function generateHistory(baseValue: number, trend: 'up' | 'down' | 'flat', volatility: number = 0.02): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const now = 1707400800000; // Fixed anchor timestamp to avoid hydration mismatch
  const intervalMs = 3 * 60 * 60 * 1000; // 3-hour intervals for faster loading
  const rand = seededRandom(Math.round(baseValue));
  let value = baseValue * (1 - (trend === 'up' ? 0.05 : trend === 'down' ? -0.03 : 0));
  
  // Only 8 data points (every 3 hours over 24h) for fast aesthetic charts
  for (let i = 8; i >= 0; i--) {
    const trendFactor = trend === 'up' ? 0.006 : trend === 'down' ? -0.003 : 0; // Amplified for fewer points
    const noise = (rand() - 0.5) * volatility;
    value = value * (1 + trendFactor + noise);
    points.push({
      timestamp: now - (i * intervalMs),
      value: Math.round(value),
    });
  }
  
  return points;
}

// Generate sample assets for development/testing
export function generateSampleAssets(): Asset[] {
  return [
    {
      id: 'crypto-bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      value: 2420000, // $2.42M
      price: 97000,
      qty: 24.95,
      change24h: 48400,
      changePercent: 2.04,
      allocation: 28.5,
      category: 'crypto',
      history: generateHistory(2420000, 'up', 0.03)
    },
    {
      id: 'crypto-ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      value: 1350000, // $1.35M  
      price: 3600,
      qty: 375,
      change24h: -13500,
      changePercent: -0.99,
      allocation: 15.9,
      category: 'crypto',
      history: generateHistory(1350000, 'down', 0.04)
    },
    {
      id: 'stocks-aapl',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      value: 680000,
      price: 185.50,
      qty: 3665,
      change24h: 6800,
      changePercent: 1.01,
      allocation: 8.0,
      category: 'stocks',
      history: generateHistory(680000, 'up', 0.015)
    },
    {
      id: 'stocks-tsla',
      name: 'Tesla Inc.',
      symbol: 'TSLA',
      value: 425000,
      price: 210.25,
      qty: 2021,
      change24h: -8500,
      changePercent: -1.96,
      allocation: 5.0,
      category: 'stocks',
      history: generateHistory(425000, 'down', 0.025)
    },
    {
      id: 're-downtown-condo',
      name: 'Downtown Dubai Condo',
      symbol: 'DXB1',
      value: 1800000,
      change24h: 0,
      changePercent: 0,
      allocation: 21.2,
      category: 'real-estate',
      history: generateHistory(1800000, 'flat', 0.005)
    },
    {
      id: 're-marina-apt',
      name: 'Dubai Marina Apartment',
      symbol: 'MAR2',
      value: 950000,
      change24h: 0,
      changePercent: 0,
      allocation: 11.2,
      category: 'real-estate',
      history: generateHistory(950000, 'up', 0.003)
    },
    {
      id: 'cash-usd',
      name: 'USD Cash',
      symbol: 'USD',
      value: 485000,
      change24h: 0,
      changePercent: 0,
      allocation: 5.7,
      category: 'cash',
      history: generateHistory(485000, 'flat', 0.001)
    },
    {
      id: 'car-lambo',
      name: 'Lamborghini Huracán',
      symbol: 'LAM',
      value: 285000,
      change24h: -950,
      changePercent: -0.33,
      allocation: 3.4,
      category: 'cars',
      history: generateHistory(285000, 'down', 0.008)
    },
    {
      id: 'valuables-watch',
      name: 'Rolex Submariner',
      symbol: 'ROL',
      value: 95000,
      change24h: 480,
      changePercent: 0.51,
      allocation: 1.1,
      category: 'valuables',
      history: generateHistory(95000, 'up', 0.006)
    }
  ];
}

// Assets export - now empty array (data managed by AssetProvider)
export const assets: Asset[] = [];

// Net worth calculation - now handled by AssetProvider
export const netWorth = 0;

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Sample Task Alpha',
    description: 'This is a sample task description for demonstration purposes',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2026-02-15',
    project: 'Tag Markets',
    tags: ['sample', 'demo'],
  },
  {
    id: '2',
    title: 'Sample Task Beta',
    description: 'Another example task to show the interface',
    status: 'open',
    priority: 'medium',
    assignee: 'Jane Smith',
    dueDate: '2026-02-20',
    project: 'Tag Markets',
    tags: ['example'],
  },
  {
    id: '3',
    title: 'Demo Task Gamma',
    description: 'Demonstration task for testing',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Dev Team',
    dueDate: '2026-02-12',
    project: 'Bit1',
    tags: ['demo', 'testing'],
  },
  {
    id: '4',
    title: 'Example Task Delta',
    description: 'Example task placeholder',
    status: 'open',
    priority: 'high',
    assignee: 'Test User',
    dueDate: '2026-02-18',
    project: 'BIX',
    tags: ['placeholder'],
  },
  {
    id: '5',
    title: 'Personal Sample Task',
    description: 'Sample personal task entry',
    status: 'open',
    priority: 'medium',
    assignee: 'You',
    dueDate: '2026-02-25',
    project: 'Personal',
    tags: ['sample'],
  },
  {
    id: '6',
    title: 'Completed Demo Task',
    description: 'This task is marked as complete for demo',
    status: 'done',
    priority: 'medium',
    assignee: 'Team',
    dueDate: '2026-02-05',
    project: 'Tag Markets',
    tags: ['completed'],
  },
];

export const reminders: Reminder[] = [
  {
    id: '1',
    title: 'Sample reminder one',
    completed: false,
    dueDate: '2026-02-10',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'Example reminder two',
    completed: false,
    dueDate: '2026-02-28',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Demo reminder (completed)',
    completed: true,
    dueDate: '2026-02-07',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Placeholder reminder',
    completed: false,
    priority: 'low',
  },
  {
    id: '5',
    title: 'Test reminder entry',
    completed: false,
    dueDate: '2026-02-09',
    priority: 'medium',
  },
];

export const ideas: Idea[] = [
  {
    id: '1',
    title: 'Sample Idea Alpha',
    description: 'This is an example idea for demonstration',
    category: 'Business',
    status: 'researching',
    createdAt: '2026-01-15',
    tags: ['sample', 'demo'],
  },
  {
    id: '2',
    title: 'Demo Idea Beta',
    description: 'Another placeholder idea entry',
    category: 'Business',
    status: 'raw',
    createdAt: '2026-02-01',
    tags: ['placeholder'],
  },
  {
    id: '3',
    title: 'Example Concept Gamma',
    description: 'Example idea for UI demonstration',
    category: 'Investment',
    status: 'ready',
    createdAt: '2026-01-20',
    tags: ['example'],
  },
  {
    id: '4',
    title: 'Test Idea Delta',
    description: 'Test entry to show idea vault functionality',
    category: 'Personal',
    status: 'raw',
    createdAt: '2026-02-05',
    tags: ['test'],
  },
  {
    id: '5',
    title: 'Active Sample Project',
    description: 'Sample active idea for demo purposes',
    category: 'Business',
    status: 'active',
    createdAt: '2026-01-10',
    tags: ['active', 'sample'],
  },
];
