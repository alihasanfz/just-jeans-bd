/**
 * Jeans BD — Core AI Intelligence Engine
 * 
 * Provides robust multi-model AI capabilities:
 * 1. Google Gemini Generative AI (using GEMINI_API_KEY from environment)
 * 2. Intelligent High-Reliability Local Heuristic Engine (zero downtime fallback)
 */

interface GeminiMessage {
  role?: string;
  parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>;
}

export class AiCoreService {
  private static getGeminiKey(): string {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      (process.env.VIRTUAL_TRYON_API_KEY?.startsWith('AQ.') || process.env.VIRTUAL_TRYON_API_KEY?.startsWith('AIza')
        ? process.env.VIRTUAL_TRYON_API_KEY
        : '') ||
      ''
    ).trim();
  }

  /**
   * Primary LLM invocation with automated JSON extraction & fallback
   */
  public static async generateText({
    prompt,
    systemInstruction,
    userQuery,
    temperature = 0.2,
    maxTokens = 2048,
  }: {
    prompt: string;
    systemInstruction?: string;
    userQuery?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const apiKey = this.getGeminiKey();

    if (apiKey) {
      // Try gemini-1.5-flash
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      try {
        const contents: GeminiMessage[] = [];
        if (systemInstruction) {
          contents.push({
            role: 'user',
            parts: [{ text: `System Context & Guidelines:\n${systemInstruction}` }],
          });
          contents.push({
            role: 'model',
            parts: [{ text: 'Understood. I will strictly follow these system guidelines and formatting rules.' }],
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            return candidate.trim();
          }
        } else {
          const errText = await res.text();
          console.warn('Gemini API call returned non-200, falling back to local reasoning:', errText);
        }
      } catch (err) {
        console.warn('Gemini API network issue, activating local intelligence fallback:', err);
      }
    }

    // High quality local fallback if API key is not present or rate limited
    return this.fallbackReasoning(userQuery || prompt);
  }

  /**
   * Invokes Gemini for structured JSON output
   */
  public static async generateJson<T = any>({
    prompt,
    systemInstruction,
    fallback,
  }: {
    prompt: string;
    systemInstruction?: string;
    fallback: T;
  }): Promise<T> {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with a valid, parseable JSON object without markdown fences, explanation, or wrapping text.`;
    try {
      const response = await this.generateText({
        prompt: fullPrompt,
        systemInstruction: systemInstruction ? `${systemInstruction} Return strictly valid JSON.` : undefined,
        temperature: 0.1,
      });

      // Clean markdown code blocks if Gemini added them
      const cleaned = response
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      return parsed as T;
    } catch (e) {
      console.warn('JSON parsing failed from AI response, using structured fallback:', e);
      return fallback;
    }
  }

  /**
   * Deterministic local denim intelligence for offline/no-network stability
   */
  private static fallbackReasoning(queryOrPrompt: string): string {
    const q = queryOrPrompt.toLowerCase();
    const isBn = /[\u0980-\u09FF]/.test(queryOrPrompt) || !queryOrPrompt.match(/[a-zA-Z]{6,}/);

    // Buying & How to order
    if (q.includes('kivabe') || q.includes('ki vabe') || q.includes('কিভাবে') || q.includes('order') || q.includes('অর্ডার') || q.includes('কিনব') || q.includes('nibo')) {
      return isBn
        ? `অর্ডার করা খুবই সহজ! 👖 আমাদের ওয়েবসাইট থেকে আপনার পছন্দের জিন্সটি সিলেক্ট করুন, সাইজ বেছে নিন এবং 'Buy Now' বা 'Add to Cart' বাটনে ক্লিক করুন। এরপর আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে 'Cash on Delivery' সিলেক্ট করে কনফার্ম করুন। পার্সেল হাতে পেয়ে চেক করে পেমেন্ট করতে পারবেন!`
        : `Ordering is super easy! Simply browse our jeans, pick your size, and click 'Buy Now' or 'Add to Cart'. Fill in your delivery address, select Cash on Delivery (COD), and we'll dispatch it promptly to your doorstep!`;
    }

    // Cash on Delivery & Delivery Policy
    if (q.includes('ক্যাশ অন ডেলিভারি') || q.includes('ডেলিভারি') || q.includes('cod') || q.includes('delivery')) {
      return isBn
        ? `আমরা সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা প্রদান করি! 🚚 ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৳৮০ (১-২ দিনে) এবং ঢাকার বাইরে ৳১৩০-৳১৫০ (২-৩ দিনে)। পার্সেল হাতে পেয়ে দেখে পেমেন্ট করার সুবিধা রয়েছে।`
        : `We offer 100% Cash on Delivery nationwide across all 64 districts in Bangladesh! Delivery fee: Inside Dhaka ৳80 (1-2 days), Outside Dhaka ৳130-150 (2-3 days). You can inspect your denim package upon courier handover.`;
    }

    // Price inquiry
    if (q.includes('দাম') || q.includes('dam') || q.includes('price') || q.includes('টাকা') || q.includes('taka')) {
      return isBn
        ? `আমাদের এক্সপোর্ট কোয়ালিটি জিন্সের দাম ৳১,১৯০ থেকে শুরু করে ৳২,২৫০ পর্যন্ত (ফিট ও ওয়াশ ভেদে)। আপনি স্লিম, রেগুলার নাকি ব্যাগী ফিট পছন্দ করছেন জানালে বিস্তারিত জানিয়ে দিচ্ছি!`
        : `Our premium denim collection ranges from ৳1,190 to ৳2,250 depending on the wash, weight, and cut. Tell us your style preference for exact recommendations!`;
    }

    // Size & Fit
    if (q.includes('size') || q.includes('সাইজ') || q.includes('fit') || q.includes('ফিট') || q.includes('কোমর') || q.includes('waist')) {
      return isBn
        ? `আমাদের জিন্স সাইজ ২৮, ৩০, ৩২, ৩৪, ৩৬ এবং ৩৮ পর্যন্ত রেডি স্টকে রয়েছে। আপনার স্বাভাবিক কোমরের মাপ অনুযায়ী সাইজ নিতে পারেন; একটু ব্যাগী বা ঢিলেঢালা লুক চাইলে ১ সাইজ বড় নিতে পারেন। আমাদের সব জিন্স প্রি-শ্রাঙ্ক (ধোয়ার পর ছোট হয় না)।`
        : `We stock waist sizes 28 through 38. For a tailored silhouette, order your exact waist size. For a modern streetwear or baggy aesthetic, we recommend sizing up by one step. All our fabrics are pre-shrunk.`;
    }

    // Product description generation
    if (q.includes('description') || q.includes('বর্ননা')) {
      return `Elevate your wardrobe with our signature denim piece, crafted from premium heavyweight cotton with engineered comfort stretch. Designed in Bangladesh for supreme durability, featuring reinforced bar-tack stitching, authentic copper rivets, and a tailored silhouette that flatters every movement. Perfect for both casual streetwear and elevated evening styling.`;
    }

    // General warm welcome
    return isBn
      ? `স্বাগতম Jeans BD-তে! 👖 আমাদের কালেকশনে রয়েছে প্রিমিয়াম স্লিম ফিট, স্ট্রেইট লেগ, ব্যাগী জিন্স এবং ডেনিম জ্যাকেট। ক্যাশ অন ডেলিভারিতে অর্ডার করতে অথবা সাইজ ও দাম জানতে যেকোনো প্রশ্ন করুন!`
      : `Welcome to Jeans BD! 👖 Explore our signature lineup of Slim Fit, Straight Leg, and Baggy Streetwear Denim. Feel free to ask about our sizing, real-time stock, prices, or Cash on Delivery service.`;
  }
}
