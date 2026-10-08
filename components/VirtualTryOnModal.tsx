'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// Preset verified models for instant test/evaluation
const PRESET_MODELS = [
  {
    id: 'male-casual',
    name: 'Male Casual Pose',
    nameBn: 'মডেল ১ (পুরুষ - ক্যাজুয়াল)',
    gender: 'men',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'female-casual',
    name: 'Female Studio Pose',
    nameBn: 'মডেল ২ (নারী - স্টুডিও)',
    gender: 'women',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'male-urban',
    name: 'Male Urban Fit',
    nameBn: 'মডেল ৩ (পুরুষ - আরবান)',
    gender: 'men',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'female-fashion',
    name: 'Female Chic Fit',
    nameBn: 'মডেল ৪ (নারী - ফ্যাশন)',
    gender: 'women',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
];

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

  // Sync active product when prop changes
  useEffect(() => {
    setActiveProduct(initialProduct);
  }, [initialProduct]);

  // Selected Variant
  const defaultSize = initialSize || activeProduct.variants[0]?.size || '32';
  const defaultColor = initialColor || activeProduct.variants[0]?.color || 'Deep Indigo';
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  // Customer Photo States
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(PRESET_MODELS[0].url);
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
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>(PRESET_MODELS[0].url);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'after' | 'before'>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  // Cart action states
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Garment Category & Type Resolver
  const resolveGarmentMetadata = useCallback((prod: Product) => {
    const nameLower = (prod.name || '').toLowerCase();
    const catLower = (prod.category || '').toLowerCase();

    let garmentType: any = prod.garmentType || 'jacket';
    let category: 'tops' | 'bottoms' | 'one-pieces' = 'tops';

    if (nameLower.includes('t-shirt') || nameLower.includes('tshirt') || nameLower.includes('tee')) {
      garmentType = 'tshirt';
      category = 'tops';
    } else if (nameLower.includes('polo')) {
      garmentType = 'polo';
      category = 'tops';
    } else if (nameLower.includes('panjabi') || nameLower.includes('kurta')) {
      garmentType = 'panjabi';
      category = 'tops';
    } else if (nameLower.includes('blazer')) {
      garmentType = 'blazer';
      category = 'tops';
    } else if (nameLower.includes('hoodie')) {
      garmentType = 'hoodie';
      category = 'tops';
    } else if (nameLower.includes('shirt')) {
      garmentType = 'shirt';
      category = 'tops';
    } else if (nameLower.includes('jacket') || prod.fit === 'Denim Jacket') {
      garmentType = 'jacket';
      category = 'tops';
    } else if (nameLower.includes('dress')) {
      garmentType = 'dress';
      category = 'one-pieces';
    } else if (nameLower.includes('jeans') || nameLower.includes('pants') || catLower.includes('jeans')) {
      garmentType = 'jeans';
      category = 'bottoms';
    }

    const garmentImage = prod.tryOnAssetUrl || prod.thumbnail || prod.images[0] || '';
    return { garmentType, category, garmentImage };
  }, []);

  const { garmentType, category, garmentImage } = resolveGarmentMetadata(activeProduct);
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
      setCameraError('এই ব্রাউজারে ক্যামেরা সাপোর্টেড নয়। অনুগ্রহ করে ছবি আপলোড করুন।');
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
          ? 'ব্রাউজারে ওয়েবক্যাম পারমিশন দেওয়া নেই। নিচের বাটন দিয়ে সরাসরি ক্যামেরা অথবা গ্যালারি থেকে ছবি নিন।'
          : isDeviceBusy
          ? 'ক্যামেরাটি অন্য মেনুতে চালু রয়েছে। অনুগ্রহ করে ছবি আপলোড করুন।'
          : 'ক্যামেরা চালু করা সম্ভব হয়নি: ' + (err.message || 'অনুগ্রহ করে ছবি আপলোড করুন')
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
      alert('অনুগ্রহ করে একটি ছবির ফাইল নির্বাচন করুন (JPG, PNG, WebP বা Selfie)।');
      return;
    }

    // Validation: Size (Max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ২৫MB হতে পারবে।');
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
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
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
    setStepDescription('Preparing customer photo & apparel model...');

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
        setAfterImageUrl(submitData.resultImageUrl);
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
            setProgressPercent(statusData.progressPercent);
          }

          if (statusData.status === 'completed' && statusData.resultImageUrl) {
            setAfterImageUrl(statusData.resultImageUrl);
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
                একই ছবি দিয়ে অন্য পোশাক ট্রাই করুন (Select Product):
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
                      setActiveProduct(p);
                      setIsChangingProduct(false);
                      setAfterImageUrl(null);
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
                      <p className="text-slate-500 font-semibold">৳{p.discountPrice || p.price}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Visual Preview Viewport */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Viewport Card */}
            <div
              ref={sliderContainerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDraggingSlider(false)}
              className="relative w-full aspect-[3/4] max-h-[500px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none"
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
                      ছবি তুলুন (Capture)
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
                /* STATE 2: AI Processing with real progress & steps */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950 text-white">
                  {/* Background blurred customer photo */}
                  <img
                    src={activePhotoUrl}
                    alt="Source"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
                  />
                  <div className="relative z-10 flex flex-col items-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-4 animate-bounce">
                      <Sparkles className="w-8 h-8" />
                    </div>

                    <h4 className="text-lg font-black text-white mb-1">
                      পোশাকটি আপনার শরীরে ফিট করা হচ্ছে...
                    </h4>
                    <p className="text-xs text-blue-200/90 font-medium mb-5 min-h-[32px] transition-all">
                      {stepDescription}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{progressPercent}% Completed</span>

                    <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Face & identity preserved naturally</span>
                    </div>
                  </div>
                </div>
              ) : afterImageUrl ? (
                /* STATE 3: Try-On Completed Result with Split Comparison */
                <div className="relative w-full h-full">
                  {viewMode === 'split' ? (
                    <div className="relative w-full h-full overflow-hidden">
                      {/* After Image (Background) */}
                      <img
                        src={afterImageUrl}
                        alt="After Virtual Try-On"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Before Image (Clipped overlay) */}
                      <div
                        className="absolute inset-y-0 left-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={beforeImageUrl}
                          alt="Before"
                          className="absolute inset-0 w-full h-full object-cover max-w-none"
                          style={{
                            width: sliderContainerRef.current?.clientWidth || '100%',
                            height: '100%',
                          }}
                        />
                        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                          BEFORE
                        </span>
                      </div>

                      <span className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                        AFTER (VTON)
                      </span>

                      {/* Draggable Divider Line */}
                      <div
                        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-2xl"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={() => setIsDraggingSlider(true)}
                        onTouchStart={() => setIsDraggingSlider(true)}
                      >
                        <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-blue-600">
                          <Split className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>
                  ) : viewMode === 'after' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={afterImageUrl}
                        alt="Virtual Try-On Result"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                        AFTER (AI FITTED)
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={beforeImageUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                        BEFORE (ORIGINAL)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* STATE 4: Ready to Try On (Before Image View) */
                <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                  <img
                    src={activePhotoUrl}
                    alt="Customer photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Corner Garment Pill Preview */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={garmentImage}
                        alt="Garment Preview"
                        className="w-10 h-10 rounded-lg object-cover bg-white"
                      />
                      <div className="text-left text-xs">
                        <p className="font-bold truncate max-w-[160px]">{activeProduct.name}</p>
                        <p className="text-amber-300 font-semibold text-[11px]">
                          {selectedSize} • {selectedColor}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase px-2 py-1 rounded bg-white/10">
                      {garmentType}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Switcher (When Result is available) */}
            {afterImageUrl && (
              <div className="flex items-center gap-1.5 mt-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('split')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Split Slider</span>
                </button>
                <button
                  onClick={() => setViewMode('after')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    viewMode === 'after'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>After</span>
                </button>
                <button
                  onClick={() => setViewMode('before')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    viewMode === 'before'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Before</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Controls, Upload/Camera, Options & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Top Section: Photo Selection / Upload Tabs */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  ১. আপনার ছবি দিন (Customer Photo):
                </span>

                {/* Option 1: Live Camera + Option 2: Upload Photo */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span>📷 ক্যামেরা দিয়ে তুলুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Upload className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span>🖼️ গ্যালারি থেকে আপলোড</span>
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
                          <span>📸 সরাসরি ক্যামেরা খুলুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>🖼️ গ্যালারি থেকে ছবি নিন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Model Selector for Instant Testing */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  অথবা দ্রুত টেস্ট করতে ডেমো মডেল বেছে নিন:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        stopCamera();
                        setActivePhotoUrl(model.url);
                        setBeforeImageUrl(model.url);
                        setAfterImageUrl(null);
                        setPhotoSourceType('preset');
                      }}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition ${
                        activePhotoUrl === model.url && !uploadedPhotoUrl
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                          : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={model.url} alt={model.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5 truncate px-0.5">
                        {model.name.split(' ')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Variant Selection (Size & Color) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                    সাইজ নির্বাচন করুন:
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

              {/* Photo Guidelines Checklist */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ফটোর শর্তাবলী (Photo Guidelines):</span>
                </div>
                <p>✓ এক ব্যক্তি • পর্যাপ্ত আলো • স্পষ্ট শরীর ও মুখমণ্ডল • স্বাভাবিক পোজ</p>
                <p className="text-[10px] text-slate-400">
                  Note: AI আপনার পুরনো পোশাকটিকে বাদ দিয়ে নিখুঁতভাবে এই পোশাকটি শরীরে বসাবে।
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
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {!afterImageUrl ? (
                /* Primary Trigger Button: RUN TRY-ON */
                <button
                  type="button"
                  onClick={runVirtualTryOn}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.98] text-white py-3.5 px-5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{stepDescription}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>পোশাকটি পরে দেখুন (Fit Garment Now)</span>
                    </>
                  )}
                </button>
              ) : (
                /* RESULT SCREEN ACTIONS: Add to Cart, Buy Now, Download, Share, Retry */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="bg-[#1e293b] hover:bg-slate-900 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      {addedToCartSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-blue-400" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all"
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
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
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
