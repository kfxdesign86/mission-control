import { NextRequest, NextResponse } from 'next/server';

// Proxy CoinGecko chart requests through server to avoid CORS
export async function GET(request: NextRequest) {
  const coinId = request.nextUrl.searchParams.get('coinId');
  
  if (!coinId) {
    return NextResponse.json({ error: 'Missing coinId parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko chart proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 502 });
  }
}
