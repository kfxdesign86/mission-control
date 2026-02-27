import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDatabase } from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureDbInitialized();
    
    const transactions = await sql`
      SELECT 
        id, type, category, source_bank, recipient_bank, 
        value, notes, created_at
      FROM transactions 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const transaction = await request.json();
    
    if (!transaction.id || !transaction.type || !transaction.category) {
      return NextResponse.json(
        { error: 'Missing required fields: id, type, category' },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO transactions (
        id, type, category, source_bank, recipient_bank, 
        value, notes, created_at
      ) VALUES (
        ${transaction.id}, ${transaction.type}, ${transaction.category},
        ${transaction.sourceBank || null}, ${transaction.recipientBank || null},
        ${transaction.value}, ${transaction.notes || null}, 
        ${transaction.createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        source_bank = EXCLUDED.source_bank,
        recipient_bank = EXCLUDED.recipient_bank,
        value = EXCLUDED.value,
        notes = EXCLUDED.notes
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving transaction:', error);
    return NextResponse.json(
      { error: 'Failed to save transaction' },
      { status: 500 }
    );
  }
}