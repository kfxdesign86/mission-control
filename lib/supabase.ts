import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Allow graceful handling during build time when env vars may be placeholders
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://')
const hasValidKey = supabaseServiceRoleKey && supabaseServiceRoleKey !== 'your_supabase_service_role_key_here'

if (!isValidUrl || !hasValidKey) {
  console.warn('Supabase environment variables not properly configured. Using dummy client for build.')
}

// Create a single supabase client for interacting with your database
export const supabase = isValidUrl && hasValidKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : createClient('https://dummy.supabase.co', 'dummy-key')

// Database types
export interface Asset {
  id: string
  name: string
  symbol: string
  value: number
  price?: number
  qty?: number
  change24h: number
  changePercent: number
  category: string
  history: Array<{ timestamp: number; value: number }>
  createdAt: string
  // Crypto fields
  // Cash fields
  bankName?: string
  accountType?: string
  notes?: string
  // Real Estate fields
  propertyType?: string
  purchasePrice?: number
  admTaxFee?: number
  payments?: Array<{ percentage: number; dueDate: string }>
}

export interface Transaction {
  id: string
  type: string
  category: string
  sourceBank?: string
  recipientBank?: string
  value: number
  notes: string
  createdAt: string
}

export interface Bank {
  id: number
  name: string
  createdAt: string
}