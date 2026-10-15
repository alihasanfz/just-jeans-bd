/**
 * Jeans BD — AI Product Management Service
 * 
 * Provides:
 * 1. Bilingual Product Description Generation (Bangla + English)
 * 2. Complete SEO Optimization (Meta tags, keywords, slug)
 * 3. Denim Size & Fit Chart Specifications
 * 4. Smart Category & Tag Recommendations
 * 5. Stock Level Monitoring & Low-Stock Alerts
 * 6. Duplicate Product & SKU Detection
 */

import { Product } from '@/types';
import { AiCoreService } from './aiCore';

export interface ProductAiGenerationInput {
  name: string;
  category?: string;
  gender?: 'men' | 'women' | 'unisex';
  fit?: string;
  washColor?: string;
  fabricComposition?: string;
  price?: number;
}

export interface GeneratedProductData {
  nameBn: string;
  subtitle: string;
  descriptionEn: string;
  descriptionBn: string;
  bulletPointsEn: string[];
  bulletPointsBn: string[];
  fabricCare: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    focusKeywords: string[];
  };
  sizeFitGuide: {
    fitDescription: string;
    riseType: string;
    stretchLevel: string;
    recommendedWaistFit: string;
    measurementsTable: Array<{
      size: string;
      waistInches: number;
      hipInches: number;
      inseamInches: number;
      thighInches: number;
      legOpeningInches: number;
    }>;
  };
  suggestedTags: string[];
  suggestedCategories: string[];
}

export interface DuplicateDetectionResult {
  hasDuplicate: boolean;
  duplicateItems: Array<{
    id: string;
    name: string;
    slug: string;
    reason: string;
    similarityScore: number;
  }>;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  slug: string;
  totalStock: number;
  urgency: 'critical' | 'warning' | 'normal';
  depletedVariants: Array<{
    size: string;
    color: string;
    stock: number;
    sku: string;
  }>;
  recommendedAction: string;
}

export class ProductAiService {
  /**
   * Generates complete product metadata, bilingual descriptions, and SEO
   */
  public static async generateProductDetails(
    input: ProductAiGenerationInput
  ): Promise<GeneratedProductData> {
    const prompt = `
Generate premium, high-converting e-commerce product specifications for Jeans BD (Bangladesh's leading authentic denim brand).

Product Details:
- Name: "${input.name}"
- Category: "${input.category || 'Jeans'}"
- Gender: "${input.gender || 'men'}"
- Fit: "${input.fit || 'Regular Fit'}"
- Wash/Color: "${input.washColor || 'Vintage Indigo'}"
- Fabric: "${input.fabricComposition || '98% Cotton, 2% Elastane'}"
- Price: "${input.price ? `BDT ${input.price}` : 'BDT 2,200'}"

Provide a comprehensive JSON object with:
1. nameBn: Authentic, natural sounding Bengali product name
2. subtitle: Catchy English product subtitle (5-8 words)
3. descriptionEn: Rich 2-3 paragraph English description highlighting denim heritage, wash aesthetics, fabric weight, daily versatility and bar-tack stitching.
4. descriptionBn: Engaging natural Bengali description (বাংলা বিবরণ) suitable for Bangladeshi denim lovers.
5. bulletPointsEn: Array of 5 feature highlights in English
6. bulletPointsBn: Array of 5 feature highlights in Bengali
7. fabricCare: Array of 4 garment care recommendations (e.g. "Cold machine wash inside out", "Do not bleach")
8. seo:
   - metaTitle: 55-60 character Google SEO title
   - metaDescription: 145-160 character meta description
   - slug: clean URL slug (e.g. vintage-indigo-straight-fit-jeans)
   - focusKeywords: 6-8 relevant search keywords
9. sizeFitGuide:
   - fitDescription: specific description for ${input.fit || 'Straight Fit'}
   - riseType: e.g. "Mid Rise" or "High Rise"
   - stretchLevel: e.g. "Slight Stretch (2% Elastane)"
   - recommendedWaistFit: Sizing tip for Bangladeshi body types
   - measurementsTable: Array of objects for sizes ["28", "30", "32", "34", "36", "38"] with waistInches, hipInches, inseamInches, thighInches, legOpeningInches
10. suggestedTags: Array of 6 relevant tags
11. suggestedCategories: Array of 3 relevant categories
`;

    const fallback: GeneratedProductData = {
      nameBn: `${input.name} - প্রিমিয়াম জিন্স`,
      subtitle: `Authentic Handcrafted Denim with Modern Comfort`,
      descriptionEn: `Engineered from premium heavyweight denim, the ${input.name} combines heritage craftsmanship with contemporary streetwear aesthetics. Featuring custom wash textures, reinforced seams, and authentic metal rivets, this piece delivers exceptional durability and tailored comfort throughout the day.`,
      descriptionBn: `প্রিমিয়াম হেভিওয়েট ডেনিম ফ্যাব্রিক দিয়ে তৈরি এই ${input.name} দীর্ঘস্থায়িত্ব এবং আধুনিক ফ্যাশনের নিখুঁত সমন্বয়। আরামদায়ক ফিটিং এবং নিখুঁত ফিনিশিং সহ এটি দৈনন্দিন ব্যবহার ও যেকোনো অনুষ্ঠানে পরার জন্য আদর্শ।`,
      bulletPointsEn: [
        '100% Authentic ring-spun denim cotton with premium wash',
        'Reinforced bar-tack stitching at high-stress points',
        'Custom Jeans BD engraved shank button & copper rivets',
        'Pre-shrunk fabric to prevent post-wash shrinkage',
        'Breathable and comfortable all-day wear',
      ],
      bulletPointsBn: [
        'প্রিমিয়াম রিংস্পান কটন ডেনিম ফ্যাব্রিক',
        'দীর্ঘস্থায়ী মজবুত সেলাই ও টেকসই ফিনিশ',
        'কাস্টম জিন্স বিডি বাটন ও কপার রিভেটস',
        'ধোয়ার পরেও সাইজ ও কালার ঠিক থাকে',
        'সারাদিন পরার জন্য অত্যন্ত আরামদায়ক',
      ],
      fabricCare: [
        'Machine wash cold inside out with like colors',
        'Do not bleach or dry clean',
        'Tumble dry low or hang dry in shade',
        'Warm iron if necessary',
      ],
      seo: {
        metaTitle: `${input.name} | Buy Premium Denim in Bangladesh | Jeans BD`,
        metaDescription: `Shop the authentic ${input.name} online at Jeans BD. 100% genuine denim, comfortable fit, nationwide cash on delivery across Bangladesh.`,
        slug: (input.name || 'premium-denim-jeans')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        focusKeywords: [
          'Jeans BD',
          'denim jeans Bangladesh',
          input.name,
          `${input.gender || 'men'} jeans`,
          input.fit || 'denim fit',
          'buy jeans online dhaka',
        ],
      },
      sizeFitGuide: {
        fitDescription: `Designed with a tailored ${input.fit || 'Regular Fit'} that provides freedom of movement without excess fabric.`,
        riseType: 'Mid Rise',
        stretchLevel: input.fabricComposition?.includes('Elastane') ? 'Comfort Flex Stretch' : 'Rigid 100% Cotton',
        recommendedWaistFit: 'True to size. Order your standard waist measurement in inches.',
        measurementsTable: [
          { size: '28', waistInches: 28, hipInches: 36, inseamInches: 30, thighInches: 21, legOpeningInches: 13.5 },
          { size: '30', waistInches: 30, hipInches: 38, inseamInches: 31, thighInches: 22, legOpeningInches: 14 },
          { size: '32', waistInches: 32, hipInches: 40, inseamInches: 32, thighInches: 23, legOpeningInches: 14.5 },
          { size: '34', waistInches: 34, hipInches: 42, inseamInches: 32, thighInches: 24, legOpeningInches: 15 },
          { size: '36', waistInches: 36, hipInches: 44, inseamInches: 33, thighInches: 25, legOpeningInches: 15.5 },
          { size: '38', waistInches: 38, hipInches: 46, inseamInches: 33, thighInches: 26, legOpeningInches: 16 },
        ],
      },
      suggestedTags: ['Denim', 'Jeans', 'Streetwear', 'Raw Denim', 'Bangladesh Fashion', 'Casual'],
      suggestedCategories: [input.category || "Men's Straight Leg Jeans", 'New Arrivals', 'Trending Denim'],
    };

    return await AiCoreService.generateJson<GeneratedProductData>({
      prompt,
      systemInstruction: 'You are the Chief Denim Merchandiser and SEO Director for Jeans BD in Dhaka, Bangladesh.',
      fallback,
    });
  }

  /**
   * Scans an array of products for low-stock variants and depletion risks
   */
  public static monitorStock(products: Product[], threshold = 5): LowStockAlert[] {
    const alerts: LowStockAlert[] = [];

    for (const p of products) {
      const depletedVariants: Array<{ size: string; color: string; stock: number; sku: string }> = [];
      const variants = Array.isArray(p.variants) ? p.variants : [];

      for (const v of variants) {
        if (v.stock <= threshold) {
          depletedVariants.push({
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku || `${p.slug}-${v.size}-${v.color}`,
          });
        }
      }

      const totalStock = p.totalStock ?? variants.reduce((sum, v) => sum + (v.stock || 0), 0);

      if (totalStock <= threshold || depletedVariants.length > 0) {
        let urgency: 'critical' | 'warning' | 'normal' = 'normal';
        let action = `Restock upcoming batches for ${p.name}.`;

        if (totalStock === 0) {
          urgency = 'critical';
          action = 'URGENT: Product completely OUT OF STOCK! Reorder or disable storefront listing.';
        } else if (totalStock <= threshold) {
          urgency = 'critical';
          action = `High depletion velocity: Only ${totalStock} total units remain across all variants.`;
        } else if (depletedVariants.length > 0) {
          urgency = 'warning';
          action = `Key sizes (${depletedVariants.map((v) => v.size).join(', ')}) are critically low. Replenish immediately.`;
        }

        alerts.push({
          productId: p.id,
          productName: p.name,
          slug: p.slug,
          totalStock,
          urgency,
          depletedVariants,
          recommendedAction: action,
        });
      }
    }

    // Sort by critical first, then total stock ascending
    return alerts.sort((a, b) => {
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
      return a.totalStock - b.totalStock;
    });
  }

  /**
   * Scans product catalog to detect duplicate items, redundant slugs, or cloned SKUs
   */
  public static detectDuplicates(
    products: Product[],
    candidateProduct?: Partial<Product>
  ): DuplicateDetectionResult {
    const duplicateItems: DuplicateDetectionResult['duplicateItems'] = [];
    const pool = candidateProduct ? [candidateProduct as Product, ...products] : products;

    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i];
        const b = pool[j];

        if (!a || !b || a.id === b.id) continue;

        // Check 1: Identical slug
        if (a.slug && b.slug && a.slug.trim().toLowerCase() === b.slug.trim().toLowerCase()) {
          duplicateItems.push({
            id: b.id,
            name: b.name,
            slug: b.slug,
            reason: `Identical URL slug conflict: "${a.slug}"`,
            similarityScore: 1.0,
          });
          continue;
        }

        // Check 2: High name similarity
        const nameA = a.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const nameB = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (nameA === nameB && nameA.length > 3) {
          duplicateItems.push({
            id: b.id,
            name: b.name,
            slug: b.slug,
            reason: `Identical product title: "${a.name}" matches "${b.name}"`,
            similarityScore: 0.95,
          });
          continue;
        }

        // Check 3: SKU collision across variants
        const skusA = new Set((a.variants || []).map((v) => v.sku?.toLowerCase().trim()).filter(Boolean));
        const matchingSkus = (b.variants || [])
          .map((v) => v.sku?.toLowerCase().trim())
          .filter((sku) => sku && skusA.has(sku));

        if (matchingSkus.length > 0) {
          duplicateItems.push({
            id: b.id,
            name: b.name,
            slug: b.slug,
            reason: `Conflicting variant SKUs: ${matchingSkus.join(', ')}`,
            similarityScore: 0.9,
          });
        }
      }
    }

    return {
      hasDuplicate: duplicateItems.length > 0,
      duplicateItems,
    };
  }
}
