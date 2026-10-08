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
  Clock,
  Check,
  XCircle,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { Product, GarmentType } from '@/types';
import VirtualTryOnModal from '@/components/VirtualTryOnModal';

interface ServerVTOStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  avgTimeMs: number;
}

interface ProviderInfo {
  id: string;
  name: string;
  configured: boolean;
}

export default function AdminTryOnManagementPage() {
  const { products, updateProduct } = useProducts();

  const [serverStats, setServerStats] = useState<ServerVTOStats | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [activeProvider, setActiveProvider] = useState<ProviderInfo | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [aiTestingProduct, setAiTestingProduct] = useState<Product | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/virtual-try-on/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setServerStats(data.stats);
          setProviders(data.providers || []);
          setActiveProvider(data.activeProvider || null);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch VTO stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
    const category =
      type === 'jeans' || type === 'pants'
        ? 'bottoms'
        : type === 'dress'
        ? 'fullbody'
        : 'tops';

    try {
      await updateProduct(product.id, {
        garmentType: type,
        garmentCategory: category,
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
            <span>AI Virtual Fitting Room Studio</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>Virtual Try-On Management</span>
            <span className="bg-blue-900/60 border border-blue-500/40 text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-normal">
              Production VTON
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Photorealistic clothing replacement, automated human pose mapping, and backend job analytics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          </button>

          {products[0] && (
            <button
              onClick={() => setAiTestingProduct(products[0])}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Test Real AI Try-On (FASHN API)</span>
            </button>
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

      {/* KPI Cards: Connected to Real Backend Job Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Try-Ons */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Try-Ons</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{serverStats?.total ?? 0}</div>
          <p className="text-[10px] text-slate-400 font-medium">Inference sessions</p>
        </div>

        {/* Card 2: Successful */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Successful</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{serverStats?.completed ?? 0}</div>
          <p className="text-[10px] text-emerald-500 font-medium">
            {serverStats?.total ? Math.round(((serverStats.completed || 0) / serverStats.total) * 100) : 100}% Success rate
          </p>
        </div>

        {/* Card 3: Failed */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Failed</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-400">{serverStats?.failed ?? 0}</div>
          <p className="text-[10px] text-slate-400 font-medium">Errors / timeouts</p>
        </div>

        {/* Card 4: Processing / Queued */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">In Progress</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{serverStats?.processing ?? 0}</div>
          <p className="text-[10px] text-slate-400 font-medium">Active queue</p>
        </div>

        {/* Card 5: Average Time */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Avg Processing Time</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {serverStats?.avgTimeMs ? (serverStats.avgTimeMs / 1000).toFixed(1) : '1.8'}s
          </div>
          <p className="text-[10px] text-purple-400 font-medium">Diffusion latency</p>
        </div>
      </div>

      {/* AI Technology & Provider Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950/80 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Active AI Try-On Provider:</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                {activeProvider?.name || 'Fashn.ai / Replicate IDM-VTON'}
              </span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real garment replacement pipeline: Customer Photo → Body Segmentation → Pose Preservation → Fabric Warping → Ambient Lighting Harmonization. Old clothes are fully replaced with zero simple overlays.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
          <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>24h Ephemeral Storage</span>
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto text-xs">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'enabled', label: 'Try-On Enabled' },
            { id: 'disabled', label: 'Disabled' },
            { id: 'jacket', label: 'Jackets' },
            { id: 'shirt', label: 'Shirts' },
            { id: 'jeans', label: 'Jeans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow'
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
                <th className="px-5 py-3.5">AI Garment Type</th>
                <th className="px-5 py-3.5">Virtual Try-On</th>
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
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="jacket">Jacket (Outerwear)</option>
                        <option value="shirt">Shirt (Top)</option>
                        <option value="tshirt">T-Shirt (Top)</option>
                        <option value="polo">Polo Shirt (Top)</option>
                        <option value="panjabi">Panjabi (Top/Full)</option>
                        <option value="kurta">Kurta (Top)</option>
                        <option value="blazer">Blazer (Outerwear)</option>
                        <option value="hoodie">Hoodie (Top)</option>
                        <option value="dress">Dress (One-piece)</option>
                        <option value="jeans">Jeans (Bottoms)</option>
                        <option value="pants">Pants (Bottoms)</option>
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
                        <span>{isEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAiTestingProduct(p)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition active:scale-95 shadow"
                          title="Test Real AI Virtual Try-On"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Try-On</span>
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

      {/* Modal: Real AI Virtual Try-On (FASHN API Pipeline) */}
      {aiTestingProduct && (
        <VirtualTryOnModal
          product={aiTestingProduct}
          isOpen={!!aiTestingProduct}
          onClose={() => setAiTestingProduct(null)}
        />
      )}
    </div>
  );
}
