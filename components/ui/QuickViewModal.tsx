'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Linkedin,
  Flame,
  BadgeCheck,
  Sparkles,
  Play,
  Film,
  Video,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { parseVideoUrl } from '@/lib/utils/video';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { useProducts } from '@/lib/store/productsContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { siteSettings } = useProducts();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video' | '3d'>('image');
  const [is3DSpin, setIs3DSpin] = useState<boolean>(false);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && product) {
      setShareUrl(`${window.location.origin}/product/${product.slug}`);
    }
  }, [product]);

  // 3D Auto Spin Effect in QuickView
  React.useEffect(() => {
    let interval: any;
    if (activeMediaType === '3d' && is3DSpin && product && product.images && product.images.length > 1) {
      interval = setInterval(() => {
        setActiveImgIndex((prev) => (prev + 1) % product.images.length);
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMediaType, is3DSpin, product]);

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      const firstVariant = product.variants[0];
      setSelectedSize(firstVariant?.size || '30');
      setSelectedColor(firstVariant?.color || 'Blue');
      setSelectedImage(product.images[0] || product.thumbnail);
      setActiveMediaType('image');
      setActiveImgIndex(0);
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
  const effectivePrice = product.discountPrice || product.price;
  const discountAmount = product.price > effectivePrice ? product.price - effectivePrice : 0;
  const discountPercent = product.price > effectivePrice ? Math.round((discountAmount / product.price) * 100) : 0;

  // Phone and messaging links
  const rawPhone = siteSettings?.phone || '01775743148';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const displayPhone = cleanPhone.startsWith('88') ? cleanPhone.replace(/^88/, '') : cleanPhone;
  const formattedDisplayPhone = rawPhone.startsWith('+') ? rawPhone : `+88 ${displayPhone}`;
  const telNumber = rawPhone.startsWith('+') ? rawPhone : `+88${displayPhone}`;
  const waPhoneIntl = `88${displayPhone.replace(/^0/, '')}`;

  const whatsAppOrderText = `আসসালামু আলাইকুম, আমি Just Jeans BD থেকে অর্ডার করতে চাই:\n\n🛍️ প্রোডাক্ট: ${product.name}\n🏷️ SKU: ${currentVariant?.sku || 'JBD-001'}\n📏 সাইজ: ${selectedSize || 'N/A'}\n🎨 কালার: ${selectedColor || 'N/A'}\n🔢 পরিমাণ: ${quantity}\n💰 মোট মূল্য: ৳${effectivePrice * quantity}\n🔗 লিঙ্ক: ${shareUrl}`;
  const whatsAppOrderUrl = `https://wa.me/${waPhoneIntl}?text=${encodeURIComponent(whatsAppOrderText)}`;

  const messengerUrl = (() => {
    const fb = siteSettings?.socialLinks?.facebook || 'https://www.facebook.com/share/1F7Qzp3uzD/';
    if (fb.includes('facebook.com/share/')) return fb;
    if (fb.includes('m.me/')) return fb;
    const username = fb.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '');
    return username ? `https://m.me/${username}` : fb;
  })();

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}_${selectedSize}_${selectedColor}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: selectedImage || product.thumbnail,
      price: effectivePrice,
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

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    router.push('/checkout');
  };

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ color: v.color, hex: v.colorHex })))
  ).map((str) => JSON.parse(str));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 relative p-5 sm:p-7 lg:p-8 scrollbar-thin">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Gallery Preview */}
          <div className="space-y-3.5">
            {activeMediaType === 'video' && product.videoUrl ? (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
                {(() => {
                  const info = parseVideoUrl(product.videoUrl);
                  if (info?.type === 'youtube' || info?.type === 'vimeo') {
                    return (
                      <iframe
                        src={info.embedUrl}
                        title={product.name}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={product.videoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  );
                })()}
                <button
                  type="button"
                  onClick={() => setActiveMediaType('image')}
                  className="absolute top-2 left-2 z-10 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 backdrop-blur-md"
                >
                  ← Photos
                </button>
              </div>
            ) : activeMediaType === '3d' ? (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-purple-500/30 shadow-inner flex flex-col items-center justify-center p-3">
                <img
                  src={(product.images && product.images[activeImgIndex]) || product.thumbnail}
                  alt={`${product.name} 3D Angle`}
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
                <div className="absolute top-2 left-2 bg-purple-950/90 text-purple-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-purple-500/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>3D Motion (360°)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIs3DSpin(!is3DSpin)}
                  className={`absolute bottom-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition ${
                    is3DSpin ? 'bg-amber-400 text-slate-950' : 'bg-black/70 text-white border border-white/20'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{is3DSpin ? 'Spin: ON' : 'Auto-Spin'}</span>
                </button>
              </div>
            ) : (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img
                  src={selectedImage || product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    -{discountPercent}% OFF
                  </div>
                )}
                {product.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaType('video')}
                    className="absolute bottom-3 left-3 z-10 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Video</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img);
                    setActiveMediaType('image');
                  }}
                  className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeMediaType === 'image' && selectedImage === img ? 'border-blue-600 ring-2 ring-blue-50 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {/* 3D Spin Button */}
              <button
                onClick={() => {
                  setActiveMediaType('3d');
                  setIs3DSpin(true);
                }}
                className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-gradient-to-br from-slate-900 to-purple-950 flex flex-col items-center justify-center text-white ${
                  activeMediaType === '3d'
                    ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                    : 'border-slate-800 opacity-80 hover:opacity-100'
                }`}
                title="3D Motion View"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 mb-0.5 animate-pulse" />
                <span className="text-[8px] font-black uppercase text-purple-200">3D</span>
              </button>

              {product.videoUrl && (
                <button
                  onClick={() => setActiveMediaType('video')}
                  className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-950 flex flex-col items-center justify-center text-white ${
                    activeMediaType === 'video'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-800 opacity-80 hover:opacity-100'
                  }`}
                  title="Watch Video"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-400 mb-0.5" />
                  <span className="text-[8px] font-black text-indigo-300">VIDEO</span>
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
                  <BadgeCheck className="w-3 h-3 text-blue-600" />
                  JUST JEANS BD
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {currentStock > 0 ? `In Stock (${currentStock} left)` : 'Out of Stock'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                {product.name}
              </h2>

              {/* SKU & Social Share Icons row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>SKU: <span className="text-slate-800 font-mono">{currentVariant?.sku || 'JBD-001'}</span></span>
                </div>

                {/* Social Share Icons Bar */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/80">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Facebook"
                    className="w-5 h-5 rounded hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Facebook className="w-3 h-3 fill-current" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on X"
                    className="w-5 h-5 rounded hover:bg-black hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' - ' + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on WhatsApp"
                    className="w-5 h-5 rounded hover:bg-[#25D366] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                    </svg>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent('Check out this product on Jeans BD: ' + shareUrl)}`}
                    title="Share via Email"
                    className="w-5 h-5 rounded hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Price Line */}
              <div className="flex flex-wrap items-baseline gap-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-xs font-black text-slate-500 uppercase">PRICE:</span>
                <span className="text-2xl font-black text-slate-950">
                  {formatPrice(effectivePrice)}
                </span>
                {product.price > effectivePrice && (
                  <span className="text-sm text-slate-400 line-through font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
                {discountAmount > 0 && (
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
                    {discountAmount} ৳ off
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Select Your Color:
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {uniqueColors.map((c: any) => (
                      <button
                        key={c.color}
                        onClick={() => setSelectedColor(c.color)}
                        className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                          selectedColor === c.color
                            ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {c.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Your Size:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 h-8 px-2.5 rounded-lg font-black text-xs border transition-all ${
                        selectedSize === size
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-3.5">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  QUANTITY:
                </span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-bold">
                  Total: {formatPrice(effectivePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* Primary Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="w-full bg-[#1e293b] hover:bg-slate-900 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:bg-slate-300"
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:bg-slate-300"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  Buy Now
                </button>
              </div>

              {/* Direct Ordering Hub */}
              <div className="grid grid-cols-3 gap-1.5">
                <a
                  href={`tel:${telNumber}`}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <Phone className="w-3 h-3 fill-current" />
                  <span className="truncate">Call</span>
                </a>

                <a
                  href={whatsAppOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                  </svg>
                  <span className="truncate">WhatsApp</span>
                </a>

                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0084FF] hover:bg-[#0074e0] active:scale-[0.98] text-white py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                  </svg>
                  <span className="truncate">Messenger</span>
                </a>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-1.5 py-1 transition-colors ${
                    isWished ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={isWished ? 'font-bold' : ''}>{isWished ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}</span>
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group py-1"
                >
                  <span>Full Details Page</span>
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
