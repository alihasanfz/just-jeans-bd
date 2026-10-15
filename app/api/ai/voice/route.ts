import { NextRequest, NextResponse } from 'next/server';
import { AiCoreService } from '@/lib/services/ai/aiCore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface VoiceIntentResult {
  rawTranscript: string;
  intent:
    | 'view_sales_today'
    | 'view_low_stock'
    | 'view_monthly_report'
    | 'view_pending_orders'
    | 'view_customers'
    | 'open_tryon'
    | 'navigate_products'
    | 'general_query';
  responseSpeechBn: string;
  responseSpeechEn: string;
  targetUrl?: string;
  displayCard?: {
    title: string;
    description: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, language = 'bn-BD' } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ success: false, error: 'Voice transcript is required' }, { status: 400 });
    }

    const lower = transcript.toLowerCase();

    // Fast heuristic matchers for rapid voice response
    if (lower.includes('আজকের বিক্রয়') || lower.includes('আজকের সেল') || lower.includes('today sales') || lower.includes('sales today')) {
      const result: VoiceIntentResult = {
        rawTranscript: transcript,
        intent: 'view_sales_today',
        responseSpeechBn: 'আজকের বিক্রয় বিশ্লেষণ ড্যাশবোর্ডে ওপেন করা হয়েছে।',
        responseSpeechEn: 'Displaying today\'s live sales and revenue dashboard.',
        targetUrl: '/admin/ai?tab=reports&period=daily',
        displayCard: {
          title: 'Today\'s Sales Intelligence',
          description: 'Showing live revenue, orders, and payment method breakdowns for today.',
        },
      };
      return NextResponse.json({ success: true, result });
    }

    if (lower.includes('কম স্টক') || lower.includes('লো স্টক') || lower.includes('low stock') || lower.includes('স্টক দেখাও') || lower.includes('inventory')) {
      const result: VoiceIntentResult = {
        rawTranscript: transcript,
        intent: 'view_low_stock',
        responseSpeechBn: 'কম স্টকের জিন্স এবং ডিপ্লেটেড সাইজগুলোর তালিকা প্রদর্শিত হচ্ছে।',
        responseSpeechEn: 'Opening low-stock radar. Displaying items requiring supplier replenishment.',
        targetUrl: '/admin/ai?tab=products&filter=low_stock',
        displayCard: {
          title: 'Low Stock Radar',
          description: 'Critical and depleted size variants identified across the denim catalog.',
        },
      };
      return NextResponse.json({ success: true, result });
    }

    if (lower.includes('রিপোর্ট') || lower.includes('report') || lower.includes('মাসিক') || lower.includes('monthly')) {
      const result: VoiceIntentResult = {
        rawTranscript: transcript,
        intent: 'view_monthly_report',
        responseSpeechBn: 'এই মাসের সামগ্রিক সেলস এবং প্রফিট রিপোর্ট প্রস্তুত করা হয়েছে।',
        responseSpeechEn: 'Generating current month executive sales and P&L financial report.',
        targetUrl: '/admin/ai?tab=reports&period=monthly',
        displayCard: {
          title: 'Monthly Executive Report',
          description: 'Ready to export in CSV, Excel, or printable PDF format.',
        },
      };
      return NextResponse.json({ success: true, result });
    }

    if (lower.includes('পেন্ডিং অর্ডার') || lower.includes('pending orders') || lower.includes('অর্ডার দেখাও') || lower.includes('নতুন অর্ডার')) {
      const result: VoiceIntentResult = {
        rawTranscript: transcript,
        intent: 'view_pending_orders',
        responseSpeechBn: 'পেন্ডিং অর্ডারগুলোর ভেরিফিকেশন রাডার ওপেন করা হয়েছে।',
        responseSpeechEn: 'Loading pending order verification and dispatch radar.',
        targetUrl: '/admin/ai?tab=orders&filter=pending',
        displayCard: {
          title: 'Order Verification Radar',
          description: 'Inspect verified orders, phone validation, and courier dispatch queue.',
        },
      };
      return NextResponse.json({ success: true, result });
    }

    // AI Intent Classifier using Gemini
    const prompt = `
Classify this admin voice command for Jeans BD e-commerce:
"${transcript}"

Possible intents:
1. 'view_sales_today'
2. 'view_low_stock'
3. 'view_monthly_report'
4. 'view_pending_orders'
5. 'view_customers'
6. 'open_tryon'
7. 'navigate_products'
8. 'general_query'

Return JSON:
{
  "intent": "...",
  "responseSpeechBn": "Natural spoken sentence in Bengali",
  "responseSpeechEn": "Natural spoken sentence in English",
  "targetUrl": "/admin/ai or /admin/orders or /admin/products",
  "displayCard": { "title": "...", "description": "..." }
}
`;

    const fallback: VoiceIntentResult = {
      rawTranscript: transcript,
      intent: 'general_query',
      responseSpeechBn: `আপনার ভয়েস কমান্ড "${transcript}" প্রসেস করা হয়েছে।`,
      responseSpeechEn: `Processed voice instruction: "${transcript}".`,
      targetUrl: '/admin/ai',
      displayCard: {
        title: 'Voice Assistant Response',
        description: `Executed query: ${transcript}`,
      },
    };

    const aiParsed = await AiCoreService.generateJson<VoiceIntentResult>({
      prompt,
      systemInstruction: 'You are the Voice AI controller for Jeans BD Admin Dashboard.',
      fallback,
    });

    return NextResponse.json({ success: true, result: { ...aiParsed, rawTranscript: transcript } });
  } catch (error: any) {
    console.error('API /api/ai/voice error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Voice intent detection failed' }, { status: 500 });
  }
}
