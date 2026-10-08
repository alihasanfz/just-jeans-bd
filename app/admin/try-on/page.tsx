'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Camera,
  ShoppingBag,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Eye,
  ShieldCheck,
  Server,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { Product, GarmentType } from '@/types';
import {
  getTryOnAggregatedMetrics,
  TryOnAggregatedMetrics,
} from '@/lib/utils/tryonAnalytics';
import VirtualFittingRoomModal from '@/components/tryon/VirtualFittingRoomModal';
import VirtualTryOnModal from '@/components/VirtualTryOnModal';

export default function AdminTryOnManagementPage() {
  const { products, updateProduct } = useProducts();

  const [metrics, setMetrics] = useState<TryOnAggregatedMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [testingProduct, setTestingProduct] = useState<Product | null>(null);
  const [aiTestingProduct, setAiTestingProduct] = useState<Product | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getTryOnAggregatedMetrics().then(setMetrics);
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.fit || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isEnabled = p.virtualTryOnEnabled !== false;
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'enabled'
        ? isEnabled
        : filterType === 'disabled'
        ? !isEnabled
        : p.garmentType === filterType;

    return matchesSearch && matchesType;
  });

  const totalEnabled = products.filter((p) => p.virtualTryOnEnabled !== false).length;
  const totalDisabled = products.length - totalEnabled;

  const handleToggleProduct = async (product: Product) => {
    setUpdatingId(product.id);
    const newStatus = product.virtualTryOnEnabled === false;
    try {
      await updateProduct(product.id, {
        virtualTryOnEnabled: newStatus,
      });
    } catch (err) {
      console.error('Failed to toggle try-on status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGarmentTypeChange = async (product: Product, type: GarmentType) => {
    setUpdatingId(product.id);
    try {
      await updateProduct(product.id, {
        garmentType: type,
        garmentCategory: type === 'jacket' || type === 'shirt' || type === 't-shirt' || type === 'hoodie' ? 'tops' : 'bottoms',
      });
    } catch (err) {
      console.error('Failed to update garment type:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Computer Vision & AR Studio</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>Virtual Try-On Management</span>
            <span className="bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-normal">
              AI Fitting Room
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time MediaPipe body tracking, garment contour scaling, size simulation, and conversion telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {products[0] && (
            <>
              <button
                onClick={() => setAiTestingProduct(products[0])}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Test AI Try-On (VTON)</span>
              </button>

              <button
                onClick={() => setTestingProduct(products[0])}
                className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow transition active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-purple-400" />
                <span>Live AR Camera</span>
              </button>
            </>
          )}

          <Link
            href="/admin/products?action=add"
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enabled */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Active Garments</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalEnabled}</span>
            <span className="text-xs font-bold text-slate-400">/ {products.length} Products</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-medium">
            ✓ Available for Live AR Try-On
          </p>
        </div>

        {/* Card 2: Try-On Sessions */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Fitting Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.totalSessions ?? 0}</span>
            <span className="text-xs font-bold text-slate-400">customer sessions</span>
          </div>
          <p className="text-[10px] text-blue-400 font-medium">
            Pose accuracy: {metrics?.detectionRate ?? 100}%
          </p>
        </div>

        {/* Card 3: Cart Additions */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Try-On Add to Cart</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.addedToCartCount ?? 0}</span>
            <span className="text-xs font-bold text-slate-400">direct additions</span>
          </div>
          <p className="text-[10px] text-amber-400 font-medium">
            From fitting room screen
          </p>
        </div>

        {/* Card 4: Try-On Conversion Rate */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Fitting Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics?.conversionRate ?? 0}%</span>
            <span className="text-xs font-bold text-slate-400">checkout intent</span>
          </div>
          <p className="text-[10px] text-rose-400 font-medium">
            Boosted by interactive AR
          </p>
        </div>
      </div>

      {/* AI Technology & Architecture Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/80 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Dual-Engine Virtual Fitting Architecture</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] px-2 py-0.5 rounded-full font-bold">
                Active & Ready
              </span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Engine 1 (Client Web AR):</strong> 60 FPS real-time MediaPipe 33-landmark pose tracking running directly inside the customer&apos;s browser (zero server compute cost, 100% privacy).
              <br />
              <strong>Engine 2 (AI Photo Try-On API):</strong> Endpoint <code>/api/try-on/ai</code> with configurable provider keys (Fashn.ai, Replicate IDM-VTON, Kolors) and built-in neural compositor fallback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
          <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>HTTPS Camera Secure</span>
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products by name or fit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto text-xs">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'enabled', label: 'Try-On Enabled' },
            { id: 'disabled', label: 'Disabled' },
            { id: 'jacket', label: 'Jackets' },
            { id: 'jeans', label: 'Jeans/Pants' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterType === tab.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table with Try-On Configuration */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Product & Image</th>
                <th className="px-5 py-3.5">Category & Fit</th>
                <th className="px-5 py-3.5">Garment AR Model Type</th>
                <th className="px-5 py-3.5">Virtual Try-On Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.map((p) => {
                const isEnabled = p.virtualTryOnEnabled !== false;
                const currentType: GarmentType = p.garmentType || (p.fit === 'Denim Jacket' ? 'jacket' : 'jeans');
                const isUpdating = updatingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Product & Thumb */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail || p.images[0]}
                          alt={p.name}
                          className="w-12 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate max-w-xs">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ৳{p.price.toLocaleString()} • SKU: {p.slug.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Fit */}
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-bold text-white uppercase text-[11px]">
                          {p.fit}
                        </span>
                        <p className="text-[10px] text-slate-400">{p.gender}</p>
                      </div>
                    </td>

                    {/* Garment Type Dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={currentType}
                        onChange={(e) => handleGarmentTypeChange(p, e.target.value as GarmentType)}
                        disabled={isUpdating}
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                      >
                        <option value="jacket">Denim Jacket (Top/Outerwear)</option>
                        <option value="shirt">Denim Shirt (Top)</option>
                        <option value="t-shirt">T-Shirt (Top)</option>
                        <option value="hoodie">Hoodie (Top)</option>
                        <option value="jeans">Jeans / Denim Pants (Bottoms)</option>
                        <option value="pants">Casual Pants (Bottoms)</option>
                      </select>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(p)}
                        disabled={isUpdating}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition ${
                          isEnabled
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                            : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{isEnabled ? 'Enabled ✓' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAiTestingProduct(p)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition active:scale-95 shadow"
                          title="Test AI Photorealistic Try-On (VTON)"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Try-On</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTestingProduct(p)}
                          className="bg-purple-600/90 hover:bg-purple-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition active:scale-95 shadow"
                          title="Test AR Camera Fitting Room"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>AR Camera</span>
                        </button>

                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition"
                          title="View live product page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No products found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: AI Virtual Try-On (IDM-VTON) */}
      {aiTestingProduct && (
        <VirtualTryOnModal
          product={aiTestingProduct}
          isOpen={!!aiTestingProduct}
          onClose={() => setAiTestingProduct(null)}
        />
      )}

      {/* Modal: Virtual Fitting Room Preview / Tester (AR MediaPipe) */}
      {testingProduct && (
        <VirtualFittingRoomModal
          product={testingProduct}
          isOpen={!!testingProduct}
          onClose={() => setTestingProduct(null)}
        />
      )}
    </div>
  );
}
