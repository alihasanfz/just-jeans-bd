'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useWishlist } from '@/lib/store/wishlistContext';
import { useCart } from '@/lib/store/cartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const isWished = isInWishlist(product.id);
  const mainImage = product.thumbnail || product.images[0];
  const hoverImage = product.images[1] || mainImage;
  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? product.discountPercentage || Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants[0];
    addToCart({
      id: `${product.id}_${variant?.size || '32'}_${variant?.color || 'Default'}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: mainImage,
      price: currentPrice,
      regularPrice: product.price,
      size: variant?.size || '32',
      color: variant?.color || 'Vintage Blue',
      colorHex: variant?.colorHex || '#1e3a8a',
      quantity: 1,
      maxStock: 10,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Color dots
  const colorDots = ['#1e293b', '#2563eb', '#64748b'];

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges on Top Left matching Image 2 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.isBestSeller && (
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="bg-cyan-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              New
            </span>
          )}
          {hasDiscount && discountPercent > 0 && !product.isBestSeller && (
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart on Top Right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
            isWished
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-slate-700 shadow-sm'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Details matching Image 2 */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <span className="text-[11px] text-slate-400 capitalize block mt-0.5">
            {product.gender === 'men' ? 'Men' : 'Women'} • {product.fit || 'Baggy Fit'}
          </span>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-700">4.8</span>
            <span className="text-[10px] text-slate-400">(124)</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Color Swatch Dots */}
            <div className="flex items-center gap-1 mt-1.5">
              {colorDots.map((c, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Black Square Cart Button matching Image 2 */}
          <button
            onClick={handleQuickAdd}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 hover:bg-blue-600 text-white shadow-sm'
            }`}
            title="Add to Cart"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
