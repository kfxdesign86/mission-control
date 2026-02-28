import { NextRequest, NextResponse } from 'next/server';

// Proxy Twelve Data symbol search requests through server to avoid CORS
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY || process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Twelve Data API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!response.ok) {
      throw new Error(`Twelve Data returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Twelve Data search proxy error:', error);
    return NextResponse.json({ error: 'Failed to search symbols' }, { status: 502 });
  }
}