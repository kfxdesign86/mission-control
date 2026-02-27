import { NextRequest, NextResponse } from 'next/server';

// Proxy CoinGecko search requests through server to avoid CORS
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko search proxy error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 502 });
  }
}
