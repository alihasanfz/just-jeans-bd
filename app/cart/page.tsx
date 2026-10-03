'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/lib/store/cartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingProgress,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
          <ShoppingBag className="w-12 h-12 stroke-1" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
          You haven't added any denim items to your cart yet. Browse our trending collections to find your perfect pair.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 transition-all"
        >
          <span>Explore Jeans Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 py-10 lg:py-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review your items and proceed to fast checkout
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              {freeShippingProgress.qualified ? (
                <span className="text-emerald-600 font-bold">
                  Congratulations! You unlocked FREE Nationwide Delivery! 🎉
                </span>
              ) : (
                <span>
                  Add <strong className="text-slate-900">{formatPrice(freeShippingProgress.remaining)}</strong> more to get <strong className="text-blue-600">FREE DELIVERY</strong>
                </span>
              )}
            </div>
            <span className="font-bold text-slate-600">{Math.round(freeShippingProgress.percentage)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShippingProgress.qualified ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${freeShippingProgress.percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                        Waist: {item.size}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                        {item.color}
                      </span>
                    </div>
                    <div className="font-black text-sm text-slate-900 mt-2">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-1.5 text-xs font-bold text-slate-900 min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-base text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-0.5 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Tag className="w-4 h-4" />
                  <span>{appliedCoupon.code} (-{formatPrice(discountAmount)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. JEANS10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <p
                    className={`text-[11px] font-medium ${
                      couponFeedback.success ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </form>
            )}

            {/* Price Calculations */}
            <div className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Savings</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-slate-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 uppercase font-black">FREE</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-950 border-t border-slate-200 pt-3">
                <span>Estimated Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Security Guarantee */}
            <div className="space-y-2 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Cash on Delivery & Instant Mobile Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-500" />
                <span>7 Days Size Replacement Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
