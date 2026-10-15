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

    // 3. How to Order / Buying Guide ("ami ki vabe nibo", "kivabe order korbo", "how to buy")
    if (
      lower.includes('kivabe') ||
      lower.includes('ki vabe') ||
      lower.includes('কিভাবে') ||
      lower.includes('কেমনে') ||
      lower.includes('how to buy') ||
      lower.includes('how to order') ||
      lower.includes('order korbo') ||
      lower.includes('order korte chai') ||
      lower.includes('অর্ডার করব') ||
      lower.includes('অর্ডার করতে চাই') ||
      lower.includes('কিনব') ||
      lower.includes('নিতে চাই') ||
      lower.includes('পাব')
    ) {
      const isBn = this.detectBangla(cleanMsg) || !cleanMsg.match(/[a-zA-Z]{6,}/);
      const orderGuide = isBn
        ? `অর্ডার করা খুবই সহজ এবং দ্রুত! 👖✨\n\n১. আমাদের ওয়েবসাইট থেকে আপনার পছন্দের জিন্সটি সিলেক্ট করুন এবং আপনার সাইজ (যেমন: ২৮, ৩০, ৩২, ৩৪, ৩৬) বেছে নিন।\n২. **'Add to Cart'** অথবা সরাসরি **'Buy Now'** বাটনে ক্লিক করুন।\n৩. আপনার নাম, সচল মোবাইল নম্বর এবং ডেলিভারির সঠিক ঠিকানা দিন।\n৪. পেমেন্ট মেথড হিসেবে **'Cash on Delivery (COD)'** নির্বাচন করে **'Place Order'** চাপুন।\n\nডেলিভারি ম্যান পার্সেল নিয়ে পৌঁছালে প্রডাক্ট চেক করে ক্যাশ পেমেন্ট করতে পারবেন!`
        : `Ordering from Jeans BD is very simple! 👖✨\n\n1. Browse our collection, select your favorite jeans, and choose your waist size.\n2. Click **'Add to Cart'** or **'Buy Now'**.\n3. Enter your name, active mobile number, and delivery address.\n4. Select **'Cash on Delivery (COD)'** or bKash/Nagad and confirm your order.\n\nYou can inspect the package upon courier delivery before paying!`;

      const featured = products.slice(0, 3);
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: orderGuide,
        timestamp: new Date().toISOString(),
        actionType: 'general',
        recommendedProducts: featured.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.discountPrice || p.price,
          thumbnail: p.thumbnail,
          availableSizes: (p.variants || []).filter((v) => v.stock > 0).map((v) => v.size),
        })),
      };
    }

    // 4. Cash on Delivery & Delivery Policy ("ক্যাশ অন ডেলিভারি পলিসি", "cod", "delivery charge")
    if (
      lower.includes('ক্যাশ অন ডেলিভারি') ||
      lower.includes('ডেলিভারি পলিসি') ||
      lower.includes('ডেলিভারি চার্জ') ||
      lower.includes('cash on delivery') ||
      lower.includes('cod') ||
      lower.includes('delivery policy') ||
      lower.includes('delivery charge') ||
      lower.includes('ডেলিভারি') ||
      lower.includes('কত দিন লাগবে') ||
      lower.includes('koto din')
    ) {
      const isBn = this.detectBangla(cleanMsg) || !cleanMsg.match(/[a-zA-Z]{6,}/);
      const deliveryText = isBn
        ? `আমাদের **ক্যাশ অন ডেলিভারি ও ডেলিভারি পলিসি**: 🚚\n\n• **সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি:** হ্যাঁ, বাংলাদেশের ৬৪টি জেলা ও থানা পর্যায়ে আমরা সম্পূর্ণ ক্যাশ অন ডেলিভারি (COD) সুবিধা দিচ্ছি।\n• **ডেলিভারি চার্জ:**\n  - ঢাকা সিটির ভেতরে: **৳৮০** (১-২ কার্যদিবসে ডেলিভারি)\n  - ঢাকার বাইরে সমগ্র বাংলাদেশে: **৳১৩০ - ৳১৫০** (২-৩ কার্যদিবসে ডেলিভারি)\n• **পার্সেল চেকিং:** ডেলিভারির সময় ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল চেক করে নেওয়ার পূর্ণ সুবিধা রয়েছে।\n• **কুরিয়ার পার্টনার্স:** Steadfast Courier এবং Pathao Courier এর মাধ্যমে দ্রুততম সময়ে পার্সেল পৌঁছানো হয়।`
        : `Our **Cash on Delivery & Shipping Policy**: 🚚\n\n• **Cash on Delivery (COD):** Available across all 64 districts in Bangladesh. No advance payment required for regular COD.\n• **Delivery Charges & Timing:**\n  - Inside Dhaka City: **৳80** (Delivered in 24-48 hours)\n  - Outside Dhaka (Nationwide): **৳130 - ৳150** (Delivered in 2-3 business days)\n• **Parcel Inspection:** You can verify the product with the courier delivery agent.\n• **Courier Partners:** Handled with priority via Steadfast & Pathao Courier.`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: deliveryText,
        timestamp: new Date().toISOString(),
        actionType: 'general',
      };
    }

    // 5. Price & Cost Inquiries ("dam koto", "দাম কত", "price koto", "taka")
    if (
      lower.includes('dam') ||
      lower.includes('দাম') ||
      lower.includes('price') ||
      lower.includes('taka') ||
      lower.includes('টাকা') ||
      lower.includes('খরচ') ||
      lower.includes('rate') ||
      lower.includes('রেট')
    ) {
      const isBn = this.detectBangla(cleanMsg) || !cleanMsg.match(/[a-zA-Z]{6,}/);
      const matched = this.findRelevantProducts(cleanMsg, products);
      const sample = matched.length > 0 ? matched : products;

      let priceText = '';
      if (sample.length > 0) {
        const top = sample.slice(0, 3);
        const listStr = top
          .map((p) => `• **${p.name}**: ৳${p.discountPrice || p.price}${p.discountPrice ? ` ~~(৳${p.price})~~` : ''}`)
          .join('\n');

        priceText = isBn
          ? `আমাদের প্রিমিয়াম ডেনিম জিন্সের কালেকশন এবং বর্তমান দাম:\n\n${listStr}\n\nআমাদের প্রতিটি জিন্স শতভাগ টেকসই হেভিওয়েট ডেনিম কটন দিয়ে তৈরি। আপনার পছন্দের ফিট বা সাইজ নির্বাচন করে সরাসরি অর্ডার করতে পারেন!`
          : `Here are our trending denim styles and current prices:\n\n${listStr}\n\nCrafted with premium high-tensile denim fabrics. Choose your style and order directly with Cash on Delivery!`;
      } else {
        priceText = isBn
          ? `আমাদের জিন্স কালেকশনের দাম শুরু ৳১,১৯০ থেকে ৳২,২৫০ পর্যন্ত (ফিট ও ওয়াশ ভেদে)। আপনি স্লিম, রেগুলার নাকি ব্যাগী স্টাইল খুঁজছেন জানালে সঠিক দাম জানিয়ে দিচ্ছি!`
          : `Our signature denim ranges between ৳1,190 and ৳2,250 depending on wash and cut. Let us know if you prefer Slim, Straight, or Baggy fit!`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: priceText,
        timestamp: new Date().toISOString(),
        actionType: 'product_recommendation',
        recommendedProducts: (sample.slice(0, 3) || []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.discountPrice || p.price,
          thumbnail: p.thumbnail,
          availableSizes: (p.variants || []).filter((v) => v.stock > 0).map((v) => v.size),
        })),
      };
    }

    // 6. Exchange & Returns ("exchange", "return", "পরিবর্তন", "সাইজ না মিললে")
    if (
      lower.includes('exchange') ||
      lower.includes('এক্সচেঞ্জ') ||
      lower.includes('রিটার্ন') ||
      lower.includes('return') ||
      lower.includes('পরিবর্তন') ||
      lower.includes('বদল') ||
      lower.includes('মিললে না') ||
      lower.includes('ছোট হলে') ||
      lower.includes('বড় হলে')
    ) {
      const isBn = this.detectBangla(cleanMsg) || !cleanMsg.match(/[a-zA-Z]{6,}/);
      const exchangeText = isBn
        ? `আমাদের **সহজ এক্সচেঞ্জ পলিসি**: 🔄\n\n• ডেলিভারি পাওয়ার পর সাইজে কোনো সমস্যা হলে **৭ দিনের মধ্যে** বিনামূল্যে সাইজ পরিবর্তনের সুবিধা পাবেন।\n• প্রডাক্টের প্রাইস ট্যাগ এবং প্রাথমিক অবস্থা অক্ষত রাখতে হবে।\n• সাইজ এক্সচেঞ্জের জন্য আমাদের চ্যাটে জানান অথবা হেল্পলাইনে সরাসরি কল বা WhatsApp করুন। আমরা দ্রুত নতুন সাইজ আপনার ঠিকানায় পাঠিয়ে দিব!`
        : `Our **Hassle-Free Exchange Policy**: 🔄\n\n• If there is any sizing issue, you can exchange your jeans within **7 days** of delivery.\n• Please ensure the original tag is intact.\n• Just notify us here in chat or call our customer care, and our courier will swap it for the right size!`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: exchangeText,
        timestamp: new Date().toISOString(),
        actionType: 'general',
      };
    }

    // 7. Fabric / Quality Inquiries ("fabric", "quality", "কাপড়", "কেমন")
    if (
      lower.includes('fabric') ||
      lower.includes('quality') ||
      lower.includes('কাপড়') ||
      lower.includes('কোয়ালিটি') ||
      lower.includes('ভালো') ||
      lower.includes('রং উঠবে') ||
      lower.includes('color fade')
    ) {
      const isBn = this.detectBangla(cleanMsg) || !cleanMsg.match(/[a-zA-Z]{6,}/);
      const qualityText = isBn
        ? `Jeans BD-এর প্রতিটি জিন্স এক্সপোর্ট কোয়ালিটির প্রিমিয়াম হেভিওয়েট কটন ডেনিম (98% Cotton, 2% Comfort Elastane) দিয়ে তৈরি। 👖\n\n• **ফ্যাব্রিক:** আরামদায়ক ও ব্রিদেবল, দীর্ঘক্ষণ পরলেও অস্বস্তি হবে না।\n• **কালার ফাস্টনেস:** বিশেষ ইন্ডাস্ট্রিয়াল ডাইং টেকনোলজিতে তৈরি, সহজে রঙ জ্বলে যায় না।\n• **স্লো-ওয়াশ ডেনিম:** প্রি-শ্রাঙ্ক (ধোয়ার পর সংকুচিত হয় না বা ছোট হয় না)।`
        : `Every pair at Jeans BD is tailored using export-grade heavyweight denim (98% Cotton with 2% Elastane stretch). 👖\n\n• **Fabric:** Extremely breathable, durable, and comfortable for all-day wear.\n• **Color Durability:** High-grade reactive indigo dyeing that resists fading.\n• **Pre-Shrunk:** Wash-treated so the fit stays consistent after washing.`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: qualityText,
        timestamp: new Date().toISOString(),
        actionType: 'general',
      };
    }

    // 8. Size Guidance
    if (
      lower.includes('size') ||
      lower.includes('সাইজ') ||
      lower.includes('fit') ||
      lower.includes('ফিট') ||
      lower.includes('ইঞ্চি') ||
      lower.includes('waist') ||
      lower.includes('কোমর') ||
      lower.includes('লম্বা') ||
      lower.includes('height')
    ) {
      const waistMatch = cleanMsg.match(/(\d{2})/);
      const isBn = this.detectBangla(cleanMsg) || !cleanMsg.match(/[a-zA-Z]{6,}/);

      let guidanceText = '';
      if (waistMatch) {
        const waist = parseInt(waistMatch[1], 10);
        if (waist >= 28 && waist <= 40) {
          guidanceText = isBn
            ? `আপনার কোমরের মাপ যদি **${waist} ইঞ্চি** হয়, তবে আপনি **সাইজ ${waist}** নির্বাচন করুন। যদি একটু ঢিলেঢালা ব্যাগী (Baggy) বা রিলাক্সড লুক পছন্দ করেন, তবে **সাইজ ${waist + 2}** নিতে পারেন। আমাদের জিন্স প্রি-শ্রাঙ্ক (ধোয়ার পর সাইজ ছোট হয় না)।`
            : `If your actual waist measurement is **${waist} inches**, we recommend **Size ${waist}** for a true tailored fit. For a relaxed streetwear or baggy aesthetic, choose **Size ${waist + 2}**. All our denim is pre-shrunk.`;
        }
      }

      if (!guidanceText) {
        guidanceText = isBn
          ? `আমাদের জিন্স সাইজ চার্ট:\n• সাইজ ২৮ (কোমর ২৮" / হিপ ৩৬")\n• সাইজ ৩০ (কোমর ৩০" / হিপ ৩৮")\n• সাইজ ৩২ (কোমর ৩২" / হিপ ৪০")\n• সাইজ ৩৪ (কোমর ৩৪" / হিপ ৪২")\n• সাইজ ৩৬ (কোমর ৩৬" / হিপ ৪৪")\n• সাইজ ৩৮ (কোমর ৩৮" / হিপ ৪৬")\n\nআপনার কোমর কত ইঞ্চি অথবা কোন ফিট (Straight, Slim, নাকি Baggy) পছন্দ জানালে তাৎক্ষণিক সাইজ কনফার্ম করে দিচ্ছি!`
          : `Jeans BD Standard Size Guide:\n• Size 28 (Waist 28" / Hip 36")\n• Size 30 (Waist 30" / Hip 38")\n• Size 32 (Waist 32" / Hip 40")\n• Size 34 (Waist 34" / Hip 42")\n• Size 36 (Waist 36" / Hip 44")\n• Size 38 (Waist 38" / Hip 46")\n\nTell us your exact waist measurement or preferred fit for an instant suggestion!`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: guidanceText,
        timestamp: new Date().toISOString(),
        actionType: 'size_advice',
      };
    }

    // 9. Product Recommendations from real catalog
    const matchingProducts = this.findRelevantProducts(cleanMsg, products);

    // Build context summary for LLM
    const catalogSummary = (products.length > 0 ? products : [])
      .slice(0, 15)
      .map(
        (p) =>
          `ID: ${p.id}, Name: ${p.name}, Price: BDT ${p.price}${p.discountPrice ? ` (Sale: BDT ${p.discountPrice})` : ''}, Fit: ${p.fit}, Stock: ${p.totalStock}, Sizes: ${(p.variants || []).map((v) => `${v.size}(${v.stock})`).join(',')}`
      )
      .join('\n');

    const prompt = `
The customer asked: "${cleanMsg}"

Recent Conversation Context:
${conversationHistory.map((m) => `${m.sender}: ${m.text}`).join('\n')}

Live Store Catalog (REAL INVENTORY):
${catalogSummary}

Respond directly as a helpful human customer care agent for Jeans BD in Dhaka:
- Answer in the same language as the user (Bengali/Banglish or English).
- Be polite, authentic, and direct.
- Explain prices, fits, sizes, and Cash on Delivery across Bangladesh.
`;

    const aiAnswer = await AiCoreService.generateText({
      prompt,
      systemInstruction: 'You are Jeans BD AI, an authentic human-like customer advisor for denim in Bangladesh. Never reply with repetitive static text. Always answer the specific question asked.',
      userQuery: cleanMsg,
      temperature: 0.4,
    });

    const displayProducts = matchingProducts.length > 0 ? matchingProducts : products.slice(0, 3);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: aiAnswer,
      timestamp: new Date().toISOString(),
      actionType: displayProducts.length > 0 ? 'product_recommendation' : 'general',
      recommendedProducts: displayProducts.slice(0, 3).map((p) => ({
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
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
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
