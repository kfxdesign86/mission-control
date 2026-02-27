import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Serves initial seed data from the bundled JSON files
 * Only used to load initial data when localStorage is empty
 */

async function readSeedFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Could not read seed file ${filename}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Return all seed data at once to avoid dynamic rendering issues
    const assets = await readSeedFile('assets.json');
    const banks = await readSeedFile('banks.json');
    const transactions = await readSeedFile('transactions.json');
    
    return NextResponse.json({
      assets,
      banks, 
      transactions,
    });
  } catch (error) {
    console.error('Error serving seed data:', error);
    return NextResponse.json(
      { error: 'Failed to load seed data' },
      { status: 500 }
    );
  }
}