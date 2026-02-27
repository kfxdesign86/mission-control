import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'banks.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read banks from file
async function readBanks() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    // Only create file if it truly doesn't exist
    if (error.code === 'ENOENT') {
      await ensureDataDirectory();
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2));
    }
    return [];
  }
}

// Write banks to file
async function writeBanks(banks: string[]) {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(banks, null, 2));
}

// GET /api/banks - Return all saved banks
export async function GET() {
  try {
    const banks = await readBanks();
    return NextResponse.json(banks);
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
      const banks = await readBanks();
      if (!banks.includes(body)) {
        banks.push(body);
        await writeBanks(banks);
      }
      return NextResponse.json({ success: true, banks });
    } else if (Array.isArray(body)) {
      // Saving full array
      const banks = body.filter(bank => typeof bank === 'string' && bank.trim().length > 0);
      await writeBanks(banks);
      return NextResponse.json({ success: true, count: banks.length });
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
    
    const banks = await readBanks();
    const updatedBanks = banks.filter((bank: string) => bank !== bankName);
    await writeBanks(updatedBanks);
    
    return NextResponse.json({ 
      success: true, 
      banks: updatedBanks,
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