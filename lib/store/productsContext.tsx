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

function mapDbProduct(row: any): Product {
  return {
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
  };
}

function mapDbCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    gender: (row.gender as any) || 'men',
    description: row.description || '',
    image: row.image_url || row.image || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    itemCount: row.item_count || 12,
  };
}

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
  isCloudConnected: boolean;
  isLoaded: boolean;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  syncCategoriesToSupabase: () => Promise<{ success: boolean; count?: number; message?: string }>;
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
        let loadedFromSupabase = false;

        // 1. Try Supabase Cloud Database first if configured
        if (isSupabaseConfigured) {
          try {
            const { data: dbProducts, error } = await supabase
              .from('products')
              .select('*')
              .eq('is_active', true)
              .order('created_at', { ascending: false });

            if (!error && Array.isArray(dbProducts) && dbProducts.length > 0) {
              const mapped = dbProducts.map(mapDbProduct);
              setProducts(mapped);
              await idbSet('jeansbd_products', mapped);
              loadedFromSupabase = true;
            }

            // Fetch categories from Supabase
            const { data: dbCats, error: catError } = await supabase
              .from('categories')
              .select('*')
              .eq('is_active', true)
              .order('display_order', { ascending: true });

            if (!catError && Array.isArray(dbCats) && dbCats.length > 0) {
              const mappedCats = dbCats.map(mapDbCategory);
              setCategories(mappedCats);
              await idbSet('jeansbd_categories', mappedCats);
            } else if (!catError && Array.isArray(dbCats) && dbCats.length === 0) {
              // Auto-seed initial categories to Supabase
              const toInsert = INITIAL_CATEGORIES.map((cat, idx) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                gender: cat.gender,
                description: cat.description,
                image_url: cat.image,
                display_order: idx + 1,
                is_active: true,
              }));
              await supabase.from('categories').insert(toInsert);
            }
          } catch (dbErr) {
            console.warn('Supabase fetch failed, trying local storage cache', dbErr);
          }
        }

        // 2. Try IndexedDB if Supabase didn't have products (purge old demo products)
        if (!loadedFromSupabase) {
          const idbProds = await idbGet<Product[]>('jeansbd_products');
          const cleanIdbProds = (idbProds || []).filter(
            (p) => !p.id?.startsWith('prod-00') && !p.slug?.includes('vintage-washed-slim')
          );

          if (cleanIdbProds.length > 0) {
            setProducts(cleanIdbProds);
          } else {
            const savedProds = localStorage.getItem('jeansbd_products');
            let cleanSaved: Product[] = [];
            if (savedProds) {
              try {
                const parsed = JSON.parse(savedProds);
                if (Array.isArray(parsed)) {
                  cleanSaved = parsed.filter(
                    (p) => !p.id?.startsWith('prod-00') && !p.slug?.includes('vintage-washed-slim')
                  );
                }
              } catch (e) {}
            }

            if (cleanSaved.length > 0) {
              setProducts(cleanSaved);
            } else {
              // Completely clear the old demo cache from browser memory
              setProducts([]);
              await idbSet('jeansbd_products', []);
              try {
                localStorage.removeItem('jeansbd_products');
              } catch (e) {}
            }
          }
        }

        const idbCats = await idbGet<Category[]>('jeansbd_categories');
        if (idbCats && Array.isArray(idbCats) && idbCats.length > 0) {
          setCategories(idbCats);
        } else {
          const savedCats = localStorage.getItem('jeansbd_categories');
          if (savedCats) {
            try {
              setCategories(JSON.parse(savedCats));
            } catch (e) {}
          }
        }

        let loadedSettingsFromCloud = false;
        if (isSupabaseConfigured) {
          try {
            const { data: dbSettings, error: setErr } = await supabase
              .from('site_settings')
              .select('*')
              .eq('id', 1)
              .maybeSingle();

            if (!setErr && dbSettings && dbSettings.data && Object.keys(dbSettings.data).length > 0) {
              const merged: SiteSettings = {
                ...DEFAULT_SITE_SETTINGS,
                ...dbSettings.data,
              };
              setSiteSettings(merged);
              await idbSet('jeansbd_settings', merged);
              loadedSettingsFromCloud = true;
            } else if (!setErr && !dbSettings) {
              // Auto-seed default site settings to Supabase
              await supabase.from('site_settings').upsert({
                id: 1,
                data: DEFAULT_SITE_SETTINGS,
                updated_at: new Date().toISOString(),
              });
            }
          } catch (e) {
            console.warn('Supabase site_settings fetch error', e);
          }
        }

        if (!loadedSettingsFromCloud) {
          const idbSettings = await idbGet<SiteSettings>('jeansbd_settings');
          if (idbSettings && typeof idbSettings === 'object' && Object.keys(idbSettings).length > 0) {
            const merged: SiteSettings = {
              ...DEFAULT_SITE_SETTINGS,
              ...idbSettings,
            };
            setSiteSettings(merged);
          } else {
            const savedSettings = localStorage.getItem('jeansbd_settings');
            if (savedSettings) {
              try {
                const parsed = JSON.parse(savedSettings);
                const merged: SiteSettings = {
                  ...DEFAULT_SITE_SETTINGS,
                  ...parsed,
                };
                setSiteSettings(merged);
              } catch (e) {}
            }
          }
        }
      } catch (e) {
        console.error('Failed to load products context', e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadAllData();

    // 3. Realtime Supabase subscription across all devices
    let channel: any;
    let catChannel: any;
    let settingsChannel: any;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel('public-products-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const inserted = mapDbProduct(payload.new);
                setProducts((prev) => {
                  if (prev.some((p) => p.id === inserted.id)) return prev;
                  return [inserted, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updated = mapDbProduct(payload.new);
                setProducts((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p))
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = (payload.old as any).id;
                setProducts((prev) => prev.filter((p) => p.id !== deletedId));
              }
            }
          )
          .subscribe();

        catChannel = supabase
          .channel('public-categories-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'categories' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const inserted = mapDbCategory(payload.new);
                setCategories((prev) => {
                  if (prev.some((c) => c.id === inserted.id)) return prev;
                  return [...prev, inserted];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updated = mapDbCategory(payload.new);
                setCategories((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = (payload.old as any).id;
                setCategories((prev) => prev.filter((c) => c.id !== deletedId));
              }
            }
          )
          .subscribe();

        settingsChannel = supabase
          .channel('public-settings-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_settings' },
            (payload) => {
              if (payload.new && (payload.new as any).data) {
                const incoming = (payload.new as any).data;
                setSiteSettings((prev) => ({ ...prev, ...incoming }));
                idbSet('jeansbd_settings', incoming);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription failed:', err);
      }
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (catChannel) supabase.removeChannel(catChannel);
      if (settingsChannel) supabase.removeChannel(settingsChannel);
    };
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

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);

    // 1. High capacity IndexedDB storage for base64 images without quota errors
    await idbSet('jeansbd_settings', updated);

    // 2. Safe LocalStorage write with quota guard
    try {
      localStorage.setItem('jeansbd_settings', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage quota limit reached; saved to IndexedDB & Cloud');
    }

    // 3. Supabase Cloud Database sync so all devices and live Vercel store update immediately
    if (isSupabaseConfigured) {
      try {
        const { error: sbError } = await supabase.from('site_settings').upsert({
          id: 1,
          data: updated,
          updated_at: new Date().toISOString(),
        });
        if (sbError) {
          console.error('Supabase updateSiteSettings error:', sbError);
          throw new Error(sbError.message || 'Supabase save error');
        }
      } catch (err: any) {
        console.error('Supabase updateSiteSettings exception:', err);
        throw err;
      }
    }
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
          subtitle: newProduct.subtitle || '',
          slug: newProduct.slug,
          category: newProduct.category || '',
          gender: newProduct.gender,
          fit: newProduct.fit,
          wash_color: newProduct.washColor || '',
          fabric_composition: newProduct.fabricComposition || '',
          price: newProduct.price,
          discount_price: newProduct.discountPrice || null,
          discount_percentage: newProduct.discountPercentage || 0,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images || [],
          description: newProduct.description || '',
          details: newProduct.details || [],
          fabric_care: newProduct.fabricCare || [],
          is_active: true,
          is_featured: !!newProduct.isFeatured,
          is_new_arrival: !!newProduct.isNewArrival,
          is_best_seller: !!newProduct.isBestSeller,
          is_on_sale: !!newProduct.isOnSale,
          total_stock: newProduct.totalStock || 0,
          tags: newProduct.tags || [],
          variants: newProduct.variants || [],
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
        if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.discountPrice !== undefined) payload.discount_price = updates.discountPrice;
        if (updates.discountPercentage !== undefined) payload.discount_percentage = updates.discountPercentage;
        if (updates.thumbnail) payload.thumbnail = updates.thumbnail;
        if (updates.images) payload.images = updates.images;
        if (updates.description) payload.description = updates.description;
        if (updates.totalStock !== undefined) payload.total_stock = updates.totalStock;
        if (updates.variants) payload.variants = updates.variants;

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
        const validId = p.id || generateProductId();

        const { error } = await supabase.from('products').upsert({
          id: validId,
          name: p.name,
          name_bn: p.titleBn || '',
          subtitle: p.subtitle || '',
          slug: p.slug,
          category: p.category || '',
          gender: p.gender,
          fit: p.fit,
          wash_color: p.washColor || '',
          fabric_composition: p.fabricComposition || '',
          price: p.price,
          discount_price: p.discountPrice || null,
          discount_percentage: p.discountPercentage || 0,
          thumbnail: p.thumbnail,
          images: p.images || [],
          description: p.description || '',
          details: p.details || [],
          fabric_care: p.fabricCare || [],
          is_active: true,
          is_featured: !!p.isFeatured,
          is_new_arrival: !!p.isNewArrival,
          is_best_seller: !!p.isBestSeller,
          is_on_sale: !!p.isOnSale,
          total_stock: p.totalStock || 0,
          tags: p.tags || [],
          variants: p.variants || [],
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

  const addCategory = async (category: Category) => {
    setCategories((prev) => [...prev, category]);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('categories').insert({
          id: category.id,
          name: category.name,
          slug: category.slug,
          gender: category.gender,
          description: category.description,
          image_url: category.image,
          display_order: 99,
          is_active: true,
        });
      } catch (err) {
        console.error('Supabase addCategory error:', err);
      }
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    if (isSupabaseConfigured) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.gender !== undefined) payload.gender = updates.gender;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.image !== undefined) payload.image_url = updates.image;
        await supabase.from('categories').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateCategory error:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteCategory error:', err);
      }
    }
  };

  const syncCategoriesToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return { success: false, message: 'Cloud database not configured' };
    try {
      let count = 0;
      for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        const { error } = await supabase.from('categories').upsert({
          id: c.id,
          name: c.name,
          slug: c.slug,
          gender: c.gender,
          description: c.description,
          image_url: c.image,
          display_order: i + 1,
          is_active: true,
          updated_at: new Date().toISOString(),
        });
        if (!error) count++;
      }
      return { success: true, count };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Sync failed' };
    }
  }, [categories]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        siteSettings,
        isCloudConnected: isSupabaseConfigured,
        isLoaded,
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
        syncCategoriesToSupabase,
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
