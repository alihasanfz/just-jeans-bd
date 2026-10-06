'use client';

import React, { useState } from 'react';
import { X, Plus, Search, Check, AlertTriangle, Package, Sparkles } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { Product } from '@/types';

export interface StockAlertItem {
  id: string;
  name: string;
  fit: string;
  stock: number;
  image: string;
  productId?: string;
}

interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAlert: (item: StockAlertItem) => void;
  existingAlertIds: string[];
}

export default function StockAlertModal({
  isOpen,
  onClose,
  onAddAlert,
  existingAlertIds,
}: StockAlertModalProps) {
  const { products } = useProducts();
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [alertStock, setAlertStock] = useState<number>(20);

  // Custom product inputs
  const [customName, setCustomName] = useState('');
  const [customFit, setCustomFit] = useState('STRAIGHT FIT');
  const [customStock, setCustomStock] = useState<number>(25);
  const [customImage, setCustomImage] = useState(
    'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80'
  );

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.fit && p.fit.toLowerCase().includes(q));
  });

  const handleAddFromCatalog = () => {
    if (!selectedProduct) return;
    const newItem: StockAlertItem = {
      id: `alert-${selectedProduct.id}-${Date.now()}`,
      name: selectedProduct.name,
      fit: selectedProduct.fit || 'STRAIGHT FIT',
      stock: Number(alertStock) || selectedProduct.totalStock || 15,
      image: selectedProduct.thumbnail || (selectedProduct.images && selectedProduct.images[0]) || '',
      productId: selectedProduct.id,
    };
    onAddAlert(newItem);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Please enter a product name');
      return;
    }
    const newItem: StockAlertItem = {
      id: `custom-alert-${Date.now()}`,
      name: customName.trim(),
      fit: customFit.toUpperCase(),
      stock: Number(customStock) || 20,
      image: customImage,
    };
    onAddAlert(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Add Item to Stock Alerts</h2>
              <p className="text-xs text-slate-400">
                Track low inventory and set custom stock alert levels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/60 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
              tab === 'catalog'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Select from Store Catalog ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
              tab === 'custom'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Add Custom Denim Alert
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {tab === 'catalog' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name or fit..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Product selection list */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No products found matching your search.
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    const isAlreadyAlert = existingAlertIds.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setAlertStock(p.totalStock || 20);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-xs'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.thumbnail || (p.images && p.images[0]) || ''}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="uppercase font-semibold">{p.fit || 'Straight Fit'}</span>
                              <span>•</span>
                              <span>Current Stock: {p.totalStock}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAlreadyAlert && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Active Alert
                            </span>
                          )}
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'border-slate-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedProduct && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Alert Quantity for '{selectedProduct.name}':
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {alertStock} in stock
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={alertStock}
                      onChange={(e) => setAlertStock(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold"
                    />
                    <div className="flex gap-1">
                      {[10, 20, 30].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAlertStock(preset)}
                          className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Vintage Wash Denim Jacket"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Silhouette / Fit
                  </label>
                  <select
                    value={customFit}
                    onChange={(e) => setCustomFit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                  >
                    <option value="STRAIGHT FIT">STRAIGHT FIT</option>
                    <option value="SLIM FIT">SLIM FIT</option>
                    <option value="WIDE LEG">WIDE LEG</option>
                    <option value="BAGGY FIT">BAGGY FIT</option>
                    <option value="BOOTCUT">BOOTCUT</option>
                    <option value="CARGO">CARGO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Remaining Stock
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customStock}
                    onChange={(e) => setCustomStock(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={customImage}
                  onChange={(e) => setCustomImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {tab === 'catalog' ? (
            <button
              type="button"
              disabled={!selectedProduct}
              onClick={handleAddFromCatalog}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Stock Alerts</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddCustom}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Custom Alert</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
