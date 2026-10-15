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

    const response = await ChatSupportService.processCustomerMessage({
      message,
      conversationHistory,
      products,
      orders,
    });

    return NextResponse.json({ success: true, message: response });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Chat Support Error' }, { status: 500 });
  }
}
