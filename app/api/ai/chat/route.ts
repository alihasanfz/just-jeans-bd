import { NextRequest, NextResponse } from 'next/server';
import { ChatSupportService } from '@/lib/services/ai/chatSupportService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [], products = [], orders = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 400 });
    }

    let activeProducts = products;
    let activeOrders = orders;

    // If client didn't supply products or orders, fetch directly from Supabase
    if (!activeProducts || activeProducts.length === 0) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmrtzobqtbrbcqpbvipo.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (supabaseUrl && supabaseKey) {
          const client = createClient(supabaseUrl, supabaseKey);
          const { data } = await client.from('products').select('*').limit(20);
          if (data && data.length > 0) {
            activeProducts = data.map((d: any) => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
              price: d.price || 1490,
              discountPrice: d.discount_price,
              thumbnail: d.images?.[0] || d.thumbnail || '/placeholder-jeans.jpg',
              totalStock: d.total_stock ?? 50,
              fit: d.fit || 'Regular',
              category: d.category || 'Jeans',
              variants: d.variants || [],
            }));
          }
        }
      } catch (err) {
        console.warn('Could not prefetch products in chat API:', err);
      }
    }

    const response = await ChatSupportService.processCustomerMessage({
      message,
      conversationHistory,
      products: activeProducts,
      orders: activeOrders,
    });

    return NextResponse.json({ success: true, message: response });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Chat Support Error' }, { status: 500 });
  }
}
