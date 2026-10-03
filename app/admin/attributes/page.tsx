'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Ruler,
  Scissors,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

interface ColorAttribute {
  id: string;
  name: string;
  hex: string;
  inStockItems: number;
}

interface SizeAttribute {
  id: string;
  name: string;
  type: 'Waist Size (Inches)' | 'Apparel Size';
  inStockItems: number;
}

interface FitAttribute {
  id: string;
  name: string;
  genderTarget: 'Men' | 'Women' | 'Unisex';
  legOpening: string;
  rise: string;
  itemCount: number;
}

const INITIAL_COLORS: ColorAttribute[] = [
  { id: 'c-1', name: 'Raw Indigo Blue', hex: '#1e3a8a', inStockItems: 48 },
  { id: 'c-2', name: 'Vintage Stone Wash', hex: '#3b82f6', inStockItems: 64 },
  { id: 'c-3', name: 'Deep Pitch Black', hex: '#0f172a', inStockItems: 52 },
  { id: 'c-4', name: 'Ice Bleach Blue', hex: '#93c5fd', inStockItems: 36 },
  { id: 'c-5', name: 'Retro Acid Wash', hex: '#64748b', inStockItems: 24 },
  { id: 'c-6', name: 'Washed Charcoal Grey', hex: '#475569', inStockItems: 31 },
];

const INITIAL_SIZES: SizeAttribute[] = [
  { id: 's-28', name: '28', type: 'Waist Size (Inches)', inStockItems: 45 },
  { id: 's-30', name: '30', type: 'Waist Size (Inches)', inStockItems: 72 },
  { id: 's-32', name: '32', type: 'Waist Size (Inches)', inStockItems: 88 },
  { id: 's-34', name: '34', type: 'Waist Size (Inches)', inStockItems: 65 },
  { id: 's-36', name: '36', type: 'Waist Size (Inches)', inStockItems: 42 },
  { id: 's-38', name: '38', type: 'Waist Size (Inches)', inStockItems: 28 },
  { id: 's-m', name: 'M', type: 'Apparel Size', inStockItems: 35 },
  { id: 's-l', name: 'L', type: 'Apparel Size', inStockItems: 48 },
  { id: 's-xl', name: 'XL', type: 'Apparel Size', inStockItems: 29 },
];

const INITIAL_FITS: FitAttribute[] = [
  { id: 'f-1', name: 'Slim Fit', genderTarget: 'Men', legOpening: '14" Narrow', rise: 'Mid Rise', itemCount: 18 },
  { id: 'f-2', name: 'Baggy & Skater Fit', genderTarget: 'Men', legOpening: '18" Wide', rise: 'Low/Mid Slouch', itemCount: 14 },
  { id: 'f-3', name: 'Classic Straight Leg', genderTarget: 'Men', legOpening: '16" Standard', rise: 'Regular Mid', itemCount: 12 },
  { id: 'f-4', name: 'Tactical Cargo Jeans', genderTarget: 'Men', legOpening: '15" Tapered', rise: 'Mid Rise', itemCount: 9 },
  { id: 'f-5', name: 'High-Rise Wide Leg', genderTarget: 'Women', legOpening: '21" Flared Wide', rise: 'High Rise 11.5"', itemCount: 16 },
  { id: 'f-6', name: 'Vintage 90s Mom Jeans', genderTarget: 'Women', legOpening: '13" Relaxed Taper', rise: 'Ultra High 12"', itemCount: 13 },
  { id: 'f-7', name: 'Sculpt Skinny Jeans', genderTarget: 'Women', legOpening: '10" Skinny Ankle', rise: 'High Rise', itemCount: 10 },
  { id: 'f-8', name: 'Denim Trucker Jacket', genderTarget: 'Unisex', legOpening: 'Waist Band 2" adjustable', rise: 'N/A', itemCount: 8 },
];

export default function AdminAttributesPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'colors' | 'sizes' | 'fits'>('colors');

  const [colors, setColors] = useState<ColorAttribute[]>(INITIAL_COLORS);
  const [sizes, setSizes] = useState<SizeAttribute[]>(INITIAL_SIZES);
  const [fits, setFits] = useState<FitAttribute[]>(INITIAL_FITS);
  const [isLoaded, setIsLoaded] = useState(false);

  // New item modal states
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#3b82f6');

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeType, setNewSizeType] = useState<'Waist Size (Inches)' | 'Apparel Size'>('Waist Size (Inches)');

  const [isFitModalOpen, setIsFitModalOpen] = useState(false);
  const [newFitName, setNewFitName] = useState('');
  const [newFitGender, setNewFitGender] = useState<'Men' | 'Women' | 'Unisex'>('Men');
  const [newFitLeg, setNewFitLeg] = useState('');
  const [newFitRise, setNewFitRise] = useState('');

  useEffect(() => {
    try {
      const savedColors = localStorage.getItem('jeansbd_attr_colors');
      if (savedColors) setColors(JSON.parse(savedColors));

      const savedSizes = localStorage.getItem('jeansbd_attr_sizes');
      if (savedSizes) setSizes(JSON.parse(savedSizes));

      const savedFits = localStorage.getItem('jeansbd_attr_fits');
      if (savedFits) setFits(JSON.parse(savedFits));
    } catch (e) {
      console.error('Failed to load attributes', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('jeansbd_attr_colors', JSON.stringify(colors));
      localStorage.setItem('jeansbd_attr_sizes', JSON.stringify(sizes));
      localStorage.setItem('jeansbd_attr_fits', JSON.stringify(fits));
    } catch (e) {
      console.error('Failed to save attributes', e);
    }
  }, [colors, sizes, fits, isLoaded]);

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    setColors((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: newColorName,
        hex: newColorHex,
        inStockItems: 0,
      },
    ]);
    setNewColorName('');
    setIsColorModalOpen(false);
  };

  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;
    setSizes((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        name: newSizeName,
        type: newSizeType,
        inStockItems: 0,
      },
    ]);
    setNewSizeName('');
    setIsSizeModalOpen(false);
  };

  const handleAddFit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFitName.trim()) return;
    setFits((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        name: newFitName,
        genderTarget: newFitGender,
        legOpening: newFitLeg || 'Standard',
        rise: newFitRise || 'Mid Rise',
        itemCount: 0,
      },
    ]);
    setNewFitName('');
    setNewFitLeg('');
    setNewFitRise('');
    setIsFitModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Product Taxonomy</span>
          </div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Denim Attributes (Color, Size, Fits)
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configure standardized wash colors, waist sizes, and denim silhouette cuts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'colors' && (
            <button
              onClick={() => setIsColorModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Color Swatch</span>
            </button>
          )}
          {activeTab === 'sizes' && (
            <button
              onClick={() => setIsSizeModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Size</span>
            </button>
          )}
          {activeTab === 'fits' && (
            <button
              onClick={() => setIsFitModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Silhouette Fit</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'colors'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Denim Colors & Washes ({colors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sizes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Waist & Apparel Sizes ({sizes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'fits'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Silhouette Fits ({fits.length})</span>
        </button>
      </div>

      {/* Tab 1: Colors */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {colors.map((color) => (
            <div
              key={color.id}
              className={`rounded-2xl border p-4 flex items-center justify-between transition-all ${
                isDark ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl shadow-md border-2 border-white/20 shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{color.name}</h4>
                  <div className={`text-[11px] font-mono mt-0.5 uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {color.hex}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}>
                  {color.inStockItems} units
                </span>
                <button
                  onClick={() => setColors((prev) => prev.filter((c) => c.id !== color.id))}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Sizes */}
      {activeTab === 'sizes' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-fade-in">
          {sizes.map((size) => (
            <div
              key={size.id}
              className={`rounded-2xl border p-4 text-center transition-all flex flex-col justify-between ${
                isDark ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-black text-base flex items-center justify-center mb-2">
                {size.name}
              </div>
              <span className={`text-[10px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {size.type}
              </span>
              <div className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{size.inStockItems}</strong> pcs
                </span>
                <button
                  onClick={() => setSizes((prev) => prev.filter((s) => s.id !== size.id))}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Fits */}
      {activeTab === 'fits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {fits.map((fit) => (
            <div
              key={fit.id}
              className={`rounded-2xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
                isDark ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{fit.name}</h4>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}>
                  {fit.genderTarget}
                </span>
              </div>

              <div className={`space-y-1.5 text-xs p-3 rounded-xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span>Rise Specification:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{fit.rise}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Leg Opening / Drape:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{fit.legOpening}</span>
                </div>
              </div>

              <div className={`pt-2 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Assigned: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{fit.itemCount}</strong> items
                </span>
                <button
                  onClick={() => setFits((prev) => prev.filter((f) => f.id !== fit.id))}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Color Modal */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-sm w-full p-6 space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
          }`}>
            <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Denim Wash Color</h3>
            <form onSubmit={handleAddColor} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Color / Wash Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acid Bleach Wash"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Hex Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className={`w-32 border rounded-xl px-3 py-2 uppercase font-mono ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsColorModalOpen(false)}
                  className={`px-3 py-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl font-bold"
                >
                  Save Swatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Modal */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-sm w-full p-6 space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
          }`}>
            <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Size Attribute</h3>
            <form onSubmit={handleAddSize} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Size Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40 or XXL"
                  value={newSizeName}
                  onChange={(e) => setNewSizeName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Measurement Type</label>
                <select
                  value={newSizeType}
                  onChange={(e) => setNewSizeType(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Waist Size (Inches)">Waist Size (Inches)</option>
                  <option value="Apparel Size">Apparel Size (S/M/L/XL)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSizeModalOpen(false)}
                  className={`px-3 py-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl font-bold"
                >
                  Add Size
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fit Modal */}
      {isFitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
          }`}>
            <h3 className={`text-base font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Silhouette Fit</h3>
            <form onSubmit={handleAddFit} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fit Cut Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 90s Bootcut Flare"
                  value={newFitName}
                  onChange={(e) => setNewFitName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Gender Target</label>
                <select
                  value={newFitGender}
                  onChange={(e) => setNewFitGender(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rise Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. High Rise 11.5inch"
                    value={newFitRise}
                    onChange={(e) => setNewFitRise(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Leg Opening</label>
                  <input
                    type="text"
                    placeholder="e.g. 19inch Flare"
                    value={newFitLeg}
                    onChange={(e) => setNewFitLeg(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFitModalOpen(false)}
                  className={`px-3 py-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl font-bold"
                >
                  Add Fit Cut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
