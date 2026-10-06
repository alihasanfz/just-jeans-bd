'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Tag,
  Trash2,
  Check,
  X,
  Edit,
  Copy,
  Ticket,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  DollarSign,
  Percent,
  Flame,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/lib/data/mockData';
import { formatPrice } from '@/lib/utils';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

export default function AdminCouponsPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');

  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(1500);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [isActive, setIsActive] = useState(true);
  const [usageCount, setUsageCount] = useState<number>(0);

  // Delete modal state
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<Coupon | null>(null);

  // Feedback & Copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Load coupons from storage
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

  // Save coupons to storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save coupons to storage', e);
    }
  }, [coupons, isLoaded]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingCouponId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinPurchase(1500);
    setMaxDiscount(undefined);
    setExpiryDate('2027-12-31');
    setIsActive(true);
    setUsageCount(0);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: Coupon) => {
    setModalMode('edit');
    setEditingCouponId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinPurchase(coupon.minPurchase);
    setMaxDiscount(coupon.maxDiscount);
    setExpiryDate(coupon.expiryDate || '2027-12-31');
    setIsActive(coupon.isActive);
    setUsageCount(coupon.usageCount || 0);
    setIsModalOpen(true);
  };

  // Generate random promo code suggestion
  const handleGenerateRandomCode = () => {
    const prefixes = ['DENIM', 'JEANS', 'VINTAGE', 'LUXE', 'RAW', 'INDIGO', 'SPECIAL'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const val = discountValue || 15;
    setCode(`${p}${val}`);
  };

  // Submit Create or Edit Form
  const handleSubmitCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('error', 'Please provide a valid coupon code.');
      return;
    }

    if (modalMode === 'create') {
      // Check duplicate
      if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
        showToast('error', `A coupon with code "${cleanCode}" already exists.`);
        return;
      }

      const newCoupon: Coupon = {
        id: `c-${Date.now()}`,
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue) || 1,
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        expiryDate,
        isActive,
        usageCount: 0,
      };

      setCoupons([newCoupon, ...coupons]);
      showToast('success', `Coupon "${cleanCode}" created successfully!`);
    } else if (modalMode === 'edit' && editingCouponId) {
      // Check duplicate with another coupon
      if (coupons.some((c) => c.id !== editingCouponId && c.code.toUpperCase() === cleanCode)) {
        showToast('error', `Another coupon with code "${cleanCode}" already exists.`);
        return;
      }

      setCoupons((prev) =>
        prev.map((c) => {
          if (c.id !== editingCouponId) return c;
          return {
            ...c,
            code: cleanCode,
            discountType,
            discountValue: Number(discountValue) || 1,
            minPurchase: Number(minPurchase) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
            expiryDate,
            isActive,
            usageCount: Number(usageCount) || 0,
          };
        })
      );
      showToast('success', `Coupon "${cleanCode}" updated successfully!`);
    }

    setIsModalOpen(false);
  };

  // Toggle active status
  const toggleCouponStatus = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isActive;
          showToast('success', `Coupon ${c.code} is now ${nextState ? 'Active' : 'Disabled'}.`);
          return { ...c, isActive: nextState };
        }
        return c;
      })
    );
  };

  // Delete coupon handler
  const handleConfirmDelete = () => {
    if (!deleteConfirmCoupon) return;
    const deletedCode = deleteConfirmCoupon.code;
    setCoupons((prev) => prev.filter((c) => c.id !== deleteConfirmCoupon.id));
    if (editingCouponId === deleteConfirmCoupon.id) {
      setIsModalOpen(false);
    }
    setDeleteConfirmCoupon(null);
    showToast('success', `Coupon "${deletedCode}" has been removed.`);
  };

  // Copy code to clipboard
  const handleCopyCode = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Calculate statistics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const bestCoupon = [...coupons].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0];

  // Filtered coupons
  const filteredCoupons = coupons.filter((c) => {
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    if (typeFilter !== 'all' && c.discountType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchVal = c.discountValue.toString().includes(q);
      return matchCode || matchVal;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl border backdrop-blur-md transition-all animate-bounce-short ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/50'
              : 'bg-rose-950/90 text-rose-300 border-rose-700/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl lg:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Promotional Coupons & Vouchers
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="w-3 h-3" />
              <span>Campaign Engine</span>
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage percentage-based or flat discount vouchers, set minimum cart rules, and control coupon lifecycles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coupons */}
        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Vouchers</span>
            <Ticket className="w-4 h-4 text-blue-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalCoupons}</p>
          <span className="text-[10px] text-slate-400 font-medium">Configured campaigns</span>
        </div>

        {/* Active Campaigns */}
        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase">Active Campaigns</span>
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeCoupons}</p>
          <span className="text-[10px] text-slate-400 font-medium">Ready at checkout</span>
        </div>

        {/* Total Redemptions */}
        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase">Total Redemptions</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalRedemptions}</p>
          <span className="text-[10px] text-slate-400 font-medium">Used by shoppers</span>
        </div>

        {/* Top Performer */}
        <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase">Top Performer</span>
            <Tag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className={`text-xl font-black font-mono mt-2 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {bestCoupon ? bestCoupon.code : 'None'}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            {bestCoupon ? `${bestCoupon.usageCount} orders redeemed` : 'No redemptions yet'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Search coupon code or discount value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-blue-600 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Flat (৳)</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Coupons Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className={`p-8 rounded-3xl border max-w-md mx-auto space-y-3 ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <Ticket className="w-10 h-10 mx-auto opacity-40 text-blue-500" />
              <h3 className="text-base font-black uppercase text-white">No Coupons Found</h3>
              <p className="text-xs">No promotional vouchers match your current search or filter criteria.</p>
              <button
                onClick={handleOpenCreate}
                className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Create First Voucher
              </button>
            </div>
          </div>
        ) : (
          filteredCoupons.map((c) => {
            const isPercent = c.discountType === 'percentage';

            return (
              <div
                key={c.id}
                className={`relative rounded-3xl border transition-all duration-300 group overflow-hidden ${
                  c.isActive
                    ? isDark
                      ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800 hover:border-blue-500/50 shadow-xl shadow-black/40 hover:shadow-blue-500/5'
                      : 'bg-gradient-to-b from-white to-slate-50/80 border-slate-200 hover:border-blue-500/50 shadow-lg shadow-slate-200/50'
                    : isDark
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                {/* Decorative Top Denim Notch / Accent Ribbon */}
                <div
                  className={`h-1.5 w-full ${
                    !c.isActive
                      ? 'bg-slate-700'
                      : isPercent
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600'
                  }`}
                />

                <div className="p-6 space-y-5">
                  {/* Voucher Header: Code & Active Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${
                        isPercent
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-lg font-mono tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {c.code}
                          </span>
                          <button
                            onClick={(e) => handleCopyCode(c.code, e)}
                            title="Copy Voucher Code"
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          {c.discountType} promo
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={(e) => toggleCouponStatus(c.id, e)}
                      title={`Click to ${c.isActive ? 'Deactivate' : 'Activate'}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        c.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span>{c.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>

                  {/* Big Discount Value Display */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Discount Power
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-2xl lg:text-3xl font-black ${
                          isPercent ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {isPercent ? `${c.discountValue}%` : `৳${c.discountValue}`}
                        </span>
                        <span className={`text-xs font-bold uppercase ${
                          isPercent ? 'text-amber-400/80' : 'text-blue-400/80'
                        }`}>
                          {isPercent ? 'OFF Cart' : 'FLAT OFF'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Min. Order
                      </span>
                      <span className={`font-black text-sm block mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatPrice(c.minPurchase)}
                      </span>
                    </div>
                  </div>

                  {/* Voucher Rules List */}
                  <div className="space-y-2 text-xs">
                    {c.maxDiscount && (
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Max Cap:</span>
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Up to ৳{c.maxDiscount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Valid Until:</span>
                      </span>
                      <span className={`font-mono text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {c.expiryDate}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Redemptions:</span>
                      </span>
                      <span className="font-bold text-blue-500">
                        {c.usageCount || 0} times
                      </span>
                    </div>
                  </div>

                  {/* Card Actions Footer: Edit, Toggle, Delete */}
                  <div className={`pt-4 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                          isDark
                            ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                            : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Toggle Quick text */}
                      <button
                        onClick={(e) => toggleCouponStatus(c.id, e)}
                        className={`text-xs font-semibold px-2 py-1 hover:underline transition-colors ${
                          isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteConfirmCoupon(c)}
                      title="Delete Voucher"
                      className={`p-1.5 rounded-xl border transition-all ${
                        isDark
                          ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                          : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE & EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`border rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl space-y-5 my-8 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Campaign Console</span>
                  <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {modalMode === 'create' ? 'Create New Promo Voucher' : `Edit Coupon: ${code}`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Voucher Preview Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-blue-500/30'
                : 'bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                  Live Shopper Preview
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className={`text-xl font-black font-mono tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {code || 'PROMOCODE'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Min spend: ৳{minPurchase || 0} • Expires: {expiryDate}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${
                    discountType === 'percentage' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {discountType === 'percentage' ? `${discountValue}%` : `৳${discountValue}`}
                  </span>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    {discountType === 'percentage' ? 'Discount' : 'Flat Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              {/* Code input with Random Suggestion Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Coupon Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. DENIM20, FLASH10, LUXE500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`w-full border rounded-xl p-2.5 text-xs font-mono font-black uppercase tracking-wider ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Fixed Flat Amount (৳) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === 'percentage' ? 100 : 10000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Min Purchase & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Min Order Amount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    placeholder="e.g. 1500"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Max Discount Cap (৳, Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="No upper limit"
                    value={maxDiscount ?? ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-bold ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Expiry Date & Usage Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Campaign Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {modalMode === 'edit' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Times Redeemed
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={usageCount}
                      onChange={(e) => setUsageCount(Number(e.target.value))}
                      className={`w-full border rounded-xl p-2.5 text-xs font-medium ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActiveCheck"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                      Activate Immediately at Checkout
                    </label>
                  </div>
                )}
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveEditCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="isActiveEditCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                    Enable Coupon for Shoppers (Active Status)
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = coupons.find((c) => c.id === editingCouponId);
                      if (cur) {
                        setIsModalOpen(false);
                        setDeleteConfirmCoupon(cur);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Voucher</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all hover:scale-[1.02]"
                  >
                    {modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Delete Promo Coupon?
                </h3>
                <p className="text-xs text-slate-400">
                  Voucher #{deleteConfirmCoupon.code}
                </p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Are you sure you want to permanently delete coupon <strong>{deleteConfirmCoupon.code}</strong> (
              {deleteConfirmCoupon.discountType === 'percentage'
                ? `${deleteConfirmCoupon.discountValue}% OFF`
                : `৳${deleteConfirmCoupon.discountValue} FLAT`}
              )? Shoppers will no longer be able to apply this discount.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCoupon(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-rose-600/20 transition-colors"
              >
                Yes, Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
