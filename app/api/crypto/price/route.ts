import { NextRequest, NextResponse } from 'next/server';

// Proxy CoinGecko price requests through server to avoid CORS
export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids');
  
  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CoinGecko price proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 502 });
  }
}
