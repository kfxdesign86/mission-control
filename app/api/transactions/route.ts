import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'transactions.json');

async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try { await fs.access(dataDir); } catch { await fs.mkdir(dataDir, { recursive: true }); }
}

async function readTransactions() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await ensureDataDirectory();
      await fs.writeFile(DATA_FILE_PATH, '[]');
    }
    return [];
  }
}

export async function GET() {
  try {
    const transactions = await readTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Append single transaction
    const transactions = await readTransactions();
    transactions.push(body);
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(transactions, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
