'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
  Truck,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const { orders } = useOrder();
  const { wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  const profile = {
    fullName: 'Tanvir Hossain',
    email: 'tanvir@gmail.com',
    phone: '+880 1711-223344',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    joinedDate: 'September 2026',
  };

  return (
    <div className="bg-slate-50/50 py-10 lg:py-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
        {/* Profile Card Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center border-2 border-white/20">
              TH
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl font-bold">{profile.fullName}</h1>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{profile.phone} • {profile.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {orders.length}
              </span>
            </button>

            <Link
              href="/account/wishlist"
              className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Saved Wishlist</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                {wishlistCount}
              </span>
            </Link>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Delivery Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight mb-4">
                  Order History ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                    <p className="text-xs text-slate-500">No previous orders found.</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900">
                              Order #{order.orderNumber}
                            </span>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {order.orderStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs font-black text-slate-900 block">
                            {formatPrice(order.totalAmount)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-12 rounded-lg object-cover bg-slate-100" />
                              <div>
                                <span className="font-bold text-slate-900">{item.name}</span>
                                <p className="text-slate-400 text-[11px]">
                                  Waist: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{order.delivery.courierCompany || 'Steadfast Courier'}</span>
                        </div>

                        <Link
                          href={`/track-order?order=${order.orderNumber}&phone=${order.customer.phone}`}
                          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>Live Tracking</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight mb-2">
                  Saved Delivery Address
                </h3>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Home (Primary)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Default</span>
                  </div>
                  <p className="text-slate-700">Tanvir Hossain (+880 1711-223344)</p>
                  <p className="text-slate-600">House 14, Flat 4B, Road 27, Dhanmondi, Dhaka</p>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight mb-4">
                  Profile Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase">Full Name</label>
                    <input
                      type="text"
                      defaultValue={profile.fullName}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase">Phone</label>
                    <input
                      type="text"
                      defaultValue={profile.phone}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase">Email</label>
                    <input
                      type="email"
                      defaultValue={profile.email}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
