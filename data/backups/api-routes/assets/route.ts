import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'assets.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read assets from file
async function readAssets() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty array if file doesn't exist or is invalid
    return [];
  }
}

// Write assets to file
async function writeAssets(assets: any[]) {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(assets, null, 2));
}

// GET /api/assets - Return all saved assets
export async function GET() {
  try {
    const assets = await readAssets();
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error reading assets:', error);
    return NextResponse.json(
      { error: 'Failed to read assets' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Save the full assets array
export async function POST(request: NextRequest) {
  try {
    const assets = await request.json();
    
    // Validate that assets is an array
    if (!Array.isArray(assets)) {
      return NextResponse.json(
        { error: 'Assets must be an array' },
        { status: 400 }
      );
    }

    await writeAssets(assets);
    return NextResponse.json({ success: true, count: assets.length });
  } catch (error) {
    console.error('Error saving assets:', error);
    return NextResponse.json(
      { error: 'Failed to save assets' },
      { status: 500 }
    );
  }
}