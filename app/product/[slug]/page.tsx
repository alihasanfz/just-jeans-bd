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
  Share2,
  MessageSquare,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/ui/ProductCard';
import SizeGuideModal from '@/components/ui/SizeGuideModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { getProductBySlug, products, addReview } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const product = getProductBySlug(slug);

  // States
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'reviews'>('desc');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

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
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) || product.variants[0];

  const currentStock = currentVariant ? currentVariant.stock : product.totalStock;
  const isWished = isInWishlist(product.id);
  const effectivePrice = product.discountPrice || product.price;

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
      comment: 'Excellent fit! The stretch is super comfortable for daily wear.',
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
    <div className="bg-slate-50/50 py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?gender=${product.gender}`} className="hover:text-slate-700 capitalize">
            {product.gender}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?fit=${encodeURIComponent(product.fit)}`} className="hover:text-slate-700">
            {product.fit}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold truncate">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={selectedImage || product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discountPercentage && product.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                  -{product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img
                        ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                  {product.gender.toUpperCase()} • {product.fit}
                </span>
                <span className="text-xs font-semibold text-slate-400">SKU: {currentVariant?.sku || 'JBD-001'}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight mb-1">
                {product.name}
              </h1>
              {product.titleBn && (
                <p className="text-sm font-medium text-slate-400 mb-3">{product.titleBn}</p>
              )}

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentStock > 0 ? `In Stock (${currentStock} left)` : 'Out of Stock'}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl lg:text-4xl font-black text-slate-900">
                  {formatPrice(effectivePrice)}
                </span>
                {product.discountPrice && (
                  <span className="text-lg text-slate-400 line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="bg-red-50 text-red-600 text-xs font-extrabold px-2.5 py-1 rounded-full border border-red-100">
                    Save ৳{product.price - product.discountPrice!}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Color: <span className="font-semibold text-slate-600">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {uniqueColors.map((c: any) => (
                      <button
                        key={c.color}
                        onClick={() => setSelectedColor(c.color)}
                        className={`w-9 h-9 rounded-full border-2 transition-all p-0.5 ${
                          selectedColor === c.color
                            ? 'border-blue-600 ring-4 ring-blue-100 scale-105'
                            : 'border-slate-300 hover:border-slate-400'
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
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Waist Size
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3 rounded-xl font-bold text-sm border transition-all ${
                        selectedSize === size
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Total: {formatPrice(effectivePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="w-full bg-slate-900 hover:bg-black text-white py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:bg-slate-300"
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
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:bg-slate-300"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  Order Now (Cash on Delivery)
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-colors ${
                    isWished ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                  <span>{isWished ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <div className="flex items-center gap-4 text-slate-500 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>24-48h Dhaka Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Description / Specs / Care / Reviews */}
        <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200/80 shadow-sm mb-16">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-px mb-8">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'desc'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'specs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Specifications & Details
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'care'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Fabric & Care
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Customer Reviews</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                {product.reviewCount}
              </span>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'desc' && (
            <div className="max-w-3xl space-y-4 text-slate-700 leading-relaxed text-sm">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Authentic Denim Weave</h4>
                  <p className="text-xs text-slate-500">Premium yarn structure built for maximum breathability in Bangladeshi climates.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">Tailored Comfort Fit</h4>
                  <p className="text-xs text-slate-500">Form retention technology that maintains waistband geometry throughout the day.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              <ul className="space-y-3">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="max-w-3xl">
              <ul className="space-y-3">
                {product.fabricCare.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Reviews Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-center md:text-left flex flex-col justify-center">
                  <span className="text-5xl font-black text-slate-900">{product.rating}</span>
                  <div className="flex justify-center md:justify-start text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Based on {product.reviewCount} customer reviews</span>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-bold text-sm text-slate-900 mb-3">Submit Your Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Your Name (e.g. Asif Karim)"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <span className="text-xs font-semibold text-slate-600">Rating:</span>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="text-xs font-bold text-amber-600 bg-transparent focus:outline-none"
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
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    >
                      Post Verified Review
                    </button>
                    {reviewSuccess && (
                      <span className="text-xs text-emerald-600 font-bold ml-3">
                        ✓ Review posted successfully!
                      </span>
                    )}
                  </form>
                </div>
              </div>

              {/* Reviews List */}
              <div className="divide-y divide-slate-100">
                {reviewsList.map((rev: any) => (
                  <div key={rev.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Complete Your Look
              </h3>
              <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
                View All &rarr;
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

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        gender={product.gender}
      />
    </div>
  );
}
