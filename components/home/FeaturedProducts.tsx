'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, Award, Tag, Compass } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import QuickViewModal from '@/components/ui/QuickViewModal';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'bestsellers' | 'sale'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filterProducts = () => {
    switch (activeTab) {
      case 'new':
        return products.filter((p) => p.isNewArrival);
      case 'bestsellers':
        return products.filter((p) => p.isBestSeller);
      case 'sale':
        return products.filter((p) => p.isOnSale || (p.discountPercentage && p.discountPercentage > 0));
      default:
        return products.slice(0, 8);
    }
  };

  const displayedProducts = filterProducts();

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-3 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Handcrafted Denim Wardrobe</span>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 tracking-tight uppercase mb-4 font-display">
            Featured Collections
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Engineered for comfort, washed to perfection. Explore our most wanted denim silhouettes of the season across Bangladesh.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex justify-center mb-10 lg:mb-14 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex bg-slate-100/80 p-1.5 rounded-2xl gap-1.5 border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              All Trending
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>New Arrivals</span>
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'bestsellers'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Best Sellers</span>
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'sale'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Special Offers</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-slate-950 hover:bg-blue-600 text-white font-black text-sm px-9 py-4 rounded-2xl shadow-xl shadow-slate-900/15 transition-all duration-300 hover:scale-105 active:scale-95 group uppercase tracking-wider"
          >
            <span>Explore Entire Catalog ({products.length} Designs)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
