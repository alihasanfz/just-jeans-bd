'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, Check, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      const firstVariant = product.variants[0];
      setSelectedSize(firstVariant?.size || '30');
      setSelectedColor(firstVariant?.color || 'Blue');
      setSelectedImage(product.images[0] || product.thumbnail);
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product]);

  if (!product) return null;

  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) || product.variants[0];

  const currentStock = currentVariant ? currentVariant.stock : product.totalStock;
  const isWished = isInWishlist(product.id);

  const handleAddToCart = () => {
    const itemPrice = product.discountPrice || product.price;
    addToCart({
      id: `${product.id}_${selectedSize}_${selectedColor}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: selectedImage || product.thumbnail,
      price: itemPrice,
      regularPrice: product.price,
      size: selectedSize,
      color: selectedColor,
      colorHex: currentVariant?.colorHex || '#000',
      quantity,
      maxStock: currentStock,
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ color: v.color, hex: v.colorHex })))
  ).map((str) => JSON.parse(str));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative p-6 lg:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery Preview */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={selectedImage || product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discountPercentage && product.discountPercentage > 0 && (
                <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                  -{product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img ? 'border-blue-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">
                <span>{product.gender.toUpperCase()}</span>
                <span>•</span>
                <span>{product.fit}</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-black text-slate-900">
                  {formatPrice(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <span className="text-lg text-slate-400 line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Color: <span className="font-normal text-slate-600">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {uniqueColors.map((c: any) => (
                      <button
                        key={c.color}
                        onClick={() => setSelectedColor(c.color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                          selectedColor === c.color ? 'border-blue-600 ring-2 ring-blue-100 scale-110' : 'border-slate-300'
                        }`}
                        title={c.color}
                      >
                        <span
                          className="w-full h-full rounded-full block border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  <span>Size (Waist)</span>
                  <span className="text-blue-600 font-normal">
                    {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-10 px-3 rounded-xl font-bold text-sm border transition-all ${
                        selectedSize === size
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">Total: {formatPrice((product.discountPrice || product.price) * quantity)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="flex-1 bg-slate-900 hover:bg-black text-white py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-400" />
                      Added to Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      Add to Shopping Bag
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isWished ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex justify-center">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group py-1"
                >
                  <span>View Full Specifications & Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
