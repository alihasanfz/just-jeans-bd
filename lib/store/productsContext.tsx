'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductReview, Category, SiteSettings } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEFAULT_SITE_SETTINGS } from '@/lib/data/mockData';

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
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
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProds = localStorage.getItem('jeansbd_products');
      if (savedProds) setProducts(JSON.parse(savedProds));

      const savedCats = localStorage.getItem('jeansbd_categories');
      if (savedCats) setCategories(JSON.parse(savedCats));

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
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_products', JSON.stringify(products));
      localStorage.setItem('jeansbd_categories', JSON.stringify(categories));
      localStorage.setItem('jeansbd_settings', JSON.stringify(siteSettings));
    } catch (e) {
      console.error('Failed to save products context', e);
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

  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

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
