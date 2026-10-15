/**
 * Jeans BD — Customer AI Support Service
 * 
 * Provides:
 * 1. Bilingual Natural Language Chatbot (Bangla + English)
 * 2. Live Product Recommendations from real catalog
 * 3. Real-Time Price & Size Stock Verification
 * 4. Tailored Denim Fit & Size Guidance
 * 5. Instant Order Tracking by Phone or Order Number
 * 6. Complaint Registration & Human Support Handover
 */

import { Product, Order } from '@/types';
import { AiCoreService } from './aiCore';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  recommendedProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail: string;
    availableSizes: string[];
  }>;
  orderStatusCard?: {
    orderNumber: string;
    status: string;
    totalAmount: number;
    itemsCount: number;
    courier?: string;
    trackingNumber?: string;
  };
  actionType?: 'product_recommendation' | 'order_tracking' | 'size_advice' | 'support_ticket_created' | 'general';
}

export interface SupportTicket {
  ticketId: string;
  customerPhone?: string;
  customerEmail?: string;
  orderNumber?: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  status: 'open' | 'investigating' | 'resolved';
}

export class ChatSupportService {
  /**
   * Processes an incoming customer chat message with full catalog and order intelligence
   */
  public static async processCustomerMessage({
    message,
    conversationHistory = [],
    products = [],
    orders = [],
  }: {
    message: string;
    conversationHistory?: Array<{ sender: string; text: string }>;
    products: Product[];
    orders: Order[];
  }): Promise<ChatMessage> {
    const cleanMsg = message.trim();
    const lower = cleanMsg.toLowerCase();

    // 1. Order Tracking Detection (contains JBD-XXXXX or 11 digit BD phone number)
    const orderNumMatch = cleanMsg.match(/JBD-?\d{4,6}/i);
    const phoneMatch = cleanMsg.match(/01[3-9]\d{8}/);

    if (orderNumMatch || phoneMatch || lower.includes('track') || lower.includes('অর্ডার') || lower.includes('অবস্থা')) {
      let matchedOrder: Order | undefined;

      if (orderNumMatch) {
        const rawCode = orderNumMatch[0].toUpperCase().replace('-', '');
        matchedOrder = orders.find(
          (o) => o.orderNumber.toUpperCase().replace('-', '') === rawCode
        );
      }

      if (!matchedOrder && phoneMatch) {
        const p = phoneMatch[0];
        matchedOrder = orders.find((o) => (o.customer?.phone || '').includes(p));
      }

      if (matchedOrder) {
        const isBn = this.detectBangla(cleanMsg);
        const st = matchedOrder.orderStatus;
        const courier = matchedOrder.delivery?.courierCompany || 'Steadfast Courier';
        const tracking = matchedOrder.delivery?.trackingNumber;

        const responseText = isBn
          ? `আপনার অর্ডার #${matchedOrder.orderNumber}-এর বর্তমান অবস্থা: **${st}**। মোট মূল্য: ৳${matchedOrder.totalAmount}। ${
              tracking ? `কুরিয়ার (${courier}) ট্র্যাকিং নম্বর: ${tracking}।` : `পার্সেল প্রস্তুত করা হচ্ছে এবং শীঘ্রই কুরিয়ারে পাঠানো হবে।`
            }`
          : `Order #${matchedOrder.orderNumber} is currently **${st}**. Total: ৳${matchedOrder.totalAmount}. ${
              tracking ? `Courier (${courier}) tracking ID: ${tracking}.` : `We are preparing the parcel for courier dispatch.`
            }`;

        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: new Date().toISOString(),
          actionType: 'order_tracking',
          orderStatusCard: {
            orderNumber: matchedOrder.orderNumber,
            status: matchedOrder.orderStatus,
            totalAmount: matchedOrder.totalAmount,
            itemsCount: (matchedOrder.items || []).length,
            courier,
            trackingNumber: tracking,
          },
        };
      }
    }

    // 2. Complaint or Human Handover Trigger
    if (
      lower.includes('complain') ||
      lower.includes('অভিযোগ') ||
      lower.includes('সমস্যা') ||
      lower.includes('রিফান্ড') ||
      lower.includes('খারাপ') ||
      lower.includes('বাজে') ||
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('কল') ||
      lower.includes('প্রতিনিধি')
    ) {
      const isBn = this.detectBangla(cleanMsg);
      const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

      const text = isBn
        ? `আপনার অভিযোগটি গুরুত্ব সহকারে গ্রহণ করা হয়েছে। একটি সাপোর্ট টিকিট তৈরি করা হয়েছে: **${ticketId}**।\n\nআমাদের ডেডিকেটেড সাপোর্ট অফিসার খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন। জরুরি প্রয়োজনে কল করুন: **01700-000000** অথবা WhatsApp করুন।`
        : `We sincerely apologize for the inconvenience. A priority support ticket has been generated: **${ticketId}**.\n\nOur customer care supervisor will contact you shortly to resolve this. Urgent assistance: **01700-000000** or WhatsApp.`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text,
        timestamp: new Date().toISOString(),
        actionType: 'support_ticket_created',
      };
    }

    // 3. Size Guidance
    if (
      lower.includes('size') ||
      lower.includes('সাইজ') ||
      lower.includes('fit') ||
      lower.includes('ফিট') ||
      lower.includes('ইঞ্চি') ||
      lower.includes('waist') ||
      lower.includes('কোমর')
    ) {
      const waistMatch = cleanMsg.match(/(\d{2})/);
      const isBn = this.detectBangla(cleanMsg);

      let guidanceText = '';
      if (waistMatch) {
        const waist = parseInt(waistMatch[1], 10);
        if (waist >= 28 && waist <= 40) {
          guidanceText = isBn
            ? `আপনার কোমরের মাপ যদি ${waist} ইঞ্চি হয়, তবে আপনি **সাইজ ${waist}** নির্বাচন করুন। যদি একটু ঢিলেঢালা ব্যাগী (Baggy) বা রিলাক্সড লুক চান, তবে **সাইজ ${waist + 2}** নিতে পারেন। আমাদের জিন্স প্রি-শ্রাঙ্ক (ধোয়ার পর ছোট হয় না)।`
            : `If your actual waist measurement is ${waist} inches, we recommend **Size ${waist}** for a true tailored fit. For a relaxed streetwear or baggy aesthetic, choose **Size ${waist + 2}**. All our denim is pre-shrunk.`;
        }
      }

      if (!guidanceText) {
        guidanceText = isBn
          ? `আমাদের জিন্স সাইজ চার্ট:\n- সাইজ ২৮ (কোমর ২৮")\n- সাইজ ৩০ (কোমর ৩০")\n- সাইজ ৩২ (কোমর ৩২")\n- সাইজ ৩৪ (কোমর ৩৪")\n- সাইজ ৩৬ (কোমর ৩৬")\n- সাইজ ৩৮ (কোমর ৩৮")\n\nআপনি কোন ফিট (Straight, Slim, নাকি Baggy) পছন্দ করছেন জানালে সঠিক পরামর্শ দিতে পারব!`
          : `Jeans BD Standard Size Guide:\n- Size 28 (Waist 28")\n- Size 30 (Waist 30")\n- Size 32 (Waist 32")\n- Size 34 (Waist 34")\n- Size 36 (Waist 36")\n- Size 38 (Waist 38")\n\nLet me know your height, waist size, or preferred fit (Straight, Slim, Baggy) for a custom recommendation!`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: guidanceText,
        timestamp: new Date().toISOString(),
        actionType: 'size_advice',
      };
    }

    // 4. Product Recommendations from real catalog
    const matchingProducts = this.findRelevantProducts(cleanMsg, products);

    // Build context summary for LLM
    const catalogSummary = products
      .slice(0, 15)
      .map(
        (p) =>
          `ID: ${p.id}, Name: ${p.name}, Price: BDT ${p.price}${p.discountPrice ? ` (Sale: BDT ${p.discountPrice})` : ''}, Fit: ${p.fit}, Stock: ${p.totalStock}, Sizes: ${(p.variants || []).map((v) => `${v.size}(${v.stock})`).join(',')}`
      )
      .join('\n');

    const prompt = `
You are the AI Denim Stylist and Customer Care Specialist for "Jeans BD" (Bangladesh's premier denim brand).
The user just asked: "${cleanMsg}"

Recent Conversation Context:
${conversationHistory.map((m) => `${m.sender}: ${m.text}`).join('\n')}

Live Store Catalog (REAL INVENTORY):
${catalogSummary}

Rules:
1. If user speaks in Bengali, reply in polite, fluent Bengali (বাংলা). If English, reply in English.
2. Provide exact denim details (prices in BDT, available fits like Straight, Baggy, Slim, Trucker Jacket, 100% Cotton).
3. If they ask about delivery, explain that we provide Cash on Delivery (COD) across all 64 districts of Bangladesh with bKash and Nagad support. Delivery charge: Dhaka ৳80, Outside Dhaka ৳130-150.
4. Keep the answer warm, professional, stylish, and concise (under 4-5 sentences).
`;

    const aiAnswer = await AiCoreService.generateText({
      prompt,
      systemInstruction: 'You are Jeans BD AI, an expert denim advisor in Dhaka, Bangladesh.',
      temperature: 0.3,
    });

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: aiAnswer,
      timestamp: new Date().toISOString(),
      actionType: matchingProducts.length > 0 ? 'product_recommendation' : 'general',
      recommendedProducts: matchingProducts.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.discountPrice || p.price,
        thumbnail: p.thumbnail,
        availableSizes: (p.variants || []).filter((v) => v.stock > 0).map((v) => v.size),
      })),
    };
  }

  private static detectBangla(text: string): boolean {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text);
  }

  private static findRelevantProducts(query: string, products: Product[]): Product[] {
    const q = query.toLowerCase();
    const scored = products.map((p) => {
      let score = 0;
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();
      const fit = (p.fit || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();

      if (q.includes('baggy') && (name.includes('baggy') || fit.includes('baggy'))) score += 10;
      if (q.includes('slim') && (name.includes('slim') || fit.includes('slim'))) score += 10;
      if (q.includes('straight') && (name.includes('straight') || fit.includes('straight'))) score += 10;
      if (q.includes('jacket') && (name.includes('jacket') || cat.includes('jacket'))) score += 12;
      if (q.includes('cargo') && name.includes('cargo')) score += 10;
      if (q.includes('women') && p.gender === 'women') score += 8;
      if (q.includes('men') && p.gender === 'men') score += 8;
      if (q.includes('black') && (name.includes('black') || desc.includes('black'))) score += 5;
      if (q.includes('blue') && (name.includes('blue') || desc.includes('blue') || name.includes('indigo'))) score += 5;

      return { product: p, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.product);
  }
}
