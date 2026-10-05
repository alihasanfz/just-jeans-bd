'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star, Check, Sparkles } from 'lucide-react';
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
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? product.discountPercentage || Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

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
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-blue-500/40 transition-all duration-500 hover:shadow-luxe-card hover:-translate-y-1"
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
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-108"
            loading="lazy"
          />
        </Link>

        {/* Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {hasDiscount && discountPercent > 0 && (
            <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shadow-red-600/30 flex items-center gap-1">
              <span>-{discountPercent}% OFF</span>
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-slate-950/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>NEW</span>
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
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
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 active:scale-75 ${
            isWished
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 shadow-sm opacity-90 group-hover:opacity-100 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Desktop Quick Action Buttons (Add to Cart & Quick View) */}
        <div className="absolute inset-x-3 bottom-3 hidden lg:flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
          {showQuickSizes ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-slate-200/90 animate-scale-in">
              <div className="text-[11px] font-black text-slate-700 text-center mb-2 uppercase tracking-wider flex items-center justify-center gap-1">
                <span>Select Your Size</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleQuickAdd(size)}
                    className="min-w-9 h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all active:scale-90"
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
                className="flex-1 bg-slate-950 hover:bg-blue-600 text-white py-3 px-3 rounded-2xl font-bold text-xs shadow-xl backdrop-blur-sm transition-all flex items-center justify-center gap-2 active:scale-95 group/btn"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    <span>Quick Add</span>
                  </>
                )}
              </button>

              {onQuickView && (
                <button
                  onClick={() => onQuickView(product)}
                  className="bg-white/95 hover:bg-slate-100 text-slate-800 p-3 rounded-2xl shadow-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 border border-slate-200"
                  title="Quick View Details"
                  aria-label="Quick View"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Fit & Rating */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span className="text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider">
              {product.fit}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount || 12})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block group/link">
            <h3 className="font-bold text-sm text-slate-900 group-hover/link:text-blue-600 transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
            {product.titleBn && (
              <p className="text-xs text-slate-400 font-normal line-clamp-1 mb-2.5">
                {product.titleBn}
              </p>
            )}
          </Link>
        </div>

        {/* Pricing & Colors Row */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-slate-950 font-display">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Color swatch dots */}
          <div className="flex items-center gap-1.5">
            {product.variants.slice(0, 3).map((v, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full border border-slate-200 ring-1 ring-black/5"
                style={{ backgroundColor: v.colorHex }}
                title={v.color}
              />
            ))}
            {product.variants.length > 3 && (
              <span className="text-[10px] font-bold text-slate-400">
                +{product.variants.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
