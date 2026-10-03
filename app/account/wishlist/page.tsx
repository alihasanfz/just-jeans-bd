'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/lib/store/wishlistContext';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="bg-slate-50/50 py-10 lg:py-16 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight">
              My Wishlist
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Saved denim items you love ({wishlist.length})
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Explore More Denim &rarr;
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500">
              Save your favorite denim fits, jacket pieces, and colors to easily find them later.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-md"
            >
              <span>Start Browsing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
