import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/banks - Return all saved banks
export async function GET() {
  try {
    const { data: banks, error } = await supabase
      .from('banks')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to read banks' },
        { status: 500 }
      );
    }

    // Return just the names as an array (to match existing API)
    const bankNames = banks?.map(bank => bank.name) || [];
    return NextResponse.json(bankNames);
  } catch (error) {
    console.error('Error reading banks:', error);
    return NextResponse.json(
      { error: 'Failed to read banks' },
      { status: 500 }
    );
  }
}

// POST /api/banks - Add a new bank or save the full banks array
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both single bank addition and full array update
    if (typeof body === 'string') {
      // Adding a single bank
      const bankName = body.trim();
      
      // Check if bank already exists
      const { data: existing, error: checkError } = await supabase
        .from('banks')
        .select('name')
        .eq('name', bankName)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing bank:', checkError);
        return NextResponse.json(
          { error: 'Failed to check existing bank' },
          { status: 500 }
        );
      }

      if (!existing) {
        // Insert new bank
        const { error: insertError } = await supabase
          .from('banks')
          .insert({ name: bankName });

        if (insertError) {
          console.error('Error inserting bank:', insertError);
          return NextResponse.json(
            { error: 'Failed to add bank' },
            { status: 500 }
          );
        }
      }

      // Return updated list
      const { data: banks } = await supabase
        .from('banks')
        .select('name')
        .order('name', { ascending: true });
      
      const bankNames = banks?.map(bank => bank.name) || [];
      return NextResponse.json({ success: true, banks: bankNames });
      
    } else if (Array.isArray(body)) {
      // Saving full array - replace all banks
      const bankNames = body.filter(bank => typeof bank === 'string' && bank.trim().length > 0);
      
      // Delete all existing banks
      const { error: deleteError } = await supabase
        .from('banks')
        .delete()
        .neq('id', 0); // Delete all records

      if (deleteError) {
        console.error('Error deleting banks:', deleteError);
        return NextResponse.json(
          { error: 'Failed to clear existing banks' },
          { status: 500 }
        );
      }

      // Insert new banks
      if (bankNames.length > 0) {
        const banksToInsert = bankNames.map(name => ({ name }));
        const { error: insertError } = await supabase
          .from('banks')
          .insert(banksToInsert);

        if (insertError) {
          console.error('Error inserting banks:', insertError);
          return NextResponse.json(
            { error: 'Failed to save banks' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true, count: bankNames.length });
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error saving banks:', error);
    return NextResponse.json(
      { error: 'Failed to save banks' },
      { status: 500 }
    );
  }
}

// DELETE /api/banks - Delete a bank by name
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bankName = searchParams.get('name');
    
    if (!bankName) {
      return NextResponse.json(
        { error: 'Bank name is required' },
        { status: 400 }
      );
    }
    
    // Delete the bank
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('name', bankName);

    if (error) {
      console.error('Error deleting bank:', error);
      return NextResponse.json(
        { error: 'Failed to delete bank' },
        { status: 500 }
      );
    }

    // Return updated list
    const { data: banks } = await supabase
      .from('banks')
      .select('name')
      .order('name', { ascending: true });
    
    const bankNames = banks?.map(bank => bank.name) || [];
    
    return NextResponse.json({ 
      success: true, 
      banks: bankNames,
      deleted: bankName 
    });
  } catch (error) {
    console.error('Error deleting bank:', error);
    return NextResponse.json(
      { error: 'Failed to delete bank' },
      { status: 500 }
    );
  }
}