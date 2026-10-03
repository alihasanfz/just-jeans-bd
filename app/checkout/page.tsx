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

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Items in Checkout</h2>
        <p className="text-xs text-slate-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs">
          Browse Denim
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
      setErrorMsg('Please enter a valid 11-digit Bangladeshi mobile number');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your delivery street address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order object
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
    <div className="bg-slate-50/50 py-10 lg:py-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight">
              Express Checkout
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete your shipping address and choose your payment method
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Customer & Delivery Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Contact & Shipping Details */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center">
                      1
                    </div>
                    <h2 className="font-black text-base text-slate-900 uppercase tracking-wider">
                      Delivery Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shakib Al Hasan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        District (City) *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {BANGLADESH_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist} {dist === 'Dhaka' ? '(Inside Dhaka - ৳80)' : '(Outside Dhaka - ৳150)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Thana / Area / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dhanmondi / Uttara / GEC Circle / Chawkbazar"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Complete Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House number, Road name, Flat/Floor number"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery or leave with building security"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center">
                      2
                    </div>
                    <h2 className="font-black text-base text-slate-900 uppercase tracking-wider">
                      Select Payment Method
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* COD */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            Popular
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pay cash to the delivery rider when your jeans parcel arrives at your doorstep.
                        </p>
                      </div>
                    </label>

                    {/* bKash */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'bkash'
                          ? 'border-[#e2136e] bg-pink-50/40 ring-2 ring-pink-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="mt-1 text-pink-600 focus:ring-pink-500 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">bKash Online Payment</span>
                          <span className="bg-[#e2136e] text-white font-black text-xs px-2.5 py-0.5 rounded">
                            bKash
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Instant seamless checkout via official bKash Merchant Payment Gateway.
                        </p>
                      </div>
                    </label>

                    {/* Nagad */}
                    <label
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'nagad'
                          ? 'border-[#f7941d] bg-orange-50/40 ring-2 ring-orange-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'nagad'}
                        onChange={() => setPaymentMethod('nagad')}
                        className="mt-1 text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">Nagad Online Payment</span>
                          <span className="bg-[#f7941d] text-white font-black text-xs px-2.5 py-0.5 rounded">
                            Nagad
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pay directly with Nagad wallet verification.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Submit */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-6 sticky top-28">
                <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                  Your Order ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </h3>

                {/* Items preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt={item.name} className="w-10 h-12 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            Size: {item.size} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-black text-slate-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount ({appliedCoupon?.code})</span>
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
                  <div className="flex justify-between text-lg font-black text-slate-950 border-t border-slate-200 pt-3">
                    <span>Total Payable</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 hover:bg-black text-white py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-950/20 transition-all active:scale-[0.98] disabled:bg-slate-400"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-center text-slate-400 space-y-1">
                  <div>🔒 Safe & 256-Bit SSL Encrypted Checkout</div>
                  <div>📦 Fast courier dispatch with live tracking SMS</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
