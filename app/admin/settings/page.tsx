'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  Loader2,
  AlertCircle,
  Compass,
  Video,
  Film,
  Play,
  Link2,
  X,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { formatPrice } from '@/lib/utils';
import { parseVideoUrl } from '@/lib/utils/video';
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

  const { siteSettings, updateSiteSettings, categories, isLoaded } = useProducts();

  const [activeTab, setActiveTab] = useState<'store' | 'shipping' | 'payments' | 'home' | 'header-footer'>(
    (urlTab as any) || 'store'
  );

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab as any);
    }
  }, [urlTab]);

  const hasInitializedRef = React.useRef(false);

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
  const [heroSlides, setHeroSlides] = useState(siteSettings.banners?.heroSlides || []);

  // 1.5 Category Showcase
  const [catBadge, setCatBadge] = useState(siteSettings.categoryShowcase?.badge || '◇ SHOP BY CATEGORY');
  const [catTitle, setCatTitle] = useState(siteSettings.categoryShowcase?.title || 'Find Your Perfect Style');
  const [catSubtitle, setCatSubtitle] = useState(
    siteSettings.categoryShowcase?.subtitle ||
      'Explore our wide range of denim for men and women. Quality, comfort and style — all in one place.'
  );
  const [catBtnText, setCatBtnText] = useState(siteSettings.categoryShowcase?.buttonText || 'View All Categories');
  const [catBtnLink, setCatBtnLink] = useState(siteSettings.categoryShowcase?.buttonLink || '/shop');
  
  // 2. Promo Banner
  const [promoBadge, setPromoBadge] = useState(siteSettings.promoBanner?.badge || 'LIMITED TIME OFFER');
  const [promoTitle, setPromoTitle] = useState(siteSettings.promoBanner?.title || 'UP TO 30% OFF');
  const [promoSubtitle, setPromoSubtitle] = useState(siteSettings.promoBanner?.subtitle || 'ALL PREMIUM DENIM');
  const [promoDesc, setPromoDesc] = useState(
    siteSettings.promoBanner?.description ||
      'Upgrade your wardrobe with our exclusive denim collection.'
  );
  const [promoCode, setPromoCode] = useState(siteSettings.promoBanner?.couponCode || 'JEANS10');
  const [promoBtnText, setPromoBtnText] = useState(siteSettings.promoBanner?.buttonText || 'SHOP NOW');
  const [promoBtnLink, setPromoBtnLink] = useState(siteSettings.promoBanner?.buttonLink || '/shop?filter=sale');
  const [promoImgUrl, setPromoImgUrl] = useState(
    siteSettings.promoBanner?.imageUrl ||
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80'
  );
  const [promoImgUrl2, setPromoImgUrl2] = useState(
    siteSettings.promoBanner?.imageUrl2 ||
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
  );
  const [promoImgTag, setPromoImgTag] = useState(siteSettings.promoBanner?.imageTag || 'Good Jeans\nGood Vibes');

  // 3. Denim Fit Guide (Screenshot 2)
  const [fitGuideBadge, setFitGuideBadge] = useState(siteSettings.fitGuide?.badge || 'THE DENIM FIT GUIDE');
  const [fitGuideTitle, setFitGuideTitle] = useState(siteSettings.fitGuide?.title || 'THE DENIM FIT GUIDE');
  const [fitGuideSubtitle, setFitGuideSubtitle] = useState(
    siteSettings.fitGuide?.subtitle || 'Find your perfect fit with our style guide.'
  );
  const [fitGuideItems, setFitGuideItems] = useState(siteSettings.fitGuide?.items || [
    {
      id: 'fit-1',
      name: 'Slim Fit',
      tagline: 'Modern & Tailored',
      desc: 'A modern fit for a sharp look.',
      bestFor: 'Everyday casual, sneakers, dress shirts',
      image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=700&q=80',
      link: '/shop?fit=Slim+Fit',
    },
    {
      id: 'fit-2',
      name: 'Baggy & Relaxed Fit',
      tagline: 'Relaxed Street Silhouette',
      desc: 'Maximum comfort, effortless style.',
      bestFor: 'Streetwear, graphic tees, hoodies',
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
      link: '/shop?fit=Baggy+Fit',
    },
    {
      id: 'fit-3',
      name: 'Straight Leg',
      tagline: 'Timeless Heritage Cut',
      desc: 'Timeless and versatile.',
      bestFor: 'Classic styles, boots, polo shirts',
      image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=700&q=80',
      link: '/shop?fit=Straight+Fit',
    },
    {
      id: 'fit-4',
      name: 'High-Rise Wide Leg',
      tagline: 'Chic Elongated Drape',
      desc: 'Extra adore, modern comfort.',
      bestFor: 'Crop tops, heels, relaxed blazers',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
      link: '/shop?fit=Wide+Leg',
    },
  ]);

  // 4. Customer Reviews
  const [reviewsBadge, setReviewsBadge] = useState(siteSettings.customerReviews?.badge || 'OUR CUSTOMERS LOVE US');
  const [reviewsTitle, setReviewsTitle] = useState(siteSettings.customerReviews?.title || 'Loved Across Bangladesh');
  const [reviewsSubtitle, setReviewsSubtitle] = useState(
    siteSettings.customerReviews?.subtitle || 'Real reviews from real customers. Join thousands who trust Jeans BD.'
  );
  const [reviewsScore, setReviewsScore] = useState(siteSettings.customerReviews?.score || '4.7/5');
  const [reviewsCountText, setReviewsCountText] = useState(
    siteSettings.customerReviews?.reviewCountText || 'Based on 12,540+ reviews'
  );
  const [reviewItems, setReviewItems] = useState(siteSettings.customerReviews?.items || []);

  // 5. Instagram Feed
  const [igBadge, setIgBadge] = useState(siteSettings.instagramFeed?.badge || 'FEATURED LOOKS');
  const [igHandle, setIgHandle] = useState(siteSettings.instagramFeed?.handle || '@jeansbd');
  const [igTitle, setIgTitle] = useState(siteSettings.instagramFeed?.title || 'Wear It. Tag It. #JeansBDStyle');
  const [igUrl, setIgUrl] = useState(siteSettings.instagramFeed?.url || 'https://instagram.com/jeansbd');
  const [igImages, setIgImages] = useState<string[]>(
    siteSettings.instagramFeed?.images || [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
    ]
  );

  // Tab 5: Header & Footer states
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcementText);
  const [facebookUrl, setFacebookUrl] = useState(siteSettings.socialLinks.facebook || 'https://www.facebook.com/share/1F7Qzp3uzD/');
  const [instagramUrl, setInstagramUrl] = useState(siteSettings.socialLinks.instagram || 'https://instagram.com/jeansbd');
  const [tiktokUrl, setTiktokUrl] = useState(siteSettings.socialLinks.tiktok || 'https://tiktok.com/@jeansbd');
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
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && siteSettings && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (siteSettings.siteName) setSiteName(siteSettings.siteName);
      if (siteSettings.tagline) setTagline(siteSettings.tagline);
      if (siteSettings.logoUrl) setLogoUrl(siteSettings.logoUrl);
      if (siteSettings.phone) setPhone(siteSettings.phone);
      if (siteSettings.email) setEmail(siteSettings.email);
      if (siteSettings.address) setAddress(siteSettings.address);
      if (siteSettings.googleMapUrl) setGoogleMapUrl(siteSettings.googleMapUrl);
      if (siteSettings.freeShippingThreshold !== undefined) setFreeShippingThreshold(siteSettings.freeShippingThreshold);
      if (siteSettings.deliveryChargeDhaka !== undefined) setDeliveryChargeDhaka(siteSettings.deliveryChargeDhaka);
      if (siteSettings.deliveryChargeOutsideDhaka !== undefined) setDeliveryChargeOutsideDhaka(siteSettings.deliveryChargeOutsideDhaka);
      if (siteSettings.bkashNumber) setBkashNumber(siteSettings.bkashNumber);
      if (siteSettings.nagadNumber) setNagadNumber(siteSettings.nagadNumber);
      if (siteSettings.banners?.heroSlides?.length) setHeroSlides(siteSettings.banners.heroSlides);
      if (siteSettings.categoryShowcase) {
        if (siteSettings.categoryShowcase.badge) setCatBadge(siteSettings.categoryShowcase.badge);
        if (siteSettings.categoryShowcase.title) setCatTitle(siteSettings.categoryShowcase.title);
        if (siteSettings.categoryShowcase.subtitle) setCatSubtitle(siteSettings.categoryShowcase.subtitle);
        if (siteSettings.categoryShowcase.buttonText) setCatBtnText(siteSettings.categoryShowcase.buttonText);
        if (siteSettings.categoryShowcase.buttonLink) setCatBtnLink(siteSettings.categoryShowcase.buttonLink);
      }
      if (siteSettings.promoBanner) {
        if (siteSettings.promoBanner.badge) setPromoBadge(siteSettings.promoBanner.badge);
        if (siteSettings.promoBanner.title) setPromoTitle(siteSettings.promoBanner.title);
        if (siteSettings.promoBanner.subtitle) setPromoSubtitle(siteSettings.promoBanner.subtitle);
        if (siteSettings.promoBanner.description) setPromoDesc(siteSettings.promoBanner.description);
        if (siteSettings.promoBanner.couponCode) setPromoCode(siteSettings.promoBanner.couponCode);
        if (siteSettings.promoBanner.buttonText) setPromoBtnText(siteSettings.promoBanner.buttonText);
        if (siteSettings.promoBanner.buttonLink) setPromoBtnLink(siteSettings.promoBanner.buttonLink);
        if (siteSettings.promoBanner.imageUrl) setPromoImgUrl(siteSettings.promoBanner.imageUrl);
        if (siteSettings.promoBanner.imageUrl2) setPromoImgUrl2(siteSettings.promoBanner.imageUrl2);
        if (siteSettings.promoBanner.imageTag) setPromoImgTag(siteSettings.promoBanner.imageTag);
      }
      if (siteSettings.fitGuide) {
        if (siteSettings.fitGuide.badge) setFitGuideBadge(siteSettings.fitGuide.badge);
        if (siteSettings.fitGuide.title) setFitGuideTitle(siteSettings.fitGuide.title);
        if (siteSettings.fitGuide.subtitle) setFitGuideSubtitle(siteSettings.fitGuide.subtitle);
        if (siteSettings.fitGuide.items?.length) setFitGuideItems(siteSettings.fitGuide.items);
      }
      if (siteSettings.customerReviews) {
        if (siteSettings.customerReviews.badge) setReviewsBadge(siteSettings.customerReviews.badge);
        if (siteSettings.customerReviews.title) setReviewsTitle(siteSettings.customerReviews.title);
        if (siteSettings.customerReviews.subtitle) setReviewsSubtitle(siteSettings.customerReviews.subtitle);
        if (siteSettings.customerReviews.score) setReviewsScore(siteSettings.customerReviews.score);
        if (siteSettings.customerReviews.reviewCountText) setReviewsCountText(siteSettings.customerReviews.reviewCountText);
        if (siteSettings.customerReviews.items?.length) setReviewItems(siteSettings.customerReviews.items);
      }
      if (siteSettings.instagramFeed) {
        if (siteSettings.instagramFeed.badge) setIgBadge(siteSettings.instagramFeed.badge);
        if (siteSettings.instagramFeed.handle) setIgHandle(siteSettings.instagramFeed.handle);
        if (siteSettings.instagramFeed.title) setIgTitle(siteSettings.instagramFeed.title);
        if (siteSettings.instagramFeed.url) setIgUrl(siteSettings.instagramFeed.url);
        if (siteSettings.instagramFeed.images?.length) setIgImages(siteSettings.instagramFeed.images);
      }
      if (siteSettings.announcementText) setAnnouncementText(siteSettings.announcementText);
      if (siteSettings.socialLinks) {
        if (siteSettings.socialLinks.facebook) setFacebookUrl(siteSettings.socialLinks.facebook);
        if (siteSettings.socialLinks.instagram) setInstagramUrl(siteSettings.socialLinks.instagram);
        if (siteSettings.socialLinks.tiktok) setTiktokUrl(siteSettings.socialLinks.tiktok);
        if (siteSettings.socialLinks.youtube) setYoutubeUrl(siteSettings.socialLinks.youtube);
      }
      if (siteSettings.trustBadges) {
        if (siteSettings.trustBadges.deliveryTitle) setBadgeDeliveryTitle(siteSettings.trustBadges.deliveryTitle);
        if (siteSettings.trustBadges.deliverySubtitle) setBadgeDeliverySub(siteSettings.trustBadges.deliverySubtitle);
        if (siteSettings.trustBadges.cottonTitle) setBadgeCottonTitle(siteSettings.trustBadges.cottonTitle);
        if (siteSettings.trustBadges.cottonSubtitle) setBadgeCottonSub(siteSettings.trustBadges.cottonSubtitle);
        if (siteSettings.trustBadges.exchangeTitle) setBadgeExchangeTitle(siteSettings.trustBadges.exchangeTitle);
        if (siteSettings.trustBadges.exchangeSubtitle) setBadgeExchangeSub(siteSettings.trustBadges.exchangeSubtitle);
        if (siteSettings.trustBadges.paymentTitle) setBadgePaymentTitle(siteSettings.trustBadges.paymentTitle);
        if (siteSettings.trustBadges.paymentSubtitle) setBadgePaymentSub(siteSettings.trustBadges.paymentSubtitle);
      }
      if (siteSettings.footerBrandDescription) setFooterBrandDesc(siteSettings.footerBrandDescription);
      if (siteSettings.copyrightText) setCopyrightText(siteSettings.copyrightText);
    }
  }, [isLoaded, siteSettings]);

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
      imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1920&q=85',
    };
    setHeroSlides((prev) => [...prev, newSlide]);
  };

  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);

  const handleSlideVideoFileUpload = async (idx: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv|avi)$/i.test(file.name)) {
      alert('Please select a valid video file (MP4, WebM, MOV, MKV)');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file exceeds 100MB. For large videos, we recommend uploading to YouTube/Vimeo and pasting the link!');
      return;
    }

    setUploadingSlideIdx(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          handleUpdateSlide(idx, 'videoUrl', data.url);
          setUploadingSlideIdx(null);
          return;
        }
      }
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error || 'Upload failed');
    } catch (err: any) {
      console.error('Slide video upload error:', err);
      alert(`Video upload failed: ${err?.message || 'Please check file or paste a video link'}`);
      setUploadingSlideIdx(null);
    }
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

  // Fit guide management handlers
  const handleUpdateFit = (index: number, field: string, val: string) => {
    setFitGuideItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddFit = () => {
    const newFit = {
      id: `fit-${Date.now()}`,
      name: 'New Denim Fit',
      tagline: 'Contemporary Silhouette',
      desc: 'Engineered for exceptional comfort and all-day drape.',
      bestFor: 'Everyday casual wear',
      image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
      link: '/shop',
    };
    setFitGuideItems((prev) => [...prev, newFit]);
  };

  const handleDeleteFit = (index: number) => {
    if (fitGuideItems.length <= 1) {
      alert('You must have at least 1 fit guide card!');
      return;
    }
    setFitGuideItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Instagram image updater
  const handleUpdateIgImage = (index: number, val: string) => {
    setIgImages((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleAddIgImage = () => {
    setIgImages((prev) => [
      ...prev,
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80',
    ]);
  };

  const handleDeleteIgImage = (index: number) => {
    if (igImages.length <= 1) {
      alert('You must keep at least 1 lookbook photo!');
      return;
    }
    setIgImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [isSaving, setIsSaving] = useState(false);

  // Save handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await updateSiteSettings({
        siteName,
        tagline,
        logoUrl,
        phone,
        email,
        address,
        googleMapUrl,
        announcementText,
        freeShippingThreshold: Number(freeShippingThreshold) || 2500,
        deliveryChargeDhaka: Number(deliveryChargeDhaka) || 80,
        deliveryChargeOutsideDhaka: Number(deliveryChargeOutsideDhaka) || 150,
        bkashNumber,
        nagadNumber,
        socialLinks: {
          facebook: facebookUrl,
          instagram: instagramUrl,
          tiktok: tiktokUrl,
          youtube: youtubeUrl,
        },
        banners: {
          heroSlides,
        },
        categoryShowcase: {
          badge: catBadge,
          title: catTitle,
          subtitle: catSubtitle,
          buttonText: catBtnText,
          buttonLink: catBtnLink,
        },
        promoBanner: {
          badge: promoBadge,
          title: promoTitle,
          subtitle: promoSubtitle,
          description: promoDesc,
          couponCode: promoCode,
          buttonText: promoBtnText,
          buttonLink: promoBtnLink,
          imageUrl: promoImgUrl,
          imageUrl2: promoImgUrl2,
          imageTag: promoImgTag,
        },
        fitGuide: {
          badge: fitGuideBadge,
          title: fitGuideTitle,
          subtitle: fitGuideSubtitle,
          items: fitGuideItems,
        },
        customerReviews: {
          badge: reviewsBadge,
          title: reviewsTitle,
          subtitle: reviewsSubtitle,
          score: reviewsScore,
          reviewCountText: reviewsCountText,
          items: reviewItems,
        },
        instagramFeed: {
          badge: igBadge,
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
      setTimeout(() => setSavedSuccess(false), 5000);
      alert('সফলভাবে সেভ হয়েছে! (All changes saved & synced to live store successfully)');
    } catch (err: any) {
      console.error('Failed to save site settings', err);
      const msg = err?.message || 'Unknown save error';
      setSaveErrorMessage(msg);
      alert('Save error: ' + msg);
    } finally {
      setIsSaving(false);
    }
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
          {saveErrorMessage && (
            <span className="text-xs text-red-400 font-bold flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl animate-fade-in shadow-lg">
              <AlertCircle className="w-4 h-4" />
              {saveErrorMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
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
      <div className="space-y-6">
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-bold uppercase text-xs">
                  Google Maps Live Location URL
                </label>
                <button
                  type="button"
                  onClick={() => setGoogleMapUrl('https://maps.app.goo.gl/FQtyZRiWgho2owgr7')}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Use Official Jeans BD Map Pin
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-mono"
                  placeholder="https://maps.app.goo.gl/FQtyZRiWgho2owgr7"
                />
                {googleMapUrl && (
                  <a
                    href={googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Open Live Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Live Interactive Google Map Preview */}
              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-white">Live Google Map: Jeans Manufacturing Company Ltd</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Mirpur-01, Dhaka</span>
                </div>
                <div className="relative w-full h-64 bg-slate-950">
                  <iframe
                    title="Jeans BD Live Google Map"
                    src="https://maps.google.com/maps?q=Jeans+manufacturing+company+Ltd+Mollik+Tower+Zoo+Road+Mirpur+Dhaka&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
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

                      {/* Media (Image / Video Background) */}
                      <div className="md:col-span-2 space-y-3 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="block text-slate-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Slide Background Media (Image or Motion Video)</span>
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Upload a photo or background video
                          </span>
                        </div>

                        {/* Image Upload from Computer */}
                        <ImageUploadField
                          label="1. Background Image (Default / Fallback)"
                          value={slide.imageUrl}
                          onChange={(val) => handleUpdateSlide(idx, 'imageUrl', val)}
                          aspect="landscape"
                          helpText="High-resolution hero banner photo."
                        />

                        {/* Video Background Options */}
                        <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-indigo-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                <span>2. Background Video (Optional)</span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                MP4 file from computer, YouTube, or Vimeo URL
                              </span>
                            </div>

                            {/* Direct file upload input for video */}
                            <label className={`cursor-pointer ${uploadingSlideIdx === idx ? 'bg-indigo-700 opacity-80' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow active:scale-95`}>
                              {uploadingSlideIdx === idx ? (
                                <Loader2 className="w-3 h-3 animate-spin text-white" />
                              ) : (
                                <Film className="w-3 h-3" />
                              )}
                              <span>{uploadingSlideIdx === idx ? 'Uploading Video...' : 'Upload Video File'}</span>
                              <input
                                type="file"
                                disabled={uploadingSlideIdx === idx}
                                accept="video/mp4,video/webm,video/quicktime,video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSlideVideoFileUpload(idx, f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>

                          {/* Video URL Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={slide.videoUrl || ''}
                              onChange={(e) => handleUpdateSlide(idx, 'videoUrl', e.target.value)}
                              placeholder="Or paste video link: https://www.youtube.com/watch?v=... or /uploads/video.mp4"
                              className="w-full bg-[#090d16] border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-white text-xs font-mono placeholder-slate-500 focus:outline-none"
                            />
                            {slide.videoUrl && (
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(idx, 'videoUrl', '')}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition"
                                title="Remove video background"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {slide.videoUrl && (
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <span>✓ Video background active for this slide!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SHOP BY CATEGORY (Curated Denim Fits - 8 Cards) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span>Shop by Category (Homepage Fit Cards)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize titles, descriptions, and view active category cards displayed under the Hero Banner
                  </p>
                </div>
                <Link
                  href="/admin/categories"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Manage Category Photos &amp; Names</span>
                </Link>
              </div>

              {/* Title & Badge Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={catBadge}
                    onChange={(e) => setCatBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={catTitle}
                    onChange={(e) => setCatTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={catBtnText}
                    onChange={(e) => setCatBtnText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Description / Subtitle
                  </label>
                  <input
                    type="text"
                    value={catSubtitle}
                    onChange={(e) => setCatSubtitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* Category Mini Grid Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.slice(0, 8).map((cat) => (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5 group hover:border-blue-500/50 transition-all"
                  >
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=400&q=80'}
                      alt={cat.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700/60 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold text-blue-400">
                        {cat.gender}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {cat.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-900/40 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-blue-300">
                  Want to change card titles, replace photos, or upload custom imagery? Use the dedicated <strong>Denim Categories Manager</strong>.
                </span>
                <Link
                  href="/admin/categories"
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Open Category Manager &rarr;
                </Link>
              </div>
            </div>

            {/* 3. FLASH OFFER / PROMO BANNER (Screenshot 2) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Flash Offer / Promo Banner Section</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure the highlighted promo card with coupon code, side featured pictures and neon tag
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

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Main Headline (Part 1 - White)
                  </label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm font-black"
                    placeholder="UP TO 30% OFF"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Sub-Headline (Part 2 - Sky Blue)
                  </label>
                  <input
                    type="text"
                    value={promoSubtitle}
                    onChange={(e) => setPromoSubtitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm font-black text-sky-400"
                    placeholder="ALL PREMIUM DENIM"
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

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Side Image Neon Tag / Quote
                  </label>
                  <input
                    type="text"
                    value={promoImgTag}
                    onChange={(e) => setPromoImgTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                    placeholder="Good Jeans\nGood Vibes"
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Side Photo 1 (Folded Jeans)"
                    value={promoImgUrl}
                    onChange={setPromoImgUrl}
                    aspect="square"
                    helpText="Upload photo of folded jeans or denim stack."
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Side Photo 2 (Denim Model Portrait)"
                    value={promoImgUrl2}
                    onChange={setPromoImgUrl2}
                    aspect="portrait"
                    helpText="Upload portrait photo of denim jeans model."
                  />
                </div>
              </div>
            </div>

            {/* 4. THE DENIM FIT GUIDE (Screenshot 2) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    <span>The Denim Fit Guide (Screenshot 2)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize the 4 signature fit cards displayed in the dark denim consultation section on the homepage
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFit}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md self-start transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Fit Card</span>
                </button>
              </div>

              {/* Section Header Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Top Badge
                  </label>
                  <input
                    type="text"
                    value={fitGuideBadge}
                    onChange={(e) => setFitGuideBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                    placeholder="THE DENIM FIT GUIDE"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Main Section Heading
                  </label>
                  <input
                    type="text"
                    value={fitGuideTitle}
                    onChange={(e) => setFitGuideTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-black uppercase"
                    placeholder="THE DENIM FIT GUIDE"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={fitGuideSubtitle}
                    onChange={(e) => setFitGuideSubtitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs"
                    placeholder="Find your perfect fit with our style guide."
                  />
                </div>
              </div>

              {/* Fit Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fitGuideItems.map((fit, idx) => (
                  <div
                    key={fit.id || idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                        Fit Card #{idx + 1}: {fit.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFit(idx)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                          Fit Name (e.g. Slim Fit)
                        </label>
                        <input
                          type="text"
                          value={fit.name}
                          onChange={(e) => handleUpdateFit(idx, 'name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                          Tagline (e.g. Modern & Tailored)
                        </label>
                        <input
                          type="text"
                          value={fit.tagline}
                          onChange={(e) => handleUpdateFit(idx, 'tagline', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                          Fit Description
                        </label>
                        <textarea
                          rows={2}
                          value={fit.desc}
                          onChange={(e) => handleUpdateFit(idx, 'desc', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                          Best Paired With
                        </label>
                        <input
                          type="text"
                          value={fit.bestFor}
                          onChange={(e) => handleUpdateFit(idx, 'bestFor', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">
                          Shop Button Link URL
                        </label>
                        <input
                          type="text"
                          value={fit.link}
                          onChange={(e) => handleUpdateFit(idx, 'link', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <ImageUploadField
                          label="Card Photo (Upload from Computer)"
                          value={fit.image}
                          onChange={(val) => handleUpdateFit(idx, 'image', val)}
                          aspect="landscape"
                          helpText="Upload a denim lifestyle photo or model wearing this fit."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. VERIFIED CUSTOMER FEEDBACK (Screenshot 3) */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

                <div className="sm:col-span-2">
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
                    Aggregate Score (e.g. 4.7/5)
                  </label>
                  <input
                    type="text"
                    value={reviewsScore}
                    onChange={(e) => setReviewsScore(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Reviews Count Line
                  </label>
                  <input
                    type="text"
                    value={reviewsCountText}
                    onChange={(e) => setReviewsCountText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                  />
                </div>

                <div className="lg:col-span-5">
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
                        <ImageUploadField
                          label="Customer Avatar Photo (Upload from Computer)"
                          value={rev.avatar || ''}
                          onChange={(val) => handleUpdateReview(idx, 'avatar', val)}
                          aspect="square"
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

            {/* 5. INSTAGRAM FEED SHOWCASE (Screenshot 4) */}
            <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
                <div>
                  <h3 className="font-black text-base uppercase text-white tracking-wider flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <span>Instagram Feed &amp; Lookbook Gallery (Screenshot 4)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your Instagram profile handle, section heading, and all showcase product looks ({igImages.length} photos)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddIgImage}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-pink-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Lookbook Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Section Top Badge
                  </label>
                  <input
                    type="text"
                    value={igBadge}
                    onChange={(e) => setIgBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs font-bold"
                    placeholder="FEATURED LOOKS"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[11px] mb-1">
                    Instagram Handle
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
                    Section Title
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

              {/* Dynamic Images Grid */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-white font-bold uppercase text-xs">
                      {igImages.length} Instagram Lookbook Photos (Upload from Computer)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Click 'Upload from Computer' on each slot to add photos directly from your device. You can add as many as you want!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddIgImage}
                    className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Photo</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {igImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-pink-500/20 text-pink-400 font-bold text-[11px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            Instagram Look #{i + 1}
                          </span>
                        </div>
                        {igImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteIgImage(i)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title={`Delete Look #${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <ImageUploadField
                        label=""
                        value={img}
                        onChange={(val) => handleUpdateIgImage(i, val)}
                        aspect="square"
                      />
                    </div>
                  ))}
                </div>

                {/* Add Photo Button below grid */}
                <div className="mt-4 pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleAddIgImage}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800/80 border-2 border-dashed border-slate-700 hover:border-pink-500/80 text-slate-300 hover:text-pink-400 font-bold text-xs px-8 py-3.5 rounded-2xl transition-all cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-pink-500/20 group-hover:bg-pink-500 group-hover:text-white text-pink-400 flex items-center justify-center transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>+ Add Another Instagram Lookbook Photo</span>
                  </button>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">
              Clicking Save will update the frontend and synchronize your live store immediately across all devices.
            </span>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <Check className="w-3.5 h-3.5" />
                All changes saved &amp; synced to live store!
              </span>
            )}
            {saveErrorMessage && (
              <span className="text-xs text-red-400 font-bold flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {saveErrorMessage}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
