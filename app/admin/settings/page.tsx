'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Store,
  Truck,
  CreditCard,
  LayoutTemplate,
  Rows,
  Save,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  Star,
  ExternalLink,
  Zap,
  Quote,
  Instagram,
  ShieldCheck,
  Sliders,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { formatPrice } from '@/lib/utils';
import ImageUploadField from '@/components/admin/ImageUploadField';

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading store settings...</div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab') || 'store';

  const { siteSettings, updateSiteSettings } = useProducts();

  const [activeTab, setActiveTab] = useState<'store' | 'shipping' | 'payments' | 'home' | 'header-footer'>(
    (urlTab as any) || 'store'
  );

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab as any);
    }
  }, [urlTab]);

  // Tab 1: Store states
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [tagline, setTagline] = useState(siteSettings.tagline || 'Premium Denim Fashion Bangladesh');
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl || '/logo.svg');
  const [phone, setPhone] = useState(siteSettings.phone);
  const [email, setEmail] = useState(siteSettings.email);
  const [address, setAddress] = useState(siteSettings.address);
  const [googleMapUrl, setGoogleMapUrl] = useState(siteSettings.googleMapUrl || '');

  // Tab 2: Shipping states
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(siteSettings.freeShippingThreshold);
  const [deliveryChargeDhaka, setDeliveryChargeDhaka] = useState(siteSettings.deliveryChargeDhaka);
  const [deliveryChargeOutsideDhaka, setDeliveryChargeOutsideDhaka] = useState(siteSettings.deliveryChargeOutsideDhaka);
  const [defaultCourier, setDefaultCourier] = useState('Steadfast Courier');

  // Tab 3: Payments states
  const [enableCod, setEnableCod] = useState(true);
  const [enableBkash, setEnableBkash] = useState(true);
  const [enableNagad, setEnableNagad] = useState(true);
  const [bkashNumber, setBkashNumber] = useState(siteSettings.bkashNumber || '01775743148');
  const [nagadNumber, setNagadNumber] = useState(siteSettings.nagadNumber || '01775743148');

  // Tab 4: Home Sections states
  // 1. Hero Slides
  const [heroSlides, setHeroSlides] = useState(siteSettings.banners.heroSlides || []);
  
  // 2. Promo Banner
  const [promoBadge, setPromoBadge] = useState(siteSettings.promoBanner?.badge || 'LIMITED TIME OFFER');
  const [promoTitle, setPromoTitle] = useState(siteSettings.promoBanner?.title || 'UP TO 30% OFF ALL PREMIUM DENIM');
  const [promoDesc, setPromoDesc] = useState(
    siteSettings.promoBanner?.description ||
      'Use promo code JEANS10 at checkout for an instant extra 10% discount on all orders over ৳1,500. Free delivery included for orders above ৳2,500.'
  );
  const [promoCode, setPromoCode] = useState(siteSettings.promoBanner?.couponCode || 'JEANS10');
  const [promoBtnText, setPromoBtnText] = useState(siteSettings.promoBanner?.buttonText || 'Claim Discount Now');
  const [promoBtnLink, setPromoBtnLink] = useState(siteSettings.promoBanner?.buttonLink || '/shop?filter=sale');
  const [promoImgUrl, setPromoImgUrl] = useState(
    siteSettings.promoBanner?.imageUrl ||
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80'
  );
  const [promoImgTag, setPromoImgTag] = useState(siteSettings.promoBanner?.imageTag || 'SIGNATURE FIT COLLECTION');

  // 3. Customer Reviews
  const [reviewsBadge, setReviewsBadge] = useState(siteSettings.customerReviews?.badge || 'VERIFIED CUSTOMER FEEDBACK');
  const [reviewsTitle, setReviewsTitle] = useState(siteSettings.customerReviews?.title || 'LOVED ACROSS BANGLADESH');
  const [reviewsSubtitle, setReviewsSubtitle] = useState(
    siteSettings.customerReviews?.subtitle || 'Over 15,000+ pairs delivered nationwide with a 4.9/5 satisfaction rate.'
  );
  const [reviewItems, setReviewItems] = useState(siteSettings.customerReviews?.items || []);

  // 4. Instagram Feed
  const [igHandle, setIgHandle] = useState(siteSettings.instagramFeed?.handle || '@JEANSBD_OFFICIAL');
  const [igTitle, setIgTitle] = useState(siteSettings.instagramFeed?.title || 'Wear It. Tag It. #JeansBDStyle');
  const [igUrl, setIgUrl] = useState(siteSettings.instagramFeed?.url || 'https://instagram.com/jeansbd');
  const [igImages, setIgImages] = useState<string[]>(
    siteSettings.instagramFeed?.images || [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    ]
  );

  // Tab 5: Header & Footer states
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcementText);
  const [facebookUrl, setFacebookUrl] = useState(siteSettings.socialLinks.facebook || 'https://www.facebook.com/share/1F7Qzp3uzD/');
  const [instagramUrl, setInstagramUrl] = useState(siteSettings.socialLinks.instagram || 'https://instagram.com/jeansbd');
  const [youtubeUrl, setYoutubeUrl] = useState(siteSettings.socialLinks.youtube || 'https://youtube.com/@jeansbd');

  // Trust Badges
  const [badgeDeliveryTitle, setBadgeDeliveryTitle] = useState(siteSettings.trustBadges?.deliveryTitle || 'Nationwide Delivery');
  const [badgeDeliverySub, setBadgeDeliverySub] = useState(siteSettings.trustBadges?.deliverySubtitle || '24-48h Dhaka, 48-72h All BD');
  const [badgeCottonTitle, setBadgeCottonTitle] = useState(siteSettings.trustBadges?.cottonTitle || '100% Authentic Cotton');
  const [badgeCottonSub, setBadgeCottonSub] = useState(siteSettings.trustBadges?.cottonSubtitle || 'Premium Turkish Ring-Spun');
  const [badgeExchangeTitle, setBadgeExchangeTitle] = useState(siteSettings.trustBadges?.exchangeTitle || 'Hassle-Free Exchange');
  const [badgeExchangeSub, setBadgeExchangeSub] = useState(siteSettings.trustBadges?.exchangeSubtitle || '7 days size replacement');
  const [badgePaymentTitle, setBadgePaymentTitle] = useState(siteSettings.trustBadges?.paymentTitle || 'Secure Payment');
  const [badgePaymentSub, setBadgePaymentSub] = useState(siteSettings.trustBadges?.paymentSubtitle || 'COD, bKash & Nagad');

  // Footer Description & Copyright
  const [footerBrandDesc, setFooterBrandDesc] = useState(
    siteSettings.footerBrandDescription ||
      "Bangladesh's premier denim destination. Engineered with international quality fabrics, tailored cuts, and contemporary street aesthetic for both men and women."
  );
  const [copyrightText, setCopyrightText] = useState(
    siteSettings.copyrightText || 'All rights reserved. Crafted for Denim Lovers in Bangladesh.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Slide management handlers
  const handleUpdateSlide = (index: number, field: string, val: string) => {
    setHeroSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      badge: 'NEW COLLECTION 2026',
      title: 'NEW DENIM ARRIVAL',
      subtitle: 'Premium authentic denim crafted for style and enduring comfort.',
      buttonText: 'SHOP NOW',
      buttonLink: '/shop',
      button2Text: 'Season Sale',
      button2Link: '/shop?filter=sale',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1920&q=85',
    };
    setHeroSlides((prev) => [...prev, newSlide]);
  };

  const handleDeleteSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert('You must have at least 1 hero banner slide!');
      return;
    }
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
  };

  // Review management handlers
  const handleUpdateReview = (index: number, field: string, val: any) => {
    setReviewItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddReview = () => {
    const newRev = {
      id: `rev-${Date.now()}`,
      name: 'New Customer',
      city: 'Dhaka',
      rating: 5,
      productName: 'Premium Denim Jeans',
      comment: 'Top class quality fabric and fast shipping. Highly recommended!',
    };
    setReviewItems((prev) => [...prev, newRev]);
  };

  const handleDeleteReview = (index: number) => {
    setReviewItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Instagram image updater
  const handleUpdateIgImage = (index: number, val: string) => {
    setIgImages((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      siteName,
      tagline,
      logoUrl,
      phone,
      email,
      address,
      googleMapUrl,
      announcementText,
      freeShippingThreshold,
      deliveryChargeDhaka,
      deliveryChargeOutsideDhaka,
      bkashNumber,
      nagadNumber,
      socialLinks: {
        facebook: facebookUrl,
        instagram: instagramUrl,
        youtube: youtubeUrl,
      },
      banners: {
        heroSlides,
      },
      promoBanner: {
        badge: promoBadge,
        title: promoTitle,
        description: promoDesc,
        couponCode: promoCode,
        buttonText: promoBtnText,
        buttonLink: promoBtnLink,
        imageUrl: promoImgUrl,
        imageTag: promoImgTag,
      },
      customerReviews: {
        badge: reviewsBadge,
        title: reviewsTitle,
        subtitle: reviewsSubtitle,
        items: reviewItems,
      },
      instagramFeed: {
        handle: igHandle,
        title: igTitle,
        url: igUrl,
        images: igImages,
      },
      trustBadges: {
        deliveryTitle: badgeDeliveryTitle,
        deliverySubtitle: badgeDeliverySub,
        cottonTitle: badgeCottonTitle,
        cottonSubtitle: badgeCottonSub,
        exchangeTitle: badgeExchangeTitle,
        exchangeSubtitle: badgeExchangeSub,
        paymentTitle: badgePaymentTitle,
        paymentSubtitle: badgePaymentSub,
      },
      footerBrandDescription: footerBrandDesc,
      copyrightText: copyrightText,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const tabs = [
    { id: 'store', label: 'Store Details', icon: Store },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'home', label: 'Home Sections (Visuals & Reviews)', icon: LayoutTemplate },
    { id: 'header-footer', label: 'Trust Badges & Footer', icon: Rows },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Store Settings & Homepage Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your hero banners, flash promo card, customer reviews, Instagram showcase, and footer details
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl animate-fade-in shadow-lg">
              <Check className="w-4 h-4" />
              Changes saved successfully!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Store Details */}
        {activeTab === 'store' && (
          <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-5 animate-fade-in">
            <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Store className="w-4 h-4 text-blue-400" />
              <span>Business Profile & Contact Hotlines</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Store / Brand Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <ImageUploadField
                  label="Official Brand Logo (Upload from Computer)"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  aspect="square"
                  helpText="Select your official brand logo image from your computer."
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">
                  Customer Care Helpline Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Official Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">
                Storefront / Office Physical Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">
                Google Maps Share Link URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-mono"
                  placeholder="https://share.google/..."
                />
                {googleMapUrl && (
                  <a
                    href={googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Test</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Shipping & Delivery */}
        {activeTab === 'shipping' && (
          <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4 animate-fade-in">
            <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Courier Delivery Rates & Policies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Inside Dhaka Charge (৳)</label>
                <input
                  type="number"
                  value={deliveryChargeDhaka}
                  onChange={(e) => setDeliveryChargeDhaka(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Outside Dhaka Charge (৳)</label>
                <input
                  type="number"
                  value={deliveryChargeOutsideDhaka}
                  onChange={(e) => setDeliveryChargeOutsideDhaka(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Free Shipping Threshold (৳)</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Integrated Courier Partner</label>
              <input
                type="text"
                value={defaultCourier}
                onChange={(e) => setDefaultCourier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Payment Methods */}
        {activeTab === 'payments' && (
          <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4 animate-fade-in">
            <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <CreditCard className="w-4 h-4 text-pink-400" />
              <span>Checkout Payment Gateways</span>
            </h3>

            {/* COD */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">Cash on Delivery (COD)</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pay in cash upon doorstep package inspection</p>
              </div>
              <input
                type="checkbox"
                checked={enableCod}
                onChange={(e) => setEnableCod(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 bg-slate-950 border-slate-700"
              />
            </div>

            {/* bKash */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e2136e] text-white font-black text-xs px-2.5 py-0.5 rounded">bKash</span>
                  <h4 className="font-bold text-white text-sm">bKash Merchant / Personal</h4>
                </div>
                <input
                  type="checkbox"
                  checked={enableBkash}
                  onChange={(e) => setEnableBkash(e.target.checked)}
                  className="w-5 h-5 rounded text-pink-600 bg-slate-950 border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">bKash Account Number</label>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Nagad */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-[#f7941d] text-white font-black text-xs px-2.5 py-0.5 rounded">Nagad</span>
                  <h4 className="font-bold text-white text-sm">Nagad Payment Gateway</h4>
                </div>
                <input
                  type="checkbox"
                  checked={enableNagad}
                  onChange={(e) => setEnableNagad(e.target.checked)}
                  className="w-5 h-5 rounded text-orange-600 bg-slate-950 border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Nagad Account Number</label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Home Sections (Hero, Promo Banner, Reviews, Instagram) */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            {/* 1. HERO SLIDER BANNER (Screenshot 1) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Hero Carousel Banner Slides</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure the main sliding banners seen at the very top of your homepage (Screenshot 1)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Slide</span>
                </button>
              </div>

              <div className="space-y-6">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-white text-sm">Slide #{idx + 1}: {slide.title || 'Untitled'}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Slide Badge Text (e.g. WOMEN DENIM EDIT)
                        </label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => handleUpdateSlide(idx, 'badge', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                          placeholder="WOMEN DENIM EDIT"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Main Slide Title
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                          placeholder="HIGH-RISE & EFFORTLESS CHIC"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Slide Subtitle / Description
                        </label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs"
                          placeholder="From wide leg drapes to vintage mom cuts — sculpt your look with ultimate comfort."
                        />
                      </div>

                      {/* Button 1 */}
                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Button 1 Text (Primary)
                        </label>
                        <input
                          type="text"
                          value={slide.buttonText}
                          onChange={(e) => handleUpdateSlide(idx, 'buttonText', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                          placeholder="EXPLORE WOMEN"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Button 1 Link URL
                        </label>
                        <input
                          type="text"
                          value={slide.buttonLink}
                          onChange={(e) => handleUpdateSlide(idx, 'buttonLink', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                          placeholder="/shop?gender=women"
                        />
                      </div>

                      {/* Button 2 */}
                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Button 2 Text (Secondary)
                        </label>
                        <input
                          type="text"
                          value={slide.button2Text || ''}
                          onChange={(e) => handleUpdateSlide(idx, 'button2Text', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                          placeholder="Season Sale - Up to 70% Off"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                          Button 2 Link URL
                        </label>
                        <input
                          type="text"
                          value={slide.button2Link || ''}
                          onChange={(e) => handleUpdateSlide(idx, 'button2Link', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                          placeholder="/shop?filter=sale"
                        />
                      </div>

                      {/* Image Upload from Computer */}
                      <div className="md:col-span-2">
                        <ImageUploadField
                          label="Slide Background Image (Upload from Computer)"
                          value={slide.imageUrl}
                          onChange={(val) => handleUpdateSlide(idx, 'imageUrl', val)}
                          aspect="landscape"
                          helpText="Upload a high-resolution hero banner photo from your computer."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. FLASH OFFER / PROMO BANNER (Screenshot 2) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Flash Offer / Promo Banner Section</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure the highlighted promo card with coupon code and side featured picture (Screenshot 2)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Badge Text (e.g. LIMITED TIME OFFER)
                  </label>
                  <input
                    type="text"
                    value={promoBadge}
                    onChange={(e) => setPromoBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Coupon Code (e.g. JEANS10)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-mono font-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Main Promo Headline
                  </label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm font-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Offer Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={promoBtnText}
                    onChange={(e) => setPromoBtnText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Button Link URL
                  </label>
                  <input
                    type="text"
                    value={promoBtnLink}
                    onChange={(e) => setPromoBtnLink(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Side Image Bottom Tag
                  </label>
                  <input
                    type="text"
                    value={promoImgTag}
                    onChange={(e) => setPromoImgTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                    placeholder="SIGNATURE FIT COLLECTION"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Side Featured Image (Upload from Computer)"
                    value={promoImgUrl}
                    onChange={setPromoImgUrl}
                    aspect="portrait"
                    helpText="Upload a 3:4 portrait photo of denim jeans or model from your computer."
                  />
                </div>
              </div>
            </div>

            {/* 3. VERIFIED CUSTOMER FEEDBACK (Screenshot 3) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                    <Quote className="w-5 h-5 text-blue-400" />
                    <span>Customer Feedback & Reviews (Loved Across Bangladesh)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage testimonials, client ratings, and cities shown in the reviews section (Screenshot 3)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddReview}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </button>
              </div>

              {/* Header texts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={reviewsBadge}
                    onChange={(e) => setReviewsBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={reviewsTitle}
                    onChange={(e) => setReviewsTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={reviewsSubtitle}
                    onChange={(e) => setReviewsSubtitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {reviewItems.map((rev, idx) => (
                  <div
                    key={rev.id || idx}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">{rev.name}</span>
                        <span className="text-slate-400 text-xs">({rev.city})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(idx)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Customer Name</label>
                        <input
                          type="text"
                          value={rev.name}
                          onChange={(e) => handleUpdateReview(idx, 'name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">City / Area</label>
                        <input
                          type="text"
                          value={rev.city}
                          onChange={(e) => handleUpdateReview(idx, 'city', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Star Rating (1 - 5)</label>
                        <select
                          value={rev.rating}
                          onChange={(e) => handleUpdateReview(idx, 'rating', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                        >
                          <option value={5}>5 Stars ★★★★★</option>
                          <option value={4}>4 Stars ★★★★☆</option>
                          <option value={3}>3 Stars ★★★☆☆</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Product Purchased</label>
                        <input
                          type="text"
                          value={rev.productName || ''}
                          onChange={(e) => handleUpdateReview(idx, 'productName', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                          placeholder="Vintage Washed Slim Tapered Jeans"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Review Comment</label>
                        <textarea
                          rows={2}
                          value={rev.comment}
                          onChange={(e) => handleUpdateReview(idx, 'comment', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. INSTAGRAM FEED SHOWCASE (Screenshot 4) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <span>Instagram Feed & Lookbook Gallery (Screenshot 4)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your Instagram profile handle, section heading, and all 6 showcase product looks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Instagram Handle (e.g. @JEANSBD_OFFICIAL)
                  </label>
                  <input
                    type="text"
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Title (e.g. Wear It. Tag It. #JeansBDStyle)
                  </label>
                  <input
                    type="text"
                    value={igTitle}
                    onChange={(e) => setIgTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Profile URL
                  </label>
                  <input
                    type="url"
                    value={igUrl}
                    onChange={(e) => setIgUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* 6 Images Grid */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <label className="block text-slate-300 font-bold uppercase text-xs">
                    6 Instagram Lookbook Photos (Upload from Computer)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Click 'Upload from Computer' on each slot to add photos directly from your device
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {igImages.map((img, i) => (
                    <ImageUploadField
                      key={i}
                      label={`Instagram Look #${i + 1}`}
                      value={img}
                      onChange={(val) => handleUpdateIgImage(i, val)}
                      aspect="square"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Trust Badges & Footer (Screenshot 5) */}
        {activeTab === 'header-footer' && (
          <div className="space-y-6 animate-fade-in">
            {/* Trust Badges */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>4 Value Badges Above Footer (Screenshot 5)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize the titles and sub-text for the 4 promise badges shown at the bottom of every page
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Badge 1: Delivery */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1">
                    <Truck className="w-4 h-4" />
                    <span>Badge 1 (Delivery)</span>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={badgeDeliveryTitle}
                      onChange={(e) => setBadgeDeliveryTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={badgeDeliverySub}
                      onChange={(e) => setBadgeDeliverySub(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Badge 2: Cotton */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Badge 2 (Fabric / Quality)</span>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={badgeCottonTitle}
                      onChange={(e) => setBadgeCottonTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={badgeCottonSub}
                      onChange={(e) => setBadgeCottonSub(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Badge 3: Exchange */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Badge 3 (Exchange / Return)</span>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={badgeExchangeTitle}
                      onChange={(e) => setBadgeExchangeTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={badgeExchangeSub}
                      onChange={(e) => setBadgeExchangeSub(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Badge 4: Payment */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span>Badge 4 (Payment Security)</span>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={badgePaymentTitle}
                      onChange={(e) => setBadgePaymentTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={badgePaymentSub}
                      onChange={(e) => setBadgePaymentSub(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bio & Copyright */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                  <Rows className="w-5 h-5 text-amber-400" />
                  <span>Footer Brand Bio & Copyright Notice</span>
                </h3>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-xs mb-1">
                  Footer Brand Bio Description
                </label>
                <textarea
                  rows={3}
                  value={footerBrandDesc}
                  onChange={(e) => setFooterBrandDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-xs mb-1">
                  Footer Copyright Line (Appears after "© {new Date().getFullYear()} Jeans BD.")
                </label>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs"
                />
              </div>
            </div>

            {/* Announcement Bar & Socials */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Top Marquee Bar & Social Media Handles</span>
              </h3>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">
                  Top Announcement Bar Marquee Text
                </label>
                <textarea
                  rows={2}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Facebook Page</label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Instagram Profile</label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">YouTube Channel</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at bottom */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400">
            Clicking Save will update the frontend and synchronize your live store immediately.
          </span>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
