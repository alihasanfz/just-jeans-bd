'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useWishlist } from '@/lib/store/wishlistContext';
import { useCart } from '@/lib/store/cartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [isHovered, setIsHovered] = useState(false);
  const [showQuickSizes, setShowQuickSizes] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isWished = isInWishlist(product.id);
  const mainImage = product.thumbnail || product.images[0];
  const hoverImage = product.images[1] || mainImage;
  const currentPrice = product.discountPrice || product.price;

  const handleQuickAdd = (size: string) => {
    const variant = product.variants.find((v) => v.size === size) || product.variants[0];
    addToCart({
      id: `${product.id}_${size}_${variant?.color || 'Default'}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: mainImage,
      price: currentPrice,
      regularPrice: product.price,
      size,
      color: variant?.color || 'Default',
      colorHex: variant?.colorHex || '#000',
      quantity: 1,
      maxStock: variant?.stock || 10,
    });
    setShowQuickSizes(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1800);
  };

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickSizes(false);
      }}
    >
      {/* Media Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
              -{product.discountPercentage}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label="Add to wishlist"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWished
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-red-500 shadow-sm opacity-90 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button overlay on desktop */}
        <div className="absolute inset-x-3 bottom-3 hidden lg:flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {showQuickSizes ? (
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-200/80 animate-fade-in">
              <div className="text-[11px] font-bold text-slate-700 text-center mb-1.5 uppercase tracking-wider">
                Select Size:
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleQuickAdd(size)}
                    className="min-w-8 h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white font-bold text-xs transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickSizes(true)}
                className="flex-1 bg-white/95 hover:bg-slate-900 hover:text-white text-slate-900 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md backdrop-blur-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    + Quick Add
                  </>
                )}
              </button>

              {onQuickView && (
                <button
                  onClick={() => onQuickView(product)}
                  className="bg-white/95 hover:bg-slate-100 text-slate-800 p-2.5 rounded-xl shadow-md backdrop-blur-sm transition-all"
                  title="Quick View"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Fit & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.fit}</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block group/link">
            <h3 className="font-bold text-sm text-slate-900 group-hover/link:text-blue-600 transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
            {product.titleBn && (
              <p className="text-xs text-slate-400 font-normal line-clamp-1 mb-2">
                {product.titleBn}
              </p>
            )}
          </Link>
        </div>

        {/* Price & Colors */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-slate-900">
              {formatPrice(currentPrice)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Color swatches count or dots */}
          <div className="flex items-center gap-1">
            {product.variants.slice(0, 3).map((v, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-slate-200"
                style={{ backgroundColor: v.colorHex }}
                title={v.color}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
