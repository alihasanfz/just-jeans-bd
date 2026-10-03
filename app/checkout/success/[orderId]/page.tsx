'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  ShoppingBag,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { formatPrice } from '@/lib/utils';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { getOrderById, getOrderByOrderNumber } = useOrder();

  const order = getOrderById(orderId) || getOrderByOrderNumber(orderId);

  useEffect(() => {
    // Fire festive celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Order Information</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Order ID #{orderId} has been successfully recorded in our system.
        </p>
        <Link href="/track-order" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs">
          Go to Order Tracking
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50/50 py-12 lg:py-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/80 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Top Banner */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
              Order Confirmed & Verified
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              We have received your order. Our warehouse team is preparing your package for shipment.
            </p>
          </div>

          {/* Key Order Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Order Number</span>
              <span className="font-black text-slate-900 text-sm">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Payment Method</span>
              <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Total Amount</span>
              <span className="font-black text-blue-600 text-sm">{formatPrice(order.totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Current Status</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Delivery & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <h3 className="font-black uppercase tracking-wider text-slate-900 mb-2">
                Delivery Address
              </h3>
              <div className="space-y-1 text-slate-600">
                <p className="font-bold text-slate-900">{order.customer.fullName}</p>
                <p>{order.customer.phone}</p>
                <p>{order.customer.address}</p>
                <p>{order.customer.area}, {order.customer.district}</p>
              </div>
            </div>

            <div>
              <h3 className="font-black uppercase tracking-wider text-slate-900 mb-2">
                Estimated Delivery
              </h3>
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>
                    {order.customer.district.toLowerCase().includes('dhaka')
                      ? 'Within 24 to 48 hours (Dhaka Metro)'
                      : 'Within 48 to 72 hours (Nationwide Delivery)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Assigned Courier: {order.delivery.courierCompany || 'Steadfast Courier'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-black uppercase tracking-wider text-slate-900 mb-4 text-xs">
              Purchased Denim
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-14 rounded-xl object-cover bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      <p className="text-slate-400">
                        Waist: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-600 mt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 print:hidden">
            <Link
              href={`/track-order?order=${order.orderNumber}&phone=${order.customer.phone}`}
              className="flex-1 bg-slate-950 hover:bg-black text-white py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Track Live Delivery Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3.5 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
