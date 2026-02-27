import { NextRequest, NextResponse } from 'next/server';
import { supabase, Transaction } from '@/lib/supabase';

// GET /api/transactions - Return all saved transactions
export async function GET() {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to read transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json(transactions || []);
  } catch (error) {
    console.error('Error reading transactions:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/transactions - Add a new transaction
export async function POST(request: NextRequest) {
  try {
    const transaction: Transaction = await request.json();
    
    // Insert the transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.error('Error inserting transaction:', error);
      return NextResponse.json(
        { error: 'Failed to save transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (error) {
    console.error('Error saving transaction:', error);
    return NextResponse.json(
      { error: 'Failed to save transaction' },
      { status: 500 }
    );
  }
}