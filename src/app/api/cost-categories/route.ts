import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const costCategories = await db.costCategory.findMany({
      where: {
        ...(active !== null ? { isActive: active === 'true' } : {}),
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ costCategories });
  } catch (error: any) {
    console.error('Get cost categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost categories' },
      { status: 500 }
    );
  }
}
