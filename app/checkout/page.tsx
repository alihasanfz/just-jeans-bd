'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cartContext';
import { useOrder } from '@/lib/store/orderContext';
import { BANGLADESH_DISTRICTS, formatPrice } from '@/lib/utils';
import { PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
    district,
    setDistrict,
  } = useCart();
  const { createOrder } = useOrder();

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Checkout coupon input
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput.trim());
    setCouponFeedback(res);
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-slate-400">
          <Truck className="w-10 h-10 stroke-1 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">No Items in Checkout</h2>
        <p className="text-sm text-slate-500 mb-6">Please add your favorite denim pairs to the bag before proceeding.</p>
        <Link href="/shop" className="bg-slate-950 hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg inline-block">
          Browse Denim Collections
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017xxxxxxxx)');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your complete delivery street address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order items
      const orderItems = cart.map((item) => ({
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: item.productId,
        productSlug: item.productSlug,
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const newOrder = createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          district,
          area: area.trim() || district,
          address: address.trim(),
          notes: notes.trim() || undefined,
        },
        items: orderItems,
        subtotal,
        discount: discountAmount,
        deliveryCharge,
        totalAmount,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        paymentTransactionId:
          paymentMethod === 'cod'
            ? undefined
            : `${paymentMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
        orderStatus: 'Confirmed',
        delivery: {
          courierCompany: district.toLowerCase().includes('dhaka') ? 'Steadfast Courier' : 'Pathao Express',
          deliveryCharge,
          deliveryStatus: 'Pending Dispatch',
        },
      });

      // Clear cart
      clearCart();

      // Redirect to confirmation success page
      router.push(`/checkout/success/${newOrder.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] py-10 lg:py-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-2 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fast & Secure Bangladeshi Ordering</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight font-display">
              Express Checkout
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Confirm your delivery address and preferred payment method to place your order.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Customer & Delivery Info (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Contact & Shipping Details */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-black text-sm flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h2 className="font-black text-base text-slate-900 uppercase tracking-wider">
                        Delivery Information
                      </h2>
                      <span className="text-[11px] text-slate-400">Where should we deliver your denim parcel?</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ashfaqur Rahman"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01700000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        District (City) *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      >
                        {BANGLADESH_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist} {dist === 'Dhaka' ? '(Inside Dhaka - ৳80)' : '(Outside Dhaka - ৳150)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Thana / Area / Landmark *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dhanmondi / Uttara / GEC Circle"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House number, Road number, Sector/Block, Flat/Floor details"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Delivery Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Call before delivery"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-black text-sm flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h2 className="font-black text-base text-slate-900 uppercase tracking-wider">
                        Select Payment Method
                      </h2>
                      <span className="text-[11px] text-slate-400">Choose your preferred payment gateway</span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* COD Option */}
                    <label
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/10 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                            Most Popular
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Check your jeans parcel in person and pay cash to the rider at your doorstep. Zero advance payment required.
                        </p>
                      </div>
                    </label>

                    {/* bKash Option */}
                    <label
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'bkash'
                          ? 'border-[#e2136e] bg-pink-50/40 ring-4 ring-pink-500/10 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="mt-1 text-[#e2136e] focus:ring-[#e2136e] w-4 h-4 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">
                            bKash Online Payment
                          </span>
                          <span className="bg-[#e2136e] text-white font-black text-xs px-2.5 py-0.5 rounded-md shadow-xs">
                            bKash
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Seamless payment via official bKash Merchant Payment with instant SMS confirmation.
                        </p>
                      </div>
                    </label>

                    {/* Nagad Option */}
                    <label
                      className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'nagad'
                          ? 'border-[#f7941d] bg-orange-50/40 ring-4 ring-orange-500/10 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'nagad'}
                        onChange={() => setPaymentMethod('nagad')}
                        className="mt-1 text-[#f7941d] focus:ring-[#f7941d] w-4 h-4 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">
                            Nagad Online Payment
                          </span>
                          <span className="bg-[#f7941d] text-white font-black text-xs px-2.5 py-0.5 rounded-md shadow-xs">
                            Nagad
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Instant wallet payment via Nagad gateway with immediate order verification.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Pricing Summary (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6 sticky top-28">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-lg text-slate-950 uppercase tracking-tight font-display">
                    Order Summary
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)} Items
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-3.5 max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200/60" />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Size: <span className="font-bold text-slate-700">{item.size}</span> • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-black text-slate-900 shrink-0 font-display">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span>
                          Code Applied: <strong>{appliedCoupon.code}</strong> (
                          {appliedCoupon.discountType === 'percentage'
                            ? `-${appliedCoupon.discountValue}%`
                            : `-৳${appliedCoupon.discountValue}`}
                          )
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon Code (e.g. JEANS10)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponFeedback && (
                        <div className={`text-[11px] font-semibold ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {couponFeedback.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Calculations */}
                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount Savings</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charge ({district})</span>
                    <span className="font-bold text-slate-900">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600 uppercase font-black">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-950 border-t border-slate-200 pt-3 font-display">
                    <span>Total Payable</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 hover:bg-blue-600 text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-slate-950/20 transition-all duration-300 active:scale-[0.98] disabled:bg-slate-400 group"
                >
                  {isSubmitting ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-[11px] text-center text-slate-400 space-y-1">
                  <div>🔒 Safe & 256-Bit SSL Encrypted Checkout</div>
                  <div>📦 Fast courier dispatch with SMS tracking notification</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
