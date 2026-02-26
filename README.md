# Mission Control 2.0

A comprehensive personal command center dashboard for tracking finances, managing tasks, organizing ideas, and monitoring personal reminders.

## Features

### 💰 Finance Dashboard
- Real-time net worth tracking (~$8M portfolio)
- Asset breakdown by category (Crypto, Stocks, Real Estate, Cash)
- Individual asset cards with mini charts and performance indicators
- Daily change tracking and percentage movements

### ✅ Task Board
- Kanban-style task management across multiple projects
- Project filtering (Tag Markets, Bit1, BIX, Personal)
- Task cards with priority, assignee, and due date information
- Detailed task view with slide-over panel

### 📝 Personal
- Quick reminder creation and management
- To-do items with completion tracking
- Priority indicators and due date management
- Today's focus section for daily planning

### 💡 Ideas Vault
- Idea capture and categorization
- Status tracking (Raw → Researching → Ready → Active → Archived)
- Category organization (Business, Investment, Personal, etc.)
- Quick search and filtering capabilities

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Design System

- **Dark theme** with #0d0d0d background
- **Orange accent** color (#f97316) for highlights
- **Inter font** for clean typography
- **Card-based layout** with subtle shadows and borders
- **Modern Web3/DeFi aesthetic**

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
mission-control/
├── app/                    # Next.js App Router pages
│   ├── finance/           # Finance dashboard
│   ├── tasks/             # Task management
│   ├── personal/          # Personal reminders
│   └── ideas/             # Ideas vault
├── components/            # Reusable React components
├── lib/                   # Utilities and mock data
├── styles/                # Global CSS and Tailwind
└── ...config files
```

## Key Components

- **Sidebar**: Navigation with active state indicators
- **Header**: Page titles with search and notifications
- **BalanceCard**: Financial summary cards
- **AssetCard**: Individual asset display with sparklines
- **TaskCard**: Task items with metadata
- **TaskColumn**: Kanban column layout
- **TaskDetail**: Slide-over task details panel
- **IdeaCard**: Idea display with status and tags
- **QuickInput**: Universal quick-add component

## Mock Data

The dashboard uses realistic mock data including:
- $8M+ total net worth across multiple asset classes
- Sample tasks for all business entities
- Personal reminders and to-do items
- Various business and investment ideas

## Development

- All components use TypeScript with proper type definitions
- Responsive design with desktop-first approach
- Smooth transitions and hover effects
- Accessible focus states and keyboard navigation

## Built for Jared Esguerra

This command center is specifically designed for managing a high-net-worth individual's financial portfolio, business operations, and personal productivity across multiple ventures including Tag Markets, Bit1, and BIX.