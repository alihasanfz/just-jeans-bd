'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductReview, Category, SiteSettings } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEFAULT_SITE_SETTINGS } from '@/lib/data/mockData';
import { idbGet, idbSet } from '@/lib/utils/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

function generateProductId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
  isCloudConnected: boolean;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  syncLocalProductsToSupabase: () => Promise<{ success: boolean; count?: number; message?: string }>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadAllData() {
      try {
        // 1. Try Supabase Cloud Database first if configured
        if (isSupabaseConfigured) {
          try {
            const { data: dbProducts, error } = await supabase
              .from('products')
              .select('*')
              .eq('is_active', true)
              .order('created_at', { ascending: false });

            if (!error && Array.isArray(dbProducts) && dbProducts.length > 0) {
              const mapped: Product[] = dbProducts.map((row: any) => ({
                id: row.id,
                slug: row.slug || `prod-${row.id}`,
                name: row.name,
                subtitle: row.subtitle || '',
                titleBn: row.name_bn || '',
                category: row.category || "Men's Straight Leg Jeans",
                gender: row.gender || 'men',
                fit: row.fit || 'Straight Fit',
                washColor: row.wash_color || 'Vintage Wash',
                fabricComposition: row.fabric_composition || '100% Cotton Denim',
                description: row.description || '',
                details: Array.isArray(row.details) ? row.details : [],
                fabricCare: Array.isArray(row.fabric_care) ? row.fabric_care : [],
                price: Number(row.price) || 0,
                discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
                discountPercentage: Number(row.discount_percentage) || 0,
                thumbnail: row.thumbnail || (Array.isArray(row.images) && row.images[0]) || '',
                images: Array.isArray(row.images) ? row.images : [],
                rating: Number(row.rating) || 5.0,
                reviewCount: Number(row.review_count) || 0,
                isNewArrival: !!row.is_new_arrival,
                isBestSeller: !!row.is_best_seller,
                isFeatured: !!row.is_featured,
                isOnSale: !!row.is_on_sale,
                totalStock: Number(row.total_stock) || 0,
                tags: Array.isArray(row.tags) ? row.tags : [],
                createdAt: row.created_at || new Date().toISOString(),
                variants: Array.isArray(row.variants) ? row.variants : [],
              }));
              setProducts(mapped);
              await idbSet('jeansbd_products', mapped);
            }
          } catch (dbErr) {
            console.warn('Supabase fetch failed, trying local storage cache', dbErr);
          }
        }

        // 2. Try IndexedDB if Supabase didn't load products
        const idbProds = await idbGet<Product[]>('jeansbd_products');
        if (idbProds && Array.isArray(idbProds) && idbProds.length > 0) {
          setProducts((current) => (current.length > 0 ? current : idbProds));
        } else {
          const savedProds = localStorage.getItem('jeansbd_products');
          if (savedProds) {
            try {
              const parsed = JSON.parse(savedProds);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setProducts((current) => (current.length > 0 ? current : parsed));
              }
            } catch (e) {}
          }
        }

        const idbCats = await idbGet<Category[]>('jeansbd_categories');
        if (idbCats && Array.isArray(idbCats) && idbCats.length > 0) {
          setCategories(idbCats);
        } else {
          const savedCats = localStorage.getItem('jeansbd_categories');
          if (savedCats) setCategories(JSON.parse(savedCats));
        }

        const savedSettings = localStorage.getItem('jeansbd_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          const merged: SiteSettings = {
            ...DEFAULT_SITE_SETTINGS,
            ...parsed,
            phone: parsed.phone === '+880 1700-000000' ? DEFAULT_SITE_SETTINGS.phone : (parsed.phone || DEFAULT_SITE_SETTINGS.phone),
            email: parsed.email === 'support@jeansbd.com' ? DEFAULT_SITE_SETTINGS.email : (parsed.email || DEFAULT_SITE_SETTINGS.email),
            address: parsed.address?.includes('Banani') ? DEFAULT_SITE_SETTINGS.address : (parsed.address || DEFAULT_SITE_SETTINGS.address),
            googleMapUrl: parsed.googleMapUrl || DEFAULT_SITE_SETTINGS.googleMapUrl,
            banners: parsed.banners || DEFAULT_SITE_SETTINGS.banners,
            promoBanner: parsed.promoBanner || DEFAULT_SITE_SETTINGS.promoBanner,
            customerReviews: parsed.customerReviews || DEFAULT_SITE_SETTINGS.customerReviews,
            instagramFeed: parsed.instagramFeed || DEFAULT_SITE_SETTINGS.instagramFeed,
            trustBadges: parsed.trustBadges || DEFAULT_SITE_SETTINGS.trustBadges,
            footerBrandDescription: parsed.footerBrandDescription || DEFAULT_SITE_SETTINGS.footerBrandDescription,
            copyrightText: parsed.copyrightText || DEFAULT_SITE_SETTINGS.copyrightText,
          };
          setSiteSettings(merged);
        }
      } catch (e) {
        console.error('Failed to load products context', e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadAllData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // 1. High capacity IndexedDB storage
    idbSet('jeansbd_products', products);
    idbSet('jeansbd_categories', categories);
    idbSet('jeansbd_settings', siteSettings);

    // 2. LocalStorage backup with quota guard
    try {
      localStorage.setItem('jeansbd_products', JSON.stringify(products));
      localStorage.setItem('jeansbd_categories', JSON.stringify(categories));
      localStorage.setItem('jeansbd_settings', JSON.stringify(siteSettings));
    } catch (e) {
      // quota safeguard
    }
  }, [products, categories, siteSettings, isLoaded]);

  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...prodData,
      id: generateProductId(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').insert({
          id: newProduct.id,
          name: newProduct.name,
          name_bn: newProduct.titleBn || '',
          slug: newProduct.slug,
          gender: newProduct.gender,
          fit: newProduct.fit,
          price: newProduct.price,
          discount_price: newProduct.discountPrice || null,
          discount_percentage: newProduct.discountPercentage || 0,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images || [],
          description: newProduct.description,
          details: newProduct.details || [],
          fabric_care: newProduct.fabricCare || [],
          is_active: true,
          is_featured: !!newProduct.isFeatured,
          is_new_arrival: !!newProduct.isNewArrival,
          is_best_seller: !!newProduct.isBestSeller,
          is_on_sale: !!newProduct.isOnSale,
          total_stock: newProduct.totalStock || 0,
          tags: newProduct.tags || [],
        });
      } catch (e) {
        console.error('Supabase addProduct error:', e);
      }
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.name) payload.name = updates.name;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.discountPrice !== undefined) payload.discount_price = updates.discountPrice;
        if (updates.discountPercentage !== undefined) payload.discount_percentage = updates.discountPercentage;
        if (updates.thumbnail) payload.thumbnail = updates.thumbnail;
        if (updates.images) payload.images = updates.images;
        if (updates.description) payload.description = updates.description;
        if (updates.totalStock !== undefined) payload.total_stock = updates.totalStock;

        if (Object.keys(payload).length > 0) {
          await supabase.from('products').update(payload).eq('id', id);
        }
      } catch (e) {
        console.error('Supabase updateProduct error:', e);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteProduct error:', e);
      }
    }
  };

  const syncLocalProductsToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: 'Supabase URL and Anon Key are not configured yet. Add them to .env or Vercel Environment Variables.',
      };
    }

    try {
      let count = 0;
      for (const p of products) {
        const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)
          ? p.id
          : generateProductId();

        const { error } = await supabase.from('products').upsert({
          id: validId,
          name: p.name,
          name_bn: p.titleBn || '',
          slug: p.slug,
          gender: p.gender,
          fit: p.fit,
          price: p.price,
          discount_price: p.discountPrice || null,
          discount_percentage: p.discountPercentage || 0,
          thumbnail: p.thumbnail,
          images: p.images || [],
          description: p.description,
          details: p.details || [],
          fabric_care: p.fabricCare || [],
          is_active: true,
          is_featured: !!p.isFeatured,
          is_new_arrival: !!p.isNewArrival,
          is_best_seller: !!p.isBestSeller,
          is_on_sale: !!p.isOnSale,
          total_stock: p.totalStock || 0,
          tags: p.tags || [],
        });

        if (!error) count++;
      }
      return { success: true, count };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Sync failed' };
    }
  }, [products]);

  const addReview = (productId: string, reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const newReview: ProductReview = {
          ...reviewData,
          id: `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        const currentReviews = (prod as any).reviews || [];
        const newReviews = [newReview, ...currentReviews];
        const newRating =
          Number(
            (
              (prod.rating * prod.reviewCount + reviewData.rating) /
              (prod.reviewCount + 1)
            ).toFixed(1)
          ) || 5.0;

        return {
          ...prod,
          rating: newRating,
          reviewCount: prod.reviewCount + 1,
          reviews: newReviews,
        };
      })
    );
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        siteSettings,
        isCloudConnected: isSupabaseConfigured,
        updateSiteSettings,
        getProductBySlug,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        addCategory,
        updateCategory,
        deleteCategory,
        quickViewProduct,
        setQuickViewProduct,
        syncLocalProductsToSupabase,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
