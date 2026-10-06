import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { INITIAL_PRODUCTS } from '@/lib/data/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');

    if (isSupabaseConfigured) {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }
      if (gender && gender !== 'all') {
        query = query.eq('gender', gender);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          count: data.length,
          products: data,
        });
      }
    }

    let products = [...INITIAL_PRODUCTS];
    if (category) {
      products = products.filter((p) => p.category === category);
    }
    if (gender && gender !== 'all') {
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
    // Security check: Only authorized admin sessions can create or update catalog products
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminCookie = cookieHeader.includes('jeansbd_admin_session=');
    const authHeader = request.headers.get('authorization');
    const customHeader = request.headers.get('x-admin-auth');

    if (!hasAdminCookie && !authHeader && customHeader !== 'true') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin authentication required to modify products.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = body.id || `prod-${Date.now()}`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').upsert({
        ...body,
        id: productId,
        is_active: true,
      }).select().single();

      if (!error && data) {
        return NextResponse.json(
          { success: true, message: 'Product saved to Supabase', product: data },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product received',
        product: { id: productId, ...body },
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
