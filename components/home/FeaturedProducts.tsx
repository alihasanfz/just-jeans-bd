'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'men' | 'women' | 'new' | 'sale'>('all');

  const filterProducts = () => {
    switch (activeTab) {
      case 'men':
        return products.filter((p) => p.gender === 'men').slice(0, 8);
      case 'women':
        return products.filter((p) => p.gender === 'women').slice(0, 8);
      case 'new':
        return products.filter((p) => p.isNewArrival).slice(0, 8);
      case 'sale':
        return products.filter((p) => p.isOnSale || (p.discountPrice && p.discountPrice < p.price)).slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  };

  const displayedProducts = filterProducts();

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-2">
              FEATURED COLLECTIONS
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Most Popular Right Now
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Our best selling denim styles, loved by thousands.
            </p>
          </div>

          {/* Filter Tabs matching Image 2 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'new', label: 'New In' },
              { id: 'sale', label: 'Sale' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Product Cards (2 rows of 4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button matching Image 2 */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
