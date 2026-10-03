'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/lib/data/mockData';
import { formatPrice } from '@/lib/utils';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

export default function AdminCouponsPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(1500);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeansbd_coupons');
      if (saved) {
        setCoupons(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load coupons from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save coupons to storage', e);
    }
  }, [coupons, isLoaded]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      isActive: true,
      usageCount: 0,
    };
    setCoupons([newCoupon, ...coupons]);
    setCode('');
    setIsModalOpen(false);
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Promotional Coupons & Discounts
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Create percentage-based or flat discount vouchers for special denim campaigns
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className={`p-6 rounded-3xl border transition-all ${
              c.isActive
                ? isDark
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-white border-slate-200 shadow-sm'
                : isDark
                ? 'bg-slate-950/40 border-slate-900 opacity-60'
                : 'bg-slate-100/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-500" />
                <span className={`font-black text-lg font-mono tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {c.code}
                </span>
              </div>
              <button
                onClick={() => toggleCouponStatus(c.id)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {c.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className={`space-y-1.5 text-xs mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Discount:</span>
                <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT OFF`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Minimum Order:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{formatPrice(c.minPurchase)}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Expires on:</span>
                <span>{c.expiryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Times Used:</span>
                <span className="font-bold text-blue-500">{c.usageCount} times</span>
              </div>
            </div>

            <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
              <button
                onClick={() => toggleCouponStatus(c.id)}
                className={`text-xs font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {c.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => deleteCoupon(c.id)}
                className="text-red-500 hover:text-red-600 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`font-black text-base uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>New Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)} className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Min Order Amount (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(Number(e.target.value))}
                  className={`w-full border rounded-xl px-3.5 py-2.5 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className={`pt-3 border-t flex justify-end gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
