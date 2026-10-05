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
  Phone,
  Mail,
  Facebook,
  Linkedin,
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

  const { getProductBySlug, products, addReview, siteSettings } = useProducts();
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
  const [shareUrl, setShareUrl] = useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

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

  // Phone and messaging links configured from settings or user's provided contact info
  const rawPhone = siteSettings?.phone || '01775743148';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const displayPhone = cleanPhone.startsWith('88') ? cleanPhone.replace(/^88/, '') : cleanPhone;
  const formattedDisplayPhone = rawPhone.startsWith('+') ? rawPhone : `+88${displayPhone}`;
  const telNumber = rawPhone.startsWith('+') ? rawPhone : `+88${displayPhone}`;
  const waPhoneIntl = `88${displayPhone.replace(/^0/, '')}`;

  const whatsAppOrderText = `আসসালামু আলাইকুম, আমি অর্ডার করতে চাই:\nপ্রোডাক্ট: ${product.name}\nSKU: ${currentVariant?.sku || 'JBD-001'}\nসাইজ: ${selectedSize || 'N/A'}\nকালার: ${selectedColor || 'N/A'}\nপরিমাণ: ${quantity}\nমূল্য: ৳${effectivePrice * quantity}\nলিঙ্ক: ${shareUrl}`;
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
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-1">
                {product.name}
              </h1>
              {product.titleBn && (
                <p className="text-sm font-medium text-slate-400 mb-2">{product.titleBn}</p>
              )}

              {/* SKU & Social Share Icons row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    SKU: <span className="font-normal text-slate-600">{currentVariant?.sku || 'SKU-0001'}</span>
                  </span>
                </div>

                {/* Social Share Icons Bar */}
                <div className="flex items-center gap-1.5 border border-slate-200/90 rounded-lg p-1 bg-white shadow-sm">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Facebook"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on X"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-black hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on LinkedIn"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' - ' + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on WhatsApp"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#25D366] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                    </svg>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent('Check out this product on Jeans BD: ' + shareUrl)}`}
                    title="Share via Email"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Price Line styled like reference: PRICE: ৳950 ৳1590 [ 640 ৳ off ] */}
              <div className="flex flex-wrap items-baseline gap-2.5 mb-5">
                <span className="text-sm font-bold text-slate-900 tracking-wider">PRICE:</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-950">
                  {formatPrice(effectivePrice)}
                </span>
                {product.price > effectivePrice && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
                {product.price > effectivePrice && (
                  <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
                    {product.price - effectivePrice} ৳ off
                  </span>
                )}
              </div>

              {/* Color Selection: "Select Your Color:" */}
              {uniqueColors.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Select Your Color:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {uniqueColors.map((c: any) => (
                      <button
                        key={c.color}
                        onClick={() => setSelectedColor(c.color)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
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

              {/* Size Selection: "Select Your Size:" */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Your Size:
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
                      className={`min-w-11 h-9 px-3 rounded-lg font-bold text-sm border transition-all ${
                        selectedSize === size
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand & Status line as in reference */}
              <div className="space-y-1 mb-4 text-xs font-bold uppercase tracking-wider">
                <div className="text-slate-700">
                  BRAND: <span className="font-bold text-slate-900">JUST JEANS BD</span>
                </div>
                <div className="text-slate-700">
                  STATUS:{' '}
                  <span className="text-emerald-600 font-bold">
                    {currentStock > 0 ? `IN STOCK (${currentStock} left)` : 'OUT OF STOCK'}
                  </span>
                </div>
              </div>

              {/* Short Description text if present */}
              {product.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 pb-3 border-b border-slate-100">
                  {product.description}
                </p>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  QUANTITY:
                </span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1.5 text-sm font-bold text-slate-900 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Total: {formatPrice(effectivePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons styled exactly like reference screenshot */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              {/* Row 1: Add to Cart (Blue) and Buy Now (Red) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-300" />
                      Added to Bag!
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="w-full bg-[#ef4444] hover:bg-red-600 text-white py-3 px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Row 2: Call Now: +8801775743148 */}
              <a
                href={`tel:${telNumber}`}
                className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call Now: {formattedDisplayPhone}</span>
              </a>

              {/* Row 3: WhatsApp button (Green with WhatsApp Icon) */}
              <a
                href={whatsAppOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#22c55e] hover:bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                </svg>
                <span>{displayPhone}</span>
              </a>

              {/* Row 4: Messenger button (Green with Messenger Icon) */}
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#22c55e] hover:bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                </svg>
                <span>ম্যাসেঞ্জার অর্ডার</span>
              </a>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                    isWished ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                  <span>{isWished ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>24-48h Dhaka Delivery</span>
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
