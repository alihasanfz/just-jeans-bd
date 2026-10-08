'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  Facebook,
  Linkedin,
  Sparkles,
  Layers,
  Flame,
  BadgeCheck,
  CreditCard,
  ZoomIn,
  Play,
  Film,
  Video,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { formatPrice } from '@/lib/utils';
import { parseVideoUrl } from '@/lib/utils/video';
import ProductCard from '@/components/ui/ProductCard';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import VirtualTryOnModal from '@/components/VirtualTryOnModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { getProductBySlug, products, addReview, siteSettings } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = getProductBySlug(slug);

  // States
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video' | '3d'>('image');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'reviews'>('desc');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // 3D Motion & 360 Spin State
  const [is3DAutoSpin, setIs3DAutoSpin] = useState<boolean>(false);
  const [tilt3D, setTilt3D] = useState({ x: 0, y: 0 });
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  // 3D Auto Spin Effect
  React.useEffect(() => {
    let interval: any;
    if (activeMediaType === '3d' && is3DAutoSpin && product && product.images && product.images.length > 1) {
      interval = setInterval(() => {
        setActiveImgIndex((prev) => (prev + 1) % product.images.length);
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMediaType, is3DAutoSpin, product]);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Sync initial variant state when product is loaded
  React.useEffect(() => {
    if (product) {
      const first = product.variants[0];
      setSelectedSize(first?.size || '30');
      setSelectedColor(first?.color || 'Blue');
      setSelectedImage(product.images[0] || product.thumbnail);
      setActiveImgIndex(0);
      setActiveMediaType('image');
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-slate-950 hover:bg-black text-white px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.thumbnail];

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
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    addReview(product.id, {
      userId: 'guest-user',
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      verifiedPurchase: true,
    });

    setReviewSuccess(true);
    setReviewName('');
    setReviewComment('');
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleNextImage = () => {
    const nextIdx = (activeImgIndex + 1) % allImages.length;
    setActiveImgIndex(nextIdx);
    setSelectedImage(allImages[nextIdx]);
  };

  const handlePrevImage = () => {
    const prevIdx = (activeImgIndex - 1 + allImages.length) % allImages.length;
    setActiveImgIndex(prevIdx);
    setSelectedImage(allImages[prevIdx]);
  };

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ color: v.color, hex: v.colorHex })))
  ).map((str) => JSON.parse(str));

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.fit === product.fit))
    .slice(0, 4);

  const reviewsList = (product as any).reviews || [
    {
      id: 'rev-1',
      userName: 'Tanveer Ahmed',
      rating: 5,
      comment: 'Excellent fit! The stretch is super comfortable for daily wear. Premium denim feel.',
      createdAt: '3 days ago',
      verifiedPurchase: true,
    },
    {
      id: 'rev-2',
      userName: 'Sadia Rahman',
      rating: 5,
      comment: 'Top quality stitching and true to size. Delivery to Banani took only 1 day.',
      createdAt: '1 week ago',
      verifiedPurchase: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap py-1">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                Home
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li>
              <Link href="/shop" className="hover:text-blue-600 transition-colors">
                Shop
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li>
              <Link href={`/shop?gender=${product.gender}`} className="hover:text-blue-600 transition-colors capitalize">
                {product.gender}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li>
              <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Premium Gallery (5 cols) */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-3">
              {/* Media Mode Switcher Top Bar */}
              <div className="flex items-center justify-between gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveMediaType('image')}
                  className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeMediaType === 'image'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Photos</span>
                </button>

                {product.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaType('video')}
                    className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeMediaType === 'video'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Video</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaType('3d');
                    setIs3DAutoSpin(true);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeMediaType === '3d'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>3D Motion (360°)</span>
                </button>
              </div>

              {/* 1. VIDEO VIEW */}
              {activeMediaType === 'video' && product.videoUrl ? (
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl flex items-center justify-center">
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
                </div>
              ) : activeMediaType === '3d' ? (
                /* 2. 3D MOTION & 360 SPIN VIEW */
                <div
                  className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-indigo-500/30 shadow-2xl flex flex-col items-center justify-center select-none cursor-ew-resize group"
                  onMouseDown={(e) => setDragStartX(e.clientX)}
                  onMouseUp={() => setDragStartX(null)}
                  onMouseLeave={() => {
                    setDragStartX(null);
                    setTilt3D({ x: 0, y: 0 });
                  }}
                  onMouseMove={(e) => {
                    if (dragStartX !== null && allImages.length > 1) {
                      const diff = e.clientX - dragStartX;
                      if (Math.abs(diff) > 25) {
                        if (diff > 0) {
                          setActiveImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                        } else {
                          setActiveImgIndex((prev) => (prev + 1) % allImages.length);
                        }
                        setDragStartX(e.clientX);
                      }
                    }
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
                    setTilt3D({ x, y });
                  }}
                  onTouchStart={(e) => setDragStartX(e.touches[0].clientX)}
                  onTouchEnd={() => setDragStartX(null)}
                  onTouchMove={(e) => {
                    if (dragStartX !== null && allImages.length > 1) {
                      const diff = e.touches[0].clientX - dragStartX;
                      if (Math.abs(diff) > 20) {
                        if (diff > 0) {
                          setActiveImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                        } else {
                          setActiveImgIndex((prev) => (prev + 1) % allImages.length);
                        }
                        setDragStartX(e.touches[0].clientX);
                      }
                    }
                  }}
                >
                  {/* 3D Image with perspective rotation */}
                  <div
                    className="w-full h-full p-4 flex items-center justify-center transition-transform duration-100 ease-out"
                    style={{
                      transform: `perspective(800px) rotateY(${tilt3D.x}deg) rotateX(${tilt3D.y}deg) scale(0.96)`,
                    }}
                  >
                    <img
                      src={allImages[activeImgIndex] || product.thumbnail}
                      alt={`${product.name} 3D Spin Angle`}
                      className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                      draggable={false}
                    />
                  </div>

                  {/* 3D Badge on Top */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/40 text-purple-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>3D 360° MOTION VIEW</span>
                  </div>

                  {/* 3D Auto Spin Controls on Bottom */}
                  <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-10">
                    <button
                      type="button"
                      onClick={() => setIs3DAutoSpin(!is3DAutoSpin)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
                        is3DAutoSpin
                          ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                          : 'bg-black/70 text-white border border-white/20 hover:bg-black'
                      }`}
                    >
                      <Play className={`w-3.5 h-3.5 ${is3DAutoSpin ? 'fill-current animate-pulse' : ''}`} />
                      <span>{is3DAutoSpin ? '3D Auto-Spin: ON' : 'Start 3D Auto-Spin'}</span>
                    </button>

                    <span className="text-[10px] text-white/80 font-bold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                      ↔️ Drag to Rotate ({activeImgIndex + 1}/{allImages.length})
                    </span>
                  </div>
                </div>
              ) : (
                /* 3. PHOTO SHOWCASE WITH ZOOM */
                <div 
                  className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner group cursor-crosshair"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={selectedImage || product.thumbnail}
                    alt={product.name}
                    className={`w-full h-full object-cover object-center transition-transform duration-200 select-none ${
                      isZoomed ? 'scale-[1.8]' : 'scale-100'
                    }`}
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : undefined
                    }
                  />

                  {/* Floating Badges */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-2 z-10 pointer-events-none">
                    {discountPercent > 0 && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {discountPercent}% OFF
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-slate-900/80 text-white/95 font-bold text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Premium Wash
                    </span>

                    {/* Virtual Try-On floating trigger badge */}
                    {product.virtualTryOnEnabled !== false && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTryOnOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-purple-300/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Try this product live in Virtual Fitting Room"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Try On (AR)</span>
                      </button>
                    )}
                  </div>

                  {/* Wishlist floating toggle on main image */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-3.5 right-3.5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                      isWished 
                        ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-300' 
                        : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600'
                    }`}
                    aria-label="Add to Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                  </button>

                  {/* Watch Video floating trigger if product has video */}
                  {product.videoUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaType('video');
                      }}
                      className="absolute bottom-3.5 left-3.5 z-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 animate-pulse"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Product Video</span>
                    </button>
                  )}

                  {/* Gallery Navigation Arrows (if multiple images) */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 shadow-md z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 shadow-md z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Zoom Helper hint */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="w-3 h-3" />
                    <span>Hover to Zoom</span>
                  </div>
                </div>
              )}

              {/* Thumbnails Row (Images + Video + 3D button) */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      setActiveImgIndex(idx);
                      setActiveMediaType('image');
                    }}
                    className={`relative w-16 sm:w-20 h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeMediaType === 'image' && (selectedImage === img || (!selectedImage && idx === 0))
                        ? 'border-blue-600 ring-4 ring-blue-50 shadow-md scale-[1.02]'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`${product.name} preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {activeMediaType === 'image' && (selectedImage === img || (!selectedImage && idx === 0)) && (
                      <div className="absolute inset-0 bg-blue-600/10" />
                    )}
                  </button>
                ))}

                {/* 3D Motion Thumbnail Button */}
                <button
                  onClick={() => {
                    setActiveMediaType('3d');
                    setIs3DAutoSpin(true);
                  }}
                  className={`relative w-16 sm:w-20 h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-gradient-to-br from-slate-900 to-purple-950 flex flex-col items-center justify-center text-white ${
                    activeMediaType === '3d'
                      ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-md scale-[1.02]'
                      : 'border-slate-800 opacity-80 hover:opacity-100 hover:border-purple-500/50'
                  }`}
                  title="3D Motion 360° Spin"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 mb-0.5 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-200">
                    3D SPIN
                  </span>
                </button>

                {/* Video Thumbnail Button */}
                {product.videoUrl && (
                  <button
                    onClick={() => setActiveMediaType('video')}
                    className={`relative w-16 sm:w-20 h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-950 flex flex-col items-center justify-center text-white ${
                      activeMediaType === 'video'
                        ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-md scale-[1.02]'
                        : 'border-slate-800 opacity-80 hover:opacity-100 hover:border-indigo-500/50'
                    }`}
                    title="Watch Product Video"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white mb-0.5 shadow">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">
                      VIDEO
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Product Info & Conversion Engine (7 cols) */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between">
              <div>
                {/* Brand & Stock Pill Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                      JUST JEANS BD • AUTHENTIC
                    </span>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentStock > 0 ? `IN STOCK (${currentStock} left)` : 'OUT OF STOCK'}
                  </div>
                </div>

                {/* Product Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-1.5">
                  {product.name}
                </h1>
                {product.titleBn && (
                  <p className="text-sm font-medium text-slate-500 mb-3">{product.titleBn}</p>
                )}

                {/* SKU & Ratings & Social Sharing */}
                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-y border-slate-100 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">
                      SKU: <span className="font-mono font-bold text-slate-800">{currentVariant?.sku || 'JBD-JEAN-01'}</span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>{product.rating || '4.9'}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount || 12})</span>
                    </div>
                  </div>

                  {/* Social Share Bar */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Share:</span>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/80">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Facebook"
                        className="w-6 h-6 rounded-md hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-slate-600 transition-all"
                      >
                        <Facebook className="w-3 h-3 fill-current" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on X"
                        className="w-6 h-6 rounded-md hover:bg-black hover:text-white flex items-center justify-center text-slate-600 transition-all"
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
                        className="w-6 h-6 rounded-md hover:bg-[#25D366] hover:text-white flex items-center justify-center text-slate-600 transition-all"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                        </svg>
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent('Check out this product on Jeans BD: ' + shareUrl)}`}
                        title="Share via Email"
                        className="w-6 h-6 rounded-md hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-600 transition-all"
                      >
                        <Mail className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Price Display Card */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-6">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">PRICE:</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                      {formatPrice(effectivePrice)}
                    </span>
                    {product.price > effectivePrice && (
                      <span className="text-lg text-slate-400 line-through font-bold">
                        {formatPrice(product.price)}
                      </span>
                    )}
                    {discountAmount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                        <Flame className="w-3 h-3 fill-current" />
                        {discountAmount} ৳ OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-slate-600">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Free delivery on orders over ৳3,000 | Cash on Delivery available</span>
                  </div>
                </div>

                {/* Color Selector */}
                {uniqueColors.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Select Your Color: <span className="text-blue-600 font-extrabold ml-1">{selectedColor}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {uniqueColors.map((c: any) => (
                        <button
                          key={c.color}
                          onClick={() => setSelectedColor(c.color)}
                          className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                            selectedColor === c.color
                              ? 'border-slate-950 bg-slate-950 text-white shadow-md ring-2 ring-slate-900/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner inline-block"
                            style={{ backgroundColor: c.hex || '#1e293b' }}
                          />
                          <span>{c.color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Select Your Size: <span className="text-blue-600 font-extrabold ml-1">{selectedSize}</span>
                    </span>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 h-11 px-3.5 rounded-xl font-black text-sm border transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-900/20 scale-[1.02]'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Short Description */}
                {product.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    {product.description}
                  </p>
                )}

                {/* Quantity Selector */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    QUANTITY:
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-black text-base transition-colors active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-black text-slate-900 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-black text-base transition-colors active:scale-95"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    Subtotal: <span className="text-sm font-black text-slate-900">{formatPrice(effectivePrice * quantity)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200/80">
                {/* AI Virtual Try-On Primary Launcher */}
                {product.virtualTryOnEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => setIsTryOnOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 hover:from-purple-800 hover:via-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 border border-purple-400/40 transition-all hover:shadow-xl group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    </div>
                    <span>🪄 TRY IT ON (ভার্চুয়াল ফিটিং রুম)</span>
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-normal ml-1">
                      LIVE AR
                    </span>
                  </button>
                )}

                {/* Primary Actions: Add to Cart (Deep Indigo Denim) + Buy Now (Vibrant Crimson) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className="w-full bg-[#1e293b] hover:bg-slate-900 active:scale-[0.98] text-white py-3.5 px-5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:bg-slate-300 disabled:cursor-not-allowed group"
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-blue-400" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={currentStock <= 0}
                    className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white py-3.5 px-5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-red-500/20 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed group"
                  >
                    <Zap className="w-5 h-5 fill-current text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Buy Now (অর্ডার করুন)</span>
                  </button>
                </div>

                {/* Instant Order / Direct Assistance Hub */}
                <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Direct & Instant Ordering:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Available 24/7
                    </span>
                  </div>

                  {/* 3 Direct Channels: Call Now, WhatsApp, Messenger */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Call Now */}
                    <a
                      href={`tel:${telNumber}`}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>কল করুন: {displayPhone}</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={whatsAppOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                      </svg>
                      <span>হোয়াটসঅ্যাপ</span>
                    </a>

                    {/* Messenger */}
                    <a
                      href={messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0084FF] hover:bg-[#0074e0] active:scale-[0.98] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                      </svg>
                      <span>ম্যাসেঞ্জার অর্ডার</span>
                    </a>
                  </div>
                </div>

                {/* Trust & Guarantee Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-700">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="text-[10px] leading-tight">
                      <div className="font-bold text-slate-900">24-48h Delivery</div>
                      <div className="text-slate-500">Dhaka & Nationwide</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-700">
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-[10px] leading-tight">
                      <div className="font-bold text-slate-900">Cash on Delivery</div>
                      <div className="text-slate-500">Pay at doorstep</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-700">
                    <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="text-[10px] leading-tight">
                      <div className="font-bold text-slate-900">7 Days Exchange</div>
                      <div className="text-slate-500">Hassle-free swap</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="text-[10px] leading-tight">
                      <div className="font-bold text-slate-900">100% Authentic</div>
                      <div className="text-slate-500">Premium Denim</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200/90 shadow-sm mb-16">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-4 sm:gap-8 overflow-x-auto pb-px mb-8 scrollbar-none">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Description & Highlights
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Specifications & Fit
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'care'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Fabric & Care Guide
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Customer Reviews</span>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {product.reviewCount || reviewsList.length}
              </span>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'desc' && (
            <div className="max-w-4xl space-y-6 text-slate-700 leading-relaxed text-sm">
              <p className="text-base text-slate-800 font-medium">{product.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Authentic Denim Weave</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Crafted with premium high-density cotton yarn tailored specifically for comfort, durability, and breathability in the Bangladesh climate.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/80">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Shape Retention Technology</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Engineered waistband and inseam stitching ensure the jeans retain their sharp silhouette and comfortable drape after every wash.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="max-w-4xl">
              <div className="space-y-3">
                {product.fabricCare.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-4xl">
              {/* Reviews Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-2xl border border-slate-200/80">
                <div className="text-center md:text-left flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">{product.rating}</span>
                  <div className="flex justify-center md:justify-start text-amber-400 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Based on {product.reviewCount} verified customer reviews</span>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-black text-sm text-slate-900 mb-3 uppercase tracking-wider">Leave a Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Your Name (e.g. Asif Karim)"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
                        <span className="text-xs font-bold text-slate-600">Rating:</span>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="text-xs font-bold text-amber-600 bg-transparent focus:outline-none cursor-pointer"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                          <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                          <option value={3}>⭐⭐⭐ (3/5)</option>
                          <option value={2}>⭐⭐ (2/5)</option>
                          <option value={1}>⭐ (1/5)</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience about fit, fabric quality, comfort and sizing..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="bg-slate-950 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Post Verified Review
                      </button>
                      {reviewSuccess && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Review posted successfully!
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Reviews List */}
              <div className="divide-y divide-slate-100">
                {reviewsList.map((rev: any) => (
                  <div key={rev.id} className="py-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{rev.createdAt}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Complete Your Look / Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  Complete Your Look
                </h3>
                <p className="text-xs text-slate-500">Handpicked denim essentials matching this style</p>
              </div>
              <Link href="/shop" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>View All Collection</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        gender={product.gender}
      />

      {/* AI Virtual Try-On Modal */}
      {product && (
        <VirtualTryOnModal
          product={product}
          initialSize={selectedSize}
          initialColor={selectedColor}
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
        />
      )}
    </div>
  );
}
