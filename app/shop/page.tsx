'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Search,
  LayoutGrid,
  Grid,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import ProductCard from '@/components/ui/ProductCard';
import QuickViewModal from '@/components/ui/QuickViewModal';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, categories } = useProducts();

  // URL Params initialization
  const initialGender = searchParams.get('gender') || 'all';
  const initialFit = searchParams.get('fit') || 'all';
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || 'all';

  // Local filter states
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedFit, setSelectedFit] = useState<string>(initialFit);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(4000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(initialFilter === 'sale');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Available Fits
  const availableFits = [
    'Slim Fit',
    'Baggy Fit',
    'Straight Fit',
    'Cargo Jeans',
    'Wide Leg',
    'Mom Jeans',
    'Skinny Fit',
    'Denim Jacket',
  ];

  // Available Sizes
  const availableSizes = ['26', '28', '30', '32', '34', '36', '38', 'M', 'L', 'XL'];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Gender filter
      if (selectedGender !== 'all' && product.gender !== selectedGender) {
        return false;
      }
      // Fit filter
      if (selectedFit !== 'all' && product.fit !== selectedFit) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Size filter
      if (selectedSize !== 'all') {
        const hasSize = product.variants.some((v) => v.size === selectedSize && v.stock > 0);
        if (!hasSize) return false;
      }
      // Price filter
      const effectivePrice = product.discountPrice || product.price;
      if (effectivePrice > priceRange) {
        return false;
      }
      // Stock filter
      if (onlyInStock && product.totalStock <= 0) {
        return false;
      }
      // Sale filter
      if (onlyOnSale && !product.isOnSale && (!product.discountPercentage || product.discountPercentage <= 0)) {
        return false;
      }
      // Query filter
      if (initialQuery.trim()) {
        const q = initialQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesFit = product.fit.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesFit && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    products,
    selectedGender,
    selectedFit,
    selectedCategory,
    selectedSize,
    priceRange,
    onlyInStock,
    onlyOnSale,
    initialQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedGender('all');
    setSelectedFit('all');
    setSelectedCategory('all');
    setSelectedSize('all');
    setPriceRange(4000);
    setOnlyInStock(false);
    setOnlyOnSale(false);
    setSortBy('newest');
    router.push('/shop');
  };

  const activeFiltersCount = [
    selectedGender !== 'all',
    selectedFit !== 'all',
    selectedCategory !== 'all',
    selectedSize !== 'all',
    priceRange < 4000,
    onlyInStock,
    onlyOnSale,
    Boolean(initialQuery),
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-slate-400 mb-2">
            <span>Home</span> / <span className="text-slate-800">Shop Denim</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight">
                {selectedGender === 'men'
                  ? "Men's Denim Collection"
                  : selectedGender === 'women'
                  ? "Women's Denim Collection"
                  : 'All Denim Collection'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Quick gender toggle bar */}
            <div className="inline-flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm self-start md:self-auto">
              <button
                onClick={() => setSelectedGender('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedGender === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Denim
              </button>
              <button
                onClick={() => setSelectedGender('men')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedGender === 'men'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Men
              </button>
              <button
                onClick={() => setSelectedGender('women')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedGender === 'women'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Women
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters ({activeFiltersCount})</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Grid layout switcher for desktop */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-lg transition-colors ${
                  gridCols === 3 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                }`}
                title="3 Columns"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded-lg transition-colors ${
                  gridCols === 4 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                }`}
                title="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-sm uppercase text-slate-900 tracking-wider">
                  Filters
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Denim Fits */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                Fit Silhouette
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedFit('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedFit === 'all'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Fits
                </button>
                {availableFits.map((fit) => (
                  <button
                    key={fit}
                    onClick={() => setSelectedFit(fit)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedFit === fit
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                Waist Size
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedSize === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  All
                </button>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold border transition-all ${
                      selectedSize === size
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Max Price
                </h4>
                <span className="text-xs font-black text-blue-600">
                  {formatPrice(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min={1500}
                max={4000}
                step={100}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>৳1,500</span>
                <span>৳4,000</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOnSale}
                  onChange={(e) => setOnlyOnSale(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Discounted Items Only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No matching denim found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting or clearing your filters to explore our full denim catalogue.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 ${
                  gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4'
                } gap-4 lg:gap-6`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gender */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Gender
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'men', 'women'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border ${
                        selectedGender === g
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Fit
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedFit('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      selectedFit === 'all'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    All Fits
                  </button>
                  {availableFits.map((fit) => (
                    <button
                      key={fit}
                      onClick={() => setSelectedFit(fit)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        selectedFit === fit
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Size
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-9 h-9 px-2 rounded-lg text-xs font-bold border ${
                        selectedSize === size
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Max Price
                  </h4>
                  <span className="text-xs font-black text-blue-600">
                    {formatPrice(priceRange)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1500}
                  max={4000}
                  step={100}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Loading Denim Store...</div>}>
      <ShopContent />
    </Suspense>
  );
}
