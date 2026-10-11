'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  Upload,
  Camera,
  ShoppingBag,
  Download,
  Check,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Split,
  Eye,
  ArrowRight,
  Layers,
  User,
  AlertCircle,
  Loader2,
  FlipHorizontal,
  Share2,
  Image as ImageIcon,
  CheckCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/store/cartContext';
import { useProducts } from '@/lib/store/productsContext';
import { formatPrice } from '@/lib/utils';

interface VirtualTryOnModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
  initialColor?: string;
}

// Preset verified models for instant test/evaluation (Upper Wear & Lower Wear)
export interface PresetModel {
  id: string;
  name: string;
  nameBn: string;
  gender: 'men' | 'women';
  styleCategory: 'jeans' | 'shorts' | 'jacket' | 'tops';
  bodyRegion: 'upper_body' | 'lower_body';
  label: string;
  labelBn: string;
  badge: string;
  badgeColor: string;
  description: string;
  url: string;
}

export const PRESET_MODELS: PresetModel[] = [
  {
    id: 'men-jeans',
    name: "Men's Jeans Pant",
    nameBn: 'মেন • জিন্স প্যান্ট',
    gender: 'men',
    styleCategory: 'jeans',
    bodyRegion: 'lower_body',
    label: 'Jeans Pant',
    labelBn: 'জিন্স প্যান্ট',
    badge: "Men's Jeans",
    badgeColor: 'bg-blue-600 text-white',
    description: 'Straight-Fit Dark Indigo Jeans',
    url: '/images/tryon-models/men_jeans.jpg',
  },
  {
    id: 'women-jeans',
    name: "Women's Jeans Pant",
    nameBn: 'উইমেন • জিন্স প্যান্ট',
    gender: 'women',
    styleCategory: 'jeans',
    bodyRegion: 'lower_body',
    label: 'Jeans Pant',
    labelBn: 'জিন্স প্যান্ট',
    badge: "Women's Jeans",
    badgeColor: 'bg-indigo-600 text-white',
    description: 'High-Rise Vintage Flare Jeans',
    url: '/images/tryon-models/women_jeans.jpg',
  },
  {
    id: 'men-shorts',
    name: "Men's Denim Shorts",
    nameBn: 'মেন • ডেনিম শর্টস',
    gender: 'men',
    styleCategory: 'shorts',
    bodyRegion: 'lower_body',
    label: 'Denim Shorts',
    labelBn: 'ডেনিম শর্টস',
    badge: "Men's Shorts",
    badgeColor: 'bg-cyan-600 text-white',
    description: 'Vintage Light Blue Denim Shorts',
    url: '/images/tryon-models/men_shorts.jpg',
  },
  {
    id: 'women-shorts',
    name: "Women's Denim Shorts",
    nameBn: 'উইমেন • ডেনিম শর্টস',
    gender: 'women',
    styleCategory: 'shorts',
    bodyRegion: 'lower_body',
    label: 'Denim Shorts',
    labelBn: 'ডেনিম শর্টস',
    badge: "Women's Shorts",
    badgeColor: 'bg-rose-500 text-white',
    description: 'High-Rise Summer Denim Shorts',
    url: '/images/tryon-models/women_shorts.jpg',
  },
  {
    id: 'men-jacket',
    name: "Men's Denim Jacket",
    nameBn: 'মেন • ডেনিম জ্যাকেট',
    gender: 'men',
    styleCategory: 'jacket',
    bodyRegion: 'upper_body',
    label: 'Denim Jacket',
    labelBn: 'ডেনিম জ্যাকেট',
    badge: "Men's Jacket",
    badgeColor: 'bg-amber-600 text-white',
    description: 'Classic Trucker Jacket (Torso/Upper Wear)',
    url: '/images/tryon-models/men_jacket.jpg',
  },
  {
    id: 'women-jacket',
    name: "Women's Denim Jacket",
    nameBn: 'উইমেন • ডেনিম জ্যাকেট',
    gender: 'women',
    styleCategory: 'jacket',
    bodyRegion: 'upper_body',
    label: 'Denim Jacket',
    labelBn: 'ডেনিম জ্যাকেট',
    badge: "Women's Jacket",
    badgeColor: 'bg-rose-600 text-white',
    description: 'Fitted Denim Trucker Jacket (Torso/Upper Wear)',
    url: '/images/tryon-models/women_jacket.jpg',
  },
  {
    id: 'women-shorts-studio',
    name: "Women's Studio Chic",
    nameBn: 'উইমেন • স্টুডিও লুক',
    gender: 'women',
    styleCategory: 'shorts',
    bodyRegion: 'lower_body',
    label: 'Studio Shorts',
    labelBn: 'স্টুডিও শর্টস',
    badge: "Studio Chic",
    badgeColor: 'bg-violet-600 text-white',
    description: 'Sleeveless Top & Shorts Look',
    url: 'https://litter.catbox.moe/we5jki.png',
  },
];

function getRecommendedPreset(prod: Product): PresetModel {
  const nameLower = (prod?.name || '').toLowerCase();
  const catLower = (prod?.category || '').toLowerCase();
  const fitLower = (prod?.fit || '').toLowerCase();
  const isTop =
    catLower.includes('jacket') ||
    nameLower.includes('jacket') ||
    fitLower.includes('jacket') ||
    catLower.includes('shirt') ||
    nameLower.includes('shirt') ||
    nameLower.includes('t-shirt') ||
    prod?.garmentCategory === 'tops';

  const isShorts = nameLower.includes('shorts') || catLower.includes('shorts') || prod?.garmentType === 'shorts';
  const isWomen = prod?.gender === 'women';

  if (isTop && isWomen) {
    return PRESET_MODELS.find((m) => m.id === 'women-jacket') || PRESET_MODELS[0];
  }
  if (isTop && !isWomen) {
    return PRESET_MODELS.find((m) => m.id === 'men-jacket') || PRESET_MODELS[0];
  }
  if (isWomen && isShorts) return PRESET_MODELS.find((m) => m.id === 'women-shorts') || PRESET_MODELS[3];
  if (!isWomen && isShorts) return PRESET_MODELS.find((m) => m.id === 'men-shorts') || PRESET_MODELS[2];
  if (isWomen && !isShorts) return PRESET_MODELS.find((m) => m.id === 'women-jeans') || PRESET_MODELS[1];
  return PRESET_MODELS[0]; // men-jeans
}

export default function VirtualTryOnModal({
  product: initialProduct,
  isOpen,
  onClose,
  initialSize,
  initialColor,
}: VirtualTryOnModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { products } = useProducts();

  // Active product being fitted (supports "Change Product" feature)
  const [activeProduct, setActiveProduct] = useState<Product>(initialProduct);
  const [isChangingProduct, setIsChangingProduct] = useState<boolean>(false);
  const [mainCategoryFilter, setMainCategoryFilter] = useState<'all' | 'upper_body' | 'lower_body'>('all');
  const [garmentFilter, setGarmentFilter] = useState<string>('all');
  const [presetFilter, setPresetFilter] = useState<string>('all');

  const initialPreset = useMemo(() => getRecommendedPreset(initialProduct), [initialProduct]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);

  // Sync active product and intelligent preset when prop changes
  useEffect(() => {
    setActiveProduct(initialProduct);
    const rec = getRecommendedPreset(initialProduct);
    setSelectedPresetId(rec.id);
    setActivePhotoUrl(rec.url);
    setBeforeImageUrl(rec.url);
    setUploadedPhotoUrl(null);
    setPhotoSourceType('preset');

    const nameLower = (initialProduct?.name || '').toLowerCase();
    const catLower = (initialProduct?.category || '').toLowerCase();
    const isTop =
      catLower.includes('jacket') ||
      nameLower.includes('jacket') ||
      catLower.includes('shirt') ||
      nameLower.includes('shirt') ||
      initialProduct?.garmentCategory === 'tops';

    if (isTop) {
      setMainCategoryFilter('upper_body');
    } else {
      setMainCategoryFilter('lower_body');
    }
  }, [initialProduct]);

  // Selected Variant
  const defaultSize = initialSize || activeProduct.variants[0]?.size || '32';
  const defaultColor = initialColor || activeProduct.variants[0]?.color || 'Deep Indigo';
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  // Customer Photo States
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(initialPreset.url);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [photoSourceType, setPhotoSourceType] = useState<'preset' | 'upload' | 'camera'>('preset');

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleReloadPage = () => {
    try {
      sessionStorage.setItem('auto_open_tryon', '1');
    } catch (_) {}
    window.location.reload();
  };

  // Asynchronous Job & Polling States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [stepDescription, setStepDescription] = useState<string>('Preparing your photo...');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('AI Diffusion');

  // Result States
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>(initialPreset.url);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [isAfterImageLoaded, setIsAfterImageLoaded] = useState<boolean>(false);
  const [afterImageError, setAfterImageError] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'after' | 'before'>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('cover');
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper to ensure result image is never blocked by ISP or CORS
  const sanitizeImageUrl = useCallback((url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('/api/')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `/api/virtual-try-on/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  }, []);

  // Cart action states
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Garment Category & Type Resolver (Handles Upper Wear vs Lower Wear accurately)
  const resolveGarmentMetadata = useCallback((prod: Product) => {
    const nameLower = (prod.name || '').toLowerCase();
    const catLower = (prod.category || '').toLowerCase();
    const fitLower = (prod.fit || '').toLowerCase();

    let garmentType: any = prod.garmentType || 'jacket';
    let category: 'tops' | 'bottoms' | 'one-pieces' = 'tops';
    let bodyRegion: 'upper_body' | 'lower_body' | 'full_body' = 'upper_body';
    let bodyZoneLabel = 'Upper Body (Torso)';
    let bodyZoneBn = 'উর্ধ্বাঙ্গ (কাঁধ থেকে কোমর/নাভি)';

    if (nameLower.includes('shorts') || catLower.includes('shorts')) {
      garmentType = 'shorts';
      category = 'bottoms';
      bodyRegion = 'lower_body';
      bodyZoneLabel = 'Lower Body (Waist & Legs)';
      bodyZoneBn = 'নিম্নাঙ্গ (কোমর/নাভি থেকে পা)';
    } else if (
      nameLower.includes('jeans') ||
      nameLower.includes('pants') ||
      nameLower.includes('trouser') ||
      catLower.includes('jeans') ||
      catLower.includes('bottoms')
    ) {
      garmentType = 'jeans';
      category = 'bottoms';
      bodyRegion = 'lower_body';
      bodyZoneLabel = 'Lower Body (Waist & Legs)';
      bodyZoneBn = 'নিম্নাঙ্গ (কোমর থেকে পা)';
    } else if (nameLower.includes('skirt') || catLower.includes('skirt')) {
      garmentType = 'skirt';
      category = 'bottoms';
      bodyRegion = 'lower_body';
      bodyZoneLabel = 'Lower Body (Waist & Hips)';
      bodyZoneBn = 'নিম্নাঙ্গ (কোমর ও হিপস)';
    } else if (nameLower.includes('jacket') || fitLower.includes('jacket')) {
      garmentType = 'jacket';
      category = 'tops';
      bodyRegion = 'upper_body';
      bodyZoneLabel = 'Upper Body (Torso)';
      bodyZoneBn = 'উর্ধ্বাঙ্গ (কাঁধ থেকে কোমর/নাভি)';
    } else if (nameLower.includes('shirt') || fitLower.includes('shirt')) {
      garmentType = 'shirt';
      category = 'tops';
      bodyRegion = 'upper_body';
      bodyZoneLabel = 'Upper Body (Torso)';
      bodyZoneBn = 'উর্ধ্বাঙ্গ (বুক ও বডি)';
    } else if (nameLower.includes('t-shirt') || nameLower.includes('tshirt') || nameLower.includes('tee')) {
      garmentType = 'tshirt';
      category = 'tops';
      bodyRegion = 'upper_body';
      bodyZoneLabel = 'Upper Body (Torso)';
      bodyZoneBn = 'উর্ধ্বাঙ্গ (কাঁধ ও বডি)';
    } else if (nameLower.includes('polo')) {
      garmentType = 'polo';
      category = 'tops';
      bodyRegion = 'upper_body';
      bodyZoneLabel = 'Upper Body (Torso)';
      bodyZoneBn = 'উর্ধ্বাঙ্গ (গলা ও বডি)';
    } else if (nameLower.includes('dress') || catLower.includes('dress')) {
      garmentType = 'dress';
      category = 'one-pieces';
      bodyRegion = 'full_body';
      bodyZoneLabel = 'Full Outfit (Co-ord)';
      bodyZoneBn = 'কম্বো সেট (ফুল বডি)';
    } else {
      category = prod.garmentCategory === 'bottoms' ? 'bottoms' : 'tops';
      bodyRegion = category === 'bottoms' ? 'lower_body' : 'upper_body';
      bodyZoneLabel = category === 'bottoms' ? 'Lower Body (Waist & Legs)' : 'Upper Body (Torso)';
      bodyZoneBn = category === 'bottoms' ? 'নিম্নাঙ্গ (কোমর/নাভি থেকে পা)' : 'উর্ধ্বাঙ্গ (কাঁধ থেকে কোমর/নাভি)';
    }

    const garmentImage = prod.tryOnAssetUrl || prod.thumbnail || prod.images[0] || '';
    return { garmentType, category, bodyRegion, bodyZoneLabel, bodyZoneBn, garmentImage };
  }, []);

  // Quick selectable products categorized for instant switching & filtering
  const selectableProducts = useMemo(() => {
    let list: Product[] = [];

    products.forEach((p) => {
      if (p.virtualTryOnEnabled === false) return;
      const nLower = (p.name || '').toLowerCase();
      const cLower = (p.category || '').toLowerCase();
      const fitLower = (p.fit || '').toLowerCase();

      const isTop =
        cLower.includes('jacket') ||
        nLower.includes('jacket') ||
        fitLower.includes('jacket') ||
        cLower.includes('shirt') ||
        nLower.includes('shirt') ||
        nLower.includes('overshirt') ||
        nLower.includes('t-shirt') ||
        nLower.includes('tee') ||
        nLower.includes('polo') ||
        nLower.includes('hoodie') ||
        nLower.includes('blazer') ||
        p.garmentCategory === 'tops';

      const isShorts = nLower.includes('shorts') || cLower.includes('shorts') || p.garmentType === 'shorts';
      const isBottom = !isTop;
      const isMen = p.gender === 'men';
      const isWomen = p.gender === 'women';

      // 1. Primary filter by Main Category: Upper Wear vs Lower Wear vs All
      if (mainCategoryFilter === 'upper_body' && !isTop) return;
      if (mainCategoryFilter === 'lower_body' && !isBottom) return;

      // 2. Secondary filter
      if (garmentFilter === 'all' || garmentFilter === 'all-tops' || garmentFilter === 'all-bottoms') {
        list.push(p);
      } else if (garmentFilter === 'men-jeans' && isMen && isBottom && !isShorts) {
        list.push(p);
      } else if (garmentFilter === 'women-jeans' && isWomen && isBottom && !isShorts) {
        list.push(p);
      } else if (garmentFilter === 'men-shorts' && isMen && isShorts) {
        list.push(p);
      } else if (garmentFilter === 'women-shorts' && isWomen && isShorts) {
        list.push(p);
      } else if (garmentFilter === 'jackets' && isTop && (nLower.includes('jacket') || cLower.includes('jacket') || fitLower.includes('jacket'))) {
        list.push(p);
      } else if (garmentFilter === 'shirts' && isTop && (nLower.includes('shirt') || cLower.includes('shirt'))) {
        list.push(p);
      } else if (garmentFilter === 'men-tops' && isMen && isTop) {
        list.push(p);
      } else if (garmentFilter === 'women-tops' && isWomen && isTop) {
        list.push(p);
      } else {
        list.push(p);
      }
    });

    // Make sure activeProduct is placed at the top if it matches current main category or if in 'all'
    const hasActive = list.some((p) => p.id === activeProduct.id);
    if (!hasActive && mainCategoryFilter === 'all') {
      list = [activeProduct, ...list];
    } else if (hasActive) {
      list = [activeProduct, ...list.filter((p) => p.id !== activeProduct.id)];
    }

    return isChangingProduct ? list : list.slice(0, 8);
  }, [products, activeProduct, mainCategoryFilter, garmentFilter, isChangingProduct]);

  const handleSelectProduct = (prod: Product) => {
    setActiveProduct(prod);
    setAfterImageUrl(null);
    setIsAfterImageLoaded(false);
    setAfterImageError(false);
    if (prod.variants && prod.variants.length > 0) {
      setSelectedSize(prod.variants[0].size || '32');
      setSelectedColor(prod.variants[0].color || 'Deep Indigo');
    }
    // Automatically match preset model and main category tab
    const meta = resolveGarmentMetadata(prod);
    if (meta.category === 'bottoms') {
      setMainCategoryFilter('lower_body');
    } else if (meta.category === 'tops') {
      setMainCategoryFilter('upper_body');
    }

    if (photoSourceType === 'preset') {
      const rec = getRecommendedPreset(prod);
      setSelectedPresetId(rec.id);
      setActivePhotoUrl(rec.url);
      setBeforeImageUrl(rec.url);
    }
  };

  const handleSelectPresetModel = (model: PresetModel) => {
    stopCamera();
    setSelectedPresetId(model.id);
    setActivePhotoUrl(model.url);
    setBeforeImageUrl(model.url);
    setAfterImageUrl(null);
    setUploadedPhotoUrl(null);
    setPhotoSourceType('preset');
  };

  const filteredPresetModels = useMemo(() => {
    if (presetFilter === 'all') return PRESET_MODELS;
    if (presetFilter === 'upper_body') return PRESET_MODELS.filter((m) => m.bodyRegion === 'upper_body');
    if (presetFilter === 'lower_body') return PRESET_MODELS.filter((m) => m.bodyRegion === 'lower_body');
    if (presetFilter === 'men-jeans') return PRESET_MODELS.filter((m) => m.gender === 'men' && m.styleCategory === 'jeans');
    if (presetFilter === 'women-jeans') return PRESET_MODELS.filter((m) => m.gender === 'women' && m.styleCategory === 'jeans');
    if (presetFilter === 'men-shorts') return PRESET_MODELS.filter((m) => m.gender === 'men' && m.styleCategory === 'shorts');
    if (presetFilter === 'women-shorts') return PRESET_MODELS.filter((m) => m.gender === 'women' && m.styleCategory === 'shorts');
    return PRESET_MODELS;
  }, [presetFilter]);

  const { garmentType, category, bodyRegion, bodyZoneLabel, bodyZoneBn, garmentImage } = resolveGarmentMetadata(activeProduct);
  const effectivePrice =
    activeProduct.discountPrice && activeProduct.discountPrice < activeProduct.price
      ? activeProduct.discountPrice
      : activeProduct.price;

  // Clean up camera stream on close or unmount
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCameraError(null);
      try {
        sessionStorage.removeItem('auto_start_camera');
      } catch (_) {}
    } else {
      stopCamera();
      setCameraError(null);
      try {
        sessionStorage.removeItem('auto_open_tryon');
        sessionStorage.removeItem('auto_start_camera');
      } catch (_) {}
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => console.warn('Video play error:', err));
    }
  }, [isCameraActive]);

  // Image compressor: Scales down large mobile photos to ~1024px JPEG under 1.5MB
  const compressImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || dataUrl.startsWith('http')) {
        return resolve(dataUrl);
      }

      const img = new Image();
      // Only set crossOrigin on remote HTTP images, NEVER on data: URIs
      if (!dataUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const maxDim = 1024;
          let w = img.naturalWidth || img.width || 800;
          let h = img.naturalHeight || img.height || 1000;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);

          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          console.warn('Canvas compress error:', e);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        console.warn('Image load error during compression');
        resolve(dataUrl);
      };

      img.src = dataUrl;
    });
  };

  // Smart camera launcher: Opens native camera on smartphones, WebRTC on desktops
  const handleCameraClick = () => {
    setCameraError(null);
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click();
      return;
    }

    startCamera('user');
  };

  // Launch Camera with permission handling & fallback
  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    stopCamera();

    const isMobile =
      typeof navigator !== 'undefined' &&
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
        return;
      }
      setCameraError('Camera is not supported on this browser. Please upload a photo instead.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (_) {
        // Fallback for desktop PC webcams without specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setPhotoSourceType('camera');
      setCameraError(null);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);

      // On mobile devices, seamlessly fall back to native camera app without error banner
      if (isMobile && cameraInputRef.current) {
        cameraInputRef.current.click();
        return;
      }

      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const isDeviceBusy = err.name === 'NotReadableError' || err.name === 'TrackStartError';
      setCameraError(
        isDenied
          ? 'Browser camera permission denied. Please allow camera or upload a photo directly.'
          : isDeviceBusy
          ? 'Camera is being used by another application. Please upload a photo instead.'
          : 'Unable to access camera: ' + (err.message || 'Please upload a photo instead.')
      );
      setIsCameraActive(false);
    }
  };

  // Switch between front/back camera
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture photo snapshot from live video element
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const v = videoRef.current;
    canvas.width = v.videoWidth || 720;
    canvas.height = v.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    setUploadedPhotoUrl(capturedDataUrl);
    setActivePhotoUrl(capturedDataUrl);
    setBeforeImageUrl(capturedDataUrl);
    setAfterImageUrl(null);
  };

  // Handle Photo Upload (from Camera or Gallery)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
    e.target.value = '';

    // Universal image validation (supports mobile camera captures, HEIC, JPEG, PNG, WebP)
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|heic|heif|jfif|bmp|gif)$/i.test(file.name) ||
      file.type === '';

    if (!isImage) {
      alert('Please select a valid image file (JPG, PNG, WebP or selfie photo).');
      return;
    }

    // Validation: Size (Max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert('Image file size must be under 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const compressed = await compressImage(dataUrl);
        setUploadedPhotoUrl(compressed);
        setActivePhotoUrl(compressed);
        setBeforeImageUrl(compressed);
        setAfterImageUrl(null);
        setPhotoSourceType('upload');
        setCameraError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Interactive Split Comparison Slider Drag Handlers
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percentage = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider && e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  // Trigger Asynchronous Real AI Virtual Try-On Pipeline
  const runVirtualTryOn = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setProgressPercent(15);
    setStepDescription('📸 Scanning body pose and posture...');
    setAfterImageUrl(null);
    setIsAfterImageLoaded(false);
    setAfterImageError(false);

    // Realistic animated progress ticker to prevent user frustration
    const ticker = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 35) {
          setStepDescription('📸 Analyzing body contours & proportions...');
          return prev + 4;
        } else if (prev < 60) {
          setStepDescription('✂️ Segmenting original garment & 3D body mapping...');
          return prev + 3;
        } else if (prev < 80) {
          setStepDescription(`👗 Fitting ${activeProduct.name} onto body contours...`);
          return prev + 2;
        } else if (prev < 93) {
          setStepDescription('✨ Synthesizing lighting, realistic wrinkles & shadows...');
          return prev + 1;
        }
        return prev;
      });
    }, 1100);

    try {
      const optimizedCustomerImage = await compressImage(activePhotoUrl);
      setBeforeImageUrl(optimizedCustomerImage);

      // 1. Submit Job to /api/virtual-try-on
      const submitRes = await fetch('/api/virtual-try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: optimizedCustomerImage,
          garmentImage,
          garmentType,
          category,
          productName: activeProduct.name,
          size: selectedSize,
          color: selectedColor,
          productId: activeProduct.id,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.success) {
        throw new Error(submitData.error || 'Failed to submit Virtual Try-On job');
      }

      const jobId = submitData.jobId;
      setActiveJobId(jobId);
      setProviderName(submitData.provider || 'AI Diffusion');

      // Fast synchronous completion: If HF Diffusion finished within the submit request
      if (submitData.status === 'completed' && submitData.resultImageUrl) {
        clearInterval(ticker);
        const safeUrl = sanitizeImageUrl(submitData.resultImageUrl);
        setAfterImageUrl(safeUrl);
        setIsAfterImageLoaded(false);
        setAfterImageError(false);
        setSliderPosition(50);
        setJobStatus('completed');
        setProgressPercent(100);
        setViewMode('split');
        return;
      }

      setJobStatus('processing');

      // 2. Poll /api/virtual-try-on/jobs/[jobId] until completion
      const pollIntervalMs = submitData.pollIntervalMs || 2000;
      let completed = false;
      let attempts = 0;
      const maxAttempts = 60; // ~120s max for AI diffusion model

      while (!completed && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
        attempts++;

        try {
          const statusRes = await fetch(`/api/virtual-try-on/jobs/${jobId}`);
          if (!statusRes.ok) continue;

          const statusData = await statusRes.json();

          if (statusData.stepDescription) {
            setStepDescription(statusData.stepDescription);
          }
          if (statusData.progressPercent) {
            setProgressPercent((prev) => Math.max(prev, statusData.progressPercent));
          }

          if (statusData.status === 'completed' && statusData.resultImageUrl) {
            clearInterval(ticker);
            const safeUrl = sanitizeImageUrl(statusData.resultImageUrl);
            setAfterImageUrl(safeUrl);
            setIsAfterImageLoaded(false);
            setAfterImageError(false);
            setSliderPosition(50);
            setJobStatus('completed');
            setProgressPercent(100);
            setViewMode('split');
            completed = true;
            break;
          }

          if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'AI generation was unsuccessful.');
          }

          if (statusData.status === 'expired') {
            throw new Error('This try-on job session has expired.');
          }
        } catch (pollErr: any) {
          if (pollErr.message && !pollErr.message.includes('fetch')) {
            throw pollErr;
          }
        }
      }

      if (!completed) {
        throw new Error('AI fitting is taking slightly longer. Please click again to check or retry.');
      }
    } catch (err: any) {
      console.error('Virtual Try-On error:', err);
      setGenerationError(err?.message || 'Sorry, we could not generate your virtual try-on right now.');
      setJobStatus('failed');
    } finally {
      clearInterval(ticker);
      setIsGenerating(false);
    }
  };

  // Add to Cart integration with existing cart system
  const handleAddToCart = () => {
    const variant =
      activeProduct.variants.find((v) => v.size === selectedSize && v.color === selectedColor) ||
      activeProduct.variants[0];

    addToCart({
      id: `${activeProduct.id}_${selectedSize}_${selectedColor}`,
      productId: activeProduct.id,
      productSlug: activeProduct.slug,
      name: activeProduct.name,
      image: afterImageUrl || activeProduct.thumbnail,
      price: effectivePrice,
      regularPrice: activeProduct.price,
      size: selectedSize,
      color: selectedColor,
      colorHex: variant?.colorHex || '#1e293b',
      quantity: 1,
      maxStock: variant?.stock || activeProduct.totalStock || 10,
    });

    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 2500);
  };

  // Buy Now integration
  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    router.push('/checkout');
  };

  // Download high-resolution try-on result
  const handleDownload = () => {
    if (!afterImageUrl) return;
    const a = document.createElement('a');
    a.href = afterImageUrl;
    a.download = `jeansbd-tryon-${activeProduct.slug}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share result
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && afterImageUrl) {
      try {
        await navigator.share({
          title: `Just Jeans BD — ${activeProduct.name}`,
          text: `Check out how I look in ${activeProduct.name}!`,
          url: window.location.href,
        });
        return;
      } catch (_) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  AI Virtual Try-On
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {providerName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {activeProduct.name} — ৳{effectivePrice.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangingProduct(!isChangingProduct)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              title="Change Product"
            >
              🔄 Change Product
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Change Product Drawer (if toggled) */}
        {isChangingProduct && (
          <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                Try on other products with your photo:
              </span>
              <button
                onClick={() => setIsChangingProduct(false)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {products
                .filter((p) => p.virtualTryOnEnabled !== false)
                .slice(0, 10)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleSelectProduct(p);
                      setIsChangingProduct(false);
                    }}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-left shrink-0 transition ${
                      activeProduct.id === p.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={p.thumbnail || p.images[0]}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="text-[11px] leading-tight">
                      <p className="font-bold truncate max-w-[110px] text-slate-800 dark:text-slate-200">
                        {p.name}
                      </p>
                      <p className="text-slate-500 font-semibold">৳{(p.discountPrice || p.price).toLocaleString()}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Visual Preview Viewport */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Viewport Card: Standard 2:3 vertical fashion portrait frame with zero horizontal sidebars */}
            <div
              ref={sliderContainerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDraggingSlider(false)}
              className="relative w-full max-w-[360px] aspect-[2/3] max-h-[530px] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none mx-auto border border-slate-800"
            >
              {/* STATE 1: Camera Active */}
              {isCameraActive ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 z-20">
                    <button
                      onClick={toggleCameraFacing}
                      className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition shadow-lg"
                      title="Flip Camera"
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={captureCameraPhoto}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition shadow-lg"
                      title="Cancel Camera"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : isGenerating ? (
                /* STATE 2: AI Processing with real progress & holographic laser scanning */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
                  {/* Background blurred customer photo */}
                  <img
                    src={activePhotoUrl}
                    alt="Source"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[2px] transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

                  {/* High-Tech Holographic Laser Scan Beam */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.95)] animate-vton-scan z-10 pointer-events-none" />

                  {/* HUD Corner Tech Accents */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-400/70 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-400/70 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-400/70 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-400/70 pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center max-w-sm px-2">
                    {/* Glowing AI Studio Emblem */}
                    <div className="relative mb-4">
                      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-2xl blur-md opacity-70 animate-pulse" />
                      <div className="relative w-16 h-16 rounded-2xl bg-slate-950 border border-white/20 flex items-center justify-center text-cyan-300 shadow-2xl">
                        <Sparkles className="w-8 h-8 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-black uppercase text-cyan-300 tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      AI Virtual Fitting Studio
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white mb-1 tracking-tight">
                      {activeProduct.name}
                    </h4>
                    <p className="text-xs text-cyan-200/90 font-medium mb-5 min-h-[34px] transition-all flex items-center justify-center gap-1.5 px-3">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
                      <span>{stepDescription}</span>
                    </p>

                    {/* Progress Bar with Glowing Shimmer */}
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10 mb-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-cyan-300/80 px-1">
                      <span>Neural Diffusion Engine</span>
                      <span className="font-bold text-white">{progressPercent}%</span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-300 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Body anatomy & face contours 100% preserved</span>
                    </div>
                  </div>
                </div>
              ) : afterImageUrl ? (
                /* STATE 3: Try-On Completed Result with Split Comparison */
                <div className="relative w-full h-full select-none bg-slate-950">
                  {/* Image loading / skeleton overlay */}
                  {!isAfterImageLoaded && !afterImageError && (
                    <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
                      <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl bg-indigo-600/30 animate-ping" />
                        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
                          <Sparkles className="w-6 h-6 animate-pulse text-cyan-200" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">Rendering HD Fitting Result...</p>
                      <p className="text-xs text-cyan-300/80">Your realistic try-on will display in moments</p>
                    </div>
                  )}

                  {/* Fallback if image failed to load */}
                  {afterImageError && (
                    <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
                      <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                      <h4 className="text-base font-bold text-white mb-1">Image Preview Issue</h4>
                      <p className="text-xs text-slate-300 mb-4 max-w-xs">
                        Unable to load the rendered preview image over the connection. Please click retry.
                      </p>
                      <button
                        onClick={() => {
                          setAfterImageError(false);
                          setIsAfterImageLoaded(false);
                          runVirtualTryOn();
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Fitting</span>
                      </button>
                    </div>
                  )}

                  {viewMode === 'split' ? (
                    <div
                      className="relative w-full h-full overflow-hidden"
                      onClick={(e) => handleSliderMove(e.clientX)}
                    >
                      {/* Background Ambient Glow */}
                      <img
                        src={afterImageUrl || beforeImageUrl}
                        alt="Background glow"
                        className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xl scale-110 pointer-events-none"
                      />

                      {/* After Image (Full background) */}
                      <img
                        src={afterImageUrl}
                        alt="After Virtual Try-On"
                        onLoad={() => setIsAfterImageLoaded(true)}
                        onError={() => {
                          if (afterImageUrl && !afterImageUrl.startsWith('/api/') && !afterImageUrl.startsWith('data:')) {
                            setAfterImageUrl(`/api/virtual-try-on/proxy?url=${encodeURIComponent(afterImageUrl)}`);
                          } else {
                            setAfterImageError(true);
                          }
                        }}
                        className={`absolute inset-0 w-full h-full transition-all duration-300 ${
                          imageFitMode === 'contain' ? 'object-contain' : 'object-cover object-top'
                        } ${isAfterImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      />

                      {/* Before Image (Clipped with CSS clipPath - never stretches or breaks!) */}
                      <div
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={beforeImageUrl}
                          alt="Before"
                          className={`w-full h-full transition-all duration-300 ${
                            imageFitMode === 'contain' ? 'object-contain' : 'object-cover object-top'
                          }`}
                        />
                        <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/20">
                          BEFORE (ORIGINAL)
                        </span>
                      </div>

                      <span className="absolute top-3 right-3 bg-gradient-to-r from-cyan-600 to-blue-600 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-cyan-600/30 border border-cyan-400/30 pointer-events-none">
                        AFTER (AI FITTED)
                      </span>

                      {/* Target Body Zone Badge in Split View */}
                      <span className="absolute top-11 left-3 z-20 bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-cyan-500/30 shadow-md pointer-events-none flex items-center gap-1.5">
                        <span>🎯 {bodyZoneLabel}</span>
                      </span>

                      {/* Draggable Divider Line & Glowing Handle */}
                      <div
                        className="absolute inset-y-0 w-1 bg-gradient-to-b from-cyan-400 via-white to-indigo-500 cursor-ew-resize z-20 flex items-center justify-center -ml-0.5 shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setIsDraggingSlider(true);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setIsDraggingSlider(true);
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-950/95 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] border-2 border-cyan-400 flex items-center justify-center active:scale-110 hover:scale-105 transition">
                          <Split className="w-4 h-4 rotate-90 text-cyan-300" />
                        </div>
                      </div>
                    </div>
                  ) : viewMode === 'after' ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* Background Ambient Glow */}
                      <img
                        src={afterImageUrl}
                        alt="Background glow"
                        className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xl scale-110 pointer-events-none"
                      />
                      <img
                        src={afterImageUrl}
                        alt="Virtual Try-On Result"
                        onLoad={() => setIsAfterImageLoaded(true)}
                        onError={() => setAfterImageError(true)}
                        className={`relative z-10 w-full h-full transition-all duration-300 ${
                          imageFitMode === 'contain' ? 'object-contain' : 'object-cover object-top'
                        } ${isAfterImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      />
                      <span className="absolute top-3 right-3 z-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg">
                        AFTER (AI FITTED)
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* Background Ambient Glow */}
                      <img
                        src={beforeImageUrl}
                        alt="Background glow"
                        className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xl scale-110 pointer-events-none"
                      />
                      <img
                        src={beforeImageUrl}
                        alt="Original"
                        className={`relative z-10 w-full h-full transition-all duration-300 ${
                          imageFitMode === 'contain' ? 'object-contain' : 'object-cover object-top'
                        }`}
                      />
                      <span className="absolute top-3 left-3 z-20 bg-black/80 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow border border-white/10">
                        BEFORE (ORIGINAL)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* STATE 4: Ready to Try On (Before Image View) - No Zoom/Full Visibility */
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
                  {/* Ambient background glow to fill borders gracefully */}
                  <img
                    src={activePhotoUrl}
                    alt="Ambient background"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xl scale-110 pointer-events-none"
                  />
                  {/* Main customer photo - object-cover with object-top prevents cut-off head & removes dark sidebars */}
                  <img
                    src={activePhotoUrl}
                    alt="Customer photo"
                    className={`relative z-10 w-full h-full transition-all duration-300 ${
                      imageFitMode === 'contain' ? 'object-contain' : 'object-cover object-top'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-10" />

                  {/* Top-Left Active Model Indicator */}
                  <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="truncate max-w-[170px]">
                      {photoSourceType === 'preset'
                        ? PRESET_MODELS.find((m) => m.id === selectedPresetId)?.badge || 'Preset Model'
                        : photoSourceType === 'camera'
                        ? 'Live Camera'
                        : 'Uploaded Photo'}
                    </span>
                  </div>

                  {/* Target Anatomical Body Region Indicator */}
                  <div className="absolute top-12 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-cyan-400/40 text-[10px] font-bold text-cyan-200 shadow-md">
                    <span>{bodyRegion === 'upper_body' ? '👕' : '👖'}</span>
                    <span>{bodyZoneLabel}</span>
                  </div>

                  {/* Corner Garment Pill Preview */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white z-20 shadow-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 p-0.5 border border-white/20">
                        <img
                          src={garmentImage}
                          alt="Garment Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="text-left text-xs min-w-0">
                        <p className="font-bold truncate max-w-[160px] text-white">{activeProduct.name}</p>
                        <p className="text-cyan-300 font-semibold text-[11px] flex items-center gap-1">
                          <span>Size {selectedSize}</span>
                          <span>•</span>
                          <span className="truncate">{selectedColor}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm ${
                        bodyRegion === 'upper_body'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                          : garmentType === 'shorts'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      }`}>
                        {bodyRegion === 'upper_body' ? '👕 Upper Wear' : garmentType === 'shorts' ? '🩳 Shorts' : '👖 Jeans'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase px-2 py-0.5 rounded-lg bg-white/10 border border-white/10">
                        {activeProduct.gender === 'women' ? 'Women' : 'Men'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Fit/Fill Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));
                    }}
                    className="absolute top-3 right-3 z-30 px-2.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
                    title={imageFitMode === 'contain' ? 'Switch to Full Cover' : 'Switch to Fit Image'}
                  >
                    {imageFitMode === 'contain' ? (
                      <>
                        <Maximize2 className="w-3 h-3 text-cyan-300" />
                        <span>Fit View</span>
                      </>
                    ) : (
                      <>
                        <Minimize2 className="w-3 h-3 text-amber-300" />
                        <span>Cover View</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Controls Below Viewport: View Mode Switcher + Fit Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between w-full max-w-[360px] mt-3 gap-2">
              {afterImageUrl && (
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                      viewMode === 'split'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>
                  <button
                    onClick={() => setViewMode('after')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                      viewMode === 'after'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>After</span>
                  </button>
                  <button
                    onClick={() => setViewMode('before')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                      viewMode === 'before'
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Before</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setImageFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
                className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition shadow-sm"
              >
                {imageFitMode === 'contain' ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Fit</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fill Frame</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Controls, Garment Selection, Photo Source & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* SECTION 1: Select Garment to Try On with Category Tabs (Men/Women Jeans & Shorts) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    1. Select Garment to Try On ({selectableProducts.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingProduct(!isChangingProduct)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                  >
                    {isChangingProduct ? 'Show Less' : 'Browse All'}
                  </button>
                </div>

                {/* Primary Anatomical Category Switcher: All | Upper Wear / Tops | Lower Wear / Bottoms */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setMainCategoryFilter('all');
                      setGarmentFilter('all');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
                      mainCategoryFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>✨ All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMainCategoryFilter('upper_body');
                      setGarmentFilter('all');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
                      mainCategoryFilter === 'upper_body'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm shadow-amber-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>👕 Upper Wear</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMainCategoryFilter('lower_body');
                      setGarmentFilter('all');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
                      mainCategoryFilter === 'lower_body'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>👖 Lower Wear</span>
                  </button>
                </div>

                {/* Sub-Filter Pills dynamically based on Upper Wear vs Lower Wear */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {(mainCategoryFilter === 'upper_body'
                    ? [
                        { id: 'all', label: 'All Tops (Torso)', icon: '✨' },
                        { id: 'jackets', label: 'Denim Jackets', icon: '🧥' },
                        { id: 'shirts', label: 'Denim Shirts', icon: '👔' },
                        { id: 'men-tops', label: "Men's Tops", icon: '👨' },
                        { id: 'women-tops', label: "Women's Tops", icon: '👩' },
                      ]
                    : mainCategoryFilter === 'lower_body'
                    ? [
                        { id: 'all', label: 'All Bottoms (Waist & Legs)', icon: '✨' },
                        { id: 'men-jeans', label: "Men's Jeans", icon: '👖' },
                        { id: 'women-jeans', label: "Women's Jeans", icon: '👖' },
                        { id: 'men-shorts', label: "Men's Shorts", icon: '🩳' },
                        { id: 'women-shorts', label: "Women's Shorts", icon: '🩳' },
                      ]
                    : [
                        { id: 'all', label: 'All Styles', icon: '✨' },
                        { id: 'men-jeans', label: "Men's Jeans", icon: '👖' },
                        { id: 'women-jeans', label: "Women's Jeans", icon: '👖' },
                        { id: 'men-shorts', label: "Men's Shorts", icon: '🩳' },
                        { id: 'women-shorts', label: "Women's Shorts", icon: '🩳' },
                        { id: 'jackets', label: 'Jackets & Tops', icon: '🧥' },
                      ]
                  ).map((tab) => {
                    const isActive = garmentFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGarmentFilter(tab.id as any)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-500'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Garments Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
                  {selectableProducts.map((p) => {
                    const isSelected = activeProduct.id === p.id;
                    const price = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
                    const isTop = (p.name || '').toLowerCase().includes('jacket') || (p.category || '').toLowerCase().includes('jacket') || (p.name || '').toLowerCase().includes('shirt') || p.garmentCategory === 'tops';
                    const isShort = (p.name || '').toLowerCase().includes('shorts') || (p.category || '').toLowerCase().includes('shorts') || p.garmentType === 'shorts';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProduct(p)}
                        className={`relative p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all group ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/60 ring-2 ring-blue-500/50 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={p.thumbnail || p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {/* Tag for Upper Wear vs Shorts vs Jeans */}
                          <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider backdrop-blur-md text-white ${
                            isTop ? 'bg-amber-600/90' : isShort ? 'bg-cyan-700/90' : 'bg-black/60'
                          }`}>
                            {isTop ? '🧥 Upper Wear' : isShort ? '🩳 Shorts' : '👖 Jeans'}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/40">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="w-full text-center">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              ৳{price.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase">
                              {p.gender === 'women' ? 'Women' : 'Men'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Customer Photo Selection (Live Camera or Gallery Upload) */}
              <div>
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  2. Provide Customer Photo:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="p-3.5 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 hover:border-blue-500 text-blue-700 dark:text-blue-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Take Live Photo</span>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Selfie or Full Body</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Upload Photo</span>
                    <span className="text-[10px] text-slate-500 font-medium">Select from Device</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold">{cameraError}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>📸 Open Camera Directly</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>🖼️ Select from Gallery</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Quick Preset Model Selector with Filter Tabs (Men/Women Jeans & Shorts) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      3. Test Instantly with Preset Models:
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Full-body models for Men & Women (Jeans & Denim Shorts)
                    </p>
                  </div>
                </div>

                {/* Filter Tabs for Models: All | Upper Body | Men Jeans | Women Jeans | Men Shorts | Women Shorts */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Models', icon: '✨' },
                    { id: 'upper_body', label: 'Upper Body (Torso)', icon: '👕' },
                    { id: 'men-jeans', label: 'Men Jeans', icon: '👖' },
                    { id: 'women-jeans', label: 'Women Jeans', icon: '👖' },
                    { id: 'men-shorts', label: 'Men Shorts', icon: '🩳' },
                    { id: 'women-shorts', label: 'Women Shorts', icon: '🩳' },
                  ].map((tab) => {
                    const isActive = presetFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPresetFilter(tab.id as any)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                          isActive
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Preset Model Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {filteredPresetModels.map((model) => {
                    const isSelected = activePhotoUrl === model.url && !uploadedPhotoUrl;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelectPresetModel(model)}
                        className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 text-left transition-all ${
                          isSelected
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-[1.03] shadow-md shadow-cyan-500/25 z-10'
                            : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                        }`}
                      >
                        <img
                          src={model.url}
                          alt={model.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />

                        {/* Top Gender Pill */}
                        <div className="absolute top-1 left-1 z-10">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow ${
                            model.gender === 'men' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {model.gender === 'men' ? '👨 Men' : '👩 Women'}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-1 right-1 z-10 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Bottom Style Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-3 pb-1 px-1 text-center">
                          <p className="text-[9px] font-black text-cyan-300 truncate">
                            {model.styleCategory === 'shorts' ? '🩳 Shorts' : '👖 Jeans'}
                          </p>
                          <p className="text-[8px] text-white/90 font-bold truncate">
                            {model.nameBn || model.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Size Selection */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                    4. Select Size:
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedSize(v.size)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedSize === v.size
                          ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Photo Guidelines */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Photo Guidelines:</span>
                </div>
                <p>✓ Single person • Good lighting • Clear body & face • Natural posture</p>
                <div className="pt-1.5 mt-1 border-t border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    🎯 Target Zone: <strong className="text-blue-600 dark:text-blue-400 font-extrabold">{bodyZoneLabel}</strong>
                  </span>
                  <span className="text-slate-500 font-medium">{bodyZoneBn}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Note: AI accurately removes only the targeted clothing region without altering the rest of your outfit.
                </p>
              </div>

              {/* Generation Error Banner */}
              {generationError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold">{generationError}</p>
                    <p className="text-[11px] mt-0.5 text-red-600/80">
                      Please make sure the photo contains a clear view of a person with good lighting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Primary Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              {!afterImageUrl ? (
                /* Primary Trigger Button: RUN TRY-ON */
                <button
                  type="button"
                  onClick={runVirtualTryOn}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
                      <span>{stepDescription}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-amber-300" />
                      <span>✨ Try On {bodyRegion === 'upper_body' ? 'Upper Wear' : 'Lower Wear'} Now</span>
                    </>
                  )}
                </button>
              ) : (
                /* RESULT SCREEN ACTIONS: Add to Cart, Buy Now, Download, Share, Retry */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="bg-slate-900 hover:bg-black active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-slate-800 transition-all"
                    >
                      {addedToCartSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-cyan-400" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-current" />
                      <span>Buy Now</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={runVirtualTryOn}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                      <span>Try Again</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{copiedShareLink ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Assurance footer */}
              <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your photo is processed privately & auto-deleted within 24 hours.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
