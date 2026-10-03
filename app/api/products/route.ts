import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/lib/data/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');

    let products = [...INITIAL_PRODUCTS];

    if (category) {
      products = products.filter((p) => p.category === category);
    }
    if (gender) {
      products = products.filter((p) => p.gender === gender || p.gender === 'unisex');
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        success: true,
        message: 'Product received',
        product: { id: `prod-${Date.now()}`, ...body },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid product payload' },
      { status: 400 }
    );
  }
}
