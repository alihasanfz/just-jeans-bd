'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/store/cartContext';
import { formatPrice } from '@/lib/utils';
import {
  VirtualFittingPoseTracker,
  generatePhotorealisticClothingReplacement,
} from '@/lib/utils/tryonEngine';

interface VirtualTryOnModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
  initialColor?: string;
}

// Preset high-resolution fashion models for quick try-on testing
const PRESET_MODELS = [
  {
    id: 'male-casual',
    name: 'Male Casual',
    nameBn: 'মডেল ১ (পুরুষ)',
    gender: 'men',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'female-casual',
    name: 'Female Studio',
    nameBn: 'মডেল ২ (নারী)',
    gender: 'women',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'male-urban',
    name: 'Male Urban',
    nameBn: 'মডেল ৩ (পুরুষ)',
    gender: 'men',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'female-fashion',
    name: 'Female Chic',
    nameBn: 'মডেল ৪ (নারী)',
    gender: 'women',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
];

const LOADING_STEPS = [
  { step: 1, title: 'Analyzing Body Pose', desc: 'Detecting 33 anatomical landmarks & contours...' },
  { step: 2, title: 'Segmenting Clothing', desc: 'Masking existing apparel & generating skin buffer...' },
  { step: 3, title: 'Draping Fabric', desc: 'Synthesizing 3D textile folds, creases & texture...' },
  { step: 4, title: 'Rendering Atelier Result', desc: 'Matching ambient lighting, reflections & shadows...' },
];

export default function VirtualTryOnModal({
  product,
  isOpen,
  onClose,
  initialSize,
  initialColor,
}: VirtualTryOnModalProps) {
  const { addToCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Garment Category
  const isTops =
    /jacket|shirt|tshirt|t-shirt|tee|hoodie|polo|panjabi|top|coat|blazer|sweater/i.test(product.name || '') ||
    /jacket|shirt|tshirt|hoodie|polo|panjabi|top|coat|blazer/i.test(product.category || '') ||
    product.fit === 'Denim Jacket';

  const garmentType = isTops ? 'jacket' : 'jeans';
  const garmentCategory = isTops ? 'upper_body' : 'lower_body';
  const garmentAssetUrl = product.tryOnAssetUrl || product.thumbnail || product.images[0];

  // Selected Variant
  const defaultSize = initialSize || (product.variants[0]?.size ?? '32');
  const defaultColor = initialColor || (product.variants[0]?.color ?? 'Raw Deep Indigo');
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  // Model & Image States
  const [selectedModelUrl, setSelectedModelUrl] = useState<string>(PRESET_MODELS[0].url);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [beforeImage, setBeforeImage] = useState<string>(PRESET_MODELS[0].url);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  // Generation & Loading States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<string | null>(null);

  // Comparison State
  const [viewMode, setViewMode] = useState<'after' | 'before' | 'split'>('after');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false);

  // Sync initial variant
  useEffect(() => {
    if (initialSize) setSelectedSize(initialSize);
    if (initialColor) setSelectedColor(initialColor);
  }, [initialSize, initialColor]);

  // Clean up camera on close
  useEffect(() => {
    if (!isOpen && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeModelImage = uploadedImageUrl || selectedModelUrl;
  const effectivePrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUploadedImageUrl(dataUrl);
        setBeforeImage(dataUrl);
        setAfterImage(null);
        setViewMode('after');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Camera Capture
  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      alert('Unable to access camera: ' + (err?.message || 'Permission denied'));
      setIsCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 720;
    canvas.height = videoRef.current.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setUploadedImageUrl(dataUrl);
    setBeforeImage(dataUrl);
    setAfterImage(null);
  };

  // Image compressor for Vercel 4.5MB payload safety
  const compressImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxDim = 1024;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
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
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Trigger Main AI Try-On Generation
  const handleGenerateTryOn = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setCurrentStepIndex(0);

    // Progressive step simulation
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const optimizedModelImage = await compressImage(activeModelImage);
      setBeforeImage(optimizedModelImage);

      // Call secure Next.js API route
      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelImage: optimizedModelImage,
          garmentImage: garmentAssetUrl,
          category: garmentCategory,
          garmentType,
          description: `${product.name} in size ${selectedSize} ${selectedColor}`,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success && data.resultImageUrl) {
        setProviderUsed(data.provider || 'AI Diffusion');

        // If mock fallback was returned, run instant client neural synthesis
        if (data.isMockFallback || data.resultImageUrl === optimizedModelImage) {
          const tracker = new VirtualFittingPoseTracker();
          await tracker.init();

          const modelImg = new Image();
          modelImg.crossOrigin = 'anonymous';
          await new Promise<void>((r) => {
            modelImg.onload = () => r();
            modelImg.src = optimizedModelImage;
          });

          const garmentImg = new Image();
          garmentImg.crossOrigin = 'anonymous';
          await new Promise<void>((r) => {
            garmentImg.onload = () => r();
            garmentImg.src = garmentAssetUrl;
          });

          const pose = await tracker.sendFrame(modelImg);
          if (pose) {
            const neuralUrl = await generatePhotorealisticClothingReplacement(modelImg, garmentImg, pose, {
              garmentType,
              selectedSize,
              productName: product.name,
              price: effectivePrice,
            });
            setAfterImage(neuralUrl);
          } else {
            setAfterImage(data.resultImageUrl);
          }
        } else {
          setAfterImage(data.resultImageUrl);
        }

        setViewMode('after');
      } else {
        throw new Error(data.error || 'Failed to generate Virtual Try-On');
      }
    } catch (err: any) {
      console.error('Try-On error:', err);
      setGenerationError(err?.message || 'Network or model error occurred.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Add to Cart
  const handleAddToCart = () => {
    const variant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor) || product.variants[0];

    addToCart({
      id: `${product.id}_${selectedSize}_${selectedColor}`,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      image: product.thumbnail || product.images[0],
      price: effectivePrice,
      regularPrice: product.price,
      size: selectedSize,
      color: selectedColor,
      colorHex: variant?.colorHex || '#1e3a8a',
      quantity: 1,
      maxStock: variant?.stock || 10,
    });
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 2500);
  };

  // Download Image
  const handleDownload = () => {
    const targetUrl = afterImage || beforeImage;
    if (!targetUrl) return;
    const link = document.createElement('a');
    link.download = `jeansbd-tryon-${product.slug}-${Date.now()}.jpg`;
    link.href = targetUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>AI Virtual Try-On Studio</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold">
                  IDM-VTON SOTA
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fit <strong>{product.name}</strong> realistically with natural 3D folds & lighting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left / Center Viewport (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-950/40 relative border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-purple-500/40 shadow-2xl bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                  <button
                    onClick={handleCapturePhoto}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    onClick={() => {
                      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
                      setIsCameraActive(false);
                    }}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Image Canvas & Comparison Area */
              <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 select-none">
                {/* Generation Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                    <div className="relative w-16 h-16 mb-5">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                      {LOADING_STEPS[currentStepIndex].title}
                    </h4>
                    <p className="text-xs text-purple-300 font-medium max-w-xs mb-6">
                      {LOADING_STEPS[currentStepIndex].desc}
                    </p>

                    {/* Stepper Progress */}
                    <div className="w-full max-w-xs space-y-2">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${((currentStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Step {currentStepIndex + 1} of 4</span>
                        <span>{Math.round(((currentStepIndex + 1) / LOADING_STEPS.length) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Image Rendering (Split vs Single) */}
                {afterImage && viewMode === 'split' ? (
                  <div
                    className="relative w-full h-full cursor-ew-resize"
                    onPointerDown={() => setIsDraggingSlider(true)}
                    onPointerUp={() => setIsDraggingSlider(false)}
                    onPointerLeave={() => setIsDraggingSlider(false)}
                    onPointerMove={(e) => {
                      if (!isDraggingSlider) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      setSliderPosition((x / rect.width) * 100);
                    }}
                  >
                    {/* Before Image (Left Base) */}
                    <img
                      src={beforeImage}
                      alt="Before Try-On"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* After Image (Right Clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
                    >
                      <img
                        src={afterImage}
                        alt="After Try-On"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    {/* Slider Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl text-[10px] font-black">
                        ↔
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={afterImage && viewMode === 'after' ? afterImage : beforeImage}
                    alt="Model View"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* View Mode Controls (Top Center Floating) */}
                {afterImage && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-xl">
                    <button
                      onClick={() => setViewMode('after')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        viewMode === 'after' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Wearing Garment (After)
                    </button>
                    <button
                      onClick={() => setViewMode('before')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        viewMode === 'before' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Original (Before)
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                        viewMode === 'split' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Split className="w-3 h-3" />
                      <span>Compare Split</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error Banner */}
            {generationError && (
              <div className="mt-3 p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 max-w-md w-full">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="truncate">{generationError}</span>
              </div>
            )}
          </div>

          {/* Right Controls & Product Info (5 Cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6 bg-slate-900/70 overflow-y-auto">
            {/* 1. Product Summary Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <img
                src={product.thumbnail || product.images[0]}
                alt={product.name}
                className="w-14 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {product.fit}
                  </span>
                  <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                    {isTops ? 'Topwear' : 'Bottoms'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5">{product.name}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-black text-amber-400">৳{effectivePrice.toLocaleString()}</span>
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="text-xs text-slate-500 line-through">৳{product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Choose Model or Upload Custom */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose Model or Photo</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  <button
                    onClick={handleStartCamera}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Cam</span>
                  </button>
                </div>
              </div>

              {/* Preset Models Grid */}
              <div className="grid grid-cols-4 gap-2">
                {PRESET_MODELS.map((model) => {
                  const isSelected = !uploadedImageUrl && selectedModelUrl === model.url;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModelUrl(model.url);
                        setUploadedImageUrl(null);
                        setBeforeImage(model.url);
                        setAfterImage(null);
                      }}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition ${
                        isSelected ? 'border-purple-500 ring-2 ring-purple-500/30 scale-105 shadow-lg' : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={model.url} alt={model.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-[9px] text-white font-bold text-center truncate">
                        {model.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Size and Variant Selection */}
            <div className="space-y-3">
              <label className="text-xs font-black text-white uppercase tracking-wider block">
                Select Garment Size & Fit
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      selectedSize === size
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* Primary Try-On Action */}
              <button
                onClick={handleGenerateTryOn}
                disabled={isGenerating}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing AI Fitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{afterImage ? '✨ Re-Generate Try-On' : '✨ Try On Virtually'}</span>
                  </>
                )}
              </button>

              {/* Cart & Buy Actions */}
              {afterImage && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleAddToCart}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    {addedToCartSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
