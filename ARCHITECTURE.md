# Mission Control 2.0 - Architecture Documentation

## Overview

Mission Control 2.0 is a sophisticated personal command center dashboard built for managing high-net-worth financial portfolios, business operations across multiple ventures (Tag Markets, Bit1, BIX), and personal productivity. The application features a dark, Web3-inspired aesthetic with orange accent colors and premium UI components.

## Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and enhanced developer experience
- **React 18** - Component library with concurrent features

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **Lucide React** - Clean, modern icon library
- **Inter Font** - Primary typography (Google Fonts)
- **JetBrains Mono** - Monospace font for financial data

### Data & Charts
- **Recharts** - Chart library for financial visualizations
- **date-fns** - Date manipulation utilities
- **class-variance-authority** - Component variant management
- **clsx** + **tailwind-merge** - Conditional class utilities

### Backend (Optional API)
- **Express.js** - API server
- **better-sqlite3** - Embedded database
- **CORS** - Cross-origin resource sharing

## Project Structure

```
mission-control/
├── app/                        # Next.js App Router (main pages)
│   ├── layout.tsx             # Root layout with sidebar + providers
│   ├── page.tsx               # Home page (redirects to /finance)
│   ├── finance/               
│   │   └── page.tsx           # Finance Dashboard - Net worth tracking
│   ├── tasks/                 
│   │   └── page.tsx           # Task Board - Kanban-style management
│   ├── personal/              
│   │   └── page.tsx           # Personal reminders and todos
│   ├── ideas/                 
│   │   └── page.tsx           # Ideas Vault - Idea capture system
│   ├── off-plan/              
│   │   └── page.tsx           # Real estate off-plan tracking
│   └── notifications/         
│       └── page.tsx           # Notifications center
├── components/                 # Reusable React components
│   ├── ui/                    # Base UI components (buttons, cards, etc.)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── index.ts           # Barrel exports
│   ├── AddTransactionModal.tsx
│   ├── AssetCard.tsx          # Individual asset display
│   ├── BalanceCard.tsx        # Financial summary cards  
│   ├── Header.tsx             # Page headers with titles/actions
│   ├── IdeaCard.tsx           # Idea display with status
│   ├── Providers.tsx          # React context providers
│   ├── QuickInput.tsx         # Universal quick-add component
│   ├── Sidebar.tsx            # Main navigation sidebar
│   ├── Sparkline.tsx          # Mini chart component
│   ├── TaskCard.tsx           # Task items with metadata
│   ├── TaskColumn.tsx         # Kanban column layout
│   └── TaskDetail.tsx         # Task slide-over panel
├── lib/                        # Utilities and data management
│   ├── assetStore.tsx         # Asset state management
│   ├── cryptoPriceService.tsx # Crypto price data service
│   ├── mockData.ts            # Realistic mock data
│   └── utils.ts               # Utility functions
├── styles/                     # Global styling
│   └── globals.css            # Tailwind imports + custom CSS
├── server/                     # Optional Express API
│   ├── index.js               # API server
│   ├── db.js                  # SQLite database setup
│   └── seed.js                # Database seeding
├── client/                     # Alternative React client (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── public/                     # Static assets
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Component Organization

### Naming Conventions
- **PascalCase** for all component files and exports
- **camelCase** for utility functions and variables
- **kebab-case** for CSS class names
- **UPPER_SNAKE_CASE** for constants

### Component Categories

#### 1. Layout Components (`app/`)
- `layout.tsx` - Root layout with sidebar and providers
- Page components (`page.tsx`) - Route-specific views
- Use `'use client'` directive for interactivity

#### 2. UI Components (`components/ui/`)
- Base components following shadcn/ui patterns
- Styled with Tailwind CSS and class-variance-authority
- Exported via barrel pattern in `index.ts`

#### 3. Feature Components (`components/`)
- Domain-specific components (finance, tasks, etc.)
- Self-contained with internal state management
- Accept props for customization and event handling

### Component Patterns

#### 1. Server/Client Component Pattern
```typescript
// Server components (default)
export default function ServerComponent() {
  // No interactivity, data fetching
}

// Client components 
'use client';
export default function ClientComponent() {
  // Hooks, event handlers, state
}
```

#### 2. Conditional Styling Pattern
```typescript
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';

// Using clsx for complex conditions
className={clsx(
  'base-styles',
  isActive && 'active-styles',
  isDisabled ? 'disabled-styles' : 'enabled-styles'
)}

// Using cn utility (tailwind-merge + clsx)
className={cn(
  'base bg-card',
  props.className, // Allows override
  variant === 'primary' && 'bg-accent'
)}
```

## State Management

### Local State (`useState`)
- Component-specific state (modals, form inputs, UI state)
- Temporary state that doesn't need persistence

### Custom Stores (`lib/assetStore.tsx`)
- Asset portfolio data and calculations
- Net worth tracking and category breakdowns
- Real-time price updates integration

### Data Services (`lib/cryptoPriceService.tsx`)
- External API integration
- Chart data generation
- Price history simulation

## Key Patterns

### 1. Animation Patterns (Framer Motion)
```typescript
// Page entrance animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>

// Staggered list animations
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  >
))}

// Hover interactions
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### 2. Conditional Rendering Patterns
```typescript
// Loading states
{isLoading ? <LoadingSpinner /> : <ActualContent />}

// Empty states with fallbacks
{items.length > 0 ? (
  <ItemsList items={items} />
) : (
  <EmptyState onAction={handleAddItem} />
)}

// Feature flags
{netWorth === 0 ? <EmptyPortfolio /> : <PortfolioDashboard />}
```

### 3. Data Flow Pattern
```typescript
// Parent component manages state
const [selectedTask, setSelectedTask] = useState<Task | null>(null);

// Child components receive handlers
<TaskCard 
  task={task} 
  onClick={() => setSelectedTask(task)} 
/>

// Detail components receive selected data
<TaskDetail 
  task={selectedTask}
  isOpen={!!selectedTask}
  onClose={() => setSelectedTask(null)}
/>
```

## Design System

### Colors (Tailwind Config)
```typescript
colors: {
  background: '#0a0a0a',           // Main dark background
  'background-secondary': '#0d0d0d', // Slightly lighter
  card: 'rgba(26, 26, 26, 0.8)',  // Glass card background
  accent: '#f97316',               // Orange primary accent
  border: 'rgba(255, 255, 255, 0.06)', // Subtle borders
  muted: '#737373',                // Text muted state
  success: '#22c55e',              // Success green
  danger: '#ef4444',               // Error red
}
```

### Typography Hierarchy
- **Display** - Large hero numbers (`text-display`)
- **Headings** - Section titles (`text-xl font-bold`)
- **Body** - Regular content (`text-sm`)
- **Captions** - Meta information (`text-xs text-muted`)
- **Numbers** - Financial data (`font-numbers`)

### Component Variants
- **Cards** - `card`, `card-glow`, `glass`, `glass-heavy`
- **Buttons** - `btn-primary`, `btn-secondary`
- **States** - `nav-item-active`, `pill-{category}`

### Animation Classes
- **Entrances** - `page-enter`, `fade-in-up`
- **Effects** - `pulse-glow`, `gradient-shift`, `shimmer`
- **Indicators** - `pulse-live` (for real-time data)

## Main Modules

### 1. Finance Dashboard (`/finance`)
**Purpose**: Real-time net worth tracking and portfolio management

**Features**:
- Hero section with total net worth (~$8M)
- Category breakdown (Crypto, Stocks, Real Estate, Cash, Cars, Valuables)
- Individual asset cards with mini-charts and performance data
- Add transaction modal for portfolio updates
- Real-time price integration for crypto assets

**Key Components**:
- `BalanceCard` - Financial summary displays
- `AssetCard` - Individual asset with sparkline charts
- `AddTransactionModal` - Transaction input form
- `Sparkline` - Mini chart visualization

### 2. Task Board (`/tasks`)
**Purpose**: Kanban-style task management across business entities

**Features**:
- Project filtering (All, Tag Markets, Bit1, BIX, Personal)
- Three-column board (Open, In Progress, Done)
- Task detail slide-over panel
- Priority indicators and assignee management
- Summary statistics

**Key Components**:
- `TaskColumn` - Kanban columns
- `TaskCard` - Individual task items
- `TaskDetail` - Slide-over task details

### 3. Personal (`/personal`)
**Purpose**: Personal productivity and reminder management

**Features**:
- Quick reminder creation
- Priority-based task organization
- Due date tracking
- Daily focus section

### 4. Ideas Vault (`/ideas`)
**Purpose**: Idea capture and development pipeline

**Features**:
- Status-based organization (Raw → Researching → Ready → Active → Archived)
- Category filtering (Business, Investment, Personal, etc.)
- Quick capture interface
- Statistics dashboard

**Key Components**:
- `IdeaCard` - Idea display with status badges
- `QuickInput` - Universal quick-add component

### 5. Off-Plan (`/off-plan`)
**Purpose**: Real estate investment tracking

### 6. Notifications (`/notifications`)
**Purpose**: System notifications and alerts

## API Routes & Data Storage

### Database Schema (SQLite)
```sql
-- Boards table for task organization
CREATE TABLE boards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks with full metadata
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  board_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee TEXT DEFAULT '',
  priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
  due_date TEXT,
  status TEXT CHECK(status IN ('backlog', 'in-progress', 'review', 'done')),
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints (Express Server)
```javascript
GET    /api/boards           // List all boards
GET    /api/boards/:id/tasks // Get board tasks
POST   /api/tasks            // Create task
PUT    /api/tasks/:id        // Update task
DELETE /api/tasks/:id        // Delete task
PUT    /api/tasks/reorder    // Batch reorder for drag-drop
```

### Data Patterns
- **Mock Data** - Realistic portfolio data in `lib/mockData.ts`
- **State Management** - Custom hooks for asset store
- **Real-time Updates** - Crypto price simulation
- **Local Storage** - Browser persistence for user preferences

## How to Run

### Development Mode
```bash
npm run dev -- --hostname 0.0.0.0
```
This starts Next.js on port 3000 with network access enabled.

### Backend API (Optional)
```bash
cd server
node index.js
```
Starts Express server on port 3001 for task management API.

### Alternative Client (Vite)
```bash
cd client
npm run dev
```
Alternative React client built with Vite (development purposes).

## Key Features

### Premium UI/UX
- **Glass morphism** effects with backdrop blur
- **Smooth animations** via Framer Motion
- **Hover effects** with scale and glow
- **Responsive design** (desktop-first)
- **Dark theme** optimized for extended use

### Financial Focus
- **Real-time tracking** of $8M+ portfolio
- **Category-based** asset organization
- **Performance metrics** with sparkline charts
- **Transaction logging** with modal forms
- **Net worth calculations** across asset classes

### Productivity Suite
- **Multi-project** task management
- **Kanban board** interface
- **Idea development** pipeline
- **Personal reminders** system

### Developer Experience
- **TypeScript** for type safety
- **ESLint** for code quality
- **Responsive** mobile-friendly design
- **Component-driven** architecture
- **Hot reload** development environment

This architecture documentation serves as the definitive guide for understanding and extending the Mission Control 2.0 codebase. All future sub-agents should reference this document before making any code changes or additions.