import { NextRequest, NextResponse } from 'next/server';
import { supabase, Asset } from '@/lib/supabase';

// GET /api/assets - Return all saved assets
export async function GET() {
  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to read assets' },
        { status: 500 }
      );
    }

    return NextResponse.json(assets || []);
  } catch (error) {
    console.error('Error reading assets:', error);
    return NextResponse.json(
      { error: 'Failed to read assets' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Save the full assets array (replace all)
export async function POST(request: NextRequest) {
  try {
    const assets: Asset[] = await request.json();
    
    // Validate that assets is an array
    if (!Array.isArray(assets)) {
      return NextResponse.json(
        { error: 'Assets must be an array' },
        { status: 400 }
      );
    }

    // Delete all existing assets first
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .neq('id', ''); // Delete all records

    if (deleteError) {
      console.error('Error deleting existing assets:', deleteError);
      return NextResponse.json(
        { error: 'Failed to clear existing assets' },
        { status: 500 }
      );
    }

    // Insert new assets
    if (assets.length > 0) {
      const { error: insertError } = await supabase
        .from('assets')
        .insert(assets);

      if (insertError) {
        console.error('Error inserting assets:', insertError);
        return NextResponse.json(
          { error: 'Failed to save assets' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, count: assets.length });
  } catch (error) {
    console.error('Error saving assets:', error);
    return NextResponse.json(
      { error: 'Failed to save assets' },
      { status: 500 }
    );
  }
}