'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '@/types';
import { INITIAL_COUPONS, DEFAULT_SITE_SETTINGS } from '@/lib/data/mockData';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  setDistrict: (district: string) => void;
  district: string;
  totalAmount: number;
  totalItemsCount: number;
  freeShippingProgress: {
    threshold: number;
    remaining: number;
    percentage: number;
    qualified: boolean;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [district, setDistrict] = useState('Dhaka');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('jeansbd_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_cart', JSON.stringify(cart));
      if (appliedCoupon) {
        localStorage.setItem('jeansbd_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('jeansbd_coupon');
      }
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart, appliedCoupon, isLoaded]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.maxStock) }
            : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.min(quantity, item.maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const getAvailableCoupons = (): Coupon[] => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jeansbd_coupons');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved coupons', e);
      }
    }
    return INITIAL_COUPONS;
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const availableCoupons = getAvailableCoupons();
    const found = availableCoupons.find((c) => c.code === cleanCode && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or expired promo code' };
    }

    if (subtotal < found.minPurchase) {
      return {
        success: false,
        message: `Minimum order amount for this coupon is ৳${found.minPurchase}`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon "${cleanCode}" applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      const calc = (subtotal * appliedCoupon.discountValue) / 100;
      discountAmount = appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const threshold = DEFAULT_SITE_SETTINGS.freeShippingThreshold;
  const isDhaka = district.toLowerCase().includes('dhaka');
  const baseDelivery = isDhaka
    ? DEFAULT_SITE_SETTINGS.deliveryChargeDhaka
    : DEFAULT_SITE_SETTINGS.deliveryChargeOutsideDhaka;
  
  const deliveryCharge = subtotal >= threshold ? 0 : baseDelivery;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const remaining = Math.max(0, threshold - subtotal);
  const percentage = Math.min(100, (subtotal / threshold) * 100);
  const qualified = subtotal >= threshold;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        deliveryCharge,
        setDistrict,
        district,
        totalAmount,
        totalItemsCount,
        freeShippingProgress: {
          threshold,
          remaining,
          percentage,
          qualified,
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
